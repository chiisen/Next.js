import type {
  ChannelAdapter,
  ChannelPaymentRequest,
  ChannelPaymentResult,
} from "./base";
import {
  PayPayAdapter,
  HK21PayAdapter,
  VanPayAdapter,
  ColaPayAdapter,
} from "./adapters";

const adapters: Record<string, ChannelAdapter> = {
  paypay: new PayPayAdapter(),
  hk21pay: new HK21PayAdapter(),
  vanpay: new VanPayAdapter(),
  colapay: new ColaPayAdapter(),
};

export function getChannelAdapter(code: string): ChannelAdapter | null {
  return adapters[code.toLowerCase()] || null;
}

export type { ChannelPaymentRequest, ChannelPaymentResult };