"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import Image from "next/image";

interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    imageAlt: string;
}

export function ImageModal({ isOpen, onClose, imageUrl, imageAlt }: ImageModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-auto bg-black">
                <div className="relative flex items-center justify-center bg-opacity-0">
                    <Image
                        src={imageUrl}
                        alt={imageAlt}
                        width={1920}
                        height={1080}
                        style={{
                            maxWidth: "90vw",
                            maxHeight: "90vh",
                            width: "auto",
                            height: "auto",
                            objectFit: "contain",
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
