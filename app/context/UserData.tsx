"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

// Define the structure of user data from Firestore
interface FirestoreUserData {
  uid: string;
  email: string;
  fullName: string;
  walletBalance: number;
  balancevisibility: string;
  darkMode: boolean;
  phone: string;
  createdAt: any; // Use Firestore Timestamp if needed
}

interface WalletContextType {
  loading: boolean;
  userId: string | null;
  user: User | null;
  userData: FirestoreUserData | null;
}

const WalletContext = createContext<WalletContextType>({
  loading: true,
  userId: null,
  user: null,
  userData: null,
});

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [userData, setUserData] = useState<FirestoreUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUserId(firebaseUser.uid);
        setUser(firebaseUser);

        const data = await getUserDataByUID(firebaseUser.uid);
        setUserData(data);
      } else {
        setUserId(null);
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getUserDataByUID = async (uid: string) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        return userDocSnap.data() as FirestoreUserData;
      } else {
        console.log("No user data found");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  return (
    <WalletContext.Provider value={{ loading, userId, user, userData }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
