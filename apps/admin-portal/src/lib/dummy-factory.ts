import { parseDate } from "@internationalized/date";

export const generateDummySalary = () => {
  const form = (window as any).salaryForm;
  if (form) {
    // Use a real employee_id from the db
    form.setValue("employee_id", "19070611-efa8-42ae-aa69-6b8a602cdd6d");
    form.setValue("amount", 10000);
    form.setValue("start_date", parseDate("2024-01-01"));
    form.setValue("end_date", parseDate("2024-01-31"));
    form.setValue("payment_date", parseDate("2024-02-01"));
    form.setValue("payment_frequency", "monthly");
    form.setValue("currency", "sar");
    // Deductions intentionally ignored as per instructions
  }
};

export const generateDummyEmployee = () => {
  const form = (window as any).employeeForm;
  if (form) {
    form.setValue("first_name", "John");
    form.setValue("last_name", "Doe");
    form.setValue("email", "john.doe@example.com");
    form.setValue("phone", "1234567890");
    form.setValue("position", "Software Engineer");
    form.setValue("hire_date", new Date());
    form.setValue("salary", "100000");
    form.setValue("status", "active");
    form.setValue("notes", "This is a note");
  }
};
