// --- Currency and Formatting Utilities ---

/**
 * Strips the currency symbol and format, leaving only the localized number.
 * Useful for displaying just the value part cleanly.
 */
export const formatValueOnly = (
    value: number | string | null | undefined, 
    locale: string = 'en-US'
  ): string => {
    if (value === null || value === undefined) return '';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Handle NaN/invalid number case
    if (isNaN(numValue)) return '';
  
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue);
  };