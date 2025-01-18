import { cookies } from "next/headers";
import { GalleryClient } from "./client";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD as string;

export default async function FullGalleryPage() {
    const cookieStore = await cookies();
    const adminPassword = cookieStore.get("password");

    let isAdmin = false;
    if (ADMIN_PASSWORD === adminPassword?.value) {
        isAdmin = true;
    }

    return <GalleryClient isAdmin={isAdmin} />;
}
