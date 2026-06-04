import type { Metadata } from "next";
import { Poppins } from "next/font/google"; 
import { Toaster } from "sonner"; 
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"; // Import Provider

// Styled to match your exact vibrant UI design specifications
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Finlamma | Gamified Financial Literacy",
  description: "Master the stock market through interactive modules and real-time paper trading simulation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
      suppressHydrationWarning // Prevents browser extensions from causing layout flashing
    >
      <body className="min-h-full flex flex-col bg-gray-50 dark:bg-zinc-950 font-sans">
        <ThemeProvider>
        {children}
        
        {/* Global confirmation feedback portal for authentication pipelines */}
        <Toaster richColors closeButton position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}