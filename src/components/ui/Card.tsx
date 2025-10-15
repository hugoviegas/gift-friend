"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

/**
 * Card container component for grouping related content
 */
export function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`
        rounded-lg border border-slate-200 dark:border-slate-700
        bg-white dark:bg-slate-800
        shadow-sm
        ${hover ? "hover:shadow-md transition-shadow" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/**
 * Card header section
 */
export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <div
      className={`
        px-6 py-4
        border-b border-slate-200 dark:border-slate-700
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/**
 * Card body/content section
 */
export function CardBody({ children, className = "" }: CardBodyProps) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

/**
 * Card footer section
 */
export function CardFooter({ children, className = "" }: CardFooterProps) {
  return (
    <div
      className={`
        px-6 py-4
        border-t border-slate-200 dark:border-slate-700
        bg-slate-50 dark:bg-slate-900/50
        rounded-b-lg
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default Card;
