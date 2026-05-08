"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { FileText, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import Button from "@/components/ui/Button";

const navLinks = [
  { href: "/", label: "Головна" },
  { href: "/blog", label: "Блог" },
  { href: "/about", label: "Про нас" },
  { href: "/contact", label: "Контакти" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
            <FileText className="h-6 w-6" />
            ResumeAI
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-indigo-600"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                {session.user.role === "ADMIN" && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm">Адмін</Button>
                  </Link>
                )}
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">Кабінет</Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="h-4 w-4" />
                  Вийти
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Увійти</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Реєстрація</Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-700"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {session ? (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">Кабінет</Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Вийти
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">Увійти</Button>
              </Link>
              <Link href="/register" onClick={() => setMenuOpen(false)}>
                <Button size="sm" className="w-full">Реєстрація</Button>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
