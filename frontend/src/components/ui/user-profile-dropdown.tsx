import { useState, useRef, useEffect } from "react";
import { useUser } from "../../app/contexts/UserContext";
import { useSignOut } from "../../app/hooks/useSignOut";
import { useTheme } from "../../app/contexts/ThemeContext";
import { User, Settings, LogOut } from "lucide-react";
import { SignOut } from "phosphor-react";
import Link from "next/link";

export default function UserProfileDropdown() {
  const { user, loading } = useUser();
  const { signOut, isLoading: isSigningOut } = useSignOut();
  const { theme, toggleTheme, setTheme } = useTheme();
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

  const fullName = `${user.firstName} ${user.lastName}`.trim() || user.email;
  const initials = `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    // Close the dropdown after changing theme
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile section that toggles the menu */}
      <div 
        className="profile cursor-pointer flex justify-end items-center gap-3"
        onClick={toggleDropdown}
      >
        <div className="user text-right">
          <h3 className="text-sm font-semibold m-0 text-gray-900 dark:text-white">{fullName}</h3>
          <p className="text-xs opacity-60 m-0 text-gray-600 dark:text-gray-400">@{user.email.split('@')[0]}</p>
        </div>
        <div className="img-box relative w-10 h-10 rounded-full overflow-hidden">
          <img 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0D8ABC&color=fff`} 
            alt={fullName} 
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Dropdown menu */}
      <div 
        className={`menu absolute top-full right-0 w-64 min-h-[100px] bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden z-[9999] ${
          isOpen 
            ? 'opacity-100 transform translate-y-2 visible' 
            : 'opacity-0 transform -translate-y-2 invisible'
        } transition-all duration-300`}
      >
        {/* Dropdown arrow */}
        <div className="absolute -top-2 right-4 w-5 h-5 bg-white dark:bg-gray-800 transform rotate-45 z-[9999]"></div>
        
        {/* Menu items */}
        <div className="relative z-10 bg-white dark:bg-gray-800">
          <ul className="py-2">
            <li>
              <Link 
                href="/settings"
                className="flex items-center gap-2 px-5 py-3 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-800 dark:text-gray-300" />
                &nbsp;Settings
              </Link>
            </li>
            <li className="pt-2">
              <button
                onClick={signOut}
                disabled={isSigningOut}
                className="w-full flex items-center gap-2 px-5 py-3 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-left"
              >
                <SignOut weight="bold" className="w-4 h-4 text-red-500 dark:text-red-400" />
                &nbsp;Sign Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}