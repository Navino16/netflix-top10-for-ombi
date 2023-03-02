declare namespace Netflix {
  export interface AllWeeksCountryRow {
    country_name: string,
    country_iso2: string,
    week: string,
    category: 'Film' | 'TV',
    weekly_rank: number,
    show_title: string,
    season_title: string,
    cumulative_weeks_in_top_10: number
  }
}
