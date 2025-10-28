import { useState } from "react";
import { 
  useSortable,
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  Card 
} from "@/components/ui/card";
import { 
  Button 
} from "@/components/ui/button";
import { 
  Input 
} from "@/components/ui/input";
import { 
  GripVertical, 
  MoreHorizontal, 
  Edit3, 
  Trash2 
} from "lucide-react";

// Define TypeScript types first
export type ChecklistItem = {
  id?: string;
  description: string;
  completed: boolean;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  labels?: string[];
  checklists?: ChecklistItem[];
  attachments?: string[];
  color?: string;
  position: number;
  completed?: boolean;
};

export type Column = {
  id: string;
  name: string;
  position: number;
  tasks: Task[];
};

// Helper function to validate color classes
const isValidColor = (color?: string): boolean => {
  if (!color) return false;
  const validColors = [
    'bg-red-200', 'bg-red-600',
    'bg-blue-200', 'bg-blue-600',
    'bg-green-200', 'bg-green-600',
    'bg-yellow-200', 'bg-yellow-600',
    'bg-purple-200', 'bg-purple-600',
    'bg-pink-200', 'bg-pink-600'
  ];
  // Check if the color string contains any of the valid colors
  return validColors.some(validColor => color.includes(validColor));
};

// Sortable Task Component using DndKit
interface SortableTaskProps {
  task: Task;
  deleteTaskMutation: {
    mutate: (variables: { id: string }) => void;
    isPending?: boolean;
  };
  updateTaskMutation: {
    mutate: (variables: { 
      id: string; 
      title?: string; 
      description?: string; 
      due_date?: string; 
      labels?: string[]; 
      checklists?: ChecklistItem[]; 
      attachments?: string[]; 
      color?: string; 
      column_id?: string; 
      position?: number;
      completed?: boolean;
    }) => void;
    isPending?: boolean;
  };
  setEditingTaskId: (id: string | null) => void;
  className?: string;
}

export const SortableTask = ({ 
  task, 
  deleteTaskMutation,
  updateTaskMutation,
  setEditingTaskId,
  className = ""
}: SortableTaskProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: task.id,
    data: {
      type: 'Task',
      task
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? 'shadow-lg scale-[1.02] z-20' : 'hover:shadow-md'} transition-all duration-150 mb-2 ${className}`}
    >
      <Card className={`p-3 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 ${isDragging ? 'opacity-90' : ''} ${task.completed ? 'opacity-70 bg-green-50 dark:bg-green-900/20' : ''} ${isValidColor(task.color) ? task.color : ''} border-l-4 ${(task.color && isValidColor(task.color)) ? task.color.replace(/bg-(\w+)-(\d+)/g, 'border-$1-$2') : 'border-gray-300 dark:border-gray-500'} group`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center min-w-0 gap-2">
            <div className="flex-1">
              <div className="mb-2">
                <h4 className={`font-medium text-sm truncate ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>{task.title}</h4>
              </div>
              

              
              {task.labels && task.labels.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {task.labels.map((label, index) => (
                    <span 
                      key={index} 
                      className={`text-xs px-2 py-0.5 rounded-full ${task.completed ? 'bg-gray-400 dark:bg-gray-600' : 'bg-purple-500'} text-white`} 
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}
              
              {task.dueDate && (
                <div className={`flex items-center gap-1 text-xs ${task.completed ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'} mt-1`}>
                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-6 w-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={(e) => {
                e.stopPropagation(); // Prevent drag when clicking edit
                setEditingTaskId(task.id);
              }}
            >
              <Edit3 className="h-3 w-3" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-6 w-6 text-red-500 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation(); // Prevent drag when clicking delete
                deleteTaskMutation.mutate({ id: task.id });
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Drag Overlay Task Component to display during dragging
interface TaskDragOverlayProps {
  task: Task;
  deleteTaskMutation: {
    mutate: (variables: { id: string }) => void;
    isPending?: boolean;
  };
  updateTaskMutation: {
    mutate: (variables: { 
      id: string; 
      title?: string; 
      description?: string; 
      due_date?: string; 
      labels?: string[]; 
      checklists?: ChecklistItem[]; 
      attachments?: string[]; 
      color?: string; 
      column_id?: string; 
      position?: number;
      completed?: boolean;
    }) => void;
    isPending?: boolean;
  };
  setEditingTaskId: (id: string | null) => void;
}

export const TaskDragOverlay = ({ 
  task, 
  deleteTaskMutation,
  updateTaskMutation,
  setEditingTaskId
}: TaskDragOverlayProps) => {
  return (
    <Card className={`p-3 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg scale-[1.02] opacity-90 cursor-grab active:cursor-grabbing group ${isValidColor(task.color) ? task.color : ''} border-l-4 ${(task.color && isValidColor(task.color)) ? task.color.replace(/bg-(\w+)-(\d+)/g, 'border-$1-$2') : 'border-gray-300 dark:border-gray-500'} ${task.completed ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center min-w-0 gap-2">
          <div className="flex-1">
            <div className="mb-2">
              <h4 className={`font-medium text-sm truncate ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>{task.title}</h4>
            </div>
            

            
            {task.labels && task.labels.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {task.labels.map((label, index) => (
                  <span 
                    key={index} 
                    className={`text-xs px-2 py-0.5 rounded-full ${task.completed ? 'bg-gray-400 dark:bg-gray-600' : 'bg-purple-500'} text-white`} 
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
            
            {task.dueDate && (
              <div className={`flex items-center gap-1 text-xs ${task.completed ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'} mt-1`}>
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-6 w-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={(e) => {
              e.stopPropagation(); // Prevent drag when clicking edit
              setEditingTaskId(task.id);
            }}
          >
            <Edit3 className="h-3 w-3" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-6 w-6 text-red-500 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation(); // Prevent drag when clicking delete
              deleteTaskMutation.mutate({ id: task.id });
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Sortable Column Component using DndKit
interface SortableColumnProps {
  column: Column;
  newTaskTitle: { [key: string]: string };
  newTaskColors: { [key: string]: string };
  setNewTaskTitle: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  setNewTaskColors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  handleCreateTask: (e: React.FormEvent, columnId: string) => void;
  deleteTaskMutation: {
    mutate: (variables: { id: string }) => void;
    isPending?: boolean;
  };
  updateTaskMutation: {
    mutate: (variables: { 
      id: string; 
      title?: string; 
      description?: string; 
      due_date?: string; 
      labels?: string[]; 
      checklists?: ChecklistItem[]; 
      attachments?: string[]; 
      column_id?: string; 
      position?: number 
    }) => void;
    isPending?: boolean;
  };
  setEditingTaskId: (id: string | null) => void;
  deleteColumnMutation: {
    mutate: (variables: { id: string }) => void;
    isPending?: boolean;
  };
  columnToDelete: string | null;
  setColumnToDelete: React.Dispatch<React.SetStateAction<string | null>>;
  isActiveDropContainer?: boolean;
}

export const SortableColumn = ({ 
  column,
  newTaskTitle,
  newTaskColors,
  setNewTaskTitle,
  setNewTaskColors,
  handleCreateTask,
  deleteTaskMutation,
  updateTaskMutation,
  setEditingTaskId,
  deleteColumnMutation,
  columnToDelete,
  setColumnToDelete,
  isActiveDropContainer = false
}: SortableColumnProps) => {
  const [showColumnOptions, setShowColumnOptions] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: column.id,
    data: {
      type: 'Column',
      column
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`flex flex-col w-72 ${isDragging ? 'scale-[1.02] shadow-lg z-10 cursor-grab active:cursor-grabbing' : 'hover:shadow-md cursor-grab active:cursor-grabbing'} ${isActiveDropContainer ? 'border-2 border-blue-400 bg-blue-50 dark:bg-blue-900/20' : ''} bg-gray-100 dark:bg-gray-800/50 rounded-lg transition-colors duration-200 border border-gray-300 dark:border-gray-700`}
    >
      <div 
        className="flex items-center justify-between p-3 rounded-t-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600"
        {...listeners}
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
            <div className="absolute mt-8 bg-white dark:bg-gray-800 shadow-lg rounded-md p-1 z-[100] -right-3 w-48">
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
      
      <SortableContext items={column.tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
        <div
          className={`flex-1 min-h-[100px] overflow-y-auto p-2 rounded-b-lg ${isActiveDropContainer ? 'bg-blue-100/50 dark:bg-blue-800/30' : 'bg-gray-100/50 dark:bg-gray-700/30'}`}
          data-id={column.id}
          data-type="Column"
        >
          {column.tasks && Array.isArray(column.tasks) ? 
            column.tasks.map((task) => (
              <div key={`${task.id}`} className="group">
                <SortableTask 
                  task={task} 
                  deleteTaskMutation={deleteTaskMutation}
                  updateTaskMutation={updateTaskMutation}
                  setEditingTaskId={setEditingTaskId}
                  className=""
                />
              </div>
            )) 
          : []
          }
          
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
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">Color:</span>
              <div className="flex gap-1">
                {['bg-red-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200', 'bg-pink-200'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-5 h-5 rounded-full border ${color} ${newTaskColors[column.id] === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                    onClick={() => {
                      setNewTaskColors(prev => ({
                        ...prev,
                        [column.id]: color
                      }));
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-8">
                Add Card
              </Button>
            </div>
          </form>
        </div>
      </SortableContext>
    </div>
  );
};

// Drag Overlay Column Component to display during dragging
export const ColumnDragOverlay = ({ 
  column,
  newTaskTitle,
  newTaskColors,
  setNewTaskTitle,
  setNewTaskColors,
  handleCreateTask,
  deleteTaskMutation,
  updateTaskMutation,
  setEditingTaskId,
  deleteColumnMutation,
  columnToDelete,
  setColumnToDelete,
  isActiveDropContainer = false
}: SortableColumnProps) => {
  const [showColumnOptions, setShowColumnOptions] = useState(false);

  return (
    <div
      className={`flex flex-col w-72 scale-[1.02] shadow-lg z-10 cursor-grab ${isActiveDropContainer ? 'border-2 border-blue-400 bg-blue-50 dark:bg-blue-900/20' : ''} bg-gray-100 dark:bg-gray-800/50 rounded-lg transition-colors duration-200 border border-gray-300 dark:border-gray-700`}
    >
      <div 
        className="flex items-center justify-between p-3 rounded-t-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600"
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
            <div className="absolute mt-8 bg-white dark:bg-gray-800 shadow-lg rounded-md p-1 z-[100] -right-3 w-48">
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
      
      <div
        className={`flex-1 min-h-[100px] overflow-y-auto p-2 rounded-b-lg ${isActiveDropContainer ? 'bg-blue-100/50 dark:bg-blue-800/30' : 'bg-gray-100/50 dark:bg-gray-700/30'}`}
      >
        {column.tasks && Array.isArray(column.tasks) ? 
          column.tasks.map((task) => (
            <div key={`${task.id}`} className="group">
              <TaskDragOverlay 
                task={task} 
                deleteTaskMutation={deleteTaskMutation}
                updateTaskMutation={updateTaskMutation}
                setEditingTaskId={setEditingTaskId}
              />
            </div>
          )) 
        : []
        }
        
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
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">Color:</span>
            <div className="flex gap-1">
              {[
                'bg-red-200 dark:bg-red-600',
                'bg-blue-200 dark:bg-blue-600', 
                'bg-green-200 dark:bg-green-600',
                'bg-yellow-200 dark:bg-yellow-600',
                'bg-purple-200 dark:bg-purple-600',
                'bg-pink-200 dark:bg-pink-600'
              ].map((color) => {
                const isSelected = newTaskColors[column.id] === color;
                return (
                  <button
                    key={color}
                    type="button"
                    className={`w-5 h-5 rounded-full border ${color} ${isSelected ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-300' : ''}`}
                    onClick={() => {
                      setNewTaskColors(prev => ({
                        ...prev,
                        [column.id]: color
                      }));
                    }}
                  />
                );
              })}
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-8">
              Add Card
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};