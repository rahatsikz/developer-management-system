import axiosInstance from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

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
    mutationFn: async ({ email, code }: { email: string; code: string }) => {
      try {
        const response = await axiosInstance.post("/auth/verify-code", {
          email,
          code,
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
