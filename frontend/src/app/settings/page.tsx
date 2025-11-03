"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getGraphQLClient } from "../lib/graphqlClient";
import { UPDATE_USER } from "../graphql/mutations";
import { useTheme } from "../contexts/ThemeContext"; 
import { useUser } from "../contexts/UserContext";
import { Moon, Sun, Camera, User, Check, X } from "lucide-react";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user, loading, refetchUser } = useUser();
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const client = getGraphQLClient();

  interface UpdateUserResponse {
    updateUser: {
      user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        username: string;
        avatar?: string; // Added avatar field
      } | null;
      errors: string[];
    };
  }

  // Mutation to update user profile (avatar only)
  const updateUserMutation = useMutation<UpdateUserResponse, Error, { firstName?: string; lastName?: string; username?: string; avatar?: string }>({
    mutationFn: async (variables) => {
      return await client.request(UPDATE_USER, variables);
    },
    onSuccess: (data) => {
      // Update user data in localStorage to reflect the changes immediately
      if (data?.updateUser?.user) {
        localStorage.setItem("userData", JSON.stringify(data.updateUser.user));
      }
      // Refetch user data to update the UI with new values
      refetchUser();
    },
    onError: (error) => {
      console.error("Error updating user:", error);
      alert("Failed to update profile. Please try again.");
    },
  });

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

  const handleSaveAvatar = () => {
    if (previewAvatar) {
      // Update the user's avatar in the database
      // In a real application, you would upload the image to a service like AWS S3, Cloudinary, etc.
      // and then save the URL to the database
      updateUserMutation.mutate({
        avatar: previewAvatar
      });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
                    ) : user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="User avatar" 
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
                  {previewAvatar && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-md"
                        onClick={() => setPreviewAvatar(null)}
                        disabled={updateUserMutation.isPending}
                      >
                        <X className="h-3 w-3 text-red-600" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-md"
                        onClick={handleSaveAvatar}
                        disabled={updateUserMutation.isPending}
                      >
                        {updateUserMutation.isPending ? (
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <Check className="h-3 w-3 text-green-600" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="w-full max-w-xs flex flex-col items-center">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {user?.firstName ? `${user.firstName} ${user?.lastName || ''}`.trim() : 'User Name'}
                  </h2>
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