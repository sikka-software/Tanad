import { BuildingIcon, StoreIcon, WarehouseIcon } from "lucide-react";

import { MultiSelectOption } from "../ui/multi-select";

export type LocationValue = {
  id: string;
  type: "office" | "branch" | "warehouse";
};

export type LocationOption = MultiSelectOption<LocationValue> & {
  metadata: { type: LocationValue["type"] };
};

const renderLocationOption = (
  option: MultiSelectOption<LocationValue>,
  t: (key: string) => string,
) => {
  const type = (option as LocationOption).metadata?.type;
  let typeLabel;
  let typeIcon;
  switch (type) {
    case "office":
      typeIcon = <BuildingIcon className="!text-muted-foreground !size-3" />;
      typeLabel = type ? t("Pages.Offices.title") : "";
      break;
    case "branch":
      typeIcon = <StoreIcon className="!text-muted-foreground !size-3" />;
      typeLabel = type ? t("Pages.Branches.title") : "";
      break;
    case "warehouse":
      typeIcon = <WarehouseIcon className="!text-muted-foreground !size-3" />;
      typeLabel = type ? t("Pages.Warehouses.title") : "";
      break;
  }
  return (
    <div className="flex flex-col">
      <span className="text-muted-foreground flex items-center gap-2 text-xs">
        {typeIcon}
        {typeLabel}
      </span>
      <span>{option.label}</span>
    </div>
  );
};

export default renderLocationOption;
