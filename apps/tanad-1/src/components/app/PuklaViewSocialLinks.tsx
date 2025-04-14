import { Button } from "@/components/ui/button";
import { getIcon } from "@/components/ui/social-platforms";

const SocialLinks = ({
  links,
  theme,
}: {
  links: { platform: string; url: string }[];
  theme: any;
}) => {
  if (!links || links.length === 0) return null;

  return (
    <div className="flex flex-row gap-2">
      {links.map((singleLink, index) => {
        const Icon = getIcon(singleLink.platform.toLowerCase());
        return (
          <a
            key={index}
            href={singleLink.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              size="icon"
              variant="ghost"
              className="hover:scale-110 transition-transform hover:bg-transparent hover:border"
              style={{ color: theme?.text_color }}
            >
              {Icon}
            </Button>
          </a>
        );
      })}
    </div>
  );
};

export default SocialLinks;
