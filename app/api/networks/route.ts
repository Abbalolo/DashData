// app/api/networks/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://smeplug.ng/api/v1/networks", {
      headers: {
        Authorization:
          "Bearer 0972db1a46cfb65b13851483c3d8ea541a2ea31f2fa0c879c124e45c9db09583",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ error: errorText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
