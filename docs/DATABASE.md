# Data Model & Storage Architecture

## 1. Zero-Backend Data Architecture

The **Virtual Code Tech Hospital Management System** operates with zero external database dependencies. Data persistence is powered entirely by:

1. **Seed Datasets (`src/data/*.json`)**: Immutable baseline records shipped with the application bundle.
2. **Browser LocalStorage**: Persistent client-side key-value storage (`medaxis_hms_store_v1`) synchronized seamlessly via Zustand.
3. **In-Memory Cache**: Reactive Zustand store driving instantaneous UI updates without network latency.

---

## 2. Entity-Relationship Model (Client-Side Relational Schema)

Although stored as JSON documents, records maintain strict relational integrity across IDs:

```mermaid
erDiagram
    USER ||--o{ APPOINTMENT : manages
    PATIENT ||--o{ APPOINTMENT : books
    DOCTOR ||--o{ APPOINTMENT : attends
    PATIENT ||--o{ INVOICE : billed_to
    WARD ||--|{ BED : contains
    PATIENT |o--o| BED : occupies

    USER {
        string id PK
        string email
        string password
        string name
        string role "admin | doctor | receptionist"
        string avatar
    }

    PATIENT {
        string id PK
        string fullName
        int age
        string gender "Male | Female | Other"
        string phone
        string email
        string bloodGroup "A+ | A- | B+ | B- | AB+ | AB- | O+ | O-"
        string address
        string emergencyContact
        string status "Outpatient | Inpatient | Discharged"
        string admissionDate
        string assignedWard
        string assignedBed
    }

    DOCTOR {
        string id PK
        string fullName
        string email
        string phone
        string specialization
        string department
        int experience
        string availability "Available | In Consultation | On Leave"
        string avatar
        string bio
    }

    APPOINTMENT {
        string id PK
        string patientId FK
        string patientName
        string doctorId FK
        string doctorName
        string department
        string date
        string time
        string reason
        string status "Pending | Confirmed | Completed | Cancelled"
    }

    INVOICE {
        string id PK
        string invoiceNumber
        string patientId FK
        string patientName
        string serviceDescription
        int quantity
        float unitPrice
        float totalAmount
        string date
        string dueDate
        string status "Paid | Unpaid"
    }

    WARD {
        string id PK
        string name
        string department
        int totalBeds
    }

    BED {
        string id PK
        string wardId FK
        string bedNumber
        string status "Available | Occupied | Maintenance"
        string patientId FK
    }
```

---

## 3. Seed Datasets Overview

The initial state is pre-populated with realistic clinical records located in `src/data/`:

| Dataset File | Entity Type | Initial Count | Description |
| :--- | :--- | :---: | :--- |
| `users.json` | System Accounts | 3 | Admin, Chief Doctor, and Receptionist authentication credentials |
| `patients.json` | Patient Records | 14 | Fictional clinical profiles with diverse blood groups and admission states |
| `doctors.json` | Medical Staff | 8 | Multi-specialty physician registry with local portrait assets |
| `appointments.json` | Schedules | 18 | Multi-status consultations spanning current, past, and upcoming dates |
| `invoices.json` | Financials | 12 | Standardized medical fee line items with auto-computed sums |
| `wards.json` | Hospital Facilities | 6 wards / 24 beds | Inpatient departments (ICU, Cardiology, Pediatrics, etc.) with real-time occupancy |

---

## 4. Referential Integrity & Cascading Actions

The state store enforces business rules across entities:

1. **Patient Deletion**: When a patient is removed, any beds occupied by that patient in `wards` are automatically discharged and set back to `Available`.
2. **Bed Allocation**: Assigning a patient to a bed automatically marks the bed as `Occupied` and links the `patientId`. Discharging updates the bed status to `Available` and clears the assignment on the patient record.
3. **Invoice Auto-Calculation**: Invoices automatically maintain `$totalAmount = quantity \times unitPrice$`.
4. **Data Reset**: The store exposes `resetToDemoData()` which purges `localStorage` and reloads all initial JSON fixtures in a single transaction.
