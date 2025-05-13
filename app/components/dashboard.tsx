"use client";
import axios from "axios";

import { GoEyeClosed } from "react-icons/go";
import { AiOutlineEye } from "react-icons/ai";

import { FiTv } from "react-icons/fi";
import { ImSwitch } from "react-icons/im";
import { CgPhone } from "react-icons/cg";
import { BsPhoneFill } from "react-icons/bs";
import { RxSpeakerLoud } from "react-icons/rx";
import { SlWallet } from "react-icons/sl";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import Link from "next/link";
import { useWallet } from "../context/UserData";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FundWalletPopUp } from "./FundWalletPopUp";
import { updateProfile } from "firebase/auth";

function Dashboard() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { userData } = useWallet();
  const [toggle, setToggle] = useState(userData?.balancevisibility === "hide");
  const router = useRouter();

  const items = [
    {
      name: "Airtime TopUp",
      link: "/airtime-topup",
      icon: <CgPhone />,
    },
    {
      name: "Data Bundle",
      link: "/buy-data-bundle",
      icon: <BsPhoneFill />,
    },
    {
      name: "Electricity",
      link: "#",
      icon: <ImSwitch />,
    },
    {
      name: "TV",
      link: "#",
      icon: <FiTv />,
    },
  ];

  const handleBalanceVisibility = async () => {
    if (!userData?.uid) return;
  
    const newToggle = !toggle;
    setToggle(newToggle);
  
    const newVisibility = newToggle ? "hide" : "show";
  
    try {
      const userRef = doc(db, "users", userData.uid);
      await updateDoc(userRef, {
        balancevisibility: newVisibility, // make sure this matches Firestore field name
      });
    } catch (error) {
      console.error("Failed to update visibility:", error);
      setToggle(!newToggle); // revert toggle if failed
    }
  };
  

  const handleSendData = async () => {
    if (!phone || !amount) return alert("Please fill all fields");
    setLoading(true);
    try {
      await addDoc(collection(db, "smeRequests"), {
        phone,
        amount: parseInt(amount),
        status: "pending",
        createdAt: Timestamp.now(),
      });
      setMessage("Request added successfully. Bot will process it.");
      setPhone("");
      setAmount("");
    } catch (error) {
      console.error("Error:", error);
      setMessage("Failed to add request.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "smeRequests", id));
      setMessage("Request deleted.");
    } catch (error) {
      console.error("Delete error:", error);
      setMessage("Failed to delete request.");
    }
  };

  if (!userData) {
    return (
      <section className="flex justify-center items-center min-h-[50vh]">
        <div className="text-red-600 text-lg font-medium">
          Server Error: Unable to load user data.
        </div>
      </section>
    );
  }

  return (
    <section>
     <FundWalletPopUp isOpen={dialogOpen} setIsOpen={setDialogOpen} />
     
        <>
          <div className="mb-6 text-white rounded-xl bg-[#553555] shadow-md p-5 flex flex-col gap-4 items-start">
            <div className="flex justify-between items-center w-full">
              <span>Wallet Balance</span>
              <p>{userData?.fullName}</p>
            </div>
            <div className="flex items-center gap-5 text-3xl">
              <SlWallet />
              <div className="flex items-center">
  {!toggle ? (
    <span>
      ₦
      {userData?.walletBalance?.toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) ?? "0.00"}
    </span>
  ) : (
    <>****</>
  )}

  <button
    className="ml-3 text-[16px] cursor-pointer"
    onClick={handleBalanceVisibility}
    aria-label="Toggle wallet balance visibility"
  >
    {!toggle ? <GoEyeClosed /> : <AiOutlineEye />}
  </button>
</div>


            </div>

            <div className="flex items-center gap-2">
              <RxSpeakerLoud />
              <span>Welcome to DashData!</span>
            </div>

            <div className="flex gap-2 w-full">
              <Button className="border-white border-2 hover:text-white px-4 py-5 rounded-xl bg-gray-200 text-[#553555] hover:bg-[#553555] transition-all duration-300 ease-in-out cursor-pointer text-center"
              onClick={() => setDialogOpen(true)}
              >
                Fund wallet
              </Button>

              <Button
                onClick={() => router.push("/transaction")}
                className="border-white border-2 text-white px-4 py-5 rounded-xl hover:bg-gray-200 hover:text-[#553555] transition-all duration-300 ease-in-out cursor-pointer  text-center" 
              >
                Transactions
              </Button>
            </div>

            {message && <p className="mt-4 text-green-600">{message}</p>}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((item, index) => (
              <Link
                href={item.link}
                key={index}
                className="bg-white p-4 rounded-xl shadow text-[#553555] flex flex-col items-center gap-2 hover:bg-gray-100"
              >
                <div className="text-2xl">{item.icon}</div>
                <p className="text-sm font-medium">{item.name}</p>
              </Link>
            ))}
          </div>
        </>
    
    </section>
  );
}

export default Dashboard;
