"use client";

import { Button } from "@/components/ui/button";
import { useCookies } from "next-client-cookies";

export function LogoutButton() {
    const cookiesStore = useCookies();

    return (
        <Button
            className="absolute top-4 right-4 z-30"
            type="submit"
            variant="secondary"
            onClick={() => {
                cookiesStore.set("password", "");
                window.location.reload();
            }}
        >
            Logout
        </Button>
    );
}
