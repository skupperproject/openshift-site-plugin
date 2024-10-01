import { useContext } from 'react';

import { FormContext } from '../context/LinkFormProvider';

export const useLinkForm = () => useContext(FormContext);
