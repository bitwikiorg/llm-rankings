import './globals.css';

export const metadata = {
  title: 'LLM Index — Venice × Morpheus',
  description: 'A compact, source-linked ranking index for text models available through Venice and Morpheus across capability, reasoning, coding, agents, value, price and context.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
