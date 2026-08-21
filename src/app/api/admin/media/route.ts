import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient, verifyAdminUser } from '@/lib/supabase/admin';

// GET /api/admin/media?list=1 — List files from Supabase Storage
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminSupabaseClient();

    const { data: fileList, error } = await admin.storage
      .from('blog-media')
      .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

    if (error) {
      // Bucket might not exist yet — return empty
      return NextResponse.json({ files: [] });
    }

    const files = (fileList ?? [])
      .filter(f => f.name !== '.emptyFolderPlaceholder')
      .map(f => {
        const { data: { publicUrl } } = admin.storage.from('blog-media').getPublicUrl(f.name);
        return {
          name: f.name,
          url: publicUrl,
          path: f.name,
          size: f.metadata?.size ?? 0,
          type: f.metadata?.mimetype ?? 'image/jpeg',
          uploadedAt: f.created_at,
        };
      });

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Admin media GET error:', error);
    return NextResponse.json({ files: [] });
  }
}



// POST /api/admin/media — Upload file to Supabase Storage
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminSupabaseClient();
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only images allowed.' }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Max 10MB.' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = await file.arrayBuffer();

    const { data, error } = await admin.storage
      .from('blog-media')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = admin.storage.from('blog-media').getPublicUrl(data.path);

    return NextResponse.json({
      url: publicUrl,
      path: data.path,
      name: file.name,
      size: file.size,
      type: file.type,
    }, { status: 201 });
  } catch (error) {
    console.error('Admin media POST error:', error);
    return NextResponse.json({ error: 'Upload failed. Check that the blog-media bucket exists in Supabase Storage.' }, { status: 500 });
  }
}

// DELETE /api/admin/media?path=filename
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminSupabaseClient();
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) return NextResponse.json({ error: 'path parameter required' }, { status: 400 });

    const { error } = await admin.storage.from('blog-media').remove([path]);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin media DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
