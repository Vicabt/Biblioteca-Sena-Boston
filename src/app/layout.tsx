import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Navigation } from "@/components/ui/navigation";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthGuard } from '@/components/auth/auth-guard'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Biblioteca SENA",
  description: "Sistema de Gestión de Biblioteca SENA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={cn(
        'min-h-screen bg-background font-sans antialiased',
        inter.className
      )}>
        <Providers>
          <AuthGuard>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
              <div className="relative flex min-h-screen flex-col">
              <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <div className="container flex h-14 items-center max-w-screen-xl mx-auto px-4">
                  <Navigation />
                  <div className="ml-auto flex items-center space-x-4">
                    <ThemeSwitcher />
                  </div>
                </div>
              </header>
                <main className="flex-1">
                  <div className="container max-w-screen-xl mx-auto px-4 py-6">
                {children}
                  </div>
              </main>
            </div>
            <Toaster richColors position="top-right" />
          </ThemeProvider>
          </AuthGuard>
        </Providers>
      </body>
    </html>
  );
}
