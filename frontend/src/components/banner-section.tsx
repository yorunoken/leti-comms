"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BannerItem, getBanner, insertBanner, updateBanner } from "@/config/commissions-config";
import { FaPaypal, FaInstagram, FaTwitter, FaDeviantart } from "react-icons/fa";

type BannerSectionProps = {
    isAdmin: boolean;
};

export function BannerSection({ isAdmin }: BannerSectionProps) {
    const [banner, setBanner] = useState<BannerItem>({ id: 0, image: "" });
    const [isEditing, setIsEditing] = useState(false);
    const [editValues, setEditValues] = useState({ ...banner });

    useEffect(() => {
        async function fetchBanner() {
            const bannerData = await getBanner();
            setBanner(bannerData);
            setEditValues(bannerData);
        }
        fetchBanner();
    }, []);

    const handleChange = (field: keyof typeof banner, value: string) => {
        setEditValues({ ...editValues, [field]: value });
    };

    const handleSave = async () => {
        setBanner(editValues);
        await insertBanner({ id: Date.now(), image: editValues.image });
        setIsEditing(false);
    };

    return (
        <header className="relative h-[550px]">
            <Image src={banner.image || "/placeholder.svg"} fill alt="Commission Banner" className="object-cover" priority unoptimized />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
                <div className="text-center space-y-6">
                    {isAdmin && isEditing ? (
                        <Input
                            value={editValues.image}
                            onChange={(e) => handleChange("image", e.target.value)}
                            className="text-xl bg-transparent border-white text-white placeholder-gray-300 w-96"
                            placeholder="Enter image URL"
                        />
                    ) : (
                        <>
                            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-pink-300">Triantafyllia</h2>
                            <p className="text-xl md:text-2xl mb-6">I only accept PayPal</p>
                            <div className="flex justify-center space-x-6">
                                <a href="#" className="text-white hover:text-pink-300 transition-colors">
                                    <FaPaypal size={32} />
                                </a>
                                <a href="#" className="text-white hover:text-pink-300 transition-colors">
                                    <FaInstagram size={32} />
                                </a>
                                <a href="#" className="text-white hover:text-pink-300 transition-colors">
                                    <FaTwitter size={32} />
                                </a>
                                <a href="#" className="text-white hover:text-pink-300 transition-colors">
                                    <FaDeviantart size={32} />
                                </a>
                            </div>
                        </>
                    )}
                </div>
            </div>
            {isAdmin && (
                <div className="absolute bottom-4 right-4 space-x-2">
                    {isEditing ? (
                        <>
                            <Button
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditValues(banner);
                                }}
                                className="bg-gray-500 hover:bg-gray-600"
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleSave} className="text-black">
                                Save
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditing(true)} className="text-black">
                            Edit
                        </Button>
                    )}
                </div>
            )}
        </header>
    );
}
