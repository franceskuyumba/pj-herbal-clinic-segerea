"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Boxes,
  Users,
  Truck,
  Megaphone,
  Newspaper,
  LayoutTemplate,
  Ticket,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/delivery", label: "Delivery", icon: Truck },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/landing-pages", label: "Landing Pages", icon: LayoutTemplate },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-white/10 p-4 lg:flex">
      <Link href="/" className="mb-6 block font-display text-lg text-brand-gold">
        PJHerbal Admin
      </Link>
      <nav className="flex-1 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname?.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                active ? "bg-brand-gold/15 text-brand-gold" : "text-brand-ink/70 hover:bg-white/5"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 pt-3 text-xs text-brand-ink/50">
        <div className="mb-2 truncate">{profile?.name ?? profile?.email}</div>
        <button onClick={() => signOut()} className="flex items-center gap-2 text-brand-ink/60 hover:text-red-400">
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  );
}
