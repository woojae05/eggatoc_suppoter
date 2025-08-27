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
import Image from 'next/image';

export default function Dashboard() {
  return (
    <Layout>
      <VStack spacing={6} align="stretch">
        {/* Page Header */}
        <Box>
          <Heading as="h1" size="xl" textAlign="center" mb={4}>
            에가톳 도우미
          </Heading>
          <Text fontSize="lg" textAlign="center" mb={8}>
            에가톳의 똑똑하고 효율적인 업무를 위한 에가톳 도우미
          </Text>
          <Box display="flex" justifyContent="center">
            <Image
              src="/eggatoc-map.png"
              alt="Eggatoc Map"
              width={650}
              height={350}
            />
          </Box>
        </Box>

        {/* Stats Cards */}
      </VStack>
    </Layout>
  );
}
