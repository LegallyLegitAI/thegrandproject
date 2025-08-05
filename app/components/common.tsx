import React from 'react';

// ADDED: The missing Button component.
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}
export const Button = ({ children, variant = 'primary', ...props }: ButtonProps) => {
  const baseStyle = "px-4 py-2 rounded-md font-semibold transition-colors";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
    ghost: "text-gray-700 hover:bg-gray-100",
  };
  return <button className={`${baseStyle} ${variants[variant]}`} {...props}>{children}</button>;
};

// ADDED: The missing Progress component.
interface ProgressProps {
  value: number;
}
export const Progress = ({ value }: ProgressProps) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className="bg-blue-600 h-2.5 rounded-full"
        style={{ width: `${value}%`, transition: 'width 0.5s ease-in-out' }}
      ></div>
    </div>
  );
};