"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  BookOpen,
  FolderOpen,
  MessageSquare,
  BarChart2,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { signOut } from "next-auth/react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Користувачі", icon: Users },
  { href: "/admin/resumes", label: "Резюме", icon: FileText },
  { href: "/admin/blog", label: "Блог", icon: BookOpen },
  { href: "/admin/categories", label: "Категорії", icon: FolderOpen },
  { href: "/admin/messages", label: "Повідомлення", icon: MessageSquare },
  { href: "/admin/analytics", label: "Аналітика", icon: BarChart2 },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* ── Mobile: top bar + horizontal scrollable nav ── */}
      <div className="lg:hidden bg-gray-900 w-full shrink-0">
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-700">
          <Link href="/" className="text-white font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-400" />
            ResumeAI Admin
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-gray-400 hover:text-white p-1"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <nav className="flex gap-1 px-2 py-2 min-w-max">
            {links.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
                    active
                      ? "bg-indigo-600 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── Desktop: vertical sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 bg-gray-900 min-h-screen shrink-0">
        <div className="p-6 border-b border-gray-700">
          <Link href="/" className="text-white font-bold text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-400" />
            ResumeAI Admin
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {links.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                  active
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
                {active && <ChevronRight className="h-3 w-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Вийти
          </button>
        </div>
      </aside>
    </>
  );
}
