"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BannerItem, getBanner, insertBanner } from "@/config/commissions-config";
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
        <header className="relative h-[550px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#A7ABDE]/80 z-10"></div>
            <Image src={banner.image || "/placeholder.svg"} fill alt="Commission Banner" className="object-cover" priority unoptimized />
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-white">
                <div className="text-center space-y-6 animate-[slideUp_0.5s_ease-out_0.2s_both] bg-black bg-opacity-25 p-8 rounded-md">
                    {isAdmin && isEditing ? (
                        <Input
                            value={editValues.image}
                            onChange={(e) => handleChange("image", e.target.value)}
                            className="text-xl bg-transparent border-white text-white placeholder-gray-300 w-96"
                            placeholder="Enter image URL"
                        />
                    ) : (
                        <>
                            <h2 className="text-4xl md:text-5xl font-semibold mb-4 text-white drop-shadow-lg">Triantafyllia</h2>
                            <p className="text-xl md:text-2xl mb-6 text-[#FFD6EE]">I only accept PayPal</p>
                            <div className="flex justify-center space-x-6 animate-[fadeIn_0.5s_ease-out_0.5s_both]">
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
                <div className="absolute bottom-4 right-4 space-x-2 z-30">
                    {isEditing ? (
                        <>
                            <Button
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditValues(banner);
                                }}
                                className="bg-[#A7ABDE] hover:bg-[#8A8ED8] text-white"
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleSave} className="bg-[#FFD6EE] hover:bg-[#FFC0E6] text-[#4A4A8F]">
                                Save
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditing(true)} className="bg-[#FFD6EE] hover:bg-[#FFC0E6] text-[#4A4A8F]">
                            Edit
                        </Button>
                    )}
                </div>
            )}
        </header>
    );
}
