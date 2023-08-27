import { useEffect, useState, ReactNode } from "react";

type HydrationProviderProps = {
  children: ReactNode;
};

export const HydrationProvider = ({ children }: HydrationProviderProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted ? children : null;
};
