/** @type {import("prettier").Config} */

module.exports = {
  trailingComma: "all",
  printWidth: 100,
  importOrderSeparation: true,
  importOrder: [
    "<THIRD_PARTY_MODULES>",
    "^@sikka/(.*)$",
    "^@root/(.*)$",
    "^@utils/(.*)$",
    "^@hooks/(.*)$",
    "^@/ui/(.*)$",
    "^@/components/(.*)$",
    "^@/forms/(.*)$",
    "^@/tables/(.*)$",
    "^@/lib/(.*)$",
    "^@/services/(.*)$",
    "^@/types/(.*)$",
    "^@shared/(.*)$",
    "^@for_invoices/(.*)$",
    "^@data/(.*)$",
    "^@api/(.*)$",
    "^@tags/(.*)$",
    "^@/(.*)$",
    "^[./]",
  ],
  plugins: ["@trivago/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],
};
