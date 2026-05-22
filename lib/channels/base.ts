// Payment Channel Adapter Interface
// 支付通道適配器，用於整合不同第三方支付

export interface ChannelPaymentRequest {
  orderNo: string;
  amount: number;
  bankAccount: string;
  bankName: string;
  accountName: string;
  callbackUrl: string;
}

export interface ChannelPaymentResult {
  success: boolean;
  transactionId?: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  errorMessage?: string;
}

export interface ChannelCallbackData {
  orderNo: string;
  status: "success" | "failed";
  transactionId?: string;
  utr?: string;
  errorMsg?: string;
}

export interface ChannelAdapter {
  // 通道代碼
  code: string;

  // 發起代付請求
  requestPayment(
    request: ChannelPaymentRequest
  ): Promise<ChannelPaymentResult>;

  // 驗證回調簽名
  verifyCallback(data: Record<string, unknown>, signature: string): boolean;

  // 解析回調資料
  parseCallback(data: Record<string, unknown>): ChannelCallbackData;
}

// Base adapter with common functionality
export abstract class BaseChannelAdapter implements ChannelAdapter {
  abstract code: string;

  abstract requestPayment(
    request: ChannelPaymentRequest
  ): Promise<ChannelPaymentResult>;

  abstract verifyCallback(
    data: Record<string, unknown>,
    signature: string
  ): boolean;

  parseCallback(data: Record<string, unknown>): ChannelCallbackData {
    return {
      orderNo: data.orderNo as string,
      status: data.status as "success" | "failed",
      transactionId: data.transactionId as string | undefined,
      utr: data.utr as string | undefined,
      errorMsg: data.errorMsg as string | undefined,
    };
  }
}