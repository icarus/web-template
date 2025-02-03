import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface MousePosition {
  x: number;
  y: number;
  normalizedX: number;
  normalizedY: number;
  isAvailable: boolean;
}

interface MouseContextType {
  mousePosition: MousePosition;
  updateMousePosition: (x: number, y: number) => void;
}

const defaultMousePosition: MousePosition = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  normalizedX: 0,
  normalizedY: 0,
  isAvailable: false
};

const MouseContext = createContext<MouseContextType | undefined>(undefined);

export function MouseProvider({ children }: { children: ReactNode }) {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    ...defaultMousePosition,
    isAvailable: false
  });

  const updateMousePosition = useCallback((x: number, y: number) => {
    // Calculate normalized coordinates (-1 to 1)
    const normalizedX = (x / window.innerWidth) * 2 - 1;
    const normalizedY = -(y / window.innerHeight) * 2 + 1;

    setMousePosition({
      x,
      y,
      normalizedX,
      normalizedY,
      isAvailable: true
    });
  }, []);

  return (
    <MouseContext.Provider value={{ mousePosition, updateMousePosition }}>
      {children}
    </MouseContext.Provider>
  );
}

export function useMousePosition() {
  const context = useContext(MouseContext);
  if (context === undefined) {
    throw new Error('useMousePosition must be used within a MouseProvider');
  }
  return context;
}
