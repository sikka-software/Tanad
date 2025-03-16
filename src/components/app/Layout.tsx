import { useState } from "react";
import clsx from "clsx";
// Components
import MobileViewModeSwitcher from "@/components/app/MobileViewModeSwitcher";
// Hooks
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { usePuklaStore } from "@/hooks/use-pukla-store";
import { useSocialLinksStore } from "@/hooks/use-social-links-store";
import useUserStore from "@/hooks/use-user-store";
// import withAuthCheck from "@/utils/withAuthCheck";

const Layout = ({ children }: any) => {
  const { user } = useUserStore();
  const [previewMode, setPreviewMode] = useState<any>(false);
  const size = useBreakpoint();
  const isMobile = size ? size < 800 : false;
  //   const puklaId = user?.customerData?.puklas[0];
  //   const { data: { pukla } = {}, loading } = useQueryGetPuklaById(puklaId);

  const setPuklaItems = usePuklaStore((state) => state.setPuklaItems);
  const setSocialLinks = useSocialLinksStore((state) => state.setSocialLinks);
  //   useEffect(() => {
  //     if (user && puklaId && pukla) {
  //       setPuklaItems(pukla?.links);
  //       setSocialLinks(pukla?.settings?.socialIcons);
  //     }
  //   }, [user, puklaId, pukla, loading]);

  return (
    <div className="bg-linksSectionBG flex h-full w-full flex-row items-start justify-between overflow-clip overflow-y-auto">
      {!isMobile || !previewMode ? (
        <div className="flex w-full flex-col">{children}</div>
      ) : null}
      {(!isMobile || previewMode) && (
        <div
          className={clsx(
            "sticky  top-0 flex h-full flex-col items-center justify-start border-l-[1px] pt-10",
            isMobile ? "w-full" : "w-1/2 max-w-[700px]"
          )}
        >
          {/* <PreviewSection isLoading={loading} pukla={pukla} /> */}
        </div>
      )}
      {isMobile ? (
        <MobileViewModeSwitcher
          makeRoomForAnnouncement
          mode={previewMode}
          onModeChange={setPreviewMode}
        />
      ) : null}
    </div>
  );
};

// export default withAuthCheck(Layout);
export default Layout;
