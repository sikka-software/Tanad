import { Mail, Phone, MapPin } from "lucide-react";

import ModuleCard from "@/components/cards/module-card";

import { CommonStatus } from "@/types/common.type";
import { CommonStatusProps } from "@/types/common.type";

import { useUpdateVendor } from "@/vendor/vendor.hooks";
import useVendorStore from "@/vendor/vendor.store";
import { Vendor, VendorUpdateData } from "@/vendor/vendor.type";

const VendorCard = ({
  vendor,
  onActionClicked,
}: {
  vendor: Vendor;
  onActionClicked: (action: string, rowId: string) => void;
}) => {
  const { mutate: updateVendor } = useUpdateVendor();
  const data = useVendorStore((state) => state.data);
  const setData = useVendorStore((state) => state.setData);

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    await updateVendor({ id: rowId, data: { [columnId]: value } as VendorUpdateData });
  };

  return (
    <ModuleCard
      id={vendor.id}
      title={vendor.name}
      subtitle={vendor.company || ""}
      currentStatus={vendor.status as CommonStatusProps}
      statuses={Object.values(CommonStatus) as CommonStatusProps[]}
      onStatusChange={(status: CommonStatusProps) => handleEdit(vendor.id, "status", status)}
      onEdit={() => onActionClicked("edit", vendor.id)}
      onDelete={() => onActionClicked("delete", vendor.id)}
      onDuplicate={() => onActionClicked("duplicate", vendor.id)}
    >
      <div className="space-y-3">
        {/* Email */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Mail className="h-4 w-4" />
          <a href={`mailto:${vendor.email}`} className="hover:text-primary">
            {vendor.email}
          </a>
        </div>
        {/* Phone */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Phone className="h-4 w-4" />
          <a href={`tel:${vendor.phone}`} className="hover:text-primary">
            {vendor.phone}
          </a>
        </div>
        {/* Address */}
        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="mt-1 h-4 w-4 flex-shrink-0" />
          <div>
            <p>
              {vendor.building_number} {vendor.street_name}
            </p>
            <p>
              {vendor.city} {vendor.region} {vendor.zip_code}
            </p>
          </div>
        </div>
      </div>
    </ModuleCard>
  );
};

export default VendorCard;
