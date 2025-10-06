'use client';

import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  useColorModeValue,
  Icon,
  Flex,
  Textarea,
  useClipboard,
  Center,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FaCopy, FaFileAlt, FaSync } from 'react-icons/fa';
import Layout from '@/components/layout/Layout';
import { useReservations, type Reservation } from '@/hooks/useReservations';
import { useLodgmentData } from '@/hooks/useLodgmentData';
import { transformApiDataToTableData } from '@/utils/apiUtils';

export default function ReservationsPage() {
  const {
    data: reservations = [],
    isLoading,
    error,
    refetch,
  } = useReservations();

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // 어제와 오늘 날짜 문자열 생성
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  // 날짜 문자열 포맷팅 (YYYY-MM-DD)
  const formatDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatDateString(today);
  const yesterdayStr = formatDateString(yesterday);
  const tomorrowStr = formatDateString(new Date(today.getTime() + 24 * 60 * 60 * 1000));

  // API에서 어제 데이터 가져오기
  const { data: yesterdayLodgmentData } = useLodgmentData(yesterdayStr, todayStr);
  // API에서 오늘 데이터 가져오기  
  const { data: todayLodgmentData } = useLodgmentData(todayStr, tomorrowStr);

  // API 데이터를 테이블 데이터로 변환
  const getTodayAndYesterdayReservations = () => {
    const yesterdayReservations = yesterdayLodgmentData 
      ? transformApiDataToTableData(yesterdayLodgmentData, yesterdayStr).map(item => ({
          id: item.id.toString(),
          customerName: item.customer,
          phone: item.contact,
          checkIn: yesterdayStr,
          checkOut: yesterdayStr,
          roomNumber: item.id.toString(),
          roomName: item.name,
          roomType: item.name,
          guests: 0,
          status: 'checkIn' as const,
          services: item.customInout ? [item.customInout] : [],
          nights: 1,
          platform: '',
        }))
      : [];

    const todayReservations = todayLodgmentData
      ? transformApiDataToTableData(todayLodgmentData, todayStr).map(item => ({
          id: item.id.toString(),
          customerName: item.customer,
          phone: item.contact,
          checkIn: todayStr,
          checkOut: todayStr,
          roomNumber: item.id.toString(),
          roomName: item.name,
          roomType: item.name,
          guests: 0,
          status: 'checkIn' as const,
          services: item.customInout ? [item.customInout] : [],
          nights: 1,
          platform: '',
        }))
      : [];

    return { todayReservations, yesterdayReservations };
  };

  // 예약 ID 기준으로 중복 제거하는 함수
  const deduplicateReservations = (
    reservations: Reservation[]
  ): Reservation[] => {
    const seen = new Set<string>();
    return reservations.filter((reservation) => {
      if (seen.has(reservation.id)) {
        return false;
      }
      seen.add(reservation.id);
      return true;
    });
  };

  // 텍스트 형식 생성
  const generateReservationText = () => {
    const today = new Date();
    const formattedDate = `${today.getMonth() + 1}월 ${today.getDate()}일 (${
      ['일', '월', '화', '수', '목', '금', '토'][today.getDay()]
    })`;

    const { todayReservations, yesterdayReservations } =
      getTodayAndYesterdayReservations();
      

    // 중복 제거
    const checkInList = deduplicateReservations(
      todayReservations.filter((r) => r.status === 'checkIn')
    );

    // 재실(연박) 리스트: 어제와 오늘 동일한 고객
    const stayingList: Reservation[] = [];

    // 체크아웃 로직: 어제 투숙했지만 오늘 투숙자가 다른 경우
    const checkOutList: Reservation[] = [];

    // 객실별로 그룹화
    const roomGroups = new Map<
      string,
      { yesterday?: Reservation; today?: Reservation }
    >();

    // 고객 정보가 같은지 확인하는 함수 (이름 + 전화번호)
    function isSameGuest(guest1: Reservation, guest2: Reservation) {
      if (!guest1 || !guest2) return false;
      return guest1.customerName === guest2.customerName && guest1.phone === guest2.phone;
    }

    // 어제 예약 정리 (모든 상태 포함)
    yesterdayReservations.forEach((reservation) => {
      const key = reservation.roomNumber;
      if (!roomGroups.has(key)) roomGroups.set(key, {});
      roomGroups.get(key)!.yesterday = reservation;
    });

    // 오늘 예약 정리 (모든 상태 포함)
    todayReservations.forEach((reservation) => {
      const key = reservation.roomNumber;
      if (!roomGroups.has(key)) roomGroups.set(key, {});
      roomGroups.get(key)!.today = reservation;
    });

    // 체크아웃 및 재실 판별 (room-cleaning과 동일한 로직)
    roomGroups.forEach(({ yesterday, today }) => {
      if (yesterday) {
        if (!today) {
          // 어제 있고 오늘 없음: 체크아웃 후 빈방
          checkOutList.push(yesterday);
        } else if (!isSameGuest(yesterday, today)) {
          // 어제와 오늘 고객이 다름: 체크아웃 후 새 고객 체크인
          checkOutList.push(yesterday);
        } else {
          // 같은 고객이면 연박: 재실로 분류
          stayingList.push(today);
        }
      }
    });

    const deduplicatedCheckOutList = deduplicateReservations(checkOutList);
    const deduplicatedStayingList = deduplicateReservations(stayingList);
    


    // 주간 현황 데이터 생성 (오늘 이후 예약들)
    const weeklyData = deduplicateReservations(
      reservations.filter((r) => {
        const checkInDate = new Date(r.checkIn);
        return checkInDate > today && r.status === 'upcoming';
      })
    );

    const groupedWeekly = weeklyData.reduce((acc, reservation) => {
      const date = reservation.checkIn;
      if (!acc[date]) acc[date] = [];
      acc[date].push(reservation);
      return acc;
    }, {} as { [key: string]: Reservation[] });

    let text = `[공유] ${formattedDate} 예약 리스트\n\n`;

    // 체크인
    if (checkInList.length > 0) {
      text += `[1] 체크인\n`;
      checkInList.forEach((r) => {
        const services =
          r.services && r.services.length > 0 ? r.services.join(',') : '';
        text += ` - ${r.customerName}/${r.roomName}(${r.roomNumber})/${
          r.nights
        }박(~${r.checkOut.split('-').slice(1).join('.')})`;
        if (services) text += `/${services}`;
        text += '\n';
      });
      text += '\n';
    }
    // 체크아웃
    if (deduplicatedCheckOutList.length > 0) {
      text += `[2] 체크아웃\n`;
      deduplicatedCheckOutList.forEach((r) => {
        const services =
          r.services && r.services.length > 0 ? r.services.join(',') : '';
        text += ` - ${r.customerName}/${r.roomName}(${r.roomNumber})/${
          r.nights
        }박(~${r.checkOut.split('-').slice(1).join('.')})`;
        if (services) text += `/${services}`;
        text += '\n';
      });
      text += '\n';
    }

    // 재실
    if (deduplicatedStayingList.length > 0) {
      text += `[3] 재실\n`;
      deduplicatedStayingList.forEach((r) => {
        text += ` - ${r.customerName}/${r.roomName}(${r.roomNumber})/${
          r.nights
        }박(~${r.checkOut.split('-').slice(1).join('.')})\n`;
      });
      text += '\n';
    }

    // 주간현황
    if (Object.keys(groupedWeekly).length > 0) {
      text += `[4] 주간현황\n`;
      Object.keys(groupedWeekly)
        .sort()
        .forEach((date) => {
          const dateObj = new Date(date);
          const dateStr = `${dateObj.getMonth() + 1}.${dateObj.getDate()}`;
          text += `${dateStr}\n`;
          groupedWeekly[date].forEach((r) => {
            const services =
              r.services && r.services.length > 0
                ? `/${r.services.join(',')}`
                : '';
            text += ` - ${r.customerName}/${r.roomName}(${r.roomNumber})/${
              r.nights
            }박(~${r.checkOut.split('-').slice(1).join('.')})${services}\n`;
          });
        });
    }

    return text;
  };

  const reservationText = generateReservationText();
  const { onCopy, hasCopied } = useClipboard(reservationText);
  const textareaBg = useColorModeValue('gray.50', 'gray.800');

  return (
    <Layout>
      <Box p={6}>
        <VStack spacing={6} align="stretch">
          {/* 페이지 헤더 */}
          <Center>
            <VStack>
              <Heading as="h1" size="xl" mb={2}>
                예약 관리
              </Heading>
              <Text fontSize="lg" color="gray.600">
                실시간 예약 현황을 확인할 수 있습니다.
              </Text>
            </VStack>
          </Center>

          {/* 새로고침 버튼 */}
          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Flex justify="center">
                <Button
                  leftIcon={<Icon as={FaSync} />}
                  onClick={() => refetch()}
                  isLoading={isLoading}
                  size="md"
                  colorScheme="blue"
                >
                  데이터 새로고침
                </Button>
              </Flex>
            </CardBody>
          </Card>

          {/* 에러 메시지 */}
          {error && (
            <Alert status="error">
              <AlertIcon />
              {error.message || '예약 데이터를 불러오는데 실패했습니다.'}
            </Alert>
          )}

          {/* 로딩 상태 */}
          {isLoading && (
            <Center py={8}>
              <VStack spacing={4}>
                <Spinner size="lg" color="blue.500" />
                <Text>예약 데이터를 불러오는 중...</Text>
              </VStack>
            </Center>
          )}

          {/* 텍스트 형식 생성 및 복사 */}
          {!isLoading && !error && (
            <Card bg={cardBg} borderColor={borderColor}>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Flex align="center" justify="space-between">
                    <HStack>
                      <Icon as={FaFileAlt} color="blue.500" />
                      <Heading size="md">예약 리스트 텍스트</Heading>
                    </HStack>
                    <Button
                      leftIcon={<Icon as={FaCopy} />}
                      colorScheme={hasCopied ? 'green' : 'blue'}
                      onClick={onCopy}
                      size="sm"
                    >
                      {hasCopied ? '복사됨!' : '복사하기'}
                    </Button>
                  </Flex>
                  <Textarea
                    value={reservationText}
                    readOnly
                    rows={20}
                    fontFamily="monospace"
                    fontSize="sm"
                    bg={textareaBg}
                    resize="vertical"
                  />
                </VStack>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Box>
    </Layout>
  );
}
