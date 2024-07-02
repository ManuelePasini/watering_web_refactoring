// Utility function to get a nested property
export function getNestedProperty(obj, keyPath) {
    return keyPath.split('.').reduce((acc, key) => {
        return acc && acc[key] !== undefined ? acc[key] : null;
    }, obj);
}