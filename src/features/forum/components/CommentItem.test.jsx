import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CommentItem } from "./CommentItem";
import * as forumService from "../services/forumService";
import { ToastProvider } from "../../../components/Toast";

vi.mock("../services/forumService");

const mockComment = {
  commentId: "c1",
  userId: "user1",
  bacaanId: "bacaan1",
  parentComment: "root",
  commentContent: "Test comment content",
  timestamp: "2026-04-23T10:00:00Z",
  upvotes: 0,
  downvotes: 0,
  reactionThumbsUp: 0,
  reactionHeart: 0,
  reactionLaugh: 0,
  reactionSurprise: 0,
  reactionSad: 0,
};

const renderWithToast = (component) => {
  return render(<ToastProvider>{component}</ToastProvider>);
};

describe("CommentItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render comment content and author", () => {
    renderWithToast(<CommentItem comment={mockComment} />);

    expect(screen.getByText("user1")).toBeInTheDocument();
    expect(screen.getByText("Test comment content")).toBeInTheDocument();
  });

  it("should render reaction buttons with initial counts", () => {
    renderWithToast(<CommentItem comment={mockComment} />);

    expect(screen.getByText(/👍 0/)).toBeInTheDocument();
    expect(screen.getByText(/👎 0/)).toBeInTheDocument();
    expect(screen.getByText(/❤️ 0/)).toBeInTheDocument();
    expect(screen.getByText(/😂 0/)).toBeInTheDocument();
    expect(screen.getByText(/😮 0/)).toBeInTheDocument();
    expect(screen.getByText(/😢 0/)).toBeInTheDocument();
  });

  it("should increment upvote count when upvote button is clicked", async () => {
    const updatedComment = { ...mockComment, upvotes: 1 };
    forumService.addReaction.mockResolvedValueOnce(updatedComment);

    renderWithToast(<CommentItem comment={mockComment} />);

    const upvoteButton = screen.getByText(/👍 0/).closest("button");
    fireEvent.click(upvoteButton);

    expect(forumService.addReaction).toHaveBeenCalledWith("c1", "upvote");

    await waitFor(() => {
      expect(screen.getByText(/👍 1/)).toBeInTheDocument();
    });
  });

  it("should handle heart reaction", async () => {
    const updatedComment = { ...mockComment, reactionHeart: 1 };
    forumService.addReaction.mockResolvedValueOnce(updatedComment);

    renderWithToast(<CommentItem comment={mockComment} />);

    const heartButton = screen.getByText(/❤️ 0/).closest("button");
    fireEvent.click(heartButton);

    expect(forumService.addReaction).toHaveBeenCalledWith("c1", "heart");

    await waitFor(() => {
      expect(screen.getByText(/❤️ 1/)).toBeInTheDocument();
    });
  });

  it("should handle laugh reaction", async () => {
    const updatedComment = { ...mockComment, reactionLaugh: 1 };
    forumService.addReaction.mockResolvedValueOnce(updatedComment);

    renderWithToast(<CommentItem comment={mockComment} />);

    const laughButton = screen.getByText(/😂 0/).closest("button");
    fireEvent.click(laughButton);

    expect(forumService.addReaction).toHaveBeenCalledWith("c1", "laugh");

    await waitFor(() => {
      expect(screen.getByText(/😂 1/)).toBeInTheDocument();
    });
  });

  it("should revert optimistic update on error", async () => {
    forumService.addReaction.mockRejectedValueOnce(new Error("Network error"));

    const onUpdate = vi.fn();
    renderWithToast(<CommentItem comment={mockComment} onUpdate={onUpdate} />);

    const upvoteButton = screen.getByText(/👍 0/).closest("button");
    fireEvent.click(upvoteButton);

    // Wait for optimistic update
    expect(screen.getByText(/👍 1/)).toBeInTheDocument();

    // Wait for revert on error
    await waitFor(() => {
      expect(screen.getByText(/👍 0/)).toBeInTheDocument();
    });

    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("should disable buttons while saving", async () => {
    forumService.addReaction.mockImplementationOnce(
      () =>
        new Promise((resolve) => setTimeout(() => resolve(mockComment), 100)),
    );

    renderWithToast(<CommentItem comment={mockComment} />);

    const upvoteButton = screen.getByText(/👍 0/).closest("button");
    fireEvent.click(upvoteButton);

    expect(upvoteButton).toBeDisabled();

    await waitFor(
      () => {
        expect(upvoteButton).not.toBeDisabled();
      },
      { timeout: 200 },
    );
  });

  it("should call onUpdate callback with updated comment", async () => {
    const onUpdate = vi.fn();
    const updatedComment = { ...mockComment, upvotes: 1 };
    forumService.addReaction.mockResolvedValueOnce(updatedComment);

    renderWithToast(<CommentItem comment={mockComment} onUpdate={onUpdate} />);

    const upvoteButton = screen.getByText(/👍 0/).closest("button");
    fireEvent.click(upvoteButton);

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(updatedComment);
    });
  });

  it("should handle comment with undefined reaction fields", () => {
    const commentWithoutReactions = {
      commentId: "c1",
      userId: "user1",
      bacaanId: "bacaan1",
      parentComment: "root",
      commentContent: "Test",
      timestamp: "2026-04-23T10:00:00Z",
    };

    renderWithToast(<CommentItem comment={commentWithoutReactions} />);

    expect(screen.getByText(/👍 0/)).toBeInTheDocument();
    expect(screen.getByText(/❤️ 0/)).toBeInTheDocument();
  });

  it("should handle multiple rapid clicks gracefully", async () => {
    const updatedComment = { ...mockComment, upvotes: 1 };
    forumService.addReaction.mockResolvedValueOnce(updatedComment);

    renderWithToast(<CommentItem comment={mockComment} />);

    const upvoteButton = screen.getByText(/👍 0/).closest("button");

    // Click multiple times rapidly
    fireEvent.click(upvoteButton);
    fireEvent.click(upvoteButton);
    fireEvent.click(upvoteButton);

    // Should only call service once because button is disabled
    await waitFor(() => {
      expect(forumService.addReaction).toHaveBeenCalledTimes(1);
    });
  });

  it("should support both id and commentId properties", async () => {
    const commentWithId = { ...mockComment, id: "c1", commentId: undefined };
    const updatedComment = { ...commentWithId, upvotes: 1 };
    forumService.addReaction.mockResolvedValueOnce(updatedComment);

    renderWithToast(<CommentItem comment={commentWithId} />);

    const upvoteButton = screen.getByText(/👍 0/).closest("button");
    fireEvent.click(upvoteButton);

    expect(forumService.addReaction).toHaveBeenCalledWith("c1", "upvote");
  });

  it("should display timestamp in user locale format", () => {
    renderWithToast(<CommentItem comment={mockComment} />);

    const timestamp = new Date(mockComment.timestamp).toLocaleString();
    expect(screen.getByText(timestamp)).toBeInTheDocument();
  });

  it("should support comment and commentContent field names", () => {
    const commentWithAltNames = {
      ...mockComment,
      commentContent: undefined,
      content: "Alternative field name",
    };

    renderWithToast(<CommentItem comment={commentWithAltNames} />);

    expect(screen.getByText("Alternative field name")).toBeInTheDocument();
  });
});
