import { queryOptions, useQuery } from "@tanstack/react-query";

import { fetchClinic } from "@/lib/repository";

export const clinicQueryOptions = queryOptions({
  queryKey: ["clinic"],
  queryFn: fetchClinic,
  staleTime: 5 * 60_000,
});

/**
 * The configured clinic identity. Every screen reads the clinic name from here
 * so renaming the clinic in Settings updates the whole app instantly.
 */
export function useClinic() {
  const query = useQuery(clinicQueryOptions);
  return {
    clinic: query.data ?? null,
    clinicName: query.data?.name ?? "",
    doctorName: query.data?.doctor_name ?? "",
    isLoading: query.isLoading,
    error: query.error,
  };
}
