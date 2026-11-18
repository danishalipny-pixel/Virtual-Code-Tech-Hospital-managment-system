# Contributing Guidelines

Thank you for your interest in contributing to the **Virtual Code Tech Hospital Management System**! We welcome improvements, bug fixes, and feature enhancements.

---

## 1. Code of Conduct

Please maintain a respectful, professional, and collaborative environment. Be considerate of all contributors and constructive in code reviews.

---

## 2. Development Workflow

We follow a feature branch workflow:

1. **Fork or Clone** the repository:
   ```bash
   git clone https://github.com/danishalipny-pixel/Virtual-Code-Tech-Hospital-managment-system.git
   cd Virtual-Code-Tech-Hospital-managment-system
   ```
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feat/your-feature-name
   # or for bug fixes:
   git checkout -b fix/issue-description
   ```
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Make Your Changes**: Keep components modular, accessible, and properly typed.
5. **Run Verification Commands**:
   ```bash
   npm test
   npm run lint
   npm run typecheck
   npm run build
   ```
6. **Commit Changes**: Follow Conventional Commit specifications (e.g., `feat:`, `fix:`, `docs:`, `test:`).
7. **Submit a Pull Request**: Provide a clear summary of changes and reference any relevant issue.

---

## 3. Engineering Conventions

- **Component Design**: Place reusable primitives in `src/components/ui/` and domain views in `src/features/`.
- **Typing**: Enforce strict TypeScript types without using `any`.
- **Forms**: Always pair user input forms with React Hook Form and Zod schemas.
- **Styling**: Utilize Tailwind CSS v4 design tokens and ensure both Light and Dark themes look polished.
- **Testing**: Add or update unit tests in `__tests__` folders for new helper functions, state mutations, and interactive components.
