'use client'

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Card,
  Avatar,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react'
import Layout from '@/components/layout/Layout'
import { FiPlus, FiMoreVertical, FiEdit, FiTrash2 } from 'react-icons/fi'

const mockUsers = [
  {
    id: '1',
    name: '김철수',
    email: 'kim@example.com',
    role: '관리자',
    status: 'active',
    lastLogin: '2024-01-15',
  },
  {
    id: '2',
    name: '이영희',
    email: 'lee@example.com',
    role: '편집자',
    status: 'active',
    lastLogin: '2024-01-14',
  },
  {
    id: '3',
    name: '박준호',
    email: 'park@example.com',
    role: '사용자',
    status: 'inactive',
    lastLogin: '2024-01-10',
  },
  {
    id: '4',
    name: '최수민',
    email: 'choi@example.com',
    role: '편집자',
    status: 'active',
    lastLogin: '2024-01-15',
  },
]

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case '관리자':
      return 'red'
    case '편집자':
      return 'blue'
    case '사용자':
      return 'gray'
    default:
      return 'gray'
  }
}

const getStatusBadgeColor = (status: string) => {
  return status === 'active' ? 'green' : 'gray'
}

const getStatusLabel = (status: string) => {
  return status === 'active' ? '활성' : '비활성'
}

export default function UsersPage() {
  return (
    <Layout>
      <VStack spacing={6} align="stretch">
        {/* Page Header */}
        <HStack justify="space-between" align="center">
          <Box>
            <Heading size="lg" color="primary.900" mb={2}>
              사용자 관리
            </Heading>
            <Text color="gray.600">
              시스템 사용자들을 관리하고 권한을 설정하세요.
            </Text>
          </Box>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="primary"
            variant="solid"
          >
            새 사용자 추가
          </Button>
        </HStack>

        {/* Users Table */}
        <Card>
          <TableContainer>
            <Table variant="simple">
              <Thead bg="background.50">
                <Tr>
                  <Th>사용자</Th>
                  <Th>역할</Th>
                  <Th>상태</Th>
                  <Th>마지막 로그인</Th>
                  <Th width="60px"></Th>
                </Tr>
              </Thead>
              <Tbody>
                {mockUsers.map((user) => (
                  <Tr key={user.id}>
                    <Td>
                      <HStack spacing={3}>
                        <Avatar
                          size="sm"
                          name={user.name}
                          bg="primary.100"
                          color="primary.900"
                        />
                        <Box>
                          <Text fontWeight="medium" color="primary.900">
                            {user.name}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {user.email}
                          </Text>
                        </Box>
                      </HStack>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={getRoleBadgeColor(user.role)}
                        borderRadius="md"
                      >
                        {user.role}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={getStatusBadgeColor(user.status)}
                        borderRadius="md"
                      >
                        {getStatusLabel(user.status)}
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontSize="sm" color="gray.600">
                        {user.lastLogin}
                      </Text>
                    </Td>
                    <Td>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<FiMoreVertical />}
                          variant="ghost"
                          size="sm"
                          aria-label="Actions"
                        />
                        <MenuList>
                          <MenuItem icon={<FiEdit />}>
                            수정
                          </MenuItem>
                          <MenuItem icon={<FiTrash2 />} color="red.500">
                            삭제
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Card>
      </VStack>
    </Layout>
  )
}