import React, { createContext, useContext, useState, useCallback } from 'react';
import { DiceRoll, RollResult, performRoll } from '../utils/dice';

interface DiceRollerContextValue {
  rollHistory: RollResult[];
  roll: (params: DiceRoll & { description?: string }) => RollResult;
  clearHistory: () => void;
}

const DiceRollerContext = createContext<DiceRollerContextValue | undefined>(undefined);

interface DiceRollerProviderProps {
  children: React.ReactNode;
  maxHistorySize?: number;
}

export function DiceRollerProvider({ children, maxHistorySize = 50 }: DiceRollerProviderProps) {
  const [rollHistory, setRollHistory] = useState<RollResult[]>([]);

  const roll = useCallback(
    (params: DiceRoll & { description?: string }): RollResult => {
      const result = performRoll(params);

      setRollHistory((prev) => {
        const newHistory = [result, ...prev];
        // Limit history size
        return newHistory.slice(0, maxHistorySize);
      });

      return result;
    },
    [maxHistorySize]
  );

  const clearHistory = useCallback(() => {
    setRollHistory([]);
  }, []);

  return (
    <DiceRollerContext.Provider value={{ rollHistory, roll, clearHistory }}>
      {children}
    </DiceRollerContext.Provider>
  );
}

export function useDiceRoller() {
  const context = useContext(DiceRollerContext);
  if (!context) {
    throw new Error('useDiceRoller must be used within a DiceRollerProvider');
  }
  return context;
}
