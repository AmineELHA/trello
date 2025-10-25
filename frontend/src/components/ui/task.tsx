"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  labels?: string[];
  checklists?: ChecklistItem[];
  attachments?: string[];
  position: number;
  columnId: string;
  onUpdate: (id: string, updates: Partial<TaskProps>) => void;
  onDelete: (id: string) => void;
  className?: string;
};

export function TaskComponent({ 
  id, 
  title, 
  description, 
  dueDate, 
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
    });
  };

  const handleSave = () => {
    onUpdate(id, editValues);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValues({
      title,
      description: description || "",
      dueDate: dueDate || "",
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
          <Input
            type="date"
            value={editValues.dueDate.split('T')[0]} // Extract date part
            onChange={(e) => handleInputChange('dueDate', e.target.value)}
            className="text-xs mb-2"
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
        <Card className="p-3 bg-card hover:shadow-md transition-shadow cursor-pointer">
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
                <h4 className="font-medium text-sm truncate">{title}</h4>
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
                  <span>{new Date(dueDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-end gap-1">
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