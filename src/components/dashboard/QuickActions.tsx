'use client';

import {
  Card,
  CardHeader,
  CardBody,
  Text,
  SimpleGrid,
  Button,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FiUserPlus,
  FiFileText,
  FiCalendar,
  FiSettings,
  FiMessageSquare,
  FiDownload,
} from 'react-icons/fi';

const quickActions = [
  {
    id: '1',
    label: '새 사용자 추가',
    icon: FiUserPlus,
    color: 'blue.500',
  },
  {
    id: '2',
    label: '문서 작성',
    icon: FiFileText,
    color: 'green.500',
  },
  {
    id: '3',
    label: '일정 등록',
    icon: FiCalendar,
    color: 'purple.500',
  },
  {
    id: '4',
    label: '메시지 보내기',
    icon: FiMessageSquare,
    color: 'orange.500',
  },
  {
    id: '5',
    label: '보고서 생성',
    icon: FiDownload,
    color: 'teal.500',
  },
  {
    id: '6',
    label: '시스템 설정',
    icon: FiSettings,
    color: 'gray.500',
  },
];

export default function QuickActions() {
  const cardBg = useColorModeValue('white', 'gray.800');

  return (
    <Card bg={cardBg} shadow="sm" borderRadius="xl">
      <CardHeader pb={3}>
        <Text fontSize="lg" fontWeight="semibold" color="primary.900">
          빠른 작업
        </Text>
      </CardHeader>
      <CardBody pt={0}>
        <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="ghost"
              h="auto"
              p={4}
              flexDirection="column"
              borderRadius="lg"
              border="1px solid"
              borderColor="background.200"
              _hover={{
                bg: 'background.50',
                transform: 'translateY(-1px)',
                boxShadow: 'sm',
              }}
            >
              <Icon as={action.icon} boxSize={6} color={action.color} mb={2} />
              <Text
                fontSize="xs"
                fontWeight="medium"
                color="primary.900"
                textAlign="center"
                lineHeight="1.2"
              >
                {action.label}
              </Text>
            </Button>
          ))}
        </SimpleGrid>
      </CardBody>
    </Card>
  );
}
