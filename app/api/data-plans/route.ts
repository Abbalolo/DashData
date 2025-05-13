// app/api/networks/route.ts
import { NextResponse } from "next/server";
// https://smedata.ng/wp-json/api/v1/data
export async function GET() {
  try {
    const res = await fetch("https://smeplug.ng/api/v1/data/plans", {
      headers: {
        Authorization: `Bearer ${process.env.SMEPLUG_SECRET_KEY}`,
        "Content-Type": "application/json",
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
