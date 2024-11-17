import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { I18nContext } from 'react-i18next';

export const useStringTranslation = () => {
  const context = useContext(I18nContext);

  if (!context) {
    console.error('useTranslation is being called outside of I18nextProvider!');
    throw new Error('useTranslation must be used within an I18nextProvider.');
  }

  const { t } = useTranslation();

  const tString = (key: string, options?: Record<string, any>): string => {
    return t(key, { ...options, returnObjects: false }) as string;
  };

  return { t: tString };
};
