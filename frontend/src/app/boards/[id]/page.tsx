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
import { Plus, Archive, Trash2, GripVertical, CheckCircle, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";
import UserProfileDropdown from "@/components/ui/user-profile-dropdown";

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
  color?: string;
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
          <Card className={`p-3 bg-card ${snapshot.isDragging ? 'opacity-90' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="cursor-grab active:cursor-grabbing">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h4 className="font-medium text-sm truncate">{task.title}</h4>
                </div>
                
                {task.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                )}
                
                {task.labels && task.labels.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {task.labels.map((label, index) => (
                      <span key={index} className="bg-secondary text-xs px-2 py-0.5 rounded">
                        {label}
                      </span>
                    ))}
                  </div>
                )}
                
                {task.dueDate && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-6 w-6"
                  onClick={() => {
                    // Implement edit functionality
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
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
  setColumnToDelete,
  columnColors,
  setColumnColors
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
  columnColors: {[key: string]: string};
  setColumnColors: React.Dispatch<React.SetStateAction<{[key: string]: string}>>;
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const availableColors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];

  const handleColorSelect = (color: string) => {
    setColumnColors(prev => ({
      ...prev,
      [column.id]: color
    }));
    setShowColorPicker(false);
  };

  return (
    <Draggable draggableId={column.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`flex flex-col w-72 ${snapshot.isDragging ? 'scale-[1.02] shadow-lg z-10' : ''}`}
        >
          <div 
            className={`flex items-center justify-between p-3 rounded-t-lg ${column.color || 'bg-secondary'}`} 
            style={{ backgroundColor: columnColors[column.id] || undefined }}
            {...provided.dragHandleProps}
          >
            <h3 className="font-semibold text-sm">{column.name}</h3>
            <div className="flex gap-1">
              <button 
                className="p-1 rounded hover:bg-accent"
                onClick={() => setShowColorPicker(!showColorPicker)}
                title="Change color"
              >
                <div className="w-4 h-4 rounded-full bg-current" style={{ backgroundColor: columnColors[column.id] || '#f3f4f6' }}></div>
              </button>
              {columnToDelete === column.id ? (
                <div className="flex gap-1">
                  <button 
                    className="p-1 rounded hover:bg-red-600 hover:text-white"
                    onClick={() => {
                      deleteColumnMutation.mutate({ id: column.id });
                      setColumnToDelete(null);
                    }}
                    title="Confirm delete"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                  <button 
                    className="p-1 rounded hover:bg-gray-200"
                    onClick={() => setColumnToDelete(null)}
                    title="Cancel delete"
                  >
                    <Circle className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button 
                  className="p-1 rounded hover:bg-red-100 hover:text-red-600"
                  onClick={() => setColumnToDelete(column.id)}
                  title="Delete column"
                >
                  <Trash2 className="h-4 w-4 text-white" />
                </button>
              )}
            </div>
          </div>
          
          {/* Color Picker Dropdown */}
          {showColorPicker && (
            <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg p-2 border">
              <div className="grid grid-cols-4 gap-2">
                {availableColors.map((color, idx) => (
                  <button
                    key={idx}
                    className={`w-8 h-8 rounded-full ${color} hover:opacity-90 transition-opacity`}
                    onClick={() => handleColorSelect(color.replace('bg-', ''))}
                    title={color.replace('bg-', '')}
                  />
                ))}
              </div>
              <button
                className="mt-2 w-full text-xs text-center text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setColumnColors(prev => {
                    const newColors = {...prev};
                    delete newColors[column.id];
                    return newColors;
                  });
                  setShowColorPicker(false);
                }}
              >
                Remove Color
              </button>
            </div>
          )}
          
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
                className={`flex-1 min-h-[100px] bg-secondary/50 rounded-b-lg p-2 transition-colors duration-200 ${
                  snapshot.isDraggingOver 
                    ? 'bg-primary/20 border-2 border-dashed border-primary/50' 
                    : 'bg-secondary/50'
                }`}
              >
                {column.tasks && Array.isArray(column.tasks) ? 
                  column.tasks.map((task, taskIndex) => (
                    <TaskComponent 
                      key={`${task.id}`} 
                      task={task} 
                      index={taskIndex}
                      deleteTaskMutation={deleteTaskMutation}
                      className=""
                    />
                  )) 
                : []
                }
                {provided.placeholder}
                
                {/* Add Task Form */}
                <form
                  onSubmit={(e) => handleCreateTask(e, column.id)}
                  className="mt-2"
                >
                  <Input
                    placeholder="Add a task..."
                    value={newTaskTitle[column.id] || ""}
                    onChange={(e) => {
                      setNewTaskTitle(prev => ({
                        ...prev,
                        [column.id]: e.target.value
                      }));
                    }}
                    className="text-sm"
                  />
                  <div className="flex gap-2 mt-2">
                    <Button type="submit" size="sm" className="w-full">
                      Add Task
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
  const [columnColors, setColumnColors] = useState<{[key: string]: string}>({});

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
      // Preserve column colors when updating columns
      const updatedColumns = data.columns.map(col => {
        // If the column had a custom color, preserve it
        if (columnColors[col.id]) {
          return { ...col, color: columnColors[col.id] };
        }
        return col;
      });
      setLocalColumns(updatedColumns);
    }
  }, [data, columnColors]);

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

  if (authLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;



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

  // Use local state to manage the board data and avoid re-renders during drag
  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading board...</div>;
  if (error) return <div className="flex justify-center items-center h-screen">Error loading board: {error instanceof Error ? error.message : 'Unknown error'}</div>;
  if (!data) return <div className="flex justify-center items-center h-screen">Board not found</div>;

  const columns = localColumns;

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
      const newColumns = Array.from(columns);
      const movedColumn = newColumns.find(col => col.id.toString() === draggableId);
      
      if (movedColumn) {
        const [movedItem] = newColumns.splice(source.index, 1);
        newColumns.splice(destination.index, 0, movedItem);
        
        // Update positions in the UI to reflect the new order
        newColumns.forEach((col, idx) => {
          col.position = idx + 1;
        });
        
        setLocalColumns(newColumns);
        
        // Preserve column colors after reordering
        // Create a new mapping based on the new column order
        const newColumnColors: {[key: string]: string} = {};
        newColumns.forEach(col => {
          if (columnColors[col.id]) {
            newColumnColors[col.id] = columnColors[col.id];
          }
        });
        setColumnColors(newColumnColors);
        
        // Then send the mutation
        reorderColumnMutation.mutate({
          column_id: draggableId,
          new_position: destination.index + 1
        });
      }
      return;
    }

    // Get the source and destination columns to properly handle position updates
    const sourceColumn = columns.find(col => col.id.toString() === source.droppableId);
    const destColumn = columns.find(col => col.id.toString() === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    // Handle task reordering
    if (source.droppableId === destination.droppableId) {
      // Moving task within the same column - optimistic update
      const newColumns = Array.from(columns);
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
      const newColumns = Array.from(columns);
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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link href="/boards" className="text-primary hover:underline text-sm mb-1 inline-block">
              ← Back to Boards
            </Link>
            <h1 className="text-2xl font-bold">{data.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <UserProfileDropdown />
          </div>
        </div>

        {/* Board Content */}
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="board" direction="horizontal" type="COLUMN" isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
            {(provided, snapshot) => (
              <div 
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex gap-4 overflow-x-auto pb-4 transition-colors duration-200 ${
                  snapshot.isDraggingOver 
                    ? 'bg-accent/20 rounded-lg p-4' 
                    : ''
                }`}
              >
                {columns.map((column, index) => (
                  <ColumnComponent 
                    key={column.id.toString()} 
                    column={column} 
                    index={index}
                    newTaskTitle={newTaskTitle}
                    setNewTaskTitle={setNewTaskTitle}
                    handleCreateTask={handleCreateTask}
                    deleteTaskMutation={deleteTaskMutation}
                    deleteColumnMutation={deleteColumnMutation}
                    columnToDelete={columnToDelete}
                    setColumnToDelete={setColumnToDelete}
                    columnColors={columnColors}
                    setColumnColors={setColumnColors}
                  />
                ))}
                {provided.placeholder}

                {/* Add Column Input - Show input when adding new column */}
                <div className="flex-shrink-0 w-72">
                  {showAddColumnInput ? (
                    <div className="p-2 bg-secondary rounded-lg">
                      <Input
                        autoFocus
                        placeholder="Enter column name..."
                        value={newColumnName}
                        onChange={(e) => setNewColumnName(e.target.value)}
                        className="mb-2"
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
                          disabled={!newColumnName.trim()}
                        >
                          Add Column
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setNewColumnName("");
                            setShowAddColumnInput(false);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="secondary"
                      className="w-full h-12"
                      onClick={() => {
                        setShowAddColumnInput(true);
                        setNewColumnName("");
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add another column
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