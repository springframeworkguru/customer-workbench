In the directory `src/main/frontend/workbench` is a new React project.

The React application will use the following technologies:
- **React v19.1.0** React UI
- **React DOM v19.1.0**
- **Types React V19.1.0**
- **React Router Dom 7.6.36**
- **types/react 19.1.0** type definitions for react
- **types/react-dom 19.1.0** Type definitions for react-dom
- **Radix 3.2.1** React Component Library
- **Shadcn 2.6.3** Reusable components for Radix
- **Tailwindcss 4.1.10** CSS Framework for custom user interfaces
- **tw-animate-css 1.3.4** A collection of Tailwind CSS v4.0 utilities for creating beautiful animations.
- **tailwind-merge 3.3.1** Utility function to efficiently merge Tailwind CSS classes in JS without style conflicts.
- **PostCSS 8.5.5** a tool for transforming styles with JS plugins
- **clsx 2.1.1** utility for constructing className strings conditionally.
- **class-variance-authority 0.7.1**
- **lucide-react 0.515.0** Implementation of the lucide icon library for React applications.
- **Autoprefixer 10.4.20** plugin to parse CSS and add vendor prefixes to CSS rules
- **Axios 1.10.0** Promise based HTTP client for the browser and node.js
- **Node.js v22.16.0**: JavaScript runtime for building the frontend
- **types/node v24.0.1** Types for node.js
- **npm 11.4.0**: Package manager for JavaScript
- **TypeScript 5.8.3**: Typed superset of JavaScript
- **Vite 6.3.5**: Module bundler for JavaScript applications
- **vitejs/plugin-react 4.5.2**  Vite plugin for React projects
- **Jest 30.0.0**: JavaScript testing framework
- **types/jest 29.5.14**
- **testing-library/jest-dom 6.6.3**
- **testing-library/react 16.3.0**

# Vite Configuration
For development, configure a proxy for the Spring Boot server running at `http://localhost:8080`

The production build output path will be configured to use `src/main/resources/static`.

The base path should be configured to `/`.

Provide directions to setup and configure Vite to build the web resources.

# React Guidelines 

Implementing the CRUD operations for the defined APIs
* Implementing a standard layout and user navigation
* Provide an API service layer for a reusable Axios Instance
* Use custom hooks for state logic
* Code formatting with prettier
* Linting with ESLint
* Gracefully hand API errors
* Complete test coverage of components

Tasks to complete:

Complete the tasks following to show data in the UI provided by the endpoints 
in the SpringMVC controller `src/main/java/com/s7fundops/customerworkbench/controller/InteractionController.java`

Data Retrieval Page:
* Search and filter stored customer interaction records
* Features:
  * Search by Customer ID
  * Filter by interaction type (e.g., chat, email, ticket)
  * Filter by date range
  * Paginated results
* Display results in a table with columns:
  * timestamp
  * customer_id
  * interaction_type
  * message (truncate long text)

Provide test coverage for the UI components.

-------------

Inspect the react project in the directory `src/main/frontend/workbench`.

The root page should display a table with the data retrieved from the SpringMVC controller.

Tasks to complete:

Complete the tasks following to show data in the UI provided by the endpoints
in the SpringMVC controller `src/main/java/com/s7fundops/customerworkbench/controller/InteractionController.java`

Data Retrieval Page:
* Search and filter stored customer interaction records
* Features:
  * Search by Customer ID
  * Filter by interaction type (e.g., chat, email, ticket)
  * Filter by date range
  * Paginated results
* Display results in a table with columns:
  * timestamp
  * customer_id
  * interaction_type
  * message (truncate long text)

Provide test coverage for the UI components.

Verify the project builds and and tests pass successfully.