import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  FieldPolicy,
} from "@apollo/client";

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "/api/graphql",
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const popularRecipesMerge: FieldPolicy<any[], any[]> = {
  keyArgs: false,
  merge(existing = [], incoming) {
    const merged = existing ? existing.slice(0) : [];

    if (incoming) {
      return [...merged, ...incoming];
    }

    return merged;
  },
};

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        popularRecipes: popularRecipesMerge,
      },
    },
  },
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
});
