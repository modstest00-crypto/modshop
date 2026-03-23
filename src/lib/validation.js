/**
 * Validation helpers for ModShop
 */

/**
 * Validate user registration data
 */
export function validateRegistration(data) {
  const errors = {};

  if (!data.username || data.username.length < 3) {
    errors.username = 'Username must be at least 3 characters';
  } else if (data.username.length > 30) {
    errors.username = 'Username must be less than 30 characters';
  } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
    errors.username = 'Username can only contain letters, numbers, and underscores';
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!data.password || data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
    errors.password = 'Password must contain uppercase, lowercase, and number';
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate mod creation data
 */
export function validateMod(data) {
  const errors = {};

  if (!data.title || data.title.length < 3) {
    errors.title = 'Title must be at least 3 characters';
  } else if (data.title.length > 100) {
    errors.title = 'Title must be less than 100 characters';
  }

  if (!data.description || data.description.length < 10) {
    errors.description = 'Description must be at least 10 characters';
  } else if (data.description.length > 2000) {
    errors.description = 'Description must be less than 2000 characters';
  }

  if (data.price !== undefined && data.price !== null) {
    if (data.price < 0) {
      errors.price = 'Price cannot be negative';
    } else if (data.price > 9999.99) {
      errors.price = 'Price is too high';
    }
  }

  if (!data.gameId) {
    errors.gameId = 'Please select a game';
  }

  if (!data.file || !(data.file instanceof File)) {
    errors.file = 'Please upload a file';
  } else if (data.file.size > 1024 * 1024 * 1024) {
    errors.file = 'File size must be less than 1GB';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate store settings
 */
export function validateStoreSettings(data) {
  const errors = {};

  if (!data.storeName || data.storeName.length < 3) {
    errors.storeName = 'Store name must be at least 3 characters';
  } else if (data.storeName.length > 50) {
    errors.storeName = 'Store name must be less than 50 characters';
  }

  if (!data.slug || data.slug.length < 3) {
    errors.slug = 'Store slug must be at least 3 characters';
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
  }

  if (data.bio && data.bio.length > 500) {
    errors.bio = 'Bio must be less than 500 characters';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validate login data
 */
export function validateLogin(data) {
  const errors = {};

  if (!data.email && !data.username) {
    errors.credentials = 'Please enter your email or username';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
