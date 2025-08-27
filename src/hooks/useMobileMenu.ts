'use client'

import { useState, useEffect } from 'react'
import { useBreakpointValue } from '@chakra-ui/react'

export const useMobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useBreakpointValue({ base: true, lg: false })

  const onOpen = () => setIsOpen(true)
  const onClose = () => setIsOpen(false)
  const onToggle = () => setIsOpen(!isOpen)

  // 모바일이 아닐 때는 자동으로 메뉴를 닫음
  useEffect(() => {
    if (!isMobile && isOpen) {
      setIsOpen(false)
    }
  }, [isMobile, isOpen])

  // 모바일 메뉴가 열려있을 때 body 스크롤 방지
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, isMobile])

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle,
    isMobile: Boolean(isMobile),
  }
}