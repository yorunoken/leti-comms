import { useRef, useState, useCallback } from "react";

export function useDragScroll() {
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDragging(true);
        setStartX(e.pageX - (containerRef.current?.offsetLeft || 0));
        setScrollLeft(containerRef.current?.scrollLeft || 0);
    }, []);

    const onMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const onMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (!isDragging) return;
            e.preventDefault();
            if (!containerRef.current) return;
            const x = e.pageX - (containerRef.current.offsetLeft || 0);
            const walk = (x - startX) * 1;
            containerRef.current.scrollLeft = scrollLeft - walk;
        },
        [isDragging, startX, scrollLeft],
    );

    return {
        containerRef,
        onMouseDown,
        onMouseUp,
        onMouseMove,
        isDragging,
    };
}
