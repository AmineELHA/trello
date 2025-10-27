# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack Trello clone application with a **monorepo structure** containing two main directories:
- `/frontend` - Next.js 14 application
- `/backend` - Ruby on Rails 8 API server with GraphQL

## Architecture

### Frontend Stack (Next.js 14)
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS v4 with PostCSS
- **UI Components**: Radix UI primitives with custom components
- **Animations**: Framer Motion
- **Data Fetching**: TanStack React Query (@tanstack/react-query)
- **GraphQL Client**: graphql-request
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable
- **Icons**: Lucide React, Phosphor React

### Backend Stack (Rails 8)
- **Framework**: Ruby on Rails 8
- **API**: GraphQL (graphql gem)
- **Database**: PostgreSQL
- **Authentication**: Devise with JWT tokens
- **Testing**: RSpec with Factory Bot
- **Deployment**: Kamal (for Docker deployment)
- **Caching/Queues**: Solid Cache, Solid Queue, Solid Cable

## Data Model

The application follows a typical Trello structure:

```
Users
  └─ Boards (owned by user)
       └─ Columns (ordered by position)
            └─ Tasks (ordered by position)
```

### Key Models:
- **Users**: Authentication via Devise (email, password, first_name, last_name)
- **Boards**: Belongs to user, has many columns
- **Columns**: Belongs to board, has many tasks, ordered by position
- **Tasks**: Belongs to column, ordered by position, supports:
  - Title, description
  - Due dates
  - Labels (array of strings)
  - Checklists (JSON array)
  - Attachments (array of strings)

## Common Development Commands

### Frontend (in `/frontend` directory)
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Backend (in `/backend` directory)
```bash
# Start Rails server
bin/rails server

# Run database migrations
bin/rails db:migrate

# Run tests
bin/rails spec

# Run specific test file
bin/rails spec spec/models/user_spec.rb

# Start Rails console
bin/rails console

# Run RuboCop linting
bundle exec rubocop

# Run Brakeman security scanner
bundle exec brakeman
```

## GraphQL API

### GraphQL Endpoint
- **URL**: `http://localhost:3000/graphql`
- **Client**: Configured in `/frontend/src/app/lib/graphqlClient.ts`

### Authentication
- Tokens are stored in localStorage on the client
- JWT tokens are sent via Authorization header: `Bearer <token>`
- GraphQL context extracts current_user from token

### Key Queries
- `boards` - Fetch all boards for authenticated user
- `board(id)` - Fetch single board by ID with nested columns and tasks

### Key Mutations
**Authentication:**
- `signUp` - Register new user
- `login` - Authenticate user

**Boards:**
- `createBoard` - Create new board
- `updateBoard` - Update board name
- `deleteBoard` - Delete board

**Columns:**
- `createColumn` - Create column in board
- `updateColumn` - Update column name
- `deleteColumn` - Delete column
- `reorderColumn` - Reorder columns

**Tasks:**
- `createTask` - Create task in column
- `updateTask` - Update task (title, description, due_date, labels, checklists, attachments, position)
- `deleteTask` - Delete task
- `reorderTask` - Move task between columns or reorder within column

## Key File Locations

### Frontend Structure
```
/frontend/src/
  app/
    boards/              # Board-related pages
      [id]/page.tsx      # Individual board view
      page.tsx           # Boards listing
    auth/
      login/page.tsx     # Login page
      register/page.tsx  # Registration page
    api/auth/            # Next.js API routes for auth
    graphql/
      queries.ts         # GraphQL queries
      mutations.ts       # GraphQL mutations
    hooks/
      useAuth.ts         # Authentication hook
    contexts/
      UserContext.tsx    # User context
      ThemeContext.tsx   # Theme context
    lib/
      graphqlClient.ts   # GraphQL client setup
      utils.ts           # Utility functions
  components/ui/         # Reusable UI components
```

### Backend Structure
```
/backend/
  app/
    graphql/
      types/             # GraphQL type definitions
        query_type.rb    # Query root
        mutation_type.rb # Mutation root
        board_type.rb    # Board type
        column_type.rb   # Column type
        task_type.rb     # Task type
        user_type.rb     # User type
      resolvers/         # GraphQL resolvers
    models/
      user.rb            # User model
      board.rb           # Board model
      column.rb          # Column model
      task.rb            # Task model
    controllers/
      graphql_controller.rb # GraphQL endpoint
  db/
    schema.rb            # Database schema
  config/
    database.yml         # Database configuration
```

## Important Implementation Details

### Frontend
- **Dark mode**: Enabled by default in `/frontend/src/app/layout.tsx`
- **Authentication**: Handled via `useAuth` hook and UserContext
- **Data fetching**: React Query with GraphQL
- **Drag & Drop**: Implemented using @dnd-kit for board columns and tasks
- **State management**: React Context for user and theme

### Backend
- **Database**: PostgreSQL with UUID primary keys
- **Authentication**: Devise with JWT tokens
- **GraphQL**: Uses graphql-ruby gem with automatic type generation
- **Associations**: Eager loading via `.includes()` in queries
- **Position tracking**: Integer fields for ordering columns and tasks

## Database Configuration

**Development Database:**
- Host: localhost
- Username: postgres
- Password: postgres
- Database: trello_clone_dev

Configure PostgreSQL before running Rails migrations. Create the database with:
```bash
bin/rails db:create
bin/rails db:migrate
```

## Development Workflow

1. Start PostgreSQL database
2. Run backend migrations: `bin/rails db:migrate`
3. Start Rails server: `bin/rails server` (runs on port 3000)
4. Start Next.js dev server: `npm run dev` (runs on port 3000)
5. Access application at `http://localhost:3000`

## Testing

### Backend Tests (RSpec)
```bash
# Run all tests
bundle exec rspec

# Run specific test
bundle exec rspec spec/models/user_spec.rb

# Run with formatting
bundle exec rspec --format documentation
```

Tests use Factory Bot for fixtures and Database Cleaner for transaction management.

## Recent Commits

The repository shows active development with:
- Board search and filtering functionality
- User profile dropdown implementation
- Component organization (BoardComponents.tsx added)
