'use client';

import {
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
} from '@chakra-ui/react';
import Layout from '@/components/layout/Layout';
import { useState, useEffect } from 'react';
import { rooms } from '@/model/rooms';
import { webhookService } from '@/services/webhook';

// LocalStorage에서 오늘 날짜 키 생성
const getTodayKey = () => {
  const today = new Date();
  return `checkin-sent-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
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
  const toast = useToast();

  // 컴포넌트 마운트 시 오늘 전송된 방 목록 로드
  useEffect(() => {
    const todaySentRooms = getTodaySentRooms();
    setSentButtons(todaySentRooms);
  }, []);

  const handleButtonClick = async (buttonNumber: number) => {
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

    try {
      // 웹훅으로 룸 정보 전송
      const response = await webhookService.sendCheckinMessage({
        id: room.id,
        name: room.name,
        type: room.type,
      });

      console.log('웹훅 응답:', response);

      if (response.success) {
        // 성공 시 전송 완료 상태 추가 및 LocalStorage 저장
        const newSentButtons = new Set(sentButtons).add(buttonNumber);
        setSentButtons(newSentButtons);
        saveTodaySentRooms(newSentButtons);

        toast({
          title: `${buttonNumber}번 객실 메시지 전송 완료`,
          description:
            response.message ||
            `${room.name} (${room.type}) 객실의 체크인 메시지가 전송되었습니다.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
      } else {
        throw new Error(response.error || '전송 실패');
      }
    } catch (error) {
      console.error('웹훅 전송 실패:', error);
      // 실패 시 토스트 표시
      toast({
        title: '메시지 전송 실패',
        description:
          error instanceof Error
            ? error.message
            : '웹훅 전송 중 오류가 발생했습니다.',
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
    }
  };

  const generateButtons = () => {
    const buttons = [];
    for (let i = 1; i <= 11; i++) {
      const room = rooms[i as keyof typeof rooms];
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
            colorScheme={isSent ? 'green' : 'primary'}
            variant={
              isSent ? 'solid' : selectedButton === i ? 'solid' : 'outline'
            }
            bg={
              isSent
                ? 'green.500'
                : selectedButton === i
                ? 'primary.900'
                : 'white'
            }
            color={
              isSent ? 'white' : selectedButton === i ? 'white' : 'primary.900'
            }
            borderColor={isSent ? 'green.500' : 'primary.900'}
            borderWidth="2px"
            flexDirection="column"
            borderRadius="xl"
            isLoading={isLoading}
            loadingText=""
            spinner={<Spinner size="lg" color="white" />}
            isDisabled={isLoading || isSent}
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
            onClick={() => handleButtonClick(i)}
            transition="all 0.2s"
          >
            {!isLoading && (
              <>
                <Text
                  fontSize={{ base: '2xl', md: '3xl' }}
                  fontWeight="bold"
                  mb={1}
                >
                  {i}
                </Text>
                <Text
                  fontSize={{ base: 'xs', md: 'sm' }}
                  fontWeight="medium"
                  opacity={0.8}
                >
                  {room.name}
                </Text>
                <Text fontSize={{ base: '2xs', md: 'xs' }} opacity={0.6}>
                  {room.type}
                </Text>
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
            체크인 안내 메시지
          </Heading>
          <Text
            color="gray.600"
            fontSize={{ base: 'md', md: 'lg' }}
            maxW="600px"
            mx="auto"
          >
            객실별 체크인 메시지를 발송하여 게스트에게 안내하세요.
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
                체크인 메시지를 발송할 객실을 선택해주세요
              </Text>
              {process.env.NEXT_PUBLIC_WEBHOOK_URL ? (
                <Badge colorScheme="green" variant="subtle" px={3} py={1}>
                  웹훅 연결됨
                </Badge>
              ) : (
                <Badge colorScheme="orange" variant="subtle" px={3} py={1}>
                  웹훅 URL 미설정 (.env.local 확인 필요)
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
    </Layout>
  );
}
