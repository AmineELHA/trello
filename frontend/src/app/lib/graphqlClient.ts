import { GraphQLClient } from "graphql-request";

export function getGraphQLClient() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Log if token is missing for debugging
  if (typeof window !== "undefined" && !token) {
    console.warn("No authentication token found in localStorage");
  }

  return new GraphQLClient("http://localhost:3000/graphql", {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
}
