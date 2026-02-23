import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Concept Map",
  description: "Generate and explore dynamic concept maps powered by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}