import { exit } from 'process';
import request, { ResponseError } from 'superagent';
import Constants from '../Constants';
import { OmbiSearchResponse, OmbiRequestResponse } from '../types/Ombi';
import { AppLogger } from '../Utils';

export class Ombi {
  /**
   * Search for a show or film on Ombi
   *
   * @param {String} searchTerm
   * @param {String} mediaType
   * @returns {Promise<OmbiSearchResponse[]>}
   */
  public static async search(searchTerm: string, mediaType: string): Promise<OmbiSearchResponse[]> {
    AppLogger.debug(`Searching for ${searchTerm} (Type: ${mediaType})`);
    let matchs:OmbiSearchResponse[];
    try {
      const data = {
        movies: false,
        tvShows: false,
        music: false,
        people: false,
      };

      if (mediaType === 'Films') {
        data.movies = true;
      } else if (mediaType === 'TV') {
        data.tvShows = true;
      }

      const res = await request
        .post(`${Constants.ombiUrl}/api/v2/Search/multi/${encodeURIComponent(searchTerm)}`)
        .send(data)
        .set('accept', 'text/plain')
        .set('ApiKey', Constants.ombiApiKey)
        .set('Content-Type', 'application/json-patch+json');

      matchs = res.body;
      AppLogger.debug(`Found ${matchs.length} matches`);
      AppLogger.silly(`${JSON.stringify(matchs)}`);
    } catch (error: unknown) {
      if ((error as ResponseError)?.response?.error) {
        AppLogger.error(`Error while searching for ${searchTerm}: ${(error as ResponseError)?.response?.error}`);
      } else {
        AppLogger.error(`Error while searching for ${searchTerm}: ${(error as Error).message}`);
      }
      exit(1);
    }
    return matchs;
  }

  /**
   * Request a tv show or a movie on Ombi
   *
   * @param {Number} id
   * @param {String} mediaType
   * @returns {Promise<OmbiRequestResponse}
   */
  public static async request(id: number, mediaType: string): Promise<OmbiRequestResponse | null> {
    if (mediaType === 'tv') {
      return Ombi.requestTV(id);
    }
    // We already know that mediaType is movie since only possible values are tv and movie
    return Ombi.requestMovie(id);
  }

  /**
   * Request a tv show on Ombi
   *
   * @param {Number} id
   * @returns {Promise<OmbiRequestResponse>}
   */
  private static async requestTV(id: number): Promise<OmbiRequestResponse | null> {
    AppLogger.debug(`Requesting show: ${id}`);
    let requestStatus: OmbiRequestResponse | null = null;
    try {
      const res = await request
        .post(`${Constants.ombiUrl}/api/v2/Requests/tv`)
        .send({
          theMovieDbId: id,
          requestAll: true,
        })
        .set('accept', 'text/plain')
        .set('ApiKey', Constants.ombiApiKey)
        .set('Content-Type', 'application/json-patch+json')
        .set('UserName', Constants.ombiApiUser);
      requestStatus = res.body;
    } catch (error: unknown) {
      if ((error as ResponseError)?.response?.error) {
        AppLogger.error(`Error while requesting TV show with ID ${id}: ${(error as ResponseError)?.response?.error}`);
      } else {
        AppLogger.error(`Error while requesting TV show with ID ${id}: ${(error as Error).message}`);
      }
    }
    return requestStatus;
  }

  /**
   * Request a movie on Ombi
   *
   * @param {Number} id
   * @returns {Promise<OmbiRequestResponse>}
   */
  private static async requestMovie(id: number): Promise<OmbiRequestResponse> {
    AppLogger.debug(`Requesting movie: ${id}`);
    let requestStatus: OmbiRequestResponse;
    try {
      const res = await request
        .post(`${Constants.ombiUrl}/api/v1/Request/movie`)
        .send({
          theMovieDbId: id,
        })
        .set('accept', 'text/plain')
        .set('ApiKey', Constants.ombiApiKey)
        .set('Content-Type', 'application/json-patch+json')
        .set('UserName', Constants.ombiApiUser);
      requestStatus = res.body;
    } catch (error: unknown) {
      if ((error as ResponseError)?.response?.error) {
        AppLogger.error(`Error while requesting movie: ${(error as ResponseError)?.response?.error}`);
      } else {
        AppLogger.error(`Error while requesting movie: ${(error as Error).message}`);
      }
      exit(1);
    }
    return requestStatus;
  }

  /**
   * Filter all response to get only one matching item
   * For tv show: Search for exact title on response and if nothing match, return first item
   * For movies: return first item
   *
   * @param {OmbiSearchResponse[]} matches
   * @param {String} title
   *
   * @returns {OmbiSearchResponse}
   */
  public static getMatchingValue(matches: OmbiSearchResponse[], title: string): OmbiSearchResponse {
    const filter: OmbiSearchResponse[] = matches.filter((item) => item.mediaType === 'tv' && title === item.title);
    let matchingValue: OmbiSearchResponse = matches[0];
    if (filter.length === 1) {
      [matchingValue] = filter;
    }
    return matchingValue;
  }
}
