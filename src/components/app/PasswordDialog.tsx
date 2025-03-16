import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

// UI
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";

const PasswordDialog = ({ open, form, onSubmit, error, onOpenChange }: any) => {
  const t = useTranslations();
  const lang = useLocale();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir={lang === "ar" ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle>
            {t("Editor.lock_link.password_protected.title")}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t("Auth.password")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
              {t("General.submit")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordDialog;
