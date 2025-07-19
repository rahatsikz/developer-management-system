import axiosInstance from "@/lib/axios";
import { Project } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";

// create new project
export const useCreateProject = () => {
  return useMutation({
    mutationFn: async (payload: { name: string; companyId: string }) => {
      try {
        const response = await axiosInstance.post("/project", payload);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  });
};

// get all by companyId as query like params ?
export const useGetProjects = ({
  companyId,
  userId,
}: {
  companyId?: string;
  userId?: string;
}) => {
  return useQuery({
    queryKey: ["projects", companyId],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(`/projects`, {
          params: {
            companyId: companyId ? companyId : undefined,
            userId: userId ? userId : undefined,
          },
        });
        return response.data.data;
      } catch (error) {
        throw error;
      }
    },
    // staleTime: 1000 * 60 * 5,
  });
};

export const useGetProject = (id: string) => {
  return useQuery({
    queryKey: ["project", id],
    queryFn: async (): Promise<Project> => {
      try {
        const response = await axiosInstance.get(`/project/${id}`);
        return response.data.data;
      } catch (error) {
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
};

export const useUpdateProject = (id: string) => {
  return useMutation({
    mutationFn: async (payload: { name?: string; userIds: string[] }) => {
      try {
        const response = await axiosInstance.put(`/project/${id}`, payload);
        return response.data.data;
      } catch (error) {
        throw error;
      }
    },
  });
};
