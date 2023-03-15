import Jimp from 'jimp';

export type Image = Jimp;

/**
 * Read image from filepath.
 */
export const readImage = (filePath: string): Promise<Image> => {
  return Jimp.read(filePath);
};

/**
 * Resize image by dimensions.
 */
export const resizeImage = (image: Image, height = 300, width = 300) => {
  return image.resize(width, height);
};

/**
 * Get rgb values for a specific pixel in image.
 */
export const getPixelRgb = (image: Image, x: number, y: number) => {
  return Jimp.intToRGBA(image.getPixelColor(x, y));
};
