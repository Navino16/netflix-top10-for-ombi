import Constants from './Constants';
import { Utils } from './Utils';
import { Netflix } from './Netflix';

const lastSunday = Utils.getLastSunday();
Utils.manageCommandArgs();
Netflix.downloadAllWeeksCountryFile().then(() => {
  const values: Netflix.AllWeeksCountryRow[] = Netflix.parseAllWeeksCountryFile()
    .filter((item) => item.country_iso2 === Constants.country?.toUpperCase())
    .filter((item) => item.week === lastSunday);
  console.log(values);
});
