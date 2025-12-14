/**
 * Get the correct asset path based on the Vite base URL configuration.
 * This ensures assets work correctly both in development and production,
 * regardless of the base path setting.
 * 
 * @param path - The relative path to the asset (e.g., 'images/items/potion.svg')
 * @returns The full path with the base URL prefix
 */
export function getAssetPath(path: string): string {
  // Remove leading slash if present
  let cleanPath = path.startsWith('/') ? path.slice(1) : path;
  // Remove leading ../ if present (normalize relative paths)
  while (cleanPath.startsWith('../')) {
    cleanPath = cleanPath.slice(3);
  }
  // Ensure BASE_URL ends with slash and path doesn't start with one
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${cleanPath}`;
}
