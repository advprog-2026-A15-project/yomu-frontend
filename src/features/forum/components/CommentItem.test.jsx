import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CommentItem } from "./CommentItem";
import { forumService } from "../services/forumService";
import { ToastProvider } from "../../../components/Toast";

vi.mock("../services/forumService", () => ({
  forumService: {
    addReaction: vi.fn(),
    updateComment: vi.fn(),
    deleteComment: vi.fn(),
  },
}));

const mockUser = {
  id: "user1",
  username: "user1",
  displayName: "User Satu",
  role: "PELAJAR",
};
const mockUseAuth = vi.fn(() => ({
  user: mockUser,
  isLoading: false,
}));

vi.mock("../../auth", () => ({
  useAuth: () => mockUseAuth(),
}));

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
    mockUseAuth.mockReturnValue({
      user: {
        id: "user1",
        username: "user1",
        displayName: "User Satu",
        role: "PELAJAR",
      },
      isLoading: false,
    });
  });

  it("should render comment content and author", () => {
    renderWithToast(<CommentItem comment={mockComment} />);

    expect(screen.getByText("@user1 - User Satu")).toBeInTheDocument();
    expect(screen.getByText("Test comment content")).toBeInTheDocument();
  });

  it("should render reaction buttons with initial counts", () => {
    renderWithToast(<CommentItem comment={mockComment} />);

    expect(screen.getByText(/⬆️ 0/)).toBeInTheDocument();
    expect(screen.getByText(/⬇️ 0/)).toBeInTheDocument();
    expect(screen.getByText(/❤️ 0/)).toBeInTheDocument();
    expect(screen.getByText(/😂 0/)).toBeInTheDocument();
    expect(screen.getByText(/😮 0/)).toBeInTheDocument();
    expect(screen.getByText(/😢 0/)).toBeInTheDocument();
  });

  it("should increment upvote count when upvote button is clicked", async () => {
    const updatedComment = { ...mockComment, upvotes: 1 };
    forumService.addReaction.mockResolvedValueOnce(updatedComment);

    renderWithToast(<CommentItem comment={mockComment} />);

    const upvoteButton = screen.getByText(/⬆️ 0/).closest("button");
    fireEvent.click(upvoteButton);

    expect(forumService.addReaction).toHaveBeenCalledWith("c1", "upvote");

    await waitFor(() => {
      expect(screen.getByText(/⬆️ 1/)).toBeInTheDocument();
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

    const upvoteButton = screen.getByText(/⬆️ 0/).closest("button");
    fireEvent.click(upvoteButton);

    // Wait for optimistic update
    expect(screen.getByText(/⬆️ 1/)).toBeInTheDocument();

    // Wait for revert on error
    await waitFor(() => {
      expect(screen.getByText(/⬆️ 0/)).toBeInTheDocument();
    });

    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("should disable buttons while saving", async () => {
    forumService.addReaction.mockImplementationOnce(
      () =>
        new Promise((resolve) => setTimeout(() => resolve(mockComment), 100)),
    );

    renderWithToast(<CommentItem comment={mockComment} />);

    const upvoteButton = screen.getByText(/⬆️ 0/).closest("button");
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

    const upvoteButton = screen.getByText(/⬆️ 0/).closest("button");
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

    expect(screen.getByText(/⬆️ 0/)).toBeInTheDocument();
    expect(screen.getByText(/❤️ 0/)).toBeInTheDocument();
  });

  it("should handle multiple rapid clicks gracefully", async () => {
    const updatedComment = { ...mockComment, upvotes: 1 };
    forumService.addReaction.mockResolvedValueOnce(updatedComment);

    renderWithToast(<CommentItem comment={mockComment} />);

    const upvoteButton = screen.getByText(/⬆️ 0/).closest("button");

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

    const upvoteButton = screen.getByText(/⬆️ 0/).closest("button");
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

  it("should render escaped comment content as plain text", () => {
    const escapedComment = {
      ...mockComment,
      commentContent: "&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;",
    };

    renderWithToast(<CommentItem comment={escapedComment} />);

    expect(
      screen.getByText("<script>alert('xss')</script>"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("should render Edit and Delete buttons for author", () => {
    renderWithToast(<CommentItem comment={mockComment} />);

    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Hapus")).toBeInTheDocument();
  });

  it("should render Delete button but NOT Edit button for Admin who is not author", () => {
    mockUseAuth.mockReturnValueOnce({
      user: { id: "admin_user", username: "admin_user", role: "ADMIN" },
      isLoading: false,
    });

    renderWithToast(<CommentItem comment={mockComment} />);

    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(screen.getByText("Hapus")).toBeInTheDocument();
  });

  it("should not render Edit or Delete buttons for regular user who is not author", () => {
    mockUseAuth.mockReturnValueOnce({
      user: { id: "other_user", username: "other_user", role: "PELAJAR" },
      isLoading: false,
    });

    renderWithToast(<CommentItem comment={mockComment} />);

    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(screen.queryByText("Hapus")).not.toBeInTheDocument();
  });

  it("should call deleteComment when Hapus is clicked", async () => {
    const onDelete = vi.fn();
    forumService.deleteComment.mockResolvedValueOnce({ success: true });
    vi.spyOn(window, "confirm").mockReturnValueOnce(true);

    renderWithToast(<CommentItem comment={mockComment} onDelete={onDelete} />);

    const deleteButton = screen.getByText("Hapus");
    fireEvent.click(deleteButton);

    expect(forumService.deleteComment).toHaveBeenCalledWith("c1");
    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith("c1");
    });
  });

  it("should call updateComment when Edit is submitted", async () => {
    const onUpdate = vi.fn();
    const updatedComment = { ...mockComment, commentContent: "Edited text" };
    forumService.updateComment.mockResolvedValueOnce(updatedComment);

    renderWithToast(<CommentItem comment={mockComment} onUpdate={onUpdate} />);

    const editButton = screen.getByText("Edit");
    fireEvent.click(editButton);

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Edited text" } });

    const saveButton = screen.getByText("SIMPAN");
    fireEvent.click(saveButton);

    expect(forumService.updateComment).toHaveBeenCalledWith(
      "c1",
      "Edited text",
    );
    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(updatedComment);
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });
  });
});
