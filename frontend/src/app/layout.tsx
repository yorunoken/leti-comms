import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const publicSans = Public_Sans({
    subsets: ["latin"],
    variable: "--public-sans",
});

export const metadata: Metadata = {
    title: "Leti!",
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
            <head>{/* <script src="https://unpkg.com/react-scan/dist/auto.global.js" async></script> */}</head>
            <body className={`${publicSans.variable} antialiased`}>
                <ThemeProvider attribute="class" defaultTheme="light">
                    <div className="flex flex-col min-h-screen">
                        <main className="flex-grow">{children}</main>
                        <Toaster />
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
