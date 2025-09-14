import { LodgmentData, UserInfo, Reservation } from '@/types/api';
import { log } from 'console';

/**
 * 방번호로 고객 정보 조회
 */
export const getCustomerInfoByRoomNumber = (
  data: LodgmentData,
  roomNumber: string,
  date: string
): UserInfo | null => {
  // 방번호에서 숫자 추출 (예: "1. Camino" -> "1", "6. Paparecipe" -> "6")
  const roomNum = roomNumber.match(/(\d+)/)?.[1];

  if (!roomNum) return null;

  for (const lodgmentType of data.lodgmentTypes) {
    // 방번호가 숙박시설 이름에 포함되어 있는지 확인
    if (
      lodgmentType.lodgmentTypeName.includes(roomNum) ||
      lodgmentType.lodgmentTypeName.includes(roomNumber)
    ) {
      const day = lodgmentType.days.find((d) => d.date === date);
      if (!day) continue;

      for (const lodgment of day.lodgments) {
        for (const reservation of lodgment.reservations) {
          if (reservation.status === 'confirmed') {
            return reservation.userInfo;
          }
        }
      }
    }
  }

  return null;
};

/**
 * 방번호로 예약 정보 전체 조회
 */
export const getReservationByRoomNumber = (
  data: LodgmentData,
  roomNumber: string,
  date: string
): Reservation | null => {
  const roomNum = roomNumber.match(/(\d+)/)?.[1];

  if (!roomNum) return null;

  for (const lodgmentType of data.lodgmentTypes) {
    if (
      lodgmentType.lodgmentTypeName.includes(roomNum) ||
      lodgmentType.lodgmentTypeName.includes(roomNumber)
    ) {
      const day = lodgmentType.days.find((d) => d.date === date);
      if (!day) continue;

      for (const lodgment of day.lodgments) {
        for (const reservation of lodgment.reservations) {
          if (reservation.status === 'confirmed') {
            return reservation;
          }
        }
      }
    }
  }

  return null;
};

/**
 * 특정 날짜의 모든 방의 고객 정보 조회
 */
export const getAllCustomersForDate = (
  data: LodgmentData,
  date: string
): Array<{
  roomName: string;
  customerInfo: UserInfo;
  reservation: Reservation;
}> => {
  const customers: Array<{
    roomName: string;
    customerInfo: UserInfo;
    reservation: Reservation;
  }> = [];

  for (const lodgmentType of data.lodgmentTypes) {
    const day = lodgmentType.days.find((d) => d.date === date);
    if (!day) continue;

    for (const lodgment of day.lodgments) {
      for (const reservation of lodgment.reservations) {
        if (reservation.status === 'confirmed') {
          customers.push({
            roomName: lodgmentType.lodgmentTypeName,
            customerInfo: reservation.userInfo,
            reservation: reservation,
          });
        }
      }
    }
  }

  return customers;
};

/**
 * 방 이름을 간단한 형태로 변환 (숫자와 영문명만 추출)
 */
export const simplifyRoomName = (roomName: string): string => {
  // "에가톳캐빈- 1. Camino" -> "camino"
  const match = roomName.match(/\d+\.\s*([A-Za-z]+)/);
  return match ? match[1].toLowerCase() : roomName.toLowerCase();
};

/**
 * API에서 받은 데이터를 기존 테이블 형식에 맞게 변환
 */
export const transformApiDataToTableData = (
  data: LodgmentData,
  date: string
): Array<{
  id: number;
  name: string;
  customer: string;
  contact: string;
  customInout: string;
  notes: string;
  special?: string;
}> => {
  const roomMappings = [
    { id: 1, name: 'camino' },
    { id: 2, name: 'stone' },
    { id: 3, name: '봄비' },
    { id: 4, name: 'camellia' },
    { id: 5, name: 'hallasan' },
    { id: 6, name: 'paparecipe', special: '복층' },
    { id: 7, name: 'woozoo', special: '복층' },
    { id: 8, name: 'sea' },
    { id: 9, name: 'canola' },
    { id: 10, name: 'olle' },
    { id: 11, name: 'star', special: '복층' },
  ];

  return roomMappings.map((room) => {
    // API에서 해당 방의 고객 정보 찾기
    const customerInfo = getCustomerInfoByRoomNumber(
      data,
      room.id.toString(),
      date
    );
    const reservation = getReservationByRoomNumber(
      data,
      room.id.toString(),
      date
    );
    console.log(
      `Room ${room.id} (${room.name}):`,
      reservation?.nBookingDetails?.customFormInputs
    );

    return {
      id: room.id,
      name: room.name,
      customer: customerInfo?.name || '',
      contact: customerInfo?.phone || '',
      customInout:
        reservation?.nBookingDetails?.customFormInputs &&
        reservation.nBookingDetails.customFormInputs.length > 0
          ? reservation.nBookingDetails.customFormInputs
              .filter(
                (input) =>
                  input.value &&
                  input.value.trim() !== '' &&
                  !input.title.includes('체크인')
              )
              .map((input) => {
                // 제목을 더 간단하게 변환
                let title = input.title;
                if (title.includes('투숙 인원')) title = '인원';
                else if (title.includes('조식')) title = '조식';
                else if (title.includes('요가')) title = '요가';
                else if (title.includes('핫텁')) title = '핫텁';

                return `${title}: ${input.value}`;
              })
              .join('\n')
          : '',
      notes: reservation?.memo || '',
      special: room.special,
    };
  });
};

/**
 * 체크인 메시지용 객실별 고객 정보 조회
 */
export const getRoomCustomerInfoForCheckin = (
  data: LodgmentData,
  date: string
): Record<number, { 
  customer: string; 
  phone: string; 
  customInout: string;
  roomName: string;
}> => {
  const roomInfo: Record<number, { 
    customer: string; 
    phone: string; 
    customInout: string;
    roomName: string;
  }> = {};

  const roomMappings = [
    { id: 1, name: 'camino' },
    { id: 2, name: 'stone' },
    { id: 3, name: '봄비' },
    { id: 4, name: 'camellia' },
    { id: 5, name: 'hallasan' },
    { id: 6, name: 'paparecipe' },
    { id: 7, name: 'woozoo' },
    { id: 8, name: 'sea' },
    { id: 9, name: 'canola' },
    { id: 10, name: 'olle' },
    { id: 11, name: 'star' },
  ];

  roomMappings.forEach(room => {
    const customerInfo = getCustomerInfoByRoomNumber(data, room.id.toString(), date);
    const reservation = getReservationByRoomNumber(data, room.id.toString(), date);
    
    // customInout 정보 생성
    let customInout = '';
    if (reservation?.nBookingDetails?.customFormInputs && reservation.nBookingDetails.customFormInputs.length > 0) {
      customInout = reservation.nBookingDetails.customFormInputs
        .filter((input) =>
          input.value &&
          input.value.trim() !== '' &&
          !input.title.includes('체크인')
        )
        .map((input) => {
          let title = input.title;
          if (title.includes('투숙 인원')) title = '인원';
          else if (title.includes('조식')) title = '조식';
          else if (title.includes('요가')) title = '요가';
          else if (title.includes('핫텁')) title = '핫텁';
          return `${title}: ${input.value}`;
        })
        .join('\n');
    }

    roomInfo[room.id] = {
      customer: customerInfo?.name || '',
      phone: customerInfo?.phone || '',
      customInout: customInout,
      roomName: room.name
    };
  });

  return roomInfo;
};

/**
 * API 클라이언트
 */
export const fetchLodgmentData = async (
  startDate: string,
  endDate: string
): Promise<LodgmentData> => {
  const baseUrl =
    'https://hwik.io/api/pms/accommos/681077592fddbe59fc1e0eec/schedules';
  const url = `${baseUrl}?startDate=${startDate}&endDate=${endDate}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const apiResponse = await response.json();
    return apiResponse.data;
  } catch (error) {
    console.error('Failed to fetch lodgment data:', error);
    throw error;
  }
};
