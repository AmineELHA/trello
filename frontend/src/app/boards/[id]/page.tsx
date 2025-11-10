"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getGraphQLClient } from "../../lib/graphqlClient";
import { CREATE_COLUMN, CREATE_TASK, REORDER_TASK, REORDER_COLUMN, DELETE_TASK, UPDATE_TASK, DELETE_COLUMN } from "../../graphql/mutations";
import { GET_BOARD } from "../../graphql/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { type ChecklistItem } from "@/components/ui/checklist";
import { type Task, type Column } from "@/components/board/BoardComponents";
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
  const queryClient = useQueryClient();
  const { loading: authLoading, user } = useAuth();
  const params = useParams<{ id: string }>();
  const boardId = params.id as string;

  const [newTaskTitle, setNewTaskTitle] = useState<{ [key: string]: string }>({});
  const [newTaskColors, setNewTaskColors] = useState<{ [key: string]: string }>({});
  const [newTaskDueDates, setNewTaskDueDates] = useState<{ [key: string]: string }>({});
  const [newTaskReminderDates, setNewTaskReminderDates] = useState<{ [key: string]: string }>({});
  const [localColumns, setLocalColumns] = useState<Column[]>([]);
  const [newColumnName, setNewColumnName] = useState("");
  const [showAddColumnInput, setShowAddColumnInput] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskValues, setEditingTaskValues] = useState<Partial<Task> | null>(null);

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
    enabled: !authLoading && !!user, // Only run the query when authenticated and auth is loaded
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
    onMutate: async (variables) => {
      // Cancel outgoing refetches to avoid conflicts
      await queryClient.cancelQueries({ queryKey: ["board", boardId] });

      // Snapshot previous value to enable rollback if needed
      const previousBoard = queryClient.getQueryData(["board", boardId]);

      try {
        // Update local cache optimistically
        queryClient.setQueryData(["board", boardId], (old: any) => {
          if (!old) return old;
          
          const updatedBoard = { ...old };
          
          // Add a new column with default values (we'll update with server response later)
          const newColumn = {
            id: `temp-${Date.now()}`, // Temporary ID until server response
            name: variables.name,
            position: updatedBoard.columns.length + 1, // New column at the end
            tasks: []
          };
          
          updatedBoard.columns.push(newColumn);
          
          return updatedBoard;
        });

        return { previousBoard };
      } catch (err) {
        console.error("Optimistic update failed:", err);
        return { previousBoard };
      }
    },
    onError: (err, variables, context) => {
      console.error("Error creating column:", err);
      // Roll back to previous state if mutation failed
      if (context?.previousBoard) {
        queryClient.setQueryData(["board", boardId], context.previousBoard);
      }
      alert("Failed to create column. Please make sure you are logged in.");
    },
    onSuccess: (data) => {
      // On success, we don't need to manually refetch since React Query handles cache updates
      console.log("Column creation successful");
    }
  });

  // Define the response type for CREATE_TASK mutation
  type CreateTaskResponse = {
    createTask?: {
      task?: Task;
      errors?: string[];
    };
  };

  // Mutation to create a task
  const createTaskMutation = useMutation<CreateTaskResponse, Error, { 
    title: string; 
    column_id: string; 
    color?: string;
    due_date?: string;
    reminder_date?: string;
  }>({
    mutationFn: async (variables) => {
      return await client.request(CREATE_TASK, variables);
    },
    onSuccess: (data) => {
      console.log('Task creation response:', data);
      // Check if there were errors even in the success callback
      if (data.createTask?.errors && data.createTask.errors.length > 0) {
        console.error("Task creation had errors:", data.createTask.errors);
        alert("Task creation failed with errors: " + data.createTask.errors.join(", "));
        return;
      }
      
      // Clear the input fields after successful creation
      setNewTaskTitle(prev => {
        const newTitles = { ...prev };
        // Find the column id that this task was added to and clear its input
        return Object.fromEntries(
          Object.entries(newTitles).map(([key, value]) => [key, key === variables.column_id ? "" : value])
        );
      });
    },
    onError: (error) => {
      console.error("Error creating task:", error);
      alert("Failed to create task. Please make sure you are logged in. Error details: " + JSON.stringify(error));
    },
  });

  // Mutation to reorder a task
  const reorderTaskMutation = useMutation({
    mutationFn: async (variables: { task_id: string; new_column_id?: string; new_position: number }) => {
      return await client.request(REORDER_TASK, variables);
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches to avoid conflicts
      await queryClient.cancelQueries({ queryKey: ["board", boardId] });

      // Snapshot previous value to enable rollback if needed
      const previousBoard = queryClient.getQueryData(["board", boardId]);

      try {
        // Update local cache optimistically
        queryClient.setQueryData(["board", boardId], (old: any) => {
          if (!old) return old;
          
          const updatedBoard = { ...old };
          const allTasks = updatedBoard.columns.flatMap((col: any) => col.tasks);
          const taskToMove = allTasks.find((task: any) => task.id === variables.task_id);
          
          if (!taskToMove) return old;
          
          // Find the source column and remove task
          const sourceColumn = updatedBoard.columns.find((col: any) => 
            col.tasks.some((task: any) => task.id === variables.task_id)
          );
          
          if (!sourceColumn) return old;
          
          const sourceTaskIndex = sourceColumn.tasks.findIndex((task: any) => task.id === variables.task_id);
          if (sourceTaskIndex === -1) return old;
          
          const [movedTask] = sourceColumn.tasks.splice(sourceTaskIndex, 1);
          
          // Update positions in source column
          sourceColumn.tasks.forEach((task: any, idx: number) => {
            task.position = idx + 1;
          });
          
          // If moving to a different column
          if (variables.new_column_id && variables.new_column_id !== sourceColumn.id) {
            const destColumn = updatedBoard.columns.find((col: any) => col.id === variables.new_column_id);
            if (destColumn) {
              // Add task to destination column
              const newTask = { ...movedTask, position: variables.new_position };
              destColumn.tasks.splice(variables.new_position - 1, 0, newTask);
              
              // Update positions in destination column
              destColumn.tasks.forEach((task: any, idx: number) => {
                task.position = idx + 1;
              });
            }
          } else {
            // Moving within same column - add back at new position
            movedTask.position = variables.new_position;
            sourceColumn.tasks.splice(variables.new_position - 1, 0, movedTask);
            
            // Update positions in source column
            sourceColumn.tasks.forEach((task: any, idx: number) => {
              task.position = idx + 1;
            });
          }
          
          return updatedBoard;
        });

        return { previousBoard };
      } catch (err) {
        console.error("Optimistic update failed:", err);
        return { previousBoard };
      }
    },
    onError: (err, variables, context) => {
      console.error("Error reordering task:", err);
      // Roll back to previous state if mutation failed
      if (context?.previousBoard) {
        queryClient.setQueryData(["board", boardId], context.previousBoard);
      }
      alert("Failed to move task. Please try again.");
    },
    onSuccess: () => {
      // On success, we don't need to do anything as the optimistic update was correct
      // The cache is already updated with the proper values
      console.log("Task reorder successful");
    }
  });

  // Mutation to reorder a column
  const reorderColumnMutation = useMutation({
    mutationFn: async (variables: { column_id: string; new_position: number }) => {
      return await client.request(REORDER_COLUMN, variables);
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches to avoid conflicts
      await queryClient.cancelQueries({ queryKey: ["board", boardId] });

      // Snapshot previous value to enable rollback if needed
      const previousBoard = queryClient.getQueryData(["board", boardId]);

      try {
        // Update local cache optimistically
        queryClient.setQueryData(["board", boardId], (old: any) => {
          if (!old) return old;
          
          const updatedBoard = { ...old };
          const columnToMove = updatedBoard.columns.find((col: any) => col.id === variables.column_id);
          
          if (!columnToMove) return old;
          
          const sourceIndex = updatedBoard.columns.findIndex((col: any) => col.id === variables.column_id);
          if (sourceIndex === -1) return old;
          
          const [movedColumn] = updatedBoard.columns.splice(sourceIndex, 1);
          
          // Add column at new position
          updatedBoard.columns.splice(variables.new_position - 1, 0, movedColumn);
          
          // Update positions
          updatedBoard.columns.forEach((col: any, idx: number) => {
            col.position = idx + 1;
          });
          
          return updatedBoard;
        });

        return { previousBoard };
      } catch (err) {
        console.error("Optimistic update failed:", err);
        return { previousBoard };
      }
    },
    onError: (err, variables, context) => {
      console.error("Error reordering column:", err);
      // Roll back to previous state if mutation failed
      if (context?.previousBoard) {
        queryClient.setQueryData(["board", boardId], context.previousBoard);
      }
      alert("Failed to reorder column. Please try again.");
    },
    onSuccess: () => {
      // On success, we don't need to do anything as the optimistic update was correct
      console.log("Column reorder successful");
    }
  });

  // Mutation to delete a task
  const deleteTaskMutation = useMutation({
    mutationFn: async (variables: { id: string }) => {
      return await client.request(DELETE_TASK, variables);
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches to avoid conflicts
      await queryClient.cancelQueries({ queryKey: ["board", boardId] });

      // Snapshot previous value to enable rollback if needed
      const previousBoard = queryClient.getQueryData(["board", boardId]);

      try {
        // Update local cache optimistically
        queryClient.setQueryData(["board", boardId], (old: any) => {
          if (!old) return old;
          
          const updatedBoard = { ...old };
          
          // Find the task and remove it from its column
          for (const column of updatedBoard.columns) {
            const taskIndex = column.tasks.findIndex((task: any) => task.id === variables.id);
            if (taskIndex !== -1) {
              column.tasks.splice(taskIndex, 1);
              // Update positions after removal
              column.tasks.forEach((task: any, idx: number) => {
                task.position = idx + 1;
              });
              break;
            }
          }
          
          return updatedBoard;
        });

        return { previousBoard };
      } catch (err) {
        console.error("Optimistic update failed:", err);
        return { previousBoard };
      }
    },
    onError: (err, variables, context) => {
      console.error("Error deleting task:", err);
      // Roll back to previous state if mutation failed
      if (context?.previousBoard) {
        queryClient.setQueryData(["board", boardId], context.previousBoard);
      }
      alert("Failed to delete task. Please try again.");
    },
    onSuccess: () => {
      // On success, we don't need to do anything as the optimistic update was correct
      console.log("Task deletion successful");
    }
  });

  // Mutation to update a task
  const updateTaskMutation = useMutation({
    mutationFn: async (variables: { 
      id: string; 
      title?: string; 
      description?: string; 
      due_date?: string; 
      reminder_date?: string; 
      labels?: string[]; 
      checklists?: ChecklistItem[]; 
      attachments?: string[]; 
      color?: string; 
      column_id?: string; 
      position?: number 
    }) => {
      return await client.request(UPDATE_TASK, variables);
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches to avoid conflicts
      await queryClient.cancelQueries({ queryKey: ["board", boardId] });

      // Snapshot previous value to enable rollback if needed
      const previousBoard = queryClient.getQueryData(["board", boardId]);

      try {
        // Update local cache optimistically
        queryClient.setQueryData(["board", boardId], (old: any) => {
          if (!old) return old;
          
          const updatedBoard = { ...old };
          
          // Find the task and update its properties
          for (const column of updatedBoard.columns) {
            const taskIndex = column.tasks.findIndex((task: any) => task.id === variables.id);
            if (taskIndex !== -1) {
              const task = column.tasks[taskIndex];
              // Update task properties based on what was provided in variables
              if (variables.title !== undefined) task.title = variables.title;
              if (variables.description !== undefined) task.description = variables.description;
              if (variables.due_date !== undefined) task.dueDate = variables.due_date;
              if (variables.reminder_date !== undefined) task.reminderDate = variables.reminder_date;
              if (variables.labels !== undefined) task.labels = variables.labels;
              if (variables.checklists !== undefined) task.checklists = variables.checklists;
              if (variables.attachments !== undefined) task.attachments = variables.attachments;
              if (variables.color !== undefined) task.color = variables.color;
              if (variables.position !== undefined) task.position = variables.position;
              
              // If column_id is provided and different, move the task to that column
              if (variables.column_id && variables.column_id !== column.id) {
                // Remove from current column
                const [movedTask] = column.tasks.splice(taskIndex, 1);
                
                // Update positions in source column
                column.tasks.forEach((task: any, idx: number) => {
                  task.position = idx + 1;
                });
                
                // Find destination column and add the task
                const destColumn = updatedBoard.columns.find((col: any) => col.id === variables.column_id);
                if (destColumn) {
                  destColumn.tasks.push(movedTask);
                  // Update positions in destination column
                  destColumn.tasks.forEach((task: any, idx: number) => {
                    task.position = idx + 1;
                  });
                }
              }
              
              break;
            }
          }
          
          return updatedBoard;
        });

        return { previousBoard };
      } catch (err) {
        console.error("Optimistic update failed:", err);
        return { previousBoard };
      }
    },
    onError: (err, variables, context) => {
      console.error("Error updating task:", err);
      // Roll back to previous state if mutation failed
      if (context?.previousBoard) {
        queryClient.setQueryData(["board", boardId], context.previousBoard);
      }
      alert("Failed to update task. Please try again.");
    },
    onSuccess: () => {
      // On success, we don't need to do anything as the optimistic update was correct
      console.log("Task update successful");
    }
  });

  // Mutation to delete a column
  const deleteColumnMutation = useMutation({
    mutationFn: async (variables: { id: string }) => {
      return await client.request(DELETE_COLUMN, variables);
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches to avoid conflicts
      await queryClient.cancelQueries({ queryKey: ["board", boardId] });

      // Snapshot previous value to enable rollback if needed
      const previousBoard = queryClient.getQueryData(["board", boardId]);

      try {
        // Update local cache optimistically
        queryClient.setQueryData(["board", boardId], (old: any) => {
          if (!old) return old;
          
          const updatedBoard = { ...old };
          
          // Find and remove the column
          const colIndex = updatedBoard.columns.findIndex((col: any) => col.id === variables.id);
          if (colIndex !== -1) {
            updatedBoard.columns.splice(colIndex, 1);
            
            // Update positions of remaining columns
            updatedBoard.columns.forEach((col: any, idx: number) => {
              col.position = idx + 1;
            });
          }
          
          return updatedBoard;
        });

        return { previousBoard };
      } catch (err) {
        console.error("Optimistic update failed:", err);
        return { previousBoard };
      }
    },
    onError: (err, variables, context) => {
      console.error("Error deleting column:", err);
      // Roll back to previous state if mutation failed
      if (context?.previousBoard) {
        queryClient.setQueryData(["board", boardId], context.previousBoard);
      }
      alert("Failed to delete column. Please try again.");
    },
    onSuccess: () => {
      // On success, we don't need to do anything as the optimistic update was correct
      console.log("Column deletion successful");
    }
  });

  const handleCreateTask = (e: React.FormEvent, columnId: string) => {
    e.preventDefault();
    if (!newTaskTitle[columnId]?.trim()) return;
    
    // Prepare date values - convert to ISO string format if provided and not empty
    let dueDate = undefined;
    if (newTaskDueDates[columnId] && newTaskDueDates[columnId].trim() !== '') {
      // The date is already in datetime format like 'YYYY-MM-DDTHH:MM'
      const dueDateTime = new Date(newTaskDueDates[columnId]);
      // Check if the date is valid before setting
      if (!isNaN(dueDateTime.getTime())) {
        dueDate = dueDateTime.toISOString();
      }
    }
    
    let reminderDate = undefined;
    if (newTaskReminderDates[columnId] && newTaskReminderDates[columnId].trim() !== '') {
      // The date is already in datetime format like 'YYYY-MM-DDTHH:MM'
      let reminderDateTime = new Date(newTaskReminderDates[columnId]);
      // Check if the date is valid before proceeding
      if (isNaN(reminderDateTime.getTime())) {
        reminderDateTime = new Date(); // Default to current date/time if invalid
      }
      
      // Ensure reminder date is not after due date if both are provided
      if (dueDate) {
        const dueDateObj = new Date(dueDate);
        if (reminderDateTime > dueDateObj) {
          // If reminder date is after due date, show an error or adjust the time
          alert("Reminder date cannot be after the due date. Please adjust your reminder time.");
          return; // Prevent task creation
        }
      }
      
      reminderDate = reminderDateTime.toISOString();
    }
    
    console.log('Creating task with values:', {
      title: newTaskTitle[columnId],
      column_id: columnId,
      color: newTaskColors[columnId] || undefined,
      due_date: dueDate,
      reminder_date: reminderDate,
    });
    createTaskMutation.mutate({
      title: newTaskTitle[columnId],
      column_id: columnId,
      color: newTaskColors[columnId] || undefined, // Pass undefined if no color selected
      due_date: dueDate,
      reminder_date: reminderDate,
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
    setNewTaskDueDates(prev => ({
      ...prev,
      [columnId]: ""
    }));
    setNewTaskReminderDates(prev => ({
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
          new_position: newColumns[destColIndex].tasks.length + 1
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
  if (!user) return <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">You must be logged in to view this board.</div>;
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
                    newTaskDueDates={newTaskDueDates}
                    newTaskReminderDates={newTaskReminderDates}
                    setNewTaskTitle={setNewTaskTitle}
                    setNewTaskColors={setNewTaskColors}
                    setNewTaskDueDates={setNewTaskDueDates}
                    setNewTaskReminderDates={setNewTaskReminderDates}
                    handleCreateTask={handleCreateTask}
                    deleteTaskMutation={deleteTaskMutation}
                    updateTaskMutation={updateTaskMutation}
                    setEditingTaskId={setEditingTaskId}
                    setEditingTaskValues={setEditingTaskValues}
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
                setEditingTaskValues={setEditingTaskValues}
              />
            ) : activeId && activeColumn ? (
              <ColumnDragOverlay
                key="column-overlay"
                column={activeColumn}
                newTaskTitle={newTaskTitle}
                newTaskColors={newTaskColors}
                newTaskDueDates={newTaskDueDates}
                newTaskReminderDates={newTaskReminderDates}
                setNewTaskTitle={setNewTaskTitle}
                setNewTaskColors={setNewTaskColors}
                setNewTaskDueDates={setNewTaskDueDates}
                setNewTaskReminderDates={setNewTaskReminderDates}
                handleCreateTask={handleCreateTask}
                deleteTaskMutation={deleteTaskMutation}
                updateTaskMutation={updateTaskMutation}
                setEditingTaskId={setEditingTaskId}
                setEditingTaskValues={setEditingTaskValues}
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
                      setEditingTaskValues(prev => ({
                        ...prev,
                        title: e.target.value
                      }));
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
                      setEditingTaskValues(prev => ({
                        ...prev,
                        description: e.target.value
                      }));
                    }}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Due Date
                  </label>
                  <DateTimePicker
                    date={editingTaskValues?.dueDate ? new Date(editingTaskValues.dueDate) : undefined}
                    time={editingTaskValues?.dueDate ? new Date(editingTaskValues.dueDate).toTimeString().substring(0, 5) : undefined}
                    onDateChange={(date) => {
                      const timeValue = editingTaskValues?.dueDate ? 
                        new Date(editingTaskValues.dueDate).toTimeString().substring(0, 5) : 
                        '00:00';
                      if (date) {
                        // Format the date properly to create a valid datetime string
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const formattedDate = `${year}-${month}-${day}`;
                        const combinedDateTime = new Date(`${formattedDate}T${timeValue}:00.000Z`);
                        
                        // Check if the date is valid before setting
                        if (!isNaN(combinedDateTime.getTime())) {
                          setEditingTaskValues(prev => ({
                            ...prev,
                            dueDate: combinedDateTime.toISOString()
                          }));
                        }
                      } else {
                        setEditingTaskValues(prev => ({
                          ...prev,
                          dueDate: null
                        }));
                      }
                    }}
                    onTimeChange={(time) => {
                      let dateValue;
                      if (editingTaskValues?.dueDate) {
                        const dateObj = new Date(editingTaskValues.dueDate);
                        // Check if the date is valid before extracting the date part
                        if (!isNaN(dateObj.getTime())) {
                          dateValue = dateObj.toISOString().split('T')[0];
                        } else {
                          dateValue = new Date().toISOString().split('T')[0];
                        }
                      } else {
                        dateValue = new Date().toISOString().split('T')[0];
                      }
                      
                      // When updating due date time, ensure it's after the reminder date
                      let newDueDateTime = new Date(`${dateValue}T${time}:00.000Z`);
                      
                      // Check if the date is valid before proceeding
                      if (isNaN(newDueDateTime.getTime())) {
                        return; // Don't update if invalid date
                      }
                      
                      if (editingTaskValues?.reminderDate) {
                        const reminderDateTime = new Date(editingTaskValues.reminderDate);
                        
                        // Check if the date is valid before comparison
                        if (isNaN(reminderDateTime.getTime())) {
                          // Skip comparison if reminder date is invalid
                          setEditingTaskValues(prev => ({
                            ...prev,
                            dueDate: newDueDateTime.toISOString()
                          }));
                          return;
                        }
                        
                        // If the new due time would be before or equal to the reminder time, show an error
                        if (newDueDateTime <= reminderDateTime) {
                          alert("Due date/time must be after reminder date/time. Please adjust your dates.");
                          return;
                        }
                      }
                      
                      setEditingTaskValues(prev => ({
                        ...prev,
                        dueDate: newDueDateTime.toISOString()
                      }));
                    }}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reminder Date
                  </label>
                  <DateTimePicker
                    date={editingTaskValues?.reminderDate ? new Date(editingTaskValues.reminderDate) : undefined}
                    time={editingTaskValues?.reminderDate ? new Date(editingTaskValues.reminderDate).toTimeString().substring(0, 5) : undefined}
                    onDateChange={(date) => {
                      const timeValue = editingTaskValues?.reminderDate ? 
                        new Date(editingTaskValues.reminderDate).toTimeString().substring(0, 5) : 
                        '00:00';
                      if (date) {
                        // Format the date properly to create a valid datetime string
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const formattedDate = `${year}-${month}-${day}`;
                        const combinedDateTime = new Date(`${formattedDate}T${timeValue}:00.000Z`);
                        
                        // Check if the date is valid before setting
                        if (!isNaN(combinedDateTime.getTime())) {
                          setEditingTaskValues(prev => ({
                            ...prev,
                            reminderDate: combinedDateTime.toISOString()
                          }));
                        }
                      } else {
                        setEditingTaskValues(prev => ({
                          ...prev,
                          reminderDate: null
                        }));
                      }
                    }}
                    onTimeChange={(time) => {
                      let dateValue;
                      if (editingTaskValues?.reminderDate) {
                        const dateObj = new Date(editingTaskValues.reminderDate);
                        // Check if the date is valid before extracting the date part
                        if (!isNaN(dateObj.getTime())) {
                          dateValue = dateObj.toISOString().split('T')[0];
                        } else {
                          dateValue = new Date().toISOString().split('T')[0];
                        }
                      } else {
                        dateValue = new Date().toISOString().split('T')[0];
                      }
                      
                      // When updating reminder time, ensure it's before the due date
                      let newReminderDateTime = new Date(`${dateValue}T${time}:00.000Z`);
                      
                      // Check if the date is valid before proceeding
                      if (isNaN(newReminderDateTime.getTime())) {
                        return; // Don't update if invalid date
                      }
                      
                      if (editingTaskValues?.dueDate) {
                        const dueDateTime = new Date(editingTaskValues.dueDate);
                        
                        // Check if the date is valid before comparison
                        if (isNaN(dueDateTime.getTime())) {
                          // Skip comparison if due date is invalid
                          setEditingTaskValues(prev => ({
                            ...prev,
                            reminderDate: newReminderDateTime.toISOString()
                          }));
                          return;
                        }
                        
                        // If the new reminder time would be after or equal to the due time, show an error
                        if (newReminderDateTime >= dueDateTime) {
                          alert("Reminder date/time must be before due date/time. Please adjust your dates.");
                          return;
                        }
                      }
                      
                      setEditingTaskValues(prev => ({
                        ...prev,
                        reminderDate: newReminderDateTime.toISOString()
                      }));
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
                      const isSelected = editingTaskValues?.color === color;
                      return (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border ${color} ${isSelected ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-300' : ''}`}
                          onClick={() => {
                            setEditingTaskValues(prev => ({
                              ...prev,
                              color
                            }));
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
                      setEditingTaskValues(null);
                      // Reset to original values if needed
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                    onClick={(e) => {
                      e.preventDefault(); // Prevent form submission
                      if (editingTaskValues && editingTaskId) {
                        // Create the mutation variables object, only including defined values
                        const mutationVariables: any = { id: editingTaskId };
                        
                        if (editingTaskValues.title !== undefined && editingTaskValues.title !== '') mutationVariables.title = editingTaskValues.title;
                        if (editingTaskValues.description !== undefined && editingTaskValues.description !== '') mutationVariables.description = editingTaskValues.description;
                        
                        // Process date values to ensure they're in proper ISO format
                        if (editingTaskValues.dueDate !== undefined) {
                          if (editingTaskValues.dueDate) {
                            const dueDateObj = new Date(editingTaskValues.dueDate);
                            // Check if the date is valid before setting
                            if (!isNaN(dueDateObj.getTime())) {
                              mutationVariables.due_date = dueDateObj.toISOString();
                            } else {
                              mutationVariables.due_date = null; // or handle as needed
                            }
                          } else {
                            mutationVariables.due_date = null;
                          }
                        }
                        if (editingTaskValues.reminderDate !== undefined) {
                          if (editingTaskValues.reminderDate) {
                            const reminderDateObj = new Date(editingTaskValues.reminderDate);
                            // Check if the date is valid before setting
                            if (!isNaN(reminderDateObj.getTime())) {
                              mutationVariables.reminder_date = reminderDateObj.toISOString();
                            } else {
                              mutationVariables.reminder_date = null; // or handle as needed
                            }
                          } else {
                            mutationVariables.reminder_date = null;
                          }
                        }
                        
                        if (editingTaskValues.color !== undefined) mutationVariables.color = editingTaskValues.color;
                        if (editingTaskValues.checklists !== undefined) mutationVariables.checklists = editingTaskValues.checklists;
                        
                        updateTaskMutation.mutate(mutationVariables);
                      }
                      // Close the modal after mutation is called
                      setEditingTaskId(null);
                      setEditingTaskValues(null);
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