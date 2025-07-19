import axiosInstance from "@/lib/axios";
import { useMutation, useQuery } from "@tanstack/react-query";

// send OTP to email
export const useSendOtpToEmail = () => {
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      try {
        const response = await axiosInstance.post("/auth/request-code", {
          email,
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  });
};

// verify OTP
export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: async ({
      email,
      code,
      companyId,
    }: {
      email: string;
      code: string;
      companyId?: string;
    }) => {
      try {
        const response = await axiosInstance.post("/auth/verify-code", {
          email,
          code,
          companyId: companyId ? companyId : undefined,
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  });
};

// log out
export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      try {
        const response = await axiosInstance.post("/auth/logout");
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  });
};

export const useInviteEmployees = () => {
  return useMutation({
    mutationFn: async ({
      emails,
      companyId,
    }: {
      emails: string[];
      companyId: string;
    }) => {
      try {
        const response = await axiosInstance.post("/auth/invite-employee", {
          emails,
          companyId,
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  });
};

export const useGetProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(`/profile/me`);
        return response.data.data;
      } catch (error) {
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      try {
        const response = await axiosInstance.put(`/profile/update`, data);
        return response.data.data;
      } catch (error) {
        throw error;
      }
    },
  });
};
