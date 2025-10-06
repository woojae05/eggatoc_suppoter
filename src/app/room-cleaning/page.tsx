'use client';

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Badge,
  Button,
  useToast,
  Alert,
  AlertIcon,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  IconButton,
} from '@chakra-ui/react';
import { FaShare, FaCopy } from 'react-icons/fa';
import Layout from '@/components/layout/Layout';
import { useState, useEffect, useMemo } from 'react';
import { useCleaningData } from '@/hooks/useCleaningData';

// 캐빈 번호 매핑
const cabinNumberMap = {
  '에가톳캐빈- Wellness Retreat': 'WR',
  '에가톳캐빈- 1. Camino': '1',
  '에가톳캐빈- 2. Stone': '2',
  '에가톳캐빈- 3. 봄비': '3',
  '에가톳캐빈- 4. Camellia': '4',
  '에가톳캐빈- 5. Hallasan': '5',
  '에가톳캐빈- 6. Paparecipe (복층)': '6',
  '에가톳캐빈- 7. Woozoo (복층)': '7',
  '에가톳캐빈- 8. Sea': '8',
  '에가톳캐빈- 9. Canola': '9',
  '에가톳캐빈- 10. Olie': '10',
  '에가톳캐빈- 11. Star (복층/반려견 동반)': '11',
  '에가톳캐빈- 반려견 동반 (only stay)': 'PET',
};

const formatApiDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface CleaningAnalysisResult {
  cleaningRooms: string[];
  hotTubRooms: string[];
  consecutiveStayRooms: string[];
  tomorrowExpectedRooms: string[];
}

// 7일간의 예약 데이터에서 특정 날짜를 기준으로 어제, 오늘, 내일 데이터를 추출하는 함수
function extractDayData(weekData: any, targetDate: string) {
  if (!weekData || !weekData.data || !weekData.data.lodgmentTypes) {
    return { yesterdayData: null, todayData: null, tomorrowData: null };
  }

  // 날짜 계산
  const today = new Date(targetDate);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // 날짜를 YYYY-MM-DD 형식으로 변환
  const yesterdayStr = formatApiDate(yesterday);
  const todayStr = formatApiDate(today);
  const tomorrowStr = formatApiDate(tomorrow);

  // 특정 날짜의 데이터만 필터링하는 함수
  function filterDataByDate(dateStr: string) {
    const filteredData = {
      msg: weekData.msg,
      data: {
        lodgmentTypes: weekData.data.lodgmentTypes.map((lodgmentType: any) => ({
          ...lodgmentType,
          days: lodgmentType.days.filter((day: any) => day.date === dateStr),
        })),
      },
    };
    return filteredData;
  }

  return {
    yesterdayData: filterDataByDate(yesterdayStr),
    todayData: filterDataByDate(todayStr),
    tomorrowData: filterDataByDate(tomorrowStr),
  };
}

// 예약 데이터를 분석하여 청소 사항을 생성하는 함수
function analyzeCleaningTasks(
  yesterdayData: any,
  todayData: any,
  tomorrowData: any
): CleaningAnalysisResult {
  // 각 날짜별 예약 데이터 파싱
  function parseReservationData(data: any) {
    const reservations: any = {};

    if (!data || !data.data || !data.data.lodgmentTypes) {
      return reservations;
    }

    data.data.lodgmentTypes.forEach((lodgmentType: any) => {
      const cabinName = lodgmentType.lodgmentTypeName;
      const cabinNumber =
        cabinNumberMap[cabinName as keyof typeof cabinNumberMap];

      if (!cabinNumber) return;

      // 해당 날짜의 데이터 찾기
      const dayData = lodgmentType.days?.[0]; // 첫 번째 날짜 데이터 사용
      if (!dayData || !dayData.lodgments?.[0]) {
        reservations[cabinNumber] = null; // 빈방
        return;
      }

      const lodgment = dayData.lodgments[0];
      if (!lodgment.reservations || lodgment.reservations.length === 0) {
        reservations[cabinNumber] = null; // 빈방
      } else {
        const reservation = lodgment.reservations[0];
        reservations[cabinNumber] = {
          name: reservation.userInfo?.name || '',
          phone: reservation.userInfo?.phone || '',
          hasAdditionalOptions:
            reservation.addPersonOptions?.length > 0 ||
            reservation.additionalOptions?.length > 0,
          options: [
            ...(reservation.addPersonOptions?.map((opt: any) => opt.age) || []),
            ...(reservation.additionalOptions?.map((opt: any) => opt?.title).filter(Boolean) ||
              []),
          ],
        };
      }
    });

    return reservations;
  }

  const yesterday = parseReservationData(yesterdayData);
  const today = parseReservationData(todayData);
  const tomorrow = parseReservationData(tomorrowData);

  // 고객 정보가 같은지 확인하는 함수 (이름 + 전화번호)
  function isSameGuest(guest1: any, guest2: any) {
    if (!guest1 || !guest2) return false;
    return guest1.name === guest2.name && guest1.phone === guest2.phone;
  }

  // 결과 배열들
  const cleaningRooms: string[] = [];
  const hotTubRooms: string[] = [];
  const consecutiveStayRooms: string[] = [];
  const tomorrowExpectedRooms: string[] = [];

  // 모든 캐빈 번호 순회
  const allCabinNumbers = Object.values(cabinNumberMap).filter(
    (num) => num !== 'WR' && num !== 'PET'
  );

  allCabinNumbers.forEach((cabinNumber) => {
    const yesterdayGuest = yesterday[cabinNumber];
    const todayGuest = today[cabinNumber];
    const tomorrowGuest = tomorrow[cabinNumber];

    // 1. 청소할 객실 판별
    if (todayGuest) {
      // 오늘 예약이 있는 경우
      if (!yesterdayGuest) {
        // 어제 빈방 → 오늘 예약: 청소 안함
      } else if (isSameGuest(yesterdayGuest, todayGuest)) {
        // 연박 고객: 청소 안함
      } else {
        // 고객 변경: 청소 필요
        cleaningRooms.push(cabinNumber);
      }
    } else if (yesterdayGuest && !todayGuest) {
      // 어제 있고 오늘 없음: 체크아웃 후 청소 필요
      cleaningRooms.push(cabinNumber);
    }

    // 2. 핫텁 사용 객실 (오늘 추가 옵션이 있는 객실)
    if (
      yesterdayGuest &&
      yesterdayGuest.hasAdditionalOptions &&
      !isSameGuest(yesterdayGuest, todayGuest)
    ) {
      hotTubRooms.push(cabinNumber);
    }

    // 3. 연박 고객님 (어제-오늘 기준으로만 판별)
    if (
      yesterdayGuest &&
      todayGuest &&
      isSameGuest(yesterdayGuest, todayGuest)
    ) {
      consecutiveStayRooms.push(cabinNumber);
    }

    // 4. 내일 예상 객실 (오늘 투숙 중이고 내일 체크아웃하는 객실)
    if (todayGuest) {
      // 오늘 투숙 중
      if (!tomorrowGuest) {
        // 내일 빈방: 체크아웃
        tomorrowExpectedRooms.push(cabinNumber);
      } else if (!isSameGuest(todayGuest, tomorrowGuest)) {
        // 내일 다른 고객: 체크아웃
        tomorrowExpectedRooms.push(cabinNumber);
      }
      // 내일도 동일 고객이면 연박으로 체크아웃 안함
    }
  });

  // 결과 정렬
  cleaningRooms.sort((a, b) => parseInt(a) - parseInt(b));
  hotTubRooms.sort((a, b) => parseInt(a) - parseInt(b));
  consecutiveStayRooms.sort((a, b) => parseInt(a) - parseInt(b));
  tomorrowExpectedRooms.sort((a, b) => parseInt(a) - parseInt(b));

  return {
    cleaningRooms,
    hotTubRooms,
    consecutiveStayRooms,
    tomorrowExpectedRooms,
  };
}

// 결과를 템플릿 형식으로 포맷팅하는 함수
function formatCleaningTemplate(
  result: CleaningAnalysisResult,
  date: string
): string {
  const {
    cleaningRooms,
    hotTubRooms,
    consecutiveStayRooms,
    tomorrowExpectedRooms,
  } = result;

  return `[${date} 객실청소 사항 공유]
- 청소할 객실 : ${cleaningRooms.length > 0 ? cleaningRooms.join(', ') : '없음'}
- 핫텁 : ${hotTubRooms.length > 0 ? hotTubRooms.join(', ') : '없음'}
- 연박 고객님 : ${
    consecutiveStayRooms.length > 0 ? consecutiveStayRooms.join(', ') : '없음'
  }
- 내일 예상 객실 : ${
    tomorrowExpectedRooms.length > 0 ? tomorrowExpectedRooms.join(', ') : '없음'
  }`;
}

export default function RoomCleaningPage() {
  const [cleaningData, setCleaningData] =
    useState<CleaningAnalysisResult | null>(null);
  const [templateText, setTemplateText] = useState('');
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // 날짜 범위 설정 (3일 전부터 3일 후까지)
  const dateRange = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 3);
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 3);
    return { today, startDate, endDate };
  }, []);

  const { today, startDate, endDate } = dateRange;

  // React Query hook
  const { data: weekData, isLoading: loading, error, refetch } = useCleaningData(startDate, endDate);

  // 오늘 날짜 포맷팅 함수
  const formatDisplayDate = (date: Date): string => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[date.getDay()];
    return `${month}/${day}(${dayName})`;
  };

  // 데이터 처리
  useEffect(() => {
    if (weekData) {
      try {
        // 오늘 날짜 기준으로 분석
        const todayStr = formatApiDate(today);
        const displayDate = formatDisplayDate(today);

        // 7일 데이터에서 어제, 오늘, 내일 추출
        const { yesterdayData, todayData, tomorrowData } = extractDayData(
          weekData,
          todayStr
        );

        // 청소 사항 분석
        const result = analyzeCleaningTasks(
          yesterdayData,
          todayData,
          tomorrowData
        );

        // 템플릿 포맷팅
        const template = formatCleaningTemplate(result, displayDate);

        setCleaningData(result);
        setTemplateText(template);
      } catch (err) {
        console.error('데이터 처리 실패:', err);
      }
    }
  }, [weekData, today]);

  // 에러 처리
  useEffect(() => {
    if (error) {
      const errorMessage = error instanceof Error ? error.message : '데이터를 불러오는데 실패했습니다.';
      toast({
        title: '데이터 로드 실패',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [error, toast]);

  // 템플릿 복사 기능
  const copyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(templateText);
      toast({
        title: '복사 완료',
        description: '청소 안내 템플릿이 클립보드에 복사되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: '복사 실패',
        description: '클립보드 복사 중 오류가 발생했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };


  return (
    <Layout>
      <VStack
        spacing={8}
        pt={{ base: '100px', lg: '0px' }}
        align="stretch"
        maxW="1200px"
        mx="auto"
        px={4}
      >
        {/* Page Header */}
        <Box textAlign="center">
          <Heading size={{ base: 'lg', md: 'xl' }} color="blue.600" mb={4}>
            오늘 객실청소 안내
          </Heading>
          <Text
            color="gray.600"
            fontSize={{ base: 'md', md: 'lg' }}
            maxW="600px"
            mx="auto"
          >
            실시간 예약 데이터를 기반으로 한 객실 청소 현황을 확인하세요.
          </Text>
        </Box>
        {/* Refresh Button */}
        <HStack>
          <Box textAlign="center">
            <Button
              colorScheme="blue"
              onClick={() => refetch()}
              isLoading={loading}
              loadingText="데이터 로드 중..."
              size="lg"
            >
              데이터 새로고침
            </Button>
          </Box>

          <VStack align="center" spacing={4}>
            <Button colorScheme="blue" leftIcon={<FaShare />} onClick={onOpen}>
              공유용 청소상황 보기
            </Button>
          </VStack>
        </HStack>
        {/* Error Alert */}
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Text>{error instanceof Error ? error.message : '데이터를 불러오는데 실패했습니다.'}</Text>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Card>
            <CardBody textAlign="center" py={20}>
              <Spinner size="xl" color="blue.500" />
              <Text mt={4} color="gray.600">
                데이터를 불러오는 중...
              </Text>
            </CardBody>
          </Card>
        )}

        {/* Cleaning Data Table */}
        {cleaningData && !loading && (
          <>
            {/* Detailed Table */}
            <Card>
              <CardHeader>
                <Heading size="md" color="blue.600">
                  상세 청소 현황
                </Heading>
              </CardHeader>
              <CardBody>
                <TableContainer>
                  <Table variant="simple" size="md">
                    <Thead>
                      <Tr>
                        <Th>구분</Th>
                        <Th>객실 번호</Th>
                        <Th>상태</Th>
                        <Th>비고</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td fontWeight="semibold">청소 필요</Td>
                        <Td>
                          {cleaningData.cleaningRooms.length > 0 ? (
                            cleaningData.cleaningRooms.map((room) => (
                              <Badge key={room} colorScheme="red" mr={1} mb={1}>
                                {room}번
                              </Badge>
                            ))
                          ) : (
                            <Text color="gray.500">없음</Text>
                          )}
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={
                              cleaningData.cleaningRooms.length > 0
                                ? 'red'
                                : 'gray'
                            }
                          >
                            {cleaningData.cleaningRooms.length > 0
                              ? '청소 대기'
                              : '청소 완료'}
                          </Badge>
                        </Td>
                        <Td fontSize="sm" color="gray.600">
                          고객 변경 또는 체크아웃
                        </Td>
                      </Tr>

                      <Tr>
                        <Td fontWeight="semibold">핫텁 사용</Td>
                        <Td>
                          {cleaningData.hotTubRooms.length > 0 ? (
                            cleaningData.hotTubRooms.map((room) => (
                              <Badge
                                key={room}
                                colorScheme="purple"
                                mr={1}
                                mb={1}
                              >
                                {room}번
                              </Badge>
                            ))
                          ) : (
                            <Text color="gray.500">없음</Text>
                          )}
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={
                              cleaningData.hotTubRooms.length > 0
                                ? 'purple'
                                : 'gray'
                            }
                          >
                            {cleaningData.hotTubRooms.length > 0
                              ? '특별 관리'
                              : '일반 관리'}
                          </Badge>
                        </Td>
                        <Td fontSize="sm" color="gray.600">
                          추가 옵션 이용 객실
                        </Td>
                      </Tr>

                      <Tr>
                        <Td fontWeight="semibold">연박 고객</Td>
                        <Td>
                          {cleaningData.consecutiveStayRooms.length > 0 ? (
                            cleaningData.consecutiveStayRooms.map((room) => (
                              <Badge
                                key={room}
                                colorScheme="green"
                                mr={1}
                                mb={1}
                              >
                                {room}번
                              </Badge>
                            ))
                          ) : (
                            <Text color="gray.500">없음</Text>
                          )}
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={
                              cleaningData.consecutiveStayRooms.length > 0
                                ? 'green'
                                : 'gray'
                            }
                          >
                            {cleaningData.consecutiveStayRooms.length > 0
                              ? '청소 제외'
                              : '해당 없음'}
                          </Badge>
                        </Td>
                        <Td fontSize="sm" color="gray.600">
                          동일 고객 연박 중
                        </Td>
                      </Tr>

                      <Tr>
                        <Td fontWeight="semibold">내일 예상</Td>
                        <Td>
                          {cleaningData.tomorrowExpectedRooms.length > 0 ? (
                            cleaningData.tomorrowExpectedRooms.map((room) => (
                              <Badge
                                key={room}
                                colorScheme="orange"
                                mr={1}
                                mb={1}
                              >
                                {room}번
                              </Badge>
                            ))
                          ) : (
                            <Text color="gray.500">없음</Text>
                          )}
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={
                              cleaningData.tomorrowExpectedRooms.length > 0
                                ? 'orange'
                                : 'gray'
                            }
                          >
                            {cleaningData.tomorrowExpectedRooms.length > 0
                              ? '체크아웃 예정'
                              : '해당 없음'}
                          </Badge>
                        </Td>
                        <Td fontSize="sm" color="gray.600">
                          내일 체크아웃 예정 객실
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </>
        )}

        {/* Template Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack>
                <FaShare />
                <Text>공유용 청소상황</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Text fontSize="sm" color="gray.600">
                  아래 내용을 복사하여 메신저나 메모장에 공유하세요.
                </Text>
                <Textarea
                  value={templateText}
                  isReadOnly
                  rows={8}
                  bg="gray.50"
                  fontFamily="monospace"
                  fontSize="sm"
                  resize="none"
                  borderRadius="md"
                />
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  * 실시간 예약 데이터 기반으로 생성된 청소 안내입니다.
                </Text>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack spacing={3}>
                <Button variant="ghost" onClick={onClose}>
                  닫기
                </Button>
                <Button
                  leftIcon={<FaCopy />}
                  colorScheme="blue"
                  onClick={copyTemplate}
                >
                  클립보드에 복사
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Layout>
  );
}
