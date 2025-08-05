# Mindful Lucidity Website Description

Mindful Lucidity is a web application designed for dream journaling, built with Nuxt.js, Shadcn-Vue components, and Tailwind CSS, adhering to a "dracula" theme. The application provides a comprehensive platform for users to manage their dream entries, with a strong emphasis on AI-powered analysis and user customization.

## Core Functionality

### User Authentication
The application features a robust authentication system:
- **Login (`/login`):** Users can log in using their email and password or through Google OAuth.
- **Registration (`/register`):** New users can create an account with a username, email, and password, or by signing up with Google OAuth. Email confirmation is required after registration.
- **Authentication Flow (`app.vue`):** The `app.vue` file manages the global authentication state. It redirects logged-in users from authentication pages to `/home` and redirects logged-out users to `/login` (unless they are on public pages like `/`, `/login`, or `/register`).

### Journaling
The core of the application is the dream journaling feature:
- **Journal Home (`/journal`):** Displays a placeholder prompting the user to select a journal entry from the sidebar.
- **New Entry (`/journal/new`):** Allows users to create new journal entries using the `JournalEntryView` component.
- **View Entry (`/journal/[id]`):** Displays a specific journal entry based on its unique ID, also utilizing the `JournalEntryView` component.
- **Journal Layout (`layouts/journal.vue`):** This dedicated layout likely provides the structure for journal-related pages, including a sidebar for navigation between entries.

#### Journal Components Deep Dive

The `/components/journal` directory contains several sub-directories, each responsible for a specific part of the journaling experience:

##### `analysis_card/`
These components are responsible for displaying and managing dream analyses.
- **`NewAIAnalysisCard.vue`:** A card component for generating new AI-powered analyses. Users can select the type (e.g., Jungian, Symbolic) and depth (e.g., To The Point, In-Depth) of the analysis, and provide additional context.
- **`NewPersonalAnalysisCard.vue`:** A card component for creating or editing personal analyses of dream entries. Users can select a type (e.g., Initial Thought, Meditation) and input their own reflections. It also includes an "Enhance" button to use AI to improve the personal analysis.
- **`PreviewAnalysisCard.vue`:** Displays a preview of an AI or personal analysis. It includes options to edit (for personal analyses) or delete the analysis, and a collapsible content area to show/hide the full analysis.
- **`SkeletonPreviewAnalysisCard.vue`:** A skeleton loading state for the `PreviewAnalysisCard`, used while analyses are being generated or loaded.

##### `misc/`
Contains reusable utility components for the journaling feature.
- **`DatePicker.vue`:** A component for selecting dates, used for setting the date of a journal entry. It supports different display variants.
- **`EditableInput.vue`:** A simple input field that allows inline editing of text, used for the journal entry title.
- **`EditableTextarea.vue`:** A textarea component that automatically adjusts its height based on content, used for the main content of a journal entry.

##### `sidebar/`
Components related to the journal entry sidebar.
- **`JournalEntryCard.vue`:** A card component representing a single journal entry in the sidebar. It displays the entry's title (or formatted date if no title), date, and a short description.
- **`JournalEntryCardSkeleton.vue`:** A skeleton loading state for the `JournalEntryCard`, used while the list of journal entries is loading.
- **`JournalSidebar.vue`:** The main sidebar component for the journal section. It includes a search bar for filtering entries, a button to create a new entry, and a list of `JournalEntryCard` components. It handles loading and filtering of journal entries.

##### `view/`
Components related to the detailed view of a single journal entry.
- **`JournalEntryView.vue`:** The main component for viewing and editing a single journal entry. It orchestrates the display of entry content, analyses, and details using tabs. It handles saving, deleting, and enhancing journal entries and their analyses. It also manages the display of an upgrade dialog if AI rate limits are hit.
- **`JournalEntryViewAnalysis.vue`:** Displays and manages the analyses associated with a journal entry. It allows users to add new personal or AI analyses, and to view, edit, or delete existing ones. It integrates with AI services for analysis generation and enhancement.
- **`JournalEntryViewDetails.vue`:** Allows users to input and manage additional details about their dream entry, such as lucidity level, lucidity trigger, mood, and characteristics (e.g., recurrent, nightmare).
- **`JournalEntryViewDetailsSkeleton.vue`:** A skeleton loading state for the `JournalEntryViewDetails` component.
- **`JournalEntryViewEntry.vue`:** Displays the core content of a journal entry, including the title, date, and main dream content, using `EditableInput`, `DatePicker`, and `EditableTextarea`.
- **`JournalEntryViewEntrySkeleton.vue`:** A skeleton loading state for the `JournalEntryViewEntry` component.
- **`JournalEntryViewToolbar.vue`:** The toolbar for the journal entry view, providing navigation between "Entry", "Analysis", and "Details" tabs, and actions like enhancing, deleting, canceling edits, and saving the entry.

### Settings
Users can customize their experience and manage their account through various settings pages:
- **General Settings (`/settings`):** Allows users to manage their public profile information, including name, email, bio, location, website, company, and a toggle for public profile visibility.
- **AI Features (`/settings/ai`):** This section enables users to configure AI integration for dream analysis. Key features include:
    - Toggling AI features on/off.
    - Selecting an AI provider (currently Google Gemini is supported).
    - Choosing an AI model (e.g., Gemini 2.5 Flash, Gemini 2.5 Pro).
    - Entering a custom API key for their chosen AI model, allowing for unlimited access.
    - (Commented out sections suggest future features like "Smart Features" for code suggestions and AI code review, and "Usage & Analytics" for monitoring AI usage.)
- **MindfulLucidity Plus (`/settings/plus`):** This page manages the application's subscription service:
    - Promotes upgrading to "Plus" for full functionality if the user is not subscribed. It highlights that users can achieve similar functionality for free by using their own Google Gemini API key.
    - For subscribed users, it displays their current plan, renewal date, and options to unsubscribe or manage payment.
- **Settings Layout (`layouts/settings.vue`):** This layout likely provides a consistent navigation structure for all settings-related pages.

## Home Screen (`/home`)

The home screen serves as a personalized dashboard for logged-in users, providing quick access to key features and insights. Potential content includes:

- **Welcome Message:** A personalized greeting for the user.
- **Quick Journal Entry:** A prominent button or section to quickly create a new journal entry.
- **Recent Entries Overview:** A scrollable list or cards displaying the most recent 3-5 journal entries, similar to `JournalEntryCard`, allowing users to quickly jump back into their recent dreams.
- **AI-Powered Insights Summary:**
    - "Your Top Dream Themes" (derived from AI analysis).
    - "Lucidity Level Trends" (a simple graph or summary of lucidity over time).
    - "Mood Analysis Snapshot" (overview of recent dream moods).
    - "Did You Know?" or "Dream Tip of the Day" (educational content related to dream journaling or AI features).
- **Journaling Streak/Reminders:** Encourage consistent journaling with a visual streak counter or a reminder to log a dream.
- **Subscription Status/Upgrade Prompt:** A subtle reminder or call to action for users who are not "Plus" subscribers, highlighting the benefits of upgrading or using their own AI key.
- **"Explore Your Dreams" Section:** A curated list of AI analysis types or journaling prompts to encourage deeper exploration.

## Public Page (`/`)

The public landing page is the entry point for new and logged-out users, designed to introduce Mindful Lucidity and encourage sign-ups. Potential content includes:

- **Catchy Tagline/Headline:** A clear and concise statement about the purpose of Mindful Lucidity.
- **Hero Section:** A visually appealing section with a brief description of the app's core value proposition (e.g., "Unlock the Secrets of Your Dreams with AI-Powered Journaling").
- **Key Features Showcase:** Highlight the main benefits and features, such as:
    - Easy and intuitive dream journaling.
    - Advanced AI analysis (Jungian, Symbolic, etc.).
    - Personal insights and self-reflection.
    - Customizable settings and data privacy.
- **Call to Action (CTA):** Prominent "Get Started" buttons, leading to the registration page.
- **"How It Works" Section:** A simple, step-by-step explanation of the journaling and analysis process.
<!-- - **Testimonials/Social Proof:** (Placeholder) Quotes from satisfied users to build trust and credibility. keep for future, do not implement now-->
- **"MindfulLucidity Plus" Overview:** Briefly explain the "Plus" subscription benefits and emphasize the option to use a free Google Gemini API key for full functionality, linking to the `/settings/plus` page for more details.
<!-- - **FAQ Section:** Address common questions about dream journaling, AI, and the platform. keep for future, do not implement now -->
- **Footer:** Contains links to privacy policy, terms of service, and social media.

## Technical Stack and UI/UX

- **Frontend Framework:** Nuxt.js
- **UI Components:** Shadcn-Vue, ensuring a consistent and modern look and feel.
- **Styling:** Tailwind CSS for utility-first styling, with a "dracula" theme applied for visual aesthetics.
- **Global Components:** The `app.vue` file integrates a `Toaster` component for displaying notifications to the user.
- **Layouts:** The application uses distinct layouts (`default`, `journal`, `settings`) to provide tailored user experiences for different sections of the website.

## Overall User Experience

Mindful Lucidity aims to provide a seamless and intuitive experience for dream journaling. The integration of AI features offers advanced analysis capabilities, while the "Plus" subscription and custom API key options provide flexibility for users to choose their preferred level of engagement and support. The clear separation of concerns in page and component structure, along with the use of modern UI frameworks, contributes to a clean and responsive user interface.
