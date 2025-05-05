import { useState } from "react";
import { DataSheetGrid, checkboxColumn, textColumn, keyColumn } from "react-datasheet-grid";
// Import the style only once in your app!
import "react-datasheet-grid/dist/style.css";
import { useTranslations } from "next-intl";

const BranchDatasheet = () => {
  const [data, setData] = useState([
    // Sample data - needs to be updated to match Branch type
    {
      name: "Main Branch",
      code: "MB001",
      address: "123 Main St",
      city: "Anytown",
      state: "CA",
      zip_code: "90210",
      phone: "555-1234",
      email: "main@example.com",
      manager: "John Doe",
      is_active: true,
    },
    {
      name: "Downtown Branch",
      code: "DB002",
      address: "456 Oak Ave",
      city: "Metropolis",
      state: "NY",
      zip_code: "10001",
      phone: null,
      email: null,
      manager: "Jane Smith",
      is_active: false,
    },
  ]);
  const t = useTranslations();

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
      <DataSheetGrid
        value={data}
        // onChange={setData} // Consider implementing a proper onChange handler
        onChange={() => {
          console.log("changed");
        }}
        columns={columns}
      />
    </div>
  );
};

export default BranchDatasheet;
