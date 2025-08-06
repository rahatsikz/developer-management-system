import axiosInstance from "@/lib/axios";
import { Chat } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useRecentChatsBySpaceId = (spaceId: string) => {
  return useQuery({
    queryKey: ["chats", spaceId],
    queryFn: async (): Promise<Chat[]> => {
      try {
        const response = await axiosInstance.get(`/spaces/${spaceId}/chats`);
        return response.data.data;
      } catch (error) {
        throw error;
      }
    },
    enabled: !!spaceId,
  });
};

// create chat

export const useCreateChat = () => {
  return useMutation({
    mutationFn: async (payload: { spaceId: string; userIds: string[] }) => {
      try {
        const response = await axiosInstance.post(
          `/spaces/${payload.spaceId}/chats`,
          payload
        );
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  });
};
