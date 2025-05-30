import { pick } from "lodash";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { GetStaticProps } from "next";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import getConfig from "next/config";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/inputs/input";
import { Label } from "@/ui/label";
import LanguageSwitcher from "@/ui/language-switcher";
import ThemeSwitcher from "@/ui/theme-switcher";

import { createClient } from "@/utils/supabase/component";
import { convertToTranslationKey } from "@/utils/text-utils";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import useUserStore from "@/stores/use-user-store";

export default function Auth() {
  const t = useTranslations();
  const router = useRouter();
  const lang = useLocale();
  const supabase = createClient();
  const { resolvedTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { publicRuntimeConfig } = getConfig();
  const version = publicRuntimeConfig?.version;

  const profile = useUserStore((state) => state.profile);
  const user = useUserStore((state) => state.user);
  const enterprise = useUserStore((state) => state.enterprise);

  useEffect(() => {
    if (user?.id && profile?.id && enterprise?.id) {
      router.push("/dashboard");
    }
  }, [user, profile, enterprise]);

  useEffect(() => {
    setIsSignUp(router.asPath.includes("#signup"));
  }, [router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast.success(t("Auth.logged_in_successfully"));
      router.push("/dashboard").then(() => {
        setLoading(false);
      });
    } catch (error: any) {
      const errorCode = error.code || error.message;
      toast.error(t("Auth.error_occured"), {
        description: t(`Auth.${convertToTranslationKey(errorCode)}`),
      });
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error(t("Auth.passwords_do_not_match"));
      return;
    }

    setLoading(true);
    try {
      // Step 1: Create a Stripe customer first
      const createStripeCustomerResponse = await fetch("/api/stripe/create-customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name: email.split("@")[0], // Use part of email as name initially
        }),
      });

      if (!createStripeCustomerResponse.ok) {
        const errorData = await createStripeCustomerResponse.json();
        throw new Error(errorData.message || "Failed to create Stripe customer");
      }

      const { customerId } = await createStripeCustomerResponse.json();

      if (!customerId) {
        throw new Error("No Stripe customer ID returned from API");
      }

      // Step 2: Sign up the user with Supabase, including the Stripe customer ID in metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            stripe_customer_id: customerId,
          },
        },
      });

      if (error) throw error;

      // Step 3: Create the user profile with the Stripe customer ID
      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email: data.user.email,
          full_name: email.split("@")[0], // Placeholder name
          stripe_customer_id: customerId,
          user_settings: {
            currency: "sar",
            calendar: "gregorian",
            language: "ar",
            timezone: "UTC",
            date_format: "dmy",
            time_format: "12h",
            hidden_menu_items: {},
          },
        });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          toast.error(t("Auth.profile_creation_error"));
          // Continue with sign-up process even if profile creation fails
          // The profile can be created later during onboarding
        } else {
          toast.success(t("Auth.signup_successful_check_email"));
          // Redirect to onboarding
          router.push("/onboarding");
        }
      } else {
        toast.success(t("Auth.signup_successful_check_email"));
      }
    } catch (error: any) {
      // Attempt to translate Supabase auth error codes
      const errorCode = error.code || error.message;
      const translatedError = t(`Auth.${errorCode}`, undefined, errorCode);
      toast.error(translatedError);
    } finally {
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

  const logoSrc = `https://sikka-images.s3.ap-southeast-1.amazonaws.com/products/tanad/tanad_full_logo_${
    !mounted || resolvedTheme === "dark" ? "white" : "black"
  }${lang === "en" ? "_en" : "_ar"}.png`;

  // Return null or loading state before client-side mount
  if (!mounted) {
    return null;
  }

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="flex h-full flex-col items-center justify-center py-12 sm:px-6 lg:px-8"
    >
      <CustomPageMeta title={t("SEO.auth.title")} description={t("SEO.auth.description")} />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Image
          height={512}
          width={512}
          loading="lazy"
          className={"h-10 w-auto"}
          alt={`Tanad Logo`}
          src={logoSrc}
        />
        <div className="text-muted-foreground w-full pt-4 text-center text-sm sm:text-start xl:whitespace-nowrap">
          {t("General.tagline")}
        </div>
      </div>
      {isForgotPassword ? (
        <div className="mt-8 flex w-full max-w-[90%] flex-col gap-2 sm:mx-auto sm:w-full sm:max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">{t("Auth.reset_password")}</CardTitle>
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
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
                className="text-muted-foreground hover:text-primary mt-4 w-full cursor-pointer text-sm"
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
        <div className="mt-8 flex w-full max-w-[90%] flex-col gap-2 sm:mx-auto sm:w-full sm:max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {isSignUp ? t("Auth.create_your_account") : t("Auth.sign_in_to_your_account")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-6">
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
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
                      {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </div>
                  {!isSignUp && (
                    <p
                      className="text-muted-foreground w-fit cursor-pointer text-sm"
                      onClick={() => setIsForgotPassword(true)}
                    >
                      {t("Auth.forgot_password")}
                    </p>
                  )}
                </div>
                {isSignUp && (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="confirm-password">{t("Auth.confirm_password")}</Label>
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
                </div>
              </form>

              <div className="mt-6">
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-muted-foreground hover:text-primary w-full cursor-pointer text-sm"
                >
                  {isSignUp
                    ? t("Auth.already_have_an_account") + " " + t("Auth.sign_in")
                    : t("Auth.dont_have_an_account") + " " + t("Auth.sign_up")}
                </button>
              </div>
            </CardContent>
          </Card>
          <div className="flex flex-row justify-between">
            <LanguageSwitcher />
            <div className="text-muted-foregrond text-xs">v{version}</div>

            <ThemeSwitcher />
          </div>
        </div>
      )}
    </div>
  );
}

Auth.messages = ["Metadata", "Pages", "Auth", "General", "SEO"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick((await import(`../../locales/${locale}.json`)).default, Auth.messages),
    },
  };
};
