"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { signOut } from "next-auth/react";
import { Coins } from "lucide-react";

const NavHeader = ({ credits, email }: { credits: number; email: string }) => {
  return (
    <header className="bg-white sticky top-0 z-10 flex justify-center border-b border-gray-200">
      <div className="container flex h-16 items-center justify-between px-4 py-2">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="font-lobster text-2xl font-medium tracking-tight">
            <span className="bg-gradient-to-r from-[#ffc247] to-[#00ffe5] bg-clip-text text-transparent">
              Mylo
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 h-8 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#ffc247]/10 to-[#00ffe5]/10 border border-[#ffc247]/30">
              <Coins className="h-3.5 w-3.5 text-[#ffc247]" />
              <span className="text-xs font-semibold bg-gradient-to-r from-[#ffc247] to-[#e5a830] bg-clip-text text-transparent">
                {credits} credits
              </span>
            </div>
            <Button
              size="sm"
              asChild
              className="h-8 text-xs font-medium bg-gradient-to-r from-[#ffc247] to-[#00ffe5] text-gray-900 hover:opacity-90 border-0"
            >
              <Link href="/dashboard/billing">Buy more</Link>
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full p-0 border-2 border-transparent hover:border-[#ffc247]/50 transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-[#ffc247] to-[#00ffe5] text-gray-900 font-semibold">
                    {email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="text-gray-500 text-xs">{email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/dashboard/billing">Billing</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ redirectTo: "/login" })}
                className="text-red-500 cursor-pointer focus:text-red-500"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default NavHeader;
