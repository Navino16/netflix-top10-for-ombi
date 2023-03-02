import reader from 'xlsx';
import { Utils } from '../Utils/Utils';

export class Netflix {
  public static async downloadAllWeeksCountryFile() {
    await Utils.downloadFile('https://top10.netflix.com/data/all-weeks-countries.xlsx', 'all-weeks-countries.xlsx');
  }

  public static async downloadAllWeeksGlobalFile() {
    await Utils.downloadFile('https://top10.netflix.com/data/all-weeks-global.xlsx', 'all-weeks-global.xlsx');
  }

  public static async downloadMostPopularFile() {
    await Utils.downloadFile('https://top10.netflix.com/data/most-popular.xlsx', 'most-popular.xlsx');
  }

  public static parseAllWeeksCountryFile(): Netflix.AllWeeksCountryRow[] {
    const file = reader.readFile('./all-weeks-countries.xlsx');
    return reader.utils.sheet_to_json(file.Sheets[file.SheetNames[0]]);
  }
}
