'use client';

import {
  Box,
  Flex,
  Text,
  IconButton,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  useColorModeValue,
  HStack,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('background.200', 'gray.700');

  return (
    <Box
      as="header"
      pos="fixed"
      top="0"
      right="0"
      left={{ base: '0', lg: '280px' }}
      zIndex="banner"
      bg={bg}
      borderBottomWidth="1px"
      borderBottomColor={borderColor}
      px={6}
      py={4}
      display={{ base: 'flex', lg: 'none' }}
    >
      <Flex align="center" justify="space-between">
        {/* Mobile Menu Button */}
        <IconButton
          aria-label="메뉴 열기"
          icon={<FiMenu />}
          variant="ghost"
          size="lg"
          display={{ base: 'flex', lg: 'none' }}
          onClick={onMenuClick}
        />
      </Flex>
    </Box>
  );
}
