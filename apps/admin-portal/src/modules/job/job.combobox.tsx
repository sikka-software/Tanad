import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { Control, ControllerRenderProps } from "react-hook-form";

import { ComboboxAdd } from "@/ui/comboboxes/combobox-add";
import { FormControl, FormMessage } from "@/ui/form";
import { FormItem, FormLabel } from "@/ui/form";
import { FormField } from "@/ui/form";
import FormDialog from "@/ui/form-dialog";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import JobForm from "@/job/job.form";
import useJobStore from "@/job/job.store";
import { Job } from "@/job/job.type";

interface JobComboboxProps {
  label: string;
  control: Control<any>;
  jobs: Job[];
  loadingCombobox: boolean;
  isSaving: boolean;
  disabled?: boolean;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  onJobSelected?: (field: ControllerRenderProps<any, string>, value: any) => void;
  formName: string;
}

const JobCombobox = ({
  label,
  control,
  jobs,
  loadingCombobox,
  isSaving,
  isDialogOpen,
  setIsDialogOpen,
  disabled,
  formName,
  onJobSelected,
}: JobComboboxProps) => {
  const t = useTranslations();
  const locale = useLocale();

  const setIsSaving = useJobStore((state) => state.setIsLoading);

  const jobOptions = useMemo(
    () =>
      jobs?.map((job) => ({
        label: job.title,
        value: job.id,
        occupied_positions: job.occupied_positions,
        total_positions: job.total_positions,
        department: job.department,
      })) || [],
    [jobs],
  );

  return (
    <div>
      <FormField
        control={control}
        name={formName}
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>{label} *</FormLabel>
            <FormControl>
              <ComboboxAdd
                dir={locale === "ar" ? "rtl" : "ltr"}
                data={jobOptions}
                defaultValue={field.value ?? undefined}
                onChange={(value) =>
                  onJobSelected ? onJobSelected(field, value) : field.onChange(value || null)
                }
                isLoading={loadingCombobox}
                disabled={isSaving}
                texts={{
                  placeholder: t("Employees.form.job.placeholder"),
                  searchPlaceholder: t("Pages.Jobs.search"),
                  noItems: t("Pages.Jobs.no_jobs_found"),
                }}
                addText={t("Pages.Jobs.add")}
                onAddClick={() => setIsDialogOpen(true)}
                renderOption={(option) => (
                  <div className="flex flex-row items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      <span className="text-xs text-gray-500">{option.department}</span>
                    </div>
                    <Tooltip delayDuration={500}>
                      <TooltipTrigger>
                        <span className="text-xs text-gray-500">
                          {option.occupied_positions} / {option.total_positions}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {t("Jobs.form.occupied_positions.label") +
                          " / " +
                          t("Jobs.form.total_positions.label")}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={t("Pages.Jobs.add")}
        formId="job-form"
        cancelText={t("General.cancel")}
        submitText={t("General.save")}
        loadingSave={isSaving}
      >
        <JobForm
          formHtmlId="job-form"
          nestedForm
          onSuccess={() => {
            setIsDialogOpen(false);
            setIsSaving(false);
          }}
        />
      </FormDialog>
    </div>
  );
};

export default JobCombobox;
