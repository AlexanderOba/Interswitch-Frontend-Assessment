# Vite Application

This is a **Vite-powered web application** built for performance, fast development, and easy deployment.  
It supports modern JavaScript features, hot module replacement (HMR), and optimized builds.

---

## 🚀 Features

- **Fast Development** with Hot Module Replacement (HMR)
- **Optimized Build** for production
- **ESM Support** (Native ES Modules)
- **Simple Configuration** with `vite.config.js`
- **CSS & Asset Handling**
- Easy integration with popular frameworks/libraries

---

## 📂 Project Structure

```
├── src/
│   ├── components/                  # Reusable UI & feature components
│   │   ├── AccountDetails.tsx        # Account details & transactions link
│   │   ├── Dashboard.tsx             # Main dashboard view
│   │   ├── FundsTransfer.tsx         # Funds transfer form & logic
│   │   ├── Header.tsx                # App header/navigation
│   │   ├── Login.tsx                  # Authentication form
│   │   ├── ProtectedRoute.tsx        # Route guard for authenticated pages
│   │   ├── TransactionHistory.tsx    # Transaction listing with filters & export
│   │
│   ├── contexts/                     # Global state providers
│   │   ├── AuthContext.tsx           # Authentication state & actions
│   │   ├── SessionContext.tsx        # Session timeout & activity tracking
│   │
│   ├── services/                     # API interaction layer
│   │   ├── api.ts                    # API request functions
│   │
│   ├── App.css                       # Global CSS
│   ├── App.tsx                       # Root component
│   ├── index.css                     # Global styles & Tailwind base imports
│   ├── main.tsx                      # Application entry point
│   ├── vite-env.d.ts                  # Vite TypeScript env definitions
│
├── .gitignore                        # Ignored files for Git
├── eslint.config.js                  # ESLint configuration
├── index.html                        # Main HTML file
├── package-lock.json                 # Dependency lock file
├── package.json                      # Project dependencies & scripts
├── postcss.config.js                 # PostCSS configuration
├── tailwind.config.js                # Tailwind CSS configuration
├── tsconfig.app.json                 # TypeScript config for app
```


---

## 🛠 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AlexanderOba/Interswitch-Frontend-Assessment.git
   cd Interswitch-Frontend-Assessment
   ```

2. **Install dependencies**
   ```bash
   npm install
---

## 📌 Scripts

| Command             | Description                     |
|---------------------|---------------------------------|
| `npm run dev`       | Start development server (HMR)  |
| `npm run build`     | Build for production            |
| `npm run preview`   | Preview production build        |

---

## ▶️ Running the App

To start the development server:
```bash
npm run dev
```
The app will be available at:
```
http://localhost:5173
```

