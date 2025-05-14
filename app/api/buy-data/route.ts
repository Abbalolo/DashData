import { db } from '@/app/firebase/firebase';
import { getDoc, updateDoc, doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, network, plan, userId } = body;

    const apiCost = 950; // Later you can fetch dynamic pricing
    const profit = apiCost * 0.05; // 5% profit
    const totalCost = apiCost + profit;

    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    const user = userSnap.data();
    const wallet = user.walletBalance || 0;

    if (wallet < totalCost) {
      return new Response(JSON.stringify({ error: 'Insufficient balance' }), { status: 400 });
    }

    // Call SMEPlug API
    const smeResponse = await axios.post(
      'https://smeplug.ng/api/data',
      { phone, network, plan },
      {
        headers: {
          Authorization: `Bearer ${process.env.SMEPLUG_API_KEY}`,
        },
      }
    );

    if (smeResponse.data.success) {
      // Deduct from wallet
      await updateDoc(userRef, {
        walletBalance: wallet - totalCost,
      });

      // Record transaction
      const transactionsRef = collection(db, 'users', userId, 'transactions');
      await addDoc(transactionsRef, {
        phone,
        network,
        plan,
        apiCost,
        profit,
        totalCost,
        status: 'successful',
        type: 'data purchase',
        timestamp: serverTimestamp(),
      });

      return new Response(JSON.stringify({ message: 'Data purchase successful' }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ error: smeResponse.data.message || 'Failed to buy data' }), { status: 500 });
    }
  } catch (err: any) {
    console.error('SMEPlug error:', err.message);
    return new Response(JSON.stringify({ error: 'Something went wrong while contacting SMEPlug' }), { status: 500 });
  }
}
