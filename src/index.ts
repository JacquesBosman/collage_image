import {
  adjustImageSize,
  buildReplacementImage,
  calculateImagesAverageRgb,
  calculateTileReplacementImage,
  calculateTilesAvgRgb,
  splitImageIntoTiles,
} from './libs/imageProcessing';

import { Command } from 'commander';
import { benchMarkFunction } from './libs/benchMark';
import fs from 'fs';
import path from 'path';
import { readImage } from './libs/imageManipulation';

const program = new Command();

const outputDefaultPath = path.join(__dirname, 'output', 'image_collage.jpg');

/**
 * Reads images in folder.
 */
const readImages = (folderPath: string) => {
  const imagePaths = fs
    .readdirSync(folderPath)
    .map((file) => path.join(folderPath, file));

  return imagePaths.map(async (imagePath) => {
    return readImage(imagePath);
  });
};

const app = async (
  imagePath: string,
  tileFolderPath: string,
  outputPath = outputDefaultPath
) => {
  const tileWidth = 20;
  const tileHeight = 20;

  try {
    // Read tile images
    const tileImages = await Promise.all(readImages(tileFolderPath));

    // Calculate tile images average rgb
    const tileImagesWithAvgRgb = calculateImagesAverageRgb(tileImages);

    // Read image
    const image = await readImage(imagePath);
    const imageWithAdjustedSize = adjustImageSize(image, tileHeight, tileWidth);

    // Split image into tiles
    const imageTiles = splitImageIntoTiles(
      imageWithAdjustedSize,
      tileHeight,
      tileWidth
    );

    // Add tile average rgb values
    const imageTilesWithRgbAvg = calculateTilesAvgRgb(
      imageTiles,
      imageWithAdjustedSize,
      tileHeight,
      tileWidth
    );

    // Calculate delta average
    const imageTilesWithReplacementImage = calculateTileReplacementImage(
      tileImagesWithAvgRgb,
      imageTilesWithRgbAvg
    );

    // Build new image with replacement images
    buildReplacementImage(
      imageTilesWithReplacementImage,
      imageWithAdjustedSize,
      outputPath
    );
    console.info('Complete');
  } catch (error) {
    console.error(`An error occurred: ${error}`);
  }
};

fs.rmSync(path.join(__dirname, 'output'), { recursive: true, force: true });

// cli options
program
  .requiredOption('--imagePath <path>')
  .requiredOption('--tileFolderPath <folderPath>')
  .option('--outputPath <outputPath>')
  .parse();

const options = program.opts();

// Run application
benchMarkFunction(async () =>
  app(options.imagePath, options.tileFolderPath, options.outputPath)
);
