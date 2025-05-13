// app/api/flutterwave-webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/firebase/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const secretHash = process.env.FLW_SECRET_HASH;
  const rawBody = await req.text();
  const signature = req.headers.get('verif-hash');

  if (!signature || signature !== secretHash) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === 'charge.completed') {
    const amount = event.data.amount;
    const email = event.data.customer.email;

    try {
      const userRef = doc(db, 'users', email);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const wallet = userSnap.data().walletBalance || 0;
        await updateDoc(userRef, {
          walletBalance: wallet + amount,
        });
      }
    } catch (error) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ status: 'OK' }, { status: 200 });
}
