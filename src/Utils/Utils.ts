import { exit } from 'node:process';
import https from 'node:https';
import fs from 'node:fs';
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
    process.stdout.write('\t-c, --country\n');
    process.stdout.write('\t-h, --help\t\tdisplay this help and exit\n');
    process.stdout.write('\t-l, --loglevel\t\tapplication loglevel (default: info)\n');
    process.stdout.write('\t-v, --version\t\tdisplay version information and exit\n');
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
          help: {
            type: 'boolean',
            short: 'h',
          },
          loglevel: {
            type: 'string',
            short: 'l',
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
      Constants.country = values.country ?? null;
    } catch (error) {
      if (error instanceof TypeError) {
        AppLogger.error(error.message);
      }
    }
  }

  /**
   * Check if application args match some requirement and exit if not
   *
   * @param {AppArgs.Args} values
   */
  private static validateArgs(values: AppArgs.Args) {
    // Log level
    if (values.loglevel && AppLogger.levels[values.loglevel] === undefined) {
      AppLogger.error(`${values.loglevel} is not a valid loglevel. Valid loglevels: error, warn, info, http, verbose, debug, silly`);
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
          return reject(new Error(response.statusMessage));
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
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const t = new Date(d);
    t.setDate(t.getDate() - t.getDay());
    return `${t.getFullYear()}-${(`0${t.getMonth() + 1}`).slice(-2)}-${(`0${t.getDate()}`).slice(-2)}`;
  }
}
