import { GraphQLClient } from "graphql-request";

// Cache to store the client instance to avoid creating multiple instances
let cachedClient: GraphQLClient | null = null;
let cachedToken: string | null = null;

// Create a simple in-memory cache for query results
const queryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export function getGraphQLClient() {
  // On the server side (during SSR), we can't access localStorage
  // The authentication will be handled by cookies via middleware
  // On the client side, we still need the token for direct API calls
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Server-side needs absolute URL, client-side can use relative URL for Next.js rewrites
  const isServer = typeof window === "undefined";
  const graphqlEndpoint = isServer
    ? process.env.GRAPHQL_ENDPOINT || "http://localhost:8080/graphql"
    : process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "/graphql";

  // Return cached client if token hasn't changed
  if (cachedClient && cachedToken === token) {
    return cachedClient;
  }

  // Update cached token
  cachedToken = token;

  // Create new client instance
  cachedClient = new GraphQLClient(graphqlEndpoint, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  return cachedClient;
}

// Higher-order function to wrap GraphQL queries with caching
export async function executeGraphQLQuery<T>(query: string, variables?: any): Promise<T> {
  const client = getGraphQLClient();

  // Create a unique cache key based on query and variables
  const cacheKey = `${query}_${JSON.stringify(variables || {})}`;
  const cachedResult = queryCache.get(cacheKey);

  // Check if we have a cached result and it's not expired
  if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
    return cachedResult.data as T;
  }

  // Execute the query and cache the result
  const result = await client.request(query, variables);

  // Store in cache
  queryCache.set(cacheKey, { data: result, timestamp: Date.now() });

  return result as T;
}

// Function to clear the query cache
export function clearQueryCache() {
  queryCache.clear();
}

// Function to manually set cache for a specific query
export function setQueryCache(key: string, data: any) {
  queryCache.set(key, { data, timestamp: Date.now() });
}

// Function to get cached data for a specific query
export function getQueryCache(key: string) {
  const cachedResult = queryCache.get(key);
  if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
    return cachedResult.data;
  }
  return null;
}
