"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useMutation, useQuery } from "@apollo/client";
import { CURRENT_USER, UPDATE_PROFILE, CHANGE_PASSWORD } from "@/lib/graphql";
import { useRouter } from "next/navigation";
import {
  Edit2,
  User,
  Shield,
  Key,
  ArrowLeft,
  Save,
  X,
  Eye,
  EyeOff,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import AvatarUploader from "@/components/ui/AvatarUploader";
import Loading from "@/components/ui/Loading";

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

  const { data, loading: loadingUser, refetch } = useQuery(CURRENT_USER);
  const [updateProfile] = useMutation(UPDATE_PROFILE);
  const [changePassword] = useMutation(CHANGE_PASSWORD);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?returnUrl=/profile");
    }
  }, [status, router]);

  const getCurrentImageUrl = () => {
    if (data?.me?.image_url) return data.me.image_url;
    if (imageUrl) return imageUrl;
    if (session?.user?.image) return session.user.image;
    return "";
  };

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
    return (
      <div className="p-8 text-center">
        <Loading />
      </div>
    );
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

        await refetch();
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

  const handleImageUploaded = async (url: string) => {
    console.log("Image uploaded:", url);
    setImageUrl(url);

    try {
      const response = await updateProfile({
        variables: {
          name,
          image_url: url,
        },
      });

      if (response.data?.updateProfile) {
        await updateSession({
          ...session,
          user: {
            ...session?.user,
            image: url,
          },
        });

        await refetch();
        toast.success("Profile image updated successfully!");
      }
    } catch (err) {
      console.error("Failed to update profile with new image:", err);
      toast.error("Failed to update profile image");

      setImageUrl(data?.me?.image_url || session?.user?.image || "");
    }
  };

  const handleImageDeleted = async () => {
    console.log("Image deleted");

    setImageUrl("");

    try {
      const response = await updateProfile({
        variables: {
          name,
          image_url: "",
        },
      });

      if (response.data?.updateProfile) {
        await updateSession({
          ...session,
          user: {
            ...session?.user,
            image: "",
          },
        });

        await refetch();
        toast.success("Profile image removed successfully!");
      }
    } catch (err) {
      console.error("Failed to update profile after image deletion:", err);
      toast.error("Failed to remove profile image");

      setImageUrl(data?.me?.image_url || session?.user?.image || "");
    }
  };

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
      <div className="min-h-screen  flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-500 mb-6 mx-auto"></div>
          <p className="text-gray-600 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const currentImageUrl = getCurrentImageUrl();

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="relative mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent mb-2">
              My Profile
            </h1>
            <p className="text-gray-600 text-lg">
              Manage your account settings and preferences
            </p>
          </motion.div>

          {(isEditing || isChangingPassword) && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => {
                setIsEditing(false);
                setIsChangingPassword(false);
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white shadow-lg text-gray-500 hover:text-amber-600 hover:shadow-xl transition-all duration-300"
              aria-label="Go back"
            >
              <ArrowLeft className="h-6 w-6" />
            </motion.button>
          )}
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
        >
          <div className="p-8 md:p-12">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.form
                  key="editing"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleProfileUpdate}
                  className="space-y-8"
                >
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center mb-8">
                    <div className="relative">
                      {session?.user?.id && (
                        <AvatarUploader
                          key={currentImageUrl}
                          userId={session.user.id}
                          currentImageUrl={currentImageUrl}
                          onImageUploaded={handleImageUploaded}
                          onImageDeleted={handleImageDeleted}
                        />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-4 text-center max-w-md">
                      Click on your avatar to upload a new profile picture
                    </p>
                  </div>

                  {/* Name Field */}
                  <div className="max-w-md mx-auto">
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-gray-700 mb-3"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300"
                        placeholder="Enter your full name"
                      />
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6 max-w-md mx-auto">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 inline-flex justify-center items-center py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
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
                      className="flex-1 py-4 px-6 border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 transition-all duration-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.form>
              ) : isChangingPassword ? (
                <motion.form
                  key="password"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handlePasswordChange}
                  className="space-y-6 max-w-md mx-auto"
                >
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Key className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Change Password
                    </h2>
                    <p className="text-gray-600 mt-2">
                      Update your account password
                    </p>
                  </div>

                  {/* Current Password */}
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-semibold text-gray-700 mb-3"
                    >
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        id="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="block w-full px-4 py-4 border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/50 backdrop-blur-sm pr-12 transition-all duration-300"
                        required
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={toggleCurrentPasswordVisibility}
                        onKeyDown={(e) => handleToggleKeyDown(e, "current")}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label={
                          showCurrentPassword
                            ? "Hide password"
                            : "Show password"
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

                  {/* New Password */}
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-semibold text-gray-700 mb-3"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="block w-full px-4 py-4 border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/50 backdrop-blur-sm pr-12 transition-all duration-300"
                        minLength={8}
                        required
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={toggleNewPasswordVisibility}
                        onKeyDown={(e) => handleToggleKeyDown(e, "new")}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
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

                    {/* Password Strength Indicator */}
                    {newPassword && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">
                            Password strength:
                          </span>
                          <span
                            className="text-sm font-semibold"
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
                          </span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getPasswordStrengthColor()} transition-all duration-500 ease-out`}
                            style={{ width: `${passwordStrength * 33.33}%` }}
                          ></div>
                        </div>
                        <ul className="mt-3 text-xs text-gray-600 space-y-1">
                          <li
                            className={`flex items-center gap-2 ${newPassword.length >= 8 ? "text-green-600" : ""}`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                newPassword.length >= 8
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            />
                            At least 8 characters
                          </li>
                          <li
                            className={`flex items-center gap-2 ${/[A-Z]/.test(newPassword) ? "text-green-600" : ""}`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                /[A-Z]/.test(newPassword)
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            />
                            At least one uppercase letter
                          </li>
                          <li
                            className={`flex items-center gap-2 ${/[0-9]/.test(newPassword) ? "text-green-600" : ""}`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                /[0-9]/.test(newPassword)
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            />
                            At least one number
                          </li>
                          <li
                            className={`flex items-center gap-2 ${
                              /[^A-Za-z0-9]/.test(newPassword)
                                ? "text-green-600"
                                : ""
                            }`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                /[^A-Za-z0-9]/.test(newPassword)
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            />
                            At least one special character
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-semibold text-gray-700 mb-3"
                    >
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`block w-full px-4 py-4 border ${
                          confirmPassword && newPassword !== confirmPassword
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-200 focus:ring-amber-500 focus:border-transparent"
                        } rounded-2xl shadow-sm focus:outline-none focus:ring-2 bg-white/50 backdrop-blur-sm pr-12 transition-all duration-300`}
                        minLength={8}
                        required
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        onKeyDown={(e) => handleToggleKeyDown(e, "confirm")}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
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
                      <p className="mt-2 text-sm text-red-500 flex items-center gap-2">
                        <X className="h-4 w-4" />
                        Passwords don&apos;t match
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      type="submit"
                      className="flex-1 inline-flex justify-center items-center py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                      isLoading={loading}
                      disabled={
                        Boolean(loading) ||
                        Boolean(
                          confirmPassword && newPassword !== confirmPassword
                        )
                      }
                    >
                      <Key className="h-5 w-5 mr-2" />
                      Edit Password
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setIsChangingPassword(false)}
                      disabled={loading}
                      className="flex-1 py-4 px-6 border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 transition-all duration-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  {/* Avatar Section */}
                  <div className="mb-8 relative group">
                    {session?.user?.id ? (
                      <AvatarUploader
                        key={currentImageUrl}
                        userId={session.user.id}
                        currentImageUrl={currentImageUrl}
                        onImageUploaded={handleImageUploaded}
                        onImageDeleted={handleImageDeleted}
                      />
                    ) : (
                      <div className="h-40 w-40 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center border-4 border-white shadow-2xl transition-transform duration-300 group-hover:scale-105 mx-auto">
                        <User className="h-20 w-20 text-amber-500" />
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="mb-10">
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">
                      {name || "No name set"}
                    </h2>

                    <div className="flex items-center justify-center gap-2 text-gray-600 text-lg mb-4">
                      <Mail className="w-5 h-5" />
                      {session?.user?.email}
                    </div>

                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-sm font-semibold py-2 px-6 rounded-full border border-amber-200">
                      <Shield className="w-4 h-4" />
                      {session?.user?.role || "User"}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="w-full inline-flex justify-center items-center py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Edit2 className="h-5 w-5 mr-2" />
                      Edit Profile
                    </Button>
                    <Button
                      onClick={() => setIsChangingPassword(true)}
                      variant="outline"
                      className="w-full inline-flex justify-center items-center py-4 px-6 border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
                    >
                      <Key className="h-5 w-5 mr-2" />
                      Edit Password
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
