import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Collections Console",
  description: "Human-reviewed AR recovery workflow demo"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
