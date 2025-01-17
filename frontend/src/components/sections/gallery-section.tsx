"use client";

import { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { getGallery, deleteGalleryItem, updateGalleryItem, insertGalleryItem, ArtGallery } from "@/config/commissions-config";
import { ImageModal } from "@/components/modals/image-modal";

type GallerySectionProps = {
    isAdmin: boolean;
};

type GalleryItemProps = {
    item: ArtGallery;
    isAdmin: boolean;
    onEdit: (field: keyof ArtGallery, value: string) => void;
    onImageClick: (imageUrl: string, imageAlt: string) => void;
    onSave: () => void;
    onDelete: () => void;
    provided: any;
    snapshot: any;
};

export function GallerySection({ isAdmin }: GallerySectionProps) {
    const [artGalleryConfig, setArtGalleryConfig] = useState<Array<ArtGallery>>([]);
    const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string } | null>(null);
    const [isReorderMode, setIsReorderMode] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchGallery() {
            const gallery = await getGallery();
            setArtGalleryConfig(gallery);
        }
        fetchGallery();
    }, []);

    const onDragEnd = async (result: DropResult) => {
        if (!result.destination) return;
        const items = Array.from(artGalleryConfig);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const updatedItems = items.map((item, index) => ({ ...item, order: index }));
        setArtGalleryConfig(updatedItems);

        for (const item of updatedItems) {
            await updateGalleryItem(item.id, { order: item.order });
        }
    };

    const handleEdit = (index: number, field: keyof ArtGallery, value: string) => {
        const newGallery = [...artGalleryConfig];
        newGallery[index][field] = value;
        setArtGalleryConfig(newGallery);
    };

    const handleSave = async (index: number) => {
        const item = artGalleryConfig[index];
        await updateGalleryItem(item.id, { image: item.image, type: item.type, client: item.client });
    };

    const handleDelete = async (index: number) => {
        const item = artGalleryConfig[index];
        const newGallery = artGalleryConfig.filter((_, i) => i !== index);
        setArtGalleryConfig(newGallery);
        await deleteGalleryItem(item.id);
    };

    const handleAddNewItem = async () => {
        const newItem: ArtGallery = {
            id: Date.now(),
            image: "/placeholder.svg",
            type: "New Artwork",
            client: "",
            order: artGalleryConfig.length + 1,
        };

        await insertGalleryItem(newItem);

        const updatedGallery = await getGallery();
        setArtGalleryConfig(updatedGallery);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (containerRef.current && !isReorderMode) {
            containerRef.current.style.cursor = "grabbing";
            containerRef.current.style.userSelect = "none";

            const startX = e.pageX - containerRef.current.offsetLeft;
            const scrollLeft = containerRef.current.scrollLeft;

            const handleMouseMove = (e: MouseEvent) => {
                const x = e.pageX - containerRef.current!.offsetLeft;
                const walk = (x - startX) * 1.5;
                containerRef.current!.scrollLeft = scrollLeft - walk;
            };

            const handleMouseUp = () => {
                containerRef.current!.style.cursor = "grab";
                containerRef.current!.style.removeProperty("user-select");

                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
            };

            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
        }
    };

    return (
        <section id="gallery" className="py-16 bg-[#ECD2E0]/20">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8 text-[#4A4A8F]">Art Gallery</h2>
                {artGalleryConfig.length > 0 ? (
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="gallery" direction="horizontal">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={(el) => {
                                        provided.innerRef(el);
                                        containerRef.current = el;
                                    }}
                                    className={`flex gap-6 overflow-x-auto scrollbar-thin scrollbar-thumb-[#A7ABDE] scrollbar-track-transparent pb-4 ${
                                        isReorderMode ? "" : "cursor-grab active:cursor-grabbing"
                                    }`}
                                    onMouseDown={!isReorderMode ? handleMouseDown : undefined}
                                >
                                    {artGalleryConfig.slice(0, 10).map((item, index) => (
                                        <Draggable key={item.id} draggableId={item.id.toString()} index={index} isDragDisabled={!isAdmin || !isReorderMode}>
                                            {(provided, snapshot) => (
                                                <div ref={provided.innerRef} {...provided.draggableProps} {...(isReorderMode ? provided.dragHandleProps : {})}>
                                                    <GalleryItem
                                                        item={item}
                                                        isAdmin={Boolean(isAdmin)}
                                                        onEdit={(field, value) => handleEdit(index, field, value)}
                                                        onSave={() => handleSave(index)}
                                                        onDelete={() => handleDelete(index)}
                                                        onImageClick={(url, alt) => setSelectedImage({ url, alt })}
                                                        provided={provided}
                                                        snapshot={snapshot}
                                                    />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                ) : (
                    <p className="text-center text-[#666] font-medium">No artworks available at the moment.</p>
                )}
                {isAdmin && (
                    <div className="text-center mt-8">
                        <Button onClick={handleAddNewItem} className="cute-button-secondary">
                            Add New Item
                        </Button>
                        <Button onClick={() => setIsReorderMode(!isReorderMode)} className="cute-button-secondary ml-4">
                            {isReorderMode ? "Switch to Scroll Mode" : "Switch to Reorder Mode"}
                        </Button>
                    </div>
                )}
                <div className="text-center mt-8">
                    <Link href="/full-gallery">
                        <Button className="cute-button-secondary">View Full Gallery</Button>
                    </Link>
                </div>
            </div>
            {selectedImage && <ImageModal isOpen={!!selectedImage} onClose={() => setSelectedImage(null)} imageUrl={selectedImage.url} imageAlt={selectedImage.alt} />}
        </section>
    );
}

function GalleryItem({ item, isAdmin, onEdit, onImageClick, onSave, onDelete, provided, snapshot }: GalleryItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValues, setEditValues] = useState({ image: item.image, type: item.type, client: item.client });

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
        setEditValues({ image: item.image, type: item.type, client: item.client });
        setIsEditing(false);
    };

    return (
        <Card className={`flex-none w-[300px] overflow-hidden glass-card bg-transparent ${snapshot.isDragging ? "dragging" : ""}`}>
            <CardContent className="p-0">
                <div className="relative aspect-[3/4] cursor-pointer" {...provided.dragHandleProps} onClick={() => onImageClick(editValues.image, editValues.type)}>
                    <Image src={editValues.image || "/placeholder.svg"} alt={editValues.type} layout="fill" objectFit="cover" onDragStart={(e) => e.preventDefault()} unoptimized />
                </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-2 p-4">
                {isAdmin && isEditing ? (
                    <>
                        <Input value={editValues.image} onChange={(e) => handleChange("image", e.target.value)} className="text-[#A7ABDE] font-medium" placeholder="Image URL" />
                        <Input value={editValues.type} onChange={(e) => handleChange("type", e.target.value)} className="text-[#A7ABDE] font-medium" />
                        <Input value={editValues.client || ""} onChange={(e) => handleChange("client", e.target.value)} className="text-sm text-[#666] font-medium" placeholder="Client" />
                    </>
                ) : (
                    <>
                        <h3 className="text-[#4A4A8F] font-medium">{item.type}</h3>
                        {item.client && <p className="text-sm text-[#666] font-medium">Client: {item.client}</p>}
                    </>
                )}
                {isAdmin && (
                    <div className="flex gap-2 mt-2">
                        {isEditing ? (
                            <>
                                <Button onClick={handleCancel} className="bg-gray-500 hover:bg-gray-600">
                                    Cancel
                                </Button>
                                <Button onClick={handleSave}>Save</Button>
                            </>
                        ) : (
                            <Button onClick={() => setIsEditing(true)}>Edit</Button>
                        )}
                        <Button variant="destructive" onClick={onDelete}>
                            Delete
                        </Button>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
