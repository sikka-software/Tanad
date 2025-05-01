import { useState, useEffect } from "react";
import { TransitionPanel } from "@/ui/transition-panel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";
import { Button } from "@/ui/button";
import useMeasure from "react-use-measure";
import { useLocale } from "next-intl";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface AdjustableDialogProps {
  items: { id: string; content: React.ReactNode }[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onNext?: (currentIndex: number) => Promise<boolean>;
  hidePreviousButton?: boolean;
}

const AdjustableDialog = ({
  items,
  isOpen,
  onOpenChange,
  title,
  onNext,
  hidePreviousButton = false,
}: AdjustableDialogProps) => {
  const t = useTranslations();
  const locale = useLocale();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [ref, bounds] = useMeasure();
  const [isLoading, setIsLoading] = useState(false);

  // Reset index when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setDirection(1);
    }
  }, [isOpen]);

  const handleNext = async () => {
    if (onNext) {
      setIsLoading(true);
      try {
        const canProceed = await onNext(currentIndex);
        if (!canProceed) return;
      } finally {
        setIsLoading(false);
      }
    }

    if (currentIndex === items.length - 1) {
      onOpenChange(false);
      return;
    }
    setDirection(1);
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const isLastItem = currentIndex === items.length - 1;
  const isFirstItem = currentIndex === 0;
  const shouldHidePrevious = hidePreviousButton || isFirstItem;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        // persist
        className="overflow-hidden"
        dir={locale === "ar" ? "rtl" : "ltr"}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <TransitionPanel
          activeIndex={currentIndex}
          className="overflow-hidden p-2 pb-10"
          variants={{
            enter: (direction) => ({
              x: direction > 0 ? 364 : -364,
              opacity: 0,
              height: bounds.height > 0 ? bounds.height : "auto",
              position: "initial",
            }),
            center: {
              zIndex: 1,
              x: 0,
              opacity: 1,
              height: bounds.height > 0 ? bounds.height : "auto",
            },
            exit: (direction) => ({
              zIndex: 0,
              x: direction < 0 ? 364 : -364,
              opacity: 0,
              position: "absolute",
              top: 0,
              width: "100%",
            }),
          }}
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          custom={direction}
        >
          {items.map((item) => (
            <div key={item.id} ref={ref}>
              {item.content}
            </div>
          ))}
        </TransitionPanel>
        <div className="flex flex-row justify-between">
          {!shouldHidePrevious ? (
            <Button
              variant="secondary"
              onClick={handlePrev}
              disabled={isFirstItem}
            >
              {t("General.previous")}
            </Button>
          ) : (
            <div className="w-10"></div>
          )}
          <Button
            variant={isLastItem ? "default" : "secondary"}
            onClick={handleNext}
            disabled={isLoading}
            className={shouldHidePrevious ? "" : ""}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isLastItem ? (
              t("General.done")
            ) : (
              t("General.next")
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdjustableDialog;
