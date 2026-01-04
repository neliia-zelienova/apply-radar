import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type InputNumberProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  buttonsClassName?: string;
};

export const InputNumber: React.FC<InputNumberProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled = false,
  className,
  inputClassName,
  buttonsClassName,
}) => {
  const holdIntervalRef = React.useRef<number | null>(null);
  const holdTimeoutRef = React.useRef<number | null>(null);
  const holdSpeedRef = React.useRef<number>(200); // ms between repeats, will accelerate
  const valueRef = React.useRef<number>(value);

  React.useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const clamp = (v: number) => {
    if (typeof min === "number" && v < min) return min;
    if (typeof max === "number" && v > max) return max;
    return v;
  };

  const applyChange = (delta: number) => {
    const current = valueRef.current;
    const next = clamp(current + delta);
    console.log(
      "applyChange called, current value:",
      current,
      "delta:",
      delta,
      "next value:",
      next
    );
    if (next !== current) {
      onChange(next);
      valueRef.current = next;
    } else {
      // reached boundary; stop any ongoing hold
      stopHold();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow empty to let user type
    if (raw === "") {
      onChange(typeof min === "number" ? min : 0);
      return;
    }
    const parsed = Number(raw);
    if (!Number.isNaN(parsed)) {
      onChange(clamp(parsed));
    }
  };

  const startHold = (
    direction: 1 | -1,
    e?: React.PointerEvent | React.MouseEvent | React.TouchEvent
  ) => {
    console.log("startHold called");
    if (disabled) return;
    if (e && typeof (e as any).preventDefault === "function")
      (e as any).preventDefault();
    // initial change on press
    applyChange(direction * step);
    // after short delay, start repeating
    holdSpeedRef.current = 200;
    holdTimeoutRef.current = window.setTimeout(() => {
      holdIntervalRef.current = window.setInterval(() => {
        applyChange(direction * step);
        // accelerate down to a floor
        if (holdSpeedRef.current > 60) {
          holdSpeedRef.current = Math.max(60, holdSpeedRef.current - 20);
          if (holdIntervalRef.current) {
            window.clearInterval(holdIntervalRef.current);
            holdIntervalRef.current = window.setInterval(() => {
              applyChange(direction * step);
            }, holdSpeedRef.current);
          }
        }
      }, holdSpeedRef.current);
    }, 250);
    // stop on global pointer up/cancel to ensure reliability
    const stopOnGlobal = () => stopHold();
    window.addEventListener("pointerup", stopOnGlobal, { once: true });
    window.addEventListener("pointercancel", stopOnGlobal, { once: true });
  };

  const stopHold = () => {
    console.log("stopHold called");
    if (holdTimeoutRef.current) {
      window.clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (holdIntervalRef.current) {
      window.clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  React.useEffect(() => {
    return () => stopHold();
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      applyChange(step);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      applyChange(-step);
    }
  };

  return (
    <div
      className={`relative inline-flex items-center gap-2 border rounded px-2 py-1 w-24 bg-teal-400/10 dark:bg-black/20 border focus-within:ring-2 focus-within:ring-teal-500 transition-colors ${
        className ?? ""
      }`}
    >
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        onKeyDown={onKeyDown}
        onBlur={stopHold}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        role="spinbutton"
        aria-valuemin={typeof min === "number" ? min : undefined}
        aria-valuemax={typeof max === "number" ? max : undefined}
        aria-valuenow={value}
        aria-disabled={disabled || undefined}
        inputMode="numeric"
        pattern="[0-9]*"
        className={`border-none text-right focus:outline-none rounded-none bg-transparent appearance-none no-spin p-0 ${
          inputClassName ?? ""
        }`}
      />
      <div
        className={`relative w-4 flex flex-col select-none ${
          buttonsClassName ?? ""
        }`}
      >
        <button
          type="button"
          aria-label="Increment"
          disabled={disabled || (typeof max === "number" && value >= max)}
          onPointerDown={(e) => startHold(1, e)}
          onPointerUp={stopHold}
          onBlur={stopHold}
          className="py-0.5 px-1 hover:bg-teal-300/20 rounded absolute bottom-0 right-0"
        >
          <ChevronUp className="h-2 w-4" />
        </button>
        <button
          type="button"
          aria-label="Decrement"
          disabled={disabled || (typeof min === "number" && value <= min)}
          onPointerDown={(e) => startHold(-1, e)}
          onPointerUp={stopHold}
          onBlur={stopHold}
          className="py-0.5 px-1 hover:bg-teal-300/20 rounded absolute top-0 right-0"
        >
          <ChevronDown className="h-2 w-4" />
        </button>
      </div>
    </div>
  );
};
