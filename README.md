<div align="center">
  <picture>
  <source media="(prefers-color-scheme: dark)" srcset="./public/assets/pukla-logo-full-green.png" style="max-width: 200px; width: 100%;" width="200">
  <img alt="Pukla Logo'" src="./public/assets/pukla-logo-full-purple.png" style="max-width: 200px; width: 100%;" width="200">
</picture>
  <p><strong>One link to rule them all</strong></p>
  <a href="https://puk.la">puk.la</a>
</div>

---

# Pukla (بكلة)

Pukla is a modern link-in-bio platform that allows users to create a single, customizable page containing all their important links. Built with Next.js and powered by cutting-edge technologies, Pukla provides a seamless experience for managing and sharing your online presence.

## Features

- 🎨 **Customizable Design**: Take full control of your page design with custom colors, layouts, and themes
- 🌐 **Multi-Platform Support**: Integration with major social media, delivery apps, and professional platforms
- 📱 **Responsive Design**: Perfect viewing experience across all devices - mobile, tablet, and desktop
- 📊 **Analytics**: Track your success with real-time analytics and engagement metrics
- 🔒 **Secure**: Built with modern security practices
- 🌍 **Multi-language Support**: Full support for Arabic and English
- 📱 **QR Code Generation**: Generate QR codes for easy offline sharing
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
git clone https://github.com/your-username/pukla.git
cd pukla
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

The application will be available at [http://localhost:3037](http://localhost:3037)

### Docker Deployment

1. Build and run using docker-compose:

```bash
docker-compose up -d
```
  
2. The application will be available at port 3037

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
- Twitter: [@pukla_app](https://twitter.com/pukla_app)
- Instagram: [@pukla_app](https://instagram.com/pukla_app)
- WhatsApp: [+966531045453](https://wa.me/966531045453)
