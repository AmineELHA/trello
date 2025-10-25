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
import { Plus, LayoutDashboard, MoreHorizontal, Grid3X3 } from "lucide-react";
import UserProfileDropdown from "@/components/ui/user-profile-dropdown";

export default function BoardsPage() {
  const { loading: authLoading } = useAuth();
  const [boardName, setBoardName] = useState("");

  // Fetch all boards
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["boards"],
    queryFn: async () => {
      const res = await client.request(GET_BOARDS);
      return res.boards;
    },
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
    <div className="min-h-screen flex items-center justify-center bg-muted/20">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading your boards...</p>
      </div>
    </div>
  );

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardName.trim()) return;
    createBoardMutation.mutate({ name: boardName });
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading your boards...</p>
      </div>
    </div>
  );

  // Define TypeScript type
  type Board = {
    id: string;
    name: string;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Boards</h1>
            <p className="text-muted-foreground mt-1">
              {data?.length || 0} {data?.length === 1 ? 'board' : 'boards'} • Manage your projects in one place
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline">
                ← Back to Home
              </Button>
            </Link>
            <Link href="/boards">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New Board
              </Button>
            </Link>
            <UserProfileDropdown />
          </div>
        </div>

        {/* Create Board Section */}
        <div className="mb-10">
          <form onSubmit={handleCreateBoard} className="max-w-2xl">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Enter board name..."
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  className="h-12 text-lg"
                />
              </div>
              <Button 
                type="submit" 
                disabled={createBoardMutation.isPending}
                className="h-12 px-6"
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
        {data && data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {data.map((board: Board) => (
              <Link key={board.id} href={`/boards/${board.id}`}>
                <Card className="group relative h-40 bg-gradient-to-br from-primary/5 to-secondary/50 border border-border hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between p-5 cursor-pointer hover:-translate-y-1">
                  <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Grid3X3 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {board.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Click to view board
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/30">
                    <span className="text-xs text-muted-foreground">
                      {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex -space-x-2">
                      <div className="h-6 w-6 rounded-full bg-primary/20 border-2 border-background"></div>
                      <div className="h-6 w-6 rounded-full bg-secondary/50 border-2 border-background"></div>
                      <div className="h-6 w-6 rounded-full bg-muted-foreground/20 border-2 border-background"></div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
              <LayoutDashboard className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">No boards yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Get started by creating your first board. Organize tasks, track progress, and collaborate with your team.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/boards">
                <Button size="lg">
                  <Plus className="mr-2 h-4 w-4" /> Create Your First Board
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}