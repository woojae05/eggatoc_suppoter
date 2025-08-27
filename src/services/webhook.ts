interface RoomData {
  id: number;
  name: string;
  type: string;
}

interface WebhookPayload {
  event: string;
  timestamp: string;
  room: RoomData;
  message: string;
}

interface WebhookResponse {
  success: boolean;
  message?: string;
  error?: string;
}

class WebhookService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL || '';
  }

  async sendCheckinMessage(room: RoomData): Promise<WebhookResponse> {
    if (!this.baseUrl) {
      throw new Error('웹훅 URL이 설정되지 않았습니다.');
    }

    const payload: WebhookPayload = {
      event: 'check_in_message',
      timestamp: new Date().toISOString(),
      room: room,
      message: `${room.name} (${room.type}) 객실의 체크인 메시지가 발송되었습니다.`,
    };

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'x-make-apikey': '1234',
        },
        body: JSON.stringify(payload),
      });

      console.log('웹훅 응답:', response.ok);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        success: true,
        message: '웹훅 전송이 완료되었습니다.',
      };
    } catch (error) {
      console.error('웹훅 전송 실패:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : '알 수 없는 오류가 발생했습니다.',
      };
    }
  }

  async testWebhook(): Promise<WebhookResponse> {
    if (!this.baseUrl) {
      return {
        success: false,
        error: '웹훅 URL이 설정되지 않았습니다.',
      };
    }

    const testPayload = {
      event: 'webhook_test',
      timestamp: new Date().toISOString(),
      message: '웹훅 연결 테스트입니다.',
    };

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'x-make-apikey': '1234',
        },
        body: JSON.stringify(testPayload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        success: true,
        message: '웹훅 연결이 정상적으로 작동합니다.',
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : '웹훅 연결에 실패했습니다.',
      };
    }
  }
}

export const webhookService = new WebhookService();
export type { RoomData, WebhookPayload, WebhookResponse };
