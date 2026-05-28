import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse, ExchangeRequest, FeedPost, FollowStats, MarketplaceItem, PaginatedResponse, PostComment, ProfileResponse, Review, Skill, User, WalletData } from "@bizskills/types";
import { api } from "./axios";
import { useAuthStore } from "../store/useAuthStore";

export function useProfile(userId?: string) {
  const myId = useAuthStore((state) => state.user?.id);
  const id = userId ?? myId;
  return useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<ProfileResponse>>(`/profile/${id}`);
      return res.data.data!;
    },
    enabled: !!id,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const myId = useAuthStore((state) => state.user?.id);
  const updateUser = useAuthStore((state) => state.updateUser);
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await api.put<ApiResponse<User>>("/profile", data);
      return res.data.data!;
    },
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["profile", myId] });
      updateUser(user);
    },
  });
}

export function useAddSkill() {
  const queryClient = useQueryClient();
  const myId = useAuthStore((state) => state.user?.id);
  return useMutation({
    mutationFn: async (data: { title: string; category: string; level: string; coinValue: number; isOffering: boolean }) => {
      const res = await api.post<ApiResponse<Skill>>("/skills", data);
      return res.data.data!;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile", myId] }),
  });
}

export function useUpdateSkill() {
  const queryClient = useQueryClient();
  const myId = useAuthStore((state) => state.user?.id);
  return useMutation({
    mutationFn: async ({ skillId, ...data }: { skillId: string } & Record<string, unknown>) => {
      const res = await api.put<ApiResponse<Skill>>(`/skills/${skillId}`, data);
      return res.data.data!;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile", myId] }),
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();
  const myId = useAuthStore((state) => state.user?.id);
  return useMutation({
    mutationFn: async (skillId: string) => { await api.delete(`/skills/${skillId}`); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile", myId] }),
  });
}

export function useMarketplace(filters: Record<string, any>) {
  return useInfiniteQuery({
    queryKey: ["marketplace", filters],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({ page: String(pageParam), limit: "15", ...filters });
      const res = await api.get<PaginatedResponse<MarketplaceItem>>(`/marketplace?${params}`);
      return res.data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination) return undefined;
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

export function useExchanges(direction?: string, status?: string) {
  return useQuery({
    queryKey: ["exchanges", direction, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (direction) params.set("direction", direction);
      if (status) params.set("status", status);
      const res = await api.get<PaginatedResponse<ExchangeRequest>>(`/exchanges?${params}`);
      return res.data;
    },
  });
}

export function useExchange(id?: string) {
  return useQuery({
    queryKey: ["exchange", id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<ExchangeRequest>>(`/exchanges/${id}`);
      return res.data.data!;
    },
    enabled: !!id,
  });
}

export function useCreateExchange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { toUserId: string; offeredSkillId: string; requestedSkillId: string; message?: string }) => {
      const res = await api.post<ApiResponse<ExchangeRequest>>("/exchanges", data);
      return res.data.data!;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exchanges"] }),
  });
}

export function useUpdateExchangeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "accept" | "reject" | "complete" | "cancel" }) => {
      const res = await api.put<ApiResponse<ExchangeRequest>>(`/exchanges/${id}/${action}`);
      return res.data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exchanges"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useWallet() {
  return useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<WalletData>>("/wallet");
      return res.data.data!;
    },
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { exchangeId: string; rating: number; comment?: string }) => {
      const res = await api.post<ApiResponse<Review>>("/reviews", data);
      return res.data.data!;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

export function useUserReviews(userId?: string) {
  return useQuery({
    queryKey: ["reviews", userId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ reviews: Review[]; avgRating: number; total: number }>>(`/reviews/${userId}`);
      return res.data.data!;
    },
    enabled: !!userId,
  });
}

export function useFeed(filter: string = "all") {
  return useInfiniteQuery({
    queryKey: ["feed", filter],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const params = new URLSearchParams({ limit: "10", filter });
      if (pageParam) params.set("cursor", pageParam);
      const res = await api.get<{ success: boolean; data: FeedPost[]; nextCursor: string | null }>(`/posts/feed?${params}`);
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { content: string; type: string; imageUrl?: string }) => {
      const res = await api.post<ApiResponse<FeedPost>>("/posts", data);
      return res.data.data!;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed"] }),
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const res = await api.post<ApiResponse<{ liked: boolean }>>(`/posts/${postId}/like`);
      return res.data.data?.liked ?? false;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["feed"] }),
  });
}

export function useComments(postId: string) {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<PostComment>>(`/posts/${postId}/comments`);
      return res.data;
    },
    enabled: !!postId,
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const res = await api.post<ApiResponse<PostComment>>(`/posts/${postId}/comments`, { content });
      return res.data.data!;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["comments"] }),
  });
}

export function useFollow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ targetUserId, action }: { targetUserId: string; action: "follow" | "unfollow" }) => {
      if (action === "follow") {
        await api.post(`/follow/${targetUserId}`);
      } else {
        await api.delete(`/follow/${targetUserId}`);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["followStats"] }),
  });
}

export function useFollowStats(userId?: string) {
  return useQuery({
    queryKey: ["followStats", userId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<FollowStats>>(`/follow/${userId}/stats`);
      return res.data.data!;
    },
    enabled: !!userId,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<any>>("/notifications");
      return res.data;
    },
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["unreadCount"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ count: number }>>("/notifications/unread-count");
      return res.data.data?.count ?? 0;
    },
    refetchInterval: 30000,
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.put("/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });
}
