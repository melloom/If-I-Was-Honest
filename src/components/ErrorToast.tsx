import React from 'react';

export function ErrorToast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 transform -translate-x-1/2 bg-red-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-4 animate-fade-in">
      <span className="font-medium text-base">{message}</span>
      <button
        onClick={onClose}
        className="ml-4 px-3 py-1 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-40 text-white font-semibold text-sm transition-all"
        aria-label="Close error message"
      >
        ×
      </button>
    </div>
  );
}

// CSS (add to your global CSS or Tailwind config):
// .animate-fade-in { animation: fadeIn 0.3s ease; }
// @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
