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

const renderLocationCell = (
  type: "office" | "branch" | "warehouse",
  label: string,
  t: (key: string) => string,
) => {
  let typeLabel;
  let typeIcon;
  switch (type) {
    case "office":
      typeIcon = (
        <div title={t("Pages.Offices.title")}>
          <BuildingIcon className="!text-muted-foreground !size-3" />
        </div>
      );
      typeLabel = type ? t("Pages.Offices.title") : "";
      break;
    case "branch":
      typeIcon = (
        <div title={t("Pages.Branches.title")}>
          <StoreIcon className="!text-muted-foreground !size-3" />
        </div>
      );
      typeLabel = type ? t("Pages.Branches.title") : "";
      break;
    case "warehouse":
      typeIcon = (
        <div title={t("Pages.Warehouses.title")}>
          <WarehouseIcon className="!text-muted-foreground !size-3" />
        </div>
      );
      typeLabel = type ? t("Pages.Warehouses.title") : "";
      break;
  }
  return (
    <div className="flex flex-col">
      <span className="text- flex items-center gap-2">
        {typeIcon}
        {label}
      </span>
    </div>
  );
};

export { renderLocationOption, renderLocationCell };
