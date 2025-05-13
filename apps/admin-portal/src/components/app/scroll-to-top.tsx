import { useRouter } from "next/router";
import { useEffect } from "react";

const ScrollToTop = () => {
  // ...inside AppContent or your top-level component:
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      window.scrollTo(0, 0);
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router]);

  return null;
};

export default ScrollToTop;
