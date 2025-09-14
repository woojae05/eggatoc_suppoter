'use client';

import {
  Box,
  VStack,
  Text,
  Icon,
  useColorModeValue,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FaUserCheck, FaBroom, FaLeaf, FaCoffee, FaCalendarDay } from 'react-icons/fa';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const sidebarItems = [
  { icon: FaCalendarDay, label: '오늘 현황', href: '/today-status' },
  { icon: FaUserCheck, label: '체크인 안내 메시지', href: '/check-in-message' },
  { icon: FaBroom, label: '오늘 객실청소 안내', href: '/room-cleaning' },
  { icon: FaLeaf, label: '요가, 조식 안내', href: '/wellness-breakfast' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const SidebarContent = ({ onItemClick }: { onItemClick?: () => void }) => {
  const pathname = usePathname();
  const bg = useColorModeValue('white', 'gray.800');

  return (
    <Box bg={bg} h="full" p={6}>
      <VStack spacing={6} align="stretch">
        {/* Logo/Title */}
        <Box>
          <Text
            fontSize="2xl"
            fontWeight="bold"
            color="primary.900"
            textAlign="center"
          >
            에가톳 도우미
          </Text>
        </Box>

        <Divider />

        {/* Navigation Items */}
        <VStack spacing={2} align="stretch">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  leftIcon={<Icon as={item.icon} boxSize={5} />}
                  isActive={isActive}
                  w="full"
                  h="12"
                  bg={isActive ? 'primary.50' : 'transparent'}
                  color={isActive ? 'primary.900' : 'gray.600'}
                  _hover={{
                    bg: isActive ? 'primary.100' : 'background.200',
                    color: 'primary.900',
                  }}
                  _active={{
                    bg: 'primary.100',
                  }}
                  fontWeight="500"
                  onClick={onItemClick}
                >
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </VStack>
      </VStack>
    </Box>
  );
};

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const borderColor = useColorModeValue('background.200', 'gray.700');
  const isMobile = useBreakpointValue({ base: true, lg: false });

  if (isMobile) {
    return (
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose || (() => {})}
        size="sm"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody p={0}>
            <SidebarContent onItemClick={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Box
      as="nav"
      pos="fixed"
      top="0"
      left="0"
      zIndex="sticky"
      h="full"
      w="280px"
      borderRightWidth="1px"
      borderRightColor={borderColor}
    >
      <SidebarContent />
    </Box>
  );
}
