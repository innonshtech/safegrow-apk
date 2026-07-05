import { NextResponse } from "next/server";
import { LoginRequestSchema, AuthResponse } from "@safegrow/shared";
import { prisma } from "@safegrow/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-dev";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = LoginRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }

    const { userId, password } = result.data;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { userId: userId },
          { email: userId }
        ]
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json({ error: "Account is inactive" }, { status: 403 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.role === "ADMIN") {
      return NextResponse.json({ error: "Admins cannot login via the mobile app." }, { status: 403 });
    }

    const payload = {
      id: user.id,
      userId: user.userId,
      name: user.name,
      role: user.role
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
        role: user.role
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
