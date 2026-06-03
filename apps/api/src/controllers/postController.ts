import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";

const authenticatedUserId = (req: Request) => {
  if (!req.user) throw new AppError(401, "Authentication required");
  return req.user.id;
};

const createPostSchema = z.object({
  content: z.string().trim().min(1).max(500),
  type: z.enum(["UPDATE", "LAUNCH", "MILESTONE", "COLLAB_REQUEST", "PRODUCT_DROP"]).default("UPDATE"),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

const postInclude = {
  user: { select: { id: true, name: true, avatar: true, businessProfile: true } },
  _count: { select: { postLikes: true, comments: true } },
} as const;

export const createPost = async (req: Request, res: Response) => {
  const input = createPostSchema.parse(req.body);
  const userId = authenticatedUserId(req);

  const post = await prisma.post.create({
    data: {
      userId,
      content: input.content,
      type: input.type,
      imageUrl: input.imageUrl || null,
    },
    include: postInclude,
  });

  res.status(201).json({ success: true, data: post });
};

export const getFeed = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const cursor = req.query.cursor as string | undefined;
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit as string) || 10));
  const filter = (req.query.filter as string) || "all";

  const where: any = {};
  if (filter === "following") {
    const followedIds = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    where.userId = { in: followedIds.map((f) => f.followingId) };
  } else if (filter === "launches") where.type = "LAUNCH";
  else if (filter === "milestones") where.type = "MILESTONE";
  else if (filter === "collab") where.type = "COLLAB_REQUEST";

  const posts = await prisma.post.findMany({
    where,
    include: {
      ...postInclude,
      postLikes: { where: { userId }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = posts.length > limit;
  const data = hasMore ? posts.slice(0, limit) : posts;

  const result = data.map((post) => ({
    ...post,
    likeCount: post._count.postLikes,
    commentCount: post._count.comments,
    isLikedByMe: post.postLikes.length > 0,
    isOwnPost: post.userId === userId,
    _count: undefined,
    postLikes: undefined,
  }));

  res.json({
    success: true,
    data: result,
    nextCursor: hasMore ? data[data.length - 1].id : null,
  });
};

export const getPost = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const { postId } = req.params;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      ...postInclude,
      postLikes: { where: { userId }, take: 1 },
    },
  });

  if (!post) throw new AppError(404, "Post not found");

  res.json({
    success: true,
    data: {
      ...post,
      likeCount: post._count.postLikes,
      commentCount: post._count.comments,
      isLikedByMe: post.postLikes.length > 0,
      isOwnPost: post.userId === userId,
      _count: undefined,
      postLikes: undefined,
    },
  });
};

const updatePostSchema = z.object({
  content: z.string().trim().min(1).max(500),
});

export const updatePost = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const { postId } = req.params;
  const { content } = updatePostSchema.parse(req.body);

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new AppError(404, "Post not found");
  if (post.userId !== userId) throw new AppError(403, "Not your post");

  const updated = await prisma.post.update({
    where: { id: postId },
    data: { content },
    include: {
      ...postInclude,
      postLikes: { where: { userId }, take: 1 },
    },
  });

  res.json({
    success: true,
    data: {
      ...updated,
      likeCount: updated._count.postLikes,
      commentCount: updated._count.comments,
      isLikedByMe: updated.postLikes.length > 0,
      isOwnPost: updated.userId === userId,
      _count: undefined,
      postLikes: undefined,
    },
  });
};

export const deletePost = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const { postId } = req.params;

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new AppError(404, "Post not found");
  if (post.userId !== userId) throw new AppError(403, "Not your post");

  await prisma.notification.deleteMany({ where: { relatedId: postId } });
  await prisma.post.delete({ where: { id: postId } });
  res.json({ success: true, message: "Post deleted" });
};

export const toggleLike = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const { postId } = req.params;

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new AppError(404, "Post not found");

  const existing = await prisma.postLike.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) {
    await prisma.postLike.delete({ where: { id: existing.id } });
    await prisma.post.update({ where: { id: postId }, data: { likes: { decrement: 1 } } });
    res.json({ success: true, data: { liked: false } });
  } else {
    await prisma.postLike.create({ data: { postId, userId } });
    await prisma.post.update({ where: { id: postId }, data: { likes: { increment: 1 } } });

    if (post.userId !== userId) {
      const me = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
      await prisma.notification.create({
        data: {
          userId: post.userId,
          type: "LIKE",
          message: `${me?.name ?? "Someone"} liked your post`,
          link: `/post/${postId}`,
          relatedId: postId,
        },
      });
    }

    res.json({ success: true, data: { liked: true } });
  }
};

export const getComments = async (req: Request, res: Response) => {
  const { postId } = req.params;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));

  const [comments, total] = await Promise.all([
    prisma.postComment.findMany({
      where: { postId },
      include: { author: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.postComment.count({ where: { postId } }),
  ]);

  res.json({
    success: true,
    data: comments,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
};

export const addComment = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const { postId } = req.params;
  const { content } = z.object({ content: z.string().trim().min(1).max(300) }).parse(req.body);

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new AppError(404, "Post not found");

  const comment = await prisma.postComment.create({
    data: { postId, authorId: userId, content },
    include: { author: { select: { id: true, name: true, avatar: true } } },
  });

  if (post.userId !== userId) {
    const me = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
    await prisma.notification.create({
      data: {
        userId: post.userId,
        type: "COMMENT",
        message: `${me?.name ?? "Someone"} commented on your post`,
        link: `/post/${postId}`,
        relatedId: postId,
      },
    });
  }

  res.status(201).json({ success: true, data: comment });
};

export const deleteComment = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const { commentId } = req.params;

  const comment = await prisma.postComment.findUnique({ where: { id: commentId } });
  if (!comment) throw new AppError(404, "Comment not found");
  if (comment.authorId !== userId) throw new AppError(403, "Not your comment");

  await prisma.postComment.delete({ where: { id: commentId } });
  res.json({ success: true, message: "Comment deleted" });
};
