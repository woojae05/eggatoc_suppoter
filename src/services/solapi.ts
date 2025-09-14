import crypto from 'crypto';

const SOLAPI_API_KEY = 'NCSUQCHYHEWQAFMZ';
const SOLAPI_API_SECRET = 'X0ZNE61YQE0HU9CVKQHUFGE1JKBZLE1X';

if (typeof window !== 'undefined') {
  throw new Error('solapi.ts should only be used on the server-side.');
}
console.log('SOLAPI_API_KEY:', SOLAPI_API_KEY);

if (!SOLAPI_API_KEY || !SOLAPI_API_SECRET) {
  throw new Error(
    'NEXT_PUBLIC_SOLAPI_KEY and SOLAPI_API_SECRET must be defined in .env.local'
  );
}

/**
 * HMAC-SHA256 signature generation
 */
function generateSignature(dateTime: string, salt: string): string {
  const data = dateTime + salt;
  return crypto
    .createHmac('sha256', SOLAPI_API_SECRET as string)
    .update(data)
    .digest('hex');
}

/**
 * Create Authorization header
 */
function createAuthHeader(): string {
  const dateTime = new Date().toISOString();
  const salt = crypto.randomBytes(16).toString('hex');
  const signature = generateSignature(dateTime, salt);

  return `HMAC-SHA256 apiKey=${SOLAPI_API_KEY}, date=${dateTime}, salt=${salt}, signature=${signature}`;
}

interface Message {
  to: string;
  from: string;
  text: string;
}

interface SolapiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

class SolapiService {
  private apiUrl = 'https://api.solapi.com/messages/v4/send-many/detail';

  async sendMessage(messages: Message[]): Promise<SolapiResponse> {
    const authHeader = createAuthHeader();

    const payload = { messages };

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.errorMessage || `HTTP Error: ${response.status}`
        );
      }

      return {
        success: true,
        message: 'Message sent successfully.',
      };
    } catch (error) {
      console.error('API Request Failed:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'An unknown error occurred.',
      };
    }
  }
}

export const solapiService = new SolapiService();
