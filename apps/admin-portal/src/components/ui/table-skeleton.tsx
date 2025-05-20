import { Skeleton } from "./skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

interface TableSkeletonProps {
  columns: string[];
  rows: number;
}

const TableSkeleton = ({ columns, rows }: TableSkeletonProps) => {
  return (
    <Table className="overflow-y-auto">
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => (
            <TableHead key={index} className="min-w-[40px]">
              <Skeleton className="h-4 w-full min-w-[40px]" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {columns.map((_, colIndex) => (
              <TableCell key={colIndex} className="min-w-[40px]">
                <Skeleton className="h-4 w-full min-w-[40px]" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TableSkeleton;
