/**
 * Video Presigned URL Hook
 *
 * Einheitlicher Hook für Video presigned URL Management
 */

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import {
  getPresignedUrlById,
  getPresignedUrlByKey,
} from "../util/apis/videoApi";
import { getPresignedByKey } from "../util/apis/presignApi";

/**
 * Hook für presigned URLs anhand Content ID
 */
export function usePresignedById(contentId?: number) {
  const { user } = useAuth();
  const enabled = typeof contentId === "number" && contentId > 0 && !!user;

  return useQuery({
    queryKey: ["presign-id", contentId],
    enabled,
    queryFn: async () => {
      console.log(
        `🔍 DEBUG: Hook - Request presigned URL für contentId: ${contentId}`,
      );
      const data = await getPresignedUrlById(contentId!);
      console.log(`🔍 DEBUG: Hook - Response Data:`, data);

      if (!data.presigned_url) {
        throw new Error("Keine presigned URL in der Antwort");
      }

      return data.presigned_url as string;
    },
    staleTime: 0,
    gcTime: 0,
    retry: 1,
  });
}

/**
 * Hook für presigned URLs anhand S3 Key
 */
export function usePresignedByKey(key?: string) {
  const { user } = useAuth();
  const enabled = !!key && !!user;

  return useQuery({
    queryKey: ["presign-key", key],
    enabled,
    queryFn: async () => {
      console.log(`🔍 DEBUG: Hook - Request presigned URL für key: ${key}`);
      const data = await getPresignedUrlByKey(key!);
      console.log(`🔍 DEBUG: Hook - Response Data:`, data);

      if (!data.presigned_url) {
        throw new Error("Keine presigned URL in der Antwort");
      }

      return data.presigned_url as string;
    },
    staleTime: 0,
    gcTime: 0,
    retry: 1,
  });
}

/**
 * Generischer Hook für presigned URLs (z.B. Bilder) anhand S3 Key
 * Verwendet den generischen Endpoint /modules/storage/sign/
 */
export function useStoragePresignedByKey(key?: string) {
  const { user } = useAuth();
  const enabled = !!key && !!user;

  return useQuery({
    queryKey: ["presign-storage-key", key],
    enabled,
    queryFn: async () => {
      console.log(
        `🔍 DEBUG: Hook - Request STORAGE presigned URL für key: ${key}`,
      );
      const data = await getPresignedByKey(key!);
      console.log(`🔍 DEBUG: Hook - STORAGE Response Data:`, data);

      if (!data.presigned_url) {
        throw new Error("Keine presigned URL in der Antwort");
      }

      return data.presigned_url as string;
    },
    staleTime: 0,
    gcTime: 0,
    retry: 1,
  });
}
