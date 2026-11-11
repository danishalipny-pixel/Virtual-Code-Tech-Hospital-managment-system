import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../Button";
import { Badge } from "../Badge";
import { ConfirmDialog } from "../ConfirmDialog";
import { DataTable, Pagination } from "../Table";

describe("Reusable UI components", () => {
  it("renders Button variants and triggers click handler", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button variant="primary" onClick={onClick}>
        Save Patient
      </Button>
    );

    const btn = screen.getByRole("button", { name: "Save Patient" });
    await user.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders status Badge cleanly", () => {
    render(<Badge status="Confirmed">Confirmed</Badge>);
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
  });

  it("renders DataTable empty state and Pagination interactions", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <>
        <DataTable
          columns={[{ key: "name", header: "Name", render: (r: { name: string }) => r.name }]}
          data={[]}
          rowKey={(r) => r.name}
          emptyTitle="No matching patients"
        />
        <Pagination
          currentPage={1}
          totalPages={3}
          totalItems={20}
          pageSize={7}
          onPageChange={onPageChange}
        />
      </>
    );

    expect(screen.getByText("No matching patients")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("confirms and closes ConfirmDialog", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    render(
      <ConfirmDialog
        open
        onClose={onClose}
        onConfirm={onConfirm}
        title="Delete Record?"
        message="This cannot be undone."
        confirmLabel="Delete"
      />
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
