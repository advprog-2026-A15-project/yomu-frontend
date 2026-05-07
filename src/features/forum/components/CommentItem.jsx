import React, { useState } from "react";
import { forumService } from "../services/forumService";
import "../styles/forum.css";
import { useToast } from "../../../components/Toast";

export const CommentItem = ({ comment, onUpdate }) => {
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
          thumbsUp: updated.reactionThumbsUp ?? next.thumbsUp,
          heart: updated.reactionHeart ?? next.heart,
          laugh: updated.reactionLaugh ?? next.laugh,
          surprise: updated.reactionSurprise ?? next.surprise,
          sad: updated.reactionSad ?? next.sad,
        });
        if (onUpdate) onUpdate(updated);
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

  return (
    <div className="card comment-card">
      <div
        className="comment-meta"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <div className="comment-author">{comment.userId}</div>
        <div
          className="comment-timestamp"
          style={{ color: "var(--text-light)", fontSize: 12 }}
        >
          {new Date(comment.timestamp || comment.createdAt).toLocaleString()}
        </div>
      </div>

      <div className="comment-body" style={{ marginBottom: 12 }}>
        {comment.commentContent || comment.content}
      </div>

      <div className="comment-actions">
        <button
          className="icon-btn"
          onClick={() => doReaction("upvote")}
          disabled={saving}
        >
          👍 {counts.upvotes}
        </button>
        <button
          className="icon-btn"
          onClick={() => doReaction("downvote")}
          disabled={saving}
        >
          👎 {counts.downvotes}
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
    </div>
  );
};

export default CommentItem;
