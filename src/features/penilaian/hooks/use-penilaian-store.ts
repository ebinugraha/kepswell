import { create } from "zustand";
import { PenilaianInput } from "../schema";

interface PenilaianStore {
  selectedData: any | null;
  setSelectedData: (data: any | null) => void;
}

export const usePenilaianStore = create<PenilaianStore>((set) => ({
  selectedData: null,
  setSelectedData: (data) => set({ selectedData: data }),
}));
