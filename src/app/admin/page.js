import { cookies } from 'next/headers';
import AdminDashboard from '@/components/AdminDashboard';
import AdminLogin from '@/components/AdminLogin';
import { getAllPricing, getAllSubmissions } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('admin_auth');
  const isAdmin = authCookie?.value === (process.env.ADMIN_PASSWORD || 'modern123');

  if (!isAdmin) {
    return <AdminLogin />;
  }

  // Fetch initial pricing server-side
  const pricingData = getAllPricing();
  const submissionsData = getAllSubmissions();

  return <AdminDashboard initialPricing={pricingData} submissions={submissionsData} />;
}
