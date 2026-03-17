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

## 3. Git Commit

Once the code is validated, proceed with committing the changes.

- Use `git status` to review the changes.
- Use `git add` to stage the changes.
- Write a clear and concise commit message that explains the "why" of the change.
- Follow the secure-commit-flow skill for the commit process.
