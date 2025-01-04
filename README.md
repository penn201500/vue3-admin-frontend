# VueSys - Admin Dashboard Frontend

## Overview

VueSys is a modern, responsive admin dashboard built with Vue 3, offering a comprehensive set of features for user management, role-based access control, and dynamic menu management.

## Features

-   🔐 Secure Authentication System
    -   JWT-based authentication with HttpOnly cookies
    -   Secure access token and refresh token handling
    -   HTTPS support with SSL/TLS encryption
    -   CSRF protection
    -   Remember me functionality
    -   Session management
    -   Rate limiting protection
-   👥 User Management
    -   User CRUD operations
    -   Profile management with avatar support
    -   Password management
-   🔑 Role-Based Access Control (RBAC)
    -   Role management
    -   Permission assignment
    -   Dynamic menu access based on roles
-   📱 Responsive Design
    -   Mobile-friendly interface
    -   Adaptive layouts for all screen sizes
-   🎨 Theme Support
    -   Light/Dark mode
    -   Persistent theme settings
-   🌐 Internationalization Ready
    -   Multi-language support
    -   Easy language switching
-   📊 Dynamic Tab Management
    -   Multi-tab support
    -   Tab persistence
-   🔍 Advanced Search Capabilities

    -   Real-time search
    -   Filtered queries
    -   Server-side pagination
    -   Customizable page sizes
    -   Sorting capabilities

-   📝 Comprehensive Audit Logging
    -   Detailed activity tracking
    -   User action history
    -   System change monitoring
    -   Searchable audit logs
    - [ ] Filtered audit reports

- [ ] 📧 Email Notifications
    -   User registration emails
    -   Password reset emails
    -   Notification emails
    -   Customizable email templates

- [ ] Chat System
    -   Real-time messaging
    -   Group chat support
    -   Message history
    -   Message read status
    -   File attachments

## Tech Stack

-   **Vue 3** - Progressive JavaScript Framework
-   **Typescript** - Type safety and better developer experience
-   **Pinia** - State management
-   **Vue Router** - Navigation management
-   **Element Plus** - UI component library
-   **Tailwind CSS** - Utility-first CSS framework
-   **Axios** - HTTP client
-   **Vite** - Build tool and development server

## Prerequisites

-   Node.js (v20.17)
-   npm or yarn
-   Git

## Installation

1. Clone the repository

```bash
git clone [https://github.com/penn201500/vue3-admin-frontend.git](https://github.com/penn201500/vue3-admin-frontend.git)
cd vue3-admin-frontend
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Configure environment variables
   Create a `.env.development` file in the root directory:

```env
# .env.development
VITE_APP_BACKEND_URL=https://localhost:8000
VITE_SSL_KEY_PATH=~/localhost+2-key.pem
VITE_SSL_CERT_PATH=~/localhost+2.pem
```

### How to create SSL certificates

1. Generate a self-signed SSL certificate

```bash
brew install mkcert
mkcert -install  # windows use 'choco install mkcert'
mkcert localhost 127.0.0.1 ::1  # This will generate localhost+2.pem (certificate) and localhost+2-key.pem (key).
```

2. Update the `.env.development` file with the generated SSL certificate paths

3. Update vite.config.ts

```typescript
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd())
    return {
        server: {
            https: {
                key: fs.readFileSync(path.resolve(__dirname, env.VITE_SSL_KEY_PATH)),
                cert: fs.readFileSync(path.resolve(__dirname, env.VITE_SSL_CERT_PATH)),
            },
            port: 3000,
        },
    }
})
```

4. Start development server

```bash
npm run dev
# or
yarn dev
```

## Development

### Project Structure

```
src/
├── assets/          # Static assets
├── components/      # Reusable components
├── layouts/         # Layout components
├── router/          # Route configurations
├── stores/          # Pinia stores
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── views/           # Page components
```

### Adding New Features

1. Create new components in the `components` directory
2. Add new routes in `router/index.ts`
3. Create new stores in `stores` if needed
4. Add new views in the `views` directory

## Contributing

1. Fork the repository or open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE.md) file for details
