import "./globals.css";

export const metadata = {
  title: "AI Collections Console",
  description: "Human-reviewed AR recovery workflow demo"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
