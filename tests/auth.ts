import { test as base } from "vitest";
import type { NextRequest } from "next/server";

// Mock NextAuth for testing
const mockSession = {
  user: {
    id: "test-user-id",
    email: "test@example.com",
    name: "Test User",
    role: "MERCHANT",
  },
};

export const test = base.extend({
  // Mock auth for authenticated requests
  authRequest: async () => mockSession,
});

export { mockSession };