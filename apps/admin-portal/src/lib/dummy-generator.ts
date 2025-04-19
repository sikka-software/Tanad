// This will generate fake emails, fake names, fake numbers etc

export const generateDummyData = () => {
  const fakeNames = ["John", "Jane", "Jim", "Jill", "Jack", "Jill", "Jim", "Jill", "Jim", "Jill"];
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
  const fakeJobStartDate = ["2021-01-01", "2021-02-01", "2021-03-01", "2021-04-01", "2021-05-01"];
  const fakeJobEndDate = ["2021-01-01", "2021-02-01", "2021-03-01", "2021-04-01", "2021-05-01"];

  return {
    job_location: fakeJobLocations[Math.floor(Math.random() * fakeJobLocations.length)],
    job_department: fakeJobDepartments[Math.floor(Math.random() * fakeJobDepartments.length)],
    job_type: fakeJobTypes[Math.floor(Math.random() * fakeJobTypes.length)],
    job_salary: fakeJobSalaries[Math.floor(Math.random() * fakeJobSalaries.length)],
    job_is_active: fakeJobIsActive[Math.floor(Math.random() * fakeJobIsActive.length)],
    job_start_date: fakeJobStartDate[Math.floor(Math.random() * fakeJobStartDate.length)],
    job_end_date: fakeJobEndDate[Math.floor(Math.random() * fakeJobEndDate.length)],
    job_title: fakeJobTitles[Math.floor(Math.random() * fakeJobTitles.length)],
    job_description: fakeJobDescriptions[Math.floor(Math.random() * fakeJobDescriptions.length)],
    requirements: fakeJobRequirements[Math.floor(Math.random() * fakeJobRequirements.length)],
    name: fakeNames[Math.floor(Math.random() * fakeNames.length)],
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
