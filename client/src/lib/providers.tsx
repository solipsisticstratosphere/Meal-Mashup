"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";

const ApolloProviderWrapper = dynamic(() => import("@/lib/apollo-provider"), {
  ssr: false,
});

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return <ApolloProviderWrapper>{children}</ApolloProviderWrapper>;
}
