import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "@/components/ui/ToastContainer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MedAxis HMS | Hospital Management System",
    template: "%s | MedAxis HMS",
  },
  description:
    "Modern international Hospital Management System for patient records, physician scheduling, clinical appointments, ward beds, and medical billing.",
};

const themeInitScript = `(function(){try{var t=localStorage.getItem("theme");if(!t){var raw=localStorage.getItem("medaxis-hms-storage-v1");if(raw){var parsed=JSON.parse(raw);if(parsed&&parsed.state&&parsed.state.theme){t=parsed.state.theme;}}}if(t==="dark"||t==="light"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <a href="#main-content" className="sr-only sr-only-focusable">
          Skip to main content
        </a>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
