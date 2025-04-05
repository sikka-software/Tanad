/** @type {import("prettier").Config} */

module.exports = {
  trailingComma: "all",
  printWidth: 100,
  importOrderSeparation: true,
  importOrder: [
    "^react(?!-dom$)",
    "^next(?!-dom$)",
    "<THIRD_PARTY_MODULES>",
    "^@sikka/(.*)$",
    "^@root/(.*)$",
    "^@utils/(.*)$",
    "^@hooks/(.*)$",
    "^@components/(.*)$",
    "^@shared/(.*)$",
    "^@for_invoices/(.*)$",
    "^@data/(.*)$",
    "^@api/(.*)$",
    "^@tags/(.*)$",
    "^@/(.*)$",
    "^[./]",
  ],
  plugins: [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
};
