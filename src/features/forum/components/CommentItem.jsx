import React, { useState } from "react";
import { forumService } from "../services/forumService";
import { useAuth } from "../../auth";
import "../styles/forum.css";
import { useToast } from "../../../components/Toast";

const decodeHtmlEntities = (value = "") => {
  if (typeof document === "undefined") return value;

  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
};

const formatAuthorLabel = (comment, user) => {
  const rawUserId = comment.userId || "unknown";
  const username =
    comment.username ||
    comment.userName ||
    (rawUserId === user?.id ? user?.username : null) ||
    rawUserId;
  const displayName =
    comment.displayName ||
    comment.authorName ||
    (rawUserId === user?.id ? user?.displayName : null) ||
    username;

  return `@${username} - ${displayName}`;
};

export const CommentItem = ({ comment, onUpdate, onDelete, onRefresh }) => {
  const { user } = useAuth();
  const displayContent = decodeHtmlEntities(
    comment.commentContent || comment.content || "",
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const [counts, setCounts] = useState({
    upvotes: comment.upvotes ?? 0,
    downvotes: comment.downvotes ?? 0,
    thumbsUp: comment.reactionThumbsUp ?? comment.thumbsUp ?? 0,
    heart: comment.reactionHeart ?? comment.heart ?? 0,
    laugh: comment.reactionLaugh ?? comment.laugh ?? 0,
    surprise: comment.reactionSurprise ?? comment.surprise ?? 0,
    sad: comment.reactionSad ?? comment.sad ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const doReaction = async (type) => {
    if (saving) return;
    const prev = { ...counts };
    // optimistic increment
    const next = { ...counts };
    switch (type) {
      case "upvote":
        next.upvotes += 1;
        break;
      case "downvote":
        next.downvotes += 1;
        break;
      case "thumbs_up":
        next.thumbsUp += 1;
        break;
      case "heart":
        next.heart += 1;
        break;
      case "laugh":
        next.laugh += 1;
        break;
      case "surprise":
        next.surprise += 1;
        break;
      case "sad":
        next.sad += 1;
        break;
      default:
        break;
    }
    setCounts(next);
    setSaving(true);

    try {
      const updated = await forumService.addReaction(
        comment.commentId || comment.id,
        type,
      );
      // update counts from server response if available
      if (updated) {
        setCounts({
          upvotes: updated.upvotes ?? updated.upvote ?? next.upvotes,
          downvotes: updated.downvotes ?? next.downvotes,
          thumbsUp:
            updated.reactionThumbsUp ?? updated.thumbsUp ?? next.thumbsUp,
          heart: updated.reactionHeart ?? updated.heart ?? next.heart,
          laugh: updated.reactionLaugh ?? updated.laugh ?? next.laugh,
          surprise:
            updated.reactionSurprise ?? updated.surprise ?? next.surprise,
          sad: updated.reactionSad ?? updated.sad ?? next.sad,
        });
        if (onUpdate) onUpdate(updated);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      // revert optimistic update
      setCounts(prev);
      console.error(err);
      toast("Gagal memberikan reaksi pada komentar.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Hapus komentar ini?")) return;
    setSaving(true);
    try {
      const commentId = comment.commentId || comment.id;
      await forumService.deleteComment(commentId);
      toast("Komentar berhasil dihapus.", "success");
      if (onDelete) onDelete(commentId);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      toast(err.message || "Gagal menghapus komentar.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    setSaving(true);
    try {
      const commentId = comment.commentId || comment.id;
      const updated = await forumService.updateComment(
        commentId,
        editContent.trim(),
      );
      toast("Komentar berhasil diperbarui.", "success");
      setIsEditing(false);
      if (onUpdate) onUpdate(updated);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      toast(err.message || "Gagal diperbarui komentar.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setSubmittingReply(true);
    try {
      const commentId = comment.commentId || comment.id;
      await forumService.createComment({
        parentComment: commentId,
        bacaanId: comment.bacaanId,
        userId: user.id,
        commentContent: replyContent.trim(),
      });
      toast("Balasan berhasil dikirim.", "success");
      setReplyContent("");
      setIsReplying(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      toast(err.message || "Gagal mengirim balasan.", "error");
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="card comment-card">
        <div
          className="comment-meta"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="comment-author" style={{ fontWeight: "bold" }}>
              {formatAuthorLabel(comment, user)}
            </span>
            {comment.userId === user?.id && (
              <span
                style={{
                  fontSize: 11,
                  backgroundColor: "#eef9ff",
                  color: "var(--secondary)",
                  padding: "2px 6px",
                  borderRadius: 4,
                  fontWeight: "bold",
                }}
              >
                Penulis
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              className="comment-timestamp"
              style={{ color: "var(--text-light)", fontSize: 12 }}
            >
              {new Date(
                comment.timestamp || comment.createdAt,
              ).toLocaleString()}
            </span>

            {/* Actions controls */}
            <div style={{ display: "flex", gap: 8 }}>
              {user && (
                <button
                  onClick={() => {
                    setIsReplying(!isReplying);
                    setReplyContent("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    color: "var(--secondary)",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                >
                  {isReplying ? "Batal" : "Balas"}
                </button>
              )}
              {(comment.userId === user?.id || user?.role === "ADMIN") && (
                <>
                  {comment.userId === user?.id && !isEditing && (
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setEditContent(displayContent);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        color: "var(--secondary)",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: "bold",
                      }}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={handleDelete}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      color: "var(--danger)",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: "bold",
                    }}
                  >
                    Hapus
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveEdit} style={{ marginBottom: 12 }}>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                marginBottom: 8,
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: "6px 16px", fontSize: 12 }}
                disabled={saving}
              >
                {saving ? "Menyimpan..." : "SIMPAN"}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: "6px 16px", fontSize: 12 }}
                onClick={() => setIsEditing(false)}
              >
                BATAL
              </button>
            </div>
          </form>
        ) : (
          <div
            className="comment-body"
            style={{ marginBottom: 12, whiteSpace: "pre-wrap" }}
          >
            {displayContent}
          </div>
        )}

        <div className="comment-actions">
          <button
            className="icon-btn"
            onClick={() => doReaction("upvote")}
            disabled={saving}
          >
            ⬆️ {counts.upvotes}
          </button>
          <button
            className="icon-btn"
            onClick={() => doReaction("downvote")}
            disabled={saving}
          >
            ⬇️ {counts.downvotes}
          </button>
          <button
            className="icon-btn"
            onClick={() => doReaction("thumbs_up")}
            disabled={saving}
          >
            👍🏻 {counts.thumbsUp}
          </button>
          <button
            className="icon-btn"
            onClick={() => doReaction("heart")}
            disabled={saving}
          >
            ❤️ {counts.heart}
          </button>
          <button
            className="icon-btn"
            onClick={() => doReaction("laugh")}
            disabled={saving}
          >
            😂 {counts.laugh}
          </button>
          <button
            className="icon-btn"
            onClick={() => doReaction("surprise")}
            disabled={saving}
          >
            😮 {counts.surprise}
          </button>
          <button
            className="icon-btn"
            onClick={() => doReaction("sad")}
            disabled={saving}
          >
            😢 {counts.sad}
          </button>
        </div>

        {/* Reply Form */}
        {isReplying && (
          <form onSubmit={handleSendReply} style={{ marginTop: 12 }}>
            <textarea
              placeholder="Tulis balasan..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={2}
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                marginBottom: 8,
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: "6px 16px", fontSize: 12 }}
                disabled={submittingReply}
              >
                {submittingReply ? "Mengirim..." : "KIRIM BALASAN"}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: "6px 16px", fontSize: 12 }}
                onClick={() => setIsReplying(false)}
              >
                BATAL
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Recursive Replies Rendering */}
      {comment.replies && comment.replies.length > 0 && (
        <div
          style={{
            marginLeft: "24px",
            borderLeft: "2px solid var(--border-color)",
            paddingLeft: "12px",
            marginTop: "4px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id || reply.commentId}
              comment={reply}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
