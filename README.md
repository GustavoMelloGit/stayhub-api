# StayHub API

This is the backend API for StayHub, a platform for managing property rentals. This project is currently under development.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Bun](https://bun.sh/)

### Installing

1. Clone the repository:
   ```bash
   git clone https://github.com/GustavoMelloGit/stayhub-api
   ```
2. Install the dependencies:
   ```bash
   bun install
   ```

### Running the application

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

## API Endpoints

The following endpoints are currently available:

- `GET /tenants`: Lists all tenants.
- `GET /stays`: Lists all stays.

More endpoints will be added as the project progresses.

## Technologies Used

- [Bun](https://bun.sh/) - JavaScript runtime and toolkit
- [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript
- [Firebase](https://firebase.google.com/) - Backend-as-a-Service platform
- [Zod](https://zod.dev/) - TypeScript-first schema validation
- [ESLint](https://eslint.org/) - Pluggable linting utility for JavaScript and JSX
- [Prettier](https://prettier.io/) - Opinionated code formatter
- [Husky](https://typicode.github.io/husky/) - Git hooks made easy

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
