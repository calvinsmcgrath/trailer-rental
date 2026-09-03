"use client";

import { useState } from "react";
import { DayPicker, type DateRange, type Matcher } from "react-day-picker";

const classNames = {
  root: "text-[var(--color-text)]",
  months: "flex flex-col items-center",
  month: "grid w-full grid-cols-[1fr_auto_auto_1fr] grid-rows-[auto_auto] items-center gap-y-4",
  month_caption: "col-start-2 row-start-1 flex h-9 items-center justify-center whitespace-nowrap",
  caption_label: "text-sm font-medium",
  nav: "col-start-3 row-start-1 flex h-9 items-center gap-1",
  button_previous:
    "flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)] disabled:opacity-30",
  button_next:
    "flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)] disabled:opacity-30",
  chevron: "fill-current w-4 h-4",
  month_grid: "col-span-4 row-start-2 w-full border-collapse",
  weekdays: "flex justify-center",
  weekday: "w-9 text-center text-xs font-medium text-[var(--color-text-faint)] pb-1",
  week: "flex w-full justify-center",
  day: "w-9 h-9 p-0 text-center text-sm relative",
  day_button:
    "w-9 h-9 rounded-md flex items-center justify-center hover:bg-[var(--color-surface-raised)] transition-colors",
  today:
    "font-semibold after:pointer-events-none after:absolute after:inset-0.5 after:rounded-full after:border-2 after:border-[var(--color-accent)]",
  outside: "text-[var(--color-text-faint)] opacity-40",
  disabled: "text-[var(--color-text-faint)] opacity-30 line-through cursor-not-allowed",
  selected: "",
  range_start: "!bg-[var(--color-accent)] !text-white rounded-l-md",
  range_end: "!bg-[var(--color-accent)] !text-white rounded-r-md",
  range_middle: "bg-[var(--color-accent)]/20 rounded-none",
};

const modifiersClassNames = {
  preview: "bg-[var(--color-accent)]/10 rounded-none",
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
  const [hoveredDay, setHoveredDay] = useState<Date | undefined>();

  // Once a start date is picked, preview the range between it and whatever day
  // the user is currently hovering — a single click already books that one day,
  // so this is what shows them the range growing before a second click extends it.
  const previewRange: DateRange | undefined =
    selected?.from && hoveredDay
      ? hoveredDay < selected.from
        ? { from: hoveredDay, to: selected.from }
        : { from: selected.from, to: hoveredDay }
      : undefined;

  return (
    <DayPicker
      mode="range"
      navLayout="after"
      selected={selected}
      onSelect={onSelect}
      disabled={disabled}
      excludeDisabled
      min={min}
      classNames={classNames}
      modifiers={previewRange ? { preview: previewRange } : undefined}
      modifiersClassNames={modifiersClassNames}
      onDayMouseEnter={(date) => setHoveredDay(date)}
      onDayMouseLeave={() => setHoveredDay(undefined)}
    />
  );
}
