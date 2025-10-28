"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "../contexts/ThemeContext"; 
import { useUser } from "../contexts/UserContext";
import { Moon, Sun, Camera, User, Check, X } from "lucide-react";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user, loading, refetchUser } = useUser();
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>(user?.firstName ? `${user.firstName} ${user?.lastName || ''}`.trim() : '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSaveName = () => {
    // In a real application, you would update the name via an API call
    // For now, just update the local state
    setIsEditingName(false);
  };

  const handleCancelNameEdit = () => {
    setNewName(user?.firstName ? `${user.firstName} ${user?.lastName || ''}`.trim() : '');
    setIsEditingName(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your profile and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 dark:text-white">Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-600 border-4 border-white dark:border-gray-700 overflow-hidden">
                    {previewAvatar ? (
                      <img 
                        src={previewAvatar} 
                        alt="Avatar preview" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                        <User className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-md"
                    onClick={triggerFileInput}
                  >
                    <Camera className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </div>

                <div className="w-full max-w-xs">
                  {isEditingName ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 text-center"
                        autoFocus
                      />
                      <Button
                        size="icon"
                        className="h-9 w-9"
                        onClick={handleSaveName}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={handleCancelNameEdit}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {user?.firstName ? `${user.firstName} ${user?.lastName || ''}`.trim() : 'User Name'}
                      </h2>
                      <Button
                        variant="ghost"
                        className="text-sm text-gray-500 dark:text-gray-400 mt-1 p-0 h-auto"
                        onClick={() => {
                          setIsEditingName(true);
                          setNewName(user?.firstName ? `${user.firstName} ${user?.lastName || ''}`.trim() : '');
                        }}
                      >
                        Edit name
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Section */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 dark:text-white">Appearance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700 dark:text-gray-300">
                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleTheme}
                  className="h-8 w-8"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}