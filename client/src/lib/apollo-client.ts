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
  merge(existing = [], incoming, { args }) {
    if (args?.offset === 0) {
      return incoming || [];
    }

    if (incoming) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existingIds = new Set((existing || []).map((item: any) => item.id));
      const uniqueIncoming = incoming.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item: any) => !existingIds.has(item.id)
      );

      return [...(existing || []), ...uniqueIncoming];
    }

    return existing || [];
  },
};

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        popularRecipes: popularRecipesMerge,
      },
    },
    Recipe: {
      keyFields: ["id"],
    },
  },
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
    },
    query: {
      fetchPolicy: "cache-first",
    },
  },
});
