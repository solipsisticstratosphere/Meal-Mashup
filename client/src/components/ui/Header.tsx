"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Utensils } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      toggleMenu();
    }
  };

  const navigationLinks = [
    { title: "Home", href: "/" },
    { title: "Create Recipe", href: "/create-recipe" },
    { title: "My Recipes", href: "/my-recipes" },
    { title: "Popular", href: "/popular" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="Meal Mashup Home"
        >
          <div className="bg-gradient-to-r from-rose-600 to-orange-500 w-8 h-8 rounded-lg flex items-center justify-center">
            <Utensils className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 via-fuchsia-500 to-orange-500">
            Meal Mashup
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative text-base font-medium px-1 py-2 transition-colors group ${
                pathname === link.href
                  ? "text-blue-600"
                  : "text-slate-700 hover:text-blue-600"
              }`}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.title}
              {pathname === link.href ? (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
              ) : (
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              )}
            </Link>
          ))}
        </nav>

        {/* Action Button (Desktop) */}
        <div className="hidden md:block">
          <Link href="/create-recipe">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md px-4 py-2 text-sm transition-colors flex items-center gap-1">
              <span>Create Recipe</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-1"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            type="button"
            className="p-2 rounded-md text-slate-700 hover:bg-slate-100 transition-colors"
            onClick={toggleMenu}
            onKeyDown={handleKeyDown}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            tabIndex={0}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 animate-fadeIn">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex flex-col gap-2">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-base font-medium px-4 py-2 rounded-md transition-colors ${
                    pathname === link.href
                      ? "text-blue-600 bg-blue-50"
                      : "text-slate-700 hover:bg-slate-100 hover:text-blue-600"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                  aria-current={pathname === link.href ? "page" : undefined}
                >
                  {link.title}
                </Link>
              ))}

              {/* Action Button (Mobile) */}
              <Link
                href="/create-recipe"
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md px-4 py-2 transition-colors flex items-center justify-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>Create Recipe</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-1"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
