import React, { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { GetStaticProps } from "next";
// UI
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
// Hooks
import useUserStore from "@/hooks/use-user-store";
// Constants
import { FREE_PLAN_ID } from "@/lib/constants";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import Image from "next/image";

export default function Auth() {
  const t = useTranslations();
  const lang = useLocale();
  const { resolvedTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const user = useUserStore((state: any) => state.user);

  useEffect(() => {
    if (user) {
      router.replace("/dashboard", undefined, { shallow: true });
    }
  }, [user, router]);

  useEffect(() => {
    router.events.emit("routeChangeComplete", router.asPath);
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(t("Auth." + error.code));
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (password !== confirmPassword) {
      toast.error(t("Auth.passwords_do_not_match"));
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      // Create profile for the new user
      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert([
              {
                id: data.user.id,
                email: data.user.email,
                full_name: "Default Full Name",
                stripe_customer_id: null,
                avatar_url: null,
                address: null,
                user_settings: { currency: "SAR", calendar_type: "gregorian" },
                username: null,
                subscribed_to: "pukla_free",
                price_id: FREE_PLAN_ID,
              },
            ]);

          if (profileError) throw profileError;
        } catch (profileError: any) {
          console.error("Error creating profile:", profileError);
        }
      }
    } catch (error: any) {
      toast.error(t("Auth." + error.code));
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoadingGoogle(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
          queryParams: {
            prompt: "select_account",
          },
        },
      });
      if (error) throw error;
    } catch (error) {
      toast.error(t("Auth.failed_to_sign_in_with_google"));
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleAuthDirection = async () => {
    try {
      // Check if there's a pending URL to shorten
      const pendingUrl = sessionStorage.getItem("pendingShortUrl");
      if (pendingUrl) {
        // Navigate to dashboard with state to open create dialog
        router.push("/dashboard", {
          query: { openCreateDialog: true, pendingUrl },
        });
        // Clear the pending URL
        sessionStorage.removeItem("pendingShortUrl");
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      });
      if (error) throw error;
      toast.success(t("Auth.password_reset_email_sent"));
    } catch (error: any) {
      toast.error(t("Auth." + error.code));
    } finally {
      setLoading(false);
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
      <CustomPageMeta
        title={t("SEO.auth.title")}
        description={t("SEO.auth.description")}
      />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          Sanad
          {/* <Image
            src={`/assets/pukla-logo-full-${resolvedTheme === "dark" ? "green" : "purple"}.png`}
            alt="Pukla"
            className="h-12 w-auto"
            width={512}
            height={512}
          /> */}
        </div>
      </div>
      {isForgotPassword ? (
        <div className="mt-8 flex flex-col gap-2 sm:mx-auto sm:w-full sm:max-w-md  max-w-[90%] w-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {t("Auth.reset_password")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">{t("Auth.email_address")}</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    dir="ltr"
                    className={lang === "ar" ? "text-right" : ""}
                    required
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  ) : (
                    t("Auth.reset_password")
                  )}
                </Button>
              </form>

              {/* Go back to sign in */}
              <button
                onClick={() => setIsForgotPassword(false)}
                className="w-full mt-4 text-sm text-muted-foreground cursor-pointer hover:text-primary"
              >
                {t("Auth.go_back_to_sign_in")}
              </button>
            </CardContent>
          </Card>
          <div className="flex flex-row justify-between">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-2 sm:mx-auto sm:w-full sm:max-w-md  max-w-[90%] w-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {isSignUp
                  ? t("Auth.create_your_account")
                  : t("Auth.sign_in_to_your_account")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={isSignUp ? handleSignUp : handleSignIn}
                className="space-y-6"
              >
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">{t("Auth.email_address")}</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    dir="ltr"
                    className={lang === "ar" ? "text-right" : ""}
                    required
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">{t("Auth.password")}</Label>
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
                  {!isSignUp && (
                    <p
                      className="text-sm text-muted-foreground cursor-pointer w-fit"
                      onClick={() => setIsForgotPassword(true)}
                    >
                      {t("Auth.forgot_password")}
                    </p>
                  )}
                </div>
                {isSignUp && (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="confirm-password">
                      {t("Auth.confirm_password")}
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
                )}

                <div className="flex flex-col gap-4">
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    ) : isSignUp ? (
                      t("Auth.sign_up")
                    ) : (
                      t("Auth.sign_in")
                    )}
                  </Button>

                  {/* <GoogleButton
                    text={t("continue_with_google")}
                    onClick={handleGoogleAuth}
                    loading={loadingGoogle}
                  /> */}
                </div>
              </form>

              <div className="mt-6">
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="w-full text-sm text-muted-foreground cursor-pointer hover:text-primary"
                >
                  {isSignUp
                    ? t("Auth.already_have_an_account") +
                      " " +
                      t("Auth.sign_in")
                    : t("Auth.dont_have_an_account") + " " + t("Auth.sign_up")}
                </button>
              </div>
            </CardContent>
          </Card>
          <div className="flex flex-row justify-between">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../locales/${locale}.json`)).default,
    },
  };
};
