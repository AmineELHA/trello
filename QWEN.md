# Trello Clone Project

## Project Overview

This is a full-stack Trello clone application built with:
- **Backend**: Rails 8 API with GraphQL
- **Frontend**: Next.js 14 with TypeScript
- **Database**: PostgreSQL
- **Authentication**: Devise with JWT tokens
- **Styling**: Tailwind CSS with Radix UI components
- **Animation**: Framer Motion
- **Drag & Drop**: @dnd-kit library

The application allows users to create boards, organize tasks in columns, and collaborate on projects in a Trello-like interface.

## Architecture

### Backend (Rails 8 API)
- Located in `/backend` directory
- GraphQL API for data operations
- PostgreSQL database with ActiveRecord ORM
- User authentication via Devise and JWT tokens
- Models:
  - User (authentication and ownership of boards)
  - Board (contains columns and tasks)
  - Column (contains tasks, belongs to a board)
  - Task (individual tasks in columns)

### Frontend (Next.js 14)
- Located in `/frontend` directory
- React-based UI with TypeScript
- GraphQL API communication
- Responsive design with Tailwind CSS
- Drag-and-drop functionality for tasks and columns
- Authentication flow (login/register)

## Key Features

1. **User Authentication**: Registration, login, and JWT-based session management
2. **Board Management**: Create, update, delete boards
3. **Column Management**: Add, update, reorder columns within boards
4. **Task Management**: Create, update, reorder tasks within columns
5. **Drag & Drop**: Intuitive task and column reordering
6. **Responsive Design**: Works on desktop and mobile devices

## Building and Running

### Backend (Rails API)
1. Navigate to `/backend` directory
2. Install dependencies: `bundle install`
3. Set up database: `rails db:create db:migrate`
4. Start the server: `rails server` (or `bin/dev` if using the Procfile)
5. Access GraphQL API at `http://localhost:3000/graphql`
6. Access GraphiQL interface at `http://localhost:3000/graphiql` (in development)

### Frontend (Next.js)
1. Navigate to `/frontend` directory
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Access the application at `http://localhost:3000`

## Project Structure

### Backend
- `/app/controllers` - Rails controllers (with GraphQL controller as main API entry point)
- `/app/graphql` - GraphQL schema, types, mutations, and resolvers
- `/app/models` - ActiveRecord models (User, Board, Column, Task)
- `/config` - Rails configuration files
- `/db` - Migrations and database schema

### Frontend
- `/src/app` - Next.js app router pages
- `/components` - React UI components
- `/contexts` - React context providers
- `/public` - Static assets

## Development Conventions

- The backend uses a GraphQL API approach with mutations and queries
- Authentication is handled with JWT tokens stored in localStorage
- The frontend uses React Query for state management and API caching
- Drag and drop functionality uses @dnd-kit library
- UI components are built with Radix UI primitives and styled with Tailwind CSS
- The application follows responsive design principles

## API Endpoints

- GraphQL: `POST /graphql` (for all data operations)
- Authentication: `/users/sign_in`, `/users/sign_up` (Devise routes)
- GraphiQL: `/graphiql` (development only)

## Testing

The backend includes RSpec tests for API endpoints and GraphQL operations, located in `/spec` directory.