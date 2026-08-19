import './globals.css';
import './rankings-v2.css';
import './scale-transparency.css';

export const metadata = {
  title: 'LLM Index — Venice + Morpheus Text Models',
  description: 'Source-native text-model rankings with explicit benchmark scales, transparent evidence fallbacks, provider availability, pricing and direct provenance across Venice and Morpheus.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
