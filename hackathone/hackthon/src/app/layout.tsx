import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wiregen AI x Xipra Technology | Hackathon",
  description: "Join the ultimate hackathon presented by Wiregen AI and Xipra Technology. Compete in Graphics Design, Frontend, and Fullstack categories.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
