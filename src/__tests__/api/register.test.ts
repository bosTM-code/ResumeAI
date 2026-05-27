import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockFindUnique, mockUserCreate } = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockUserCreate: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: mockFindUnique,
      create: mockUserCreate,
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password_value"),
  },
}));

import { POST } from "@/app/api/auth/register/route";

function buildRequest(body: unknown) {
  return { json: vi.fn().mockResolvedValue(body) } as unknown as Request;
}

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("successful registration", () => {
    it("returns 201 and success flag for valid input", async () => {
      mockFindUnique.mockResolvedValue(null);
      mockUserCreate.mockResolvedValue({ id: "user-1", email: "test@example.com" });

      const res = await POST(buildRequest({ name: "Test User", email: "test@example.com", password: "password123" }));
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.success).toBe(true);
    });

    it("hashes the password before storing it", async () => {
      mockFindUnique.mockResolvedValue(null);
      mockUserCreate.mockResolvedValue({ id: "user-1" });

      await POST(buildRequest({ name: "Test User", email: "test@example.com", password: "password123" }));

      expect(mockUserCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({ password: "hashed_password_value" }),
      });
    });

    it("stores name and email exactly as provided", async () => {
      mockFindUnique.mockResolvedValue(null);
      mockUserCreate.mockResolvedValue({ id: "user-1" });

      await POST(buildRequest({ name: "Jane Doe", email: "jane@example.com", password: "securepass" }));

      expect(mockUserCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({ name: "Jane Doe", email: "jane@example.com" }),
      });
    });
  });

  describe("duplicate email", () => {
    it("returns 409 when the email is already registered", async () => {
      mockFindUnique.mockResolvedValue({ id: "existing", email: "dup@example.com" });

      const res = await POST(buildRequest({ name: "User", email: "dup@example.com", password: "password123" }));
      const body = await res.json();

      expect(res.status).toBe(409);
      expect(body.error).toBe("Email вже використовується");
    });

    it("does not call prisma.user.create when email already exists", async () => {
      mockFindUnique.mockResolvedValue({ id: "existing" });

      await POST(buildRequest({ name: "User", email: "dup@example.com", password: "password123" }));

      expect(mockUserCreate).not.toHaveBeenCalled();
    });
  });

  describe("input validation", () => {
    it("returns 400 for an invalid email address", async () => {
      const res = await POST(buildRequest({ name: "User", email: "not-an-email", password: "password123" }));
      expect(res.status).toBe(400);
    });

    it("returns 400 when password is shorter than 6 characters", async () => {
      const res = await POST(buildRequest({ name: "User", email: "valid@example.com", password: "12345" }));
      expect(res.status).toBe(400);
    });

    it("returns 400 when name is shorter than 2 characters", async () => {
      const res = await POST(buildRequest({ name: "A", email: "valid@example.com", password: "password123" }));
      expect(res.status).toBe(400);
    });

    it("returns 400 when required fields are missing", async () => {
      const res = await POST(buildRequest({}));
      expect(res.status).toBe(400);
    });

    it("returns 400 when the request body cannot be parsed", async () => {
      const badReq = { json: vi.fn().mockRejectedValue(new Error("Parse error")) } as unknown as Request;
      const res = await POST(badReq);
      expect(res.status).toBe(400);
    });
  });
});
