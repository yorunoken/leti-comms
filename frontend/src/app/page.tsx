import { PricesSection } from "@/components/sections/prices-section";
import { GallerySection } from "@/components/sections/gallery-section";
import { TosSection } from "@/components/sections/tos-section";
import { cookies } from "next/headers";
import { LogoutButton } from "@/components/logout-button";
import { BannerSection } from "@/components/sections/banner-section";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD as string;

export default async function Home() {
    const cookieStore = await cookies();
    const adminPassword = cookieStore.get("password");

    let isAdmin = false;
    if (ADMIN_PASSWORD === adminPassword?.value) {
        isAdmin = true;
    }

    return (
        <div className="min-h-screen bg-background">
            <BannerSection isAdmin={isAdmin} />
            {isAdmin && <LogoutButton />}

            <main>
                <PricesSection isAdmin={isAdmin} />
                <GallerySection isAdmin={isAdmin} />
                <TosSection isAdmin={isAdmin} />
            </main>

            <footer className="bg-primary/80 border-t text-[#666] py-8">
                <div className="container mx-auto px-4 text-center">
                    <p className="font-medium">With love..</p>
                    <p className="font-medium">- Leti</p>
                </div>
            </footer>
        </div>
    );
}
