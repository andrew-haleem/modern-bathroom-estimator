import { cookies } from 'next/headers';
import AdminDashboard from '@/components/AdminDashboard';
import AdminLogin from '@/components/AdminLogin';
import { getAllPricing } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  const cookieStore = cookies();
  const authCookie = cookieStore.get('admin_auth');
  const isAdmin = authCookie?.value === (process.env.ADMIN_PASSWORD || 'modern123');

  if (!isAdmin) {
    return <AdminLogin />;
  }

  // Fetch initial pricing server-side
  const pricingData = getAllPricing();

  return <AdminDashboard initialPricing={pricingData} />;
}
