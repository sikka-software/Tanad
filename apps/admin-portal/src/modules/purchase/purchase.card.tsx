import { Mail, MapPin, Phone, User } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader } from "@/ui/card";

import { Purchase } from "@/purchase/purchase.type";

const PurchaseCard = ({ purchase }: { purchase: Purchase }) => {
  const t = useTranslations("Purchases");
  return (
    <Card key={purchase.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{purchase.description}</h3>
            <p className="text-sm text-gray-500">Code: {purchase.purchase_number}</p>
          </div>
          <Badge variant={purchase.status ? "default" : "secondary"}>
            {t(`status.${purchase.status}`)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Amount: {purchase.amount}</p>
          <p className="text-sm text-gray-500">Category: {purchase.category}</p>
          <p className="text-sm text-gray-500">Due Date: {purchase.due_date}</p>
          <p className="text-sm text-gray-500">Notes: {purchase.notes}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PurchaseCard;
