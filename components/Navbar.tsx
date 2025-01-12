"use client";

import React, { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlignRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { userId } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Ringkasan', href: '/dashboard/summary' },
    { name: 'Statistik', href: '/dashboard/statistics' },
  ];

  return (
    <header className="fixed w-full bg-white bg-opacity-50 backdrop-blur-sm drop-shadow-2xl z-50">
      <nav className="container mx-auto px-4 py-4 flex items-center">
        {/* Logo dan Brand */}
        <div className="flex items-center space-x-2 lg:ms-28">
          <Link href="/">
            <Image src="/images/logoo.png" alt="Logo" width={70} height={0}/>
          </Link>
          <h1 className="font-semibold text-2xl text-green-400 font-bold cursor-pointer">
            RiseBar
          </h1>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6 ml-auto lg:me-28">
          {userId && navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-black hover:text-green-400 transition-colors duration-300",
                pathname === item.href && "text-green-400"
              )}
            >
              {item.name}
            </Link>
          ))}
          {userId ? (
            <div className="ml-4">
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
            </div>
          ) : (
            <Link href="/sign-in">
              <Button size="sm" variant="green">Login</Button>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden ml-auto">
          {userId && (
            <div className="mr-2">
              <UserButton afterSignOutUrl="/" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-black flex justify-end" />
            ) : (
              <AlignRight className="h-6 w-6 text-black" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col items-center">
            {userId ? (
              <>
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "block px-3 py-2 text-black hover:text-green-400 transition-colors duration-300",
                      pathname === item.href && "text-green-400"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </>
            ) : (
              <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>
                <div className="px-3 py-2">
                  <Button size="sm" variant="green" className="w-full">
                    Login
                  </Button>
                </div>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 