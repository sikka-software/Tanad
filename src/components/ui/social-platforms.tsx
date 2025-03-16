import {
  SiFacebook,
  SiSnapchat,
  SiTelegram,
  SiSpotify,
  SiGithub,
  SiBehance,
  SiDribbble,
  SiWhatsapp,
  SiTiktok,
  SiLinkedin,
  SiX,
  SiInstagram,
  SiYoutube,
  SiTwitch,
  SiPinterest,
  SiTumblr,
  SiVimeo,
  SiSoundcloud,
  SiVsco,
  SiMedium,
} from "@icons-pack/react-simple-icons";
import { Globe } from "lucide-react";

export type socialLinkOptionsType = {
  platform: string;
  icon: any;
  label: string;
  placeholder: string;
};

export const socialLinkOptions: socialLinkOptionsType[] = [
  // {
  //   platform: "website",
  //   icon: <Globe />,
  //   label: "Website",
  //   placeholder: "https://example.com",
  // },
  {
    platform: "instagram",
    icon: <SiInstagram size={20} />,
    label: "Instagram",
    placeholder: "https://instagram.com/username",
  },
  {
    platform: "twitter",
    icon: <SiX size={20} />,
    label: "Twitter",
    placeholder: "https://twitter.com/username",
  },
  {
    platform: "snapchat",
    icon: <SiSnapchat size={20} />,
    label: "Snapchat",
    placeholder: "https://snapchat.com/username",
  },
  {
    platform: "linkedin",
    icon: <SiLinkedin size={20} />,
    label: "Linkedin",
    placeholder: "https://linkedin.com/username",
  },
  {
    platform: "tiktok",
    icon: <SiTiktok size={20} />,
    label: "Tiktok",
    placeholder: "https://tiktok.com/username",
  },
  {
    platform: "whatsapp",
    icon: <SiWhatsapp size={20} />,
    label: "Whatsapp",
    placeholder: "https://wa.me/+1234567890",
  },
  {
    platform: "telegram",
    icon: <SiTelegram size={20} />,
    label: "Telegram",
    placeholder: "https://t.me/username",
  },
  {
    platform: "youtube",
    icon: <SiYoutube size={20} />,
    label: "Youtube",
    placeholder: "https://youtube.com/username",
  },
  {
    platform: "github",
    icon: <SiGithub size={20} />,
    label: "Github",
    placeholder: "https://github.com/username",
  },
  {
    platform: "behance",
    icon: <SiBehance size={20} />,
    label: "Behance",
    placeholder: "https://behance.net/username",
  },
  {
    platform: "dribbble",
    icon: <SiDribbble size={20} />,
    label: "Dribbble",
    placeholder: "https://dribbble.com/username",
  },
  {
    platform: "facebook",
    icon: <SiFacebook size={20} />,
    label: "Facebook",
    placeholder: "https://facebook.com/username",
  },
  {
    platform: "spotify",
    icon: <SiSpotify size={20} />,
    label: "Spotify",
    placeholder: "https://open.spotify.com/username",
  },
  {
    platform: "twitch",
    icon: <SiTwitch size={20} />,
    label: "Twitch",
    placeholder: "https://twitch.tv/username",
  },

  {
    platform: "medium",
    icon: <SiMedium size={20} />,
    label: "Medium",
    placeholder: "https://medium.com/username",
  },
  {
    platform: "pinterest",
    icon: <SiPinterest size={20} />,
    label: "Pinterest",
    placeholder: "https://pinterest.com/username",
  },
  {
    platform: "soundcloud",
    icon: <SiSoundcloud size={20} />,
    label: "Soundcloud",
    placeholder: "https://soundcloud.com/username",
  },
  {
    platform: "tumblr",
    icon: <SiTumblr size={20} />,
    label: "Tumblr",
    placeholder: "https://tumblr.com/username",
  },
  {
    platform: "vimeo",
    icon: <SiVimeo size={20} />,
    label: "Vimeo",
    placeholder: "https://vimeo.com/username",
  },
  {
    platform: "vsco",
    icon: <SiVsco size={20} />,
    label: "Vsco",
    placeholder: "https://vsco.co/username",
  },
];

export const getIcon = (platform: string) => {
  const socialLink = socialLinkOptions.find(
    (link) => link.platform === platform,
  );
  return socialLink ? socialLink.icon : null;
};
