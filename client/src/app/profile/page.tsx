"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useMutation, useQuery } from "@apollo/client";
import { CURRENT_USER, UPDATE_PROFILE } from "@/lib/graphql";
import { useRouter } from "next/navigation";
import { Camera, Edit2, LogOut, User } from "lucide-react";

const ProfilePage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { data, loading: loadingUser } = useQuery(CURRENT_USER);
  const [updateProfile] = useMutation(UPDATE_PROFILE);

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
    setError("");
    setSuccess("");

    try {
      const { data } = await updateProfile({
        variables: {
          name,
          image_url: imageUrl,
        },
      });

      if (data?.updateProfile) {
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
      } else {
        setError("Failed to update profile. Please try again.");
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  if (loadingUser) {
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

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {error && (
          <div className="p-5 mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 mx-6 mt-6 rounded-lg">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-5 mb-4 bg-amber-50 border-l-4 border-amber-500 text-amber-700 mx-6 mt-6 rounded-lg">
            <p className="font-medium">{success}</p>
          </div>
        )}

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
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center items-center py-3 px-6 border border-transparent rounded-xl shadow-md text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 transition-all"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="inline-flex justify-center items-center py-3 px-6 border border-gray-300 rounded-xl shadow-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all"
                >
                  Cancel
                </button>
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
                <div className="mt-2 inline-block bg-amber-100 text-amber-800 text-sm py-1 px-3 rounded-full">
                  {session?.user?.role || "User"}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex justify-center items-center py-3 px-6 border border-transparent rounded-xl shadow-md text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all"
                >
                  <Edit2 className="h-5 w-5 mr-2" />
                  Edit Profile
                </button>

                <button
                  onClick={handleSignOut}
                  className="inline-flex justify-center items-center py-3 px-6 border border-gray-300 rounded-xl shadow-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
