"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided, DroppableProvided } from "react-beautiful-dnd";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { getPrices, PricesConfig, insertPrice, deletePrice, updatePrice } from "@/config/commissions-config";
import { ImageModal } from "./image-modal";

type PricesSectionProps = {
    isAdmin: boolean;
};

type PriceCardProps = {
    price: PricesConfig;
    isAdmin: boolean;
    onEdit: (field: keyof PricesConfig, value: string) => void;
    onDelete: () => void;
    onImageClick: (imageUrl: string, imageAlt: string) => void;
};

export function PricesSection({ isAdmin }: PricesSectionProps) {
    const [prices, setPrices] = useState<Array<PricesConfig>>([]);
    const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string } | null>(null);

    useEffect(() => {
        async function fetchGallery() {
            const prices = await getPrices();
            setPrices(prices);
        }
        fetchGallery();
    }, []);

    const onDragEnd = async (result: DropResult) => {
        if (!result.destination) return;
        const items = Array.from(prices);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setPrices(items);

        await Promise.all(items.map((item, index) => updatePrice(item.id, { ...item, order: index + 1 })));
    };

    const handleEdit = async (index: number, field: keyof PricesConfig, value: string) => {
        const newPrices = [...prices];
        newPrices[index][field] = value as never;
        setPrices(newPrices);
        await updatePrice(newPrices[index].id, newPrices[index]);
    };

    const handleDelete = async (index: number) => {
        const item = prices[index];
        const newPrices = prices.filter((_, i) => i !== index);
        setPrices(newPrices);
        await deletePrice(item.id);
    };

    const handleAddNewItem = async () => {
        const newItem: PricesConfig = {
            id: Date.now(),
            type: "New Type",
            description: "New Description",
            price: "New Price",
            image: "/placeholder.svg",
            order: prices.length + 1,
        };
        await insertPrice(newItem);
        setPrices([...prices, newItem]);
    };

    return (
        <section id="prices" className="py-16">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-2 text-[#4A4A8F]">Pricing</h2>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="prices">
                        {(provided: DroppableProvided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {prices.map((price, index) => (
                                    <Draggable key={price.id} draggableId={price.id.toString()} index={index} isDragDisabled={!Boolean(isAdmin)}>
                                        {(provided: DraggableProvided) => (
                                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                <PriceCard
                                                    price={price}
                                                    isAdmin={Boolean(isAdmin)}
                                                    onEdit={(field, value) => handleEdit(index, field, value)}
                                                    onDelete={() => handleDelete(index)}
                                                    onImageClick={(url, alt) => setSelectedImage({ url, alt })}
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
                {isAdmin && (
                    <div className="text-center mt-8">
                        <Button onClick={handleAddNewItem} className="cute-button-secondary">
                            Add New Item
                        </Button>
                    </div>
                )}
                {selectedImage && <ImageModal isOpen={!!selectedImage} onClose={() => setSelectedImage(null)} imageUrl={selectedImage.url} imageAlt={selectedImage.alt} />}
            </div>
        </section>
    );
}

function PriceCard({ price, isAdmin, onEdit, onDelete, onImageClick }: PriceCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValues, setEditValues] = useState({ ...price });

    const handleChange = (field: keyof PricesConfig, value: string) => {
        setEditValues({ ...editValues, [field]: value });
    };

    const handleSave = async () => {
        onEdit("type", editValues.type);
        onEdit("description", editValues.description);
        onEdit("price", editValues.price);
        onEdit("image", editValues.image);
        await updatePrice(price.id, editValues);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditValues({ ...price });
        setIsEditing(false);
    };

    return (
        <Card className="glass-card bg-transparent flex flex-col animate-[fadeIn_0.5s_ease-out]">
            <CardHeader>
                {isAdmin && isEditing ? (
                    <Input value={editValues.type} onChange={(e) => handleChange("type", e.target.value)} className="text-2xl font-bold text-[#A7ABDE]" />
                ) : (
                    <CardTitle className="text-2xl font-bold text-center text-[#4A4A8F]">{price.type}</CardTitle>
                )}
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="aspect-square mb-4 overflow-hidden rounded-lg cursor-pointer" onClick={() => !isEditing && onImageClick(editValues.image, price.type)}>
                    <Image src={editValues.image || "/placeholder.svg"} width={9999} height={9999} alt={`${price.type} Example`} className="w-full h-full object-cover" />
                </div>
                {isAdmin && isEditing ? (
                    <>
                        <Input value={editValues.image} onChange={(e) => handleChange("image", e.target.value)} className="text-[#A7ABDE] font-medium" placeholder="Image URL" />
                        <Textarea value={editValues.description} onChange={(e) => handleChange("description", e.target.value)} className="text-[#666] mb-4" />
                        <Input value={editValues.price} onChange={(e) => handleChange("price", e.target.value)} className="text-2xl font-bold text-[#A7ABDE]" />
                    </>
                ) : (
                    <>
                        <p className="text-[#666] mb-4 text-center">{price.description}</p>
                        <p className="text-2xl font-bold text-center text-[#4A4A8F]">{price.price}</p>
                    </>
                )}
            </CardContent>
            {isAdmin ? (
                <CardFooter className="space-x-2 flex justify-center">
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
                </CardFooter>
            ) : (
                <CardFooter>
                    <Button className="w-full bg-[#A7ABDE] hover:bg-[#8A8ED8] text-white transition-all duration-300 transform hover:scale-105">Order</Button>
                </CardFooter>
            )}
        </Card>
    );
}
