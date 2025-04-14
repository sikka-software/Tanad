import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useTranslations } from "next-intl";
import { useClipboard } from "@/hooks/use-clipboard";
import { cn } from "@/lib/utils";
const PuklaCard = ({
  pukla,
  linkCount,
  onClick,
  isSelected,
}: {
  pukla: any;
  linkCount: number;
  onClick: () => void;
  isSelected: boolean;
}) => {
  const t = useTranslations();
  const { copy } = useClipboard();
  return (
    <Card
      key={pukla.id}
      onClick={() => onClick()}
      className={cn("cursor-pointer", isSelected && "border-2 border-black dark:border-white")}
    >
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarImage src={pukla.avatarUrl} alt={pukla.title} />
          <AvatarFallback>
            {pukla.title.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <CardTitle>{pukla.title}</CardTitle>
          <CardDescription>
            {process.env.NEXT_PUBLIC_APP_URL}/{pukla.slug}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">
          {pukla.description}
        </p>
        <div className="flex justify-between items-center">
          <Badge variant="secondary">
            {t("MyPuklas.links")} {linkCount}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {t("MyPuklas.created")}{" "}
            {new Date(pukla.created_at).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PuklaCard;
