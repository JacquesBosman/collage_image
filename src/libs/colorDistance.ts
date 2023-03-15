import DeltaE from 'delta-e';

type RgbColor = {
  r: number;
  g: number;
  b: number;
};

type XyzColor = {
  x: number;
  y: number;
  z: number;
};

/**
 * Transform rgb color value.
 */
const transformRgbColorValue = (color: number) => {
  if (color > 0.04045) {
    color = Math.pow((color + 0.055) / 1.055, 2.4);
  } else {
    color = color / 12.92;
  }

  return color;
};

/**
 * Converts rgb to xyz.
 */
const rgbToXyz = ({ r, g, b }: RgbColor) => {
  // normalizes the RGB components to the range [0, 1]
  let [red, green, blue] = [r, g, b].map((c) => c / 255);

  red = transformRgbColorValue(red);
  green = transformRgbColorValue(green);
  blue = transformRgbColorValue(blue);

  // scale color value
  [red, green, blue] = [red, green, blue].map((c) => c * 100);

  // calculate the X, Y, and Z values in CIE XYZ color space
  const x = red * 0.4124 + green * 0.3576 + blue * 0.1805;
  const y = red * 0.2126 + green * 0.7152 + blue * 0.0722;
  const z = red * 0.0193 + green * 0.1192 + blue * 0.9505;

  return {
    x,
    y,
    z,
  };
};

/**
 * Transform xyz color value.
 */
const transformXyzColorValue = (color: number) => {
  if (color > 0.008856) {
    color = Math.pow(color, 1 / 3);
  } else {
    color = 7.787 * color + 16 / 116;
  }

  return color;
};

/**
 * Converts rgb to CieLab.
 */
const rgbToCieLab = (rgb: RgbColor): DeltaE.LAB => {
  let { x, y, z }: XyzColor = rgbToXyz(rgb);

  // divide each X, Y, and Z value by a specific reference value
  x = x / 95.047;
  y = y / 100.0;
  z = z / 108.883;

  x = transformXyzColorValue(x);
  y = transformXyzColorValue(y);
  z = transformXyzColorValue(z);

  // calculates the L, a, and b values in CIE L*ab color space
  const l = 116 * y - 16;
  const a = 500 * (x - y);
  const b = 200 * (y - z);

  return {
    L: l,
    A: a,
    B: b,
  };
};

/**
 * Calculates the color distance between two rgb colors.
 */
export const calculateColorDistance = (
  color1: RgbColor,
  color2: RgbColor
): number => {
  // convert colors to CieLab
  const cie1 = rgbToCieLab(color1);
  const cie2 = rgbToCieLab(color2);

  // determine the deltaE between the two colors
  const deltaE = DeltaE.getDeltaE00(cie1, cie2);

  return deltaE;
};
