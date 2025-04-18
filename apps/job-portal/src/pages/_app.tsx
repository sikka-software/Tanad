import "@/styles/globals.css";
import { QueryProvider } from "../providers/query-provider";
import type { AppProps } from "next/app";
import Navbar from "@/components/ui/navbar";
import { ThemeProvider } from "next-themes";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Navbar />
        <Component {...pageProps} />
      </ThemeProvider>
    </QueryProvider>
  );
}
