import "./globals.css";

export const metadata = {
  title: "BeforeYouGo"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
