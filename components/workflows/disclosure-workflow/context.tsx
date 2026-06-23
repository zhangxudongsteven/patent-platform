"use client";

import { createContext, useContext, ReactNode } from "react";
import { useDisclosureWorkflow } from "./useDisclosureWorkflow";

type DisclosureWorkflowContextType = ReturnType<typeof useDisclosureWorkflow>;

const DisclosureContext = createContext<DisclosureWorkflowContextType | null>(
  null,
);

interface DisclosureProviderProps {
  children: ReactNode;
  initialStep?: 1 | 2 | 3 | 4 | 5;
  initialData?: any;
  chatId?: string;
}

export const DisclosureProvider = ({ children, initialStep, initialData, chatId }: DisclosureProviderProps) => {
  const workflow = useDisclosureWorkflow(initialStep, initialData, chatId);
  return (
    <DisclosureContext.Provider value={workflow}>
      {children}
    </DisclosureContext.Provider>
  );
};

export const useDisclosureContext = () => {
  const context = useContext(DisclosureContext);
  if (!context) {
    throw new Error(
      "useDisclosureContext must be used within a DisclosureProvider",
    );
  }
  return context;
};
