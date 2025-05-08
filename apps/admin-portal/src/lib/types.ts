import type { User } from "@supabase/supabase-js";
import React from "react";

export type ThemeType = "light" | "dark";
export type LangType = "ar" | "en";

export interface Profile {
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export interface UserSettings {
  currency: string;
  calendar_type: string;
}

export type TanadUser = User & {
  id: string;
  email: string;
  phone: string;
  address: string;
  full_name: string;
  profile: Profile;
  subscribed_to: string;
  stripe_customer_id: string;
  user_settings: UserSettings;
  username?: string;
  price_id?: string;
  avatar_url?: string;
};

export type Pukla = {
  id: string;
  title: string;
  slug: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  link_count?: number;
  theme: PuklaThemeProps;
  settings: PuklaSettings;
  layout?: "1-col" | "2-col" | "3-col";
};

type ValidationTexts = {
  required?: string;
  invalid?: string;
};
export type TextInputType = ValidationTexts & {
  label?: string;
  placeholder?: string;
};

export type ContactSettings = {
  whatsapp?: string;
  twitter?: string;
  instagram?: string;
  mail?: string;
  // Add other contact types as needed
  [key: string]: string | undefined; // This is an index signature for any other dynamic keys
};

export type IconComponents = {
  [key in keyof ContactSettings]: React.JSX.Element;
};

export type LinkLayoutType = "default" | "double-height" | "half-width" | "square";

export type IconPosition = "start" | "end";

export interface ThumbnailIcon {
  name: string;
  position: IconPosition;
}

export interface LinkItemProps {
  id: string;
  url?: string;
  title: string;
  is_draft?: boolean;
  is_editing?: boolean;
  is_enabled?: boolean;
  is_favorite?: boolean;
  is_expanded?: boolean;
  isDeleting?: boolean;
  item_type?: string;
  item_layout?: LinkLayoutType;
  item_highlight?: HighlightAnimation;
  position?: number;
  is_password_protected?: boolean;
  is_age_restricted?: boolean;
  min_age?: number;
  password?: string;
  item_thumbnail?: {
    thumbnail_type?: "icon" | "image";
    thumbnail_icon?: ThumbnailIcon;
    thumbnail_image?: string;
    position?: IconPosition;
  } | null;
}
export interface HeaderItemProps {
  id: string;
  url?: string;
  item_type?: "header";
  title?: string;
  is_draft?: boolean;
  is_editing?: boolean;
  is_enabled?: boolean;
  is_expanded?: boolean;
  is_favorite?: boolean;
  puklaId?: string;
}
export type LinkTypes =
  | "undecided"
  | "header"
  | "delivery-apps"
  | "link"
  | "youtube"
  | "facebook"
  | "twitter"
  | "instagram"
  | "linkedin"
  | "pinterest"
  | "github";
export type LinkActionOptions =
  | "edit"
  | "delete"
  | "favorite"
  | "redirect"
  | "analytics"
  | "highlight"
  | "schedule"
  | "embed";

export type SingleHeaderProps = {
  id: string;
  url?: string;
  title?: string;
  is_favorite?: boolean;
  is_enabled?: boolean;
  is_expanded?: boolean;
  is_draft?: boolean;
  is_editing?: boolean;
  children?: React.ReactNode;
};

export interface PuklaThemeProps {
  is_free?: boolean;
  theme_name: string;
  link_color: string;
  text_color: string;
  button_color: string;
  primary_color: string;
  background_color: string;
  button_text_color: string;
  button_hover_color: string;
  button_border_color: string;
  background_image?: string;
  overlay_color?: string;
  overlay_opacity?: number;
  border_color: string;
  border_radius: string;
  avatar_border_radius?: string;
}

export type PuklaSettings = {
  hide_avatar?: boolean;
  hide_watermark?: boolean;
  hide_title?: boolean;
  hide_bio?: boolean;
  avatar_shape?: "circle" | "square" | "horizontal_rectangle" | "vertical_rectangle";
  animation?: AnimationType;
  social_links?: { platform: string; url: string }[];
  socials_position?: "top" | "bottom";
};

export type AnimationType =
  | "none"
  | "slide_up"
  | "slide_down"
  | "slide_left"
  | "slide_right"
  | "fade"
  | "scale";

export type HighlightAnimation = "outline" | "border" | "scale" | "none";
