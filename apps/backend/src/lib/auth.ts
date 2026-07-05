import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-dev";

export interface DecodedToken {
  id: string;
  userId: string;
  name: string;
  role: string;
  employeeId?: string;
}

export function verifyAuth(request: Request | NextRequest): DecodedToken | null {
  const authHeader = request.headers.get("authorization");
  console.log("verifyAuth -> authHeader:", authHeader);
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("verifyAuth -> authHeader missing or invalid format");
    return null;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    return decoded;
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return null;
  }
}
