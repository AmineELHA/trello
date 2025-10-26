"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings,
  Plus,
  Home,
  Archive,
  Star,
  Search,
  MoreHorizontal,
  Moon,
  Sun,
  ChevronDown,
  Table
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  boards?: Array<{
    id: string;
    name: string;
  }>;
}

export function Sidebar({ className, boards = [] }: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  
  const navItems = [
    { icon: LayoutDashboard, label: "Boards", href: "/boards" },
    { icon: Users, label: "Members", href: "/members" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className={cn("flex h-full flex-col bg-sidebar text-sidebar-foreground border-r", className)}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="p-1.5 bg-primary rounded-lg">
            <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">Trello</span>
        </Link>
      </div>

      {/* Workspace Selector */}
      <div className="px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
              <span className="text-xs font-semibold">KS</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Kettle Studio</span>
              <span className="text-xs text-muted-foreground">Workspace</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="px-2 py-3">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href || pathname.startsWith(item.href) && item.href !== "/" 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            </Link>
          ))}
        </nav>
      </div>

      {/* Workspace Views */}
      <div className="px-2 py-2">
        <div className="text-xs font-semibold text-muted-foreground px-3 mb-1">WORKSPACE VIEWS</div>
        <nav className="space-y-1">
          <Link href="/boards">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/boards" 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Table</span>
            </Button>
          </Link>
          <Link href="/calendar">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/calendar" 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Calendar className="h-4 w-4" />
              <span>Calendar</span>
            </Button>
          </Link>
        </nav>
      </div>

      {/* Your Boards */}
      <div className="px-2 py-2">
        <div className="flex items-center justify-between px-3 mb-1">
          <div className="text-xs font-semibold text-muted-foreground">YOUR BOARDS</div>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
        <nav className="space-y-1">
          {boards.length > 0 ? (
            boards.map((board) => (
              <Link key={board.id} href={`/boards/${board.id}`}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === `/boards/${board.id}`
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                  <span className="truncate">{board.name}</span>
                </Button>
              </Link>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">No boards yet</div>
          )}
        </nav>
      </div>

      {/* Create Board */}
      <div className="px-2 pt-2">
        <Link href="/boards">
          <Button className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground justify-start">
            <Plus className="h-4 w-4" />
            Create Board
          </Button>
        </Link>
      </div>

      {/* Theme Toggle and User */}
      <div className="mt-auto pt-4 border-t border-sidebar-border">
        {/* Theme Toggle */}
        <div className="px-3 py-2">
          <Button
            variant="ghost"
            className="w-full justify-between"
            onClick={toggleTheme}
          >
            <span>Theme</span>
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* User Profile */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                <span className="text-sm font-medium">U</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">User Name</span>
                <span className="text-xs text-muted-foreground">user@example.com</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}