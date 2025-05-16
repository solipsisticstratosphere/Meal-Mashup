"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useMutation, useQuery } from "@apollo/client";
import { CURRENT_USER, UPDATE_PROFILE, CHANGE_PASSWORD } from "@/lib/graphql";
import { useRouter } from "next/navigation";
import { Camera, Edit2, LogOut, User, Shield, Key } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";

const ProfilePage = () => {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const { data, loading: loadingUser } = useQuery(CURRENT_USER);
  const [updateProfile] = useMutation(UPDATE_PROFILE);
  const [changePassword] = useMutation(CHANGE_PASSWORD);

  useEffect(() => {
    if (data?.me) {
      setName(data.me.name || "");
      setImageUrl(data.me.image_url || "");
    } else if (session?.user) {
      setName(session.user.name || "");
      setImageUrl(session.user.image || "");
    }
  }, [data, session]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await updateProfile({
        variables: {
          name,
          image_url: imageUrl,
        },
      });

      if (response.data?.updateProfile) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);

        await updateSession({
          ...session,
          user: {
            ...session?.user,
            name: response.data.updateProfile.name,
            image: response.data.updateProfile.image_url,
          },
        });
      } else {
        toast.error(
          response.errors?.[0]?.message ||
            "Failed to update profile. Please try again."
        );
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    setLoading(true);
    try {
      const { data: changePassData } = await changePassword({
        variables: {
          currentPassword,
          newPassword,
        },
      });

      if (changePassData?.changePassword?.success) {
        toast.success("Password changed successfully!");
        setIsChangingPassword(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        await signOut({ redirect: false });
        router.push(
          "/auth/login?message=Password changed successfully! Please log in again."
        );
      } else {
        toast.error(
          changePassData?.changePassword?.message || "Failed to change password"
        );
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  if (loadingUser && !data) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-500 mb-6"></div>
        <p className="text-gray-600 text-lg ml-4">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
        My Profile
      </h1>

      <div className="p-8">
        {isEditing ? (
          <form onSubmit={handleProfileUpdate} className="space-y-8">
            <div className="flex flex-col items-center mb-6">
              <div className="relative group">
                {imageUrl ? (
                  <img
                    src={imageUrl || "/placeholder.svg"}
                    alt={name || "User"}
                    className="h-32 w-32 rounded-full object-cover border-4 border-amber-200 shadow-md"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-amber-100 flex items-center justify-center border-4 border-amber-200 shadow-md">
                    <User className="h-16 w-16 text-amber-500" />
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="h-8 w-8 text-white" />
                </div>
              </div>

              <div className="mt-6 w-full max-w-md">
                <label
                  htmlFor="imageUrl"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Profile Image URL
                </label>
                <input
                  type="text"
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="https://example.com/your-image.jpg"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Your name"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center items-center py-3 px-6 border border-transparent rounded-xl shadow-md text-white  disabled:opacity-50 transition-all"
                isLoading={loading}
              >
                Save Changes
              </Button>

              <Button
                variant="outline"
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : isChangingPassword ? (
          <form
            onSubmit={handlePasswordChange}
            className="space-y-6 max-w-md mx-auto"
          >
            <h2 className="text-xl font-bold text-center mb-6">
              Change Password
            </h2>

            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                minLength={8}
                required
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                minLength={8}
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="submit"
                className="inline-flex justify-center items-center py-3 px-6 border border-transparent rounded-xl shadow-md text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 transition-all"
                isLoading={loading}
                disabled={loading}
              >
                <Key className="h-5 w-5 mr-2" />
                Change Password
              </Button>

              <Button
                variant="outline"
                type="button"
                onClick={() => setIsChangingPassword(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center">
            <div className="mb-8">
              {imageUrl ? (
                <img
                  src={imageUrl || "/placeholder.svg"}
                  alt={name || "User"}
                  className="h-40 w-40 rounded-full object-cover border-4 border-amber-200 shadow-lg"
                />
              ) : (
                <div className="h-40 w-40 rounded-full bg-amber-100 flex items-center justify-center border-4 border-amber-200 shadow-lg">
                  <User className="h-20 w-20 text-amber-500" />
                </div>
              )}
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {name || "No name set"}
              </h2>
              <p className="text-gray-600 text-lg">{session?.user?.email}</p>
              <div className="mt-2 inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-sm py-1 px-3 rounded-full">
                <Shield className="w-4 h-4" />
                {session?.user?.role || "User"}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
              <Button
                onClick={() => setIsEditing(true)}
                className="inline-flex justify-center items-center py-3 px-6 border border-transparent rounded-xl shadow-md text-white  transition-all"
              >
                <Edit2 className="h-5 w-5 mr-2" />
                Edit Profile
              </Button>

              <Button
                onClick={() => setIsChangingPassword(true)}
                variant="outline"
                className="inline-flex justify-center items-center py-3 px-6 border border-gray-300 rounded-xl shadow-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all"
              >
                <Key className="h-5 w-5 mr-2" />
                Change Password
              </Button>
            </div>

            <div className="mt-4">
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="inline-flex justify-center items-center py-3 px-6 border border-gray-300 rounded-xl shadow-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 w-full max-w-md text-center">
              <h3 className="font-medium text-gray-700 mb-2">Your Content</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={() => router.push("/my-recipes")}
                  variant="outline"
                  className="w-full"
                >
                  My Recipes
                </Button>
                <Button
                  onClick={() => router.push("/saved-recipes")}
                  variant="outline"
                  className="w-full"
                >
                  Saved Recipes
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
