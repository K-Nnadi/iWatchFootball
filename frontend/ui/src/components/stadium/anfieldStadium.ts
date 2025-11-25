import anfieldData from './anfieldStadium.json';

export interface StadiumSection {
    id: string;
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    category: number;
    tier: 'upper' | 'middle' | 'lower';
    color: string;
    available?: number;
    price?: number;
    highlighted?: boolean;
}

export interface StadiumStand {
    name: string;
    position: 'top' | 'bottom' | 'left' | 'right';
    sections: StadiumSection[];
}

export interface StadiumData {
    name: string;
    venue: string;
    pitch: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    stands: StadiumStand[];
}

export const anfieldStadium: StadiumData = anfieldData as StadiumData;

// Helper function to get all sections flattened
export const getAllSections = (): StadiumSection[] => {
    return anfieldStadium.stands.flatMap(stand => 
        stand.sections.map(section => ({
            ...section,
            available: section.available ?? Math.floor(Math.random() * 20) + 5,
            price: section.price ?? (section.category === 1 ? 485 : section.category === 2 ? 420 : section.category === 3 ? 374 : 245),
        }))
    );
};

// Helper function to get color by color name
export const getColorByColorName = (colorName: string, isDark: boolean): string => {
    const colorMap: Record<string, { dark: string; light: string }> = {
        'red': { dark: '#dc2626', light: '#ef4444' },
        'orange': { dark: '#ea580c', light: '#f97316' },
        'blue': { dark: '#2563eb', light: '#3b82f6' },
        'teal': { dark: '#14b8a6', light: '#2dd4bf' },
        'dark-purple': { dark: '#7c3aed', light: '#8b5cf6' },
        'light-green': { dark: '#22c55e', light: '#4ade80' },
    };
    
    const colors = colorMap[colorName] || { dark: '#6b7280', light: '#9ca3af' };
    return isDark ? colors.dark : colors.light;
};

export default anfieldStadium;

