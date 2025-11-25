import React, { useState, useRef, useMemo } from 'react';
import { Box, Group, Button, Radio, useMantineColorScheme } from '@mantine/core';
import { SeatsioSeatingChart } from '@seatsio/seatsio-react';
import { getAllSections, getColorByColorName, type StadiumSection } from './anfieldStadium';
import './StadiumMap.css';

interface StadiumMapProps {
    // Legacy props for custom SVG implementation
    sections?: StadiumSection[];
    onSectionClick?: (sectionId: string) => void;
    selectedSectionId?: string;
    viewMode?: 'zone' | 'block';
    onViewModeChange?: (mode: 'zone' | 'block') => void;
    
    // New props for Seats.io integration
    /** Seats.io workspace key (public key) */
    seatsioWorkspaceKey?: string;
    /** Seats.io event key */
    seatsioEventKey?: string;
    /** Seats.io region (e.g., 'eu', 'us', 'sg') */
    seatsioRegion?: string;
    /** JSON configuration for the seating chart (can be stored in DB) */
    seatsioChartJson?: any;
    /** Callback when a seat/object is selected in Seats.io */
    onSeatsioObjectSelected?: (object: any) => void;
    /** Callback when a seat/object is deselected in Seats.io */
    onSeatsioObjectDeselected?: (object: any) => void;
    /** Use Seats.io instead of custom SVG implementation */
    useSeatsio?: boolean;
}

export const StadiumMap: React.FC<StadiumMapProps> = ({
    sections = [],
    onSectionClick,
    selectedSectionId,
    viewMode = 'zone',
    onViewModeChange,
    seatsioWorkspaceKey,
    seatsioEventKey,
    seatsioRegion = 'eu',
    seatsioChartJson,
    onSeatsioObjectSelected,
    onSeatsioObjectDeselected,
    useSeatsio = false,
}) => {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Determine if we should use Seats.io
    const shouldUseSeatsio = useSeatsio && (seatsioWorkspaceKey || seatsioChartJson);

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

    // Use Anfield data if no sections provided, otherwise use provided sections
    const allSections = useMemo(() => {
        if (sections && sections.length > 0) {
            return sections;
        }
        return getAllSections();
    }, [sections]);

    const getSectionColor = (section: StadiumSection & { color?: string }) => {
        if (section.highlighted) return '#00ff88';
        if ((section.available ?? 0) === 0) return isDark ? '#1a1a1a' : '#e0e0e0';
        // Use color from JSON if available
        if (section.color) {
            return getColorByColorName(section.color, isDark);
        }
        // Fallback to category-based colors
        if (section.category === 1) return isDark ? '#dc2626' : '#ef4444';
        if (section.category === 2) return isDark ? '#ea580c' : '#f97316';
        if (section.category === 3) return isDark ? '#14b8a6' : '#2dd4bf';
        if (section.category === 4) return isDark ? '#2563eb' : '#3b82f6';
        return isDark ? '#6b7280' : '#9ca3af';
    };

    const getTextColor = () => isDark ? '#ffffff' : '#000000';
    const getPitchColor = () => isDark ? '#d1d5db' : '#e5e7eb';
    const getPitchLineColor = () => isDark ? '#ffffff' : '#000000';
    const getStadiumBg = () => isDark ? '#0a0a0a' : '#ffffff';

    // Seats.io event handlers
    const handleSeatsioObjectSelected = (object: any) => {
        onSeatsioObjectSelected?.(object);
        // Also call legacy handler if provided
        if (object.label) {
            onSectionClick?.(object.label);
        }
    };

    const handleSeatsioObjectDeselected = (object: any) => {
        onSeatsioObjectDeselected?.(object);
    };

    // Render Seats.io seating chart
    if (shouldUseSeatsio) {
        return (
            <Box className="stadium-map-container" ref={containerRef}>
                <Group justify="space-between" mb="md">
                    {onViewModeChange && (
                        <Radio.Group
                            value={viewMode}
                            onChange={(value) => onViewModeChange?.(value as 'zone' | 'block')}
                        >
                            <Group>
                                <Radio value="zone" label="Tickets by Zone" />
                                <Radio value="block" label="Tickets by Block" />
                            </Group>
                        </Radio.Group>
                    )}
                </Group>

                <Box
                    className="stadium-map-wrapper"
                    style={{ height: '600px', minHeight: '500px' }}
                >
                    <SeatsioSeatingChart
                        workspaceKey={seatsioWorkspaceKey || ''}
                        event={seatsioEventKey || ''}
                        {...(seatsioRegion && { region: seatsioRegion as 'eu' | 'us' | 'sg' })}
                        {...(seatsioChartJson && { chart: seatsioChartJson })}
                        onObjectSelected={handleSeatsioObjectSelected}
                        onObjectDeselected={handleSeatsioObjectDeselected}
                        priceFormatter={(price: number) => `£${price.toFixed(2)}`}
                        showLegend={true}
                        showMinimap={true}
                        showFullScreenButton={true}
                        language="en"
                    />
                </Box>
            </Box>
        );
    }

    // Render custom SVG implementation (legacy)
    return (
        <Box className="stadium-map-container" ref={containerRef}>
            <Group justify="flex-end" mb="md">
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
                style={{ 
                    cursor: isDragging ? 'grabbing' : 'grab',
                    backgroundColor: getStadiumBg(),
                }}
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
                    {/* Stadium Background */}
                    <rect
                        x="0"
                        y="0"
                        width="800"
                        height="600"
                        fill={getStadiumBg()}
                    />

                    {/* Pitch - Rectangular with markings (centered) */}
                    <rect
                        x="280"
                        y="220"
                        width="240"
                        height="160"
                        fill={getPitchColor()}
                        stroke={getPitchLineColor()}
                        strokeWidth="2"
                    />
                    {/* Center Line */}
                    <line
                        x1="400"
                        y1="220"
                        x2="400"
                        y2="380"
                        stroke={getPitchLineColor()}
                        strokeWidth="2"
                    />
                    {/* Center Circle */}
                    <ellipse
                        cx="400"
                        cy="300"
                        rx="40"
                        ry="40"
                        fill="none"
                        stroke={getPitchLineColor()}
                        strokeWidth="2"
                    />
                    {/* Penalty Boxes */}
                    <rect
                        x="280"
                        y="220"
                        width="60"
                        height="160"
                        fill="none"
                        stroke={getPitchLineColor()}
                        strokeWidth="2"
                    />
                    <rect
                        x="460"
                        y="220"
                        width="60"
                        height="160"
                        fill="none"
                        stroke={getPitchLineColor()}
                        strokeWidth="2"
                    />
                    {/* Goal Areas */}
                    <rect
                        x="280"
                        y="260"
                        width="24"
                        height="80"
                        fill="none"
                        stroke={getPitchLineColor()}
                        strokeWidth="2"
                    />
                    <rect
                        x="496"
                        y="260"
                        width="24"
                        height="80"
                        fill="none"
                        stroke={getPitchLineColor()}
                        strokeWidth="2"
                    />

                    {/* Stadium Sections - Rectangular blocks */}
                    {allSections.map((section) => (
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
                                        : isDark 
                                            ? 'rgba(255, 255, 255, 0.2)' 
                                            : 'rgba(0, 0, 0, 0.15)'
                                }
                                strokeWidth={selectedSectionId === section.id ? 2 : 1}
                                opacity={(section.available ?? 0) === 0 ? 0.4 : 0.9}
                                className="stadium-section"
                                onClick={() => onSectionClick?.(section.id)}
                                style={{ cursor: 'pointer' }}
                            />
                            <text
                                x={section.x + section.width / 2}
                                y={section.y + section.height / 2 + 3}
                                textAnchor="middle"
                                fill={getTextColor()}
                                fontSize="9"
                                fontWeight="600"
                                pointerEvents="none"
                                opacity={(section.available ?? 0) === 0 ? 0.5 : 1}
                            >
                                {section.label}
                            </text>
                        </g>
                    ))}

                    {/* Stand Labels */}
                    <text 
                        x="50" 
                        y="150" 
                        fill={getTextColor()} 
                        fontSize="12" 
                        fontWeight="bold"
                        opacity="0.8"
                    >
                        ANFIELD ROAD STAND
                    </text>
                    <text 
                        x="200" 
                        y="70" 
                        fill={getTextColor()} 
                        fontSize="12" 
                        fontWeight="bold"
                        opacity="0.8"
                    >
                        KENNY DALGLISH STAND
                    </text>
                    <text 
                        x="600" 
                        y="200" 
                        fill={getTextColor()} 
                        fontSize="12" 
                        fontWeight="bold"
                        opacity="0.8"
                    >
                        THE KOP
                    </text>
                    <text 
                        x="200" 
                        y="550" 
                        fill={getTextColor()} 
                        fontSize="12" 
                        fontWeight="bold"
                        opacity="0.8"
                    >
                        MAIN STAND
                    </text>
                </svg>
            </Box>
        </Box>
    );
};

