import { useTranslations } from "next-intl";

import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";

import { UserType } from "./user.type";

interface UserCardProps {
  user: UserType;
}

export default function UserCard({ user }: UserCardProps) {
  const t = useTranslations();

  return (
    <Card className="hover:bg-accent/50">
      <CardHeader>
        <CardTitle className="text-lg">{user.email}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Remove Role display as user type doesn't contain role */}
          {/* <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">{t("Users.form.role.label")}</span>
            <Badge variant="outline">{user.role}</Badge>
          </div> */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">
              {t("Users.form.created_at.label")}
            </span>
            <span className="text-sm">{new Date(user.created_at || "").toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
