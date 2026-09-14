import { Analytics } from '@vercel/analytics/next';
import "./globals.css";

export const metadata = {
  title: "Stone & Set Concrete | Central Indiana Concrete Contractor",
  description: "Driveways, patios, walkways, slabs, decorative concrete, and repairs for Central Indiana and surrounding counties.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
