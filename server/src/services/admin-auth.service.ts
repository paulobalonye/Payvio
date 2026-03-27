import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import * as OTPAuth from "otpauth";
import { prisma } from "../config/database";
import { env } from "../config/env";
import { AppError } from "../middleware/error-handler";

const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MINUTES = 30;
const ADMIN_JWT_TTL = "8h";
const BCRYPT_ROUNDS = 12;

type LoginResult = {
  readonly token?: string;
  readonly requires_mfa: boolean;
  readonly admin?: { id: string; email: string; role: string };
};

type MfaSetupResult = {
  readonly secret: string;
  readonly qr_url: string;
  readonly backup_codes: string[];
};

export class AdminAuthService {
  async login(
    email: string,
    password: string,
    totpCode: string | undefined,
    ipAddress: string
  ): Promise<LoginResult> {
    const admin = await prisma.adminUser.findUnique({ where: { email } });

    if (!admin) {
      throw new AppError(401, "Invalid credentials");
    }

    if (!admin.isActive) {
      throw new AppError(403, "Account deactivated");
    }

    // Check lockout
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      throw new AppError(423, "Account locked. Try again later.");
    }

    // Verify password
    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      const failedLogins = admin.failedLogins + 1;
      const lockData: any = { failedLogins };
      if (failedLogins >= MAX_FAILED_LOGINS) {
        lockData.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      }
      await prisma.adminUser.update({ where: { id: admin.id }, data: lockData });
      throw new AppError(401, "Invalid credentials");
    }

    // Check MFA
    if (admin.mfaEnabled && admin.mfaSecret) {
      if (!totpCode) {
        return { requires_mfa: true };
      }

      const totp = new OTPAuth.TOTP({
        secret: OTPAuth.Secret.fromBase32(admin.mfaSecret),
        algorithm: "SHA1",
        digits: 6,
        period: 30,
      });

      const isValidTotp = totp.validate({ token: totpCode, window: 1 }) !== null;

      if (!isValidTotp) {
        // Check backup codes
        const isBackupCode = admin.backupCodes.includes(totpCode);
        if (!isBackupCode) {
          throw new AppError(401, "Invalid MFA code");
        }
        // Remove used backup code
        await prisma.adminUser.update({
          where: { id: admin.id },
          data: { backupCodes: admin.backupCodes.filter((c: string) => c !== totpCode) },
        });
      }
    }

    // Success — reset failed logins, update last login
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { failedLogins: 0, lockedUntil: null, lastLogin: new Date() },
    });

    // Audit log
    await prisma.adminAuditLog.create({
      data: {
        adminId: admin.id,
        action: "LOGIN",
        entity: "admin_user",
        entityId: admin.id,
        ipAddress,
      },
    });

    const token = jwt.sign(
      { sub: admin.id, email: admin.email, role: admin.role, type: "admin" },
      env.JWT_SECRET,
      { expiresIn: ADMIN_JWT_TTL }
    );

    return {
      token,
      requires_mfa: false,
      admin: { id: admin.id, email: admin.email, role: admin.role },
    };
  }

  async setupMfa(adminId: string): Promise<MfaSetupResult> {
    const admin = await prisma.adminUser.findUnique({ where: { id: adminId } });
    if (!admin) throw new AppError(404, "Admin not found");

    const secret = new OTPAuth.Secret({ size: 20 });
    const totp = new OTPAuth.TOTP({
      issuer: "Payvio Admin",
      label: admin.email,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret,
    });

    const backupCodes = Array.from({ length: 8 }, () =>
      crypto.randomBytes(4).toString("hex").toUpperCase()
    );

    await prisma.adminUser.update({
      where: { id: adminId },
      data: {
        mfaSecret: secret.base32,
        mfaEnabled: true,
        backupCodes,
      },
    });

    return {
      secret: secret.base32,
      qr_url: totp.toString(),
      backup_codes: backupCodes,
    };
  }

  async createAdmin(
    email: string,
    password: string,
    role: string,
    creatorId: string,
    ipAddress: string
  ): Promise<{ id: string; email: string; role: string }> {
    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) throw new AppError(409, "Admin with this email already exists");

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const admin = await prisma.adminUser.create({
      data: { email, passwordHash, role: role as any },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminId: creatorId,
        action: "CREATE_ADMIN",
        entity: "admin_user",
        entityId: admin.id,
        details: `Created admin ${email} with role ${role}`,
        ipAddress,
      },
    });

    return { id: admin.id, email: admin.email, role: admin.role };
  }

  verifyAdminToken(token: string): { sub: string; email: string; role: string } {
    const payload = jwt.verify(token, env.JWT_SECRET) as any;
    if (payload.type !== "admin") throw new AppError(401, "Not an admin token");
    return { sub: payload.sub, email: payload.email, role: payload.role };
  }
}
