import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../service/dashboardService.js";
import { mockDashboard } from "../data/mockDashboard.js";

export function useDashboardStats() {
  const query = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardStats,
    retry: false,
  });

  return {
    ...query,
    dashboard: query.data ?? mockDashboard,
  };
}
