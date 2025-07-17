"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mail } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { useSendOtpToEmail } from "@/api/auth.query";
import { toast } from "sonner";
import OtpVerification from "./otp-verification";

export default function AuthForm() {
  const [otpSent, setOtpSent] = useState(false);
  const { mutate, isPending } = useSendOtpToEmail();

  const form = useForm({
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: { email: string }) {
    mutate(values, {
      onSuccess: () => {
        setOtpSent(true);
      },
      onError: () => {
        toast.error("Failed to send OTP");
      },
    });
  }

  return (
    <AnimatePresence mode='wait'>
      {!otpSent ? (
        <motion.div
          key='form'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className='border-0 shadow-lg bg-foreground/80 dark:bg-slate-900/80 backdrop-blur-sm'>
            <CardHeader>
              <div className='flex justify-center mb-2'>
                <motion.div
                  className='w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center'
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Mail className='h-6 w-6 text-foreground' />
                </motion.div>
              </div>
              <CardTitle className='text-2xl font-bold text-center'>
                Welcome
              </CardTitle>
              <CardDescription className='text-center'>
                Sign in with a one-time password sent to your email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='space-y-4'
                >
                  <div className='space-y-2'>
                    <div className='relative'>
                      <Input
                        type='email'
                        label='Email'
                        formControl={form.control}
                        name='email'
                      />
                      <Mail className='absolute right-3 top-[70%] transform -translate-y-1/3 h-4 w-4 text-muted-foreground' />
                    </div>
                  </div>
                  <Button
                    type='submit'
                    className='w-full mt-1 text-foreground bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 transition-all duration-300'
                    disabled={isPending}
                  >
                    {isPending ? (
                      <div className='flex items-center gap-2'>
                        <Loader2 className='h-4 w-4 animate-spin ' />
                        <span>Sending...</span>
                      </div>
                    ) : (
                      "Send OTP Code"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className='flex justify-center'>
              <p className='text-sm text-muted-foreground '>
                An OTP code will be sent to your email
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      ) : (
        <OtpVerification email={form.getValues().email} />
      )}
    </AnimatePresence>
  );
}
