/**
 * Utility functions for converting between 2D and 1D pixel arrays
 * This is used to work around Firestore's limitation with nested arrays
 */

/**
 * Convert 2D pixels array to 1D array for Firestore storage
 * @param pixels 2D array of color strings
 * @returns 1D array of color strings
 */
export function flattenPixels(pixels: string[][]): string[] {
  return pixels.flat();
}

/**
 * Convert 1D pixels array back to 2D array
 * @param pixelsFlat 1D array of color strings
 * @param width Width of the canvas
 * @param height Height of the canvas
 * @returns 2D array of color strings
 */
export function unflattenPixels(pixelsFlat: string[], width: number, height: number): string[][] {
  const pixels: string[][] = [];
  for (let y = 0; y < height; y++) {
    pixels[y] = [];
    for (let x = 0; x < width; x++) {
      pixels[y][x] = pixelsFlat[y * width + x] || '#ffffff';
    }
  }
  return pixels;
}

/**
 * Test function to verify conversion works correctly
 */
export function testPixelConversion(): boolean {
  // Create a test 2D array
  const testPixels2D: string[][] = [
    ['#ff0000', '#00ff00', '#0000ff'],
    ['#ffff00', '#ff00ff', '#00ffff'],
    ['#ffffff', '#000000', '#808080']
  ];
  
  const width = 3;
  const height = 3;
  
  // Convert to 1D
  const pixels1D = flattenPixels(testPixels2D);
  
  // Convert back to 2D
  const pixels2DRestored = unflattenPixels(pixels1D, width, height);
  
  // Check if they match
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (testPixels2D[y][x] !== pixels2DRestored[y][x]) {
        console.error('Pixel conversion test failed at', y, x);
        return false;
      }
    }
  }
  
  console.log('Pixel conversion test passed!');
  return true;
}

