import axiosInstance from "@/lib/axios";
import { useMutation, useQuery } from "@tanstack/react-query";

// Create new task
export const useCreateTask = () => {
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      assigneeIds?: string | string[] | null;
      spaceId: string;
      priority?: string;
      dueDate?: string;
    }) => {
      try {
        const response = await axiosInstance.post("/task", payload);
        return response.data.data;
      } catch (error) {
        throw error;
      }
    },
  });
};

// Get all tasks by spaceId
export const useGetTasksBySpaceId = (spaceId: string) => {
  return useQuery({
    queryKey: ["tasks", spaceId],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(`/tasks/space/${spaceId}`);
        return response.data.data;
      } catch (error) {
        throw error;
      }
    },
    enabled: !!spaceId,
  });
};

// up[date task
export const useUpdateTask = (id: string) => {
  return useMutation({
    mutationFn: async (payload: {
      title?: string;
      assignees?: string | string[];
      priority?: string;
      dueDate?: string;
      status?: string;
    }) => {
      try {
        const response = await axiosInstance.put(`/task/${id}`, payload);
        return response.data.data;
      } catch (error) {
        throw error;
      }
    },
  });
};
