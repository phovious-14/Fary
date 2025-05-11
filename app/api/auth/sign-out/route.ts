import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Clear the auth cookie
  response.cookies.set({
    name: "auth_token",
    value: "",
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 0, // Expire immediately
    path: "/",
  });

  return response;
}
