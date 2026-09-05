import { createContext } from "react";

import { IModalContext } from "./ModalProvider.types";

export const ModalContext = createContext<IModalContext | undefined>(undefined);
