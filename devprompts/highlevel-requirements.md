# Customer Insights Workbench – Technical Challenge Objective
You have 48 hours to complete this challenge. The goal is to evaluate your ability to design and implement a modern web 
application encompassing the frontend, backend, database, and cloud deployment architecture. While production-grade 
infrastructure is not required, your solution should demonstrate clear reasoning, best practices, and senior-level 
decision-making. Feel free to utilize Gen AI tools to assist in your development but make sure you can explain
your reasoning behind design choices.

## Use Case
A SaaS company provides tools to help businesses manage customer interactions across email, chat, support tickets, 
and feedback forms. They seek to develop an internal application that enables their Support, Product, and Customer 
Success teams to better understand customer behavior.

## Requirements
### Core Features
1. Data Upload
   * Allow users to upload customer interaction logs (CSV or JSON) via a web interface. 
   * Logs should include:
     * product_id
     * customer_id
     * customer_rating
     * feedback
     * timestamp
     * responses_from_customer_support
2. Data Storage
   * Parse and store records in a relational database.
3. Architecture Proposal
   * Deliver a deployment plan for hosting the application on AWS.

### Deliverables 
Your minimal functional prototype should include:
  * Frontend (Vue.js or preferred framework)
  * Data Upload Page:
    * File upload (CSV or JSON)
    * Web form for submission
    * Integration with backend API for ingestion
    * Display success/failure messages
  * Data Retrieval Page:
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
### Technical Requirements
  * Backend: Spring Boot
  * Database: Relational schema with initial migration script (V1__create_tables.sql)
  * Testing: Include unit tests and at least one integration test covering data ingestion and retrieval.

## Submission Package
  * Repositories:
      * customer-workbench-backend
      * customer-workbench-frontend
  * README with setup instructions and architecture diagram
  * AWS deployment plan document
  * Short design document