'use client'

import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Text,
  VStack,
  HStack,
  Avatar,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react'

interface ActivityItem {
  id: string
  user: string
  action: string
  target: string
  time: string
  type: 'create' | 'update' | 'delete' | 'login'
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    user: '김철수',
    action: '새 사용자를 추가했습니다',
    target: '이영희',
    time: '5분 전',
    type: 'create',
  },
  {
    id: '2',
    user: '박영미',
    action: '문서를 수정했습니다',
    target: '회사 정책 문서',
    time: '10분 전',
    type: 'update',
  },
  {
    id: '3',
    user: '이준호',
    action: '로그인했습니다',
    target: '',
    time: '15분 전',
    type: 'login',
  },
  {
    id: '4',
    user: '최수민',
    action: '일정을 삭제했습니다',
    target: '팀 미팅',
    time: '30분 전',
    type: 'delete',
  },
]

const getTypeColor = (type: ActivityItem['type']) => {
  switch (type) {
    case 'create':
      return 'green'
    case 'update':
      return 'blue'
    case 'delete':
      return 'red'
    case 'login':
      return 'gray'
    default:
      return 'gray'
  }
}

const getTypeLabel = (type: ActivityItem['type']) => {
  switch (type) {
    case 'create':
      return '생성'
    case 'update':
      return '수정'
    case 'delete':
      return '삭제'
    case 'login':
      return '로그인'
    default:
      return ''
  }
}

export default function RecentActivity() {
  const cardBg = useColorModeValue('white', 'gray.800')

  return (
    <Card bg={cardBg} shadow="sm" borderRadius="xl">
      <CardHeader pb={3}>
        <Text fontSize="lg" fontWeight="semibold" color="primary.900">
          최근 활동
        </Text>
      </CardHeader>
      <CardBody pt={0}>
        <VStack spacing={4} align="stretch">
          {mockActivities.map((activity) => (
            <HStack key={activity.id} spacing={3} align="flex-start">
              <Avatar
                size="sm"
                name={activity.user}
                bg="primary.100"
                color="primary.900"
              />
              <Box flex="1">
                <HStack spacing={2} mb={1}>
                  <Text fontSize="sm" fontWeight="medium" color="primary.900">
                    {activity.user}
                  </Text>
                  <Badge
                    colorScheme={getTypeColor(activity.type)}
                    size="sm"
                    borderRadius="md"
                  >
                    {getTypeLabel(activity.type)}
                  </Badge>
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  {activity.action} {activity.target && `"${activity.target}"`}
                </Text>
                <Text fontSize="xs" color="gray.400" mt={1}>
                  {activity.time}
                </Text>
              </Box>
            </HStack>
          ))}
        </VStack>
      </CardBody>
    </Card>
  )
}