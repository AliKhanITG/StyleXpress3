import { Montserrat } from "next/font/google";
import "./Globals.css";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata = {
  title: "StyleLab 3.0 — AI-Powered Catalog Platform",
  description: "Enterprise-grade AI-powered SaaS Catalog Management Platform for global garment industry",
  icons: {
    icon: "/img/logo/favicon.png",
    shortcut: "/img/logo/favicon.png",
    apple: "/img/logo/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={montserrat.className}>{children}</body>
    </html>
  );
}
