export {};

declare global {
  interface Window {
    Pi?: {
      init: (options: { version: string; sandbox: boolean }) => void;
      authenticate: (
        scopes: string[],
        onIncompletePaymentFound: (payment: any) => void | Promise<void>,
      ) => Promise<{
        accessToken: string;
        user: { uid: string; username: string };
      }>;
      createPayment: (
        payment: { amount: number; memo: string; metadata: Record<string, unknown> },
        callbacks: {
          onReadyForServerApproval: (paymentId: string) => void | Promise<void>;
          onReadyForServerCompletion: (paymentId: string, txid: string) => void | Promise<void>;
          onCancel: (paymentId: string) => void;
          onError: (error: Error, payment?: unknown) => void;
        },
      ) => Promise<unknown>;
    };
  }
}
