import axiosInstance from "@/lib/axios";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetMyCompanies = (userId: string) => {
  return useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(`/company/user/${userId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
  });
};

// create company
export const useCreateCompany = () => {
  return useMutation({
    mutationFn: async (payload: { name: string; userId: string }) => {
      try {
        const response = await axiosInstance.post("/company", payload);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  });
};
