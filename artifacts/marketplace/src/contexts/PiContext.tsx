import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

declare global {
  interface Window {
    Pi?: PiSDK;
  }
}

interface PiSDK {
  init: (config: { version: string; sandbox?: boolean }) => void;
  authenticate: (
    scopes: string[],
    onIncompletePaymentFound: (payment: PiPayment) => void
  ) => Promise<PiAuthResult>;
  createPayment: (
    paymentData: PiPaymentData,
    callbacks: PiPaymentCallbacks
  ) => void;
  openShareDialog: (title: string, message: string) => void;
}

interface PiAuthResult {
  user: { uid: string; username: string };
  accessToken: string;
}

export interface PiPaymentData {
  amount: number;
  memo: string;
  metadata: Record<string, unknown>;
}

interface PiPaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: PiPayment) => void;
}

interface PiPayment {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: Record<string, unknown>;
  status: {
    developer_approved: boolean;
    transaction_verified: boolean;
    developer_completed: boolean;
    cancelled: boolean;
    user_cancelled: boolean;
  };
}

interface PiContextType {
  isInPiBrowser: boolean;
  piUser: { uid: string; username: string } | null;
  isAuthenticating: boolean;
  piSdkReady: boolean;
  authenticateWithPi: () => Promise<{ uid: string; username: string; accessToken: string } | null>;
  createPiPayment: (data: PiPaymentData, callbacks: PiPaymentCallbacks) => void;
}

const PiContext = createContext<PiContextType | undefined>(undefined);

export function PiProvider({ children }: { children: React.ReactNode }) {
  const [isInPiBrowser, setIsInPiBrowser] = useState(false);
  const [piUser, setPiUser] = useState<{ uid: string; username: string } | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [piSdkReady, setPiSdkReady] = useState(false);

  useEffect(() => {
    const checkPiBrowser = () => {
      const inPi = typeof window !== "undefined" && !!(window as any).Pi;
      setIsInPiBrowser(inPi);
      if (inPi && window.Pi) {
        try {
          window.Pi.init({ version: "2.0", sandbox: false });
          setPiSdkReady(true);
        } catch {
          setPiSdkReady(false);
        }
      }
    };

    if (document.readyState === "complete") {
      checkPiBrowser();
    } else {
      window.addEventListener("load", checkPiBrowser);
      return () => window.removeEventListener("load", checkPiBrowser);
    }
  }, []);

  const authenticateWithPi = useCallback(async () => {
    if (!window.Pi || !piSdkReady) return null;
    setIsAuthenticating(true);
    try {
      const result = await window.Pi.authenticate(
        ["username", "payments"],
        (incompletePayment) => {
          console.warn("Incomplete Pi payment found:", incompletePayment.identifier);
        }
      );
      setPiUser(result.user);
      return { ...result.user, accessToken: result.accessToken };
    } catch (err) {
      console.error("Pi auth error:", err);
      return null;
    } finally {
      setIsAuthenticating(false);
    }
  }, [piSdkReady]);

  const createPiPayment = useCallback((data: PiPaymentData, callbacks: PiPaymentCallbacks) => {
    if (!window.Pi || !piSdkReady) {
      callbacks.onError(new Error("Pi SDK not available"));
      return;
    }
    window.Pi.createPayment(data, callbacks);
  }, [piSdkReady]);

  return (
    <PiContext.Provider value={{
      isInPiBrowser,
      piUser,
      isAuthenticating,
      piSdkReady,
      authenticateWithPi,
      createPiPayment,
    }}>
      {children}
    </PiContext.Provider>
  );
}

export function usePi() {
  const ctx = useContext(PiContext);
  if (!ctx) throw new Error("usePi must be used inside PiProvider");
  return ctx;
}
