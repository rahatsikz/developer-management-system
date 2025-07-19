import axiosInstance from "@/lib/axios";
import { Space } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";

// Create new space
export const useCreateSpace = () => {
  return useMutation({
    mutationFn: async (payload: { name: string; projectId: string }) => {
      try {
        const response = await axiosInstance.post("/space", payload);
        return response.data.data;
      } catch (error) {
        throw error;
      }
    },
  });
};

// Get all spaces by projectId
export const useGetSpacesByProjectId = (projectId: string) => {
  return useQuery({
    queryKey: ["spaces", projectId],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(
          `/spaces/project/${projectId}`
        );
        return response.data.data;
      } catch (error) {
        throw error;
      }
    },
    enabled: !!projectId,
  });
};

// Get space by id
export const useGetSpaceById = (id: string) => {
  return useQuery({
    queryKey: ["space", id],
    queryFn: async (): Promise<Space> => {
      try {
        const response = await axiosInstance.get(`/space/${id}`);
        return response.data.data;
      } catch (error) {
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

// Update space
export const useUpdateSpace = (id: string) => {
  return useMutation({
    mutationFn: async (payload: { name?: string; userIds?: string[] }) => {
      try {
        const response = await axiosInstance.put(`/space/${id}`, payload);
        return response.data.data;
      } catch (error) {
        throw error;
      }
    },
  });
};

// Delete space
export const useDeleteSpace = (id: string) => {
  return useMutation({
    mutationFn: async () => {
      try {
        const response = await axiosInstance.delete(`/space/${id}`);
        return response.data.data;
      } catch (error) {
        throw error;
      }
    },
  });
};
