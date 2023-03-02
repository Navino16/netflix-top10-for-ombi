import Constants from './Constants';
import { Utils } from './Utils';
import { Netflix } from './Netflix';
import { Ombi } from './Ombi';

Utils.manageCommandArgs();
const lastSunday = Utils.getLastSunday();

Netflix.downloadAllWeeksCountryFile().then(() => {
  const netfilxTop10: Netflix.AllWeeksCountryRow[] = Netflix.parseAllWeeksCountryFile()
    .filter((item) => item.country_iso2 === Constants.country?.toUpperCase())
    .filter((item) => item.week === lastSunday);
  netfilxTop10.forEach(async (element) => {
    console.log(`Netflix: ${element.category} -> ${element.show_title}`);
    const ombiMatchs = await Ombi.search(element.show_title, element.category);
    const filter = ombiMatchs.filter((item) => element.show_title === item.title);
    let matchingValue = ombiMatchs[0];
    if (filter.length === 1) {
      [matchingValue] = filter;
    }
    console.log(`Ombi: ${matchingValue.title} -> ${matchingValue.id}`);
    if (matchingValue.mediaType === 'tv') {
      Ombi.requestTV(parseInt(matchingValue.id, 10));
    }
  });
});
