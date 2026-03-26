import { updateProfileSchema } from "../../validators/user.validator";

describe("User Validators", () => {
  describe("updateProfileSchema", () => {
    it("should accept valid profile data", () => {
      const result = updateProfileSchema.safeParse({
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty first name", () => {
      const result = updateProfileSchema.safeParse({
        first_name: "",
        last_name: "Doe",
        email: "john@example.com",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid email format", () => {
      const result = updateProfileSchema.safeParse({
        first_name: "John",
        last_name: "Doe",
        email: "not-an-email",
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing email", () => {
      const result = updateProfileSchema.safeParse({
        first_name: "John",
        last_name: "Doe",
      });
      expect(result.success).toBe(false);
    });

    it("should trim whitespace from names", () => {
      const result = updateProfileSchema.safeParse({
        first_name: "  John  ",
        last_name: "  Doe  ",
        email: "john@example.com",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.first_name).toBe("John");
        expect(result.data.last_name).toBe("Doe");
      }
    });

    it("should reject first name longer than 100 characters", () => {
      const result = updateProfileSchema.safeParse({
        first_name: "a".repeat(101),
        last_name: "Doe",
        email: "john@example.com",
      });
      expect(result.success).toBe(false);
    });
  });
});
