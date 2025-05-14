"use client";

import { HiUserCircle } from "react-icons/hi";
import { IoIosArrowBack } from "react-icons/io";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  id: string;
  name: string;
}

interface Plan {
  code: string;
  name: string;
  amount: number;
  displayPrice: number;
  [key: string]: any;
}

interface PlansByNetwork {
  networkId: string;
  networkName: string;
  plans: Plan[];
}

const netWorksImages = [image1, image2, image3, image4];

function Page() {
  const [networks, setNetworks] = useState<Network[]>([]);
  const [plans, setPlans] = useState<PlansByNetwork[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string | undefined>();
  const [selectedBundleCode, setSelectedBundleCode] = useState<
    string | undefined
  >();
  const [selectedBundlePrice, setSelectedBundlePrice] = useState<
    number | undefined
  >();
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const router = useRouter();
  const [tab, setTab] = useState<"daily-plan" | "weekly-plan" | "monthly-plan">(
    "daily-plan"
  );
 const containerRef = useRef<HTMLDivElement>(null);
  
  const selectBundle = (plan: Plan, index: number) => {

    setSelectedBundleCode(plan.name);
    setSelectedBundlePrice(plan.price);
    setActiveIndex(index);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [netRes, planRes] = await Promise.all([
          fetch("/api/networks"),
          fetch("/api/data-plans"),
        ]);

        const networksData = await netRes.json();
        const plansData = await planRes.json();

        if (netRes.ok && typeof networksData.networks === "object") {
          const networksArray = Object.entries(networksData.networks).map(
            ([id, name]) => ({
              id: String(id),
              name: name as string,
            })
          );
          setNetworks(networksArray);
        } else {
          console.error("Invalid networks response:", networksData);
          setHasError(true);
        }

        if (planRes.ok && typeof plansData.data === "object") {
          const markupAmount = 0;
          const networkNames: Record<string, string> = {
            "1": "MTN",
            "2": "Airtel",
            "3": "Etisalat",
            "4": "Glo",
          };

          const plansArray: PlansByNetwork[] = Object.entries(
            plansData.data
          ).map(([networkId, rawPlans]) => {
            const enhancedPlans = (rawPlans as Plan[]).map((plan) => ({
              ...plan,
              displayPrice: plan.amount + markupAmount,
            }));

            return {
              networkId: String(networkId),
              networkName:
                networkNames[networkId] || `Unknown Network (${networkId})`,
              plans: enhancedPlans,
            };
          });

          setPlans(plansArray);
        } else {
          console.error("Invalid plans response:", plansData);
          setHasError(true);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setHasError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


   useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setSelectedBundleCode("");
        setSelectedBundlePrice(0);
        setActiveIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedNetworkPlans = plans.find(
    (plan) => plan.networkId === selectedNetwork
  );

  if (loading) return <Loader />;
  if (hasError) return <NetworkError />;

  return (
    <>
      <header className="text-gray-200 bg-[#553555] flex items-center gap-5 p-5">
        <IoIosArrowBack
          onClick={() => router.back()}
          className="cursor-pointer"
        />
        <h1>Buy Data Bundle</h1>
      </header>

      <h1 className="p-5 text-center font-bold">DashData Bundles</h1>

      <div className="p-5 flex flex-col gap-5">
        {/* Network Selection */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="network-type">Select Network</Label>

          <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a network" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectGroup>
                {networks.map((network, idx) => (
                  <SelectItem key={network.id} value={network.id}>
                    <div className="flex items-center gap-2">
                      <Image
                        src={netWorksImages[idx]}
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
            />
            <HiUserCircle className="text-[#553555] text-2xl cursor-pointer" />
          </div>
        </div>

        <Tabs
          value={tab}
          onValueChange={(val) =>
            setTab(val as "daily-plan" | "weekly-plan" | "monthly-plan")
          }
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger
              value="daily-plan"
              className={tab === "daily-plan" ? "bg-[#553555] text-white" : ""}
            >
              Daily Plan
            </TabsTrigger>
            <TabsTrigger
              value="weekly-plan"
              className={tab === "weekly-plan" ? "bg-[#553555] text-white" : ""}
            >
              Weekly Plan
            </TabsTrigger>
            <TabsTrigger
              value="monthly-plan"
              className={
                tab === "monthly-plan" ? "bg-[#553555] text-white" : ""
              }
            >
              Monthly Plan
            </TabsTrigger>
          </TabsList>

          <TabsContent value={tab}>
            {selectedNetworkPlans && (
              <div className="flex flex-col gap-2 mt-4">
  <Label htmlFor="bundle-type">Select Data Plan</Label>

  <div
    
    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 text-center gap-3"
  >
    {selectedNetworkPlans.plans
      .filter((plan) => {
        const name = plan.name.toLowerCase();
        if (tab === "daily-plan") {
          const match = name.match(/(\d+)[-\s]*(day|days)/);
          if (match) {
            const days = parseInt(match[1], 10);
            return days <= 6;
          }
          return name.includes("daily");
        }
        if (tab === "weekly-plan") return name.includes("weekly");
        if (tab === "monthly-plan")
          return (
            name.includes("share") ||
            name.includes("monthly") ||
            name.includes("monthly-sme")
          );
        return false;
      })
      .map((plan, index) => (
        <div
        ref={containerRef}
          key={index}
          onClick={() => selectBundle(plan, index)}
          className={`text-sm rounded-md py-2 px-1 cursor-pointer duration-100 ${
            activeIndex === index
              ? "bg-[#553555]  text-white"
              : "border border-[#553555]  hover:border-2"
          }`}
        >
          <h2>{plan.name.split(" - ").slice(0, -1).join(" - ")}</h2>
          <p
            className={`text-black font-bold px-4 py-2 rounded ${
              activeIndex === index
                ? "bg-[#553555] text-white"
                : ""
            }`}
          >
            ₦{new Intl.NumberFormat().format(Math.round(plan.price * 1.06))}
          </p>
        </div>
      ))}
  </div>
</div>

            )}
          </TabsContent>
        </Tabs>

        {/* Buy Now Button */}
        <Button
          className="bg-[#553555] text-gray-200"
          disabled={!selectedNetwork || !selectedBundleCode || !phoneNumber}
        >
          Buy now
        </Button>
      </div>
    </>
  );
}

export default Page;
