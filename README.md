# Simple image processing application
## Description
This application reads in all tile images from a folder path and calculates each of the tile images average rgb value. It reads in an image from path and splits the image into tiles. Each image tile average rgb is then calculated. Once this is complete it then determines the tile image with the smallest deltaE distance between each tile image and each image tile using their average rgb values. After determining each replacement tile image for the image tiles, it builds a new image out of the replacement tile image.

## Setup
### Run the following commands
1. `npm install`
2. `npm run build`

## Running the application
### Run the following command
- `npm run start -- --imagePath <image_path_here> --tileFolderPath <tile_folder_path> --outputPath <output_path_here>`
  - image_path_here: Full path to file `example: "path/to/image.jpg"`
  - tileFolderPath: full path to folder root `example: "folder/"`
  - outputPath(Optional): full path to where new image is saved. Will be created if it does not exist `example: "folder/path/"`
    - If not provided the following folder will be created: `./dist/output`

## Limitations
The application on supports the following image types:
- bmp
- gif
- jpeg
- png
- tiff

## Libs
- benchMark.ts - Benchmarking calculations.
- colorDistance.ts - Color distance calculations using [delta-e](https://github.com/zschuessler/DeltaE).
- imageManipulation.ts - Manipulation of images using [Jimp](https://github.com/jimp-dev/jimp)
- imageProcessing.ts - Functions relating to image processing.

## Additional context
### Libs
My reasoning for extracting color distance calculations and image manipulation functions into a library is so that we can easily swap implementation details with another library/npm package.
