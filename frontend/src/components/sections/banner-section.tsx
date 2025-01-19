"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BannerItem, getBanner, insertBanner } from "@/config/commissions-config";
import { FaTwitter } from "react-icons/fa";
import { OsuIcon } from "@/components/icons/OsuIcon";

type BannerSectionProps = {
    isAdmin: boolean;
};

export function BannerSection({ isAdmin }: BannerSectionProps) {
    const [banner, setBanner] = useState<BannerItem>({ id: 0, image: "" });
    const [isEditing, setIsEditing] = useState(false);
    const [editValues, setEditValues] = useState({ ...banner });
    const [previewImage, setPreviewImage] = useState("");
    const [isPreviewValid, setIsPreviewValid] = useState(true);

    useEffect(() => {
        async function fetchBanner() {
            const bannerData = await getBanner();
            if (bannerData) {
                setBanner(bannerData);
                setEditValues(bannerData);
            } else {
                const defaultBanner = { id: 0, image: "/placeholder.svg" };
                setBanner(defaultBanner);
                setEditValues(defaultBanner);
            }
        }
        fetchBanner();
    }, []);

    const handleChange = (field: keyof typeof banner, value: string) => {
        setEditValues({ ...editValues, [field]: value });
        setPreviewImage(value);
    };

    const handleImageError = () => {
        setIsPreviewValid(false);
    };

    const handleImageLoad = () => {
        setIsPreviewValid(true);
    };

    const handleSave = async () => {
        if (isPreviewValid) {
            setBanner(editValues);
            await insertBanner({ id: Date.now(), image: editValues.image });
            setIsEditing(false);
        }
    };

    return (
        <header className="relative h-[550px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#A7ABDE]/40 z-10"></div>

            <Image
                src={isEditing ? previewImage || banner.image || "/placeholder.svg" : banner.image || "/placeholder.svg"}
                fill
                alt="Commission Banner"
                className="object-cover"
                priority
                loading="eager"
                onError={handleImageError}
                onLoad={handleImageLoad}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-white">
                <div className="text-center space-y-6 animate-[slideUp_0.5s_ease-out_0.2s_both] bg-black bg-opacity-50 p-8 rounded-md">
                    {isAdmin && isEditing ? (
                        <div className="space-y-4">
                            <Input
                                value={editValues.image}
                                onChange={(e) => handleChange("image", e.target.value)}
                                className="text-xl bg-transparent border-white text-white placeholder-gray-300 w-96"
                                placeholder="Enter image URL"
                            />
                            {!isPreviewValid && <p className="text-red-500">Invalid image URL</p>}
                        </div>
                    ) : (
                        <>
                            <h2 className="text-4xl md:text-5xl font-semibold mb-4 text-white drop-shadow-lg">Triantafyllia</h2>
                            <p className="text-xl md:text-2xl mb-6 text-[#FFD6EE]">I only accept PayPal</p>
                            <div className="flex justify-center space-x-6 animate-[fadeIn_0.5s_ease-out_0.5s_both]">
                                <a href="https://twitter.com/Akariimia" target="_blank" className="text-white hover:text-pink-300 transition-colors">
                                    <FaTwitter size={32} />
                                </a>
                                <a href="https://osu.ppy.sh/u/triantafyllia" target="_blank" className="text-white hover:text-pink-300 transition-colors">
                                    <OsuIcon size={32} />
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
                                    setPreviewImage("");
                                }}
                                className="bg-[#A7ABDE] hover:bg-[#8A8ED8] text-white"
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleSave} className="bg-[#FFD6EE] hover:bg-[#FFC0E6] text-[#4A4A8F]" disabled={!isPreviewValid}>
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
