---
name: dev-flow
description: A skill for a development workflow that includes writing code (preferring react-query over useEffect), checking for errors, and committing to git. Use when the user wants to write code and then commit it.
---

# Development Workflow

This skill guides the development process, ensuring code quality and proper version control.

## 1. Code Implementation

- When writing React components, prioritize using `react-query` for data fetching, caching, and state management.
- Avoid using `useEffect` for data fetching to prevent common pitfalls like race conditions and unnecessary re-renders.
- Write clean, readable, and maintainable code.

## 2. Code Validation

Before committing any changes, it's crucial to validate the code to ensure it's free of errors and adheres to project standards.

- **Run tests:** Execute the project's test suite to ensure all existing functionality is working correctly.
- **Run linter:** Use the project's linter to check for code style and quality issues.

## 4. Permission Registration & Super Admin Sync

- **Auto-Registration**: Whenever a new feature page or protected API is created, the developer MUST immediately register the corresponding permission code in the `Permission` table via a database migration or the `PermissionService.register` utility.
- **Super Admin Guarantee**: The registration logic MUST ensure that the `SUPER_ADMIN` role (ID: `admin-role-id`) is automatically granted the new permission.
- **Consistency**: System configurations and UI navigation items MUST strictly map to these registered permissions to ensure RBAC integrity.

## 5. UI Standards (LeiXi System)
- **Search Layout**: All search/filter areas MUST be single-row, full-width with `flex-grow` adaptive proportions.
- **Date Buttons**: Grouped date buttons (Today, 7d, etc.) MUST be physically stitched, 44px height, with `1px slate-500 (#64748b)` borders. Clicking MUST trigger immediate search.
- **Aesthetic**: Prefer `framer-motion` for page transitions and data updates to maintain a modern, "alive" feel.
