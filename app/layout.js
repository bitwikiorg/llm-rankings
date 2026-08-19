import './globals.css';

export const metadata = {
  title: 'LLM Index — Venice + Morpheus Text Models',
  description: 'Source-native text-model rankings, provider availability, pricing, technical metadata and comparisons across Venice and Morpheus.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
