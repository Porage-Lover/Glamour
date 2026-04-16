import './globals.css';
import { CartProvider } from '@/components/CartProvider';

export const metadata = {
  title: 'Glamour — Premium Cosmetics & Beauty',
  description: 'Discover true beauty with Glamour\'s curated collection of premium skincare, makeup, fragrances, and haircare products. A Cosmetic Shop Retail System.',
  icons: { icon: '/favicon.png' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
