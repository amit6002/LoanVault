/**
 * ============================================================
 * FORMATTER UTILITIES
 * Pure JavaScript functions to format raw data for Indian banking standards.
 * ============================================================
 */

/**
 * Formats a number as Indian Rupee (INR) currency.
 * Example: 5000000 -> ₹50,00,00,000.00 (depending on decimals) or ₹50,00,000
 * 
 * @param {number|string} amount - The numeric value to format
 * @param {boolean} [includeDecimals=true] - Whether to show paise (.00)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, includeDecimals = true) => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (numericAmount === null || numericAmount === undefined || isNaN(numericAmount)) {
    return '₹0.00';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(numericAmount);
};

/**
 * Formats an ISO date string or Date object into a readable Indian date format.
 * Example: "2026-07-17" -> 17 Jul 2026
 * 
 * @param {string|Date} date - The date to format
 * @param {string} [formatType='medium'] - 'short' (17/07/26), 'medium' (17 Jul 2026), 'long' (17 July 2026)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatType = 'medium') => {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const options = {};
  
  if (formatType === 'short') {
    options.day = '2-digit';
    options.month = '2-digit';
    options.year = '2-digit';
  } else if (formatType === 'medium') {
    options.day = 'numeric';
    options.month = 'short';
    options.year = 'numeric';
  } else if (formatType === 'long') {
    options.day = 'numeric';
    options.month = 'long';
    options.year = 'numeric';
    options.weekday = 'long';
  }

  return new Intl.DateTimeFormat('en-IN', options).format(dateObj);
};

/**
 * Formats a decimal percentage to a displayable percentage format.
 * Example: 0.085 -> 8.5% or 8.50%
 * 
 * @param {number|string} value - The rate (either decimal like 0.085 or actual like 8.5)
 * @param {boolean} [isDecimal=false] - Set to true if interest is passed as 0.085 instead of 8.5
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, isDecimal = false) => {
  const numericVal = typeof value === 'string' ? parseFloat(value) : value;

  if (numericVal === null || numericVal === undefined || isNaN(numericVal)) {
    return '0.00%';
  }

  const percentValue = isDecimal ? numericVal * 100 : numericVal;

  return new Intl.NumberFormat('en-IN', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(percentValue / 100);
};

/**
 * Formats file sizes from raw bytes to readable units (KB, MB).
 * Example: 1048576 -> 1.00 MB
 * 
 * @param {number} bytes - Number of bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  if (!bytes || isNaN(bytes)) return '-';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Capitalizes the first letter of each word in a string (Title Case).
 * Example: "salary slip" -> "Salary Slip", "DRAFT" -> "Draft"
 * 
 * @param {string} text - Text to format
 * @returns {string} Title cased string
 */
export const toTitleCase = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .split('_') // split on underscores (common in DB status constants)
    .join(' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
