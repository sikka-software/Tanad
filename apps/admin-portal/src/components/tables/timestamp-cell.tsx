import { format } from "date-fns";

import { useFormatDate } from "@/utils/date-utils";

const TimestampCell = ({ timestamp }: { timestamp: string }) => {
  const formattedDate = useFormatDate(timestamp);
  let formattedTime = "";
  if (timestamp) {
    try {
      const dateObj = new Date(timestamp);
      formattedTime = format(dateObj, "hh:mm:ss a");
    } catch (error) {
      console.error("Error formatting time in TimestampCell:", error);
      formattedTime = "Invalid time";
    }
  }
  return (
    <span dir="ltr" className="flex flex-col px-2 text-gray-500">
      <span className="text-xs">{formattedDate}</span>
      <span className="text-xs">{formattedTime}</span>
    </span>
  );
};

export default TimestampCell;
