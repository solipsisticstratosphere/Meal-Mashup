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

  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
        when: "afterChildren",
      },
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    closed: {
      opacity: 0,
      y: -10,
      scale: 0.95,
    },
    open: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const buttonVariants = {
    closed: {
      opacity: 0,
      y: -15,
      scale: 0.9,
    },
    open: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.1,
      },
    },
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="container mx-auto px-4 lg:px-6 flex justify-between items-center h-16 lg:h-18 gap-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          aria-label="Meal Mashup Home"
        >
          <motion.div
            className="bg-gradient-to-br from-rose-500 to-pink-600 w-8 h-8 lg:w-9 lg:h-9 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Utensils className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </motion.div>
          <span className="text-xl lg:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-pink-400 to-orange-400 tracking-tight">
            Meal Mashup
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative text-base font-medium px-2 py-2 transition-all duration-200 group ${
                pathname === link.href
                  ? "text-rose-600"
                  : "text-slate-700 hover:text-rose-600"
              }`}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.title}
              {pathname === link.href ? (
                <motion.span
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full"
                  layoutId="activeTab"
                />
              ) : (
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full group-hover:w-full transition-all duration-300"></span>
              )}
            </Link>
          ))}
        </nav>

        {/* Tablet Navigation */}
        <nav className="hidden md:flex lg:hidden items-center gap-4">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative text-sm font-medium px-3 py-2 rounded-lg transition-all text-center flex items-center justify-center min-h-[3rem] duration-200 ${
                pathname === link.href
                  ? "text-rose-600 bg-rose-50"
                  : "text-slate-700 hover:text-rose-600 hover:bg-slate-50"
              }`}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.title}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons (Desktop & Tablet) */}
        <div className="hidden md:flex items-center">
          {/* User profile  */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50/80 border border-slate-100">
            {isLoading ? (
              <div className="h-9 w-20 bg-slate-100 animate-pulse rounded-lg"></div>
            ) : isAuthenticated ? (
              <>
                <Link href="/profile">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<User className="w-4 h-4" />}
                  >
                    <span className="hidden lg:inline">
                      {user?.name?.split(" ")[0] || "Profile"}
                    </span>
                    <span className="lg:hidden">Profile</span>
                  </Button>
                </Link>
                <Link href="/auth/logout">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<LogOut className="w-4 h-4" />}
                  >
                    <span className="hidden lg:inline">Log out</span>
                    <span className="lg:hidden">Logout</span>
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
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <motion.button
            type="button"
            className="p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors relative"
            onClick={toggleMenu}
            onKeyDown={handleKeyDown}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            tabIndex={0}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden fixed left-0 right-0 top-16 z-40 bg-white/98 backdrop-blur-md border-b border-slate-200/80 overflow-hidden shadow-xl"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col gap-1">
                {navigationLinks.map((link, index) => (
                  <motion.div key={link.href} variants={itemVariants}>
                    <Link
                      href={link.href}
                      className={`text-base font-medium px-4 py-3 rounded-xl transition-all duration-200 block ${
                        pathname === link.href
                          ? "text-rose-600 bg-gradient-to-r from-rose-50 to-pink-50 shadow-sm"
                          : "text-slate-700 hover:bg-slate-50 hover:text-rose-600"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                      aria-current={pathname === link.href ? "page" : undefined}
                    >
                      <motion.span
                        initial={{ x: -10 }}
                        animate={{ x: 0 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                      >
                        {link.title}
                      </motion.span>
                    </Link>
                  </motion.div>
                ))}

                {/* Auth Buttons (Mobile)  */}
                <motion.div
                  className="mt-6 pt-6 border-t-2 border-slate-200 flex flex-col gap-3 bg-slate-50/50 rounded-xl p-4 mx-2"
                  variants={buttonVariants}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-600">
                      Account
                    </span>
                  </div>
                  {isLoading ? (
                    <div className="h-12 bg-slate-100 animate-pulse rounded-xl"></div>
                  ) : isAuthenticated ? (
                    <>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
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
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
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
                      </motion.div>
                    </>
                  ) : (
                    <>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Link
                          href="/auth/login"
                          onClick={() => setIsMenuOpen(false)}
                          className="block w-full"
                        >
                          <Button variant="outline" fullWidth>
                            Log in
                          </Button>
                        </Link>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
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
                      </motion.div>
                    </>
                  )}
                </motion.div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
