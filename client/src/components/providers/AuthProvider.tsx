"use client";

import { SessionProvider } from "next-auth/react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { User } from "next-auth";

// Define the user context type
interface AuthContextType {
  user:
    | (User & {
        id: string;
        role: string;
      })
    | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

// Create a hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Create the auth user provider component
const AuthUserProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<
    (User & { id: string; role: string }) | null
  >(null);
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  useEffect(() => {
    if (session?.user) {
      setUser(session.user as User & { id: string; role: string });
    } else {
      setUser(null);
    }
  }, [session]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Main AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  return (
    <SessionProvider>
      <AuthUserProvider>{children}</AuthUserProvider>
    </SessionProvider>
  );
};

export default AuthProvider;
