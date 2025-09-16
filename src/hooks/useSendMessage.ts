import { useMutation, useQueryClient } from '@tanstack/react-query';

interface MessageData {
  to: string;
  from: string;
  text: string;
}

interface SendMessageRequest {
  messages: MessageData[];
}

interface SendMessageResponse {
  success: boolean;
  message?: string;
  data?: any;
}

// API 호출 함수
const sendMessage = async (data: SendMessageRequest): Promise<SendMessageResponse> => {
  const response = await fetch('/api/send-message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('메시지 전송에 실패했습니다.');
  }

  return response.json();
};

// React Query Mutation Hook
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      // 성공 시 관련 데이터 무효화 (필요한 경우)
      queryClient.invalidateQueries({
        queryKey: ['reservations'],
      });
    },
  });
};