import { NextResponse } from 'next/server';
import { checkShopAdminAccess } from '@/lib/shopAdminAuth';

export async function GET() {
  try {
    const access = await checkShopAdminAccess();
    return NextResponse.json(access);
  } catch (error) {
    console.error('Admin access check error:', error);
    return NextResponse.json(
      { hasAccess: false, reason: 'Access check failed' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
