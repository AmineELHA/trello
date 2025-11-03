"use client";

import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Calendar, 
  Table,
  Moon, 
  Sun,
  ChevronDown,
  Plus,
  Search
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserProfileDropdown from "@/components/ui/user-profile-dropdown";
import { useQuery } from "@tanstack/react-query";
import { getGraphQLClient } from "../lib/graphqlClient";
import { GET_BOARDS } from "../graphql/queries";
import { NotificationBell } from "@/components/ui/notification-bell";

const BoardLayout = ({ children }: { children: React.ReactNode }) => {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  interface BoardResponse {
    boards: {
      id: string;
      name: string;
    }[];
  }

  // Fetch real boards from the database
  const { data, isLoading } = useQuery({
    queryKey: ["boards"],
    queryFn: async () => {
      const client = getGraphQLClient();
      const res = await client.request<BoardResponse>(GET_BOARDS);
      return res.boards.map((board) => ({
        id: board.id,
        name: board.name,
        color: "bg-purple-500" // Default color, could be extended to store colors in DB
      }));
    },
  });

  const boards = Array.isArray(data) ? data : [];

  const workspaceName = "Kettle Studio";

  const navItems = [
    { name: "Boards", icon: LayoutDashboard, href: "/boards" },
    { name: "Settings", icon: Settings, href: "/settings" },
  ];

  const viewItems = [
    { name: "Table", icon: Table },
    { name: "Calendar", icon: Calendar },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">Trello Clone</span>
          </Link>
        </div>



        {/* Navigation */}
        <nav className="px-2 py-2">
          {navItems.map((item) => (
            <Link 
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 p-2 rounded-lg mb-1 ${
                pathname === item.href 
                  ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>



        {/* Your Boards */}
        <div className="px-2 py-2 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-2 mb-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Your boards
            </h3>
            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          {isLoading ? (
            <div className="px-2 py-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading boards...</p>
            </div>
          ) : (
            boards.map((board) => (
              <Link 
                key={board.id}
                href={`/boards/${board.id}`}
                className={`flex items-center gap-3 p-2 rounded-lg mb-1 ${
                  pathname === `/boards/${board.id}` 
                    ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <div className={`${board.color} w-3 h-3 rounded-full`}></div>
                <span className="text-sm font-medium truncate">{board.name}</span>
              </Link>
            ))
          )}
        </div>

        {/* Theme Toggle */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            className="w-full justify-between text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={toggleTheme}
          >
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <>
                  <Sun className="h-5 w-5" />
                  <span className="text-sm font-medium">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-5 w-5" />
                  <span className="text-sm font-medium">Dark Mode</span>
                </>
              )}
            </div>
            <div className="relative w-10 h-5 bg-gray-300 dark:bg-gray-600 rounded-full">
              <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300 ${
                theme === 'dark' ? 'bg-white left-5' : 'bg-gray-100 left-0.5'
              }`}></div>
            </div>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center px-4">
          <div className="ml-auto flex items-center gap-3">
            <NotificationBell />
            <UserProfileDropdown />
          </div>
        </header>

        {/* Board Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default BoardLayout;