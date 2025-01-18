"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageModal } from "@/components/modals/image-modal";
import { ArtGallery, getGallery, insertGalleryItem, updateGalleryItem, deleteGalleryItem } from "@/config/commissions-config";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const ITEMS_PER_PAGE = 12;

export function GalleryClient({ isAdmin = false }) {
    const [artworks, setArtworks] = useState<Array<ArtGallery>>([]);
    const [displayedArtworks, setDisplayedArtworks] = useState<Array<ArtGallery>>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const observer = useRef<IntersectionObserver>();
    const lastArtworkRef = useCallback(
        (node: HTMLDivElement) => {
            if (isLoading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    setPage((prevPage) => prevPage + 1);
                }
            });
            if (node) observer.current.observe(node);
        },
        [hasMore, isLoading],
    );

    useEffect(() => {
        const fetchArtworks = async () => {
            const gallery = await getGallery();
            setArtworks(gallery);
        };
        fetchArtworks();
    }, []);

    useEffect(() => {
        setIsLoading(true);
        const start = 0;
        const end = page * ITEMS_PER_PAGE;
        const newArtworks = artworks.slice(start, end);
        setDisplayedArtworks(newArtworks);
        setHasMore(end < artworks.length);
        setIsLoading(false);
    }, [page, artworks]);

    const handleAddNewItem = async () => {
        const newItem: ArtGallery = {
            id: Date.now(),
            image: "/placeholder.svg",
            type: "New Artwork",
            client: "",
            order: artworks.length + 1,
        };

        await insertGalleryItem(newItem);
        const updatedGallery = await getGallery();
        setArtworks(updatedGallery);
    };

    const handleEdit = async (index: number, field: keyof ArtGallery, value: string) => {
        const newArtworks = [...artworks];
        newArtworks[index][field] = value;
        setArtworks(newArtworks);
    };

    const handleSave = async (index: number) => {
        const item = artworks[index];
        await updateGalleryItem(item.id, { image: item.image, type: item.type, client: item.client });
    };

    const handleDelete = async (index: number) => {
        const item = artworks[index];
        const newArtworks = artworks.filter((_, i) => i !== index);
        setArtworks(newArtworks);
        await deleteGalleryItem(item.id);
    };

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-[#4A4A8F]">Full Gallery</h1>
                    <div className="flex gap-4">
                        {isAdmin && (
                            <Button onClick={handleAddNewItem} className="cute-button-secondary">
                                Add New Item
                            </Button>
                        )}
                        <Link href="/">
                            <Button className="cute-button">Back to Home</Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {displayedArtworks.map((artwork, index) => (
                        <GalleryItem
                            key={artwork.id}
                            artwork={artwork}
                            isAdmin={isAdmin}
                            ref={index === displayedArtworks.length - 1 ? lastArtworkRef : undefined}
                            onImageClick={(url, alt) => setSelectedImage({ url, alt })}
                            onEdit={(field, value) => handleEdit(index, field, value)}
                            onSave={() => handleSave(index)}
                            onDelete={() => handleDelete(index)}
                        />
                    ))}
                </div>

                {isLoading && (
                    <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A4A8F] mx-auto"></div>
                    </div>
                )}

                {!hasMore && displayedArtworks.length > 0 && <p className="text-center text-[#666] mt-8">You{"'"}ve reached the end of the gallery!</p>}

                {selectedImage && <ImageModal isOpen={!!selectedImage} onClose={() => setSelectedImage(null)} imageUrl={selectedImage.url} imageAlt={selectedImage.alt} />}
            </div>
        </div>
    );
}

type GalleryItemProps = {
    artwork: ArtGallery;
    isAdmin: boolean;
    onImageClick: (url: string, alt: string) => void;
    onEdit: (field: keyof ArtGallery, value: string) => void;
    onSave: () => void;
    onDelete: () => void;
    ref?: (node: HTMLDivElement) => void;
};

const GalleryItem = React.forwardRef<HTMLDivElement, GalleryItemProps>(({ artwork, isAdmin, onImageClick, onEdit, onSave, onDelete }, ref) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValues, setEditValues] = useState({ image: artwork.image, type: artwork.type, client: artwork.client });

    const handleChange = (field: keyof ArtGallery, value: string) => {
        setEditValues({ ...editValues, [field]: value });
    };

    const handleSave = () => {
        onEdit("image", editValues.image);
        onEdit("type", editValues.type);
        onEdit("client", editValues.client || "");
        onSave();
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditValues({ image: artwork.image, type: artwork.type, client: artwork.client });
        setIsEditing(false);
    };

    return (
        <Card ref={ref} className="overflow-hidden glass-card bg-transparent">
            <CardContent className="p-0">
                <div className="relative aspect-square group overflow-hidden cursor-pointer" onClick={() => !isEditing && onImageClick(editValues.image, editValues.type)}>
                    <Image src={editValues.image || "/placeholder.svg"} alt={editValues.type} fill className="object-cover" unoptimized />
                    {!isEditing && (
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-end">
                            <div className="p-4 w-full text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                <h3 className="font-semibold">{artwork.type}</h3>
                                {artwork.client && <p className="text-sm opacity-90">Client: {artwork.client}</p>}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
            {isAdmin && (
                <CardFooter className="flex flex-col items-start gap-2 p-4">
                    {isEditing ? (
                        <>
                            <Input value={editValues.image} onChange={(e) => handleChange("image", e.target.value)} className="text-[#A7ABDE] font-medium" placeholder="Image URL" />
                            <Input value={editValues.type} onChange={(e) => handleChange("type", e.target.value)} className="text-[#A7ABDE] font-medium" />
                            <Input value={editValues.client || ""} onChange={(e) => handleChange("client", e.target.value)} className="text-sm text-[#666] font-medium" placeholder="Client" />
                            <div className="flex gap-2 mt-2">
                                <Button onClick={handleCancel} className="bg-gray-500 hover:bg-gray-600">
                                    Cancel
                                </Button>
                                <Button onClick={handleSave}>Save</Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex gap-2">
                            <Button onClick={() => setIsEditing(true)}>Edit</Button>
                            <Button variant="destructive" onClick={onDelete}>
                                Delete
                            </Button>
                        </div>
                    )}
                </CardFooter>
            )}
        </Card>
    );
});

GalleryItem.displayName = "GalleryItem";
