import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import router from "next/router";
import {
  Pencil,
  Trash2,
  Copy,
  Eye,
  Link as LinkIcon,
  Calendar,
  Link2,
} from "lucide-react";
// UI
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import { useClipboard } from "@/hooks/use-clipboard";
import { Pukla } from "@/lib/types";
import { PuklaFormDialog } from "@/components/app/PuklaFormDialog";

const SinglePuklaThumbnail = ({
  pukla,
  linkCount,
  onDelete,
  onEdit,
  onUpdate,
}: {
  pukla: Pukla;
  linkCount: number;
  onDelete: () => void;
  onEdit: () => void;
  onUpdate: () => void;
}) => {
  const t = useTranslations();
  const { copy } = useClipboard();
  const [isCopied, setIsCopied] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timeout = setTimeout(() => {
        setIsCopied(false);
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [isCopied]);

  return (
    <Card key={pukla.id} className="p-4">
      <CardHeader className="flex flex-row items-center justify-between p-0">
        <div className="flex flex-row items-center gap-4">
          <Avatar>
            <AvatarImage src={pukla.avatar_url} alt={pukla.title} />
            <AvatarFallback>
              {pukla.title.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{pukla.title}</CardTitle>
            <CardDescription>{pukla.bio}</CardDescription>
          </div>
        </div>
        <div className="flex-col gap-1 hidden lg:flex">
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger>
                <Link
                  href={`/${pukla.slug}`}
                  target="_blank"
                  className="text-sm text-muted-foreground justify-end flex flex-row items-center gap-1"
                >
                  <span> puk.la/{pukla.slug}</span>
                  <LinkIcon className="size-3" />
                </Link>
              </TooltipTrigger>
              <TooltipContent className="text-xs">
                {t("MyPuklas.pukla_link")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger>
                <div className="text-xs text-muted-foreground justify-end flex flex-row items-center gap-1">
                  <span>
                    {new Date(pukla.created_at).toLocaleDateString("en-UK")}
                  </span>
                  <Calendar className="size-3" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="text-xs">
                {t("MyPuklas.created")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="p-4 px-0">
        <div className="flex justify-between items-center">
          <Badge variant="secondary">
            {t("MyPuklas.links")} {linkCount}
          </Badge>
          <div className="text-xs text-muted-foreground flex lg:hidden">
            <span> puk.la/{pukla.slug}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-0">
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger>
                <Button
                  variant="outline"
                  size="icon_sm"
                  onClick={() => setOpenEditDialog(true)}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">{t("General.edit")}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("MyPuklas.edit_pukla")}</TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={200}>
              <TooltipTrigger>
                <Button
                  variant="outline"
                  size="icon_sm"
                  onClick={() => {
                    router.push(`/editor?id=${pukla.id}`);
                    onEdit();
                  }}
                >
                  <Link2 className="h-4 w-4" />
                  <span className="sr-only">{t("General.edit")}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("MyPuklas.edit_links")}</TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={200}>
              <TooltipTrigger>
                <Button variant="outline" size="icon_sm" asChild>
                  <Link href={`/${pukla.slug}`} target="_blank">
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">{t("General.preview")}</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("General.preview")}</TooltipContent>
            </Tooltip>

            <Tooltip open={isCopied}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon_sm"
                  onClick={() => {
                    copy(`${process.env.NEXT_PUBLIC_APP_URL}/${pukla.slug}`);
                    setIsCopied(true);
                  }}
                >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">{t("MyPuklas.copy_link")}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("General.copied")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <TooltipProvider>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon_sm"
                onClick={() => onDelete()}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
                <span className="sr-only">{t("General.delete")}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("General.delete")}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>

      <PuklaFormDialog
        openDialog={openEditDialog}
        setOpenDialog={setOpenEditDialog}
        mode="edit"
        pukla={pukla}
        onSuccess={() => {
          setOpenEditDialog(false);
          onUpdate();
        }}
      />
    </Card>
  );
};

export default SinglePuklaThumbnail;
