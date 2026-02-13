import { useEffect, useMemo, useRef } from "react";
import { useFlow, useStack } from "@stackflow/react/future";

type BackResult = "web" | "native";

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
    webkit?: {
      messageHandlers?: {
        closeWebView?: {
          postMessage: (payload?: unknown) => void;
        };
      };
    };
    cuteMvpBridge?: {
      canGoBackInWeb: () => boolean;
      goBackInWeb: () => boolean;
      handleBack: () => BackResult;
    };
    canGoBackInWeb?: () => boolean;
    goBackInWeb?: () => boolean;
    handleBackInWeb?: () => BackResult;
  }
}

function getVisibleDepth(activities: Array<{ transitionState: string }>) {
  return activities.filter((activity) => activity.transitionState !== "exit-done")
    .length;
}

function requestNativeClose() {
  if (window.ReactNativeWebView?.postMessage) {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: "WEBVIEW_CLOSE_REQUEST",
      })
    );
    return;
  }

  window.webkit?.messageHandlers?.closeWebView?.postMessage?.({});
}

export function WebBackBridge() {
  const { pop } = useFlow();
  const stack = useStack();
  const depthRef = useRef(1);

  useEffect(() => {
    depthRef.current = getVisibleDepth(stack.activities);
  }, [stack.activities]);

  const bridge = useMemo(() => {
    const canGoBackInWeb = () => depthRef.current > 1;

    const goBackInWeb = () => {
      if (!canGoBackInWeb()) return false;
      pop();
      return true;
    };

    const handleBack = (): BackResult => {
      if (goBackInWeb()) return "web";
      requestNativeClose();
      return "native";
    };

    return {
      canGoBackInWeb,
      goBackInWeb,
      handleBack,
    };
  }, [pop]);

  useEffect(() => {
    window.cuteMvpBridge = bridge;
    window.canGoBackInWeb = bridge.canGoBackInWeb;
    window.goBackInWeb = bridge.goBackInWeb;
    window.handleBackInWeb = bridge.handleBack;

    return () => {
      if (window.cuteMvpBridge === bridge) delete window.cuteMvpBridge;
      if (window.canGoBackInWeb === bridge.canGoBackInWeb) {
        delete window.canGoBackInWeb;
      }
      if (window.goBackInWeb === bridge.goBackInWeb) {
        delete window.goBackInWeb;
      }
      if (window.handleBackInWeb === bridge.handleBack) {
        delete window.handleBackInWeb;
      }
    };
  }, [bridge]);

  return null;
}

