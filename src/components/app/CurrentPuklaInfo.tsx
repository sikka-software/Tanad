import React from "react";
import {
  Copy,
  Eye,
  Link2,
  MoreVertical,
  Pencil,
  QrCode,
  RefreshCcw,
  Share,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/router";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import { useClipboard } from "@/hooks/use-clipboard";
import { useMainStore } from "@/hooks/main.store";
import { fetchPuklasWithLinkCount } from "@/lib/operations";
// Components
import { ShareDialog } from "@/components/app/ShareDialog";
import { PuklaFormDialog } from "@/components/app/PuklaFormDialog";
import { UpdateAvatarDialog } from "@/components/app/UpdateAvatarDialog";
// UI
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { ChangePuklaDialog } from "@/components/app/ChangePuklaDialog";
import { QrCodeDialog } from "@/components/app/QrCodeDialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

type CurrentPuklaInfoType = {
  pukla?: any;
  allPuklas?: any[];
  loading?: boolean;
};

export const CurrentPuklaInfo: React.FC<CurrentPuklaInfoType> = (props) => {
  const { copy, copied } = useClipboard();
  const router = useRouter();
  const t = useTranslations();
  const lang = useLocale();
  const [openShareDialog, setOpenShareDialog] = React.useState(false);
  const [openChangePuklaDialog, setOpenChangePuklaDialog] =
    React.useState(false);
  const [openQrCodeDialog, setOpenQrCodeDialog] = React.useState(false);
  const [openUpdateAvatarDialog, setOpenUpdateAvatarDialog] =
    React.useState(false);
  const [openEditPuklaDialog, setOpenEditPuklaDialog] = React.useState(false);

  const { selectedPukla, setSelectedPukla } = useMainStore((state) => state);
  const [allPuklas, setAllPuklas] = React.useState<any[]>([]);

  // Use selectedPukla instead of props.pukla
  const pukla = selectedPukla || props.pukla;

  const handleAvatarUpdate = async (newAvatarUrl: string) => {
    try {
      const { error } = await supabase
        .from("puklas")
        .update({ avatar_url: newAvatarUrl })
        .eq("id", pukla.id);

      if (error) throw error;

      // Reload the page data
      router.reload();
    } catch (error) {
      console.error("Error updating avatar:", error);
      toast.error(t("General.error_updating_avatar"));
    }
  };

  const getPuklasWithLinks = async () => {
    const puklas = await fetchPuklasWithLinkCount(pukla?.user_id);
    setAllPuklas(puklas);
  };

  const handlePuklaUpdate = () => {
    router.reload();
  };

  React.useEffect(() => {
    getPuklasWithLinks();
  }, []);

  if (props.loading) {
    return <Skeleton className="h-[78px] w-full" />;
  } else {
    return (
      <div className="bg-singleLinkContentBG flex w-full flex-row items-center justify-between rounded border p-4 text-center">
        <div className="flex w-full flex-col items-center justify-between gap-2">
          <div className="flex flex-row items-center justify-between w-full gap-2">
            <div className="flex flex-row gap-2 items-center">
              <Avatar
                className="cursor-pointer"
                onClick={() => setOpenUpdateAvatarDialog(true)}
              >
                <AvatarImage src={pukla?.avatar_url} alt={pukla?.title} />
                <AvatarFallback>
                  {pukla?.title?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col text-start">
                <span className="text-md font-bold">{pukla?.title}</span>
                <a
                  href={`${process.env.NEXT_PUBLIC_APP_URL}/${pukla?.slug}`}
                  target="_blank"
                  className="text-sm text-muted-foreground"
                >
                  puk.la/{pukla?.slug}
                </a>
              </div>
            </div>
            <div className="flex-row gap-2 hidden md:flex">
              <TooltipProvider>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        size="icon_sm"
                        variant="outline"
                        onClick={() => setOpenEditPuklaDialog(true)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <div dir={lang === "ar" ? "rtl" : "ltr"}>
                      {t("MyPuklas.edit_pukla")}
                    </div>
                  </TooltipContent>
                </Tooltip>
                {router.pathname !== "/editor" && (
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        variant="outline"
                        size="icon_sm"
                        onClick={() => {
                          router.push(`/editor?id=${pukla.id}`);
                          setSelectedPukla(pukla);
                        }}
                      >
                        <Link2 className="h-4 w-4" />
                        <span className="sr-only">{t("General.edit")}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t("MyPuklas.edit_links")}</TooltipContent>
                  </Tooltip>
                )}

                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        size="icon_sm"
                        variant="outline"
                        onClick={() =>
                          window.open(
                            `${process.env.NEXT_PUBLIC_APP_URL}/${pukla?.slug}`,
                            "_blank"
                          )
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <div dir={lang === "ar" ? "rtl" : "ltr"}>
                      {t("General.preview")}
                    </div>
                  </TooltipContent>
                </Tooltip>

                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        size="icon_sm"
                        variant="outline"
                        onClick={() => {
                          copy(
                            `${process.env.NEXT_PUBLIC_APP_URL}/${pukla?.slug}`
                          );
                          toast.success(t("General.copied"));
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <div dir={lang === "ar" ? "rtl" : "ltr"}>
                      {t("MyPuklas.copy_link")}
                    </div>
                  </TooltipContent>
                </Tooltip>

                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        onClick={() => setOpenShareDialog(!openShareDialog)}
                        variant="outline"
                        size="icon_sm"
                      >
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <div dir={lang === "ar" ? "rtl" : "ltr"}>
                      {t("General.share")}
                    </div>
                  </TooltipContent>
                </Tooltip>

                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        onClick={() => setOpenChangePuklaDialog(true)}
                        variant="outline"
                        size="icon_sm"
                      >
                        <RefreshCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <div dir={lang === "ar" ? "rtl" : "ltr"}>
                      {t("Editor.change-pukla")}
                    </div>
                  </TooltipContent>
                </Tooltip>

                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        onClick={() => setOpenQrCodeDialog(true)}
                        variant="outline"
                        size="icon_sm"
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <div dir={lang === "ar" ? "rtl" : "ltr"}>
                      {t("General.generate_qr_code")}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex flex-row gap-2 md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={lang === "ar" ? "start" : "end"}>
                  <DropdownMenuItem
                    onClick={() => setOpenChangePuklaDialog(true)}
                  >
                    <RefreshCcw className="h-4 w-4" />
                    {t("Editor.change-pukla")}
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => setOpenQrCodeDialog(true)}>
                    <QrCode className="h-4 w-4" />
                    {t("General.generate_qr_code")}
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => setOpenShareDialog(true)}>
                    <Share className="h-4 w-4" />
                    {t("General.share")}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => {
                      window.open(
                        `${process.env.NEXT_PUBLIC_APP_URL}/${pukla?.slug}`,
                        "_blank"
                      );
                    }}
                  >
                    <Eye className="h-4 w-4" />
                    {t("General.preview")}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => {
                      copy(`${process.env.NEXT_PUBLIC_APP_URL}/${pukla?.slug}`);

                      toast.success(t("General.copied"));
                    }}
                  >
                    <Copy className="h-4 w-4" />
                    {t("MyPuklas.copy_link")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <ShareDialog
          slug={pukla?.slug}
          openDialog={openShareDialog}
          setOpenDialog={setOpenShareDialog}
        />

        <ChangePuklaDialog
          openDialog={openChangePuklaDialog}
          setOpenDialog={setOpenChangePuklaDialog}
          allPuklas={allPuklas}
        />

        <QrCodeDialog
          slug={pukla?.slug}
          openDialog={openQrCodeDialog}
          setOpenDialog={setOpenQrCodeDialog}
        />

        <UpdateAvatarDialog
          openDialog={openUpdateAvatarDialog}
          setOpenDialog={setOpenUpdateAvatarDialog}
          puklaId={pukla?.id}
          onAvatarUpdate={handleAvatarUpdate}
        />

        <PuklaFormDialog
          openDialog={openEditPuklaDialog}
          setOpenDialog={setOpenEditPuklaDialog}
          mode="edit"
          pukla={pukla}
          onSuccess={handlePuklaUpdate}
        />
      </div>
    );
  }
};
