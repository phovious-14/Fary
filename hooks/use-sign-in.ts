import { MESSAGE_EXPIRATION_TIME } from "@/lib/constants";
import { NeynarUser } from "@/lib/neynar";
import { useAuthenticate, useMiniKit } from "@coinbase/onchainkit/minikit";
import { useCallback, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";

interface AuthResponse {
  user: NeynarUser;
}

export const useSignIn = ({ autoSignIn = false }: { autoSignIn?: boolean }) => {
  const { context } = useMiniKit();
  const { signIn } = useAuthenticate();
  const queryClient = useQueryClient();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Use React Query for auth check
  const { data: authData, isLoading: isAuthLoading } = useQuery<
    AuthResponse,
    Error
  >({
    queryKey: ["auth"],
    queryFn: async () => {
      const res = await fetch("/api/auth/check", {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Not authenticated");
      }
      return res.json();
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  useEffect(() => {
    if (!isAuthLoading) {
      setIsCheckingAuth(false);
    }
  }, [isAuthLoading]);

  const user = authData?.user || null;
  const isSignedIn = !!user;

  // Sign in mutation
  const signInMutation = useMutation<AuthResponse, Error>({
    mutationFn: async () => {
      if (!context) {
        throw new Error(
          "MiniKit context is not yet available. Please try again."
        );
      }

      let referrerFid: number | null = null;
      const result = await signIn({
        nonce: Math.random().toString(36).substring(2),
        notBefore: new Date().toISOString(),
        expirationTime: new Date(
          Date.now() + MESSAGE_EXPIRATION_TIME
        ).toISOString(),
      });

      if (!result) {
        throw new Error("Sign in failed");
      }

      referrerFid =
        context.location?.type === "cast_embed"
          ? context.location.cast.fid
          : null;

      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          signature: result.signature,
          message: result.message,
          fid: context.user.fid,
          referrerFid,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Sign in failed");
      }

      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["auth"], data);
    },
  });

  // Sign out mutation
  const signOutMutation = useMutation<void, Error>({
    mutationFn: async () => {
      const res = await fetch("/api/auth/sign-out", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Sign out failed");
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["auth"], null);
    },
  });

  useEffect(() => {
    // Only attempt auto sign-in if:
    // 1. autoSignIn is true
    // 2. Not already signed in
    // 3. Not currently checking auth
    // 4. Not currently loading
    // 5. No previous sign-in attempt has failed
    if (
      autoSignIn &&
      !isSignedIn &&
      !isCheckingAuth &&
      !isAuthLoading &&
      !signInMutation.isPending &&
      !signInMutation.error
    ) {
      signInMutation.mutate();
    }
  }, [
    autoSignIn,
    isSignedIn,
    isCheckingAuth,
    isAuthLoading,
    signInMutation.isPending,
    signInMutation.error,
    signInMutation,
  ]);

  return {
    signIn: signInMutation.mutate,
    signOut: signOutMutation.mutate,
    isSignedIn,
    isLoading:
      signInMutation.isPending || signOutMutation.isPending || isAuthLoading,
    error: signInMutation.error || signOutMutation.error,
    user,
  };
};
