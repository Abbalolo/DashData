"use client";

import { HiUserCircle } from "react-icons/hi";
import { IoIosArrowBack } from "react-icons/io";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import image1 from "../../public/download.png";
import image2 from "../../public/download (1).png";
import image3 from "../../public/download (2).png";
import image4 from "../../public/download (3).png";
import Loader from "../components/Loader";
import NetworkError from "../components/NetworkError";

interface Network {
  id: any;
  name: string;
}

const netWorksImages = [image1, image2, image3, image4];

function Page() {
  const [networks, setNetworks] = useState<any[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string | undefined>();
  const [topupType, setTopupType] = useState<string | undefined>();
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  const router = useRouter();

  // Fetch networks
  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const res = await fetch("/api/networks");
        const data = await res.json();
  
        const networkObj = data.networks;
  
        const networkArray = Object.entries(networkObj).map(([id, name]) => ({
          id,
          name,
        }));
  
        setNetworks(networkArray);
        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch networks", error);
        setHasError(true);
        setLoading(false)
      }
    };
  
    fetchNetworks();
  }, []);
  
  

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setResponseMessage(null);

    try {
      const res = await fetch("/api/buy-airtel-sell", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          network_id: selectedNetwork,
          phoneNumber,
          amount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setResponseMessage(`Success: ${JSON.stringify(data)}`);
    } catch (error: any) {
      setResponseMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (hasError) return <NetworkError />;

  return (
    <>
      <header className="text-gray-200 bg-[#553555] flex items-center gap-5 p-5">
        <IoIosArrowBack onClick={() => router.back()} className="cursor-pointer" />
        <h1>Airtime Topup</h1>
      </header>

      <h1 className="p-5 text-center font-bold">DashData Airtime</h1>

      <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
        {/* Network Selection */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="network-type">Network</Label>
          <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a network" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectGroup>
                {networks?.map((network, idx) => (
                  <SelectItem className="hover:bg-gray-200" key={network.id} value={network.id}>
                    <div className="flex items-center gap-2 ">
                      <Image
                        src={netWorksImages[idx] || image1}
                        alt={network.name}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                      <span>{network.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Phone Number Input */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="network-phone">Phone Number</Label>
          <div className="flex w-full items-center space-x-2">
            <Input
              type="tel"
              name="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
              className="w-full"
              required
            />
            <HiUserCircle className="text-[#553555] text-2xl cursor-pointer" />
          </div>
        </div>

        {/* Type Selection */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="bundle-type">Type</Label>
          <Select value={topupType} onValueChange={setTopupType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectGroup>
                <SelectItem className="hover:bg-gray-200"  value="VTU">VTU</SelectItem>
                <SelectItem className="hover:bg-gray-200"  value="Share & Sell">Share & Sell</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Amount Input */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="network-amount">Amount</Label>
          <Input
            type="text"
            name="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter Amount"
            className="w-full"
            required
          />
        </div>

        {/* Buy Now Button */}
        <Button
          className="bg-[#553555] text-gray-200"
          type="submit"
          disabled={!selectedNetwork || !phoneNumber || !amount || !topupType}
        >
          Buy now
        </Button>

        {responseMessage && (
          <p className="text-sm mt-2 text-center">{responseMessage}</p>
        )}
      </form>
    </>
  );
}

export default Page;
