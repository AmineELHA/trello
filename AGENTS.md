# AGENTS.md

This file provides guidelines for AI coding agents working in this Trello clone monorepo.

## Commands

**Frontend (Next.js in `/frontend`):**
- Dev: `npm run dev` | Build: `npm run build` | Lint: `npm run lint`

**Backend (Rails in `/backend`):**
- Server: `bin/rails server` | Migrate: `bin/rails db:migrate` | Console: `bin/rails console`
- All tests: `bin/rails spec` | Single test: `bin/rails spec spec/models/board_spec.rb`
- Lint: `bundle exec rubocop` | Security: `bundle exec brakeman`

## Code Style

**TypeScript/React:**
- Use TypeScript strict mode with explicit types
- Imports: `@/` alias for `src/`, prefer named imports
- Components: "use client" for client components, functional components with hooks
- Styling: Tailwind CSS classes, Radix UI primitives for components
- Data: TanStack Query for GraphQL queries/mutations via graphql-request
- Error handling: Try/catch with user-friendly error messages

**Ruby/Rails:**
- Follow RuboCop Rails Omakase style guide
- Models: Use validations, explicit associations with `dependent:` options
- GraphQL: Type-safe resolvers in `app/graphql/`, return error objects for failures
- Testing: RSpec with FactoryBot, use `let` for test data, descriptive `describe`/`context` blocks
- Naming: snake_case for methods/variables, CamelCase for classes
