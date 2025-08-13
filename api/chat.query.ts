import axiosInstance from "@/lib/axios";
import { Chat, Message } from "@/types";
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
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

export const useGetMessagesById = (id: string) => {
  return useQuery({
    queryKey: ["messages", id],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(`/messages/${id}`);

        return response.data.data;
      } catch (error) {
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 0,
  });
};

export const useGetMessagesByIds = (ids: string[]) => {
  return useQuery({
    queryKey: ["messages", ...ids],
    queryFn: async (): Promise<Message[]> => {
      if (ids.length === 0) return [];
      try {
        const response = await axiosInstance.get(`/messages`, {
          params: { ids: ids.join(",") },
        });
        return response.data.data;
      } catch (error) {
        throw error;
      }
    },
    enabled: ids.length > 0,
    staleTime: 0,
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

export const useSeenMessage = () => {
  return useMutation({
    mutationFn: async (payload: { chatId: string; messageIds: string[] }) => {
      try {
        const response = await axiosInstance.put(
          `/chats/${payload.chatId}/messages/seen`,
          {
            messageIds: payload.messageIds,
          }
        );
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  });
};
