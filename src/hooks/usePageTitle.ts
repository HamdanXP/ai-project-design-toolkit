import { useEffect } from 'react';

export const usePageTitle = (title: string) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `AI Project Design Toolkit | ${title}`;
    
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};