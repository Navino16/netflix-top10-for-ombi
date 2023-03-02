import { exit } from 'process';
import request, { ResponseError } from 'superagent';
import Constants from '../Constants';
import { OmbiSearchItem } from '../types/Ombi';
import { AppLogger } from '../Utils';

export class Ombi {
  public static async search(searchTerm: string, mediaType: string): Promise<OmbiSearchItem[]> {
    let matchs;
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
        .post(`${Constants.ombiUrl}/api/v2/Search/multi/${encodeURI(searchTerm)}`)
        .send(data)
        .set('accept', 'text/plain')
        .set('ApiKey', Constants.ombiApiKey)
        .set('Content-Type', 'application/json-patch+json');
      // console.log(res.body);
      matchs = res.body;
    } catch (error) {
      AppLogger.error((error as ResponseError)?.response?.error);
      exit(1);
    }
    return matchs;
  }

  public static async requestTV(id: number) {
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
    } catch (error) {
      AppLogger.error((error as ResponseError)?.response?.error);
      exit(1);
    }
  }
}
