import Constants from './Constants';
import { AppLogger, Utils } from './Utils';
import { Netflix } from './Netflix';
import { Ombi } from './Ombi';
import { OmbiRequestResponse, OmbiSearchResponse } from './types/Ombi';
import { AllWeeksCountryRow } from './types/Netflix';

Utils.manageCommandArgs();
const lastSunday: string = Utils.getLastSunday();

Netflix.downloadAllWeeksCountryFile().then(() => {
  const netfilxTop10: AllWeeksCountryRow[] = Netflix.parseAllWeeksCountryFile()
    .filter((item: AllWeeksCountryRow) => item.country_iso2 === Constants.country?.toUpperCase())
    .filter((item: AllWeeksCountryRow) => item.week === lastSunday);

  netfilxTop10.forEach(async (element) => {
    const matches: OmbiSearchResponse[] = await Ombi.search(element.show_title, element.category);
    const matchingValue: OmbiSearchResponse = Ombi.getMatchingValue(matches, element.show_title);

    const theMovieDbId: number = parseInt(matchingValue.id, 10);
    const { mediaType } = matchingValue;
    const requestResponse: OmbiRequestResponse = await Ombi.request(theMovieDbId, mediaType);
    if (requestResponse.result === true) {
      requestResponse.message = requestResponse.message ? requestResponse.message : 'added';
      AppLogger.info(`${matchingValue.title}: ${requestResponse.message}`);
    } else if (requestResponse.isError) {
      AppLogger.warn(`${matchingValue.title}: ${requestResponse.errorMessage}`);
    }
  });
});
