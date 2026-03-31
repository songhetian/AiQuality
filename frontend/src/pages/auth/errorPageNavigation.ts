import type { NavigateFunction } from "react-router-dom";

export const navigateToPreviousOrHome = (navigate: NavigateFunction) => {
  if (window.history.length > 1) {
    navigate(-1);
    return;
  }

  navigate("/", { replace: true });
};
