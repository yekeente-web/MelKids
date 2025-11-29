
// Firebase imports removed due to environment incompatibility.
// Providing mock exports to allow application to run in Local Storage mode.

export const db = null;
export const storage = null;
export const isConfigured = false;

export const getConfigStatus = () => {
  return {
    isConfigured: false, // Forces local mode behavior
    missingKeys: [],
    envVars: []
  };
};
