# Contributing to MindfulLucidity

We welcome and appreciate your contributions to MindfulLucidity! By contributing, you help us build a better dream journaling and analysis platform for everyone.

Please take a moment to review this document to understand how you can contribute effectively.

## Code of Conduct

MindfulLucidity is committed to fostering a welcoming and inclusive community. We expect all contributors to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

There are several ways you can contribute to MindfulLucidity:

### 1. Reporting Bugs

If you find a bug, please help us by reporting it!

*   **Check existing issues:** Before submitting a new bug report, please check if the issue has already been reported.
*   **Provide detailed information:** When reporting a bug, include:
    *   A clear and concise description of the bug.
    *   Steps to reproduce the behavior.
    *   Expected behavior.
    *   Screenshots or videos (if applicable).
    *   Your operating system, browser, and Nuxt.js version.

### 2. Suggesting Enhancements

Have an idea for a new feature or an improvement to an existing one? We'd love to hear it!

*   **Check existing suggestions:** See if your idea has already been discussed.
*   **Describe your idea:** Clearly explain the enhancement and why you think it would be valuable to MindfulLucidity users.

### 3. Your First Code Contribution

Ready to dive into the code? Here's how to get started:

#### Development Setup

Make sure you have the development environment set up as described in the [README.md](README.md) file.

1.  **Fork the repository:** Start by forking the `mindfullucidity.github.io` repository on GitHub.
2.  **Clone your fork:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/mindfullucidity.github.io.git
    cd mindfullucidity.github.io
    ```
3.  **Install dependencies:**
    ```bash
pnpm install # or npm install, yarn install, bun install
    ```
4.  **Configure Supabase:** Set up your local Supabase environment as detailed in the [README.md](README.md).
5.  **Start the development server:**
    ```bash
pnpm dev # or npm run dev, yarn dev, bun run dev
    ```

### Database Schema & Migrations

MindfulLucidity uses Supabase for its backend, and database schema changes are managed through Supabase Migrations.

*   **Prerequisites:** Ensure you have the [Supabase CLI](https://supabase.com/docs/guides/cli) installed.
*   **Applying Migrations:** After cloning the repository and linking your Supabase project, apply the latest database migrations to your local Supabase instance:
    ```bash
    supabase db push
    ```
*   **Creating New Migrations:** If your contribution involves changes to the database schema (e.g., adding a new table, modifying a column, creating a new SQL function), you must create a new migration file:
    ```bash
    supabase migration new your_descriptive_migration_name
    ```
    Then, write your SQL changes in the newly created file (`supabase/migrations/<timestamp>_your_descriptive_migration_name.sql`).
*   **Deploying Edge Functions:** If your contribution involves changes to Edge Functions, deploy them using:
    ```bash
    pnpm dlx supabase functions deploy <function_name>
    ```
    (Replace `<function_name>` with the actual name of your Edge Function).
    **Note:** The `patreon_oauth_callback` function specifically requires the `--no-verify-jwt` flag during deployment:
    ```bash
    pnpm dlx supabase functions deploy patreon_oauth_callback --no-verify-jwt
    ```

#### Pull Request Guidelines

*   **Create a new branch:** For each new feature or bug fix, create a new branch from `main` (or `develop` if that's your primary development branch). Use a descriptive name (e.g., `feature/add-ai-model-selection`, `fix/journal-entry-bug`).
*   **Commit messages:** Write clear, concise, and descriptive commit messages. Follow a conventional commit style if possible (e.g., `feat: add new AI model option`, `fix: resolve journal entry display bug`).
*   **Code style:** Adhere to the existing code style of the project. We use ESLint and Prettier (if configured).
*   **Testing:** If applicable, add or update tests to cover your changes. Ensure all existing tests pass.
*   **Documentation:** Update any relevant documentation (e.g., comments, README sections) for your changes.
*   **One feature/fix per PR:** Keep your pull requests focused on a single feature or bug fix.
*   **Rebase frequently:** Rebase your branch on the latest `main` (or `develop`) to avoid merge conflicts.
*   **Descriptive PR:** Provide a clear title and description for your pull request, explaining the changes and why they were made. Reference any related issues.

## Licensing

By contributing to MindfulLucidity, you agree that your contributions will be licensed under the project's [GNU General Public License v3.0](LICENSE.md).

Thank you for contributing to MindfulLucidity!