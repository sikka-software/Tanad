import { Loader2 } from "lucide-react";
import { GetStaticProps } from "next";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import AnimationSettings from "@/components/app/AnimationSettings";
import AppearanceSettings from "@/components/app/AppearanceSettings";
// Components
import { PredefinedThemesSection } from "@/components/app/PredefinedThemes";
import SocialPlatformsSection from "@/components/app/SocialPlatformsSection";
import type { SocialPlatformsSectionRef } from "@/components/app/SocialPlatformsSection";
import UpgradeDialog from "@/components/app/UpgradeDialog";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import {
  Accordion,
  AccordionTrigger,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// UI
import { Separator } from "@/components/ui/separator";

import { predefinedThemes } from "@/lib/constants";
// Lib
import { Pukla, PuklaThemeProps, PuklaSettings, AnimationType } from "@/lib/types";

import useMainStore from "@/hooks/main.store";
// Hooks
import useUserStore from "@/stores/use-user-store";
import { createClient } from "@/utils/supabase/component";

const ThemePage = () => {
  return <div>Theme</div>;
};

export default ThemePage;
