import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlutterWaveButton, closePaymentModal } from "flutterwave-react-v3";
import { useState, useEffect } from "react";
import { useWallet } from "../context/UserData";

interface FundWalletPopUpProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export function FundWalletPopUp({ isOpen, setIsOpen }: FundWalletPopUpProps) {
  const [amount, setAmount] = useState("");
  const { userData } = useWallet();

  const config = {
    public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY || "",
    tx_ref: Date.now().toString(),
    amount: Number(amount),
    currency: "NGN",
    payment_options: "card",
    customer: {
      email: userData?.email || "email@example.com",
      name: userData?.fullName || "User",
      phone_number: userData?.phone || "08000000000",
    },
    customizations: {
      title: "Fund Wallet",
      description: "Add money to your DashData wallet",
      logo: "/logo.png",
    },
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Fund Wallet</DialogTitle>
          <DialogDescription>
            Enter the amount you want to fund your wallet with.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="₦0.00"
          />
        </div>

        <DialogFooter>
          <FlutterWaveButton
            {...config}
            callback={(response) => {
              if (response.status === "successful") {
                console.log("Payment successful:", response);
                
                setIsOpen(false);
              }
              closePaymentModal();
            }}
            onClose={closePaymentModal}
            text="Pay now"
            className="border-white border-2 hover:bg-[#553555] hover:text-gray-200 px-4 py-2 rounded-xl bg-gray-200 text-[#553555] transition-all duration-300 ease-in-out cursor-pointer w-full text-center"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
