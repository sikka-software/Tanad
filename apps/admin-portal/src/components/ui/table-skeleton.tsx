import { Skeleton } from "./skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

interface TableSkeletonProps {
  columns: string[];
  rows: number;
}

const TableSkeleton = ({ columns, rows }: TableSkeletonProps) => {
  return (
    <div className="overflow-x-auto">
      <Table className="min-w-screen w-auto">
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index} className="min-w-[90px] p-1">
                <Skeleton className="h-6 rounded-md w-full min-w-[90px]" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((_, colIndex) => (
                <TableCell key={colIndex} className="min-w-[90px] p-1">
                  <Skeleton className="h-7 rounded-md w-full min-w-[90px]" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableSkeleton;
