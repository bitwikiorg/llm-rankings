import './globals.css';
import './rankings-v2.css';

export const metadata = {
  title: 'LLM Index — Venice + Morpheus Text Models',
  description: 'Source-native text-model rankings with transparent evidence fallbacks, provider availability, pricing, technical metadata and comparisons across Venice and Morpheus.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
