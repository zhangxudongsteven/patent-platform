"use client";

import { createContext, useContext, ReactNode } from "react";
import { useDisclosureWorkflow } from "./useDisclosureWorkflow";

type DisclosureWorkflowContextType = ReturnType<typeof useDisclosureWorkflow>;

const DisclosureContext = createContext<DisclosureWorkflowContextType | null>(
  null,
);

export const DisclosureProvider = ({ children }: { children: ReactNode }) => {
  const workflow = useDisclosureWorkflow();
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
