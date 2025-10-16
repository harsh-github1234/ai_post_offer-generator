import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

export const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block mb-2 text-sm font-medium text-slate-300">
        {label}
      </label>
      <input
        id={id}
        className="bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition duration-200"
        {...props}
      />
    </div>
  );
};