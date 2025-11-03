'use client';

import { useState } from 'react';
import { DateTimePicker } from '@/components/ui/date-time-picker';

export default function TestCalendarPage() {
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [dueTime, setDueTime] = useState<string>('12:00');
  const [reminderDate, setReminderDate] = useState<Date | undefined>(undefined);
  const [reminderTime, setReminderTime] = useState<string>('09:00');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Calendar Test</h1>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Due Date & Time
          </label>
          <DateTimePicker 
            date={dueDate} 
            time={dueTime}
            onDateChange={setDueDate}
            onTimeChange={setDueTime}
            className="mb-4" 
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Reminder Date & Time
          </label>
          <DateTimePicker 
            date={reminderDate} 
            time={reminderTime}
            onDateChange={setReminderDate}
            onTimeChange={setReminderTime}
            className="mb-4" 
          />
        </div>

        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <p className="text-gray-700 dark:text-gray-300">
            Due Date: {dueDate ? dueDate.toISOString() : 'Not set'}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Due Time: {dueTime}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Reminder Date: {reminderDate ? reminderDate.toISOString() : 'Not set'}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Reminder Time: {reminderTime}
          </p>
        </div>
      </div>
    </div>
  );
}