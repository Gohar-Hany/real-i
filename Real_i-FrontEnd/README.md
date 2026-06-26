# REAL_i — Frontend Application

This is the React frontend application for the **REAL_i** platform, built using Vite, React 19, TailwindCSS v4, and GSAP.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js** (v18+) and **npm** installed on your system.

### Setup & Installation

1. Navigate to the project directory:
   ```bash
   cd Raaed-FrontEnd
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Copy `.env.example` to `.env` and adjust the API target URL if necessary:
   ```bash
   cp .env.example .env
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```
   The application will start on [http://localhost:5173](http://localhost:5173).

---

## 📁 Folder Structure

The frontend application uses a clean, modular structure with path aliasing (`@/` maps to `src/`):

```
Raaed-FrontEnd/
├── public/                 # Static assets (logo, icons, favicons)
├── src/
│   ├── assets/             # Branding and graphic assets
│   ├── components/         # React Components
│   │   ├── common/         # Generic UI primitives (Modal, Toast, DataTable, FileUpload)
│   │   ├── layout/         # Shell components (Navbar, Footer, Sidebar, DashboardHeader)
│   │   └── features/       # Domain-specific components (chat/, courses/)
│   ├── contexts/           # React Context providers (Auth, Sidebar, Theme)
│   ├── data/               # Static mock data and configuration
│   ├── layouts/            # Page layouts (PublicLayout, DashboardLayout)
│   ├── pages/              # Router Page views (admin/, public/, student/, login/)
│   ├── services/           # Api client and backend service wrappers
│   ├── App.jsx             # Main routing and entry component
│   ├── index.css           # Global Tailwind stylesheet and styling tokens
│   └── main.jsx            # Application mount point
├── vite.config.js          # Vite config & API proxies
├── jsconfig.json           # Path alias definitions for IDEs
├── eslint.config.js        # ESLint configuration
└── vercel.json             # Vercel deployment configuration
```

---

## 🛠️ Key Scripts

- `npm run dev`: Starts the local development server (with hot module replacement).
- `npm run build`: Compiles the production-ready build to the `dist/` directory.
- `npm run lint`: Runs ESLint check across all JavaScript and React files.
- `npm run preview`: Previews the compiled production build locally.
