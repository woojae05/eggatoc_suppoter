# 에가톳 도우미 (Eggatoc Helper)

Next.js와 Chakra UI를 사용해 구축된 객실 관리 및 체크인 메시지 발송 시스템입니다.

## 🎨 디자인 시스템

### 색상 팔레트
- **배경색**: RGB(250, 245, 244) - 부드러운 베이지 톤
- **기본색**: RGB(27, 27, 27) - 진한 차콜 그레이
- **테마**: 최소한의 디자인과 높은 가독성에 중점

### 주요 특징
- 깔끔하고 현대적인 인터페이스
- 반응형 디자인 (모바일 햄버거 메뉴)
- 다크 모드 지원 준비
- 접근성 고려한 디자인

## 🏨 주요 기능

### 체크인 메시지 발송
- **11개 객실**: 1~11번 객실별 개별 관리
- **객실 정보**: 이름(camino, stone, 春雨 등), 타입(단층/복층)
- **웹훅 연동**: 버튼 클릭 시 외부 시스템으로 데이터 전송
- **실시간 상태**: 로딩, 전송완료, 에러 상태 표시

### 웹훅 시스템
- **자동 전송**: 객실 선택 시 자동으로 웹훅 호출
- **에러 처리**: 연결 실패 시 사용자에게 알림
- **상태 관리**: 전송 중, 완료, 실패 상태 시각적 표시

## 🏗️ 아키텍처

```
src/
├── app/                    # Next.js 13+ App Router
│   ├── layout.tsx         # 루트 레이아웃
│   └── check-in-message/  # 체크인 메시지 페이지
├── components/            # 재사용 가능한 컴포넌트
│   ├── layout/            # 레이아웃 컴포넌트
│   │   ├── Layout.tsx     # 메인 레이아웃 컨테이너
│   │   ├── Header.tsx     # 상단 헤더 (모바일 햄버거)
│   │   └── Sidebar.tsx    # 사이드바 네비게이션
│   └── dashboard/         # 대시보드 컴포넌트들
├── services/              # 외부 서비스 연동
│   └── webhook.ts         # 웹훅 서비스 유틸리티
├── hooks/                 # 커스텀 훅
│   └── useMobileMenu.ts   # 모바일 메뉴 상태 관리
├── model/                 # 데이터 모델
│   └── rooms.ts           # 객실 정보 데이터
├── providers/             # Context 제공자
│   └── ChakraProvider.tsx # Chakra UI 테마 제공자
└── theme/                 # 테마 설정
    └── index.ts           # Chakra UI 커스텀 테마
```

## 🚀 시작하기

### 필수 조건
- Node.js 18+
- npm 또는 yarn

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 환경 변수 설정 (웹훅 URL)
cp .env.local.example .env.local
# .env.local 파일에서 NEXT_PUBLIC_WEBHOOK_URL 설정

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

### 환경 변수 설정

`.env.local` 파일 생성 후 웹훅 URL 설정:

```bash
# 웹훅 엔드포인트 URL
NEXT_PUBLIC_WEBHOOK_URL=https://your-webhook-endpoint.com/api/webhook

# 예시:
# Slack 웹훅
NEXT_PUBLIC_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Discord 웹훅
NEXT_PUBLIC_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/DISCORD/WEBHOOK

# 커스텀 서버 웹훅
NEXT_PUBLIC_WEBHOOK_URL=https://your-server.com/api/checkin-webhook
```

## 🔗 웹훅 연동

### 웹훅 페이로드 형식

버튼 클릭 시 다음 JSON 데이터가 웹훅 URL로 POST 전송됩니다:

```json
{
  "event": "check_in_message",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "room": {
    "id": 1,
    "name": "camino",
    "type": "단층"
  },
  "message": "camino (단층) 객실의 체크인 메시지가 발송되었습니다."
}
```

### 웹훅 응답 형식

웹훅 엔드포인트는 다음 형식으로 응답해야 합니다:

```json
{
  "success": true,
  "message": "메시지 전송이 완료되었습니다."
}
```

## 📱 반응형 디자인

### 모바일 UX
- **햄버거 메뉴**: 768px 이하에서 사이드바가 드로어로 변환
- **터치 최적화**: 모바일 터치에 적합한 버튼 크기
- **그리드 최적화**: 화면 크기별 열 수 자동 조정

### 브레이크포인트
- **모바일**: 320px ~ 767px (2열 그리드)
- **태블릿**: 768px ~ 1023px (3-4열 그리드)  
- **데스크톱**: 1024px+ (5열 그리드)

## 🛠️ 기술 스택

- **프론트엔드**: Next.js 14, React 18, TypeScript
- **UI 라이브러리**: Chakra UI
- **아이콘**: React Icons (Feather Icons, Font Awesome)
- **스타일링**: Emotion (Chakra UI 내장)
- **상태 관리**: React Hooks (useState, useToast)
- **HTTP 클라이언트**: Fetch API
- **개발 도구**: ESLint, TypeScript

## 🏨 객실 정보

시스템에서 관리하는 객실 목록:

| 번호 | 이름 | 타입 |
|------|------|------|
| 1 | camino | 단층 |
| 2 | stone | 단층 |
| 3 | 春雨 | 단층 |
| 4 | camellia | 단층 |
| 5 | hallasan | 단층 |
| 6 | paparecipe | 복층 |
| 7 | woozoo | 복층 |
| 8 | sea | 단층 |
| 9 | canola | 단층 |
| 10 | olle | 단층 |
| 11 | star | 복층 |

## 🎯 향후 개발 계획

- [ ] 관리자 인증 시스템
- [ ] 메시지 전송 히스토리
- [ ] 객실 상태 실시간 모니터링
- [ ] 다양한 메시지 템플릿
- [ ] 예약 시스템 연동
- [ ] 알림 설정 관리
- [ ] 통계 및 리포팅

## 🔧 개발 가이드

### 새로운 객실 추가

`src/model/rooms.ts` 파일에서 객실 정보를 추가/수정:

```typescript
export const rooms = {
  // ... 기존 객실들
  12: {
    id: 12,
    name: 'new-room',
    type: '단층',
  },
}
```

### 웹훅 커스터마이징

`src/services/webhook.ts`에서 웹훅 로직 수정:

- 페이로드 형식 변경
- 에러 처리 로직 추가
- 재시도 메커니즘 구현

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.