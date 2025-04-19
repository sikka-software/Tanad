// This will generate fake emails, fake names, fake numbers etc

export const generateDummyData = () => {
  const fakeFirstNames = [
    "John",
    "Jane",
    "Jim",
    "Jill",
    "Jack",
    "Jill",
    "Jim",
    "Jill",
    "Jim",
    "Jill",
  ];
  const fakeLastNames = [
    "Doe",
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
  ];
  const fakeEmails = [
    "john@example.com",
    "jane@example.com",
    "jim@example.com",
    "jill@example.com",
    "jack@example.com",
  ];
  const fakeNumbers = ["1234567890", "0987654321", "1234567890", "0987654321", "1234567890"];
  const fakeCompanies = ["Company 1", "Company 2", "Company 3", "Company 4", "Company 5"];
  const fakeAddresses = [
    "1234 Dummy St",
    "5678 Fake Ave",
    "9012 Main St",
    "3456 Maple Rd",
    "7890 Oak Blvd",
  ];
  const fakeCities = ["New York", "Los Angeles", "Chicago", "Houston", "Miami"];
  const fakeStates = ["NY", "CA", "IL", "TX", "FL"];
  const fakeZipCodes = ["10001", "90038", "60601", "77001", "33131"];
  const fakeDescriptions = [
    "Description 1",
    "Description 2",
    "Description 3",
    "Description 4",
    "Description 5",
  ];
  const fakeLocations = ["Office", "Branch", "Warehouse"];

  const fakeJobTitles = [
    "Software Engineer",
    "Product Manager",
    "Sales Manager",
    "Marketing Manager",
    "HR Manager",
  ];
  const fakeJobDescriptions = [
    "Description 1",
    "Description 2",
    "Description 3",
    "Description 4",
    "Description 5",
  ];
  const fakeJobRequirements = [
    "Requirement 1",
    "Requirement 2",
    "Requirement 3",
    "Requirement 4",
    "Requirement 5",
  ];

  const fakeJobLocations = ["Office", "Branch", "Warehouse"];
  const fakeJobDepartments = ["Sales", "Marketing", "HR", "IT", "Finance"];
  const fakeJobTypes = ["Full-Time", "Part-Time", "Contract", "Temporary"];
  const fakeJobSalaries = ["100000", "50000", "75000", "120000", "80000"];
  const fakeJobIsActive = [true, false];

  const fakeEmployeeStatus = ["active", "inactive", "on_leave", "terminated"];
  const fakeEmployeeDepartments = ["Sales", "Marketing", "HR", "IT", "Finance"];
  const fakeEmployeePositions = [
    "Software Engineer",
    "Product Manager",
    "Sales Manager",
    "Marketing Manager",
    "HR Manager",
  ];

  const fakeEmployeeSalaries = ["100000", "50000", "75000", "120000", "80000"];
  const fakeEmployeeNotes = ["Note 1", "Note 2", "Note 3", "Note 4", "Note 5"];

  const generateRandomDate = () => {
    const startDate = new Date("2021-01-01");
    const endDate = new Date();
    return new Date(
      startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()),
    );
  };

  return {
    employee_status: fakeEmployeeStatus[Math.floor(Math.random() * fakeEmployeeStatus.length)],
    employee_department:
      fakeEmployeeDepartments[Math.floor(Math.random() * fakeEmployeeDepartments.length)],
    employee_position:
      fakeEmployeePositions[Math.floor(Math.random() * fakeEmployeePositions.length)],
    employee_hire_date: generateRandomDate(),
    employee_salary: fakeEmployeeSalaries[Math.floor(Math.random() * fakeEmployeeSalaries.length)],
    employee_notes: fakeEmployeeNotes[Math.floor(Math.random() * fakeEmployeeNotes.length)],
    job_location: fakeJobLocations[Math.floor(Math.random() * fakeJobLocations.length)],
    job_department: fakeJobDepartments[Math.floor(Math.random() * fakeJobDepartments.length)],
    job_type: fakeJobTypes[Math.floor(Math.random() * fakeJobTypes.length)],
    job_salary: fakeJobSalaries[Math.floor(Math.random() * fakeJobSalaries.length)],
    job_is_active: fakeJobIsActive[Math.floor(Math.random() * fakeJobIsActive.length)],
    job_start_date: generateRandomDate(),
    job_end_date: generateRandomDate(),
    job_title: fakeJobTitles[Math.floor(Math.random() * fakeJobTitles.length)],
    job_description: fakeJobDescriptions[Math.floor(Math.random() * fakeJobDescriptions.length)],
    requirements: fakeJobRequirements[Math.floor(Math.random() * fakeJobRequirements.length)],
    first_name: fakeFirstNames[Math.floor(Math.random() * fakeFirstNames.length)],
    last_name: fakeLastNames[Math.floor(Math.random() * fakeLastNames.length)],
    full_name: `${fakeFirstNames[Math.floor(Math.random() * fakeFirstNames.length)]} ${fakeLastNames[Math.floor(Math.random() * fakeLastNames.length)]}`,
    description: fakeDescriptions[Math.floor(Math.random() * fakeDescriptions.length)],
    email: fakeEmails[Math.floor(Math.random() * fakeEmails.length)],
    phone: fakeNumbers[Math.floor(Math.random() * fakeNumbers.length)],
    company: fakeCompanies[Math.floor(Math.random() * fakeCompanies.length)],
    address: fakeAddresses[Math.floor(Math.random() * fakeAddresses.length)],
    city: fakeCities[Math.floor(Math.random() * fakeCities.length)],
    state: fakeStates[Math.floor(Math.random() * fakeStates.length)],
    zip_code: fakeZipCodes[Math.floor(Math.random() * fakeZipCodes.length)],
    locations: fakeLocations[Math.floor(Math.random() * fakeLocations.length)],
  };
};
