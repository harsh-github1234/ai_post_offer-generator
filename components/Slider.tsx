import React from 'react';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

export const Slider: React.FC<SliderProps> = ({ label, id, value, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block mb-3 text-sm font-medium text-slate-300">
        {label} <span className="font-bold text-purple-400 p-1 bg-slate-700 rounded-md">{value}</span>
      </label>
      <input
        id={id}
        type="range"
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
        {...props}
        value={value}
      />
    </div>
  );
};