"use client";

import { useState, useEffect } from "react";
import { db, auth } from "../app/firebase/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

import Header from "./components/header";
import Dashboard from "./components/dashboard";
import Loader from "./components/Loader";

export default function SendDataPage() {
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const router = useRouter();
  

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setCheckingAuth(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!checkingAuth && !user) {
      router.push("/auth");
    }
  }, [checkingAuth, user, router]);

  useEffect(() => {
    const q = query(collection(db, "smeRequests"), orderBy("createdAt", "desc"));
    const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRequests(data);
    });

    return () => unsubscribeSnapshot();
  }, []);

  


  if (checkingAuth) {
    return <Loader/>;
  }

  if (!user) {
    router.push("/auth")
  }
  

  return (
    <>
   <Header/>
    <div className="max-w-2xl mx-auto p-4">
      <Dashboard/>
    </div>
    </>
  );
}
