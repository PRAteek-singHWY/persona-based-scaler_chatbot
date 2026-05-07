import "./globals.css";

export const metadata = {
  title: "NotebookLM RAG - Assignment 03",
  description: "A professional RAG-powered document analysis tool.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
