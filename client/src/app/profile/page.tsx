"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useMutation, useQuery } from "@apollo/client";
import { CURRENT_USER, UPDATE_PROFILE, CHANGE_PASSWORD } from "@/lib/graphql";
import { useRouter } from "next/navigation";
import {
  Camera,
  Edit2,
  User,
  Shield,
  Key,
  ArrowLeft,
  Save,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const ProfilePage = () => {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const { data, loading: loadingUser } = useQuery(CURRENT_USER);
  const [updateProfile] = useMutation(UPDATE_PROFILE);
  const [changePassword] = useMutation(CHANGE_PASSWORD);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?returnUrl=/profile");
    }
  }, [status, router]);

  useEffect(() => {
    if (data?.me) {
      setName(data.me.name || "");
      setImageUrl(data.me.image_url || "");
    } else if (session?.user) {
      setName(session.user.name || "");
      setImageUrl(session.user.image || "");
    }
  }, [data, session]);

  useEffect(() => {
    if (newPassword.length === 0) {
      setPasswordStrength(0);
    } else if (newPassword.length < 8) {
      setPasswordStrength(1);
    } else if (/^[a-zA-Z0-9]+$/.test(newPassword)) {
      setPasswordStrength(2);
    } else {
      setPasswordStrength(3);
    }
  }, [newPassword]);

  if (status === "loading") {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (status === "unauthenticated") {
    return null;
  }

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

  // const handleSignOut = async () => {
  //   await signOut({ callbackUrl: "/" });
  // };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-yellow-500";
      case 3:
        return "bg-green-500";
      default:
        return "bg-gray-200";
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 1:
        return "Weak";
      case 2:
        return "Medium";
      case 3:
        return "Strong";
      default:
        return "";
    }
  };

  const toggleCurrentPasswordVisibility = () => {
    setShowCurrentPassword(!showCurrentPassword);
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleToggleKeyDown = (
    e: React.KeyboardEvent,
    field: "current" | "new" | "confirm"
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      if (field === "current") {
        toggleCurrentPasswordVisibility();
      } else if (field === "new") {
        toggleNewPasswordVisibility();
      } else {
        toggleConfirmPasswordVisibility();
      }
    }
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="relative mb-8">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
          My Profile
        </h1>
        {(isEditing || isChangingPassword) && (
          <button
            onClick={() => {
              setIsEditing(false);
              setIsChangingPassword(false);
            }}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amber-600 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 transition-all">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleProfileUpdate}
              className="space-y-8"
            >
              <div className="flex flex-col items-center mb-6">
                <div className="relative group cursor-pointer">
                  {imageUrl ? (
                    <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-amber-200 shadow-md">
                      <Image
                        src={imageUrl || "/placeholder.svg"}
                        alt={name || "User"}
                        className="h-full w-full object-cover"
                      />
                    </div>
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
                  <div className="relative">
                    <input
                      type="text"
                      id="imageUrl"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="block w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="https://example.com/your-image.jpg"
                    />
                    {imageUrl && (
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label="Clear image URL"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
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
                  className="inline-flex justify-center items-center py-3 px-6 border border-transparent rounded-xl shadow-md text-white disabled:opacity-50 transition-all"
                  isLoading={loading}
                >
                  <Save className="h-5 w-5 mr-2" />
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
            </motion.form>
          ) : isChangingPassword ? (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
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
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleCurrentPasswordVisibility}
                    onKeyDown={(e) => handleToggleKeyDown(e, "current")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    aria-label={
                      showCurrentPassword ? "Hide password" : "Show password"
                    }
                    tabIndex={0}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 pr-10"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleNewPasswordVisibility}
                    onKeyDown={(e) => handleToggleKeyDown(e, "new")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    aria-label={
                      showNewPassword ? "Hide password" : "Show password"
                    }
                    tabIndex={0}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs text-gray-500">
                        Password strength:
                      </div>
                      <div
                        className="text-xs font-medium"
                        style={{
                          color:
                            passwordStrength === 1
                              ? "#ef4444"
                              : passwordStrength === 2
                                ? "#eab308"
                                : passwordStrength === 3
                                  ? "#22c55e"
                                  : "#6b7280",
                        }}
                      >
                        {getPasswordStrengthText()}
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getPasswordStrengthColor()} transition-all duration-300 ease-in-out`}
                        style={{ width: `${passwordStrength * 33.33}%` }}
                      ></div>
                    </div>
                    <ul className="mt-2 text-xs text-gray-500 space-y-1">
                      <li
                        className={
                          newPassword.length >= 8 ? "text-green-500" : ""
                        }
                      >
                        • At least 8 characters
                      </li>
                      <li
                        className={
                          /[A-Z]/.test(newPassword) ? "text-green-500" : ""
                        }
                      >
                        • At least one uppercase letter
                      </li>
                      <li
                        className={
                          /[0-9]/.test(newPassword) ? "text-green-500" : ""
                        }
                      >
                        • At least one number
                      </li>
                      <li
                        className={
                          /[^A-Za-z0-9]/.test(newPassword)
                            ? "text-green-500"
                            : ""
                        }
                      >
                        • At least one special character
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`block w-full px-4 py-3 border ${
                      confirmPassword && newPassword !== confirmPassword
                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                    } rounded-xl shadow-sm focus:outline-none focus:ring-2 pr-10`}
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    onKeyDown={(e) => handleToggleKeyDown(e, "confirm")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    tabIndex={0}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    Passwords don&apos;t match
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="submit"
                  className="w-full inline-flex justify-center items-center py-3 px-6 border border-transparent rounded-xl shadow-md text-white disabled:opacity-50 transition-all"
                  isLoading={loading}
                  disabled={
                    Boolean(loading) ||
                    Boolean(confirmPassword && newPassword !== confirmPassword)
                  }
                >
                  <Key className="h-5 w-5 mr-2" />
                  Change Password
                </Button>

                <Button
                  className="w-full"
                  variant="outline"
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <div className="mb-8 relative group">
                {imageUrl ? (
                  <div className="relative h-40 w-40 rounded-full overflow-hidden border-4 border-amber-200 shadow-lg transition-transform duration-300 group-hover:scale-105">
                    <Image
                      src={imageUrl || "/placeholder.svg"}
                      alt={name || "User"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-40 w-40 rounded-full bg-amber-100 flex items-center justify-center border-4 border-amber-200 shadow-lg transition-transform duration-300 group-hover:scale-105">
                    <User className="h-20 w-20 text-amber-500" />
                  </div>
                )}
              </div>

              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {name || "No name set"}
                </h2>
                <p className="text-gray-600 text-lg mb-3">
                  {session?.user?.email}
                </p>
                <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-sm py-1.5 px-4 rounded-full">
                  <Shield className="w-4 h-4" />
                  {session?.user?.role || "User"}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full inline-flex justify-center items-center py-3 px-6 mr-6 border border-transparent rounded-xl shadow-md text-white transition-all"
                >
                  <Edit2 className="h-5 w-5 mr-2" />
                  Edit Profile
                </Button>

                <Button
                  onClick={() => setIsChangingPassword(true)}
                  variant="outline"
                  className="w-full inline-flex justify-center items-center py-3 px-6 border border-gray-300 rounded-xl shadow-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all"
                >
                  <Key className="h-5 w-5 mr-2" />
                  Edit Password
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfilePage;
