import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";

interface ChecklistItem {
  id?: string;
  description: string;
  completed: boolean;
}

interface ChecklistProps {
  items: ChecklistItem[];
  onItemsChange: (items: ChecklistItem[]) => void;
  className?: string;
}

const Checklist: React.FC<ChecklistProps> = ({ 
  items, 
  onItemsChange, 
  className = "" 
}) => {
  const [newItemText, setNewItemText] = React.useState("");

  const handleAddItem = () => {
    if (newItemText.trim() !== "") {
      const newItem: ChecklistItem = {
        id: Date.now().toString(), // Simple ID generation
        description: newItemText,
        completed: false,
      };
      onItemsChange([...items, newItem]);
      setNewItemText("");
    }
  };

  const handleToggleItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      completed: !updatedItems[index].completed,
    };
    onItemsChange(updatedItems);
  };

  const handleUpdateItem = (index: number, description: string) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      description,
    };
    onItemsChange(updatedItems);
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onItemsChange(updatedItems);
  };

  // Calculate completion percentage
  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className={`border rounded-lg p-3 ${className}`}>
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-sm text-gray-900 dark:text-white">Checklist</h4>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {completedCount} of {totalCount} completed
          </span>
        </div>
        
        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-3">
            <div 
              className="bg-green-500 h-1.5 rounded-full" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        )}
      </div>

      {/* Add new item */}
      <div className="flex gap-2 mb-3">
        <Input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Add an item..."
          className="text-sm h-8"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAddItem();
            }
          }}
        />
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleAddItem}
          className="h-8"
          disabled={!newItemText.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={item.id || index} className="flex items-center gap-2 group">
            <Checkbox
              checked={item.completed}
              onCheckedChange={() => handleToggleItem(index)}
            />
            <Input
              type="text"
              value={item.description}
              onChange={(e) => handleUpdateItem(index, e.target.value)}
              className={`flex-1 text-sm h-8 border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 ${
                item.completed 
                  ? 'line-through text-gray-500 dark:text-gray-400' 
                  : 'text-gray-900 dark:text-white'
              }`}
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleDeleteItem(index)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export { Checklist, type ChecklistItem };