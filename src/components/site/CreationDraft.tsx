"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
const Context = createContext<{
  file: File | null;
  setFile: (f: File | null) => void;
  email: string;
  setEmail: (v: string) => void;
} | null>(null);
export function CreationDraftProvider({ children }: { children: ReactNode }) {
  const [file, setFile] = useState<File | null>(null),
    [email, setEmail] = useState("");
  return (
    <Context.Provider value={{ file, setFile, email, setEmail }}>
      {children}
    </Context.Provider>
  );
}
export function useCreationDraft() {
  const value = useContext(Context);
  if (!value) throw Error("CREATION_DRAFT_PROVIDER_MISSING");
  return value;
}
