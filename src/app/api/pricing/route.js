import { NextResponse } from 'next/server';
import { getAllPricing, updatePricing } from '@/lib/db';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'modern123'; // Default fallback

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const pricing = getAllPricing();
    return NextResponse.json(pricing);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pricing' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = request.cookies;
    const authCookie = cookieStore.get('admin_auth');
    
    if (authCookie?.value !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { key, value, image_url } = await request.json();
    if (!key || typeof value !== 'number') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    updatePricing(key, value, image_url);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update pricing' }, { status: 500 });
  }
}
