"use client"

import * as React from "react"
import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TimePickerProps {
  time: string | undefined;
  onTimeChange: (time: string) => void;
  className?: string;
}

export function TimePicker({ time, onTimeChange, className }: TimePickerProps) {
  // Generate hour options (00-23)
  const hours = Array.from({ length: 24 }, (_, i) => 
    i.toString().padStart(2, '0')
  );

  // Generate minute options (00-59, in 5 minute increments to keep it manageable)
  const minutes = Array.from({ length: 12 }, (_, i) => 
    (i * 5).toString().padStart(2, '0')
  );

  // Extract current hour and minute or default to '00'
  const [currentHour, currentMinute] = time ? time.split(':') : ['00', '00'];

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="relative w-full">
        <Select value={currentHour} onValueChange={(value) => onTimeChange(`${value}:${currentMinute}`)}>
          <SelectTrigger className="w-full">
            <Clock className="mr-2 h-4 w-4 opacity-50" />
            <SelectValue placeholder="HH" />
          </SelectTrigger>
          <SelectContent>
            {hours.map(hour => (
              <SelectItem key={hour} value={hour}>{hour}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <span className="text-muted-foreground">:</span>
      <div className="relative w-full">
        <Select value={currentMinute} onValueChange={(value) => onTimeChange(`${currentHour}:${value}`)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="MM" />
          </SelectTrigger>
          <SelectContent>
            {minutes.map(minute => (
              <SelectItem key={minute} value={minute}>{minute}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}