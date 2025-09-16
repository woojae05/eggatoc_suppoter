import { useQuery } from '@tanstack/react-query';
import { LodgmentData } from '@/types/api';

// API 호출 함수
const fetchLodgmentData = async (
  startDate: string,
  endDate: string
): Promise<LodgmentData> => {
  const baseUrl =
    'https://hwik.io/api/pms/accommos/681077592fddbe59fc1e0eec/schedules';
  const url = `${baseUrl}?startDate=${startDate}&endDate=${endDate}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const apiResponse = await response.json();
  return apiResponse.data;
};

// React Query Hook
export const useLodgmentData = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['lodgmentData', startDate, endDate],
    queryFn: () => fetchLodgmentData(startDate, endDate),
    staleTime: 1000 * 60 * 5, // 5분간 fresh
    gcTime: 1000 * 60 * 30, // 30분간 캐시 유지
    enabled: !!(startDate && endDate), // startDate, endDate가 있을 때만 실행
  });
};