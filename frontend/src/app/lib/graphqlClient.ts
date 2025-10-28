import { GraphQLClient } from "graphql-request";

export function getGraphQLClient() {
  // On the server side (during SSR), we can't access localStorage
  // The authentication will be handled by cookies via middleware
  // On the client side, we still need the token for direct API calls
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  
  // Use environment variable for GraphQL endpoint, defaulting to localhost for development
  const graphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:3000/graphql";

  return new GraphQLClient(graphqlEndpoint, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
}
