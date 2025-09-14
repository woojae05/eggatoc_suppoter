'use client';

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Button,
  useToast,
  Card,
  CardBody,
  Spinner,
  Badge,
  useDisclosure,
} from '@chakra-ui/react';
import Layout from '@/components/layout/Layout';
import { useState, useEffect, useRef } from 'react';
import { rooms } from '@/model/rooms';

import { LodgmentData } from '@/types/api';
import {
  fetchLodgmentData,
  getRoomCustomerInfoForCheckin,
} from '@/utils/apiUtils';

// LocalStorage에서 오늘 날짜 키 생성
const getTodayKey = () => {
  const today = new Date();
  return `checkin-sent-${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

// LocalStorage에서 오늘 전송된 방 목록 가져오기
const getTodaySentRooms = (): Set<number> => {
  if (typeof window === 'undefined') return new Set();

  const todayKey = getTodayKey();
  const stored = localStorage.getItem(todayKey);

  if (stored) {
    try {
      const roomNumbers = JSON.parse(stored);
      return new Set(roomNumbers);
    } catch (error) {
      console.error('LocalStorage 데이터 파싱 오류:', error);
      return new Set();
    }
  }

  return new Set();
};

// LocalStorage에 오늘 전송된 방 목록 저장
const saveTodaySentRooms = (sentRooms: Set<number>) => {
  if (typeof window === 'undefined') return;

  const todayKey = getTodayKey();
  const roomNumbers = Array.from(sentRooms);
  localStorage.setItem(todayKey, JSON.stringify(roomNumbers));
};

export default function CheckInMessagePage() {
  const [selectedButton, setSelectedButton] = useState<number | null>(null);
  const [loadingButtons, setLoadingButtons] = useState<Set<number>>(new Set());
  const [sentButtons, setSentButtons] = useState<Set<number>>(new Set());
  const [customerData, setCustomerData] = useState<
    Record<
      number,
      {
        customer: string;
        phone: string;
        customInout: string;
        roomName: string;
      }
    >
  >({});
  const [apiLoading, setApiLoading] = useState(true);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [roomToSend, setRoomToSend] = useState<number | null>(null);

  // API 데이터 로드
  useEffect(() => {
    const fetchCustomerData = async () => {
      setApiLoading(true);
      try {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        const nextDay = new Date(today);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextYear = nextDay.getFullYear();
        const nextMonth = String(nextDay.getMonth() + 1).padStart(2, '0');
        const nextDayOfMonth = String(nextDay.getDate()).padStart(2, '0');
        const endDateString = `${nextYear}-${nextMonth}-${nextDayOfMonth}`;

        const data = await fetchLodgmentData(dateString, endDateString);
        const roomCustomerInfo = getRoomCustomerInfoForCheckin(
          data,
          dateString
        );
        setCustomerData(roomCustomerInfo);
      } catch (error) {
        console.error('고객 데이터 로드 실패:', error);
        toast({
          title: '데이터 로드 실패',
          description: '고객 정보를 불러오는데 실패했습니다.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setApiLoading(false);
      }
    };

    fetchCustomerData();
  }, [toast]);

  // 컴포넌트 마운트 시 오늘 전송된 방 목록 로드
  useEffect(() => {
    const todaySentRooms = getTodaySentRooms();
    setSentButtons(todaySentRooms);
  }, []);

  const handleSendConfirmation = (buttonNumber: number) => {
    setRoomToSend(buttonNumber);
    onOpen();
  };

  const handleSendMessage = async () => {
    if (roomToSend === null) return;

    const buttonNumber = roomToSend;
    const room = rooms[buttonNumber as keyof typeof rooms];

    // 이미 오늘 전송된 방인지 확인
    if (sentButtons.has(buttonNumber)) {
      toast({
        title: '이미 전송 완료',
        description: `${buttonNumber}번 객실은 오늘 이미 메시지가 전송되었습니다.`,
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    // 로딩 상태 시작
    setLoadingButtons((prev) => new Set(prev).add(buttonNumber));
    setSelectedButton(buttonNumber);
    onClose();

    try {
      const customerInfo = customerData[buttonNumber];
      if (!customerInfo || !customerInfo.phone) {
        throw new Error('고객 정보 또는 전화번호가 없습니다.');
      }

      const from = process.env.NEXT_PUBLIC_SOLAPI_FROM_NUMBER;
      if (!from) {
        throw new Error(
          '발신자 번호가 설정되지 않았습니다. .env.local 파일을 확인해주세요.'
        );
      }

      const messageText = `안녕하세요 에가톳입니다 :) \n\n체크인 시간이 마감되어 셀프체크인 관련 내용 전송드립니다!\n\n고객님이 묵으실 객실은 ${room.id}번(${room.name}, ${room.type}) 캐빈 입니다. \n다른 객실과 착오가 없도록 입간판 확인 부탁드립니다!\n\n자차 이용시 묵으시는 각 캐빈별로 야외 마당에 후면 주차가 가능하시니 참고 부탁드립니다.\n\n문은 개방되어 있는 상태이고, 열쇠는 객실 선반에 비치되어 있습니다. \n\n객실 내부에 캐빈 이용 안내서가 마련되어 있습니다. 반드시 참고 부탁드립니다\n\n* 공용구간에 히마 (5개월 강아지/새로운사람과 강아지에 흥미도가 높은 편) 가 상주하고 있습니다. 공용구간 내부 들어 가실 경우, 유의 부탁드립니다:)\n\n묵으시는 객실 입간판 사진 첨부드립니다. 감사합니다 :)\n\n문의처 :  010-9677-5245\n(부가서비스 이용관련 내용 전달을 위해 전화드릴 예정입니다)`;

      const messages = [
        {
          to: '01057957706',
          from: from,
          text: messageText,
        },
      ];

      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        // 성공 시 전송 완료 상태 추가 및 LocalStorage 저장
        const newSentButtons = new Set(sentButtons).add(buttonNumber);
        setSentButtons(newSentButtons);
        saveTodaySentRooms(newSentButtons);

        toast({
          title: `${buttonNumber}번 객실 메시지 전송 완료`,
          description: `${room.name} (${room.type}) 객실의 체크인 메시지가 전송되었습니다.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
      } else {
        throw new Error(responseData.error || '전송 실패');
      }
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      // 실패 시 토스트 표시
      toast({
        title: '메시지 전송 실패',
        description:
          error instanceof Error
            ? error.message
            : '메시지 전송 중 오류가 발생했습니다.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      // 로딩 상태 종료
      setLoadingButtons((prev) => {
        const newSet = new Set(prev);
        newSet.delete(buttonNumber);
        return newSet;
      });
      setRoomToSend(null);
    }
  };

  const generateButtons = () => {
    const buttons = [];
    for (let i = 1; i <= 11; i++) {
      const room = rooms[i as keyof typeof rooms];
      const customerInfo = customerData[i];
      const hasCustomer = customerInfo && customerInfo.customer;
      const isLoading = loadingButtons.has(i);
      const isSent = sentButtons.has(i);

      buttons.push(
        <Box key={i} textAlign="center" position="relative">
          <Button
            size="lg"
            h={{ base: '120px', md: '140px' }}
            w={{ base: '120px', md: '140px' }}
            fontSize={{ base: 'xl', md: '2xl' }}
            fontWeight="bold"
            colorScheme={isSent ? 'green' : hasCustomer ? 'blue' : 'gray'}
            variant={
              isSent ? 'solid' : selectedButton === i ? 'solid' : 'outline'
            }
            bg={
              isSent
                ? 'green.500'
                : selectedButton === i
                ? hasCustomer
                  ? 'blue.600'
                  : 'gray.600'
                : hasCustomer
                ? 'blue.50'
                : 'gray.50'
            }
            color={
              isSent
                ? 'white'
                : selectedButton === i
                ? 'white'
                : hasCustomer
                ? 'blue.800'
                : 'gray.600'
            }
            borderColor={
              isSent ? 'green.500' : hasCustomer ? 'blue.500' : 'gray.300'
            }
            borderWidth="2px"
            flexDirection="column"
            borderRadius="xl"
            isLoading={isLoading}
            loadingText=""
            spinner={<Spinner size="lg" color="white" />}
            isDisabled={isLoading || isSent || !hasCustomer}
            _hover={{
              bg: isSent
                ? 'green.500'
                : selectedButton === i
                ? 'primary.800'
                : 'primary.50',
              transform: !isLoading && !isSent ? 'translateY(-2px)' : 'none',
              boxShadow: !isLoading && !isSent ? 'lg' : 'none',
              cursor: isSent ? 'not-allowed' : 'pointer',
            }}
            _active={{
              transform: 'translateY(0)',
            }}
            onClick={() => handleSendConfirmation(i)}
            transition="all 0.2s"
          >
            {!isLoading && (
              <>
                <Text
                  fontSize={{ base: 'xl', md: '2xl' }}
                  fontWeight="bold"
                  mb={1}
                >
                  {i}
                </Text>
                <Text
                  fontSize={{ base: '2xs', md: 'xs' }}
                  fontWeight="medium"
                  opacity={0.8}
                  mb={1}
                >
                  {room.name}
                </Text>
                {hasCustomer ? (
                  <>
                    <Text
                      fontSize={{ base: '2xs', md: 'xs' }}
                      fontWeight="bold"
                      mb={0.5}
                    >
                      {customerInfo.customer}
                    </Text>
                    <Text fontSize={{ base: '3xs', md: '2xs' }} opacity={0.7}>
                      {customerInfo.phone}
                    </Text>
                  </>
                ) : (
                  <Text fontSize={{ base: '2xs', md: 'xs' }} opacity={0.6}>
                    예약 없음
                  </Text>
                )}
              </>
            )}
          </Button>

          {/* 전송 완료 배지 */}
          {isSent && !isLoading && (
            <Badge
              position="absolute"
              top="-8px"
              right="-8px"
              colorScheme="green"
              borderRadius="full"
              px={2}
              py={1}
              fontSize="2xs"
              fontWeight="bold"
            >
              전송완료
            </Badge>
          )}
        </Box>
      );
    }
    return buttons;
  };

  return (
    <Layout>
      <VStack
        spacing={8}
        pt={{ base: '100px', lg: '0px' }}
        align="stretch"
        maxW="1200px"
        mx="auto"
      >
        {/* Page Header */}
        <Box textAlign="center">
          <Heading size={{ base: 'lg', md: 'xl' }} color="primary.900" mb={4}>
            레이트 체크인 안내 메시지
          </Heading>
          <Text
            color="gray.600"
            fontSize={{ base: 'md', md: 'lg' }}
            maxW="600px"
            mx="auto"
          >
            객실별 레이트 체크인 메시지를 발송하여 게스트에게 안내하세요.
          </Text>
        </Box>

        {/* Button Grid */}
        <Card bg="white" shadow="md" borderRadius="xl">
          <CardBody p={{ base: 6, md: 8 }}>
            <VStack spacing={4} mb={4}>
              <Heading size="md" color="primary.900" textAlign="center">
                객실 선택
              </Heading>
              <Text fontSize="sm" color="gray.600" textAlign="center">
                레이트 체크인 메시지를 발송할 객실을 선택해주세요
              </Text>
              {apiLoading && (
                <Badge colorScheme="yellow" variant="subtle" px={3} py={1}>
                  <Spinner size="sm" mr={2} />
                  고객 정보 로딩 중...
                </Badge>
              )}
            </VStack>
            <SimpleGrid
              columns={{ base: 2, sm: 3, md: 4, lg: 5 }}
              spacing={{ base: 4, md: 6 }}
              justifyItems="center"
            >
              {generateButtons()}
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Instructions */}
        <Card
          bg="background.50"
          border="1px solid"
          borderColor="background.200"
        >
          <CardBody>
            <VStack spacing={3} align="start">
              <Text
                fontSize={{ base: 'md', md: 'lg' }}
                fontWeight="semibold"
                color="primary.900"
              >
                사용 방법:
              </Text>
              <VStack spacing={2} align="start" pl={4}>
                <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.600">
                  • 원하는 객실 버튼을 클릭하여 체크인 메시지를 발송하세요.
                </Text>
                <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.600">
                  • 각 객실은 하루에 한 번만 메시지를 발송할 수 있습니다.
                </Text>
                <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.600">
                  • 발송된 버튼은 녹색으로 표시되며 비활성화됩니다.
                </Text>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              메시지 전송 확인
            </AlertDialogHeader>

            <AlertDialogBody>
              {roomToSend &&
                `${rooms[roomToSend as keyof typeof rooms]?.name} (${
                  rooms[roomToSend as keyof typeof rooms]?.type
                }) 객실의 레이트 체크인 메시지를 전송하시겠습니까?`}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                취소
              </Button>
              <Button colorScheme="blue" onClick={handleSendMessage} ml={3}>
                전송
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Layout>
  );
}
