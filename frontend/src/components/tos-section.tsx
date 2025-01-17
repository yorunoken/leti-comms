"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getTos, deleteTosItem, updateTosItem, insertTosItem, TosItem } from "@/config/commissions-config";

interface TosSectionProps {
    isAdmin: boolean;
}

interface TosItemProps {
    item: TosItem;
    isAdmin: boolean;
    onEdit: (field: keyof TosItem, value: string) => void;
    onSave: () => void;
    onDelete: () => void;
}

export function TosSection({ isAdmin }: TosSectionProps) {
    const [tosItems, setTosItems] = useState<Array<TosItem>>([]);

    useEffect(() => {
        async function fetchTos() {
            const tos = await getTos();
            setTosItems(tos);
        }
        fetchTos();
    }, []);

    const onDragEnd = async (result: DropResult) => {
        if (!result.destination) return;
        const items = Array.from(tosItems);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update the order in the state
        const updatedItems = items.map((item, index) => ({ ...item, order: index }));
        setTosItems(updatedItems);

        // Update the order in the database
        for (const item of updatedItems) {
            await updateTosItem(item.id, { order: item.order });
        }
    };

    const handleEdit = (index: number, field: keyof TosItem, value: string) => {
        const newTosItems = [...tosItems];
        newTosItems[index][field] = value;
        setTosItems(newTosItems);
    };

    const handleSave = async (index: number) => {
        const item = tosItems[index];
        await updateTosItem(item.id, { title: item.title, content: item.content });
    };

    const handleDelete = async (index: number) => {
        const item = tosItems[index];
        const newTosItems = tosItems.filter((_, i) => i !== index);
        setTosItems(newTosItems);
        await deleteTosItem(item.id);
    };

    const handleAddNewItem = async () => {
        const newItem: TosItem = {
            id: Date.now(),
            title: "New title",
            content: "New content",
            order: tosItems.length + 1,
        };

        await insertTosItem(newItem);

        const updatedTosItems = await getTos();
        setTosItems(updatedTosItems);
    };

    return (
        <section id="tos" className="py-16 bg-[#ECD2E0]/20">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8 text-[#A7ABDE]">Terms of Service</h2>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="tos">
                        {(provided) => (
                            <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                                {tosItems.map((item, index) => (
                                    <Draggable key={item.id} draggableId={item.id.toString()} index={index} isDragDisabled={!Boolean(isAdmin)}>
                                        {(provided) => (
                                            <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                <TosItemComponent
                                                    item={item}
                                                    isAdmin={Boolean(isAdmin)}
                                                    onEdit={(field, value) => handleEdit(index, field, value)}
                                                    onSave={() => handleSave(index)}
                                                    onDelete={() => handleDelete(index)}
                                                />
                                            </li>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </ul>
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
            </div>
        </section>
    );
}

function TosItemComponent({ item, isAdmin, onEdit, onSave, onDelete }: TosItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValues, setEditValues] = useState({ title: item.title, content: item.content });

    const handleChange = (field: keyof TosItem, value: string) => {
        setEditValues({ ...editValues, [field]: value });
    };

    const handleSave = () => {
        onEdit("title", editValues.title);
        onEdit("content", editValues.content);
        onSave();
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditValues({ title: item.title, content: item.content });
        setIsEditing(false);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            {isAdmin && isEditing ? (
                <>
                    <Input value={editValues.title} onChange={(e) => handleChange("title", e.target.value)} className="text-lg font-semibold text-[#A7ABDE] mb-2" />
                    <Textarea value={editValues.content} onChange={(e) => handleChange("content", e.target.value)} className="text-[#666]" />
                </>
            ) : (
                <>
                    <h3 className="text-lg font-semibold text-[#A7ABDE] mb-2">{item.title}</h3>
                    <p className="text-[#666]">{item.content}</p>
                </>
            )}
            {isAdmin && (
                <div className="flex gap-2 mt-4">
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
        </div>
    );
}
