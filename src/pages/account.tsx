import { useLocale, useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { GetStaticProps } from "next";
import { EyeOff } from "lucide-react";
import { Eye } from "lucide-react";

interface ProfileFormValues {
  name: string;
  email: string;
  phone: string;
}

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export default function Account() {
  const t = useTranslations();
  const lang = useLocale();

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    setValue,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormValues>();

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>();

  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { data: userData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user?.id)
          .single();

        if (userData) {
          setUser({
            ...userData,
            email: user?.email,
          });
          setValue("email", user?.email || "");
          setValue("name", userData.full_name || "");
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [setValue]);

  const onProfileSubmit = async (data: ProfileFormValues) => {
    try {
      setLoading(true);

      // Update user's email and display name
      const { error: updateError } = await supabase.auth.updateUser({
        email: data.email,
      });

      const { error: updateProfileError } = await supabase
        .from("profiles")
        .update({ full_name: data.name })
        .eq("id", user?.id);

      if (updateError) throw updateError;
      if (updateProfileError) throw updateProfileError;

      toast.success(t("Profile.profile_updated_successfully"));
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    if (data.newPassword !== data.confirmNewPassword) {
      toast.error(t("Profile.passwords_do_not_match"));
      return;
    }
    try {
      setIsUpdatingPassword(true);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: data.currentPassword,
      });

      if (signInError) {
        toast.error(t("Profile.incorrect_current_password"));
        return;
      }

      // If current password is correct, proceed with password update
      const { error: updatePasswordError } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (updatePasswordError) throw updatePasswordError;
      toast.success(t("Profile.password_updated_successfully"));
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!user) return null;

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"}>
      <Tabs defaultValue="general" className="w-full">
        <TabsList
          className="grid w-full grid-cols-2"
          dir={lang === "ar" ? "rtl" : "ltr"}
        >
          <TabsTrigger value="general">{t("Profile.general")}</TabsTrigger>
          <TabsTrigger value="security">{t("Profile.security")}</TabsTrigger>
        </TabsList>

        <TabsContent value="general" dir={lang === "ar" ? "rtl" : "ltr"}>
          <form
            onSubmit={handleProfileSubmit(onProfileSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <div className="space-y-2 w-full">
                <Label htmlFor="name">{t("Profile.name")}</Label>
                <Input
                  id="name"
                  {...registerProfile("name", {
                    required: t("Profile.name_required"),
                    minLength: {
                      value: 2,
                      message: t("Profile.name_min_length"),
                    },
                  })}
                  type="text"
                />
                {profileErrors.name && (
                  <p className="text-sm text-red-500">
                    {profileErrors.name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-row gap-2">
              <div className="space-y-2 w-full">
                <Label htmlFor="email">{t("Profile.email")}</Label>
                <Input
                  id="email"
                  {...registerProfile("email", {
                    required: t("Profile.email_required"),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t("Profile.invalid_email"),
                    },
                  })}
                  type="email"
                />

                {profileErrors.email && (
                  <p className="text-sm text-red-500">
                    {profileErrors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2 w-full">
                <Label className="text-secondary-foreground" htmlFor="phone">
                  {t("Profile.phone")}
                </Label>
                <Input
                  id="phone"
                  disabled
                  {...registerProfile("phone")}
                  type="tel"
                />
              </div>
            </div>

            <Button
              className="mt-4"
              variant="default"
              type="submit"
              disabled={loading}
            >
              {loading
                ? t("Profile.saving_changes")
                : t("Profile.save_changes")}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="security" dir={lang === "ar" ? "rtl" : "ltr"}>
          <form
            onSubmit={handlePasswordSubmit(onPasswordSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="space-y-2 w-full">
              <Label htmlFor="currentPassword">
                {t("Profile.current_password")}
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  {...registerPassword("currentPassword", {
                    required: t("Profile.current_password_required"),
                    minLength: {
                      value: 6,
                      message: t("Profile.password_min_length"),
                    },
                  })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute end-0 top-0 h-10 w-10 px-3 py-2"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  tabIndex={-1}
                >
                  {showCurrentPassword ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="text-sm text-red-500">
                  {passwordErrors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2 w-full">
              <Label htmlFor="newPassword">{t("Profile.new_password")}</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  {...registerPassword("newPassword", {
                    required: t("Profile.new_password_required"),
                    minLength: {
                      value: 6,
                      message: t("Profile.password_min_length"),
                    },
                  })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute end-0 top-0 h-10 w-10 px-3 py-2"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  tabIndex={-1}
                >
                  {showNewPassword ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {passwordErrors.newPassword && (
                <p className="text-sm text-red-500">
                  {passwordErrors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2 w-full">
              <Label htmlFor="confirmNewPassword">
                {t("Profile.confirm_new_password")}
              </Label>
              <div className="relative">
                <Input
                  id="confirmNewPassword"
                  type={showConfirmNewPassword ? "text" : "password"}
                  {...registerPassword("confirmNewPassword", {
                    required: t("Profile.confirm_new_password_required"),
                    minLength: {
                      value: 6,
                      message: t("Profile.password_min_length"),
                    },
                  })}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute end-0 top-0 h-10 w-10 px-3 py-2"
                  onClick={() =>
                    setShowConfirmNewPassword(!showConfirmNewPassword)
                  }
                  tabIndex={-1}
                >
                  {showConfirmNewPassword ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {passwordErrors.confirmNewPassword && (
                <p className="text-sm text-red-500">
                  {passwordErrors.confirmNewPassword.message}
                </p>
              )}
            </div>

            <Button
              className="mt-4"
              variant="default"
              type="submit"
              disabled={isUpdatingPassword}
            >
              {isUpdatingPassword
                ? t("Profile.updating_password")
                : t("Profile.change_password")}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
  // return (
  //   <div className="flex flex-col gap-2">
  //     <PageHeader title={t("account")} />
  //     <Card>
  //       <CardHeader>
  //         <CardTitle>{t("personal_info")}</CardTitle>
  //       </CardHeader>
  //       <CardContent>
  //         <ProfileForm />
  //       </CardContent>
  //     </Card>
  //   </div>
  // );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../locales/${locale}.json`)).default,
    },
  };
};
