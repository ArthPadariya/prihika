import type React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/admin/EmptyState";

export interface AdminColumn<TData> {
  header: string;
  cell: (row: TData) => React.ReactNode;
  className?: string;
}

export function DataTable<TData>({
  data,
  columns,
  emptyTitle = "No records yet",
  emptyDescription = "Create your first entry to see it here.",
}: {
  data: TData[];
  columns: AdminColumn<TData>[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (!data.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-black/20">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            {columns.map((column) => (
              <TableHead key={column.header} className={`px-4 py-3 text-xs uppercase tracking-[0.18em] text-[#d7b46a]/75 ${column.className ?? ""}`}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="border-white/10 hover:bg-white/[0.04]">
              {columns.map((column) => (
                <TableCell key={column.header} className={`px-4 py-4 text-[#f6ead0]/78 ${column.className ?? ""}`}>
                  {column.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
