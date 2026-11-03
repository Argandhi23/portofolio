import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  // Safeguard: allow open revalidation in development, but require secret token in production
  if (process.env.NODE_ENV === 'production' && secret !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  revalidateTag('portfolio-projects', { expire: 0 });
  revalidateTag('projects', { expire: 0 });
  revalidatePath('/');
  revalidatePath('/projects');
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
