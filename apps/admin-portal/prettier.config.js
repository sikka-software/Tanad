/** @type {import("prettier").Config} */
const TanadModulesDirectories = require("./tanad.dev.js");

module.exports = {
  trailingComma: "all",
  printWidth: 100,
  importOrderSeparation: true,
  importOrder: [
    "<THIRD_PARTY_MODULES>",
    "^@sikka/(.*)$",
    "^@/ui/(.*)$",
    "^@/root/(.*)$",
    "^@/utils/(.*)$",
    "^@/hooks/(.*)$",
    "^@/components/(.*)$",
    "^@/forms/(.*)$",
    "^@/tables/(.*)$",
    "^@/lib/(.*)$",
    "^@/services/(.*)$",
    "^@/types/(.*)$",
    "^@/shared/(.*)$",
    "^@/for_invoices/(.*)$",
    "^@/data/(.*)$",
    "^@/api/(.*)$",
    "^@/tags/(.*)$",
    ...TanadModulesDirectories.map((module) => `^@/${module}/(.*)$`),
    "^@/(.*)$",
    "^[./]",
  ],
  plugins: ["@trivago/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],
};
