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
  X, 
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
  position: number;
};

export type Column = {
  id: string;
  name: string;
  position: number;
  tasks: Task[];
};

// Sortable Task Component using DndKit
interface SortableTaskProps {
  task: Task;
  deleteTaskMutation: {
    mutate: (variables: { id: string }) => void;
    isPending?: boolean;
  };
  className?: string;
}

export const SortableTask = ({ 
  task, 
  deleteTaskMutation,
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
      className={`${isDragging ? 'shadow-lg scale-[1.02] z-20' : 'hover:shadow-md'} transition-all duration-150 mb-2 ${className}`}
    >
      <Card className={`p-3 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 ${isDragging ? 'opacity-90' : ''}`}>
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
  );
};

// Drag Overlay Task Component to display during dragging
interface TaskDragOverlayProps {
  task: Task;
  deleteTaskMutation: {
    mutate: (variables: { id: string }) => void;
    isPending?: boolean;
  };
}

export const TaskDragOverlay = ({ 
  task, 
  deleteTaskMutation
}: TaskDragOverlayProps) => {
  return (
    <Card className="p-3 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg scale-[1.02] opacity-90">
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
        
        <div className="flex flex-col items-end gap-1">
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
  );
};

// Sortable Column Component using DndKit
interface SortableColumnProps {
  column: Column;
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
}

export const SortableColumn = ({ 
  column,
  newTaskTitle,
  setNewTaskTitle,
  handleCreateTask,
  deleteTaskMutation,
  deleteColumnMutation,
  columnToDelete,
  setColumnToDelete
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
      className={`flex flex-col w-72 ${isDragging ? 'scale-[1.02] shadow-lg z-10' : ''} bg-gray-100 dark:bg-gray-800/50 rounded-lg`}
    >
      <div 
        className="flex items-center justify-between p-3 rounded-t-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
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
      
      <SortableContext items={column.tasks.map(task => task.id)} strategy={verticalListSortingStrategy} type="Task">
        <div
          className={`flex-1 min-h-[100px] overflow-y-auto p-2 rounded-b-lg bg-gray-100/50 dark:bg-gray-700/30`}
          data-id={column.id}
          data-type="Column"
        >
          {column.tasks && Array.isArray(column.tasks) ? 
            column.tasks.map((task) => (
              <div key={`${task.id}`} className="group">
                <SortableTask 
                  task={task} 
                  deleteTaskMutation={deleteTaskMutation}
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
      </SortableContext>
    </div>
  );
};

// Drag Overlay Column Component to display during dragging
export const ColumnDragOverlay = ({ 
  column,
  newTaskTitle,
  setNewTaskTitle,
  handleCreateTask,
  deleteTaskMutation,
  deleteColumnMutation,
  columnToDelete,
  setColumnToDelete
}: SortableColumnProps) => {
  const [showColumnOptions, setShowColumnOptions] = useState(false);

  return (
    <div
      className={`flex flex-col w-72 scale-[1.02] shadow-lg z-10 bg-gray-100 dark:bg-gray-800/50 rounded-lg`}
    >
      <div 
        className="flex items-center justify-between p-3 rounded-t-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
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
      
      <div
        className={`flex-1 min-h-[100px] overflow-y-auto p-2 rounded-b-lg bg-gray-100/50 dark:bg-gray-700/30`}
      >
        {column.tasks && Array.isArray(column.tasks) ? 
          column.tasks.map((task) => (
            <div key={`${task.id}`} className="group">
              <TaskDragOverlay 
                task={task} 
                deleteTaskMutation={deleteTaskMutation}
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
    </div>
  );
};