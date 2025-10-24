import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useGlobalState = () => {
  const queryKey = ["popular", "recent"];

  const queryClient = useQueryClient();
  const setActiveTab = (tab: "popular" | "recent") => {
    queryClient.setQueryData(queryKey, tab);
  };
  const initialData = "recent";

  const { data: activeTab } = useQuery({
    initialData,
    queryKey,
    queryFn: () => initialData,
  });
  return { activeTab, setActiveTab };
};
