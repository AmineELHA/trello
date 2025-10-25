"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "../../app/contexts/UserContext";
import { useSignOut } from "../../app/hooks/useSignOut";
import { Button } from "./button";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { ChevronDown, LogOut, User } from "lucide-react";

export default function UserProfileDropdown() {
  const { user, loading } = useUser();
  const { signOut, isLoading: isSigningOut } = useSignOut();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  if (loading) return null; // Don't show anything while loading

  if (!user) {
    // Don't show the dropdown if no user is authenticated
    return null;
  }

  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const initials = `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative h-8 w-8 rounded-full"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0D8ABC&color=fff`} alt={fullName} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {initials || <User className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
        <span className="absolute -bottom-0.5 right-0 block h-2 w-2 rounded-full ring-2 ring-background bg-green-500" />
        <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md border bg-background shadow-lg ring-1 ring-black/10 focus:outline-none">
          <div className="px-4 py-3">
            <p className="text-sm font-medium">{fullName || user.email}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="py-1" role="none">
            <button
              onClick={signOut}
              disabled={isSigningOut}
              className="flex w-full items-center px-4 py-2 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isSigningOut ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}