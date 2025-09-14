// ==================== API 응답 타입 ====================
export interface ApiResponse {
  msg: string;
  data: LodgmentData;
}

export interface LodgmentData {
  lodgmentTypes: LodgmentType[];
}

// ==================== 숙박 시설 타입 ====================
export interface LodgmentType {
  isVisibleLodgmentList: string[];
  isOpenLodgmentList: string[];
  lodgmentTypeId: string;
  lodgmentTypeName: string;
  defaultHeadcount: number;
  maximumHeadcount: number;
  coverImg: string;
  facilities: Facility[];
  days: Day[];
}

export interface Facility {
  name: string;
  img: string; // base64 encoded SVG
}

// ==================== 날짜별 정보 ====================
export interface Day {
  date: string; // YYYY-MM-DD 형식
  type: PricingType;
  price: PriceInfo;
  closeDiscountPrice: PriceInfo;
  closeDiscountInfo: Record<string, any>;
  lodgments: Lodgment[];
  memo: string;
}

// ==================== 가격 관련 타입 ====================
export interface PricingType {
  default: string;
  finestay: string;
  naver: string;
  agoda: string;
  airbnb: string;
}

export interface PriceInfo {
  default: number | null;
  finestay: number | null;
  bookingengine: number | null;
  naver: number | null;
  agoda: number | null;
  airbnb: number | null;
}

// ==================== 숙박 시설 및 예약 ====================
export interface Lodgment {
  lodgmentId: string;
  name: string;
  reservations: Reservation[];
  remainStock: number;
  isAirbnbUnavailable: boolean;
  stock: number;
}

export interface Reservation {
  id: string;
  userInfo: UserInfo;
  status: string;
  memo: string | null;
  platformName: string;
  totalHeadcount: number | null;
  isOtherPlatform: boolean;
  otherPlatformType: string | null;
  nBookingDetails?: NaverBookingDetails;
  addPersonOptions: any[];
  additionalOptions: any[];
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
}

export interface UserInfo {
  phone: string;
  name: string;
  email?: string;
}

// ==================== 네이버 예약 상세 정보 ====================
export interface NaverBookingDetails {
  isNPayUsed: boolean;
  isPostPayment: boolean;
  isPartialCancelUsed: boolean;
  isOnsitePayment: boolean;
  paymentMethod: string;
  bizItemType: string;
  bizItemName: string;
  count: number;
  price: number;
  couponPrice: number;
  bizItemPrice: number;
  shippingStatus: string;
  extraFee: ExtraFee;
  prices: any[];
  options: any[];
  promotionOptions: any[];
  customFormInputs: CustomFormInput[];
  seats: any[];
  refundPolicy: RefundPolicy[];
  refundTimeOffset: number;
  nPayProductOrderNumber: string;
  nPayOrderNumber: string;
  bookingCoupons: any[];
  hasVisitor: boolean;
  isNonResidentForeigner: boolean;
}

export interface ExtraFee {
  commission: number;
  shippingFee: number;
  discountPrice: number;
}

export interface CustomFormInput {
  type: string;
  title: string;
  required: string; // "y" | "n"
  options?: FormOption[];
  perItem?: string;
  value?: string;
}

export interface FormOption {
  idx: number;
  value: string;
}

export interface RefundPolicy {
  refundPolicyId: number;
  order: number;
  baseDay: number;
  rate: number;
}