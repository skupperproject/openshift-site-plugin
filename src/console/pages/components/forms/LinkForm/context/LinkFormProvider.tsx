import React, { useState, FC, useReducer, createContext, ReactNode } from 'react';

const DEFAULT_COST = '1';

const initialState = {
  name: '',
  cost: DEFAULT_COST,
  fileName: '',
  fileContent: ''
};

interface FormState {
  name: string;
  cost: string;
  fileName: string;
  fileContent: string;
}

type FormAction =
  | { type: 'SET_FILE_NAME'; payload: string }
  | { type: 'SET_FILE_CONTENT'; payload: string }
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_COST'; payload: string };

// Reducer function to update form fields
function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, name: action.payload };
    case 'SET_COST':
      return { ...state, cost: action.payload };
    case 'SET_FILE_NAME':
      return { ...state, fileName: action.payload };
    case 'SET_FILE_CONTENT':
      return { ...state, fileContent: action.payload };
    default:
      return state;
  }
}

export const FormContext = createContext<{
  state: FormState;
  dispatch: React.Dispatch<FormAction>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  validated: string | undefined;
  setValidated: React.Dispatch<React.SetStateAction<string | undefined>>;
}>({
  state: initialState,
  dispatch: () => {},
  isLoading: false,
  setIsLoading: () => {},
  validated: undefined,
  setValidated: () => {}
});

export const FormProvider: FC<{ children: ReactNode }> = function ({ children }) {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [validated, setValidated] = useState<string | undefined>(undefined);

  return (
    <FormContext.Provider value={{ state, dispatch, isLoading, setIsLoading, validated, setValidated }}>
      {children}
    </FormContext.Provider>
  );
};
