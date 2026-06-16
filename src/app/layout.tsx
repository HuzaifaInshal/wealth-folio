import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { LayoutDashboard, User, Wallet } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wealth Folio",
  description: "Track your wealth, investments and savings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen flex flex-col`}>
        <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <Wallet className="w-8 h-8" />
            <span>Wealth Folio</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors font-medium">
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link href="/profile" className="flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors font-medium">
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link>
          </div>
        </nav>
        <main className="flex-1 container mx-auto p-6">
          {children}
        </main>
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} Wealth Folio. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
