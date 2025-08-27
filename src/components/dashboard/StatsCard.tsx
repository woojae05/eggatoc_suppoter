'use client'

import {
  Box,
  Card,
  CardBody,
  Flex,
  Text,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react'
import { IconType } from 'react-icons'

interface StatsCardProps {
  title: string
  value: string | number
  icon: IconType
  change?: {
    value: string
    isPositive: boolean
  }
  color?: string
}

export default function StatsCard({
  title,
  value,
  icon,
  change,
  color = 'primary.900',
}: StatsCardProps) {
  const cardBg = useColorModeValue('white', 'gray.800')
  const iconBg = useColorModeValue('primary.50', 'gray.700')

  return (
    <Card bg={cardBg} shadow="sm" borderRadius="xl">
      <CardBody>
        <Flex align="center" justify="space-between">
          <Box>
            <Text fontSize="sm" color="gray.500" fontWeight="medium">
              {title}
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color={color} mt={1}>
              {value}
            </Text>
            {change && (
              <Text
                fontSize="sm"
                color={change.isPositive ? 'green.500' : 'red.500'}
                mt={1}
              >
                {change.isPositive ? '+' : ''}{change.value}
              </Text>
            )}
          </Box>
          <Box
            p={3}
            borderRadius="lg"
            bg={iconBg}
          >
            <Icon as={icon} boxSize={6} color={color} />
          </Box>
        </Flex>
      </CardBody>
    </Card>
  )
}