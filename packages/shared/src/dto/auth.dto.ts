import { z } from "zod";

export const LoginRequestSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string(),
    userId: z.string(),
    name: z.string(),
    role: z.enum(["ADMIN", "MANAGER", "REP"]),
    employeeId: z.string().optional().nullable(),
    territory: z.string().optional().nullable(),
    managerName: z.string().optional().nullable(),
  }),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;
