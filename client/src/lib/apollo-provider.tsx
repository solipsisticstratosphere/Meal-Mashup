"use client";

import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "./apollo-client";
import { ReactNode } from "react";

interface ApolloProviderWrapperProps {
  children: ReactNode;
}

export default function ApolloProviderWrapper({
  children,
}: ApolloProviderWrapperProps) {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
