# ERP Frontend

A modern, full-featured ERP (Enterprise Resource Planning) frontend built with **Next.js 15**, **React 19**, **Redux Toolkit**, and **Tailwind CSS 4**.  
This project provides a complete UI for managing all ERP modules: HR, Sales, Inventory, Finance, Attendance, Customers, Orders, Products, Leaves, and more.

---

## 📦 Project Structure

```
erp-frontend/
├── src/
│   ├── app/
│   │   ├── components/         # Reusable UI components (Aside, Loading, etc.)
│   │   ├── pages/              # All app pages (admin, users, dashboard, etc.)
│   │   ├── redux/              # Redux store configuration
│   │   ├── services/           # RTK Query APIs for backend communication
│   │   ├── utils/              # Utility functions (auth, cookies, etc.)
│   │   └── layout.js           # Root layout with global providers
│   └── ...
├── .env                        # Environment variables (API URL, etc.)
├── package.json                # Project dependencies and scripts
├── tailwind.config.js          # Tailwind CSS configuration
└── ...
```

---

## 🚀 Getting Started

### 1. **Install Dependencies**

```bash
npm install
# or
yarn install
```

### 2. **Configure Environment**

Create a `.env` file in the root directory:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

> Change the URL to match your backend API server.

### 3. **Run the Development Server**

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack

- **Next.js 15** (App Router, SSR/CSR)
- **React 19**
- **Redux Toolkit** (RTK Query for API calls)
- **Tailwind CSS 4** (modern, responsive UI)
- **react-hot-toast** (notifications)
- **js-cookie** (auth token management)

---

## 🔐 Authentication

- JWT-based authentication.
- Token is stored in cookies (`js-cookie`).
- All API requests automatically include the token.
- Role-based access control for all pages and actions.

---

## 🗂️ Main Modules

- **Dashboard**: Dynamic, role-based dashboard for each user.
- **HR**: Attendance, leaves, employee management.
- **Sales**: Orders, customers, sales performance.
- **Inventory**: Products, stock, shipping.
- **Finance**: Revenue, expenses, salaries, profit/loss, analytics.
- **Users**: Profile, my orders, my attendance, my leaves, etc.

---

## 📁 Pages & Features

- `/pages/dashboard` — Main dashboard (dynamic per user role)
- `/pages/admin/finance` — Finance dashboard (revenue, profit, expenses, analytics)
- `/pages/admin/orders` — Orders management
- `/pages/admin/products` — Products management
- `/pages/admin/expenses` — Expenses management
- `/pages/admin/revenue` — Revenue analytics
- `/pages/admin/salaries` — Salaries reports
- `/pages/admin/leaves` — Leaves management
- `/pages/admin/customers` — Customers management
- `/pages/admin/shipping` — Shipping management
- `/pages/users/my-attendance` — My attendance
- `/pages/users/my-orders` — My orders
- `/pages/users/my-leaves` — My leaves
- `/` — Login page

---

## 🧩 Components

- **Aside**: Dynamic sidebar, changes with user role.
- **StatsCard**: Modern, animated stats cards.
- **QuickActionCard**: For fast navigation/actions.
- **SimpleChart**: Minimal chart for analytics.
- **Loading**: Full-page and inline loading states.
- **Modals**: For create/edit forms, confirmations, etc.

---

## 🔄 API Integration

- All backend endpoints are consumed via **RTK Query** APIs in `/src/app/services/apis/`.
- Each module (orders, products, finance, users, etc.) has its own API file.
- Automatic cache invalidation and refetching on mutations.

---

## 🎨 UI/UX

- **Modern glassmorphism** and gradient backgrounds.
- **Responsive**: Works on all screen sizes.
- **Smooth transitions** and hover effects.
- **Role-based navigation** and actions.
- **Empty states** and error handling everywhere.
- **Dark mode**: (add support easily via Tailwind if needed).

---

## 🧑‍💻 Development Notes

- All code is modular and follows best practices.
- Use `useGetCurrentUserQuery()` everywhere for live user data.
- Use `key={userData?._id}` on Aside for dynamic sidebar reload on user change.
- All forms and tables are accessible and keyboard-friendly.
- All actions (create, edit, delete) show toast notifications.

---

## 📝 Scripts

| Command         | Description                |
|-----------------|---------------------------|
| `npm run dev`   | Start development server  |
| `npm run build` | Build for production      |
| `npm run start` | Start production server   |
| `npm run lint`  | Lint codebase             |

---

## 🛡️ Security

- All sensitive pages/components are protected by role.
- Unauthorized users are redirected or shown an error.
- All API calls require a valid JWT token.

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/feature-name`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/feature-name`)
5. Open a Pull Request

---

## 📞 Support

For issues, suggestions, or help, open an issue on GitHub or contact the project maintainer.

---

## © 2024 ERP System

All rights reserved.
