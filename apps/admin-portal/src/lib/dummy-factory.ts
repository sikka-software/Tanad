export const generateDummySalary = () => {
  const form = (window as any).salaryForm;
  if (form) {
    // form.setValue("employee_id", "1");
    form.setValue("salary", "100000");

    form.setValue("employee_name", "John Doe");
    form.setValue("pay_period_start", "2021-01-01");
    form.setValue("pay_period_end", "2021-01-31");
    form.setValue("payment_date", "2021-01-31");
    form.setValue("amount", 10000);
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
