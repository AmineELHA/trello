"use client"

import * as React from "react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { DatePicker } from "@/components/ui/date-picker"
import { TimePicker } from "@/components/ui/time-picker"

interface DateTimePickerProps {
  date: Date | undefined;
  time: string | undefined;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
  className?: string;
}

export function DateTimePicker({ 
  date, 
  time, 
  onDateChange, 
  onTimeChange, 
  className 
}: DateTimePickerProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-2", className)}>
      <DatePicker 
        date={date} 
        onDateChange={onDateChange} 
        className="w-full" 
      />
      <TimePicker 
        time={time} 
        onTimeChange={onTimeChange} 
        className="w-full" 
      />
    </div>
  )
}