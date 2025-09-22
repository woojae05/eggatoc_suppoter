import { useQuery } from '@tanstack/react-query';
import { LodgmentData, LodgmentType, Day, Lodgment, Reservation as ApiReservation } from '@/types/api';

// 기존 Reservation 인터페이스 (표시용)
export interface Reservation {
  id: string;
  customerName: string;
  phone?: string;
  checkIn: string;
  checkOut: string;
  roomNumber: string;
  roomName: string;
  roomType: string;
  guests: number;
  status: 'checkIn' | 'checkOut' | 'staying' | 'upcoming';
  notes?: string;
  services?: string[];
  isSponsored?: boolean;
  nights: number;
  platform?: string;
  totalAmount?: number;
}

// 객실 이름 매핑
const roomNameMap: { [key: string]: string } = {
  '67a6e9c43bb7fd0001d6e603': 'camino',
  '67a6e9ce3bb7fd0001d6e60a': 'stone',
  '67a6ea1f3bb7fd0001d6e61b': '봄비',
  '67a6ea283bb7fd0001d6e622': 'camellia',
  '67a6ea323bb7fd0001d6e629': 'hallasan',
  '67a6ea3b3bb7fd0001d6e630': 'paparecipe',
  '67a6ea443bb7fd0001d6e637': 'woozoo',
  '67a6ea4d3bb7fd0001d6e63e': 'sea',
  '67a6ea573bb7fd0001d6e645': 'canola',
  '67a6ea603bb7fd0001d6e64c': 'olle',
  '67a6ea693bb7fd0001d6e653': 'star',
};

// 객실 번호 매핑
const roomNumberMap: { [key: string]: string } = {
  '67a6e9c43bb7fd0001d6e603': '1',
  '67a6e9ce3bb7fd0001d6e60a': '2',
  '67a6ea1f3bb7fd0001d6e61b': '3',
  '67a6ea283bb7fd0001d6e622': '4',
  '67a6ea323bb7fd0001d6e629': '5',
  '67a6ea3b3bb7fd0001d6e630': '6',
  '67a6ea443bb7fd0001d6e637': '7',
  '67a6ea4d3bb7fd0001d6e63e': '8',
  '67a6ea573bb7fd0001d6e645': '9',
  '67a6ea603bb7fd0001d6e64c': '10',
  '67a6ea693bb7fd0001d6e653': '11',
};

// API 호출 함수
const fetchReservations = async (startDate: string, endDate: string): Promise<LodgmentData> => {
  const response = await fetch(
    `https://hwik.io/api/pms/accommos/681077592fddbe59fc1e0eec/schedules?startDate=${startDate}&endDate=${endDate}`
  );
  
  if (!response.ok) {
    throw new Error('예약 데이터를 불러오는데 실패했습니다.');
  }
  
  const apiResponse = await response.json();
  console.log('API Raw Response:', apiResponse);
  
  // API 응답이 { data: { lodgmentTypes: [...] } } 형태
  return apiResponse.data;
};

// API 데이터를 Reservation 형식으로 변환
const transformApiData = (apiData: LodgmentData): Reservation[] => {
  const today = new Date();
  const reservations: Reservation[] = [];

  // 안전성 검사
  if (!apiData || !apiData.lodgmentTypes || !Array.isArray(apiData.lodgmentTypes)) {
    console.warn('Invalid API data structure:', apiData);
    return [];
  }

  apiData.lodgmentTypes.forEach((lodgmentType: LodgmentType) => {
    if (!lodgmentType || !lodgmentType.days || !Array.isArray(lodgmentType.days)) {
      console.warn('Invalid lodgment type structure:', lodgmentType);
      return;
    }

    lodgmentType.days.forEach((day: Day) => {
      if (!day || !day.lodgments || !Array.isArray(day.lodgments)) {
        return;
      }

      day.lodgments.forEach((lodgment: Lodgment) => {
        if (!lodgment || !lodgment.reservations || !Array.isArray(lodgment.reservations)) {
          return;
        }

        lodgment.reservations.forEach((apiReservation: ApiReservation) => {
          const checkInDate = new Date(apiReservation.checkIn);
          const checkOutDate = new Date(apiReservation.checkOut);
          const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // 상태 결정 로직
          let status: Reservation['status'] = 'upcoming';
          if (checkInDate.toDateString() === today.toDateString()) {
            status = 'checkIn';
          } else if (checkOutDate.toDateString() === today.toDateString()) {
            status = 'checkOut';
          } else if (checkInDate < today && checkOutDate > today) {
            status = 'staying';
          }
          
          // 서비스 옵션 변환 (nBookingDetails에서 추출)
          const services: string[] = [];
          if (apiReservation.nBookingDetails?.customFormInputs) {
            apiReservation.nBookingDetails.customFormInputs.forEach(input => {
              if (input.value && input.value.trim() !== '' && !input.title.includes('체크인')) {
                let title = input.title;
                if (title.includes('투숙 인원')) title = '인원';
                else if (title.includes('조식')) title = '조식';
                else if (title.includes('요가')) title = '요가';
                else if (title.includes('핫텁')) title = '핫텁';
                services.push(`${title}: ${input.value}`);
              }
            });
          }
          
          // Debug logging to see actual IDs
          console.log('LodgmentType ID:', lodgmentType.lodgmentTypeId, 'Name:', lodgmentType.lodgmentTypeName);
          
          let roomNumber = '?';
          let roomName = lodgmentType.lodgmentTypeName;
          
          // Handle "에가톳캐빈- Wellness Retreat" pattern
          if (lodgmentType.lodgmentTypeName.includes('Wellness Retreat')) {
            roomNumber = 'WR';
            roomName = 'wellness retreat';
          } else {
            // Extract room number from lodgmentTypeName (e.g., "에가톳캐빈- 1. Camino" -> "1")
            const roomNumberMatch = lodgmentType.lodgmentTypeName.match(/(\d+)\./);
            roomNumber = roomNumberMatch ? roomNumberMatch[1] : '?';
            
            // Extract room name from lodgmentTypeName (e.g., "에가톳캐빈- 1. Camino" -> "camino")
            const roomNameMatch = lodgmentType.lodgmentTypeName.match(/\d+\.\s*([A-Za-z가-힣]+)/);
            roomName = roomNameMatch ? roomNameMatch[1].toLowerCase() : lodgmentType.lodgmentTypeName;
          }

          const reservation: Reservation = {
            id: apiReservation.id,
            customerName: apiReservation.userInfo.name,
            phone: apiReservation.userInfo.phone,
            checkIn: apiReservation.checkIn,
            checkOut: apiReservation.checkOut,
            roomNumber: roomNumber,
            roomName: roomName,
            roomType: lodgmentType.lodgmentTypeName,
            guests: apiReservation.totalHeadcount || 0,
            status,
            services,
            nights,
            platform: apiReservation.platformName,
            notes: apiReservation.memo || undefined,
          };
          
          reservations.push(reservation);
        });
      });
    });
  });
  
  return reservations;
};

// React Query Hook
export const useReservations = () => {
  const today = new Date();
  const startDate = today.toISOString().split('T')[0];
  
  // 7일 후 날짜 계산
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 7);
  const endDateStr = endDate.toISOString().split('T')[0];

  return useQuery({
    queryKey: ['reservations', startDate, endDateStr],
    queryFn: () => fetchReservations(startDate, endDateStr),
    select: transformApiData,
    staleTime: 1000 * 60 * 5, // 5분간 fresh
    gcTime: 1000 * 60 * 30, // 30분간 캐시 유지
  });
};