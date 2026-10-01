import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createAdminSupabaseClient, verifyAdminUser } from '@/lib/supabase/admin';

// Post pages are ISR'd hourly, so push a moderation change onto the post now.
async function revalidateCommentPost(admin: ReturnType<typeof createAdminSupabaseClient>, blogId: string) {
  const { data: blog } = await admin.from('blogs').select('slug').eq('id', blogId).maybeSingle();
  if (blog?.slug) revalidatePath(`/blog/${blog.slug}`);
}

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
        author_name: 'RegulatedSelf Admin',
        author_email: user.email ?? 'admin@regulatedself.com',
        content: reply,
        status: 'approved',
        is_admin_reply: true,
      }).select().single();

      if (replyError) throw replyError;

      // Also mark the original as replied
      await admin.from('comments').update({ status: 'approved', updated_at: new Date().toISOString() }).eq('id', id);
      await revalidateCommentPost(admin, original.blog_id);

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
    if (comment?.blog_id) await revalidateCommentPost(admin, comment.blog_id);

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

    const { data: existing } = await admin.from('comments').select('blog_id').eq('id', id).maybeSingle();

    // Delete child replies first
    await admin.from('comments').delete().eq('parent_id', id);
    const { error } = await admin.from('comments').delete().eq('id', id);
    if (error) throw error;
    if (existing?.blog_id) await revalidateCommentPost(admin, existing.blog_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin comment DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
