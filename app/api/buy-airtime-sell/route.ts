
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch("https://smeplug.ng/api/v1/airtime/purchase", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SMEPLUG_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        network_id: body.network_id,
        phone: body.phone,
        amount: body.amount,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: errorText }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
