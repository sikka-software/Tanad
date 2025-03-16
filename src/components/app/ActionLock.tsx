import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { AccordionTrigger } from "@radix-ui/react-accordion";
import { ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import useUserStore from "@/hooks/use-user-store";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";

const ActionLock = ({
  linkId,
  onUpgradeNeeded,
}: {
  linkId: string;
  onUpgradeNeeded?: () => void;
}) => {
  const t = useTranslations();
  const { user } = useUserStore();
  const [isLoadingPasswordSave, setIsLoadingPasswordSave] = useState(false);
  const [isLoadingMinAgeSave, setIsLoadingMinAgeSave] = useState(false);
  const [isLoadingPasswordToggle, setIsLoadingPasswordToggle] = useState(false);
  const [isLoadingAgeToggle, setIsLoadingAgeToggle] = useState(false);
  const [password, setPassword] = useState("");
  const [minAge, setMinAge] = useState(18);
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [ageRestricted, setAgeRestricted] = useState(false);
  const [passwordAccordion, setPasswordAccordion] = useState<
    string | undefined
  >();
  const [ageAccordion, setAgeAccordion] = useState<string | undefined>();

  // Fetch initial settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("pukla_links")
          .select("is_password_protected, is_age_restricted, min_age")
          .eq("id", linkId)
          .maybeSingle();

        console.log("dsdsdsds", data);
        if (error) throw error;

        if (data) {
          setPasswordProtected(data.is_password_protected);
          setAgeRestricted(data.is_age_restricted);
          setMinAge(data.min_age || 18);

          // Set accordion states based on current protection settings
          if (data.is_password_protected) {
            setPasswordAccordion("item-1");
          }
          if (data.is_age_restricted) {
            setAgeAccordion("item-2");
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error(t("General.error_occurred"));
      }
    };

    fetchSettings();
  }, []);

  const handlePasswordCheckbox = async (checked: boolean) => {
    if (checked) {
      setPasswordProtected(checked);
      setPasswordAccordion("item-1");
      return;
    }
    if (user?.subscribed_to === "pukla_free") {
      setPasswordProtected(false);
      setPasswordAccordion(undefined);
      return;
    }

    setIsLoadingPasswordToggle(true);
    try {
      const { error } = await supabase
        .from("pukla_links")
        .update({
          is_password_protected: false,
          password: null,
        })
        .eq("id", linkId);

      if (error) throw error;

      setPasswordProtected(false);
      setPasswordAccordion(undefined);
      toast.success(t("General.changes_saved"));
    } catch (error) {
      console.error("Error updating password protection:", error);
      toast.error(t("General.error_occurred"));
      // Revert UI state on error
      setPasswordProtected(true);
      setPasswordAccordion("item-1");
    } finally {
      setIsLoadingPasswordToggle(false);
    }
  };

  const handleAgeCheckbox = async (checked: boolean) => {
    if (checked) {
      setAgeRestricted(checked);
      setAgeAccordion("item-2");
      return;
    }
    if (user?.subscribed_to === "pukla_free") {
      setAgeRestricted(false);
      setAgeAccordion(undefined);
      return;
    }
    setIsLoadingAgeToggle(true);
    try {
      const { error } = await supabase
        .from("pukla_links")
        .update({
          is_age_restricted: false,
          min_age: null,
        })
        .eq("id", linkId);

      if (error) throw error;

      setAgeRestricted(false);
      setAgeAccordion(undefined);
      toast.success(t("General.changes_saved"));
    } catch (error) {
      console.error("Error updating age restriction:", error);
      toast.error(t("General.error_occurred"));
      // Revert UI state on error
      setAgeRestricted(true);
      setAgeAccordion("item-2");
    } finally {
      setIsLoadingAgeToggle(false);
    }
  };

  const handlePasswordSave = async () => {
    if (user?.subscribed_to === "pukla_free") {
      onUpgradeNeeded?.();
      return;
    }

    if (!password) {
      toast.error(t("Editor.lock_link.password_protected.password_required"));
      return;
    }

    setIsLoadingPasswordSave(true);
    try {
      // First hash the password
      const { data: hashedPassword, error: hashError } = await supabase.rpc(
        "hash_password",
        {
          password: password,
        }
      );

      if (hashError) throw hashError;

      // Then update the link with the hashed password
      const { error: updateError } = await supabase
        .from("pukla_links")
        .update({
          password: hashedPassword,
          is_password_protected: true,
        })
        .eq("id", linkId);

      if (updateError) throw updateError;

      setPassword(""); // Clear password field after successful save
      toast.success(t("General.changes_saved"));
    } catch (error) {
      console.error("Error saving password:", error);
      toast.error(t("General.error_occurred"));
    } finally {
      setIsLoadingPasswordSave(false);
    }
  };

  const handleMinAgeSave = async () => {
    if (user?.subscribed_to === "pukla_free") {
      onUpgradeNeeded?.();
      return;
    }
    setIsLoadingMinAgeSave(true);
    try {
      const { error } = await supabase
        .from("pukla_links")
        .update({
          is_age_restricted: ageRestricted,
          min_age: ageRestricted ? minAge : null,
        })
        .eq("id", linkId);

      if (error) throw error;

      toast.success(t("General.changes_saved"));
    } catch (error) {
      console.error("Error saving age restriction:", error);
      toast.error(t("General.error_occurred"));
    } finally {
      setIsLoadingMinAgeSave(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <Accordion
        type="single"
        collapsible
        value={passwordAccordion}
        onValueChange={setPasswordAccordion}
        disabled={!passwordProtected}
      >
        <AccordionItem value="item-1" className="border-none">
          <div className="relative flex w-full justify-between items-start gap-2 rounded border border-input p-4 shadow-sm shadow-black/5">
            <div className="flex flex-row gap-2">
              <Checkbox
                id="password-check"
                checked={passwordProtected}
                onCheckedChange={handlePasswordCheckbox}
                disabled={isLoadingPasswordToggle}
                aria-describedby="password-description"
              />
              <div className="flex flex-col gap-2">
                <Label className="text-start">
                  <div className="flex items-center gap-2">
                    <p>{t("Editor.lock_link.password_protected.title")}</p>
                    {isLoadingPasswordToggle && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>
                </Label>
                <p
                  id="password-description"
                  className="text-xs text-muted-foreground"
                >
                  {t("Editor.lock_link.password_protected.description")}
                </p>
              </div>
            </div>
            <AccordionTrigger className="hover:no-underline p-2">
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
            </AccordionTrigger>
          </div>
          <AccordionContent className="p-0">
            <div className="p-4 border-x border-b rounded-b">
              <div className="flex flex-col gap-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="password">{t("Auth.password")}</Label>
                  <form
                    className="flex flex-row gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handlePasswordSave();
                    }}
                  >
                    <Input
                      type="password"
                      id="password"
                      className="w-full"
                      placeholder={t("Auth.password")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                      variant="default"
                      className="w-full max-w-24"
                      type="submit"
                      disabled={isLoadingPasswordSave}
                    >
                      {isLoadingPasswordSave ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        t("General.save")
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Accordion
        type="single"
        collapsible
        value={ageAccordion}
        onValueChange={setAgeAccordion}
        disabled={!ageRestricted}
      >
        <AccordionItem value="item-2" className="border-none">
          <div className="relative flex w-full justify-between items-start gap-2 rounded border border-input p-4 shadow-sm shadow-black/5">
            <div className="flex flex-row gap-2">
              <Checkbox
                id="age-check"
                checked={ageRestricted}
                onCheckedChange={handleAgeCheckbox}
                disabled={isLoadingAgeToggle}
                aria-describedby="age-description"
              />
              <div className="flex flex-col gap-2">
                <Label className="text-start">
                  <div className="flex items-center gap-2">
                    <p>{t("Editor.lock_link.requires_date_of_birth.title")}</p>
                    {isLoadingAgeToggle && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>
                </Label>
                <p
                  id="age-description"
                  className="text-xs text-muted-foreground"
                >
                  {t("Editor.lock_link.requires_date_of_birth.description")}
                </p>
              </div>
            </div>
            <AccordionTrigger className="hover:no-underline p-2">
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
            </AccordionTrigger>
          </div>
          <AccordionContent className="p-0">
            <div className="p-4 border-x border-b rounded-b">
              <div className="flex flex-col gap-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="min_age">
                    {t("Editor.lock_link.min_age.label")}
                  </Label>
                  <form
                    className="flex flex-row gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleMinAgeSave();
                    }}
                  >
                    <Input
                      type="number"
                      id="min_age"
                      max={100}
                      min={12}
                      value={minAge}
                      onChange={(e) => setMinAge(parseInt(e.target.value))}
                      className="w-full"
                      placeholder={t("Editor.lock_link.min_age.placeholder")}
                    />
                    <Button
                      variant="default"
                      className="w-full max-w-24"
                      type="submit"
                      disabled={isLoadingMinAgeSave}
                    >
                      {isLoadingMinAgeSave ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        t("General.save")
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default ActionLock;
