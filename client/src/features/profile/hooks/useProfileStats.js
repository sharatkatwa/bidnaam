import { useQuery } from "@tanstack/react-query";
import { getProfileStats } from "../service/profileService.js";
import { mockProfile } from "../data/mockProfile.js";

export function useProfileStats() {
  const query = useQuery({
    queryKey: ["profile"],
    queryFn: getProfileStats,
    retry: false,
  });

  return {
    ...query,
    profile: query.data ?? mockProfile,
  };
}
