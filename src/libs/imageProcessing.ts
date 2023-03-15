import { calculateColorDistance } from './colorDistance';
import { type Image, getPixelRgb, resizeImage } from './imageManipulation';

/**
 * Calculate average rgb of image.
 */
export const calculateImageAvgRgb = (image: Image) => {
  // get first pixel of image
  const firstPixel = getPixelRgb(image, 0, 0);

  // initialize sum values with first pixel rgb
  let sumR = firstPixel.r;
  let sumG = firstPixel.g;
  let sumB = firstPixel.b;

  // loop through all image pixels and calculate sum of r, g, b values
  for (let y = 1; y < image.bitmap.height; y++) {
    for (let x = 1; x < image.bitmap.width; x++) {
      const pixel = getPixelRgb(image, x, y);
      sumR += pixel.r;
      sumG += pixel.g;
      sumB += pixel.b;
    }
  }

  // calculate total number of pixels in image
  const numPixels = image.bitmap.width * image.bitmap.height;

  // calculate average rgb values
  const avgR = sumR / numPixels;
  const avgG = sumG / numPixels;
  const avgB = sumB / numPixels;

  return { r: avgR, g: avgG, b: avgB };
};

/**
 * Calculates average rgb for array of images.
 */
export const calculateImagesAverageRgb = (tileImages: Image[]) => {
  return tileImages.map((tileImage) => ({
    image: tileImage,
    avg: { rgb: calculateImageAvgRgb(tileImage) },
  }));
};

/**
 * Adjust image dimensions to a factor of tile size.
 */
export const adjustImageSize = (
  image: Image,
  tileHeight = 20,
  tileWidth = 20
) => {
  const newHeight = Math.round(image.bitmap.height / tileHeight) * tileHeight;
  const newWidth = Math.round(image.bitmap.width / tileWidth) * tileWidth;

  const resizedImage = resizeImage(image, newHeight, newWidth);

  return resizedImage;
};

export type ImageTiles = {
  x: number;
  y: number;
};

/**
 * Split image into parts.
 */
export const splitImageIntoTiles = (
  image: Image,
  tileHeight = 20,
  tileWidth = 20
) => {
  const grid: ImageTiles[][] = [];

  for (let y = 0; y < image.bitmap.height; y += tileHeight) {
    const row: ImageTiles[] = [];
    for (let x = 0; x < image.bitmap.width; x += tileWidth) {
      row.push({ x, y });
    }
    grid.push(row);
  }

  return grid;
};

/**
 * Calculates each tile average rgb values.
 */
export const calculateTilesAvgRgb = (
  tiles: ImageTiles[][],
  image: Image,
  tileHeight = 20,
  tileWidth = 20
) => {
  return tiles.map((row) => {
    return row.map((tile) => {
      const tileImage = image
        .clone()
        .crop(tile.x, tile.y, tileWidth, tileHeight);
      const avgRgb = calculateImageAvgRgb(tileImage);

      return {
        ...tile,
        average: {
          rgb: avgRgb,
        },
      };
    });
  });
};

type TileImageWithAvgRgb = {
  image: Image;
  avg: { rgb: { r: number; g: number; b: number } };
};

type ImageTilesWithAvgRgb = ImageTiles & {
  average: {
    rgb: {
      r: number;
      g: number;
      b: number;
    };
  };
};

type TileWithDistance = TileImageWithAvgRgb & {
  distance: {
    image: Image;
    value: number;
  };
};

/**
 * Determines tile with smallest color distance.
 */
const getSmallestDistanceTile = (tiles: TileWithDistance[]) => {
  return tiles.sort((a, b) => {
    return a.distance.value - b.distance.value;
  })[0];
};

/**
 * Calculates replacement tile image for each tile in image.
 */
export const calculateTileReplacementImage = (
  tileImages: TileImageWithAvgRgb[],
  imageTiles: ImageTilesWithAvgRgb[][]
) => {
  const grid = imageTiles.map((row) => {
    return row.map((tile) => {
      // Calculate distance between input image tile and tile image
      const tileWithDistance = tileImages.map((tileImage) => ({
        ...tileImage,
        distance: {
          image: tileImage.image,
          value: calculateColorDistance(tile.average.rgb, tileImage.avg.rgb),
        },
      }));

      // Find smallest distance tile image
      const replacementTile = getSmallestDistanceTile(tileWithDistance);

      // Resize tile image and assign to property replacementTile
      return {
        ...tile,
        replacementImage: resizeImage(replacementTile.image, 20, 20),
      };
    });
  });

  return grid;
};

type TileWithReplacementImage = ImageTilesWithAvgRgb & {
  replacementImage: Image;
};

/**
 * Build new image out of replacement image for each tile of image.
 */
export const buildReplacementImage = (
  tileWithReplacementImage: TileWithReplacementImage[][],
  inputImage: Image,
  outputPath: string
) => {
  tileWithReplacementImage.forEach((row) => {
    row.forEach((tile) => {
      inputImage.composite(tile.replacementImage, tile.x, tile.y);
    });
  });

  inputImage.write(outputPath);
};
