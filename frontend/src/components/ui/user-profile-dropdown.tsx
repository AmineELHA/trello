import { useState, useRef, useEffect } from "react";
import { useUser } from "../../app/contexts/UserContext";
import { useSignOut } from "../../app/hooks/useSignOut";
import { useTheme } from "../../app/contexts/ThemeContext";
import { User, Mail, Settings, HelpCircle, LogOut, Sun, Moon, Camera } from "lucide-react";
import { User as PhUser, EnvelopeSimple, GearSix, Question, SignOut, PencilSimple } from "phosphor-react";

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
          <h3 className="text-sm font-semibold m-0">{fullName}</h3>
          <p className="text-xs opacity-60 m-0">@{user.username || user.email.split('@')[0]}</p>
        </div>
        <div className="img-box relative w-10 h-10 rounded-full overflow-hidden">
          <img 
            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0D8ABC&color=fff`} 
            alt={fullName} 
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Dropdown menu */}
      <div 
        className={`menu absolute top-full right-4 w-64 min-h-[100px] bg-white shadow-lg rounded-lg overflow-hidden ${
          isOpen 
            ? 'opacity-100 transform translate-y-0 visible' 
            : 'opacity-0 transform -translate-y-3 invisible'
        } transition-all duration-300`}
        style={{ marginTop: '24px' }}
      >
        {/* Dropdown arrow */}
        <div className="absolute top-[-10px] right-[14px] w-5 h-5 bg-white transform rotate-45 z-[-1]"></div>
        
        {/* User profile header */}
        <div className="px-5 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0D8ABC&color=fff`} 
                alt={fullName} 
                className="w-12 h-12 rounded-full object-cover"
              />
              <button className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1 border-2 border-white">
                <Camera className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm truncate">{fullName}</h3>
                <button className="p-0.5 rounded hover:bg-gray-100">
                  <PencilSimple weight="bold" className="w-3 h-3 text-gray-600" />
                </button>
              </div>
              <p className="truncate text-xs text-gray-600">@{user.username || user.email.split('@')[0]}</p>
            </div>
          </div>
        </div>
        
        {/* Menu items */}
        <div className="relative z-10 bg-white">
          <ul className="py-2">
            <li>
              <a 
                href="#" 
                className="flex items-center gap-2 px-5 py-3 text-sm text-gray-800 hover:bg-gray-100 transition-colors"
              >
                <PhUser weight="bold" className="w-4 h-4 text-gray-800" />
                &nbsp;Profile
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className="flex items-center gap-2 px-5 py-3 text-sm text-gray-800 hover:bg-gray-100 transition-colors"
              >
                <EnvelopeSimple weight="bold" className="w-4 h-4 text-gray-800" />
                &nbsp;Inbox
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className="flex items-center gap-2 px-5 py-3 text-sm text-gray-800 hover:bg-gray-100 transition-colors"
              >
                <GearSix weight="bold" className="w-4 h-4 text-gray-800" />
                &nbsp;Settings
              </a>
            </li>
            <li className="pt-2">
              <div className="px-5 py-1 text-xs text-gray-500 font-medium">APPEARANCE</div>
              <div 
                className={`flex items-center gap-2 px-5 py-3 text-sm cursor-pointer ${
                  theme === 'light' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-800 hover:bg-gray-100'
                } transition-colors`}
                onClick={() => handleThemeChange('light')}
              >
                <Sun className={`w-4 h-4 ${theme === 'light' ? 'text-blue-600' : 'text-gray-800'}`} />
                &nbsp;Light Mode
              </div>
              <div 
                className={`flex items-center gap-2 px-5 py-3 text-sm cursor-pointer ${
                  theme === 'dark' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-800 hover:bg-gray-100'
                } transition-colors`}
                onClick={() => handleThemeChange('dark')}
              >
                <Moon className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-600' : 'text-gray-800'}`} />
                &nbsp;Dark Mode
              </div>
            </li>
            <li>
              <a 
                href="#" 
                className="flex items-center gap-2 px-5 py-3 text-sm text-gray-800 hover:bg-gray-100 transition-colors"
              >
                <Question weight="bold" className="w-4 h-4 text-gray-800" />
                &nbsp;Help
              </a>
            </li>
            <li className="pt-2">
              <button
                onClick={signOut}
                disabled={isSigningOut}
                className="w-full flex items-center gap-2 px-5 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
              >
                <SignOut weight="bold" className="w-4 h-4 text-red-500" />
                &nbsp;Sign Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}