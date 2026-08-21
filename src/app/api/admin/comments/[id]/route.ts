import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient, verifyAdminUser } from '@/lib/supabase/admin';

// PATCH /api/admin/comments/[id] — update comment status or add admin reply
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const admin = createAdminSupabaseClient();
    const body = await request.json();

    const { status, reply } = body;

    // If it's an admin reply, insert a new comment
    if (reply) {
      // Get the original comment to find blog_id
      const { data: original } = await admin.from('comments').select('blog_id').eq('id', id).single();
      if (!original) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });

      const { data: newComment, error: replyError } = await admin.from('comments').insert({
        blog_id: original.blog_id,
        parent_id: id,
        author_name: 'MindfulPath Admin',
        author_email: user.email ?? 'admin@mindfulpath.com',
        content: reply,
        status: 'approved',
        is_admin_reply: true,
      }).select().single();

      if (replyError) throw replyError;

      // Also mark the original as replied
      await admin.from('comments').update({ status: 'approved', updated_at: new Date().toISOString() }).eq('id', id);

      return NextResponse.json({ comment: newComment });
    }

    // Otherwise, just update the status
    const validStatuses = ['pending', 'approved', 'spam', 'deleted'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const { data: comment, error } = await admin
      .from('comments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ comment });
  } catch (error) {
    console.error('Admin comment PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}

// DELETE /api/admin/comments/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const admin = createAdminSupabaseClient();

    // Delete child replies first
    await admin.from('comments').delete().eq('parent_id', id);
    const { error } = await admin.from('comments').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin comment DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
