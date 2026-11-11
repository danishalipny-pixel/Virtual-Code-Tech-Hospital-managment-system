import { describe, expect, it } from "vitest";
import { buildCsvContent } from "../csv";

describe("CSV export utility", () => {
  it("formats headers, quotes commas and quotes, and guards against formula injection", () => {
    const rows = [
      { id: "PAT-1", name: 'Doe, "Jane"', note: "=SUM(A1:A2)", balance: -45 },
    ];

    const csv = buildCsvContent(rows, [
      { header: "ID", accessor: (r) => r.id },
      { header: "Name", accessor: (r) => r.name },
      { header: "Note", accessor: (r) => r.note },
      { header: "Balance", accessor: (r) => r.balance },
    ]);

    expect(csv).toBe(
      'ID,Name,Note,Balance\r\nPAT-1,"Doe, ""Jane""",\'=SUM(A1:A2),-45'
    );
  });
});
