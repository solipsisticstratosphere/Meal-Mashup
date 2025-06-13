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
  keyArgs: ["difficulty", "maxPrepTime", "minRating", "ingredients"],
  merge(existing = [], incoming, { args }) {
    const merged = existing ? existing.slice(0) : [];
    if (incoming) {
      if (args?.offset) {
        merged.splice(args.offset, incoming.length, ...incoming);
      } else {
        return incoming;
      }
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
