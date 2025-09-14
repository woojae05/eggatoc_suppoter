'use client';

import { useState, useEffect } from 'react';

import {
  Box,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Icon,
  Card,
  CardBody,
  CardHeader,
  IconButton,
  Button,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { FaBed, FaUser, FaPhone, FaUtensils } from 'react-icons/fa';
import Layout from '@/components/layout/Layout';
import { LodgmentData } from '@/types/api';
import {
  fetchLodgmentData,
  transformApiDataToTableData,
} from '@/utils/apiUtils';

interface ReservationData {
  id: number;
  name: string;
  customer: string;
  contact: string;
  customInout: string;
  notes: string;
  special?: string;
}

export default function TodayStatusPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [apiData, setApiData] = useState<LodgmentData | null>(null);
  const [reservationData, setReservationData] = useState<ReservationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch API data when date changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const dateString = currentDate.toISOString().split('T')[0];
        const nextDay = new Date(currentDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const endDateString = nextDay.toISOString().split('T')[0];

        const data = await fetchLodgmentData(dateString, endDateString);
        setApiData(data);
        console.log('Fetched API data:', data);
        // Transform API data to table format
        const tableData = transformApiDataToTableData(data, dateString);
        setReservationData(tableData);
        console.log('Fetched and transformed data:', tableData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('데이터를 불러오는데 실패했습니다. 기본 데이터를 표시합니다.');
        // Use empty data as fallback
        setReservationData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentDate]);

  const headerBg = useColorModeValue('blue.50', 'blue.900');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const evenRowBg = useColorModeValue('white', 'gray.800');
  const oddRowBg = useColorModeValue('gray.25', 'gray.750');

  const renderValue = (value: string | boolean) => {
    if (value === true) {
      return <Icon as={CheckIcon} color="green.500" fontSize="lg" />;
    }
    return value || '';
  };

  // Navigation functions
  const goToPreviousDay = () => {
    const previousDay = new Date(currentDate);
    previousDay.setDate(previousDay.getDate() - 1);
    setCurrentDate(previousDay);
  };

  const goToNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getCurrentDateString = () => {
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    return `${month}/${day}`;
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
            오늘 현황
          </Heading>
          <Text
            color="gray.600"
            fontSize={{ base: 'md', md: 'lg' }}
            maxW="600px"
            mx="auto"
          >
            오늘의 예약 현황을 한눈에 확인하세요.
          </Text>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert status="warning" borderRadius="xl">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Status Header Card */}
        <Card bg="white" shadow="md" borderRadius="xl">
          <CardHeader>
            <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
              <HStack spacing={4}>
                <Icon as={FaBed} color="blue.500" fontSize="xl" />
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  현황 정보
                </Text>
              </HStack>
              <HStack spacing={2} fontSize="lg" fontWeight="semibold">
                <IconButton
                  aria-label="어제"
                  icon={<ChevronLeftIcon />}
                  size="sm"
                  variant="ghost"
                  onClick={goToPreviousDay}
                  colorScheme="blue"
                />
                <Button
                  size="sm"
                  variant="solid"
                  colorScheme="blue"
                  onClick={goToToday}
                  minW="60px"
                >
                  오늘
                </Button>
                <Text>날짜: {getCurrentDateString()}</Text>
                <IconButton
                  aria-label="내일"
                  icon={<ChevronRightIcon />}
                  size="sm"
                  variant="ghost"
                  onClick={goToNextDay}
                  colorScheme="blue"
                />
              </HStack>
            </Flex>
          </CardHeader>
        </Card>

        {/* Main Table Card */}
        <Card bg="white" shadow="md" borderRadius="xl">
          <CardBody p={0}>
            {loading ? (
              <Flex justify="center" align="center" p={8}>
                <Spinner size="lg" color="blue.500" />
                <Text ml={4}>데이터를 불러오는 중...</Text>
              </Flex>
            ) : (
              <Box overflowX="auto" borderRadius={'xl'}>
                <Table variant="simple" size="md">
                  <Thead bg={headerBg}>
                    <Tr>
                      <Th
                        textAlign="center"
                        py={4}
                        borderRightWidth="1px"
                        borderRightColor="gray.200"
                        borderRadius={'xl'}
                      >
                        <VStack spacing={1} borderRightColor="gray.200">
                          <Text>번호</Text>
                        </VStack>
                      </Th>
                      <Th
                        textAlign="center"
                        py={4}
                        borderRightWidth="1px"
                        borderRightColor="gray.200"
                      >
                        <VStack spacing={1}>
                          <Icon as={FaBed} />
                          <Text>객실이름</Text>
                        </VStack>
                      </Th>
                      <Th
                        textAlign="center"
                        py={4}
                        borderRightWidth="1px"
                        borderRightColor="gray.200"
                      >
                        <VStack spacing={1}>
                          <Icon as={FaUser} />
                          <Text>고객</Text>
                        </VStack>
                      </Th>
                      <Th textAlign="center" py={4}>
                        <VStack spacing={1}>
                          <Text>옵션</Text>
                        </VStack>
                      </Th>
                      <Th textAlign="center" py={4}>
                        <VStack spacing={1}>
                          <Text>비고</Text>
                        </VStack>
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {reservationData.map((item, index) => (
                      <Tr
                        key={item.id}
                        _hover={{ bg: hoverBg }}
                        bg={index % 2 === 0 ? evenRowBg : oddRowBg}
                      >
                        <Td
                          textAlign="center"
                          py={4}
                          borderRightWidth="1px"
                          borderRightColor="gray.200"
                        >
                          <Text fontWeight="medium">{item.id}</Text>
                        </Td>
                        <Td
                          textAlign="center"
                          py={4}
                          borderRightWidth="1px"
                          borderRightColor="gray.200"
                        >
                          <VStack spacing={1}>
                            <Text fontWeight="semibold" color="blue.600">
                              {item.name}
                            </Text>
                            {item.special && (
                              <Badge
                                colorScheme="blue"
                                variant="subtle"
                                fontSize="xs"
                              >
                                {item.special}
                              </Badge>
                            )}
                          </VStack>
                        </Td>
                        <Td
                          textAlign="center"
                          py={4}
                          borderRightWidth="1px"
                          borderRightColor="gray.200"
                        >
                          <Text fontWeight="medium" color="green.600">
                            {item.customer}
                          </Text>
                        </Td>

                        <Td
                          textAlign="center"
                          py={4}
                          fontSize={'small'}
                          borderRightWidth="1px"
                          borderRightColor="gray.200"
                        >
                          <Text whiteSpace={'pre-line'}>
                            {item.customInout}
                          </Text>
                        </Td>
                        <Td textAlign="center" py={4}>
                          <Text>{item.notes}</Text>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </CardBody>
        </Card>

        {/* Special Notes Card */}
        <Card
          bg="background.50"
          border="1px solid"
          borderColor="background.200"
          borderRadius="xl"
        >
          <CardHeader>
            <Heading size="md" color="orange.600">
              특이사항
            </Heading>
          </CardHeader>
          <CardBody>
            <Box
              bg={useColorModeValue('yellow.50', 'yellow.900')}
              p={4}
              borderRadius="md"
              border="1px"
              borderColor={useColorModeValue('yellow.200', 'yellow.600')}
            >
              <Text color={useColorModeValue('yellow.800', 'yellow.200')}>
                특이사항이 있을 경우 여기에 기록해주세요.
              </Text>
            </Box>
          </CardBody>
        </Card>
      </VStack>
    </Layout>
  );
}
