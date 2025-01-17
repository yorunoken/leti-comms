"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PricesConfig } from "@/config/commissions-config";

interface OrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    prices: Array<PricesConfig>;
    initialPriceType?: string;
}

export function OrderModal({ isOpen, onClose, prices, initialPriceType }: OrderModalProps) {
    const [selectedPrice, setSelectedPrice] = useState<string>(initialPriceType || "");
    const [discordHandle, setDiscordHandle] = useState("");
    const [email, setEmail] = useState("");
    const [details, setDetails] = useState("");
    const [references, setReferences] = useState("");

    useEffect(() => {
        setSelectedPrice(initialPriceType || "");
    }, [initialPriceType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch("/api/send-commission", {
                method: "POST",
                body: JSON.stringify({ commissionType: selectedPrice, discord: discordHandle, email, commissionDetails: details, references }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Something went wrong. Please try again later.");
                return;
            }

            setSelectedPrice("");
            setDiscordHandle("");
            setEmail("");
            setDetails("");
            setReferences("");

            onClose();
            alert("Successfully sent commission request.");
        } catch (error) {
            console.error("Error submitting commission:", error);
            alert("Failed to submit commission. Please try again later.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center text-[#4A4A8F]">Commission Order</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#4A4A8F] mb-1">Commission Type</label>
                        <select
                            value={selectedPrice}
                            onChange={(e) => setSelectedPrice(e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-[#A7ABDE] focus:outline-none focus:ring-2 focus:ring-[#A7ABDE]"
                            required
                        >
                            <option value="">Select a commission type</option>
                            {prices.map((price) => (
                                <option key={price.id} value={price.type}>
                                    {price.type}: {price.price}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#4A4A8F] mb-1">Discord Handle</label>
                        <Input placeholder="@username" value={discordHandle} onChange={(e) => setDiscordHandle(e.target.value)} required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#4A4A8F] mb-1">Email</label>
                        <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#4A4A8F] mb-1">Commission Details</label>
                        <Textarea placeholder="Please describe what you'd like me to draw..." value={details} onChange={(e) => setDetails(e.target.value)} required rows={4} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#4A4A8F] mb-1">References</label>
                        <Textarea placeholder="Please provide any reference images or inspiration (URLs)" value={references} onChange={(e) => setReferences(e.target.value)} rows={3} />
                    </div>

                    <DialogFooter className="flex gap-2">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" className="cute-button">
                            Submit Order
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
