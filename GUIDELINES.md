# GUIDELINES

## Project Structure
The project is divided into folders, with each module being responsible for a specific part of the project. 
 - common (contains common reusable utilities and helpers)
 - config (contains global configurations injected from env variables)
 - core (services shared across most modules like sms, payment ...)
 - modules (contains features like flip, goal-savings, etc)
 - scripts (contains one-off scripts)

In order to be a module, it needs to:

- Be responsible for multiple features that are similar to each other
- Can work in isolation or have minimal integration with other modules
- It could potentially become a separate service

Within each module, there are folders for each responsibility:
- Controller
    - Exposes endpoints. Additionally, they are documented via Swagger.
- Service
    - Contains the business logic. They connect to repositories for database access.
- Entity
    - Classes that map to the database.
- DTO (Data Transfer Object)
    - Classes for data transfer between the back-end and front-end.

### Why this structure?

TypeScript projects tend to follow this structure. The NestJS framework itself uses this structure for its source code, so we consider it to be a robust enough structure for Nkwa.