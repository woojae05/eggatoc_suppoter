'use client';

import { Box } from '@chakra-ui/react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useMobileMenu } from '@/hooks/useMobileMenu';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isOpen, onClose, onToggle } = useMobileMenu();

  return (
    <Box minH="100vh" bg="background.100">
      <Sidebar isOpen={isOpen} onClose={onClose} />
      <Header onMenuClick={onToggle} />
      <Box ml={{ base: '0', lg: '280px' }} pt="100px" minH="100vh">
        {children}
      </Box>
    </Box>
  );
}
