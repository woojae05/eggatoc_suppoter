'use client';

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Button,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  Alert,
  AlertIcon,
  Divider,
  Icon,
} from '@chakra-ui/react';
import {
  FaLeaf,
  FaCoffee,
  FaShare,
  FaCopy,
  FaYinYang,
  FaUtensils,
  FaClock,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import Layout from '@/components/layout/Layout';
import { useState, useEffect, useCallback } from 'react';

// 날짜 파싱 함수 (9/8, 9월8일 등의 형태를 처리)
// 커스텀 폼의 날짜는 실제 서비스 제공 날짜
// 예: target 9/7일 분석 시, 9/8 숙박자 중에서 "2명, 9/8" 서비스 요청한 사람을 찾음
function parseDateFromValue(value: string, targetDate: string): boolean {
  const targetDateObj = new Date(targetDate);
  
  // 타겟 날짜의 다음날을 계산 (서비스 제공 날짜)
  const nextDay = new Date(targetDateObj);
  nextDay.setDate(targetDateObj.getDate() + 1);
  const serviceMonth = nextDay.getMonth() + 1;
  const serviceDay = nextDay.getDate();
  
  // 다양한 날짜 형태 매칭
  const datePatterns = [
    /(\d{1,2})\/(\d{1,2})/,  // 9/8 형태
    /(\d{1,2})월\s*(\d{1,2})일?/,  // 9월8일 또는 9월 8일 형태
    /(\d{1,2})-(\d{1,2})/,  // 9-8 형태
  ];
  
  for (const pattern of datePatterns) {
    const match = value.match(pattern);
    if (match) {
      const formMonth = parseInt(match[1]);
      const formDay = parseInt(match[2]);
      
      // 강규연이 9/8 숙박하고 "9/8" 서비스 신청했다면, 
      // 이것은 9/7 분석에 포함되어야 함
      // 즉, 폼의 날짜가 타겟+1과 같으면 매치
      const isMatch = formMonth === serviceMonth && formDay === serviceDay;
      
      console.log('🔍 날짜 파싱:', { 
        폼데이터: value, 
        폼날짜: `${formMonth}/${formDay}`,
        분석날짜: targetDate,
        예상서비스날짜: `${serviceMonth}/${serviceDay}`,
        매치여부: isMatch 
      });
      
      return isMatch;
    }
  }
  
  return false;
}

// 선택된 날짜 요가 및 조식 인원 집계 함수
function getSelectedDateYogaAndBreakfastCount(data: any, targetDate: string) {
  let yogaCount = 0;
  let breakfastCount = 0;

  // 모든 숙소 타입을 순회
  data.data.lodgmentTypes.forEach((lodgmentType: any) => {
    // 선택된 날짜의 데이터 찾기
    const todayData = lodgmentType.days.find(
      (day: any) => day.date === targetDate
    );

    if (todayData && todayData.lodgments) {
      // 각 숙소의 예약 정보 확인
      todayData.lodgments.forEach((lodgment: any) => {
        lodgment.reservations.forEach((reservation: any) => {
          let hasCustomFormData = false;
          let tempYogaCount = 0;
          let tempBreakfastCount = 0;

          // 네이버 예약의 경우 nBookingDetails에서 정보 추출 (우선순위)
          if (
            reservation.nBookingDetails &&
            reservation.nBookingDetails.customFormInputs
          ) {
            const customInputs = reservation.nBookingDetails.customFormInputs;

            console.log(
              '예약자:',
              reservation.nBookingDetails.customFormInputs
            );

            // 조식 인원 확인
            const breakfastInput = customInputs.find(
              (input: any) =>
                input.title.includes('조식') &&
                input.value &&
                input.value.trim() !== ''
            );
            if (breakfastInput && parseDateFromValue(breakfastInput.value, targetDate)) {
              const match = breakfastInput.value.match(/(\d+)/);
              if (match) {
                tempBreakfastCount = parseInt(match[1]);
                hasCustomFormData = true;
                console.log('🍽️ 조식 카운트 추가:', {
                  예약자명: reservation.userInfo.name,
                  분석날짜: targetDate,
                  조식인원: match[1] + '명',
                  조식날짜: breakfastInput.value,
                  숙박일: targetDate
                });
              }
            }

            // 요가 인원 확인
            const yogaInput = customInputs.find(
              (input: any) =>
                input.title.includes('요가') &&
                input.value &&
                input.value.trim() !== ''
            );
            if (yogaInput && parseDateFromValue(yogaInput.value, targetDate)) {
              const match = yogaInput.value.match(/(\d+)/);
              if (match) {
                tempYogaCount = parseInt(match[1]);
                hasCustomFormData = true;
                console.log('🧘‍♀️ 요가 카운트 추가:', {
                  예약자명: reservation.userInfo.name,
                  분석날짜: targetDate,
                  요가인원: match[1] + '명',
                  요가날짜: yogaInput.value,
                  숙박일: targetDate
                });
              }
            }

            console.log('커스텀 폼 데이터:', {
              hasCustomFormData,
              tempYogaCount,
              tempBreakfastCount,
            });
          }

          // 커스텀 폼에 데이터가 없는 경우에만 addPersonOptions 확인
          if (!hasCustomFormData && reservation.addPersonOptions) {
            reservation.addPersonOptions.forEach((option: any) => {
              if (option.age && option.age.includes('요가')) {
                tempYogaCount += option.count || 0;
                // 요가하는 하루 패키지에는 조식도 포함되어 있음
                if (option.age.includes('조식')) {
                  tempBreakfastCount += option.count || 0;
                }
              }
            });
          }

          // 최종 카운트에 추가
          yogaCount += tempYogaCount;
          breakfastCount += tempBreakfastCount;
        });
      });
    }
  });
  console.log('선택된 날짜 요가 및 조식 인원 집계:', {
    targetDate,
    yogaCount,
    breakfastCount,
  });
  return {
    date: targetDate,
    yogaCount: yogaCount,
    breakfastCount: breakfastCount,
  };
}

// 선택된 날짜 상세한 분석을 위한 함수
function getSelectedDateDetailedAnalysis(data: any, targetDate: string) {
  const details: any[] = [];

  data.data.lodgmentTypes.forEach((lodgmentType: any) => {
    const todayData = lodgmentType.days.find(
      (day: any) => day.date === targetDate
    );

    if (todayData) {
      todayData.lodgments.forEach((lodgment: any) => {
        lodgment.reservations.forEach((reservation: any) => {
          const reservationDetail = {
            lodgmentName: lodgment.name,
            guestName: reservation.userInfo.name,
            platform: reservation.platformName,
            yoga: 0,
            breakfast: 0,
          };

          let hasCustomFormData = false;

          // 네이버 예약 정보 분석 (우선순위)
          if (
            reservation.nBookingDetails &&
            reservation.nBookingDetails.customFormInputs
          ) {
            const customInputs = reservation.nBookingDetails.customFormInputs;

            const breakfastInput = customInputs.find(
              (input: any) =>
                input.title.includes('조식') &&
                input.value &&
                input.value.trim() !== ''
            );
            if (breakfastInput && parseDateFromValue(breakfastInput.value, targetDate)) {
              const match = breakfastInput.value.match(/(\d+)/);
              if (match) {
                reservationDetail.breakfast = parseInt(match[1]);
                hasCustomFormData = true;
              }
            }

            const yogaInput = customInputs.find(
              (input: any) =>
                input.title.includes('요가') &&
                input.value &&
                input.value.trim() !== ''
            );
            if (yogaInput && parseDateFromValue(yogaInput.value, targetDate)) {
              const match = yogaInput.value.match(/(\d+)/);
              if (match) {
                reservationDetail.yoga = parseInt(match[1]);
                hasCustomFormData = true;
              }
            }
          }

          // 커스텀 폼에 데이터가 없는 경우에만 추가 옵션 분석
          if (!hasCustomFormData && reservation.addPersonOptions) {
            reservation.addPersonOptions.forEach((option: any) => {
              if (option.age) {
                // "요가하는 하루" 또는 "에가톳의 하루" 패키지는 요가+조식 포함
                if (
                  option.age.includes('요가하는 하루') ||
                  option.age.includes('에가톳의 하루')
                ) {
                  const count = option.count || 0;
                  reservationDetail.yoga += count;
                  reservationDetail.breakfast += count;
                }
                // 단독 요가 옵션
                else if (
                  option.age.includes('요가') &&
                  !option.age.includes('조식')
                ) {
                  reservationDetail.yoga += option.count || 0;
                }
                // 단독 조식 옵션
                else if (
                  option.age.includes('조식') &&
                  !option.age.includes('요가')
                ) {
                  reservationDetail.breakfast += option.count || 0;
                }
              }
            });
          }

          if (reservationDetail.yoga > 0 || reservationDetail.breakfast > 0) {
            details.push(reservationDetail);
          }
        });
      });
    }
  });

  return details;
}

// 웰니스 및 조식 정보
const wellnessInfo = {
  yoga: {
    title: '모닝 요가 클래스',
    time: '매일 오전 8:30 - 9:30',
    location: '메인 데크 (날씨에 따라 실내 스튜디오)',
    instructor: '전문 요가 강사',
    level: '초급자부터 중급자까지',
    equipment: '요가 매트 및 소품 제공',
    benefits: ['스트레스 해소', '유연성 향상', '명상과 힐링', '자연과의 조화'],
    note: '편안한 운동복 착용 권장',
  },
  breakfast: {
    title: '웰니스 조식',
    time: '매일 오전 9:30 - 10:30',
    location: '레스토랑 & 테라스',
    menu: {
      healthy: [
        '신선한 과일 플래터',
        '요거트 파르페',
        '그래놀라 볼',
        '녹색 스무디',
      ],
      korean: ['현미밥', '된장국', '나물 반찬', '구운 생선'],
      western: ['아보카도 토스트', '계란 요리', '신선한 샐러드', '허브 차'],
      special: [
        '유기농 재료 사용',
        '글루텐프리 옵션',
        '비건 메뉴',
        '로컬 농산물',
      ],
    },
    price: '1인 25,000원 (세금 포함)',
    reservation: '전날 오후 6시까지 예약 필수',
  },
};

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

interface WellnessData {
  yogaParticipants: number;
  breakfastReservations: number;
  totalGuests: number;
  guestDetails: {
    checkInToday: number;
    checkOutToday: number;
    stayingTonight: number;
  };
}

// 웰니스를 위한 예약 데이터 분석 함수
function analyzeReservationsForWellness(weekData: any, targetDate: string) {
  if (!weekData || !weekData.data || !weekData.data.lodgmentTypes) {
    return {
      totalGuests: 0,
      checkInToday: 0,
      checkOutToday: 0,
      stayingTonight: 0,
      roomsOccupied: 0,
    };
  }

  let totalGuests = 0;
  let checkInToday = 0;
  let checkOutToday = 0;
  let stayingTonight = 0;
  let roomsOccupied = 0;

  weekData.data.lodgmentTypes.forEach((lodgmentType: any) => {
    const cabinName = lodgmentType.lodgmentTypeName;
    const cabinNumber =
      cabinNumberMap[cabinName as keyof typeof cabinNumberMap];

    if (!cabinNumber || cabinNumber === 'WR' || cabinNumber === 'PET') return;

    // 해당 날짜의 데이터 찾기
    const dayData = lodgmentType.days?.find(
      (day: any) => day.date === targetDate
    );
    if (!dayData || !dayData.lodgments?.[0]) return;

    const lodgment = dayData.lodgments[0];
    if (!lodgment.reservations || lodgment.reservations.length === 0) return;

    const reservation = lodgment.reservations[0];
    if (!reservation.userInfo) return;

    roomsOccupied++;

    // 기본 게스트 수 (최소 1명)
    let guestCount = 1;

    // 추가 인원 옵션이 있는 경우
    if (reservation.addPersonOptions?.length > 0) {
      guestCount += reservation.addPersonOptions.length;
    }

    totalGuests += guestCount;

    // 체크인/체크아웃 날짜 확인 (간단한 추정)
    // 실제로는 예약의 체크인/체크아웃 날짜를 비교해야 함
    const isCheckIn = Math.random() > 0.7; // 30% 확률로 오늘 체크인
    const isCheckOut = Math.random() > 0.8; // 20% 확률로 오늘 체크아웃

    if (isCheckIn) {
      checkInToday += guestCount;
    }
    if (isCheckOut) {
      checkOutToday += guestCount;
    }

    stayingTonight += guestCount;
  });

  return {
    totalGuests,
    checkInToday,
    checkOutToday,
    stayingTonight,
    roomsOccupied,
  };
}

// 특별 안내사항 생성 함수
function generateSpecialNotes(
  reservationData: any,
  weatherStatus: string
): string[] {
  const notes: string[] = [];

  if (reservationData.checkInToday > 5) {
    notes.push('오늘 체크인 게스트 많음 - 요가 기초 안내 준비');
  }

  if (reservationData.totalGuests > 20) {
    notes.push('조식 대기 시간 예상 - 일찍 오실 것 권장');
  }

  if (weatherStatus === '맑음') {
    notes.push('좋은 날씨 - 야외 요가 및 테라스 조식 추천');
  } else {
    notes.push('실내 프로그램 준비 - 따뜻한 실내 공간 안내');
  }

  if (reservationData.roomsOccupied > 8) {
    notes.push('만실 임박 - 조기 예약 안내 필요');
  }

  if (notes.length === 0) {
    notes.push('평상시와 같은 서비스 제공');
  }

  return notes;
}

export default function WellnessBreakfastPage() {
  const [loading, setLoading] = useState(false);
  const [wellnessData, setWellnessData] = useState<WellnessData | null>(null);
  const [templateText, setTemplateText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dataCache, setDataCache] = useState<Map<string, WellnessData>>(
    new Map()
  );
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // 오늘 날짜 포맷팅 함수
  const formatDisplayDate = (date: Date): string => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[date.getDay()];
    return `${month}/${day}(${dayName})`;
  };

  // 날짜별 웰니스 정보 분석
  const generateWellnessDataForDate = useCallback(
    async (targetDate: Date) => {
      const dateKey = targetDate.toDateString();

      // 캐시에서 확인
      if (dataCache.has(dateKey) && !loading) {
        const cachedData = dataCache.get(dateKey)!;
        setWellnessData(cachedData);
        setTemplateText(generateTemplateForDate(cachedData, targetDate));
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 선택된 날짜 기준으로 7일간 데이터 가져오기
        const startDate = new Date(targetDate);
        startDate.setDate(targetDate.getDate() - 3); // 3일 전부터
        const endDate = new Date(targetDate);
        endDate.setDate(targetDate.getDate() + 3); // 3일 후까지

        const formatApiDate = (date: Date) => date.toISOString().split('T')[0];

        // 환경변수에서 API 설정 가져오기
        const baseUrl = process.env.NEXT_PUBLIC_PMS_API_BASE_URL;
        const accommoId = process.env.NEXT_PUBLIC_ACCOMMO_ID;

        if (!baseUrl || !accommoId) {
          throw new Error(
            'PMS API 설정이 누락되었습니다. 환경변수를 확인해주세요.'
          );
        }

        const apiUrl = `${baseUrl}/${accommoId}/schedules?startDate=${formatApiDate(
          startDate
        )}&endDate=${formatApiDate(endDate)}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const weekData = await response.json();

        // 선택된 날짜 기준으로 분석
        const targetDateStr = formatApiDate(targetDate);
        const displayDate = formatDisplayDate(targetDate);

        // 선택된 날짜 요가 및 조식 인원 집계
        const selectedDateAnalysisResult = getSelectedDateYogaAndBreakfastCount(
          weekData,
          targetDateStr
        );

        // 상세 분석
        const detailedAnalysis = getSelectedDateDetailedAnalysis(
          weekData,
          targetDateStr
        );
        console.log('상세 예약 현황:', detailedAnalysis);

        // 선택된 날짜 예약 데이터 분석
        const dateReservations = analyzeReservationsForWellness(
          weekData,
          targetDateStr
        );

        // 웰니스 데이터 생성 (실제 분석 결과 사용)
        const data: WellnessData = {
          yogaParticipants: selectedDateAnalysisResult.yogaCount,
          breakfastReservations: selectedDateAnalysisResult.breakfastCount,
          totalGuests: dateReservations.totalGuests,
          guestDetails: {
            checkInToday: dateReservations.checkInToday,
            checkOutToday: dateReservations.checkOutToday,
            stayingTonight: dateReservations.stayingTonight,
          },
        };

        // 캐시에 저장
        const newCache = new Map(dataCache);
        newCache.set(dateKey, data);
        setDataCache(newCache);

        // 템플릿 생성
        const template = generateTemplateForDate(data, targetDate);

        setWellnessData(data);
        setTemplateText(template);
      } catch (err) {
        console.error('데이터 가져오기 실패:', err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : '알 수 없는 오류가 발생했습니다.';
        setError(errorMessage);
        toast({
          title: '데이터 로드 실패',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    },
    [toast, dataCache]
  );

  // 템플릿 생성 함수
  const generateTemplateForDate = (data: WellnessData, date: Date): string => {
    const displayDate = formatDisplayDate(date);
    const isToday = date.toDateString() === new Date().toDateString();

    return `[${displayDate} 요가·조식 안내]
🧘‍♀️ 모닝 요가 (8:30-9:30)
- 요가: ${data.yogaParticipants}명

🍽️ 웰니스 조식 (9:30-10:30) 
- 조식: ${data.breakfastReservations}명`;
  };

  // 날짜 네비게이션 함수들
  const goToPreviousDay = () => {
    const prevDate = new Date(selectedDate);
    prevDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(prevDate);
  };

  const goToNextDay = () => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(nextDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // 선택된 날짜가 변경될 때마다 데이터 로드
  useEffect(() => {
    generateWellnessDataForDate(selectedDate);
  }, [selectedDate, generateWellnessDataForDate]);

  // 템플릿 복사 기능
  const copyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(templateText);
      toast({
        title: '복사 완료',
        description: '요가·조식 안내 템플릿이 클립보드에 복사되었습니다.',
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

  // 페이지 로드 시 초기화 (이미 위에서 selectedDate로 처리됨)

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
          <Heading size={{ base: 'lg', md: 'xl' }} color="green.600" mb={4}>
            <HStack justify="center" spacing={3}>
              <Icon as={FaYinYang} />
              <Text>요가, 조식 안내</Text>
              <Icon as={FaUtensils} />
            </HStack>
          </Heading>
          <Text
            color="gray.600"
            fontSize={{ base: 'md', md: 'lg' }}
            maxW="600px"
            mx="auto"
          >
            건강하고 평화로운 하루를 시작하세요. 모닝 요가와 웰니스 조식으로
            완벽한 휴식을 경험하세요.
          </Text>
        </Box>

        {/* Date Selection */}
        <Card bg="gray.50" borderRadius="xl" p={4}>
          <VStack spacing={4}>
            <HStack spacing={4} align="center">
              <Icon as={FaCalendarAlt} color="green.600" boxSize={5} />
              <Heading size="md" color="green.700">
                날짜 선택
              </Heading>
            </HStack>

            <HStack spacing={4} align="center">
              <Button
                variant="outline"
                colorScheme="green"
                size="sm"
                leftIcon={<FaChevronLeft />}
                onClick={goToPreviousDay}
                isDisabled={loading}
              >
                이전
              </Button>

              <Card bg="white" minW="200px">
                <CardBody textAlign="center" py={3}>
                  <VStack spacing={1}>
                    <Text fontSize="lg" fontWeight="bold" color="green.700">
                      {formatDisplayDate(selectedDate)}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {selectedDate.toDateString() === new Date().toDateString()
                        ? '오늘'
                        : selectedDate < new Date()
                        ? '과거'
                        : '미래'}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              <Button
                variant="outline"
                colorScheme="green"
                size="sm"
                rightIcon={<FaChevronRight />}
                onClick={goToNextDay}
                isDisabled={loading}
              >
                다음
              </Button>
            </HStack>

            <HStack spacing={2}>
              <Button
                colorScheme="green"
                variant="solid"
                size="sm"
                onClick={goToToday}
                isDisabled={loading}
              >
                오늘로
              </Button>
              <Button
                colorScheme="green"
                variant="outline"
                size="sm"
                onClick={() => generateWellnessDataForDate(selectedDate)}
                isLoading={loading}
                loadingText="로딩중..."
                leftIcon={<FaLeaf />}
              >
                새로고침
              </Button>
            </HStack>
          </VStack>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Text>{error}</Text>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Card>
            <CardBody textAlign="center" py={20}>
              <Spinner size="xl" color="green.500" />
              <Text mt={4} color="gray.600">
                정보를 불러오는 중...
              </Text>
            </CardBody>
          </Card>
        )}

        {/* Wellness Information */}
        {wellnessData && !loading && (
          <>
            {/* Today's Status Cards */}
            <VStack spacing={4}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                {/* Yoga Status */}
                <Card bg="green.50" borderColor="green.200" borderWidth="1px">
                  <CardHeader pb={3}>
                    <HStack>
                      <Icon as={FaYinYang} color="green.600" boxSize={6} />
                      <Heading size="md" color="green.700">
                        {selectedDate.toDateString() ===
                        new Date().toDateString()
                          ? '오늘'
                          : formatDisplayDate(selectedDate)}
                        의 요가 클래스
                      </Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack align="start" spacing={3}>
                      <HStack>
                        <Icon as={FaClock} color="green.600" />
                        <Text fontWeight="semibold">
                          {wellnessInfo.yoga.time}
                        </Text>
                      </HStack>
                      <Text>
                        <Text as="span" fontWeight="semibold">
                          참여 예정:
                        </Text>{' '}
                        <Badge colorScheme="green" fontSize="md" px={2} py={1}>
                          {wellnessData.yogaParticipants}명
                        </Badge>
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Breakfast Status */}
                <Card bg="orange.50" borderColor="orange.200" borderWidth="1px">
                  <CardHeader pb={3}>
                    <HStack>
                      <Icon as={FaCoffee} color="orange.600" boxSize={6} />
                      <Heading size="md" color="orange.700">
                        {selectedDate.toDateString() ===
                        new Date().toDateString()
                          ? '오늘'
                          : formatDisplayDate(selectedDate)}
                        의 조식 현황
                      </Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack align="start" spacing={3}>
                      <HStack>
                        <Icon as={FaClock} color="orange.600" />
                        <Text fontWeight="semibold">
                          {wellnessInfo.breakfast.time}
                        </Text>
                      </HStack>
                      <Text>
                        <Text as="span" fontWeight="semibold">
                          예약 예상:
                        </Text>{' '}
                        <Badge colorScheme="orange" fontSize="md" px={2} py={1}>
                          {wellnessData.breakfastReservations}명
                        </Badge>
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>

              {/* Guest Overview Card */}
            </VStack>

            {/* Detailed Information */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
              {/* Breakfast Information */}
            </SimpleGrid>

            {/* Share Template Button */}
            <Box textAlign="center">
              <Button
                leftIcon={<FaShare />}
                colorScheme="green"
                size="lg"
                onClick={onOpen}
              >
                공유용 안내문 보기
              </Button>
            </Box>
          </>
        )}

        {/* Template Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack>
                <FaShare />
                <Text>공유용 요가·조식 안내</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Text fontSize="sm" color="gray.600">
                  아래 내용을 복사하여 게스트에게 안내하세요.
                </Text>
                <Textarea
                  value={templateText}
                  isReadOnly
                  rows={12}
                  bg="gray.50"
                  fontFamily="monospace"
                  fontSize="sm"
                  resize="none"
                  borderRadius="md"
                />
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  * 웰니스 프로그램 정보는 날씨와 예약 상황에 따라 변동될 수
                  있습니다.
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
                  colorScheme="green"
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
