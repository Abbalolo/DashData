import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, userId, fullName, mobilenumber } = body;

    if (!email || !userId || !fullName || !mobilenumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const country = "NG";
    const accountName = fullName.trim();

    const data = {
      account_name: accountName,
      email,
      mobilenumber,
      country,
    };

    console.log("Sending to Flutterwave:", data); // log the request

    const response = await axios.post(
      "https://api.flutterwave.com/v3/payout-subaccounts",
      data,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    console.log("Flutterwave response:", response.data); // log the response

    if (response.data.status === "success") {
      return NextResponse.json(response.data.data);
    } else {
      return NextResponse.json({ error: response.data.message }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Error from Flutterwave:", error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.message || "Server error" },
      { status: 500 }
    );
  }
}
