import { create } from "zustand";

type CustomThemeProps = {
  border_radius: string;
  background_color: string;
  button_color: string;
  button_text_color: string;
  text_color: string;
};

interface AppearenceState {
  customTheme: CustomThemeProps;
  setCustomTheme: (customTheme: CustomThemeProps) => void;
}

export const useAppearenceStore = create<AppearenceState>()((set, get) => ({
  customTheme: {
    border_radius: "8",
    background_color: "#000000",
    button_color: "#ffffff",
    button_text_color: "#000000",
    text_color: "#000000",
  },
  setCustomTheme: (customTheme) => {
    set({ customTheme });
  },
}));
