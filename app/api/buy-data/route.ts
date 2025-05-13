import { db } from '@/app/firebase/firebase';
import { getDoc, updateDoc, doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { phone, network, plan, userId } = req.body;

  const apiCost = 950; // Later you can fetch dynamic pricing
  const profit = apiCost * 0.05; // 5% profit
  const totalCost = apiCost + profit;

  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return res.status(404).json({ error: 'User not found' });
  }

  const user = userSnap.data();
  const wallet = user.walletBalance || 0;

  if (wallet < totalCost) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }

  try {
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

      return res.status(200).json({ message: 'Data purchase successful' });
    } else {
      return res.status(500).json({ error: smeResponse.data.message || 'Failed to buy data' });
    }
  } catch (err: any) {
    console.error('SMEPlug error:', err.message);
    return res.status(500).json({ error: 'Something went wrong while contacting SMEPlug' });
  }
}
