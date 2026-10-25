import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";

export const useGetQuery = (queryKey, path, options = {}, enabled = true) => {
  return useQuery({
    queryKey,
    queryFn: () => apiFetch(path, options),
    enabled,
  });
};

export const useMutate = (path, options = {}, invalidateKeys = []) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body) => apiFetch(path, { method: "POST", ...options, body }),
    onSuccess: () =>
      invalidateKeys.forEach((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      ),
  });
};
