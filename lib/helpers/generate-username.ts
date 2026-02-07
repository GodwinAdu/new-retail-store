export function generateUniqueUsername(fullName: string): string {
    // Remove spaces and convert to lowercase
    const baseUsername = fullName.toLowerCase().replace(/\s+/g, '');
    
    // Add random numbers to make it unique
    const randomSuffix = Math.floor(Math.random() * 10000);
    
    return `${baseUsername}${randomSuffix}`;
}