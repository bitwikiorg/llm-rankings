import './globals.css';

export const metadata = {
  title: 'LLM Power Rankings',
  description: 'Research-backed text-model rankings across Venice and Morpheus.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
