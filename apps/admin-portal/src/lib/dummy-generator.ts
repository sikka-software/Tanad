// This will generate fake emails, fake names, fake numbers etc
import { parseDate } from "@internationalized/date";

const fakeFirstNames = [
  "Michael",
  "Jennifer",
  "Christopher",
  "Linda",
  "David",
  "Susan",
  "James",
  "Patricia",
  "Robert",
  "Elizabeth",
  "William",
  "Jessica",
  "Richard",
  "Sarah",
  "Joseph",
  "Karen",
  "Thomas",
  "Nancy",
  "Charles",
  "Lisa",
  "Daniel",
  "Betty",
  "Matthew",
  "Dorothy",
  "Anthony",
  "Sandra",
  "Mark",
  "Ashley",
  "Donald",
  "Kimberly",
  "Steven",
  "Donna",
  "Paul",
  "Emily",
  "Andrew",
  "Carol",
  "Joshua",
  "Michelle",
  "Kevin",
  "Amanda",
  "Brian",
  "Melissa",
  "George",
  "Deborah",
  "Edward",
  "Stephanie",
  "Ronald",
  "Rebecca",
  "Timothy",
  "Laura",
  "Jason",
  "Sharon",
  "Jeffrey",
  "Cynthia",
  "Ryan",
  "Kathleen",
  "Jacob",
  "Amy",
  "Gary",
  "Shirley",
  "Nicholas",
  "Angela",
  "Eric",
  "Helen",
  "Jonathan",
  "Anna",
  "Stephen",
  "Brenda",
  "Larry",
  "Pamela",
  "Justin",
  "Nicole",
  "Scott",
  "Emma",
  "Brandon",
  "Samantha",
  "Benjamin",
  "Katherine",
  "Samuel",
  "Christine",
  "Gregory",
  "Debra",
  "Frank",
  "Rachel",
  "Alexander",
  "Catherine",
  "Raymond",
  "Carolyn",
  "Patrick",
  "Janet",
  "Jack",
  "Ruth",
  "Dennis",
  "Maria",
  "Jerry",
  "Heather",
  "Tyler",
  "Diane",
  "Aaron",
  "Virginia",
  "Jose",
  "Julie",
  "Adam",
  "Joyce",
  "Henry",
  "Victoria",
  "Nathan",
  "Olivia",
  "Douglas",
  "Kelly",
  "Zachary",
  "Christina",
  "Peter",
  "Lauren",
  "Kyle",
  "Joan",
  "Walter",
  "Evelyn",
  "Ethan",
  "Judith",
  "Jeremy",
  "Megan",
  "Harold",
  "Cheryl",
  "Keith",
  "Andrea",
  "Christian",
  "Hannah",
  "Roger",
  "Martha",
  "Noah",
  "Jacqueline",
  "Gerald",
  "Frances",
  "Carl",
  "Gloria",
  "Terry",
  "Ann",
  "Sean",
  "Teresa",
  "Austin",
  "Kathryn",
  "Arthur",
  "Sara",
  "Lawrence",
  "Janice",
  "Jesse",
  "Jean",
  "Dylan",
  "Alice",
  "Bryan",
  "Madison",
  "Joe",
  "Doris",
  "Jordan",
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
const fakeCarMakers = ["Toyota", "Ford", "Chevrolet", "Honda", "Nissan"];
const fakeCarModels = ["Camry", "F-150", "Silverado", "Civic", "Altima"];
const fakeCarYears = ["2020", "2021", "2022", "2023", "2024"];
const fakeCarColors = ["Red", "Blue", "Green", "Yellow", "Black"];
const fakeCarPrices = ["10000", "20000", "30000", "40000", "50000"];
const fakeCarPlates = ["ABC123", "DEF456", "GHI789", "JKL012", "MNO345"];

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
const fakeJobTypes = ["full_time", "part_time", "contract", "temporary"];
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

const fakeExpenseCategories = ["Office Supplies", "Marketing", "HR", "IT", "Finance"];
export const generateDummyData = () => {
  const generateRandomDate = () => {
    const start_date = new Date("2021-01-01");
    const end_date = new Date();
    return new Date(
      start_date.getTime() + Math.random() * (end_date.getTime() - start_date.getTime()),
    );
  };
  const randomPicker = (array: any[]) => array[Math.floor(Math.random() * array.length)];
  const randomParsedDate = () => {
    const year = Math.floor(Math.random() * (2030 - 2000 + 1)) + 2000;
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
    return parseDate(`${year}-${month}-${day}`);
  };
  return {
    randomParsedDate,
    randomPicker,
    random_ip_address:
      Math.floor(Math.random() * 255) +
      "." +
      Math.floor(Math.random() * 255) +
      "." +
      Math.floor(Math.random() * 255) +
      "." +
      Math.floor(Math.random() * 255),
    pick: (array: any[]) => array[Math.floor(Math.random() * array.length)],
    stringNumber: String(Math.random().toString(36).substring(2, 15)),

    expense_category:
      fakeExpenseCategories[Math.floor(Math.random() * fakeExpenseCategories.length)],

    randomString: Math.random().toString(36).substring(2, 15),
    randomStringLength: (length: number = 10) => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let result = "";
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    },

    randomNumber: (length: number) => Math.floor(Math.random() * 10 ** length),
    randomDate: generateRandomDate(),

    employee_status: randomPicker(fakeEmployeeStatus),
    employee_department: randomPicker(fakeEmployeeDepartments),
    employee_position: randomPicker(fakeEmployeePositions),
    employee_hire_date: generateRandomDate(),
    employee_salary: randomPicker(fakeEmployeeSalaries),
    employee_notes: randomPicker(fakeEmployeeNotes),
    job_location: randomPicker(fakeJobLocations),
    job_department: randomPicker(fakeJobDepartments),
    job_type: randomPicker(fakeJobTypes),
    job_salary: randomPicker(fakeJobSalaries),
    job_is_active: randomPicker(fakeJobIsActive),
    job_start_date: generateRandomDate(),
    job_end_date: generateRandomDate(),
    job_title: randomPicker(fakeJobTitles),
    job_description: randomPicker(fakeJobDescriptions),
    requirements: randomPicker(fakeJobRequirements),
    first_name: randomPicker(fakeFirstNames),
    last_name: randomPicker(fakeLastNames),
    full_name: `${randomPicker(fakeFirstNames)} ${randomPicker(fakeLastNames)}`,
    description: randomPicker(fakeDescriptions),
    email: randomPicker(fakeEmails),
    phone: randomPicker(fakeNumbers),
    company: randomPicker(fakeCompanies),
    address: randomPicker(fakeAddresses),
    city: randomPicker(fakeCities),
    state: randomPicker(fakeStates),
    zip_code: randomPicker(fakeZipCodes),
    locations: randomPicker(fakeLocations),
    car_maker: randomPicker(fakeCarMakers),
    car_model: randomPicker(fakeCarModels),
    car_year: randomPicker(fakeCarYears),
    car_color: randomPicker(fakeCarColors),
    car_price: randomPicker(fakeCarPrices),
    car_plate: randomPicker(fakeCarPlates),
  };
};
