import _ from 'lodash'

// commented countries won't be visible or accessible
const COUNTRIES = [
  { ISO: 'AGO', shiny: false, forecastOn: true, name: 'Angola' },
  { ISO: 'BWA', shiny: true, forecastOn: true, name: 'Botswana' },
  { ISO: 'BRA', shiny: false, forecastOn: true, name: 'Brazil' },
  { ISO: 'KHM', shiny: false, forecastOn: true, name: 'Cambodia' },
  { ISO: 'CMR', shiny: false, forecastOn: true, name: 'Cameroon' },
  { ISO: 'TCD', shiny: true, forecastOn: true, name: 'Chad' },
  { ISO: 'CHN', shiny: false, forecastOn: true, name: 'China' },
  { ISO: 'CIV', shiny: true, forecastOn: true, name: "Côte d'Ivoire" },
  { ISO: 'COD', shiny: true, forecastOn: true, name: 'Democratic Republic of the Congo' },
  { ISO: 'DOM', shiny: false, forecastOn: true, name: 'Dominican Republic' },
  { ISO: 'SWZ', shiny: true, forecastOn: true, name: 'Eswatini' },
  { ISO: 'ETH', shiny: true, forecastOn: true, name: 'Ethiopia' },
  { ISO: 'GHA', shiny: true, forecastOn: true, name: 'Ghana' },
  { ISO: 'GTM', shiny: false, forecastOn: true, name: 'Guatemala' },
  { ISO: 'HTI', shiny: false, forecastOn: true, name: 'Haiti' },
  { ISO: 'IND', shiny: false, forecastOn: true, name: 'India ' },
  { ISO: 'IDN', shiny: false, forecastOn: true, name: 'Indonesia' },
  { ISO: 'IRN', shiny: false, forecastOn: true, name: 'Iran (Islamic Republic of)' },
  { ISO: 'JAM', shiny: false, forecastOn: true, name: 'Jamaica' },
  { ISO: 'KEN', shiny: true, forecastOn: true, name: 'Kenya' },
  { ISO: 'LSO', shiny: true, forecastOn: true, name: 'Lesotho' },
  { ISO: 'MWI', shiny: true, forecastOn: true, name: 'Malawi' },
  { ISO: 'MYS', shiny: false, forecastOn: true, name: 'Malaysia' },
  { ISO: 'MLI', shiny: true, forecastOn: true, name: 'Mali' },
  { ISO: 'MEX', shiny: false, forecastOn: true, name: 'Mexico' },
  { ISO: 'MAR', shiny: false, forecastOn: true, name: 'Morocco' },
  { ISO: 'MOZ', shiny: true, forecastOn: true, name: 'Mozambique' },
  { ISO: 'MMR', shiny: false, forecastOn: true, name: 'Myanmar' },
  { ISO: 'NAM', shiny: false, forecastOn: true, name: 'Namibia' },
  { ISO: 'NGA', shiny: false, forecastOn: true, name: 'Nigeria' },
  { ISO: 'PAK', shiny: false, forecastOn: true, name: 'Pakistan' },
  { ISO: 'PNG', shiny: false, forecastOn: true, name: 'Papua New Guinea' },
  { ISO: 'PHL', shiny: false, forecastOn: true, name: 'Philippines' },
  { ISO: 'RUS', shiny: false, forecastOn: true, name: 'Russian Federation' },
  { ISO: 'SOM', shiny: false, forecastOn: true, name: 'Somalia' },
  { ISO: 'ZAF', shiny: false, forecastOn: true, name: 'South Africa' },
  { ISO: 'SSD', shiny: true, forecastOn: true, name: 'South Sudan' },
  { ISO: 'SDN', shiny: false, forecastOn: true, name: 'Sudan' },
  { ISO: 'THA', shiny: false, forecastOn: true, name: 'Thailand' },
  { ISO: 'UGA', shiny: true, forecastOn: true, name: 'Uganda' },
  { ISO: 'UKR', shiny: false, forecastOn: true, name: 'Ukraine' },
  { ISO: 'TZA', shiny: true, forecastOn: true, name: 'United Republic of Tanzania' },
  { ISO: 'VNM', shiny: false, forecastOn: true, name: 'Viet Nam' },
  { ISO: 'ZMB', shiny: true, forecastOn: true, name: 'Zambia' },
  { ISO: 'ZWE', shiny: true, forecastOn: true, name: 'Zimbabwe' },
]

const COUNTRY_MAP = _.keyBy(COUNTRIES, 'ISO')

export {
  COUNTRIES,
  COUNTRY_MAP
}