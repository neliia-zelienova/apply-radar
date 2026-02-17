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
  // Local string state to preserve user input (including empty) while typing
  const [inputValue, setInputValue] = React.useState<string>(String(value));
  const holdIntervalRef = React.useRef<number | null>(null);
  const holdTimeoutRef = React.useRef<number | null>(null);
  const holdSpeedRef = React.useRef<number>(200); // ms between repeats, will accelerate
  const valueRef = React.useRef<number>(value);

  React.useEffect(() => {
    valueRef.current = value;
    // Sync local string state when external value changes
    setInputValue(String(value));
  }, [value]);

  const clamp = (v: number) => {
    if (typeof min === "number" && v < min) return min;
    if (typeof max === "number" && v > max) return max;
    return v;
  };

  const applyChange = (delta: number) => {
    const current = valueRef.current;
    const next = clamp(current + delta);
    if (next !== current) {
      onChange(next);
      valueRef.current = next;
      setInputValue(String(next));
    } else {
      // reached boundary; stop any ongoing hold
      stopHold();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Always update local string state, allow empty while typing
    setInputValue(raw);
    // Do not coerce or clamp on change; defer until blur/commit to avoid snapping
  };

  // Commit current inputValue on blur (coerce/clamp)
  const commitOnBlur = () => {
    const raw = inputValue;
    if (raw === "") {
      const fallback = typeof min === "number" ? min : 0;
      onChange(fallback);
      valueRef.current = fallback;
      setInputValue(String(fallback));
      return;
    }
    const parsed = Number(raw);
    if (!Number.isNaN(parsed)) {
      const next = clamp(parsed);
      onChange(next);
      valueRef.current = next;
      setInputValue(String(next));
    } else {
      // Non-numeric: revert to last valid value
      setInputValue(String(valueRef.current));
    }
  };

  const startHold = (
    direction: 1 | -1,
    e?: React.PointerEvent | React.MouseEvent | React.TouchEvent,
  ) => {
    if (disabled) return;
    if (e && typeof (e as any).preventDefault === "function")
      (e as any).preventDefault();
    // initial change on press
    applyChange(direction * step);
    // after short delay, start repeating
    holdSpeedRef.current = 200;
    holdTimeoutRef.current = window.setTimeout(() => {
      const repeatStep = () => {
        // if we've been stopped, don't schedule further repeats
        if (holdIntervalRef.current === null) {
          return;
        }
        applyChange(direction * step);
        // accelerate down to a floor
        if (holdSpeedRef.current > 60) {
          holdSpeedRef.current = Math.max(60, holdSpeedRef.current - 20);
        }
        // schedule next repeat with current speed
        holdIntervalRef.current = window.setTimeout(
          repeatStep,
          holdSpeedRef.current,
        );
      };
      // start the repeating loop
      holdIntervalRef.current = window.setTimeout(
        repeatStep,
        holdSpeedRef.current,
      );
    }, 250);
    // stop on global pointer up/cancel to ensure reliability
    const stopOnGlobal = () => stopHold();
    window.addEventListener("pointerup", stopOnGlobal, { once: true });
    window.addEventListener("pointercancel", stopOnGlobal, { once: true });
  };

  const stopHold = () => {
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
    } else if (e.key === "Enter") {
      // Commit on Enter
      e.preventDefault();
      commitOnBlur();
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
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={onKeyDown}
        onBlur={() => {
          stopHold();
          commitOnBlur();
        }}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        role="spinbutton"
        aria-valuemin={typeof min === "number" ? min : undefined}
        aria-valuemax={typeof max === "number" ? max : undefined}
        aria-valuenow={valueRef.current}
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
