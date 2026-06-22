import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Q9 Chat Widget Example",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
