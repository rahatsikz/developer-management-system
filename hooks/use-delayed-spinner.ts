import { useEffect, useState } from "react";

export function useDelayedSpinner(isLoading: boolean, hasData: boolean) {
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!hasData && isLoading) {
      timeout = setTimeout(() => setShowSpinner(true), 600);
    } else {
      setShowSpinner(false);
    }
    return () => clearTimeout(timeout);
  }, [isLoading, hasData]);

  return showSpinner;
}
