import React, { createContext, useContext, useState, useEffect } from 'react';

// Creating the context
const WindowSizeContext = createContext({ columnSpan: 6 });

// Context Provider Component
export function WindowSizeProvider({ children }) {
    const [columnSpan, setColumnSpan] = useState(6);

    useEffect(() => {
        const handleResize = () => {
            setColumnSpan(window.innerWidth < 786 ? 12 : 6);
        };

        // Call once on mount to set initial state
        handleResize();

        // Setup event listener
        window.addEventListener('resize', handleResize);

        // Cleanup on unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <WindowSizeContext.Provider value={{ columnSpan }}>
            {children}
        </WindowSizeContext.Provider>
    );
}

// Hook to use the context
export function useWindowSize() {
    return useContext(WindowSizeContext);
}
