"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getGraphQLClient } from "../../lib/graphqlClient";
import { CREATE_COLUMN, CREATE_TASK, REORDER_TASK, REORDER_COLUMN, DELETE_TASK, UPDATE_TASK, DELETE_COLUMN } from "../../graphql/mutations";
import { GET_BOARD } from "../../graphql/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams } from "next/navigation";
import Link from "next/link";
import useAuth from "../../hooks/useAuth";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Plus, Archive, Trash2, GripVertical, CheckCircle, Circle, MoreHorizontal, Edit3, X, Star, Lightbulb, Filter, Search, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";

// Define TypeScript types first
type ChecklistItem = {
  id?: string;
  description: string;
  completed: boolean;
};

type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  labels?: string[];
  checklists?: ChecklistItem[];
  attachments?: string[];
  position: number;
};

type Column = {
  id: string;
  name: string;
  position: number;
  tasks: Task[];
};

type Board = {
  id: string;
  name: string;
  columns: Column[];
};

// Task Component using react-beautiful-dnd
const TaskComponent = ({ 
  task, 
  index, 
  deleteTaskMutation,
  className = ""
}: { 
  task: Task; 
  index: number; 
  deleteTaskMutation: {
    mutate: (variables: { id: string }) => void;
    isPending?: boolean;
  };
  className?: string;
}) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`${snapshot.isDragging ? 'shadow-lg scale-[1.02] z-20' : 'hover:shadow-md'} transition-all duration-150 mb-2 ${className}`}
        >
          <Card className={`p-3 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 ${snapshot.isDragging ? 'opacity-90' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <h4 className="font-medium text-sm truncate">{task.title}</h4>
                </div>
                
                {task.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2 mb-2">{task.description}</p>
                )}
                
                {task.labels && task.labels.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {task.labels.map((label, index) => (
                      <span 
                        key={index} 
                        className="text-xs px-2 py-0.5 rounded-full bg-purple-500 text-white" 
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}
                
                {task.dueDate && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-6 w-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-6 w-6 text-red-500 hover:text-red-700"
                  onClick={() => {
                    deleteTaskMutation.mutate({ id: task.id });
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Draggable>
  );
};

// Column Component using react-beautiful-dnd
const ColumnComponent = ({ 
  column, 
  index,
  newTaskTitle,
  setNewTaskTitle,
  handleCreateTask,
  deleteTaskMutation,
  deleteColumnMutation,
  columnToDelete,
  setColumnToDelete
}: { 
  column: Column; 
  index: number;
  newTaskTitle: { [key: string]: string };
  setNewTaskTitle: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  handleCreateTask: (e: React.FormEvent, columnId: string) => void;
  deleteTaskMutation: {
    mutate: (variables: { id: string }) => void;
    isPending?: boolean;
  };
  deleteColumnMutation: {
    mutate: (variables: { id: string }) => void;
    isPending?: boolean;
  };
  columnToDelete: string | null;
  setColumnToDelete: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  const [showColumnOptions, setShowColumnOptions] = useState(false);

  return (
    <Draggable draggableId={column.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`flex flex-col w-72 ${snapshot.isDragging ? 'scale-[1.02] shadow-lg z-10' : ''} bg-gray-100 dark:bg-gray-800/50 rounded-lg`}
        >
          <div 
            className="flex items-center justify-between p-3 rounded-t-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
            {...provided.dragHandleProps}
          >
            <h3 className="font-semibold text-sm truncate">{column.name}</h3>
            
            <div className="flex gap-1">
              <button 
                className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => setShowColumnOptions(!showColumnOptions)}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              
              {showColumnOptions && (
                <div className="absolute mt-8 bg-white dark:bg-gray-800 shadow-lg rounded-md p-1 z-20 right-3 w-48">
                  <button 
                    className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 flex items-center gap-2"
                    onClick={() => setColumnToDelete(column.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete column
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <Droppable 
            droppableId={column.id.toString()} 
            type="TASK" 
            isDropDisabled={false} 
            isCombineEnabled={false} 
            ignoreContainerClipping={false}
            direction="vertical"
          >
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-1 min-h-[100px] overflow-y-auto p-2 rounded-b-lg ${
                  snapshot.isDraggingOver 
                    ? 'bg-purple-100/50 dark:bg-purple-900/20' 
                    : 'bg-gray-100/50 dark:bg-gray-700/30'
                }`}
              >
                {column.tasks && Array.isArray(column.tasks) ? 
                  column.tasks.map((task, taskIndex) => (
                    <div key={`${task.id}`} className="group">
                      <TaskComponent 
                        task={task} 
                        index={taskIndex}
                        deleteTaskMutation={deleteTaskMutation}
                        className=""
                      />
                    </div>
                  )) 
                : []
                }
                {provided.placeholder}
                
                {/* Add Task Form */}
                <form
                  onSubmit={(e) => handleCreateTask(e, column.id)}
                  className="mt-2 p-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg"
                >
                  <Input
                    placeholder="Enter a title for this card..."
                    value={newTaskTitle[column.id] || ""}
                    onChange={(e) => {
                      setNewTaskTitle(prev => ({
                        ...prev,
                        [column.id]: e.target.value
                      }));
                    }}
                    className="text-sm mb-2"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-8">
                      Add Card
                    </Button>
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="ghost"
                      className="h-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      onClick={() => {
                        setNewTaskTitle(prev => ({
                          ...prev,
                          [column.id]: ""
                        }));
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
};

export default function BoardDetailPage() {
  const { loading: authLoading } = useAuth();
  const params = useParams<{ id: string }>();
  const boardId = params.id as string;

  const [newTaskTitle, setNewTaskTitle] = useState<{ [key: string]: string }>({});
  const [localColumns, setLocalColumns] = useState<Column[]>([]);
  const [newColumnName, setNewColumnName] = useState("");
  const [showAddColumnInput, setShowAddColumnInput] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch board and columns
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["board", boardId],
    queryFn: async () => {
      const client = getGraphQLClient();
      const res = await client.request(GET_BOARD, { id: boardId });
      return res.board as Board;
    },
  });

  // Update local state when data changes
  useEffect(() => {
    if (data?.columns) {
      setLocalColumns(data.columns);
    }
  }, [data]);

  const client = getGraphQLClient();

  // Mutation to create a column
  const createColumnMutation = useMutation({
    mutationFn: async (variables: { name: string; board_id: number }) => {
      return await client.request(CREATE_COLUMN, variables);
    },
    onSuccess: () => {
      // Refetch to update the UI with the new column
      setTimeout(() => refetch(), 100);
    },
    onError: (error) => {
      console.error("Error creating column:", error);
      alert("Failed to create column. Please make sure you are logged in.");
    },
  });

  // Mutation to create a task
  const createTaskMutation = useMutation({
    mutationFn: async (variables: { title: string; column_id: string }) => {
      return await client.request(CREATE_TASK, variables);
    },
    onSuccess: () => {
      // Clear the input fields after successful creation
      setNewTaskTitle(prev => {
        const newTitles = { ...prev };
        // We can't clear specific entries without knowing which column was updated
        // So we'll just refetch which will clear all inputs
        return newTitles;
      });
      // Refetch to update the UI with the new task
      setTimeout(() => refetch(), 100);
    },
    onError: (error) => {
      console.error("Error creating task:", error);
      alert("Failed to create task. Please make sure you are logged in.");
    },
  });

  // Mutation to reorder a task
  const reorderTaskMutation = useMutation({
    mutationFn: async (variables: { task_id: string; new_column_id?: string; new_position: number }) => {
      return await client.request(REORDER_TASK, variables);
    },
    onSuccess: () => {
      // Refetch to sync with server state after a short delay to avoid interference with ongoing drag operations
      setTimeout(() => refetch(), 100);
    },
    onError: (error) => {
      console.error("Error reordering task:", error);
      alert("Failed to move task. Please try again.");
    },
  });

  // Mutation to reorder a column
  const reorderColumnMutation = useMutation({
    mutationFn: async (variables: { column_id: string; new_position: number }) => {
      return await client.request(REORDER_COLUMN, variables);
    },
    onSuccess: () => {
      // Refetch to sync with server state after a short delay to avoid interference with ongoing drag operations
      setTimeout(() => refetch(), 100);
    },
    onError: (error) => {
      console.error("Error reordering column:", error);
      alert("Failed to reorder column. Please try again.");
    },
  });

  // Mutation to delete a task
  const deleteTaskMutation = useMutation({
    mutationFn: async (variables: { id: string }) => {
      return await client.request(DELETE_TASK, variables);
    },
    onSuccess: () => {
      // Refetch to sync with server state after a short delay
      setTimeout(() => refetch(), 100);
    },
    onError: (error) => {
      console.error("Error deleting task:", error);
      alert("Failed to delete task. Please try again.");
    },
  });

  // Mutation to update a task
  const updateTaskMutation = useMutation({
    mutationFn: async (variables: { 
      id: string; 
      title?: string; 
      description?: string; 
      due_date?: string; 
      labels?: string[]; 
      checklists?: ChecklistItem[]; 
      attachments?: string[]; 
      column_id?: string; 
      position?: number 
    }) => {
      return await client.request(UPDATE_TASK, variables);
    },
    onSuccess: () => {
      // Refetch to sync with server state after a short delay
      setTimeout(() => refetch(), 100);
    },
    onError: (error) => {
      console.error("Error updating task:", error);
      alert("Failed to update task. Please try again.");
    },
  });

  // Mutation to delete a column
  const deleteColumnMutation = useMutation({
    mutationFn: async (variables: { id: string }) => {
      return await client.request(DELETE_COLUMN, variables);
    },
    onSuccess: () => {
      // Refetch to sync with server state after a short delay
      setTimeout(() => refetch(), 100);
    },
    onError: (error) => {
      console.error("Error deleting column:", error);
      alert("Failed to delete column. Please try again.");
    },
  });

  if (authLoading) return <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">Loading...</div>;

  const handleCreateTask = (e: React.FormEvent, columnId: string) => {
    e.preventDefault();
    if (!newTaskTitle[columnId]?.trim()) return;
    createTaskMutation.mutate({
      title: newTaskTitle[columnId],
      column_id: columnId,
    });
    
    // Clear the input field after creating the task
    setNewTaskTitle(prev => ({
      ...prev,
      [columnId]: ""
    }));
  };

  // Handle drag and drop with optimistic updates
  const handleOnDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    // If no destination, return
    if (!destination) return;
    
    // If dropped in the same position, do nothing
    if (
      destination.droppableId === source.droppableId && 
      destination.index === source.index
    ) {
      return;
    }

    // Handle column reordering
    if (type === 'COLUMN') {
      // Optimistically update the UI
      const newColumns = Array.from(localColumns);
      const movedColumn = newColumns.find(col => col.id.toString() === draggableId);
      
      if (movedColumn) {
        const [movedItem] = newColumns.splice(source.index, 1);
        newColumns.splice(destination.index, 0, movedItem);
        
        // Update positions in the UI to reflect the new order
        newColumns.forEach((col, idx) => {
          col.position = idx + 1;
        });
        
        setLocalColumns(newColumns);
        
        // Then send the mutation
        reorderColumnMutation.mutate({
          column_id: draggableId,
          new_position: destination.index + 1
        });
      }
      return;
    }

    // Get the source and destination columns to properly handle position updates
    const sourceColumn = localColumns.find(col => col.id.toString() === source.droppableId);
    const destColumn = localColumns.find(col => col.id.toString() === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    // Handle task reordering
    if (source.droppableId === destination.droppableId) {
      // Moving task within the same column - optimistic update
      const newColumns = Array.from(localColumns);
      const sourceColIndex = newColumns.findIndex(col => col.id.toString() === source.droppableId);
      
      if (sourceColIndex !== -1) {
        const newSourceTasks = Array.from(newColumns[sourceColIndex].tasks);
        const [movedTask] = newSourceTasks.splice(source.index, 1);
        newSourceTasks.splice(destination.index, 0, movedTask);
        
        // Update positions in the UI to reflect the new order
        newSourceTasks.forEach((task, idx) => {
          task.position = idx + 1;
        });
        
        newColumns[sourceColIndex].tasks = newSourceTasks;
        setLocalColumns(newColumns);
        
        // Then send the mutation
        reorderTaskMutation.mutate({
          task_id: draggableId,
          new_position: destination.index + 1
        });
      }
    } else {
      // Moving task to a different column - optimistic update
      const newColumns = Array.from(localColumns);
      const sourceColIndex = newColumns.findIndex(col => col.id.toString() === source.droppableId);
      const destColIndex = newColumns.findIndex(col => col.id.toString() === destination.droppableId);
      
      if (sourceColIndex !== -1 && destColIndex !== -1) {
        // Remove task from source column
        const sourceTasks = Array.from(newColumns[sourceColIndex].tasks);
        const [movedTask] = sourceTasks.splice(source.index, 1);
        
        // Update positions in source column
        sourceTasks.forEach((task, idx) => {
          task.position = idx + 1;
        });
        
        newColumns[sourceColIndex].tasks = sourceTasks;
        
        // Add task to destination column
        const destTasks = Array.from(newColumns[destColIndex].tasks);
        destTasks.splice(destination.index, 0, { ...movedTask, position: destination.index + 1 });
        
        // Update positions in destination column
        destTasks.forEach((task, idx) => {
          task.position = idx + 1;
        });
        
        newColumns[destColIndex].tasks = destTasks;
        setLocalColumns(newColumns);
        
        // Then send the mutation
        reorderTaskMutation.mutate({
          task_id: draggableId,
          new_column_id: destination.droppableId,
          new_position: destination.index + 1
        });
      }
    }
  };

  // Filter columns based on search term
  const filteredColumns = searchTerm 
    ? localColumns.map(column => ({
        ...column,
        tasks: column.tasks.filter(task => 
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (task.labels && task.labels.some(label => label.toLowerCase().includes(searchTerm.toLowerCase())))
        )
      }))
    : localColumns;

  if (isLoading) return <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">Loading board...</div>;
  if (error) return <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">Error loading board: {error instanceof Error ? error.message : 'Unknown error'}</div>;
  if (!data) return <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">Board not found</div>;

  const columns = localColumns;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 py-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div>
              <Link href="/boards" className="flex items-center gap-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 text-sm mb-1">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Boards</span>
              </Link>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{data.name}</h1>
                <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                  Private
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Member avatars */}
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium border-2 border-white dark:border-gray-800">
                U
              </div>
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-medium border-2 border-white dark:border-gray-800">
                T
              </div>
            </div>
            
            {/* Action icons */}
            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Star className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Lightbulb className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Filter className="h-4 w-4" />
            </Button>
            
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search..."
                className="pl-8 w-40 h-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button variant="outline" className="border-gray-300 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800">
              Share
            </Button>
          </div>
        </div>

        {/* Board Content */}
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="board" direction="horizontal" type="COLUMN" isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
            {(provided, snapshot) => (
              <div 
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex gap-4 overflow-x-auto pb-4 transition-colors duration-200 p-2 ${
                  snapshot.isDraggingOver 
                    ? 'bg-purple-50/50 dark:bg-purple-900/10 rounded-lg' 
                    : ''
                }`}
              >
                {filteredColumns.map((column, index) => (
                  <div key={column.id.toString()} className="flex-shrink-0">
                    <ColumnComponent 
                      column={column} 
                      index={index}
                      newTaskTitle={newTaskTitle}
                      setNewTaskTitle={setNewTaskTitle}
                      handleCreateTask={handleCreateTask}
                      deleteTaskMutation={deleteTaskMutation}
                      deleteColumnMutation={deleteColumnMutation}
                      columnToDelete={columnToDelete}
                      setColumnToDelete={setColumnToDelete}
                    />
                  </div>
                ))}
                {provided.placeholder}

                {/* Add Column Input - Show input when adding new column */}
                <div className="flex-shrink-0 w-72">
                  {showAddColumnInput ? (
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                      <Input
                        autoFocus
                        placeholder="Enter list title..."
                        value={newColumnName}
                        onChange={(e) => setNewColumnName(e.target.value)}
                        className="text-sm mb-2"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newColumnName.trim() !== "") {
                            createColumnMutation.mutate({ 
                              name: newColumnName.trim(), 
                              board_id: parseInt(boardId as string) 
                            });
                            setNewColumnName("");
                            setShowAddColumnInput(false);
                          } else if (e.key === 'Escape') {
                            setNewColumnName("");
                            setShowAddColumnInput(false);
                          }
                        }}
                      />
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => {
                            if (newColumnName.trim() !== "") {
                              createColumnMutation.mutate({ 
                                name: newColumnName.trim(), 
                                board_id: parseInt(boardId as string) 
                              });
                              setNewColumnName("");
                              setShowAddColumnInput(false);
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white h-8"
                          disabled={!newColumnName.trim()}
                        >
                          Add List
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="h-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          onClick={() => {
                            setNewColumnName("");
                            setShowAddColumnInput(false);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="secondary"
                      className="w-full h-12 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      onClick={() => {
                        setShowAddColumnInput(true);
                        setNewColumnName("");
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add another list
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}