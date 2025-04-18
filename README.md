<div align="center">
  <picture>
  <source media="(prefers-color-scheme: dark)" srcset="./public/assets/tanad-logo-full-green.png" style="max-width: 200px; width: 100%;" width="200">
  <img alt="Tanad  Logo'" src="./public/assets/tanad-logo-full-purple.png" style="max-width: 200px; width: 100%;" width="200">
</picture>
  <p><strong>The backbone of enterprises</strong></p>
  <a href="https://tanad.app">tanad.app</a>
</div>

---

# Tanad (تند)

Tanad is a comprehensive enterprise system offering CRM, ERP, and additional business management functionalities. Built with Next.js and powered by cutting-edge technologies, Tanad provides businesses with a complete suite of tools to manage their operations efficiently.

## Features

- 💼 **Enterprise Management**: Complete suite of tools for business management
- 🔄 **CRM & ERP Integration**: Customer relationship and enterprise resource planning in one platform
- 📱 **Responsive Design**: Perfect viewing experience across all devices - mobile, tablet, and desktop
- 📊 **Advanced Analytics**: Track business metrics with real-time analytics and reporting
- 🔒 **Secure**: Built with modern security practices
- 🌍 **Multi-language Support**: Full support for Arabic and English
- 📋 **Workflow Automation**: Streamline business processes with automated workflows
- ⚡ **Fast Performance**: Optimized for speed and reliability

## Tech Stack

- **Framework**: Next.js (Pages Router)
- **Styling**: TailwindCSS
- **UI Components**: Shadcn UI
- **Database & Auth**: Supabase
- **Forms**: React Hook Form + Zod
- **Internationalization**: next-intl
- **Icons**: Lucide React
- **Deployment**: Docker

## Getting Started

### Prerequisites

- Node.js 22 or later
- npm or yarn
- Docker (for deployment)

### Development Setup

1. Clone the repository:

```bash
git clone https://github.com/your-username/tanad.git
cd tanad
```

2. Install dependencies:

```bash
npm install --legacy-peer-deps
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Fill in the required environment variables:

- NEXT_PUBLIC_APP_URL
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

4. Run the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3036](http://localhost:3036)

### Docker Deployment

1. Build and run using docker-compose:

```bash
docker-compose up -d
```

2. The application will be available at port 3036

## Project Structure

- `/src/pages` - Next.js pages
- `/src/components` - React components
- `/src/lib` - Utility functions and constants
- `/locales` - Translation files (ar.json & en.json)
- `/public` - Static assets

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

Proprietary - © Sikka Software

## Contact

- Email: hello@sikka.io
- Website: https://sikka.io
- Twitter: [@tanad_app](https://twitter.com/tanad_app)
- Instagram: [@tanad_app](https://instagram.com/tanad_app)
- WhatsApp: [+966531045453](https://wa.me/966531045453)
