import { GraphQLClient } from "graphql-request";

export function getGraphQLClient() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return new GraphQLClient("http://localhost:3000/graphql", {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
}
