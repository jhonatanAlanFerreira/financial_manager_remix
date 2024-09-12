import { createContext, useState, useContext, ReactNode } from "react";
import TitleContextProps from "~/interfaces/componentsProps/TitleContextProps";

const TitleContext = createContext<TitleContextProps>({
  title: "",
  setTitle: () => {},
});

export const TitleProvider = ({ children }: { children: ReactNode }) => {
  const [title, setTitle] = useState("");

  return (
    <TitleContext.Provider value={{ title, setTitle }}>
      {children}
    </TitleContext.Provider>
  );
};

export const useTitle = () => {
  return useContext(TitleContext);
};
