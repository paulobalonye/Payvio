// Environment configuration
// In production, these should come from app.config.ts extra or EAS secrets.
// Using process.env.EXPO_PUBLIC_* with Expo SDK 49+.

export const config = {
  STRIPE_PUBLISHABLE_KEY:
    process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ??
    "pk_test_51T1GESJ6Hy0kXTetc16ca2PvuIRVHHy69dlA9UQN5ky9Op8lKO43Y0KrhmP7YXFDviUIq7fqwM1lqTPpf5H9l14M008YB9GE0I",

  API_BASE_URL:
    process.env.EXPO_PUBLIC_API_URL ?? "https://payvio-server.onrender.com",
} as const;
