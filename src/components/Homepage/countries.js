import _ from 'lodash'

// commented countries won't be visible or accessible
const COUNTRIES = [
  // { ISO: 'AGO', name: 'Angola', shiny: false },
  { ISO: 'BWA', name: 'Botswana', shiny: true },
  // { ISO: 'BRA', name: 'Brazil', shiny: false },
  { ISO: 'KHM', name: 'Cambodia', shiny: false },
  { ISO: 'CMR', name: 'Cameroon', shiny: true },
  { ISO: 'TCD', name: 'Chad', shiny: true },
  // { ISO: 'CHN', name: 'China', shiny: false },
  { ISO: 'CIV', name: "Côte d'Ivoire", shiny: true },
  { ISO: 'COD', name: 'Democratic Republic of the Congo', shiny: true },
  { ISO: 'DOM', name: 'Dominican Republic', shiny: false },
  { ISO: 'SWZ', name: 'Eswatini', shiny: true },
  { ISO: 'ETH', name: 'Ethiopia', shiny: true },
  { ISO: 'GHA', name: 'Ghana', shiny: true },
  { ISO: 'GTM', name: 'Guatemala', shiny: false },
  { ISO: 'HTI', name: 'Haiti', shiny: false },
  { ISO: 'IND', name: 'India ', shiny: false },
  { ISO: 'IDN', name: 'Indonesia', shiny: false },
  { ISO: 'IRN', name: 'Iran (Islamic Republic of)', shiny: false },
  { ISO: 'JAM', name: 'Jamaica', shiny: false },
  { ISO: 'KEN', name: 'Kenya', shiny: true },
  { ISO: 'LSO', name: 'Lesotho', shiny: true },
  { ISO: 'MWI', name: 'Malawi', shiny: true },
  { ISO: 'MYS', name: 'Malaysia', shiny: false },
  { ISO: 'MLI', name: 'Mali', shiny: true },
  // { ISO: 'MEX', name: 'Mexico', shiny: false },
  { ISO: 'MAR', name: 'Morocco', shiny: false },
  { ISO: 'MOZ', name: 'Mozambique', shiny: true },
  { ISO: 'MMR', name: 'Myanmar', shiny: false },
  { ISO: 'NAM', name: 'Namibia', shiny: false },
  { ISO: 'NGA', name: 'Nigeria', shiny: false },
  { ISO: 'PAK', name: 'Pakistan', shiny: false },
  { ISO: 'PNG', name: 'Papua New Guinea', shiny: false },
  { ISO: 'PHL', name: 'Philippines', shiny: false },
  // { ISO: 'RUS', name: 'Russian Federation', shiny: false },
  { ISO: 'SOM', name: 'Somalia', shiny: false },
  { ISO: 'ZAF', name: 'South Africa', shiny: false },
  { ISO: 'SSD', name: 'South Sudan', shiny: true },
  { ISO: 'SDN', name: 'Sudan', shiny: false },
  { ISO: 'THA', name: 'Thailand', shiny: false },
  { ISO: 'UGA', name: 'Uganda', shiny: true },
  { ISO: 'UKR', name: 'Ukraine', shiny: false },
  { ISO: 'TZA', name: 'United Republic of Tanzania', shiny: true },
  { ISO: 'VNM', name: 'Viet Nam', shiny: false },
  { ISO: 'ZMB', name: 'Zambia', shiny: true },
  { ISO: 'ZWE', name: 'Zimbabwe', shiny: true },
]

const COUNTRY_MAP = _.keyBy(COUNTRIES, 'ISO')

export {
  COUNTRIES,
  COUNTRY_MAP
}