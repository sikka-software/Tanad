import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { supabase } from "@/lib/supabase";
import useUserStore from "@/stores/use-user-store";
// UI
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface FeedbackDialogProps {
  onOpenChange?: (open: boolean) => void;
}

export function FeedbackDialog({ onOpenChange }: FeedbackDialogProps) {
  const t = useTranslations();
  const lang = useLocale();
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUserStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("feedback").insert([
        {
          user_id: user?.id,
          email: user?.email,
          message: feedback.trim(),
        },
      ]);

      if (error) throw error;

      toast.success(t("Feedback.feedback_submitted"), {
        description: t("Feedback.thank_you_feedback"),
      });
      setFeedback("");
      onOpenChange?.(false);
    } catch (error) {
      console.error(error);
      toast.error(t("General.error"), {
        description: t("Feedback.error_submitting_feedback"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent dir={lang === "ar" ? "rtl" : "ltr"}>
      <DialogHeader>
        <DialogTitle>{t("Feedback.give_feedback")}</DialogTitle>
        <DialogDescription>
          {t("Feedback.feedback_dialog_description")}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder={t("Feedback.feedback_placeholder")}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="min-h-[150px]"
          required
        />
        <Button
          type="submit"
          className="w-full plausible-event-name=feedback_sent"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? t("Feedback.submitting")
            : t("Feedback.submit_feedback")}
        </Button>
      </form>
    </DialogContent>
  );
}
