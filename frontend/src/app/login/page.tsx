"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCookies } from "next-client-cookies";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [password, setPassword] = useState("");
    const cookiesStore = useCookies();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch("/api/test-password", {
            method: "POST",
            body: JSON.stringify({ password }),
        });

        if (!res.ok) {
            console.log(res);
        }

        const data = await res.json();
        console.log(data);

        if (data.success) {
            cookiesStore.set("password", password);
            router.push("/");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <form onSubmit={handleLogin} className="bg-card p-8 rounded-lg cute-shadow cute-border max-w-md w-full">
                <h2 className="text-2xl font-bold text-center mb-6 text-foreground">Admin Login</h2>
                <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                    />
                </div>
                <Button type="submit" className="w-full cute-button">
                    Login
                </Button>
            </form>
        </div>
    );
}
