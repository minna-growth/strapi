"use client";
import React from "react";

type FormSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: Array<{ v: string; t: string }>;
};

function hasValue(str?: string) {
  if (typeof str !== "string") return false;
  // Replacing &nbsp
  return str.replace(/^[s ]+|[s ]+$/g, "").length > 0;
}

const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  function FormSelect({ options, className = "", ...props }, ref) {
    return React.createElement(
      "select",
      { className: className + " w-select", ...props, ref },
      options.map(({ v, t }, index) =>
        React.createElement(
          "option",
          { key: index, value: hasValue(v) ? v : "" },
          hasValue(t) ? t : ""
        )
      )
    );
  }
);

export default FormSelect;
