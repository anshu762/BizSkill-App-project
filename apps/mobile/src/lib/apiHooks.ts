import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse, ProfileResponse, Skill, User } from "@bizskills/types";
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
    mutationFn: async (data: {
      title: string; category: string; level: string; coinValue: number; isOffering: boolean;
    }) => {
      const res = await api.post<ApiResponse<Skill>>("/skills", data);
      return res.data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", myId] });
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", myId] });
    },
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();
  const myId = useAuthStore((state) => state.user?.id);

  return useMutation({
    mutationFn: async (skillId: string) => {
      await api.delete(`/skills/${skillId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", myId] });
    },
  });
}
