# Next.js Auth Prisma Starter CLI

A command-line tool to quickly scaffold a Next.js project with authentication, Prisma, and email functionality pre-configured.

## Features

- 🔐 Authentication ready with NextAuth.js
- 📨 Email functionality configured with Resend
- 🔑 OAuth support for Google and GitHub
- 🗃️ Database integration with Prisma
- 🎨 Styled with Tailwind CSS
- 🚀 Quick setup process
- ⚡ Performance optimized
- 📱 Fully responsive

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (version 16.x or higher)
- npm or yarn
- Git

## Installation

Run directly using npx:

```bash
npx @husseinmoqbel7/create-next-auth-starter my-project-name
```

## Usage

1. Create a new project:

```bash
npx @husseinmoqbel7/create-next-auth-starter my-project-name
```

2. Follow the setup steps:

```bash
cd my-project-name
```

3. Configure your environment variables in `.env`:

   - Generate AUTH_SECRET using `npx auth`
   - Set up your database URL
   - Configure OAuth credentials (Google, GitHub)
   - Add Resend API key and email

4. Start the development server:

```bash
npm run dev
```

## Environment Variables

Create a `.env` file in your project root and add the following variables:

```env
DATABASE_URL=""
# Auth Secret from `npx auth`
AUTH_SECRET=""
# Google OAuth Credentials
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
# Github OAuth Credentials
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
# Resend API Key
RESEND_API_KEY=""
# Next.js App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
# Resend Email
RESEND_EMAIL=""
```

## Configuration Guide

### Database Setup

1. Create a database for your project
2. Update `DATABASE_URL` in `.env`
3. Run migrations: `npx prisma migrate dev`

### Authentication Setup

1. Generate AUTH_SECRET:

```bash
npx auth
```

2. Set up Google OAuth:

   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project
   - Enable OAuth 2.0
   - Add credentials to `.env`

3. Set up GitHub OAuth:
   - Go to GitHub Settings > Developer Settings > OAuth Apps
   - Create a new OAuth App
   - Add credentials to `.env`

### Email Setup

1. Create an account at [Resend](https://resend.com)
2. Get your API key
3. Update RESEND_API_KEY and RESEND_EMAIL in `.env`

## Project Structure

```
my-project/
├── app/
│   ├── api/
│   ├── auth/
│   └── ...
├── components/
├── lib/
├── prisma/
├── public/
├── .env
├── .env.example
└── package.json
```

## Features In Detail

### Authentication

- Email/Password authentication
- OAuth providers (Google, GitHub)
- Protected routes
- Session management
- Password reset functionality

### Database

- Prisma ORM integration
- User model pre-configured
- Easy-to-extend schema
- Automatic migrations

### Email

- Transactional email support
- Email templates
- Password reset emails
- Welcome emails

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you find this helpful, please give it a ⭐️ on GitHub!

## Acknowledgments

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Resend](https://resend.com)
- [Tailwind CSS](https://tailwindcss.com)
