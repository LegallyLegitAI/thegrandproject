
"use client";
import React from 'react';
import { icons } from './data';

type IconName = keyof typeof icons;

interface IconProps {
  name: IconName;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, className }) => {
  const iconHtml = icons[name];
  if (!iconHtml) return null;

  return (
    <span
      className={`icon ${name} ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: iconHtml }}
    />
  );
};
