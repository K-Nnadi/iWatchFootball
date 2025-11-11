import React, { useState, useRef, useEffect } from 'react';
import { Box, Group, Button, Radio } from '@mantine/core';
import './StadiumMap.css';

interface StadiumSection {
    id: string;
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    category: number;
    available: number;
    price: number;
    highlighted?: boolean;
}

interface StadiumMapProps {
    sections: StadiumSection[];
    onSectionClick?: (sectionId: string) => void;
    selectedSectionId?: string;
    viewMode?: 'zone' | 'block';
    onViewModeChange?: (mode: 'zone' | 'block') => void;
}

export const StadiumMap: React.FC<StadiumMapProps> = ({
    sections,
    onSectionClick,
    selectedSectionId,
    viewMode = 'zone',
    onViewModeChange,
}) => {
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleZoomIn = () => {
        setZoom((prev) => Math.min(prev + 0.2, 3));
    };

    const handleZoomOut = () => {
        setZoom((prev) => Math.max(prev - 0.2, 0.5));
    };

    const handleReset = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 0) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPan({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const getSectionColor = (section: StadiumSection) => {
        if (section.highlighted) return '#00ff88';
        if (section.available === 0) return '#333333';
        if (section.category === 1) return '#1e3a8a';
        if (section.category === 2) return '#1e40af';
        if (section.category === 3) return '#3b82f6';
        if (section.category === 4) return '#60a5fa';
        return '#93c5fd';
    };

    return (
        <Box className="stadium-map-container" ref={containerRef}>
            <Group position="apart" mb="md">
                <Radio.Group
                    value={viewMode}
                    onChange={(value) => onViewModeChange?.(value as 'zone' | 'block')}
                >
                    <Group>
                        <Radio value="zone" label="Tickets by Zone" />
                        <Radio value="block" label="Tickets by Block" />
                    </Group>
                </Radio.Group>
                <Group>
                    <Button size="xs" variant="outline" onClick={handleZoomIn}>
                        +
                    </Button>
                    <Button size="xs" variant="outline" onClick={handleZoomOut}>
                        -
                    </Button>
                    <Button size="xs" variant="outline" onClick={handleReset}>
                        RESET
                    </Button>
                </Group>
            </Group>

            <Box
                className="stadium-map-wrapper"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
                <svg
                    ref={svgRef}
                    viewBox="0 0 800 600"
                    className="stadium-svg"
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: 'center center',
                    }}
                >
                    {/* Pitch */}
                    <rect
                        x="200"
                        y="200"
                        width="400"
                        height="200"
                        fill="#00a651"
                        stroke="#ffffff"
                        strokeWidth="2"
                    />
                    <text
                        x="400"
                        y="300"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="16"
                        fontWeight="bold"
                    >
                        PITCH
                    </text>

                    {/* Stadium Sections */}
                    {sections.map((section) => (
                        <g key={section.id}>
                            <rect
                                x={section.x}
                                y={section.y}
                                width={section.width}
                                height={section.height}
                                fill={getSectionColor(section)}
                                stroke={
                                    selectedSectionId === section.id
                                        ? '#00ff88'
                                        : '#ffffff'
                                }
                                strokeWidth={
                                    selectedSectionId === section.id ? 3 : 1
                                }
                                opacity={section.available === 0 ? 0.3 : 0.8}
                                className="stadium-section"
                                onClick={() => onSectionClick?.(section.id)}
                                style={{ cursor: 'pointer' }}
                            />
                            <text
                                x={section.x + section.width / 2}
                                y={section.y + section.height / 2}
                                textAnchor="middle"
                                fill="#ffffff"
                                fontSize="10"
                                fontWeight="bold"
                                pointerEvents="none"
                            >
                                {section.label}
                            </text>
                        </g>
                    ))}

                    {/* Stand Labels */}
                    <text x="100" y="150" fill="#ffffff" fontSize="14" fontWeight="bold">
                        TRIBUNA
                    </text>
                    <text x="650" y="150" fill="#ffffff" fontSize="14" fontWeight="bold">
                        STAMPA
                    </text>
                </svg>
            </Box>
        </Box>
    );
};

