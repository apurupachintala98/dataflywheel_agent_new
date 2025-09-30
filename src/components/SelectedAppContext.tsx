import React, { createContext, useContext, useState, ReactNode } from "react";

interface DbDetails {
  database_nm: string;
  schema_nm: string;
}

interface SelectedAppContextType {
  selectedAppId: string;
  setSelectedAppId: (id: string) => void;
  dbDetails: DbDetails;
  setDbDetails: React.Dispatch<React.SetStateAction<DbDetails>>;
  environment: string;
  setEnvironment: (env: string) => void;
  appLvlPrefix: string;
  setAppLvlPrefix: (prefix: string) => void;
}


const SelectedAppContext = createContext<SelectedAppContextType | undefined>(undefined);

export const SelectedAppProvider = ({ children }: { children: ReactNode }) => {
  const [selectedAppId, _setSelectedAppId] = useState("");
  const [dbDetails, setDbDetails] = useState<DbDetails>({ database_nm: "", schema_nm: "" });
  const [environment, setEnvironment] = useState("");
  const [appLvlPrefix, setAppLvlPrefix] = useState("");
  const setSelectedAppId = (id: string) => {
    _setSelectedAppId(id?.trim());
  };

  return (
    <SelectedAppContext.Provider value={{ selectedAppId, setSelectedAppId, dbDetails, setDbDetails, environment, setEnvironment, appLvlPrefix, setAppLvlPrefix }}>
      {children}
    </SelectedAppContext.Provider>
  );
};

export const useSelectedApp = (): SelectedAppContextType => {
  const context = useContext(SelectedAppContext);
  if (!context) {
    throw new Error("useSelectedApp must be used within a SelectedAppProvider");
  }
  return context;
};
