import { describe, it, expect, vi, beforeEach } from "vitest";
import { forumService } from "./forumService";

describe("forumService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe("getComments", () => {
    it("should fetch all comments when bacaanId is not provided", async () => {
      const mockComments = [
        {
          commentId: "c1",
          userId: "user1",
          bacaanId: "bacaan1",
          parentComment: "root",
          commentContent: "Test comment",
          timestamp: "2026-04-23T10:00:00Z",
        },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockComments,
      });

      const result = await forumService.getComments();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/forum/comments"),
        expect.objectContaining({
          headers: expect.any(Object),
        }),
      );
      expect(result).toEqual(mockComments);
    });

    it("should fetch comments filtered by bacaanId", async () => {
      const mockComments = [
        {
          commentId: "c1",
          userId: "user1",
          bacaanId: "bacaan1",
          parentComment: "root",
          commentContent: "Test",
          timestamp: "2026-04-23T10:00:00Z",
        },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockComments,
      });

      const result = await forumService.getComments("bacaan1");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("bacaanId=bacaan1"),
        expect.any(Object),
      );
      expect(result).toEqual(mockComments);
    });

    it("should throw on non-ok response", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Server Error",
        json: async () => ({}),
      });

      await expect(forumService.getComments()).rejects.toThrow();
    });
  });

  describe("getCommentsTree", () => {
    it("should fetch comments tree structure", async () => {
      const mockTree = [
        {
          commentId: "root-1",
          userId: "user1",
          bacaanId: "bacaan1",
          parentComment: "root",
          commentContent: "Root comment",
          timestamp: "2026-04-23T10:00:00Z",
          children: [
            {
              commentId: "child-1",
              userId: "user2",
              bacaanId: "bacaan1",
              parentComment: "root-1",
              commentContent: "Child comment",
              timestamp: "2026-04-23T10:01:00Z",
              children: [],
            },
          ],
        },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTree,
      });

      const result = await forumService.getCommentsTree("bacaan1");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/tree"),
        expect.any(Object),
      );
      expect(result).toEqual(mockTree);
    });
  });

  describe("createComment", () => {
    it("should create a new comment", async () => {
      const payload = {
        userId: "user1",
        bacaanId: "bacaan1",
        commentContent: "New comment",
        parentComment: "root",
      };

      const mockEvent = {
        userId: "user1",
        bacaanId: "bacaan1",
        commentId: "new-comment-1",
        commentContent: "New comment",
        parentComment: "root",
        timestamp: "2026-04-23T10:00:00Z",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEvent,
      });

      const result = await forumService.createComment(payload);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/forum/comments"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(payload),
        }),
      );
      expect(result).toEqual(mockEvent);
    });

    it("should throw on creation failure", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({}),
      });

      await expect(forumService.createComment({})).rejects.toThrow();
    });
  });

  describe("updateComment", () => {
    it("should update comment content", async () => {
      const mockEvent = {
        userId: "user1",
        bacaanId: "bacaan1",
        commentId: "c1",
        commentContent: "Updated content",
        parentComment: "root",
        timestamp: "2026-04-23T10:00:00Z",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEvent,
      });

      const result = await forumService.updateComment("c1", "Updated content");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/c1"),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ commentContent: "Updated content" }),
        }),
      );
      expect(result).toEqual(mockEvent);
    });
  });

  describe("deleteComment", () => {
    it("should delete a comment", async () => {
      const mockEvent = {
        userId: "user1",
        bacaanId: "bacaan1",
        commentId: "c1",
        commentContent: "Deleted content",
        parentComment: "root",
        timestamp: "2026-04-23T10:00:00Z",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEvent,
      });

      const result = await forumService.deleteComment("c1");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/c1"),
        expect.objectContaining({
          method: "DELETE",
        }),
      );
      expect(result).toEqual(mockEvent);
    });
  });

  describe("addReaction", () => {
    it("should add a reaction to a comment", async () => {
      const mockResponse = {
        commentId: "c1",
        userId: "user1",
        bacaanId: "bacaan1",
        parentComment: "root",
        commentContent: "Content",
        timestamp: "2026-04-23T10:00:00Z",
        upvotes: 1,
        downvotes: 0,
        reactionThumbsUp: 0,
        reactionHeart: 0,
        reactionLaugh: 0,
        reactionSurprise: 0,
        reactionSad: 0,
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await forumService.addReaction("c1", "upvote");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/c1/reactions"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ reactionType: "upvote" }),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("should support multiple reaction types", async () => {
      const types = [
        "upvote",
        "downvote",
        "thumbs_up",
        "heart",
        "laugh",
        "surprise",
        "sad",
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      for (const type of types) {
        await forumService.addReaction("c1", type);
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/c1/reactions"),
          expect.objectContaining({
            body: expect.stringContaining(type),
          }),
        );
      }
    });

    it("should throw on reaction failure", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({}),
      });

      await expect(forumService.addReaction("c1", "upvote")).rejects.toThrow();
    });
  });
});
