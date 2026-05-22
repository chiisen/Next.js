import {
  BaseChannelAdapter,
  ChannelPaymentRequest,
  ChannelPaymentResult,
} from "./base";

export class PayPayAdapter extends BaseChannelAdapter {
  code = "paypay";

  async requestPayment(
    request: ChannelPaymentRequest
  ): Promise<ChannelPaymentResult> {
    // TODO: 實作 PayPay API 串接
    // const response = await fetch('https://paypay.jp/api/withdraw', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${this.apiKey}`,
    //   },
    //   body: JSON.stringify({
    //     merchantOrderId: request.orderNo,
    //     amount: request.amount,
    //     bankAccount: {
    //       bankCode: request.bankCode,
    //       accountNumber: request.bankAccount,
    //       accountName: request.accountName,
    //     },
    //     callbackUrl: request.callbackUrl,
    //   }),
    // });

    return {
      success: true,
      transactionId: `PY${Date.now()}`,
      status: "PROCESSING",
    };
  }

  verifyCallback(data: Record<string, unknown>, signature: string): boolean {
    // TODO: 實作 PayPay 簽名驗證
    // const expectedSignature = crypto
    //   .createHmac('sha256', this.secretKey)
    //   .update(JSON.stringify(data))
    //   .digest('hex');
    // return signature === expectedSignature;
    return true;
  }
}

export class HK21PayAdapter extends BaseChannelAdapter {
  code = "hk21pay";

  async requestPayment(
    request: ChannelPaymentRequest
  ): Promise<ChannelPaymentResult> {
    // TODO: 實作 HK21Pay API 串接
    return {
      success: true,
      transactionId: `HK${Date.now()}`,
      status: "PROCESSING",
    };
  }

  verifyCallback(data: Record<string, unknown>, signature: string): boolean {
    // TODO: 實作 HK21Pay 簽名驗證
    return true;
  }
}

export class VanPayAdapter extends BaseChannelAdapter {
  code = "vanpay";

  async requestPayment(
    request: ChannelPaymentRequest
  ): Promise<ChannelPaymentResult> {
    // TODO: 實作 VanPay API 串接
    return {
      success: true,
      transactionId: `VAN${Date.now()}`,
      status: "PROCESSING",
    };
  }

  verifyCallback(data: Record<string, unknown>, signature: string): boolean {
    // TODO: 實作 VanPay 簽名驗證
    return true;
  }
}

export class ColaPayAdapter extends BaseChannelAdapter {
  code = "colapay";

  async requestPayment(
    request: ChannelPaymentRequest
  ): Promise<ChannelPaymentResult> {
    // TODO: 實作 ColaPay API 串接
    return {
      success: true,
      transactionId: `COLA${Date.now()}`,
      status: "PROCESSING",
    };
  }

  verifyCallback(data: Record<string, unknown>, signature: string): boolean {
    // TODO: 實作 ColaPay 簽名驗證
    return true;
  }
}