import axiosInstance from "@/lib/axios";
import { Task } from "@/types";
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
    queryFn: async (): Promise<Task[]> => {
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

// update task
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

// create comment
export const useAddComment = (taskId: string) => {
  return useMutation({
    mutationFn: async (payload: { content: string; authorId: string }) => {
      try {
        const response = await axiosInstance.post(
          `/task/${taskId}/comment`,
          payload
        );
        return response.data.data;
      } catch (error) {
        throw error;
      }
    },
  });
};

// reorder
export const useTaskReorder = () => {
  return useMutation({
    mutationFn: async (payload: { spaceId: string; taskIds: string[] }) => {
      try {
        const response = await axiosInstance.put(`/task/reorder`, payload);
        return response.data.data;
      } catch (error) {
        throw error;
      }
    },
  });
};

export const useCreateSubtask = (taskId: string) => {
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      assigneeIds?: string | string[] | null;
      priority?: string;
      dueDate?: string;
      status?: string;
    }) => {
      try {
        const response = await axiosInstance.post(
          `/task/${taskId}/subtask`,
          payload
        );
        return response.data.data;
      } catch (error) {
        throw error;
      }
    },
  });
};

export const useUpdateSubtask = (id: string) => {
  return useMutation({
    mutationFn: async (payload: {
      title?: string;
      assigneeIds?: string | string[] | null;
      priority?: string;
      dueDate?: string;
      status?: string;
    }) => {
      try {
        const response = await axiosInstance.put(
          `/task/subtask/${id}`,
          payload
        );
        return response.data.data;
      } catch (error) {
        throw error;
      }
    },
  });
};
