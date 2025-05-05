import {
  DataSheetGrid,
  checkboxColumn,
  textColumn,
  keyColumn,
  DataSheetGridProps,
} from "react-datasheet-grid";
// Import the style only once in your app!
import "react-datasheet-grid/dist/style.css";
import { useTranslations } from "next-intl";
import { Branch } from "./branch.type";

// Infer the Operation type from the props
type OnChangeType = DataSheetGridProps<Branch>["onChange"];

interface BranchDatasheetProps {
  data: Branch[];
  onChange: OnChangeType;
}

const BranchDatasheet = ({ data, onChange }: BranchDatasheetProps) => {
  const t = useTranslations();

  // Cast onChange to the expected type by DataSheetGrid
  const handleGridChange: DataSheetGridProps["onChange"] = (value, operations) => {
    // We know the value will be Branch[], so we can cast it back if needed inside the handler
    // Or handle the logic directly in the parent component which receives Branch[]
    if (onChange) {
      onChange(value as Branch[], operations as any); // Cast operations as well for consistency, though its type might be compatible
    }
  };

  const columns = [
    { ...keyColumn("name", textColumn), title: t("Branches.form.name.label") },
    { ...keyColumn("code", textColumn), title: t("Branches.form.code.label") },
    { ...keyColumn("address", textColumn), title: t("Branches.form.address.label") },
    { ...keyColumn("city", textColumn), title: t("Branches.form.city.label") },
    { ...keyColumn("state", textColumn), title: t("Branches.form.state.label") },
    { ...keyColumn("zip_code", textColumn), title: t("Branches.form.zip_code.label") },
    { ...keyColumn("phone", textColumn), title: t("Branches.form.phone.label") },
    { ...keyColumn("email", textColumn), title: t("Branches.form.email.label") },
    { ...keyColumn("manager", textColumn), title: t("Branches.form.manager.label") },
    { ...keyColumn("is_active", checkboxColumn), title: t("Branches.form.is_active.label") },
  ];

  return (
    <div className="h-full w-full" dir="rtl">
      <DataSheetGrid value={data} onChange={handleGridChange} columns={columns} />
    </div>
  );
};

export default BranchDatasheet;
