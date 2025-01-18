// components/ThemeProviderWrapper.js
"use client";

import { ThemeProvider } from "./ThemeContext";

export default function ThemeProviderWrapper({
  children,
}: {
  children: React.FC;
}) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
