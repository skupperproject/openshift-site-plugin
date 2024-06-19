import { useState } from 'react';

type Callback = (value: string) => string | undefined | null | false;

const useValidatedInput = () => {
  const [validated, setValidated] = useState<string | undefined>();

  const validateInput = (value = '', callbacks?: Callback[], validateEmpty = true) => {
    if (!validateEmpty && !value) {
      setValidated(undefined);

      return;
    }

    if (!callbacks) {
      setValidated(value);

      return;
    }

    const errors = callbacks.map((callback) => callback(value)).filter(Boolean);
    if (errors.length) {
      setValidated(errors[0] as string);
    } else {
      setValidated(undefined);
    }
  };

  return { validated, validateInput };
};

export default useValidatedInput;
