"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock3, LayoutGrid, Sparkles, UserRound } from "lucide-react";
import { useState } from "react";
import { ProfileDialog } from "./ProfileDialog";

const nav = [
  { href: "/", label: "模板", icon: LayoutGrid },
  { href: "/history", label: "制作记录", icon: Clock3 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link href="/" className="brand" aria-label="PixelCraft 首页">
          <span className="brand-mark"><Sparkles aria-hidden="true" size={19} /></span>
          <span>PixelCraft</span>
        </Link>
        <nav className="main-nav" aria-label="主导航">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={pathname === href ? "nav-link active" : "nav-link"}>
              <Icon aria-hidden="true" size={17} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <button className="profile-trigger" type="button" onClick={() => setProfileOpen(true)} aria-label="打开个人资料">
          <span className="avatar"><UserRound aria-hidden="true" size={17} /></span>
          <span className="profile-copy"><strong>演示创作者</strong><small>个人工作区</small></span>
        </button>
      </header>
      <main>{children}</main>
      <ProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}

