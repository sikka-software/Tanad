import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["en", "ar"], // Add your supported locales
  defaultLocale: "ar", // Set your default locale
  localeDetection: false,
});

// Optional: Configure the middleware to exclude certain paths
export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"], // Match all routes except API routes and static files
};
