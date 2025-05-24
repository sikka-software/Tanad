import { AlertCircle, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { isZatcaCompliant } from "@/lib/zatca/zatca-utils";

interface ZatcaComplianceBadgeProps {
  invoice: any;
  phase?: 1 | 2;
  className?: string;
}

export function ZatcaComplianceBadge({ invoice, phase = 1, className }: ZatcaComplianceBadgeProps) {
  const t = useTranslations();
  const { compliant, missingFields } = isZatcaCompliant(invoice, phase);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className={className}>
          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              compliant
                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
            }`}
          >
            {compliant ? (
              <>
                <CheckCircle className="h-3.5 w-3.5" />
                <span>
                  {phase === 2
                    ? t("Invoices.zatca_phase2_compliant", { fallback: "ZATCA Phase 2 Compliant" })
                    : t("Invoices.zatca_compliant", { fallback: "ZATCA Phase 1 Compliant" })}
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-3.5 w-3.5" />
                <span>
                  {phase === 2
                    ? t("Invoices.zatca_phase2_incomplete", {
                        fallback: "ZATCA Phase 2 Incomplete",
                      })
                    : t("Invoices.zatca_incomplete", { fallback: "ZATCA Phase 1 Incomplete" })}
                </span>
              </>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {compliant ? (
            <p>
              {phase === 2
                ? t("Invoices.zatca_tooltip_phase2_compliant", {
                    fallback: "This invoice is ZATCA Phase 2 compliant with UBL 2.1 XML",
                  })
                : t("Invoices.zatca_tooltip_compliant", {
                    fallback: "This invoice is ZATCA Phase 1 compliant",
                  })}
            </p>
          ) : (
            <div className="max-w-xs">
              <p className="mb-1 font-medium">
                {t("Invoices.zatca_tooltip_missing", { fallback: "Missing required fields:" })}
              </p>
              <ul className="list-disc pl-4 text-sm">
                {missingFields.map((field) => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
