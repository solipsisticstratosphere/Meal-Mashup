import { useSession, signIn, signOut } from "next-auth/react";

export { useSession, signIn, signOut };

export const useIsAuthenticated = () => {
  const { data: session } = useSession();
  return !!session;
};

export const useHasRole = (role: string) => {
  const { data: session } = useSession();
  return session?.user?.role === role;
};

export const useCurrentUser = () => {
  const { data: session } = useSession();
  return session?.user;
};
