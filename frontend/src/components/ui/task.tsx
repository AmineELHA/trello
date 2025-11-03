"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { 
  Calendar, 
  Clock, 
  MoreHorizontal, 
  GripVertical, 
  CheckCircle, 
  Circle,
  Trash2,
  Edit3
} from "lucide-react";
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type ChecklistItem = {
  id?: string;
  description: string;
  completed: boolean;
};

type TaskProps = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  reminderDate?: string;
  labels?: string[];
  checklists?: ChecklistItem[];
  attachments?: string[];
  position: number;
  columnId: string;
  completed?: boolean;
  onUpdate: (id: string, updates: Partial<TaskProps>) => void;
  onDelete: (id: string) => void;
  className?: string;
};

export function TaskComponent({ 
  id, 
  title, 
  description, 
  dueDate, 
  reminderDate,
  completed,
  labels = [], 
  checklists = [], 
  attachments = [],
  position,
  columnId,
  onUpdate, 
  onDelete,
  className 
}: TaskProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    title,
    description: description || "",
    dueDate: dueDate || "",
    reminderDate: reminderDate || "",
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditValues({
      title,
      description: description || "",
      dueDate: dueDate || "",
      reminderDate: reminderDate || "",
    });
  };

  const handleSave = () => {
    // Process the date values to ensure they're in proper ISO format
    const processedValues = {
      ...editValues,
      dueDate: editValues.dueDate ? new Date(editValues.dueDate).toISOString() : undefined,
      reminderDate: editValues.reminderDate ? new Date(editValues.reminderDate).toISOString() : undefined,
    };
    onUpdate(id, processedValues);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValues({
      title,
      description: description || "",
      dueDate: dueDate || "",
      reminderDate: reminderDate || "",
    });
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof typeof editValues, value: string) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculate completion percentage for checklists
  const completedCount = checklists.filter(item => item.completed).length;
  const totalCount = checklists.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`${className} ${isOver ? 'ring-2 ring-blue-400 ring-opacity-50 rounded' : ''} mb-2`}
    >
      {isEditing ? (
        <Card className="p-3 bg-card shadow-sm">
          <Input
            value={editValues.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="font-medium mb-2 text-sm"
          />
          <Textarea
            value={editValues.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Add a description..."
            className="text-xs mb-2"
            rows={2}
          />
          <DateTimePicker
            date={editValues.dueDate ? new Date(editValues.dueDate) : undefined}
            time={editValues.dueDate ? new Date(editValues.dueDate).toTimeString().substring(0, 5) : undefined}
            onDateChange={(date) => {
              const timePart = editValues.dueDate ? new Date(editValues.dueDate).toTimeString().substring(0, 5) : "00:00";
              handleInputChange(
                'dueDate',
                date ? new Date(`${date}T${timePart}`).toISOString() : ''
              );
            }}
            onTimeChange={(time) => {
              const datePart = editValues.dueDate ? new Date(editValues.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
              handleInputChange(
                'dueDate',
                new Date(`${datePart}T${time}:00.000Z`).toISOString()
              );
            }}
            className="mb-2"
          />
          <DateTimePicker
            date={editValues.reminderDate ? new Date(editValues.reminderDate) : undefined}
            time={editValues.reminderDate ? new Date(editValues.reminderDate).toTimeString().substring(0, 5) : undefined}
            onDateChange={(date) => {
              const timePart = editValues.reminderDate ? new Date(editValues.reminderDate).toTimeString().substring(0, 5) : "00:00";
              handleInputChange(
                'reminderDate',
                date ? new Date(`${date}T${timePart}`).toISOString() : ''
              );
            }}
            onTimeChange={(time) => {
              const datePart = editValues.reminderDate ? new Date(editValues.reminderDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
              handleInputChange(
                'reminderDate',
                new Date(`${datePart}T${time}:00.000Z`).toISOString()
              );
            }}
            className="mb-2"
          />
          <div className="flex gap-2 mt-2">
            <Button 
              size="sm" 
              onClick={handleSave}
              className="h-7 text-xs"
            >
              Save
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleCancel}
              className="h-7 text-xs"
            >
              Cancel
            </Button>
          </div>
        </Card>
      ) : (
        <Card className={`p-3 bg-card hover:shadow-md transition-shadow cursor-pointer ${completed ? 'opacity-70 bg-green-50 dark:bg-green-900/20' : ''}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <button 
                  {...attributes}
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </button>
                <h4 className={`font-medium text-sm truncate ${completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>{title}</h4>
              </div>
              
              {description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
              )}
              
              {labels.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {labels.map((label, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {label}
                    </Badge>
                  ))}
                </div>
              )}
              
              {checklists.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div 
                        className="bg-primary h-1.5 rounded-full" 
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                    <span>{completedCount}/{totalCount}</span>
                  </div>
                </div>
              )}
              
              {dueDate && (
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Due: {new Date(dueDate).toLocaleDateString()}</span>
                </div>
              )}
              {reminderDate && (
                <div className="flex items-center gap-1 mt-1 text-xs text-blue-500">
                  <Clock className="h-3 w-3" />
                  <span>Reminder: {new Date(reminderDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate(id, { completed: !(completed || false) });
                }}
              >
                {(completed || false) ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-gray-400" />}
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit();
                }}
              >
                <Edit3 className="h-3 w-3" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6 text-red-500 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}