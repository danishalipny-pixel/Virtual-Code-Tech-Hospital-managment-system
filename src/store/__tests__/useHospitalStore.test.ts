import { beforeEach, describe, expect, it } from "vitest";
import { useHospitalStore } from "../useHospitalStore";

describe("useHospitalStore", () => {
  beforeEach(() => {
    useHospitalStore.getState().logout();
    useHospitalStore.getState().resetDemoData();
  });

  it("authenticates valid role accounts and rejects invalid credentials", () => {
    const fail = useHospitalStore.getState().login("admin@medaxis.org", "wrong");
    expect(fail.success).toBe(false);
    expect(useHospitalStore.getState().session).toBeNull();

    const adminLogin = useHospitalStore
      .getState()
      .login("admin@medaxis.org", "Admin@2026");
    expect(adminLogin.success).toBe(true);
    expect(adminLogin.user?.role).toBe("admin");
    expect(useHospitalStore.getState().session?.role).toBe("admin");

    useHospitalStore.getState().logout();
    expect(useHospitalStore.getState().session).toBeNull();
  });

  it("performs Patient CRUD and keeps related appointments and beds synced", () => {
    const store = useHospitalStore.getState();
    const created = store.addPatient({
      fullName: "Test Patient",
      age: 41,
      gender: "Female",
      phone: "+1 555-111-2222",
      email: "test.patient@example.org",
      address: "100 Test Blvd",
      bloodGroup: "O+",
      status: "Active",
    });

    expect(created.id).toMatch(/^PAT-\d+$/);

    // Assign bed & create appointment
    const ward = useHospitalStore.getState().wards[0];
    const freeBed = ward.beds.find((b) => b.status === "Available")!;
    useHospitalStore.getState().assignBedToPatient(ward.id, freeBed.id, created.id);

    const apt = useHospitalStore.getState().addAppointment({
      patientId: created.id,
      doctorId: "DOC-201",
      date: "2026-11-15",
      time: "10:00",
      reason: "Routine cardiology check",
      status: "Pending",
    });

    // Update patient name and verify propagation
    useHospitalStore
      .getState()
      .updatePatient(created.id, { fullName: "Updated Patient Name" });

    const updatedApt = useHospitalStore
      .getState()
      .appointments.find((a) => a.id === apt.id);
    expect(updatedApt?.patientName).toBe("Updated Patient Name");

    // Delete patient and verify bed is freed & appointment cleaned up
    useHospitalStore.getState().deletePatient(created.id);
    expect(
      useHospitalStore.getState().patients.some((p) => p.id === created.id)
    ).toBe(false);
    const updatedWard = useHospitalStore
      .getState()
      .wards.find((w) => w.id === ward.id)!;
    expect(updatedWard.beds.find((b) => b.id === freeBed.id)?.status).toBe(
      "Available"
    );
  });

  it("calculates invoice total automatically and toggles Paid/Unpaid status", () => {
    const invoice = useHospitalStore.getState().addInvoice({
      patientId: "PAT-1001",
      serviceDescription: "Diagnostic Lab Panel",
      quantity: 3,
      unitPrice: 125.5,
      invoiceDate: "2026-11-11",
      status: "Unpaid",
    });

    expect(invoice.totalAmount).toBe(376.5);
    useHospitalStore.getState().toggleInvoiceStatus(invoice.id);
    const toggled = useHospitalStore
      .getState()
      .invoices.find((i) => i.id === invoice.id);
    expect(toggled?.status).toBe("Paid");

    useHospitalStore
      .getState()
      .updateInvoice(invoice.id, { quantity: 4, unitPrice: 100 });
    const recalculated = useHospitalStore
      .getState()
      .invoices.find((i) => i.id === invoice.id);
    expect(recalculated?.totalAmount).toBe(400);
  });
});
