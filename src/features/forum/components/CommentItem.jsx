import React, { useState } from "react";
import { forumService } from "../services/forumService";
import "../styles/forum.css";
import { useToast } from "../../../components/Toast";

export const CommentItem = ({ comment, currentUserId, onUpdate, onDelete }) => {
  const [counts, setCounts] = useState({
    upvotes: comment.upvotes ?? 0,
    downvotes: comment.downvotes ?? 0,
    thumbsUp: comment.reactionThumbsUp ?? 0,
    heart: comment.reactionHeart ?? 0,
    laugh: comment.reactionLaugh ?? 0,
    surprise: comment.reactionSurprise ?? 0,
    sad: comment.reactionSad ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.commentContent || comment.content || '');
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const commentId = comment.commentId || comment.id;
  const isOwner = currentUserId && currentUserId === comment.userId;

  const doReaction = async (type) => {
    if (saving) return;
    const prev = { ...counts };
    const next = { ...counts };
    switch (type) {
      case "upvote":    next.upvotes += 1;  break;
      case "downvote":  next.downvotes += 1; break;
      case "thumbs_up": next.thumbsUp += 1;  break;
      case "heart":     next.heart += 1;     break;
      case "laugh":     next.laugh += 1;     break;
      case "surprise":  next.surprise += 1;  break;
      case "sad":       next.sad += 1;       break;
      default: break;
    }
    setCounts(next);
    setSaving(true);
    try {
      const updated = await forumService.addReaction(commentId, type);
      if (updated) {
        setCounts({
          upvotes:  updated.upvotes ?? updated.upvote ?? next.upvotes,
          downvotes: updated.downvotes ?? next.downvotes,
          thumbsUp:  updated.reactionThumbsUp ?? next.thumbsUp,
          heart:     updated.reactionHeart ?? next.heart,
          laugh:     updated.reactionLaugh ?? next.laugh,
          surprise:  updated.reactionSurprise ?? next.surprise,
          sad:       updated.reactionSad ?? next.sad,
        });
        if (onUpdate) onUpdate(updated);
      }
    } catch (err) {
      setCounts(prev);
      toast("Gagal memberikan reaksi pada komentar.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    setSaving(true);
    try {
      const updated = await forumService.updateComment(commentId, editText.trim());
      if (onUpdate) onUpdate(updated);
      setEditing(false);
    } catch (err) {
      toast(err.message || "Gagal mengedit komentar.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Hapus komentar ini?')) return;
    setDeleting(true);
    try {
      await forumService.deleteComment(commentId);
      if (onDelete) onDelete(commentId);
    } catch (err) {
      toast(err.message || "Gagal menghapus komentar.", "error");
      setDeleting(false);
    }
  };

  return (
    <div className="card comment-card">
      <div className="comment-meta" style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <div className="comment-author">{comment.userId}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="comment-timestamp" style={{ color: "var(--text-light)", fontSize: 12 }}>
            {new Date(comment.timestamp || comment.createdAt).toLocaleString()}
          </span>
          {isOwner && !editing && (
            <>
              <button
                onClick={() => setEditing(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)', fontSize: 12, padding: '2px 6px' }}
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: 12, padding: '2px 6px' }}
              >
                {deleting ? '...' : 'Hapus'}
              </button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <div style={{ marginBottom: 12 }}>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={3}
            style={{ width: '100%', resize: 'vertical', marginBottom: 8, boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSaveEdit} disabled={saving} className="btn btn-primary" style={{ padding: '6px 16px', fontSize: 13 }}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button onClick={() => { setEditing(false); setEditText(comment.commentContent || comment.content || ''); }} className="btn btn-outline" style={{ padding: '6px 16px', fontSize: 13 }}>
              Batal
            </button>
          </div>
        </div>
      ) : (
        <div className="comment-body" style={{ marginBottom: 12 }}>
          {comment.commentContent || comment.content}
        </div>
      )}

      <div className="comment-actions">
        {[
          { type: 'upvote',    label: '👍', count: counts.upvotes },
          { type: 'downvote',  label: '👎', count: counts.downvotes },
          { type: 'thumbs_up', label: '👍🏻', count: counts.thumbsUp },
          { type: 'heart',     label: '❤️', count: counts.heart },
          { type: 'laugh',     label: '😂', count: counts.laugh },
          { type: 'surprise',  label: '😮', count: counts.surprise },
          { type: 'sad',       label: '😢', count: counts.sad },
        ].map(({ type, label, count }) => (
          <button key={type} className="icon-btn" onClick={() => doReaction(type)} disabled={saving}>
            {label} {count}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CommentItem;
