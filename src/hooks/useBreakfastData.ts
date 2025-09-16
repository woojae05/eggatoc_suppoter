import { useQuery } from '@tanstack/react-query';

interface BreakfastData {
  // Define the structure based on the API response
  [key: string]: any;
}

const formatApiDate = (date: Date) => date.toISOString().split('T')[0];

// API 호출 함수
const fetchBreakfastData = async (
  startDate: Date,
  endDate: Date
): Promise<BreakfastData> => {
  // 환경변수에서 API 설정 가져오기
  const baseUrl = process.env.NEXT_PUBLIC_PMS_API_BASE_URL;
  const accommoId = process.env.NEXT_PUBLIC_PMS_ACCOMO_ID;

  if (!baseUrl || !accommoId) {
    throw new Error('PMS API 설정이 누락되었습니다. 환경변수를 확인해주세요.');
  }

  const apiUrl = `${baseUrl}/${accommoId}/schedules?startDate=${formatApiDate(
    startDate
  )}&endDate=${formatApiDate(endDate)}`;

  console.log('Breakfast API 요청:', apiUrl.replace(accommoId, '***'));

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log('Breakfast API 응답:', data);
  return data;
};

// React Query Hook
export const useBreakfastData = (startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ['breakfastData', formatApiDate(startDate), formatApiDate(endDate)],
    queryFn: () => fetchBreakfastData(startDate, endDate),
    staleTime: 1000 * 60 * 5, // 5분간 fresh
    gcTime: 1000 * 60 * 30, // 30분간 캐시 유지
    enabled: !!(startDate && endDate), // startDate, endDate가 있을 때만 실행
  });
};