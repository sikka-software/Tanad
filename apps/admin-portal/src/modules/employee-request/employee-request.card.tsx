import { useTranslations } from "next-intl";

import { Card, CardContent } from "@/components/ui/card";

import { EmployeeRequest } from "@/types/employee-request.type";

const EmployeeRequestCard = ({ employeeRequest }: { employeeRequest: EmployeeRequest }) => {
  const t = useTranslations("EmployeeRequests");
  return (
    <Card key={employeeRequest.id} className="transition-shadow hover:shadow-lg">
      <CardContent className="pt-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{employeeRequest.title}</h3>
          <div className="space-x-2">
            <span className="text-sm text-gray-500">{employeeRequest.type}</span>
            <span
              className={`inline-block rounded-full px-2 py-1 text-xs ${
                employeeRequest.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : employeeRequest.status === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
              }`}
            >
              {employeeRequest.status}
            </span>
          </div>
        </div>
        <p className="mb-2 text-sm text-gray-600">
          {employeeRequest.description || t("no_description")}
        </p>
        <div className="text-sm text-gray-500">
          <p>Employee name here</p>
          {/* <p>{t("employee_label", { name: employeeRequest.employeeName })}</p> */}
          {employeeRequest.startDate && (
            <p>
              {t("date_range", {
                start: new Date(employeeRequest.startDate).toLocaleDateString(),
                end: employeeRequest.endDate
                  ? new Date(employeeRequest.endDate).toLocaleDateString()
                  : t("not_specified"),
              })}
            </p>
          )}
          {employeeRequest.amount && (
            <p>{t("amount_label", { amount: employeeRequest.amount.toFixed(2) })}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeRequestCard;
