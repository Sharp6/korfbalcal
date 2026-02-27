# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds the Angular application source.
- `src/app/` contains app configuration (`app.config.ts`), routing (`app.routes.ts`), and feature code.
- `src/app/components/` and `src/app/services/` are the primary feature and service folders.
- `public/` contains static assets copied into the build output.
- `dist/` is the build output directory (`dist/korfbalcal/` after `ng build`).
- `proxy.conf.json` configures local dev proxying for the Angular dev server.

## Build, Test, and Development Commands
- `npm run start` runs `ng serve` and starts the dev server at `http://localhost:4200/`.
- `npm run build` produces a production build into `dist/korfbalcal/`.
- `npm run watch` builds in development mode and watches for changes.
- `npm run test` runs unit tests with Karma.

## Coding Style & Naming Conventions
- TypeScript/Angular conventions apply. Use `app-` as the component selector prefix (per `angular.json`).
- Prefer standard Angular file naming: `*.component.ts`, `*.service.ts`, `*.routes.ts`.
- Keep indentation consistent within each file (project uses default Angular CLI templates).

## Testing Guidelines
- Unit testing is configured with Jasmine + Karma (`ng test`).
- No repository-specific test patterns are enforced yet; follow Angular defaults when adding tests (e.g., `*.spec.ts`).

## Commit & Pull Request Guidelines
- Existing history uses short, sentence-style messages (e.g., “Fix dockerfile”). Keep commits concise and descriptive.
- PRs should include a brief summary, testing notes (commands run), and screenshots for UI changes.

## Configuration & Deployment Notes
- Docker support is included via `Dockerfile` and `docker-compose.yml`.
- Nginx config is in `nginx.conf` for containerized/static hosting.
