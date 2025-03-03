import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { CookiesProvider } from "next-client-cookies/server";

const publicSans = Public_Sans({
    subsets: ["latin"],
    variable: "--public-sans",
});

export const metadata: Metadata = {
    title: "Akariimia",
    description: "",
    icons: {
        icon: [{ url: "/favicon.ico", sizes: "256x256" }],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <script defer src="https://cloud.umami.is/script.js" data-website-id="fd5ab5cf-d626-4df4-b3bf-a5216a907c66"></script>
            </head>
            <body className={`${publicSans.variable} antialiased`}>
                <ThemeProvider attribute="class" defaultTheme="light">
                    <CookiesProvider>
                        <div className="flex flex-col min-h-screen">
                            <main className="flex-grow">{children}</main>
                            <Toaster />
                        </div>
                    </CookiesProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
