// This page is used to reset the password. the url will be coming from supabase email and it will have a token
// we will use the token to reset the password

import { useRouter } from "next/router";
import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { GetStaticProps } from "next";
import Image from "next/image";
const ResetPassword = () => {
  const t = useTranslations("Auth");
  const lang = useLocale();
  const { resolvedTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { token } = router.query;
  const [error, setError] = useState<any>(null);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (password !== confirmPassword) {
      toast.error(t("passwords_do_not_match"));
      setLoading(false);
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      if (error) throw error;
      toast.success(t("password_reset_successfully"));
    } catch (error: any) {
      toast.error(t(error.code));
    } finally {
      setLoading(false);
      router.push("/dashboard");
    }
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return null or loading state before client-side mount
  if (!mounted) {
    return null; // or a loading spinner
  }

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 items-center"
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Image
            src={`/assets/pukla-logo-full-${resolvedTheme === "dark" ? "white" : "purple"}.png`}
            alt="Pukla"
            className="h-12 w-auto"
            width={512}
            height={512}
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-2 sm:mx-auto sm:w-full sm:max-w-md  max-w-[90%] w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">{t("reset_password")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">{t("password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    autoComplete="current-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPassword(e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute end-0 top-0 h-10 w-10 px-3 py-2"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="confirm-password">
                  {t("confirm_password")}
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    autoComplete="confirm-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setConfirmPassword(e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute end-0 top-0 h-10 w-10 px-3 py-2"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  ) : (
                    t("reset_password")
                  )}
                </Button>
              </div>
            </form>

            <div className="flex flex-col mt-4 justify-center items-center">
              <p
                onClick={() => router.push("/auth")}
                className="text-sm text-center text-muted-foreground cursor-pointer hover:text-primary"
              >
                {t("go_back_to_sign_in")}
              </p>
            </div>
          </CardContent>
        </Card>
        <div className="flex flex-row justify-between">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../locales/${locale}.json`)).default,
    },
  };
};
