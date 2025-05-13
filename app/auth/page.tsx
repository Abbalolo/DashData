"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
  User,
} from "firebase/auth";
import { auth, db } from "../firebase/firebase";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Loader from "../components/Loader";
import clsx from "clsx";
import { doc, setDoc } from "firebase/firestore";
import { Wallet } from "lucide-react";

export default function AuthTabs() {
  const router = useRouter();
  const [tab, setTab] = useState<"sign-up" | "login">("sign-up");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^[0-9]{10,15}$/.test(phone);
  const validatePassword = (password: string) => password.length >= 6;

  useEffect(() => {
    // Clear sensitive fields on tab switch
    setError("");
    setPassword("");
    setConfirmPassword("");
  }, [tab]);

  const handleRegister = async () => {
    setIsLoading(true);
    setError("");
  
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const cleanConfirmPassword = confirmPassword.trim();
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanPhone = phone.trim();
    const fullName = `${cleanFirstName} ${cleanLastName}`;
  
    // Validation
    if (
      !cleanFirstName ||
      !cleanLastName ||
      !cleanEmail ||
      !cleanPhone ||
      !cleanPassword ||
      !cleanConfirmPassword
    ) {
      setError("All fields are required.");
      setIsLoading(false);
      return;
    }
  
    if (!validateEmail(cleanEmail)) {
      setError("Invalid email format.");
      setIsLoading(false);
      return;
    }
  
    if (!validatePhone(cleanPhone)) {
      setError("Phone number must be 10–15 digits.");
      setIsLoading(false);
      return;
    }
  
    if (!validatePassword(cleanPassword)) {
      setError("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }
  
    if (cleanPassword !== cleanConfirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      const user = userCredential.user;
  
      if (!user) throw new Error("User registration failed.");
  
      await updateProfile(user, { displayName: fullName });
  
      // 1. Save basic user data first
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        fullName,
        phone: cleanPhone,
        walletBalance: 0,
        darkMode: false,
        balanceVisibility: "show",
        createdAt: new Date(),
      });
  
      // // 2. Create wallet using Flutterwave API
      // try {
      //   await createWallet(user, fullName);
      // } catch (walletErr: any) {
      //   console.error("Wallet creation failed:", walletErr);
      //   toast.error("Account created, but wallet setup failed.");
      // }
  
      toast.success("Welcome to DashData! Your account has been created.");
      setTab("login");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatPhone = (number: string): string => {
    let phone = number.trim();
    if (phone.startsWith("0")) {
      phone = phone.slice(1);
    }
    return phone.startsWith("+234") ? phone : `+234${phone}`;
  };
  
  const createWallet = async (user: User, fullName: string) => {
    const data = {
      email: user.email,
      userId: user.uid,
      fullName,
      mobilenumber: phone.trim(),
    };
  
    const res = await fetch("/api/createWallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  
    const wallet = await res.json();
    console.log(wallet);
  
    if (wallet?.account_number) {
      await setDoc(
        doc(db, "users", user.uid),
        {
          wallet: {
            accountNumber: wallet.account_number,
            bankName: wallet.bank_name,
            flwRef: wallet.flw_ref,
          },
        },
        { merge: true } // ✅ don't overwrite previous data
      );
    } else {
      throw new Error(wallet.error || "Failed to create wallet.");
    }
  };
  
  
  const handleLogin = async () => {
    setIsLoading(true);
    setError("");

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError("Email and password are required.");
      setIsLoading(false);
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setError("Invalid email format.");
      setIsLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      toast.success("Logged in successfully.");
      router.push("/");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      toast.error("Please enter your email.");
      return;
    }

    if (!validateEmail(cleanEmail)) {
      toast.error("Invalid email format.");
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      toast.success("Password reset email sent.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="flex justify-center items-center py-10">
      <Tabs
        value={tab}
        onValueChange={(val) => setTab(val as "sign-up" | "login")}
        className="w-[400px]"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="sign-up"
            className={clsx(tab === "sign-up" && "bg-[#553555] text-gray-100")}
          >
            Sign up
          </TabsTrigger>
          <TabsTrigger
            value="login"
            className={clsx(tab === "login" && "bg-[#553555] text-gray-100")}
          >
            Login
          </TabsTrigger>
        </TabsList>

        {/* SIGN UP */}
        <TabsContent className="text-[#553555]" value="sign-up">
          <Card>
            <CardHeader>
              <CardTitle>Create Account</CardTitle>
              <CardDescription>
                Welcome to <strong>DashData</strong>. Create your account below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  label: "First Name",
                  id: "signup-firstname",
                  value: firstName,
                  setter: setFirstName,
                },
                {
                  label: "Last Name",
                  id: "signup-lastName",
                  value: lastName,
                  setter: setLastName,
                },
                {
                  label: "Email",
                  id: "signup-email",
                  value: email,
                  setter: setEmail,
                  type: "email",
                },
                {
                  label: "Phone Number",
                  id: "signup-phone",
                  value: phone,
                  setter: setPhone,
                },
                {
                  label: "Password",
                  id: "signup-password",
                  value: password,
                  setter: setPassword,
                  type: "password",
                },
                {
                  label: "Confirm Password",
                  id: "signup-cpassword",
                  value: confirmPassword,
                  setter: setConfirmPassword,
                  type: "password",
                },
              ].map(({ label, id, value, setter, type = "text" }) => (
                <div className="space-y-1" key={id}>
                  <Label htmlFor={id}>{label}</Label>
                  <Input
                    id={id}
                    type={type}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                  />
                </div>
              ))}
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-[#553555] text-gray-100"
                onClick={handleRegister}
              >
                Sign Up
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* LOGIN */}
        <TabsContent className="text-[#553555]" value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Access your account here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                className="text-sm text-[#553555] my-2 underline hover:text-[#7a3c7a]"
                onClick={handleForgotPassword}
                type="button"
              >
                Forgot Password?
              </button>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-[#553555] text-gray-100"
                onClick={handleLogin}
              >
                Login
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
