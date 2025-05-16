"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Utensils, UserCircle, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";
import { useAuth } from "@/components/providers/AuthProvider";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();

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
    ...(isAuthenticated
      ? [
          { title: "My Recipes", href: "/my-recipes" },
          { title: "Saved Recipes", href: "/saved-recipes" },
        ]
      : []),
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
          <div className="bg-rose-500 w-8 h-8 rounded-lg flex items-center justify-center">
            <Utensils className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-pink-400 to-orange-400">
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
                  ? "text-rose-600"
                  : "text-slate-700 hover:text-rose-600"
              }`}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.title}
              {pathname === link.href ? (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-rose-600"></span>
              ) : (
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-600 group-hover:w-full transition-all duration-300"></span>
              )}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {isLoading ? (
            <div className="h-9 w-20 bg-slate-100 animate-pulse rounded-md"></div>
          ) : isAuthenticated ? (
            <>
              <Link href="/profile">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<User className="w-4 h-4" />}
                >
                  {user?.name?.split(" ")[0] || "Profile"}
                </Button>
              </Link>
              <Link href="/auth/logout">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<LogOut className="w-4 h-4" />}
                >
                  Log out
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button
                  variant="primary"
                  size="sm"
                  icon={<UserCircle className="w-4 h-4" />}
                >
                  Sign up
                </Button>
              </Link>
            </>
          )}
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

      {/* Mobile Navigation - Positioned as overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden fixed left-0 right-0 top-16 z-40 bg-white border-b border-slate-200 overflow-hidden shadow-lg"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="container mx-auto px-4 py-3">
              <nav className="flex flex-col gap-2">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-base font-medium px-4 py-2 rounded-md transition-colors ${
                      pathname === link.href
                        ? "text-rose-600 bg-rose-50"
                        : "text-slate-700 hover:bg-slate-100 hover:text-rose-600"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                    aria-current={pathname === link.href ? "page" : undefined}
                  >
                    {link.title}
                  </Link>
                ))}

                {/* Auth Buttons (Mobile) */}
                <div className="mt-2 flex flex-col gap-2">
                  {isLoading ? (
                    <div className="h-10 bg-slate-100 animate-pulse rounded-md"></div>
                  ) : isAuthenticated ? (
                    <>
                      <Link
                        href="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="block w-full"
                      >
                        <Button
                          variant="outline"
                          fullWidth
                          icon={<User className="w-4 h-4" />}
                        >
                          Profile
                        </Button>
                      </Link>
                      <Link
                        href="/auth/logout"
                        onClick={() => setIsMenuOpen(false)}
                        className="block w-full"
                      >
                        <Button
                          variant="primary"
                          fullWidth
                          icon={<LogOut className="w-4 h-4" />}
                        >
                          Log out
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="block w-full"
                      >
                        <Button variant="outline" fullWidth>
                          Log in
                        </Button>
                      </Link>
                      <Link
                        href="/auth/signup"
                        onClick={() => setIsMenuOpen(false)}
                        className="block w-full"
                      >
                        <Button
                          variant="primary"
                          fullWidth
                          icon={<UserCircle className="w-4 h-4" />}
                        >
                          Sign up
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
