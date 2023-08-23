"use client";
import { fetchSuggestion } from "@/lib/fetchSuggestion";
import { useBoardStore } from "@/store/BoardStore";
import { MagnifyingGlassIcon, UserCircleIcon } from "@heroicons/react/24/solid";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import Avatar from "react-avatar";

function Header() {
  const [board, searchString, searchSearchString] = useBoardStore((state) => [
    state.board,
    state.searchString,
    state.setSearchString,
  ]);

  const [loading, setLoading] = useState<boolean>(true);
  const [suggestion, setSuggestion] = useState<string>("");

  useEffect(() => {
    if (board.columns.size === 0) return;
    setLoading(true);

    const fetchSuggestionFunc = async () => {
      const suggestion = await fetchSuggestion(board);
      setSuggestion(suggestion);
      setLoading(false);
    };

    fetchSuggestionFunc();
  }, [board]);

  return (
    <header>
      <div className="flex items-center bg-gray-400/10 p-5 rounded-b-2xl flex-col md:flex-row">
        <div className="absolute top-0 left-0 w-full h-96 -z-50 bg-gradient-to-br from-pink-400 to-[#0055D1] rounded-md filter blur-3xl opacity-50" />
        <Image
          src="https://links.papareact.com/c2cdd5"
          alt="Trello Logo"
          height={100}
          width={300}
          className="w-44 md:w-56 pb-10 md:pb-0 object-contain"
        />
        <div className="flex items-center space-x-5 justify-end flex-1 w-full">
          <form className="flex items-center space-x-5 bg-white rounded-md p-2 shadow-md flex-1 md:flex-initial">
            <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
            <input
              type="text"
              className="flex-1 outline-none p-2"
              value={searchString}
              onChange={(e) => searchSearchString(e.target.value)}
              placeholder="Search"
            />
            <button type="submit" hidden>
              Search
            </button>
          </form>
          <Avatar name="Artim Gashi" round color="#0055D1" size="50" />
        </div>
      </div>
      <div className="flex items-center justify-center px-5 md:py-5 py-2">
        <p className="flex items-center text-sm font-light p-5 shadow-xl w-fit bg-white italic max-w-3x text-[#0055D1] rounded-xl ">
          <UserCircleIcon
            className={`h-10 w-10 inline-block text-[#0055D1] mr-1 ${
              loading && "animate-spin"
            }`}
          />
          {suggestion && !loading ? suggestion : "GPT is summarizing your day."}
        </p>
      </div>
    </header>
  );
}

export default Header;
