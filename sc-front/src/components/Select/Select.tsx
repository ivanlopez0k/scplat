import type { ReactElement, ChangeEvent } from "react";
import "./Select.css";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps {
  id: string;
  name: string;
  value: string | number;
  options: SelectOption[];
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export default function Select({
  id,
  name,
  value,
  options,
  onChange,
  placeholder = "Seleccionar",
  disabled = false,
  error,
}: SelectProps): ReactElement {
  return (
    <div className={`select-wrapper ${error ? "select-wrapper--error" : ""}`}>
      <select
        id={id}
        name={name}
        className="select"
        value={value}
        onChange={onChange}
        disabled={disabled}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="select-arrow">▼</span>
      {error && <span className="select-error">{error}</span>}
    </div>
  );
}
