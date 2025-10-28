"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getGraphQLClient } from "../../lib/graphqlClient";
import { CREATE_COLUMN, CREATE_TASK, REORDER_TASK, REORDER_COLUMN, DELETE_TASK, UPDATE_TASK, DELETE_COLUMN } from "../../graphql/mutations";
import { GET_BOARD } from "../../graphql/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { type ChecklistItem } from "@/components/ui/checklist";
import { useParams } from "next/navigation";
import Link from "next/link";
import useAuth from "../../hooks/useAuth";
import { Plus, Archive, Trash2, GripVertical, CheckCircle, Circle, MoreHorizontal, Edit3, X, Star, Lightbulb, Filter, Search, ArrowLeft } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
  KeyboardSensor,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  UniqueIdentifier,
  pointerWithin,
  rectIntersection
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  SortableTask,
  TaskDragOverlay,
  SortableColumn,
  ColumnDragOverlay,
  type Task,
  type Column
} from "@/components/board/BoardComponents";

interface BoardResponse {
  board: {
    id: string;
    name: string;
    columns: Column[];
  };
}

type Board = {
  id: string;
  name: string;
  columns: Column[];
};

export default function BoardDetailPage() {
  const { loading: authLoading } = useAuth();
  const params = useParams<{ id: string }>();
  const boardId = params.id as string;

  const [newTaskTitle, setNewTaskTitle] = useState<{ [key: string]: string }>({});
  const [newTaskColors, setNewTaskColors] = useState<{ [key: string]: string }>({});
  const [localColumns, setLocalColumns] = useState<Column[]>([]);
  const [newColumnName, setNewColumnName] = useState("");
  const [showAddColumnInput, setShowAddColumnInput] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Drag and drop state management
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeDropContainerId, setActiveDropContainerId] = useState<string | null>(null);

  // DndKit sensor configuration - hooks must be called at the top level without conditional logic
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8, // Minimum distance to trigger drag
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Memoized values for drag overlay
  const activeTask = useMemo(() => {
    if (!activeId) return null;
    return localColumns.flatMap(col => col.tasks).find(task => task.id === activeId) || null;
  }, [localColumns, activeId]);
  
  const activeColumn = useMemo(() => {
    if (!activeId) return null;
    return localColumns.find(column => column.id === activeId) || null;
  }, [localColumns, activeId]);

  // Fetch board and columns
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["board", boardId],
    queryFn: async () => {
      const client = getGraphQLClient();
      const res = await client.request<BoardResponse>(GET_BOARD, { id: boardId });
      return res.board;
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
    mutationFn: async (variables: { title: string; column_id: string; color?: string }) => {
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
      color?: string; 
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

  const handleCreateTask = (e: React.FormEvent, columnId: string) => {
    e.preventDefault();
    if (!newTaskTitle[columnId]?.trim()) return;
    createTaskMutation.mutate({
      title: newTaskTitle[columnId],
      column_id: columnId,
      color: newTaskColors[columnId] || undefined, // Pass undefined if no color selected
    });
    
    // Clear the input fields after creating the task
    setNewTaskTitle(prev => ({
      ...prev,
      [columnId]: ""
    }));
    setNewTaskColors(prev => ({
      ...prev,
      [columnId]: ""
    }));
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  // Handle drag over
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // If dragging a column over another column, we don't need to set active drop container
    if (active.data.current?.type === 'Column' && over.data.current?.type === 'Column') {
      return;
    }

    // If dragging over a column (for tasks)
    if (active.data.current?.type === 'Task' && over.data.current?.type === 'Column') {
      setActiveDropContainerId(overId as string);
    }
    
    // If dragging over a task in a different column
    if (active.data.current?.type === 'Task' && over.data.current?.type === 'Task') {
      const activeTask = localColumns.flatMap(col => col.tasks).find(task => task.id === activeId);
      const overTask = localColumns.flatMap(col => col.tasks).find(task => task.id === overId);
      
      // Only handle if the tasks are in different columns
      if (activeTask && overTask) {
        const activeColumn = localColumns.find(col => col.tasks.some(t => t.id === activeId));
        const overColumn = localColumns.find(col => col.tasks.some(t => t.id === overId));
        
        if (activeColumn && overColumn && activeColumn.id !== overColumn.id) {
          setActiveDropContainerId(overColumn.id);
        }
      }
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Clear the active drop container
    setActiveDropContainerId(null);

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    // If dropped in the same position, do nothing
    if (activeId === overId) {
      setActiveId(null);
      return;
    }

    // Determine the type of item being dragged
    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === "Column") {
      // Handle column reordering using DndKit's horizontalListSortingStrategy
      const activeIndex = localColumns.findIndex(col => col.id === activeId);
      const overIndex = localColumns.findIndex(col => col.id === overId);

      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        // Perform the reordering
        const newColumns = arrayMove(localColumns, activeIndex, overIndex);
        
        // Update positions in the UI to reflect the new order
        const updatedColumns = newColumns.map((col, idx) => ({
          ...col,
          position: idx + 1
        }));
        
        setLocalColumns(updatedColumns);
        
        // Then send the mutation to update the backend
        // The new_position represents where the column was moved to (1-indexed)
        reorderColumnMutation.mutate({
          column_id: activeId as string,
          new_position: overIndex + 1
        });
      }
    } else if (activeType === "Task") {
      // Handle task reordering
      if (!activeTask) {
        setActiveId(null);
        return;
      }

      // Find the source column
      let sourceColIndex = -1;
      let sourceTaskIndex = -1;
      for (let i = 0; i < localColumns.length; i++) {
        const taskIndex = localColumns[i].tasks.findIndex(task => task.id === activeId);
        if (taskIndex !== -1) {
          sourceColIndex = i;
          sourceTaskIndex = taskIndex;
          break;
        }
      }

      if (sourceColIndex === -1 || sourceTaskIndex === -1) {
        setActiveId(null);
        return;
      }

      // If dropped over a task (within same column or different column)
      if (overType === "Task") {
        // Find the destination column
        let destColIndex = -1;
        let destTaskIndex = -1;
        for (let i = 0; i < localColumns.length; i++) {
          const taskIndex = localColumns[i].tasks.findIndex(task => task.id === overId);
          if (taskIndex !== -1) {
            destColIndex = i;
            destTaskIndex = taskIndex;
            break;
          }
        }

        if (destColIndex === -1 || destTaskIndex === -1) {
          setActiveId(null);
          return;
        }

        if (sourceColIndex === destColIndex) {
          // Moving task within the same column
          const newColumns = [...localColumns];
          const newTasks = arrayMove(newColumns[sourceColIndex].tasks, sourceTaskIndex, destTaskIndex);
          
          // Update positions in the UI to reflect the new order
          newTasks.forEach((task, idx) => {
            task.position = idx + 1;
          });
          
          newColumns[sourceColIndex].tasks = newTasks;
          setLocalColumns(newColumns);
          
          // Then send the mutation
          reorderTaskMutation.mutate({
            task_id: activeId as string,
            new_position: destTaskIndex + 1
          });
        } else {
          // Moving task to a different column
          const newColumns = [...localColumns];
          
          // Remove task from source column
          const sourceTasks = [...newColumns[sourceColIndex].tasks];
          const [movedTask] = sourceTasks.splice(sourceTaskIndex, 1);
          
          // Update positions in source column
          sourceTasks.forEach((task, idx) => {
            task.position = idx + 1;
          });
          
          newColumns[sourceColIndex].tasks = sourceTasks;
          
          // Add task to destination column
          const destTasks = [...newColumns[destColIndex].tasks];
          destTasks.splice(destTaskIndex, 0, { ...movedTask, position: destTaskIndex + 1 });
          
          // Update positions in destination column
          destTasks.forEach((task, idx) => {
            task.position = idx + 1;
          });
          
          newColumns[destColIndex].tasks = destTasks;
          setLocalColumns(newColumns);
          
          // Then send the mutation
          reorderTaskMutation.mutate({
            task_id: activeId as string,
            new_column_id: newColumns[destColIndex].id,
            new_position: destTaskIndex + 1
          });
        }
      } else if (overType === "Column") {
        // Moving task to another column
        const destColIndex = localColumns.findIndex(col => col.id === overId);
        if (destColIndex === -1) {
          setActiveId(null);
          return;
        }

        const newColumns = [...localColumns];
        
        // Remove task from source column
        const sourceTasks = [...newColumns[sourceColIndex].tasks];
        const [movedTask] = sourceTasks.splice(sourceTaskIndex, 1);
        
        // Update positions in source column
        sourceTasks.forEach((task, idx) => {
          task.position = idx + 1;
        });
        
        newColumns[sourceColIndex].tasks = sourceTasks;
        
        // Add task to destination column at the end
        const destTasks = [...newColumns[destColIndex].tasks, { ...movedTask, position: newColumns[destColIndex].tasks.length + 1 }];
        
        // Update positions in destination column
        destTasks.forEach((task, idx) => {
          task.position = idx + 1;
        });
        
        newColumns[destColIndex].tasks = destTasks;
        setLocalColumns(newColumns);
        
        // Then send the mutation
        reorderTaskMutation.mutate({
          task_id: activeId as string,
          new_column_id: newColumns[destColIndex].id,
          new_position: newColumns[destColIndex].tasks.length
        });
      }
    }

    setActiveId(null);
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

  // Now we check for auth loading after all hooks have been called
  if (authLoading) return <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">Loading...</div>;
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
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{data.name}</h1>
            <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
              Private
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/boards">
              <Button variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span>Back to Boards</span>
              </Button>
            </Link>
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
          </div>
        </div>

        {/* Board Content */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {/* SortableContext for columns */}
          <SortableContext items={filteredColumns.map(column => column.id)} strategy={horizontalListSortingStrategy}>
            <div 
              className={`flex gap-4 overflow-x-auto pb-4 transition-colors duration-200 p-2`}
            >
              {filteredColumns.map((column) => (
                <div key={column.id} className="flex-shrink-0" data-id={column.id} data-type="Column">
                  <SortableColumn 
                    column={column}
                    newTaskTitle={newTaskTitle}
                    newTaskColors={newTaskColors}
                    setNewTaskTitle={setNewTaskTitle}
                    setNewTaskColors={setNewTaskColors}
                    handleCreateTask={handleCreateTask}
                    deleteTaskMutation={deleteTaskMutation}
                    updateTaskMutation={updateTaskMutation}
                    setEditingTaskId={setEditingTaskId}
                    deleteColumnMutation={deleteColumnMutation}
                    columnToDelete={columnToDelete}
                    setColumnToDelete={setColumnToDelete}
                    isActiveDropContainer={activeDropContainerId === column.id}
                  />
                </div>
              ))}

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
          </SortableContext>
          
          {/* Drag Overlay - Shows the item being dragged */}
          <DragOverlay>
            {activeId && activeTask ? (
              <TaskDragOverlay
                key="task-overlay"
                task={activeTask}
                deleteTaskMutation={deleteTaskMutation}
                updateTaskMutation={updateTaskMutation}
                setEditingTaskId={setEditingTaskId}
              />
            ) : activeId && activeColumn ? (
              <ColumnDragOverlay
                key="column-overlay"
                column={activeColumn}
                newTaskTitle={newTaskTitle}
                newTaskColors={newTaskColors}
                setNewTaskTitle={setNewTaskTitle}
                setNewTaskColors={setNewTaskColors}
                handleCreateTask={handleCreateTask}
                deleteTaskMutation={deleteTaskMutation}
                updateTaskMutation={updateTaskMutation}
                setEditingTaskId={setEditingTaskId}
                deleteColumnMutation={deleteColumnMutation}
                columnToDelete={columnToDelete}
                setColumnToDelete={setColumnToDelete}
                isActiveDropContainer={activeDropContainerId === activeColumn.id}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
        
        {/* Confirmation Dialog for Column Deletion */}
        {columnToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Delete Column</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete this column? All tasks in this column will also be deleted.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  onClick={() => setColumnToDelete(null)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md"
                  onClick={() => {
                    deleteColumnMutation.mutate({ id: columnToDelete });
                    setColumnToDelete(null);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Task Editing Modal */}
        {editingTaskId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Edit Task</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                // For now, just close the modal - in a real implementation you'd update the task
                setEditingTaskId(null);
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <Input
                    type="text"
                    className="w-full"
                    defaultValue={localColumns.flatMap(c => c.tasks).find(t => t.id === editingTaskId)?.title || ''}
                    onChange={(e) => {
                      // Update the task title in state
                      setLocalColumns(prev => prev.map(col => ({
                        ...col,
                        tasks: col.tasks.map(task => 
                          task.id === editingTaskId 
                            ? {...task, title: e.target.value} 
                            : task
                        )
                      })));
                    }}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <Input
                    type="text"
                    className="w-full"
                    defaultValue={localColumns.flatMap(c => c.tasks).find(t => t.id === editingTaskId)?.description || ''}
                    onChange={(e) => {
                      // Update the task description in state
                      setLocalColumns(prev => prev.map(col => ({
                        ...col,
                        tasks: col.tasks.map(task => 
                          task.id === editingTaskId 
                            ? {...task, description: e.target.value} 
                            : task
                        )
                      })));
                    }}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Color
                  </label>
                  <div className="flex gap-2">
                    {[
                      'bg-red-200 dark:bg-red-600',
                      'bg-blue-200 dark:bg-blue-600', 
                      'bg-green-200 dark:bg-green-600',
                      'bg-yellow-200 dark:bg-yellow-600',
                      'bg-purple-200 dark:bg-purple-600',
                      'bg-pink-200 dark:bg-pink-600'
                    ].map((color) => {
                      const currentTask = localColumns.flatMap(c => c.tasks).find(t => t.id === editingTaskId);
                      const isSelected = currentTask?.color === color;
                      return (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border ${color} ${isSelected ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-300' : ''}`}
                          onClick={() => {
                            // Update the task color in state
                            setLocalColumns(prev => prev.map(col => ({
                              ...col,
                              tasks: col.tasks.map(task => 
                                task.id === editingTaskId 
                                  ? {...task, color} 
                                  : task
                              )
                            })));
                          }}
                        />
                      );
                    })}
                  </div>
                </div>


                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    onClick={() => {
                      setEditingTaskId(null);
                      // Reset to original values if needed
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                    onClick={() => {
                      // Find the current task to get the updated values from the local state
                      const updatedTask = localColumns.flatMap(c => c.tasks).find(t => t.id === editingTaskId);
                      if (updatedTask) {
                        updateTaskMutation.mutate({
                          id: editingTaskId,
                          title: updatedTask.title,
                          description: updatedTask.description,
                          color: updatedTask.color,
                          checklists: updatedTask.checklists
                        });
                      }
                      setEditingTaskId(null);
                    }}
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}