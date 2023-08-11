import { FileHeader, Filter } from "../types";

/*
 * Set of common configurations for all tokenFormats
 * 
 * Add things here with caution
 */

export const FILE_CONFIGS = {
  android: {
    xml: {
      colors: {
        format: 'android/resources',
        destination: 'android/colors.xml',
        filter: Filter.color,
        options: {
          fileHeader: FileHeader.generatedByTokenEngine,
        },
      },
      dimens: {
        format: 'android/resources',
        destination: 'android/dimens.xml',
        filter: {
          attributes: { category: "size" }
        },
        options: {
          fileHeader: FileHeader.generatedByTokenEngine,
        }
      }
    }
  }
}