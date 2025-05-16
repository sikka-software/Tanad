import { format } from "date-fns";

const TimestampCell = ({ timestamp }: { timestamp: string }) => {
  let formattedDate = timestamp;
  let formattedTime = "";
  if (timestamp) {
    try {
      const dateObj = new Date(timestamp);
      formattedDate = format(dateObj, "dd/MM/yyyy");
      formattedTime = format(dateObj, "hh:mm:ss a");
    } catch {}
  }
  return (
    <span dir="ltr" className="flex flex-col px-2 text-gray-500">
      <span className="text-xs">{formattedDate}</span>
      <span className="text-xs">{formattedTime}</span>
    </span>
  );
};

export default TimestampCell;
