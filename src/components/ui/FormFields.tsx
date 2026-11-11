"use client";

import React, { useId } from "react";
import { cn } from "@/lib/cn";

interface BaseFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

const baseInputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-sky-400";

export interface TextInputProps
  extends BaseFieldProps,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, hint, required, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div className={cn("space-y-1.5", className)}>
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300"
        >
          {label}
          {required && (
            <span aria-hidden="true" className="ml-0.5 text-rose-500">
              *
            </span>
          )}
        </label>
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? errorId : hint ? hintId : undefined
          }
          className={cn(
            baseInputClass,
            error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
          )}
          {...props}
        />
        {hint && !error && (
          <p id={hintId} className="text-xs text-slate-500 dark:text-slate-400">
            {hint}
          </p>
        )}
        {error && (
          <p
            id={errorId}
            role="alert"
            className="text-xs font-medium text-rose-600 dark:text-rose-400"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);
TextInput.displayName = "TextInput";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectInputProps
  extends BaseFieldProps,
    Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "className"> {
  options: SelectOption[];
  placeholder?: string;
}

export const SelectInput = React.forwardRef<HTMLSelectElement, SelectInputProps>(
  (
    { label, error, hint, required, className, id, options, placeholder, ...props },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const errorId = `${selectId}-error`;

    return (
      <div className={cn("space-y-1.5", className)}>
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300"
        >
          {label}
          {required && (
            <span aria-hidden="true" className="ml-0.5 text-rose-500">
              *
            </span>
          )}
        </label>
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            baseInputClass,
            error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {hint && !error && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
        )}
        {error && (
          <p
            id={errorId}
            role="alert"
            className="text-xs font-medium text-rose-600 dark:text-rose-400"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);
SelectInput.displayName = "SelectInput";

export interface TextareaInputProps
  extends BaseFieldProps,
    Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {}

export const TextareaInput = React.forwardRef<
  HTMLTextAreaElement,
  TextareaInputProps
>(({ label, error, hint, required, className, id, rows = 3, ...props }, ref) => {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const errorId = `${textareaId}-error`;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={textareaId}
        className="block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300"
      >
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-rose-500">
            *
          </span>
        )}
      </label>
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          baseInputClass,
          "resize-y",
          error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
        )}
        {...props}
      />
      {hint && !error && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      )}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs font-medium text-rose-600 dark:text-rose-400"
        >
          {error}
        </p>
      )}
    </div>
  );
});
TextareaInput.displayName = "TextareaInput";
