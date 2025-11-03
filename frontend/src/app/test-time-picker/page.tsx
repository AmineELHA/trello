'use client';

import { useState } from 'react';
import { TimePicker } from '@/components/ui/time-picker';

export default function TestTimePickerPage() {
  const [time, setTime] = useState<string>('12:30');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Time Picker Test</h1>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Select Time
          </label>
          <TimePicker time={time} onTimeChange={setTime} />
        </div>
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <p className="text-gray-700 dark:text-gray-300">
            Selected time: <span className="font-mono">{time}</span>
          </p>
        </div>
      </div>
    </div>
  );
}