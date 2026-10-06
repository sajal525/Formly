<div align="center">

# Formly

**Modern, Intelligent, and Customizable Online Form Builder**

*Create interactive forms, capture responses with zero friction, and unlock actionable submission analytics.*

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/sajal525/Formly?style=social)](https://github.com/sajal525/Formly)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/sajal525/Formly/pulls)
[![Maintenance](https://img.shields.io/badge/maintained-yes-green.svg)](https://github.com/sajal525/Formly/graphs/commit-activity)
[![Status](https://img.shields.io/badge/status-active-success.svg)]()

[Explore Features](#features) • [Quick Start](#quick-start) • [Architecture](#architecture--tech-stack) • [Roadmap](#roadmap) • [Contributing](#contributing)

</div>

---

## Overview

**Formly** is a high-performance, developer-friendly form creation and response management platform. Built to bridge the gap between simple static forms and complex enterprise survey tools, Formly enables anyone to construct beautiful, conversational, or multi-step forms in minutes.

Whether you are gathering product feedback, conducting user research, accepting event registrations, or powering lead generation funnels, Formly delivers a delightful user experience with enterprise-grade reliability and dynamic logic branching.

---

## Features

### Visual Form Builder
- **Drag-and-Drop Canvas**: Easily add, rearrange, and configure field types without touching code.
- **Rich Input Library**: Text, multi-line textarea, dropdowns, multi-select checkboxes, radio groups, date pickers, rating scales, file uploads, and NPS meters.
- **Live Preview**: Inspect real-time responsive previews across desktop, tablet, and mobile breakpoints.

### Smart Logic & Branching
- **Conditional Visibility**: Show or hide questions dynamically based on prior responses.
- **Custom Validation**: Enforce required fields, regex patterns, email verification, and character limits.
- **Multi-Step & Conversational Flows**: Group questions into pages or Typeform-style single-question slides for higher conversion rates.

### Real-Time Analytics & Insights
- **Submission Dashboard**: View submissions in real time with summary metric cards and interactive charts.
- **Drop-Off Analysis**: Identify which questions cause friction and optimize completion rates.
- **One-Click Export**: Export clean dataset tables to CSV, Excel, or JSON format.

### Enterprise Security & Control
- **Anti-Spam & Bot Protection**: Native honeypot fields and optional Cloudflare Turnstile / reCAPTCHA.
- **Access Management**: Public links, password-protected forms, or domain-restricted access.
- **Rate Limiting & Expiry**: Cap maximum responses or set automated form expiration schedules.

### Embeds & Integrations
- **Versatile Distribution**: Standalone hosted URLs, modal popups, floating badges, or inline `<iframe>` / Web Component embeds.
- **Webhook Submissions**: Trigger automated payloads to any webhook endpoint upon response submission.
- **Notifications**: Instant email and third-party alert dispatches (Slack, Discord).

---

## Architecture & Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | Next.js / React, TypeScript | High-performance responsive UI & client-side routing |
| **Styling** | Modern CSS / CSS Variables | Adaptive dark/light theming, modular design tokens |
| **Backend API** | Node.js / REST & Server Actions | Form schema management, response intake, validation |
| **Database** | PostgreSQL / Prisma ORM | Relational schema storage, indexed submissions, relational analytics |
| **Authentication** | NextAuth.js / JWT | Secure session handling and role-based permissions |
| **Analytics Engine**| Chart.js / Recharts | Responsive charting and conversion rate visualizations |

---

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) `>= 18.0.0`
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/sajal525/Formly.git
cd Formly
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root:
```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/formly_db?schema=public"

# Authentication
NEXTAUTH_SECRET=your_super_secret_jwt_key
NEXTAUTH_URL=http://localhost:3000

# Email & Notifications (Optional)
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@yourdomain.com
SMTP_PASS=your_smtp_password
```

### 4. Run Database Migrations
```bash
npx prisma migrate dev --name init
```

### 5. Launch the Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser to start building forms!

---

## Project Structure

```text
Formly/
├── .github/              # GitHub Actions workflows & issue templates
├── .gitignore            # Ignored files (system, logs, dependencies)
├── public/               # Static assets, logos, and favicon
├── src/
│   ├── app/              # Next.js App Router (pages & API endpoints)
│   │   ├── (auth)/       # Login, register, password reset routes
│   │   ├── (dashboard)/  # Form builder, responses, analytics dashboards
│   │   ├── f/[formId]/   # Public responsive form submission route
│   │   └── api/          # RESTful backend API routes & webhooks
│   ├── components/       # Reusable UI & Builder components
│   │   ├── builder/      # Drag-and-drop canvas, field settings
│   │   ├── renderer/     # Dynamic form parser & validator
│   │   ├── analytics/    # Submission charts, tables, filters
│   │   └── ui/           # Buttons, modals, dropdowns, inputs
│   ├── lib/              # Database clients, validators, helper utilities
│   ├── types/            # TypeScript interfaces & type definitions
│   └── styles/           # Global styles and design system tokens
├── prisma/               # Database schema and migration scripts
├── README.md             # Project documentation
├── package.json          # Package manifest & scripts
└── tsconfig.json         # TypeScript configuration
```

---

## Configuration & Environment Variables

| Variable | Description | Default | Required |
| :--- | :--- | :--- | :---: |
| `NEXT_PUBLIC_APP_URL` | Base public URL of the application | `http://localhost:3000` | Yes |
| `DATABASE_URL` | Database connection string | — | Yes |
| `NEXTAUTH_SECRET` | Secret key used to encrypt auth tokens | — | Yes |
| `NEXTAUTH_URL` | Canonical URL for authentication redirects | `http://localhost:3000` | Yes |
| `STORAGE_BUCKET_URL` | Cloud storage endpoint for file uploads | — | No |
| `SMTP_HOST` | Outgoing email server for response alerts | — | No |

---

## Roadmap

- [x] Core schema definition & drag-and-drop field builder
- [x] Public form submission runtime with client-side validation
- [x] Real-time response table & CSV export
- [ ] **AI Form Generator**: Generate full forms from natural language prompts
- [ ] **Third-Party Integrations**: Native Notion, Google Sheets, and Airtable syncing
- [ ] **Custom Domains**: Point custom CNAME records directly to individual forms
- [ ] **Offline PWA Support**: Cache responses locally and sync upon reconnection
- [ ] **Stripe Payment Block**: Collect one-time payments or subscriptions directly inside forms

---

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please make sure to write clean, documented code and test your changes before submitting.

---

## License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## Author & Support

Created and maintained by **[sajal525](https://github.com/sajal525)**.

- **GitHub**: [@sajal525](https://github.com/sajal525)
- **Email**: [sajaljaiswal525@gmail.com](mailto:sajaljaiswal525@gmail.com)

If you find Formly helpful, please consider giving the repository a star!
