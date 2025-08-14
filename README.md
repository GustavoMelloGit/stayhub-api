# StayHub API

This is the backend API for StayHub, a platform for managing property rentals. This project is currently under development.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Bun](https://bun.sh/)
- [Docker](https://www.docker.com/)

### Installing

1. Clone the repository:
   ```bash
   git clone https://github.com/GustavoMelloGit/stayhub-api
   ```
2. Install the dependencies:
   ```bash
   bun install
   ```
3. Create a `.env` file in the root of the project and add the following environment variables:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/stayhub"
   ```
   Replace `user` and `password` with your PostgreSQL credentials.

### Running the application

1. Start the PostgreSQL database using Docker Compose:
   ```bash
   docker-compose up -d
   ```
2. Run the database migrations:
   ```bash
   bun run migrate
   ```
3. Start the development server:
   ```bash
   bun run dev
   ```

This will start the development server with hot-reloading enabled. The API will be available at `http://localhost:3030`.

## Project Structure

The project follows a clean architecture pattern, separating concerns into the following layers:

- **`src/domain`**: Contains the core business logic of the application, including entities and repository interfaces.
- **`src/application`**: Contains the application-specific logic, such as use cases and data transfer objects.
- **`src/infra`**: Contains the implementation details of the application, such as database repositories, web frameworks, and dependency injection.
- **`src/presentation`**: Contains the API controllers, which handle incoming HTTP requests and call the appropriate use cases.

## Technologies Used

- [Bun](https://bun.sh/) - JavaScript runtime and toolkit
- [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript
- [PostgreSQL](https://www.postgresql.org/) - The World's Most Advanced Open Source Relational Database
- [Drizzle](https://orm.drizzle.team/) - TypeScript ORM that feels like writing SQL
- [Zod](https://zod.dev/) - TypeScript-first schema validation
- [ESLint](https://eslint.org/) - Pluggable linting utility for JavaScript and JSX
- [Prettier](https://prettier.io/) - Opinionated code formatter
- [Husky](https://typicode.github.io/husky/) - Git hooks made easy

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
