// Format price in Indian Rupees
export const formatPrice = (price) => {
  // Handle NaN, null, undefined, or invalid numbers
  const validPrice = isNaN(price) || price === null || price === undefined ? 0 : Number(price);

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(validPrice);
};

// Format date in IST
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
