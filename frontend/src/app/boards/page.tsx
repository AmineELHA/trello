"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getGraphQLClient } from "../lib/graphqlClient";
import { GET_BOARDS } from "../graphql/queries";
import { CREATE_BOARD } from "../graphql/mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import useAuth from "../hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Plus, LayoutDashboard, MoreHorizontal, Grid3X3, Calendar, Search } from "lucide-react";

export default function BoardsPage() {
  const { loading: authLoading, user } = useAuth();
  const [boardName, setBoardName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  interface BoardResponse {
    boards: {
      id: string;
      name: string;
    }[];
  }

  // Fetch all boards
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["boards"],
    queryFn: async () => {
      const client = getGraphQLClient();
      const res = await client.request<BoardResponse>(GET_BOARDS);
      return res.boards;
    },
    enabled: !authLoading && !!user, // Only run the query when authenticated and auth is loaded
  });

  const client = getGraphQLClient();

  // Mutation to create a board
  const createBoardMutation = useMutation({
    mutationFn: async (variables: { name: string }) => {
      return await client.request(CREATE_BOARD, variables);
    },
    onSuccess: () => {
      setBoardName("");
      refetch();
    },
    onError: (error) => {
      console.error("Error creating board:", error);
      alert("Failed to create board. Please make sure you are logged in.");
    },
  });

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your boards...</p>
      </div>
    </div>
  );

  if (!user) return (
    <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
      You must be logged in to view this page.
    </div>
  );

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardName.trim()) return;
    createBoardMutation.mutate({ name: boardName });
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your boards...</p>
      </div>
    </div>
  );

  // Define TypeScript type
  type Board = {
    id: string;
    name: string;
  };

  // Filter boards based on search term
  const filteredBoards = data && data.length > 0 
    ? data.filter((board: Board) => 
        !searchTerm || 
        board.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Your Boards</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {filteredBoards.length || 0} {filteredBoards.length === 1 ? 'board' : 'boards'} • Manage your projects in one place
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                ← Back to Home
              </Button>
            </Link>
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search boards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-64"
              />
            </div>
          </div>
        </div>

        {/* Create Board Section */}
        <div className="mb-10 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Create New Board</h2>
          <form onSubmit={handleCreateBoard} className="max-w-2xl">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Enter board name..."
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  className="h-12 text-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <Button 
                type="submit" 
                disabled={createBoardMutation.isPending}
                className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {createBoardMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 mr-2 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" /> Create
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Boards Grid */}
        {filteredBoards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredBoards.map((board: Board) => (
              <Link key={board.id} href={`/boards/${board.id}`}>
                <Card className="group relative h-40 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between p-5 cursor-pointer hover:-translate-y-1">
                  <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                      <Grid3X3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {board.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Click to view board
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-6">
              <LayoutDashboard className="h-12 w-12 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'No boards found' : 'No boards yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-6">
              {searchTerm 
                ? `No boards match "${searchTerm}". Try a different search term.`
                : 'Get started by creating your first board. Organize tasks, track progress, and collaborate with your team.'
              }
            </p>
            {searchTerm ? (
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm("")}
                className="border-gray-300 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
              >
                Clear Search
              </Button>
            ) : (
              <div className="flex justify-center gap-3">
                <Link href="/boards">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Create Your First Board
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}