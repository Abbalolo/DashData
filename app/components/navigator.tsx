import { IoIosArrowBack } from "react-icons/io";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type NavigatorProps = {
  page: string;
};

function Navigator({ page }: NavigatorProps) {
  const [myPage, setMyPage] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (page) {
      setMyPage(page.slice(1));
    }
  }, [page]);

  return (
    <header className="text-gray-200 bg-[#553555] flex items-center gap-5 p-5 ">
      <IoIosArrowBack
        onClick={() => router.back()}
        className="cursor-pointer"
      />
      <h1>{myPage}</h1>
    </header>
  );
}

export default Navigator;
