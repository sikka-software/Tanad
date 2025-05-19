import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/ui/button";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Textarea } from "@/ui/textarea";

import { createClient } from "@/utils/supabase/component";

import useUserStore from "@/stores/use-user-store";

interface FeedbackDialogProps {
  onOpenChange?: (open: boolean) => void;
}

export function FeedbackDialog({ onOpenChange }: FeedbackDialogProps) {
  const t = useTranslations("General");
  const lang = useLocale();
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUserStore();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    try {
      await fetch("https://n8n.sikka.io/webhook-test/feedback-form", {
        method: "POST",
        headers: {
          "x-form-secret": process.env.N8N_FORM_SECRET || "",
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: user?.email,
          message: feedback.trim(),
        }),
      });

      toast.success(t("Feedback.feedback_submitted"), {
        description: t("Feedback.thank_you_feedback"),
      });
      setFeedback("");
      onOpenChange?.(false);
    } catch (error) {
      console.error(error);
      toast.error(t("Feedback.error_submitting_feedback"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent dir={lang === "ar" ? "rtl" : "ltr"}>
      <DialogHeader>
        <DialogTitle>{t("Feedback.give_feedback")}</DialogTitle>
        <DialogDescription>{t("Feedback.feedback_dialog_description")}</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          isolated
          placeholder={t("Feedback.feedback_placeholder")}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="min-h-[150px]"
          required
        />
        <Button
          type="submit"
          className="plausible-event-name=feedback_sent w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? t("Feedback.submitting") : t("Feedback.submit_feedback")}
        </Button>
      </form>
    </DialogContent>
  );
}
