'use client';

import { useState } from 'react';

export default function CounterButton() {
  const [count, setCount] = useState<number>(0);

  const handleClick = () => {
    setCount(count + 1);
  };

  return (
    <button
      onClick={handleClick}
      className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-lg transition-all duration-200 text-base sm:text-lg shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
    >
      count is {count}
    </button>
  );
}