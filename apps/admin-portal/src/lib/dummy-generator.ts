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

  return {
    name: fakeNames[Math.floor(Math.random() * fakeNames.length)],
    description: fakeDescriptions[Math.floor(Math.random() * fakeDescriptions.length)],
    email: fakeEmails[Math.floor(Math.random() * fakeEmails.length)],
    phone: fakeNumbers[Math.floor(Math.random() * fakeNumbers.length)],
    company: fakeCompanies[Math.floor(Math.random() * fakeCompanies.length)],
    address: fakeAddresses[Math.floor(Math.random() * fakeAddresses.length)],
    city: fakeCities[Math.floor(Math.random() * fakeCities.length)],
    state: fakeStates[Math.floor(Math.random() * fakeStates.length)],
    zipCode: fakeZipCodes[Math.floor(Math.random() * fakeZipCodes.length)],
    locations: fakeLocations[Math.floor(Math.random() * fakeLocations.length)],
  };
};
