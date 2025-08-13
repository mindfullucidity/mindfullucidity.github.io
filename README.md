# MindfulLucidity ✨

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Build Status](https://github.com/mindfullucidity/mindfullucidity.github.io/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/mindfullucidity/mindfullucidity.github.io/actions/workflows/deploy.yml)

## Unlock the Secrets of Your Dreams with AI-Powered Journaling 🧠

MindfulLucidity is an **open-source web application** designed to help you explore and understand your dreams through intuitive journaling and advanced AI analysis. Built with modern web technologies, it provides a comprehensive, private, and insightful platform for managing your dream entries, gaining deeper self-awareness, and fostering personal growth.

We believe in the power of open source to build a transparent and community-driven tool for dream exploration.

## Features 🚀

*   **Secure User Authentication:** Seamless login and registration with email/password or Google OAuth.
*   **Comprehensive Dream Journaling:**
    *   Easily create, view, and edit your dream entries with rich text and detailed metadata.
    *   Organize and quickly find entries with a searchable sidebar.
    *   Track key dream aspects like lucidity levels, moods, and recurring characteristics.
*   **Advanced AI Analysis:**
    *   Generate deep AI-powered interpretations (e.g., Jungian, Symbolic) with customizable depth.
    *   Create and enhance your personal reflections on dreams with AI assistance.
    *   View and manage all analyses associated with your entries in one place.
*   **Personalized Dashboard:** A home screen providing quick access to recent entries, AI insights summaries (top themes, lucidity trends, mood analysis), and journaling streaks.
*   **Flexible AI Configuration:**
    *   Configure AI integration, including provider and model selection (Google Gemini supported).
    *   Option to use your own AI API key for unlimited access, empowering you with full control.
*   **Progressive Web App (PWA):** Installable on your device for a native-like experience, allowing offline access and push notifications.

## Tech Stack 🛠️

MindfulLucidity is built with a robust and modern open-source technology stack:

*   **Frontend Framework:** [Nuxt.js](https://nuxt.com/) (Vue 3)
*   **UI Components:** [Shadcn-Vue](https://www.shadcn-vue.com/) for beautiful and accessible UI.
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) with a "Dracula" theme for a consistent and modern aesthetic.
*   **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL, Authentication, Edge Functions) for a powerful and scalable backend.
*   **Notifications:** [Vue Sonner](https://vue-sonner.vercel.app/) for elegant toast notifications.
*   **Icons:** [Font Awesome](https://fontawesome.com/) for a rich icon set.
*   **PWA:** [@vite-pwa/nuxt](https://vite-pwa-org.netlify.app/frameworks/nuxt.html) for Progressive Web App capabilities.
*   **Utilities:** [@vueuse/core](https://vueuse.org/), `date-fns`, `marked`, `dompurify` for various functionalities.

## Getting Started 🏁

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v18 or higher recommended)
*   pnpm (or npm, yarn, bun)
*   [Supabase CLI](https://supabase.com/docs/guides/cli)

### Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/mindfullucidity/mindfullucidity.github.io.git
    cd mindfullucidity.github.io
    ```
2.  **Install dependencies:**
    ```bash
    pnpm install
    # or npm install
    # or yarn install
    # or bun install
    ```
3.  **Configure Supabase:**
    *   Ensure you have the [Supabase CLI](https://supabase.com/docs/guides/cli) installed.
    *   Link your local project to your Supabase project:
        ```bash
        supabase login # if not already logged in
        supabase link --project-ref YOUR_PROJECT_REF # Replace YOUR_PROJECT_REF with your Supabase Project ID
        ```
    *   Apply database migrations to your local Supabase instance:
        ```bash
        supabase db push
        ```
    *   (Optional) If you're starting a new Supabase project, you might need to run `supabase init` first.
    *   Ensure `SUPABASE_URL` and `SUPABASE_KEY` are set as environment variables (e.g., in a `.env` file for local development, or in your deployment environment). These will be automatically picked up by `nuxt.config.ts`.
    *   You may also need to configure environment variables for Patreon integration if you plan to use it (e.g., `PATREON_CLIENT_ID`, `PATREON_REDIRECT_URI`).

### Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
# or npm run dev
# or yarn dev
# or bun run dev
```

### Production Build

Build the application for production:

```bash
pnpm build
# or npm run build
# or yarn build
# or bun run build
```

Locally preview the production build:

```bash
pnpm preview
# or npm run preview
# or yarn run preview
# or bun run preview
```

For deployment, refer to the [Nuxt deployment documentation](https://nuxt.com/docs/getting-started/deployment).

## Community & Contributing 🤝

We welcome and appreciate your contributions to MindfulLucidity! This project thrives on community involvement.

*   **Contributing Guidelines:** Please check out our [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on how to submit pull requests, report bugs, and suggest features.
*   **Code of Conduct:** We are committed to fostering a welcoming and inclusive community. We expect all contributors to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).

## License 📜

This project is open-source and available under the [GNU General Public License v3.0](LICENSE.md).

## Contact 📧

For any inquiries or support, please reach out to us at annekinmeyburgh@gmail.com
