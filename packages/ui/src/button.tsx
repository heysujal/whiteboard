"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  className?: string;
  appName: string;
  style: CSSStyleSheet
}

export const Button = ({ children, className, appName, onClick, style }: ButtonProps) => {
  return (
    <button
      className={className}
      onClick={onClick}
      style={style}
    >
      {children}
    </button>
  );
};
