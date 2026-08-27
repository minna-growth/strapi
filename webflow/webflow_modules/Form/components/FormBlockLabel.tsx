"use client";
import React from "react";

const FormBlockLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(function FormBlockLabel(props, ref) {
  return React.createElement("label", { ...props, ref });
});

export default FormBlockLabel;
