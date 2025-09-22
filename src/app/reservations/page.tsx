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

export default function ReservationsPage() {
  const {
    data: reservations = [],
    isLoading,
    error,
    refetch,
  } = useReservations();

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // 오늘 날짜에 해당하는 예약들 필터링
  const getTodayReservations = () => {
    const today = new Date();
    return reservations.filter((reservation) => {
      const checkIn = new Date(reservation.checkIn);
      const checkOut = new Date(reservation.checkOut);

      return (
        checkIn.toDateString() === today.toDateString() ||
        checkOut.toDateString() === today.toDateString() ||
        (checkIn <= today && checkOut > today)
      );
    });
  };

  // 예약 ID 기준으로 중복 제거하는 함수
  const deduplicateReservations = (reservations: Reservation[]): Reservation[] => {
    const seen = new Set<string>();
    return reservations.filter(reservation => {
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

    const todayData = getTodayReservations();

    // 중복 제거
    const checkInList = deduplicateReservations(todayData.filter((r) => r.status === 'checkIn'));
    const checkOutList = deduplicateReservations(todayData.filter((r) => r.status === 'checkOut'));
    const stayingList = deduplicateReservations(todayData.filter((r) => r.status === 'staying'));

    // 주간 현황 데이터 생성 (오늘 이후 예약들)
    const weeklyData = deduplicateReservations(reservations.filter((r) => {
      const checkInDate = new Date(r.checkIn);
      return checkInDate > today && r.status === 'upcoming';
    }));

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
        console.log(r);
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
    if (checkOutList.length > 0) {
      text += `[2] 체크아웃\n`;
      checkOutList.forEach((r) => {
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
    if (stayingList.length > 0) {
      text += `[3] 재실\n`;
      stayingList.forEach((r) => {
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
