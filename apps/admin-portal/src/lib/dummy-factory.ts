import { parseDate } from "@internationalized/date";

import { E_COMMERCE_PLATFORMS, SERVER_OS, SERVER_PROVIDERS } from "./constants";
import { generateDummyData } from "./dummy-generator";

export const generateDummySalary = () => {
  const dummyData = generateDummyData();
  const form = (window as any).salaryForm;
  if (form) {
    form.setValue("amount", dummyData.randomNumber(5));
    form.setValue("start_date", dummyData.randomParsedDate());
    form.setValue("end_date", dummyData.randomParsedDate());
    form.setValue("payment_date", dummyData.randomParsedDate());
    form.setValue("payment_frequency", dummyData.randomPicker(["monthly", "weekly", "daily"]));
    form.setValue("currency", dummyData.randomPicker(["USD", "EUR", "GBP", "CAD", "AUD"]));
    form.setValue("notes", dummyData.randomString);
  }
};

export const generateDummyWarehouse = () => {
  const form = (window as any).warehouseForm;
  if (form) {
    // code randomly
    form.setValue("code", "WR-" + Math.random().toString(36).substring(2, 5).toUpperCase());
    form.setValue("name", "Warehouse 1");
    form.setValue("address", "123 Main St");
    form.setValue("city", "Anytown");
    form.setValue("state", "CA");
    form.setValue("zip_code", "12345");
    form.setValue("phone", "123-456-7890");
    form.setValue("email", "warehouse@example.com");
    form.setValue("notes", "This is a dummy warehouse");
  }
};

export const generateDummyPurchase = () => {
  const dummyData = generateDummyData();
  const form = (window as any).purchaseForm;
  if (form) {
    form.setValue("purchase_number", dummyData.randomString);
    form.setValue("description", dummyData.randomString);
    form.setValue("amount", dummyData.randomNumber(4));
    form.setValue("category", dummyData.randomString);
    form.setValue("status", dummyData.randomPicker(["draft"]));
    form.setValue("issue_date", String(dummyData.randomDate));
    form.setValue("due_date", String(dummyData.randomDate));
    form.setValue("incurred_at", String(dummyData.randomDate));
  }
};

export const generateDummyServer = () => {
  const dummyData = generateDummyData();
  const form = (window as any).serverForm;
  if (form) {
    form.setValue("name", dummyData.full_name);
    form.setValue("ip_address", dummyData.random_ip_address);
    form.setValue("location", dummyData.locations);
    form.setValue("provider", dummyData.randomPicker(SERVER_PROVIDERS).value);
    form.setValue("os", dummyData.randomPicker(SERVER_OS).value);
    form.setValue("notes", dummyData.randomString);
  }
};

export const generateDummyTruck = () => {
  const dummyData = generateDummyData();
  const form = (window as any).truckForm;
  if (form) {
    form.setValue("name", dummyData.first_name);
    form.setValue("make", dummyData.last_name);
    form.setValue("model", dummyData.email);
    form.setValue("year", dummyData.randomNumber(4));
    form.setValue("color", dummyData.randomString);
    form.setValue("vin", dummyData.randomString);
    form.setValue("code", dummyData.randomString);
    form.setValue("license_country", dummyData.randomString);
    form.setValue("license_plate", dummyData.randomString);
    form.setValue("notes", dummyData.state);
  }
};

export const generateDummyUser = () => {
  const dummyData = generateDummyData();
  const form = (window as any).userForm;
  if (form) {
    form.setValue("email", dummyData.email);
    form.setValue("first_name", dummyData.first_name);
    form.setValue("last_name", dummyData.last_name);
    form.setValue("password", "password123");
    form.setValue("role", "viewer");
  }
};

export const generateDummyVendor = () => {
  const dummyData = generateDummyData();
  const form = (window as any).vendorForm;
  if (form) {
    form.setValue("name", dummyData.full_name);
    form.setValue("email", dummyData.email);
    form.setValue("phone", dummyData.phone);
    form.setValue("address", dummyData.address);
    form.setValue("city", dummyData.city);
    form.setValue("state", dummyData.state);
    form.setValue("zip_code", dummyData.zip_code);
  }
};

export const generateDummyDepartment = () => {
  const dummyData = generateDummyData();
  const form = (window as any).departmentForm;
  if (form) {
    form.setValue("name", dummyData.job_department);
    form.setValue("description", dummyData.description);
  }
};
export const generateDummyWebsite = () => {
  const dummyData = generateDummyData();
  const form = (window as any).websiteForm;
  if (form) {
    const randomSuffix = Math.random().toString(36).substr(2, 6);
    form.setValue("domain_name", `example-${randomSuffix}.com`);
    form.setValue("status", dummyData.randomPicker(["active", "inactive"]));
    form.setValue(
      "notes",
      "This is a test website generated on " + new Date().toLocaleDateString(),
    );
  }
};

export const generateDummyBranch = () => {
  const dummyData = generateDummyData();
  const form = (window as any).branchForm;
  if (form) {
    form.setValue("name", dummyData.full_name);
    form.setValue("code", "BR-" + Math.random().toString(36).substr(2, 6));
    form.setValue("email", dummyData.email);
    form.setValue("phone", dummyData.phone);
    form.setValue("address", dummyData.address);
    form.setValue("city", dummyData.city);
    form.setValue("state", dummyData.state);
    form.setValue("zip_code", dummyData.zip_code);
    form.setValue("status", dummyData.randomPicker(["active", "inactive"]));
    form.setValue("notes", "Test branch notes");
  }
};

export const generateDummyCar = () => {
  const dummyData = generateDummyData();
  const form = (window as any).carForm;
  if (form) {
    form.setValue("name", dummyData.first_name);
    form.setValue("make", dummyData.last_name);
    form.setValue("model", dummyData.email);
    form.setValue("year", dummyData.randomNumber(4));
    form.setValue("color", dummyData.randomString);
    form.setValue("vin", dummyData.randomNumber(17));
    form.setValue("code", dummyData.randomNumber(3));
    form.setValue("license_country", dummyData.randomString);
    form.setValue("license_plate", dummyData.randomString);
    form.setValue("notes", dummyData.state);
  }
};

export const generateDummyClient = () => {
  const dummyData = generateDummyData();
  const form = (window as any).clientForm;
  if (form) {
    form.setValue("name", dummyData.full_name);
    form.setValue("email", dummyData.email);
    form.setValue("phone", dummyData.phone);
    form.setValue("address", dummyData.address);
    form.setValue("city", dummyData.city);
    form.setValue("state", dummyData.state);
    form.setValue("zip_code", dummyData.zip_code);
  }
};

export const generateDummyCompany = () => {
  const dummyData = generateDummyData();
  const form = (window as any).companyForm;
  if (form) {
    form.setValue("name", dummyData.full_name);
    form.setValue("email", dummyData.email);
    form.setValue("phone", dummyData.phone);
    form.setValue("street_name", dummyData.address);
    form.setValue("city", dummyData.city);
    form.setValue("region", "Eastern");
    form.setValue("zip_code", String(dummyData.zip_code));
    form.setValue("building_number", String(dummyData.randomNumber(5)));
    form.setValue("additional_number", String(dummyData.randomNumber(5)));
    form.setValue("industry", dummyData.randomString);
    form.setValue("size", String(dummyData.randomNumber(3)));
  }
};

export const generateDummyDomain = () => {
  const dummyData = generateDummyData();
  const form = (window as any).domainForm;
  if (form) {
    form.setValue("domain_name", dummyData.first_name.toLowerCase() + ".com");
    form.setValue("registrar", dummyData.email);
    form.setValue("monthly_payment", dummyData.randomNumber(3));
    form.setValue("annual_payment", dummyData.randomNumber(3));
    form.setValue("payment_cycle", dummyData.randomPicker(["monthly", "annual"]));
    form.setValue("status", dummyData.randomPicker(["active", "inactive"]));
    form.setValue("notes", dummyData.state);
  }
};

export const generateDummyEmployee = () => {
  const dummyData = generateDummyData();
  const form = (window as any).employeeForm;
  if (form) {
    form.setValue("first_name", dummyData.first_name);
    form.setValue("last_name", dummyData.last_name);
    form.setValue("email", dummyData.randomNumber(3) + dummyData.email);
    form.setValue("phone", dummyData.phone);
    form.setValue("position", dummyData.employee_position);
    form.setValue("status", dummyData.employee_status);
    form.setValue("national_id", dummyData.employee_notes);
  }
};

export const generateDummyExpense = () => {
  const dummyData = generateDummyData();
  const form = (window as any).expenseForm;
  if (form) {
    form.setValue("expense_number", dummyData.stringNumber);
    // form.setValue("issue_date", dummyData.randomDate);
    // form.setValue("due_date", dummyData.randomDate);
    form.setValue("amount", dummyData.randomNumber(4));
    form.setValue("category", dummyData.expense_category);
    form.setValue("notes", dummyData.randomString);
    form.setValue("status", dummyData.pick(["pending", "paid", "overdue"]));
  }
};

export const generateDummyJob = () => {
  const dummyData = generateDummyData();
  const form = (window as any).jobForm;
  if (form) {
    form.setValue("title", dummyData.job_title);
    form.setValue("description", dummyData.job_description);
    form.setValue("requirements", dummyData.requirements);
    form.setValue("location", dummyData.job_location);
    form.setValue("department", dummyData.job_department);
    form.setValue(
      "type",
      dummyData.randomPicker(["full_time", "part_time", "contract", "internship", "temporary"]),
    );
    form.setValue("salary", dummyData.job_salary);
    form.setValue("status", dummyData.randomPicker(["active", "inactive"]));
    // form.setValue("start_date", dummyData.job_start_date);
    // form.setValue("end_date", dummyData.job_end_date);
  }
};

export const generateDummyOffice = () => {
  const dummyData = generateDummyData();
  const form = (window as any).officeForm;
  if (form) {
    form.setValue("name", "Office " + dummyData.randomNumber(5));
    form.setValue("email", dummyData.email);
    form.setValue("phone", dummyData.phone);
    form.setValue("building_number", String(dummyData.address));
    form.setValue("street_name", dummyData.city);
    form.setValue("city", dummyData.state);
    form.setValue("zip_code", String(dummyData.zip_code));
    form.setValue("status", dummyData.randomPicker(["active", "inactive"]));
  }
};

export const generateDummyOnlineStore = () => {
  const dummyData = generateDummyData();
  const form = (window as any).onlineStoreForm;
  if (form) {
    let dd = dummyData.randomPicker(E_COMMERCE_PLATFORMS);
    form.setValue("domain_name", dummyData.first_name.toLowerCase() + ".com");
    form.setValue("status", dummyData.randomPicker(["active", "inactive"]));
    form.setValue("platform", dd.value);
    form.setValue("notes", dummyData.state);
  }
};

export const generateDummyProduct = () => {
  const dummyData = generateDummyData();
  const form = (window as any).productForm;
  if (form) {
    form.setValue("name", `Product ${dummyData.randomNumber(3)}`);
    form.setValue("description", dummyData.randomString);
    form.setValue("price", String(dummyData.randomNumber(4)));
    form.setValue("sku", dummyData.randomString);
    form.setValue("stock_quantity", String(dummyData.randomNumber(3)));
  }
};
