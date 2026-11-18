# Installation & Local Setup Guide

This guide provides instructions for setting up, running, testing, and deploying the **Virtual Code Tech Hospital Management System** on your local machine.

---

## 1. System Requirements

- **Node.js**: v20.0.0 or higher (Tested on Node.js v24)
- **Package Manager**: npm v10.0.0 or higher
- **Modern Web Browser**: Google Chrome, Mozilla Firefox, Microsoft Edge, or Safari
- **Operating System**: Windows 10/11, macOS, or Linux

---

## 2. Step-by-Step Installation

### Step 1: Clone the Repository
```bash
git clone https://github.com/danishalipny-pixel/Virtual-Code-Tech-Hospital-managment-system.git
cd Virtual-Code-Tech-Hospital-managment-system
```

### Step 2: Install Project Dependencies
Install all required production and development dependencies:
```bash
npm install
```

### Step 3: Configure Environment (Optional)
The application works out-of-the-box without environment variables. An optional template is provided:
```bash
cp .env.example .env.local
```

---

## 3. Running the Application

### Development Server

#### Option A: Default Port 3000
```bash
npm run dev
```
Navigate to: **http://localhost:3000**

#### Option B: Alternate Port 3001 (Recommended if Port 3000 is occupied)
If port 3000 is running another local service or web server, start on port 3001:
```bash
npm run dev -- -p 3001
```
Navigate to: **http://localhost:3001**

---

## 4. Production Build & Execution

Verify that the application compiles into an optimized production bundle:

```bash
# 1. Compile the production build
npm run build

# 2. Launch the production server on port 3001
npm run start -- -p 3001
```

---

## 5. Automated Verification & Testing

Execute the test suites and code linters before publishing changes:

```bash
# Run Vitest test suite (Unit & Component tests)
npm test

# Run TypeScript typecheck
npm run typecheck

# Run ESLint validation
npm run lint
```

All 15 automated test suites should complete with zero failures.

---

## 6. Vercel Deployment Instructions

The application is fully compatible with Vercel zero-config deployments:

1. Push your repository to GitHub.
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import `Virtual-Code-Tech-Hospital-managment-system`.
4. Keep the default settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `next build`
   - **Output Directory**: `.next`
5. Click **"Deploy"**. The site will be live in less than 2 minutes.

---

## 7. Troubleshooting Common Issues

| Issue | Root Cause | Resolution |
| :--- | :--- | :--- |
| **Port Conflict (EADDRINUSE)** | Another application is bound to port 3000. | Run with `npm run dev -- -p 3001` or specify another port. |
| **Hydration Mismatch** | Browser extensions injecting DOM attributes before hydration. | The app includes `useHydrated` to prevent hydration mismatches. Disable intrusive browser extensions if seen. |
| **Outdated Mock Data** | State persisted from a previous testing session. | Click the **"Reset Demo Data"** button in the top navigation bar or clear browser `localStorage`. |
