/**
 * RFC-4180 compliant CSV serialization and browser download helper.
 */

export interface CsvColumn<T> {
  header: string;
  accessor: (row: T) => string | number | boolean | null | undefined;
}

function escapeCsvCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Mitigate spreadsheet formula injection while keeping regular negative numbers intact
  const sanitized = /^[=+\-@]/.test(str) && !/^-\d+(\.\d+)?$/.test(str)
    ? `'${str}`
    : str;
  if (/[",\r\n]/.test(sanitized)) {
    return `"${sanitized.replace(/"/g, '""')}"`;
  }
  return sanitized;
}

export function buildCsvContent<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const headerLine = columns.map((col) => escapeCsvCell(col.header)).join(",");
  const dataLines = rows.map((row) =>
    columns.map((col) => escapeCsvCell(col.accessor(row))).join(",")
  );
  return [headerLine, ...dataLines].join("\r\n");
}

export function downloadCsv<T>(
  filename: string,
  rows: T[],
  columns: CsvColumn<T>[]
): void {
  const csv = buildCsvContent(rows, columns);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
