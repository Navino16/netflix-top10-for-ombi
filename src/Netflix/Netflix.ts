import { exit } from 'process';
import reader from 'xlsx';
import { AllWeeksCountryRow } from '../types/Netflix';
import { AppLogger } from '../Utils';
import { Utils } from '../Utils/Utils';

export class Netflix {
  public static async downloadAllWeeksCountryFile() {
    await Netflix.downloadFile('https://top10.netflix.com/data/all-weeks-countries.xlsx', 'all-weeks-countries.xlsx');
  }

  public static async downloadAllWeeksGlobalFile() {
    await Netflix.downloadFile('https://top10.netflix.com/data/all-weeks-global.xlsx', 'all-weeks-global.xlsx');
  }

  public static async downloadMostPopularFile() {
    await Netflix.downloadFile('https://top10.netflix.com/data/most-popular.xlsx', 'most-popular.xlsx');
  }

  private static async downloadFile(url: string, targetFile: string) {
    try {
      AppLogger.debug(`Downloading file ${url} in ${targetFile}`);
      await Utils.downloadFile(url, targetFile);
    } catch (error) {
      if (error instanceof Error) {
        AppLogger.error(`${url}: ${error.message}`);
        exit(1);
      }
    }
  }

  public static parseAllWeeksCountryFile(): AllWeeksCountryRow[] {
    AppLogger.debug('Parsing file ./all-weeks-countries.xlsx');
    const file = reader.readFile('./all-weeks-countries.xlsx');
    return reader.utils.sheet_to_json(file.Sheets[file.SheetNames[0]]);
  }
}
