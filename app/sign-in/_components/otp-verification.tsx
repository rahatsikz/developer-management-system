"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, KeyRound, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { Form, FormField } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useVerifyOtp } from "@/api/auth.query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/use-auth-store";
import { useUrlState } from "@/hooks/use-url-state";

interface OtpVerificationProps {
  email: string;
}

export default function OtpVerification({ email }: OtpVerificationProps) {
  //   const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const { mutate, isPending } = useVerifyOtp();
  const form = useForm({
    defaultValues: {
      otp: "",
    },
  });

  const { setUser } = useAuthStore((state) => state);

  const {
    state: { companyId },
  } = useUrlState(["companyId"]);

  const handleVerify = async (values: { otp: string }) => {
    mutate(
      { email, code: values.otp, companyId },
      {
        onSuccess: (data) => {
          console.log(data);
          setUser({
            ...data.data,
          });
          toast.success("Logged in successfully");
          router.push("/workspace/company");
        },
        onError: () => {
          toast.error("Failed to verify OTP");
        },
      }
    );
  };

  //   const handleResendCode = async () => {
  //     setIsResending(true);
  //   };

  const handleBackToLogin = () => {
    window.location.reload();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className='border-0 shadow-lg bg-background/80  backdrop-blur-sm overflow-hidden'>
        <div className='absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 to-indigo-600'></div>
        <CardHeader>
          <div className='flex justify-center mb-2'>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 15,
                delay: 0.2,
              }}
              className='w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center'
            >
              <KeyRound className='h-8 w-8 text-foreground' />
            </motion.div>
          </div>
          <CardTitle className='text-2xl font-bold text-center'>
            Verify Your Email
          </CardTitle>
          <CardDescription className='text-center'>
            Enter the 6-digit code sent to{" "}
            <span className='font-medium'>{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6 pb-3.5'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleVerify)}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className='flex justify-center'
              >
                <FormField
                  name='otp'
                  control={form.control}
                  rules={{ required: true, minLength: 6 }}
                  render={({ field }) => (
                    <InputOTP
                      {...field}
                      value={field.value}
                      onChange={field.onChange}
                      maxLength={6}
                      pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  type='submit'
                  className='w-full text-foreground mt-6 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 transition-all duration-300'
                  disabled={isPending}
                >
                  {isPending ? (
                    <div className='flex items-center gap-2'>
                      <Loader2 className='h-4 w-4 animate-spin' />
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    "Verify & Sign In"
                  )}
                </Button>
              </motion.div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className='pt-0'>
          <Button
            onClick={handleBackToLogin}
            variant='outline'
            className='w-full gap-2 '
          >
            <ArrowLeft className='h-4 w-4' />
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
