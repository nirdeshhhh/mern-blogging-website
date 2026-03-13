const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const getDay = (timestamp) => {
  if (!timestamp) return "Invalid Date";
  
  try {
    // Handle Firebase timestamps
    if (typeof timestamp === 'object' && timestamp.seconds) {
      timestamp = timestamp.seconds * 1000;
    }
    
    const date = new Date(timestamp);
    
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    
    return `${date.getDate()} ${months[date.getMonth()]}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

export const getFullDay = (timestamp) => {
  if (!timestamp) return "Invalid Date";
  
  try {
    // Handle Firebase timestamps
    if (typeof timestamp === 'object' && timestamp.seconds) {
      timestamp = timestamp.seconds * 1000;
    }
    
    const date = new Date(timestamp);
    
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

export const getFullDayWithWeekday = (timestamp) => {
  if (!timestamp) return "Invalid Date";
  
  try {
    // Handle Firebase timestamps
    if (typeof timestamp === 'object' && timestamp.seconds) {
      timestamp = timestamp.seconds * 1000;
    }
    
    const date = new Date(timestamp);
    
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    
    const dayOfWeek = days[date.getDay()];
    return `${dayOfWeek}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

// Export all functions at once
export default {
  getDay,
  getFullDay,
  getFullDayWithWeekday
};