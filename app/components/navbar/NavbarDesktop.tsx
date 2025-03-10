/* eslint-disable @next/next/no-img-element */
"use client";
import { useRouter } from "next/navigation";
import { CiSearch } from "react-icons/ci";
import { NavTransition } from "./NavTransition";
import { useState } from "react";
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function NavbarDesktop(props: any) {
  const router = useRouter();
  const handleTransition = async (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    link: string,
    href: string,
  ) => {
    e.preventDefault();
    const body = document.querySelector("body");

    body?.classList.add("page-transition-down");

    await sleep(400);
    router.push(href);
    await sleep(500);

    body?.classList.remove("page-transition");
  };

  const [query, setQuery] = useState("");
  async function handleSearch(e: any) {
    e.preventDefault();
    const body = document.querySelector("body");
    handleTransition(e, query, `/stocks?search=${query}`);
  }
  return (
    <div className="flex  flex-col ">
      <div className="flex mt-2 items-center flex-row justify-between  text-xl">
        <div className="flex flex-row items-center">
          <img src="/FoursightLogo.png" alt="Foursight Logo" className="h-8" />
          <p className="ml-2 font-medium green-text">
            <NavTransition className="" href="/">
              Foursight
            </NavTransition>
          </p>
        </div>
        <div className="flex flex-row">
          <div className="flex flex-row items-center border border-1 border-[#C6C6C6] hover:border-[#858585] transition transition-all-0.5s rounded-lg px-2 py-1">
            <form
              className="flex flex-row items-center justify-center"
              onSubmit={handleSearch}
            >
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className=" bg-transparent focus:border-none focus:outline-none border-none px-2 text-base rounded-lg"
                type="text"
                placeholder="Search for stocks"
              />
              <button className="my-auto">
                <CiSearch className="hover:green-text" />
              </button>
            </form>
          </div>
          <NavTransition href="/dashboard" className="flex">
            <button className="hover:bg-teal-600 transition transition-all-0.5s bg-[#037A68] py-1 px-3 text-sm text-white rounded-md ml-3">
              Dashboard
            </button>
          </NavTransition>
        </div>
      </div>
      <hr className="w-full mt-2" />
    </div>
  );
}
