"use client";

import { DayPicker, type DateRange, type Matcher } from "react-day-picker";

const classNames = {
  root: "text-[var(--color-text)]",
  months: "flex flex-col",
  month: "space-y-4",
  month_caption: "flex items-center justify-center h-9 relative",
  caption_label: "text-sm font-medium",
  nav: "flex items-center justify-between absolute inset-x-0 top-0 h-9 px-1 pointer-events-none",
  button_previous:
    "pointer-events-auto flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)] disabled:opacity-30",
  button_next:
    "pointer-events-auto flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)] disabled:opacity-30",
  chevron: "fill-current w-4 h-4",
  month_grid: "w-full border-collapse",
  weekdays: "flex",
  weekday: "w-9 text-center text-xs font-medium text-[var(--color-text-faint)] pb-1",
  week: "flex w-full",
  day: "w-9 h-9 p-0 text-center text-sm relative",
  day_button:
    "w-9 h-9 rounded-md flex items-center justify-center hover:bg-[var(--color-surface-raised)] transition-colors",
  today: "font-semibold",
  outside: "text-[var(--color-text-faint)] opacity-40",
  disabled: "text-[var(--color-text-faint)] opacity-30 line-through cursor-not-allowed",
  selected: "",
  range_start: "!bg-[var(--color-accent)] !text-white rounded-l-md",
  range_end: "!bg-[var(--color-accent)] !text-white rounded-r-md",
  range_middle: "bg-[var(--color-accent)]/20 rounded-none",
};

export function Calendar({
  selected,
  onSelect,
  disabled,
  min,
}: {
  selected: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
  disabled: Matcher | Matcher[];
  min?: number;
}) {
  return (
    <DayPicker
      mode="range"
      animate
      selected={selected}
      onSelect={onSelect}
      disabled={disabled}
      excludeDisabled
      min={min}
      classNames={classNames}
    />
  );
}
