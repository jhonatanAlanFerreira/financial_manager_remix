import { createContext, useState, useContext, ReactNode } from "react";
import TitleContextProps from "./title-context-props-interface";

const TitleContext = createContext<TitleContextProps>({
  title: { pageTitle: "" },
  setTitle: () => {},
});

export const TitleProvider = ({ children }: { children: ReactNode }) => {
  const [title, setTitle] = useState({ pageTitle: "" });

  return (
    <TitleContext.Provider value={{ title, setTitle }}>
      {children}
    </TitleContext.Provider>
  );
};

export const useTitle = () => {
  return useContext(TitleContext);
};
