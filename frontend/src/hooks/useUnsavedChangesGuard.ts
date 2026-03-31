import { useCallback, useEffect } from "react";

const DEFAULT_MESSAGE = "当前有未保存的变更，确定要离开吗？";

export const useUnsavedChangesGuard = (enabled: boolean, message = DEFAULT_MESSAGE) => {
  const confirmDiscard = useCallback(() => {
    if (!enabled) {
      return true;
    }

    return window.confirm(message);
  }, [enabled, message]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [enabled, message]);

  return { confirmDiscard };
};
