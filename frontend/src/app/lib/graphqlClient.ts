import { GraphQLClient } from "graphql-request";

export function getGraphQLClient() {
  // On the server side (during SSR), we can't access localStorage
  // The authentication will be handled by cookies via middleware
  // On the client side, we still need the token for direct API calls
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return new GraphQLClient("http://localhost:3000/graphql", {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
}
