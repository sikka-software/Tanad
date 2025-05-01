"use client";

import { Send, X, AlertTriangle, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/ui/dialog";
import { Textarea } from "@/ui/textarea";

interface ErrorComponentProps {
  errorMessage: string;
  errorCode?: string;
  onReport?: (details: string) => Promise<void>;
}

export default function ErrorComponent({
  errorMessage,
  errorCode,
  onReport = async () => {},
}: ErrorComponentProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleReport = async () => {
    setIsSubmitting(true);
    try {
      await onReport(reportDetails);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to submit report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden rounded-xl border border-red-200 bg-white shadow-lg dark:border-red-900 dark:bg-gray-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-red-500 to-rose-600 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="rounded-full bg-white/20 p-2">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-medium text-white">{t("General.error.error_detected")}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              {t("General.error.error_message")}
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-sm dark:border-gray-700 dark:bg-gray-800">
              {errorMessage}
            </div>
          </div>

          <div className="flex items-center justify-between">
            {errorCode ? (
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {t("General.error.error_code")}: {errorCode}
                </span>
              </div>
            ) : (
              <div />
            )}

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="group border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/50"
                >
                  <span>{t("General.report_issue")}</span>
                  <ArrowRight className="ms-2 h-3 w-3 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md" dir={locale === "ar" ? "rtl" : "ltr"}>
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-3 py-8 text-center"
                  >
                    <div className="flex justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800">
                        <Send className="h-7 w-7 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <h3 className="mt-4 text-xl font-semibold">
                      {t("General.report_issue_thank_you")}
                    </h3>
                    <p className="mx-auto max-w-sm text-gray-500 dark:text-gray-400">
                      {t("General.report_issue_description")}
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <DialogHeader>
                      <DialogTitle className="text-xl">
                        {t("General.report_issue_title")}
                      </DialogTitle>
                      <DialogDescription className="text-gray-500 dark:text-gray-400">
                        {t("General.report_issue_description")}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5 py-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t("General.error.error_details")}
                        </h4>
                        <div className="rounded-md border border-gray-200 bg-gray-50 p-3 font-mono text-xs dark:border-gray-700 dark:bg-gray-800">
                          {errorMessage}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <label
                          htmlFor="details"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          {t("General.error.error_details_question")}
                        </label>
                        <Textarea
                          id="details"
                          value={reportDetails}
                          onChange={(e) => setReportDetails(e.target.value)}
                          className="min-h-[120px] resize-none focus:border-red-500 focus:ring-red-500"
                        />
                      </div>
                    </div>
                    <DialogFooter className="border-t border-gray-100 pt-4 sm:justify-between dark:border-gray-800">
                      <DialogClose asChild>
                        <Button variant="outline" type="button">
                          {t("General.cancel")}
                        </Button>
                      </DialogClose>
                      <Button
                        type="button"
                        onClick={handleReport}
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                      >
                        {isSubmitting ? t("General.submitting") : t("General.submit_report")}
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
