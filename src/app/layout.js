import './globals.css';

export const metadata = {
  title: 'Modern Renovations Estimator',
  description: 'Get a quick and easy rough estimate for your bathroom remodel.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
