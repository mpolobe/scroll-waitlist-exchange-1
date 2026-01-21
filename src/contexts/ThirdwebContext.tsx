/**
 * Thirdweb Provider Context
 * Wraps the app with Thirdweb SDK for SENT token claims on Polygon
 */

import { ThirdwebProvider } from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";

interface ThirdwebWrapperProps {
  children: React.ReactNode;
}

export function ThirdwebWrapper({ children }: ThirdwebWrapperProps) {
  return (
    <ThirdwebProvider>
      {children}
    </ThirdwebProvider>
  );
}

export { client };
export default ThirdwebWrapper;
