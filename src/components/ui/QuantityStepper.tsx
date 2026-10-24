"use client";

import { MAX_QTY } from "@/lib/cart-store";
import { MinusIcon, PlusIcon } from "./icons";

interface Props {
  value: number;
  onChange: (next: number) => void;
  label: string;
  /** Allow stepping down to zero (which removes the line). */
  allowZero?: boolean;
  tone?: "light" | "dark";
}

export function QuantityStepper({ value, onChange, label, allowZero = true, tone = "light" }: Props) {
  const min = allowZero ? 0 : 1;
  const border = tone === "dark" ? "border-bone/25" : "border-charcoal/20";
  return (
    <div className={`inline-flex items-center border ${border}`} role="group" aria-label={`Quantity for ${label}`}>
      <button
        type="button"
        className="grid size-8 place-items-center transition-opacity hover:opacity-60 disabled:opacity-25"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={value === 1 && allowZero ? `Remove ${label}` : `Decrease quantity of ${label}`}
      >
        <MinusIcon width={14} height={14} />
      </button>
      <output className="w-7 text-center text-sm tabular-nums" aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        className="grid size-8 place-items-center transition-opacity hover:opacity-60 disabled:opacity-25"
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_QTY}
        aria-label={`Increase quantity of ${label}`}
      >
        <PlusIcon width={14} height={14} />
      </button>
    </div>
  );
}
