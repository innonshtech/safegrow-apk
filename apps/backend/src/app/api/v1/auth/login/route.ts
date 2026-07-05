import { NextResponse } from "next/server";
import { LoginRequestSchema, AuthResponse } from "@safegrow/shared";
import { prisma } from "@safegrow/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { withErrorHandler } from "../../../../../lib/apiHandler";
import { UnauthorizedError, ForbiddenError } from "../../../../../lib/errors";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-dev";

export const POST = withErrorHandler(async (request: Request) => {
  const body = await request.json();
  const result = LoginRequestSchema.parse(body); // Zod will throw if invalid

  const { userId, password } = result;
    console.log("Parsed userId:", userId, "password:", password);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { userId: userId },
          { email: userId }
        ]
      },
      include: {
        manager: true
      }
    });

  if (!user) {
    throw new UnauthorizedError("Invalid credentials");
  }

  if (user.status !== "ACTIVE") {
    throw new ForbiddenError("Account is inactive");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  
  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid credentials");
  }

  if (user.role === "ADMIN") {
    throw new ForbiddenError("Admins cannot login via the mobile app.");
  }

    const payload = {
      id: user.id,
      userId: user.userId,
      name: user.name,
      role: user.role,
      employeeId: user.employeeId,
      territory: user.territory,
      managerName: user.manager?.name,
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

    const response: AuthResponse = {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        userId: user.userId,
        name: user.name,
        role: user.role,
        employeeId: user.employeeId,
        territory: user.territory,
        managerName: user.manager?.name,
      }
    };

  return NextResponse.json(response);
});
