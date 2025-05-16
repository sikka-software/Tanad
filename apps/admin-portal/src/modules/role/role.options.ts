import { FilterableField, SortableColumn } from "@/types/common.type";

export const SORTABLE_COLUMNS: SortableColumn[] = [
  { value: "name", translationKey: "Forms.name.label" },
  { value: "description", translationKey: "Forms.description.label" },
  { value: "created_at", translationKey: "Metadata.created_at.label" },
  { value: "updated_at", translationKey: "Metadata.updated_at.label" },
];

export const FILTERABLE_FIELDS: FilterableField[] = [
  { id: "name", translationKey: "Forms.name.label", type: "text" },
  { id: "description", translationKey: "Forms.description.label", type: "text" },
  { id: "created_at", translationKey: "Metadata.created_at.label", type: "date" },
];

export const predefinedRoles = (t: (key: string) => string, role: string) => {
  let systemRoles = [
    {
      id: "superadmin",
      name: t("Roles.predefined.superadmin.title"),
      description: t("Roles.predefined.superadmin.description"),
    },
    {
      id: "it",
      name: t("Roles.predefined.it.title"),
      description: t("Roles.predefined.it.description"),
    },
    {
      id: "admin",
      name: t("Roles.predefined.admin.title"),
      description: t("Roles.predefined.admin.description"),
    },
    {
      id: "human_resources",
      name: t("Roles.predefined.human_resources.title"),
      description: t("Roles.predefined.human_resources.description"),
    },
    {
      id: "accounting",
      name: t("Roles.predefined.accounting.title"),
      description: t("Roles.predefined.accounting.description"),
    },
  ];

  return systemRoles.find((r) => r.id === role);
};
