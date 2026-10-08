import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Formly — Build Forms, Your Way",
  description: "Create beautiful forms with flexible themes, fast respondent flows, and powerful insights.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen selection:bg-[#563BFA]/20 selection:text-[#563BFA]">
        {children}
      </body>
    </html>
  );
}
