"use client";

// import Link from "next/link";
// import { Utensils, Mail, Github, Twitter } from "lucide-react";

const Footer = () => {
  // const handleKeyDown = (e: React.KeyboardEvent) => {
  //   if (e.key === "Enter" || e.key === " ") {
  //     e.currentTarget.click();
  //   }
  // };

  // const footerLinks = [
  //   { title: "About", href: "/about" },
  //   { title: "Privacy", href: "/privacy" },
  //   { title: "Terms", href: "/terms" },
  //   { title: "Contact", href: "/contact" },
  // ];

  // const socialLinks = [
  //   {
  //     icon: <Mail className="w-5 h-5" />,
  //     href: "mailto:info@mealmashup.com",
  //     label: "Email us",
  //   },
  //   {
  //     icon: <Github className="w-5 h-5" />,
  //     href: "https://github.com/mealmashup",
  //     label: "GitHub",
  //   },
  //   {
  //     icon: <Twitter className="w-5 h-5" />,
  //     href: "https://twitter.com/mealmashup",
  //     label: "Twitter",
  //   },
  // ];

  return (
    <footer className="w-full bg-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="">
          <p className="text-sm text-slate-500 text-center">
            © {new Date().getFullYear()} Meal Mashup. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
