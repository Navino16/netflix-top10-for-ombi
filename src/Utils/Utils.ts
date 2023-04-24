import { exit } from 'node:process';
import fs from 'node:fs';
import https from 'node:https';
import { parseArgs } from 'node:util';
import { AppLogger } from './Logger';
import Constants from '../Constants';

export class Utils {
  /**
   * Print help and exit
   */
  public static printHelpAndExit() {
    process.stdout.write('Usage: netflix-top10-for-ombi [OPTION]...\n\n');
    process.stdout.write('Options:\n\n');
    process.stdout.write('\t-c,\t--country\t\tSelect from which country top10 is retrived\n');
    process.stdout.write('\t-d,\t--date\t\t\tChange current date (to get past top10)\n');
    process.stdout.write('\t-h,\t--help\t\t\tDisplay this help and exit\n');
    process.stdout.write('\t-l,\t--loglevel\t\tApplication loglevel (default: info)\n');
    process.stdout.write('\t\t--ombiApiKey\t\tOmbi API key\n');
    process.stdout.write('\t\t--ombiUrl\t\tOmbi URL\n');
    process.stdout.write('\t-v,\t--version\t\tDisplay version information and exit\n');
    exit(0);
  }

  /**
   * Print version information and exit
   */
  public static printVersionAndExit() {
    process.stdout.write('netflix-top10-for-ombi 1.0.0\n');
    process.stdout.write('License GPLv3+: GNU GPL version 3 or later <https://gnu.org/licenses/gpl.html>.\n');
    process.stdout.write('This is free software: you are free to change and redistribute it.\n');
    process.stdout.write('There is NO WARRANTY, to the extent permitted by law.\n');
    exit(0);
  }

  /**
   * Parse application arguments
   */
  public static manageCommandArgs() {
    try {
      const { values } = parseArgs({
        options: {
          country: {
            type: 'string',
            short: 'c',
          },
          date: {
            type: 'string',
            short: 'd',
          },
          help: {
            type: 'boolean',
            short: 'h',
          },
          loglevel: {
            type: 'string',
            short: 'l',
          },
          ombiApiKey: {
            type: 'string',
          },
          ombiApiUser: {
            type: 'string',
          },
          ombiUrl: {
            type: 'string',
          },
          version: {
            type: 'boolean',
            short: 'v',
          },
        },
      });

      if (values.help) {
        Utils.printHelpAndExit();
      }
      if (values.version) {
        Utils.printVersionAndExit();
      }

      this.validateArgs(values);

      AppLogger.level = values.loglevel ?? 'info';
      Constants.country = values.country ?? '';
      Constants.ombiApiKey = values.ombiApiKey ?? '';
      Constants.ombiApiUser = values.ombiApiUser ?? '';
      Constants.ombiUrl = values.ombiUrl ?? '';
      Constants.currentDate = values.date ? new Date(Date.parse(values.date)) : new Date();
    } catch (error) {
      if (error instanceof TypeError) {
        AppLogger.error(error.message);
        exit(1);
      }
    }
  }

  /**
   * Check if application args match some requirement and exit if not
   *
   * @param {AppArgs.Args} values
   */
  private static validateArgs(values: AppArgs.Args) {
    let asError = false;
    // Log level
    if (values.loglevel && AppLogger.levels[values.loglevel] === undefined) {
      AppLogger.error(`${values.loglevel} is not a valid loglevel. Valid loglevels: error, warn, info, http, verbose, debug, silly`);
      asError = true;
    }
    if (!values.country) {
      AppLogger.error('Country must be defined');
      asError = true;
    }
    if (values.date && (!values.date.match(/\d{4}-\d{2}-\d{2}/) || Number.isNaN(Date.parse(values.date)))) {
      AppLogger.error('Invalid date format, expected format is YYYY-MM-DD');
      asError = true;
    }

    if (!values.ombiApiKey) {
      AppLogger.error('OmbiApiKey must be defined');
      asError = true;
    }

    if (!values.ombiUrl) {
      AppLogger.error('OmbiUrl must be defined');
      asError = true;
    }
    if (asError) {
      exit(1);
    }
  }

  /**
   * Download a file from the given `url` into the `targetFile`.
   *
   * @param {String} url
   * @param {String} targetFile
   *
   * @returns {Promise<void>}
   */
  public static async downloadFile(url: string, targetFile: string): Promise<void> {
    return new Promise((resolve, reject) => {
      https.get(url, (response) => {
        const code = response.statusCode ?? 0;

        if (code >= 400) {
          return reject(new Error(`${response.statusCode} ${response.statusMessage}`));
        }

        // handle redirects
        if (code > 300 && code < 400 && !!response.headers.location) {
          return resolve(
            Utils.downloadFile(response.headers.location, targetFile),
          );
        }

        // save the file to disk
        const fileWriter = fs
          .createWriteStream(targetFile)
          .on('finish', () => {
            resolve();
          });

        return response.pipe(fileWriter);
      }).on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Return last sunday date (YYYY-MM-DD)
   *
   * @returns {string}
   */
  public static getLastSunday(): string {
    const d = Constants.currentDate;
    d.setDate(d.getDate() + 1);
    const t = new Date(d);
    t.setDate(t.getDate() - t.getDay());
    return `${t.getFullYear()}-${(`0${t.getMonth() + 1}`).slice(-2)}-${(`0${t.getDate()}`).slice(-2)}`;
  }
}
