import { Upload } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
// UI
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { createClient } from "@/utils/supabase/component";

type UpdateAvatarDialogProps = {
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  puklaId: string;
  onAvatarUpdate: (url: string) => void;
};

export const UpdateAvatarDialog: React.FC<UpdateAvatarDialogProps> = ({
  openDialog,
  setOpenDialog,
  puklaId,
  onAvatarUpdate,
}) => {
  const supabase = createClient();
  const t = useTranslations();
  const lang = useLocale();
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      // Upload file to Supabase storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${puklaId}-${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage.from("pukla_avatars").upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("pukla_avatars").getPublicUrl(fileName);

      onAvatarUpdate(publicUrl);
      setOpenDialog(false);
      toast.success(t("MyPuklas.avatar_updated"));
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error(t("MyPuklas.error_uploading_avatar"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogContent className="sm:max-w-md" dir={lang === "ar" ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle>{t("MyPuklas.update_avatar")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full"
          >
            <Upload className="me-2 h-4 w-4" />
            {uploading ? t("MyPuklas.uploading") : t("MyPuklas.choose_file")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
