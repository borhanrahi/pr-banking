"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/actions/user.actions";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import CustomInput from "./CustomInput";
import { Loader2 } from "lucide-react";
import { authFormSchema } from "@/lib/utils";

interface AuthHandlerProps {
  type: "sign-in" | "sign-up";
}

const AuthHandler: React.FC<AuthHandlerProps> = ({ type }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formSchema = authFormSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);

    try {
      if (type === "sign-up") {
        const userData = {
          firstName: data.firstName!,
          lastName: data.lastName!,
          address1: data.address1!,
          city: data.city!,
          state: data.state!,
          postalCode: data.postalCode!,
          dateOfBirth: data.dateOfBirth!,
          ssn: data.ssn!,
          email: data.email,
          password: data.password,
        };

        const newUser = await signUp(userData);
        if (newUser) {
          router.push("/");
        } else {
          setError("Failed to create account. Please try again.");
        }
      } else {
        const response = await signIn({
          email: data.email,
          password: data.password,
        });

        if (response.success) {
          router.push("/");
        } else {
          setError(response.error || "Failed to sign in. Please try again.");
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(`An unexpected error occurred: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {type === "sign-up" && (
          <>
            <div className="flex gap-4">
              <CustomInput
                control={form.control}
                name="firstName"
                label="First Name"
                placeholder="Enter your first name"
              />
              <CustomInput
                control={form.control}
                name="lastName"
                label="Last Name"
                placeholder="Enter your last name"
              />
            </div>
            <CustomInput
              control={form.control}
              name="address1"
              label="Address"
              placeholder="Enter your specific address"
            />
            <CustomInput
              control={form.control}
              name="city"
              label="City"
              placeholder="Enter your city"
            />
            <div className="flex gap-4">
              <CustomInput
                control={form.control}
                name="state"
                label="State"
                placeholder="Example: NY"
              />
              <CustomInput
                control={form.control}
                name="postalCode"
                label="Postal Code"
                placeholder="Example: 11101"
              />
            </div>
            <div className="flex gap-4">
              <CustomInput
                control={form.control}
                name="dateOfBirth"
                label="Date of Birth"
                placeholder="YYYY-MM-DD"
              />
              <CustomInput
                control={form.control}
                name="ssn"
                label="SSN"
                placeholder="Example: 1234"
              />
            </div>
          </>
        )}

        <CustomInput
          control={form.control}
          name="email"
          label="Email"
          placeholder="Enter your email"
        />

        <CustomInput
          control={form.control}
          name="password"
          label="Password"
          placeholder="Enter your password"
        />

        {error && <p className="text-red-500">{error}</p>}

        <Button type="submit" disabled={isLoading} className="form-btn">
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" /> &nbsp; Loading...
            </>
          ) : type === "sign-in" ? (
            "Sign In"
          ) : (
            "Sign Up"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default AuthHandler;