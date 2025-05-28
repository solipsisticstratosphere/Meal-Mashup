"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useApolloClient } from "@apollo/client";
import Loading from "@/components/ui/Loading";
import { useRecipeStore } from "@/store/recipeStore";

export default function LogoutPage() {
  const router = useRouter();
  const client = useApolloClient();
  const resetZustandStore = useRecipeStore(
    (state) => state.resetStoreToInitial
  );
  useEffect(() => {
    const handleLogout = async () => {
      try {
        resetZustandStore();
        await client.resetStore();
        await signOut({ redirect: false });
        router.push("/");
      } catch (error) {
        console.error("Error during logout:", error);
        router.push("/");
      }
    };

    handleLogout();
  }, [router, client, resetZustandStore]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-gradient-to-b from-rose-50 to-white items-center justify-center">
      <Loading text="Signing out..." size="large" />
    </div>
  );
}
