'use client';

import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
} from '@chakra-ui/react';
import Layout from '@/components/layout/Layout';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import QuickActions from '@/components/dashboard/QuickActions';
import {
  FiUsers,
  FiFileText,
  FiCalendar,
  FiMessageSquare,
} from 'react-icons/fi';

export default function Dashboard() {
  return (
    <Layout>
      <VStack spacing={6} align="stretch">
        {/* Page Header */}
        <Box pt={'100px'}>
          <Heading size="lg" color="primary.900" mb={2}>
            대시보드
          </Heading>
          <Text color="gray.600">
            관리 시스템의 전체 현황을 한눈에 확인하세요.
          </Text>
        </Box>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <StatsCard
            title="전체 사용자"
            value="1,248"
            icon={FiUsers}
            change={{ value: '12%', isPositive: true }}
          />
          <StatsCard
            title="문서 수"
            value="3,456"
            icon={FiFileText}
            change={{ value: '8%', isPositive: true }}
          />
          <StatsCard
            title="이번 달 일정"
            value="89"
            icon={FiCalendar}
            change={{ value: '3%', isPositive: false }}
          />
          <StatsCard
            title="미읽은 메시지"
            value="23"
            icon={FiMessageSquare}
            change={{ value: '5%', isPositive: true }}
          />
        </SimpleGrid>

        {/* Main Content */}
        <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6}>
          <VStack spacing={6} align="stretch">
            <QuickActions />
          </VStack>
          <RecentActivity />
        </SimpleGrid>
      </VStack>
    </Layout>
  );
}
