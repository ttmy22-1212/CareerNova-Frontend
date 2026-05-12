"use client";

import {
  DEFAULT_FUNCTION_RETURN,
  UseFunctionReturnType,
} from "@/hooks/use-function";
import { Skill } from "@/types/skill";
import { createContext, useContext } from "react";

interface ContextValue {
  getSkillsApi: UseFunctionReturnType<void, Skill[]>;
}

const MainContext = createContext<ContextValue>({
  getSkillsApi: DEFAULT_FUNCTION_RETURN,
});

export const MainProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <MainContext.Provider
      value={{
        getSkillsApi: DEFAULT_FUNCTION_RETURN,
      }}
    >
      {children}
    </MainContext.Provider>
  );
};

export const useMainContext = () => useContext(MainContext);
