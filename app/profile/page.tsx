"use client"
import { CiHeadphones } from "react-icons/ci"; 
import { GoSignOut } from "react-icons/go"; 
import { CgDanger } from "react-icons/cg"; 
import { CgProfile } from "react-icons/cg"; 
import React from "react";
import Navigator from "../components/navigator";
import Link from "next/link";
import { usePathname } from "next/navigation";

function Page() {

  const pageName = usePathname()
  const links = [
    {
      name: "Terms of use",
      icon: <CgDanger />,
    },
    {
      name: "Contact Us",
      icon: <CiHeadphones />,
    },
    {
      name: "Sign Out",
      icon: <GoSignOut />,
    },
  ];

  return (
    <div>
      <Navigator page={pageName}/>

      <div className="flex flex-col justify-center items-center py-5">
        <CgProfile className="text-5xl" />
        <p className="text-xl font-bold">Ibrahim Lawal</p>
        <span>v1.0.0</span>
      </div>

      <div className="flex flex-col gap-4 px-4 p-5">
        {links.map((item, index) => (
          <div className="flex gap-3 items-center" key={index}>
            <p className="text-2xl ">{item.icon}</p>
            <Link href={"#"}>{item.name}</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Page;
