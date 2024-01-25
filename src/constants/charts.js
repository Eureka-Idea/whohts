import _ from 'lodash'
import { COUNTRY_MAP } from '../components/Homepage/countries'
import { FEATURE_FLAGS } from './flags'

// const BASE_URL = 'https://status.y-x.ch/query?'
const BASE_URL =
  'https://2021-app-dot-eic-database-290813.ew.r.appspot.com/query?'
// const BASE_URL = 'https://eic-database-290813.ew.r.appspot.com/query?'

// indicates that the getter is for *all* chart values, rather than one (so MUST return a map of id -> value)
const AGGREGATE_GETTER = 'AGGREGATE_GETTER'

const R_2015_2019 = ['2015', '2016', '2017', '2018', '2019']
const LATEST_YEAR = '2021'
const R_2015_ON = _.range('2015', Number(LATEST_YEAR) + 1).map(String)
const R_2018_ON = _.range('2018', Number(LATEST_YEAR) + 1).map(String)
const R_2020_2025 = ['2020', '2021', '2022', '2023', '2024', '2025']

const ADULTS15 = '15-24'
const ADULTS25 = '25-34'
const ADULTS35 = '35-49'
const ADULTS50 = '50-99'
const R_ADULT_AGES = [ADULTS15, ADULTS25, ADULTS35, ADULTS50]
const ALL_ADULTS = '15-99'
const AGE_MAP = {
  ADULTS15,
  ADULTS25,
  ADULTS35,
  ADULTS50,
  ALL_ADULTS,
}

const FEMALE = 'female'
const MALE = 'male'
const R_SEXES = [FEMALE, MALE]

// ['f15-24', 'm15-24', 'f24-34' ... 'm15-99']
const R_ALL_DEMO_GROUPS = _.flatMap([
  [ALL_ADULTS, ...R_ADULT_AGES].map((y) => FEMALE[0] + y),
  [ALL_ADULTS, ...R_ADULT_AGES].map((y) => MALE[0] + y),
])
const R_LIMITED_DEMO_GROUPS = _.flatMap([
  [ALL_ADULTS, ADULTS15].map((y) => FEMALE[0] + y),
  [ALL_ADULTS, ADULTS15].map((y) => MALE[0] + y),
])

const SOURCE_DB_MAP = {
  S90: 'Shiny90',
  GAM21: 'Global AIDS Monitoring 2021',
  GAM20: 'Global AIDS Monitoring 2020',
  GAM19: 'Global AIDS Monitoring 2019',
  GAM: 'Global AIDS Monitoring',
  NPD19: 'National Programme Data 2019',
  NPD: 'National Programme Data',

  PCOP20: 'PEPFAR COP 2020',
  PCOP19: 'PEPFAR COP 2019',
  // PCOP18: 'PEPFAR COP 2018',
  PCOP1718: 'PEPFAR COP 2017 - 2018',
  // PCOP17: 'PEPFAR COP 2017',
  PROP20: 'PEPFAR ROP 2020',
  PROP19: 'PEPFAR ROP 2019',
  // PROP18: 'PEPFAR ROP 2018',
  PROP17: 'PEPFAR ROP 2017',
  // PEPFAR_SDE: 'PEPFAR System Data Extract',
  PEPFAR: 'PEPFAR',

  WME: 'WHO model estimates',
  WSR: 'WHO special review',
  // WHTS: 'WHO HIV testing strategy',
  WNCPI: 'WHO NCPI',
  HIVST20: 'HIVST policy 2020 data set',
  HIVST21: 'HIVST policy 2021 data set',
  KP22: 'UNAIDS KP-Atlas 2022',
  KP20: 'UNAIDS KP-Atlas 2020',
  // UNGAM20: 'UNAIDS Global AIDS Monitoring 2020',
  TGF: 'The Global Fund',

  ULP: 'UNAIDS Laws and Policies',
  DHS: 'The DHS Program',
  MICS: 'MICS UNICEF',
  SPEC20: 'Spectrum estimates 2020 (UNAIDS/WHO)',
  SPEC21: 'Spectrum estimates 2021 (UNAIDS/WHO)',
  SPEC22: 'Spectrum estimates 2022 (UNAIDS/WHO)',
  SPEC_REG: /Spectrum estimates .+ \(UNAIDS\/WHO\)/,
  WGHO: 'WHO Global Health Observatory',
  UNAIDS: 'UNAIDS', // also a source organization
  WB: 'World Bank', // also a source organization
  // to match any DB name including the value (rather than strict match)
  _NCPI_: 'NCPI',
}
const SOURCE_DISPLAY_MAP = {
  ['AIDS (AIM)']: 'Spectrum estimates 2020 (UNAIDS/WHO)',
  ['Demographic projection (DemProj)']: 'UNAIDS Demographic projections',
  // ['Global AIDS Monitoring 2019']: 'Global AIDS Monitoring 2019',
  // ['Global AIDS Monitoring 2020']: 'Global AIDS Monitoring 2020',
  // ['The Global Fund']: 'The Global Fund',
  ['Google 2019']: 'Google',
  [SOURCE_DB_MAP.HIVST20]: 'WHO NCPI',
  // ['National programme data']: 'National programme data',
  // ['National programme data 2019']: 'National programme data 2019',
  // ['PEPFAR COP 2017 - 2018']: 'PEPFAR COP 2017 - 2018',
  // ['PEPFAR COP 2019']: 'PEPFAR COP 2019',
  // ['PEPFAR ROP 2017']: 'PEPFAR ROP 2017',
  // ['PEPFAR ROP 2019']: 'PEPFAR ROP 2019',
  // ['PEPFAR']: 'PEPFAR',
  [SOURCE_DB_MAP.S90]: 'Spectrum/Shiny90 estimates 2021 (UNAIDS/WHO)',
  // ['Spectrum estimates 2020(UNAIDS / WHO)']: 'Spectrum estimates 2020 (UNAIDS/WHO)',
  [SOURCE_DB_MAP.UNAIDS]: 'Spectrum estimates 2020 (UNAIDS/WHO)',
  // ['UNAIDS KP - Atlas 2020']: 'UNAIDS KP-Atlas 2020',
  // ['UNPOP 2019']: 'UNPOP 2019',
  // ['WHO focal point catch-up plans']: 'WHO focal point catch-up plans',
  [SOURCE_DB_MAP.WNCPI]: 'WHO NCPI',
  // ['WHO special review']: 'WHO special review',
  ['World Bank List of Economies']: 'World Bank',
}

// adds in the source year, if provided
const getSourceDisplayWithYear = ({ source, sourceYear }) => {
  if (!SOURCE_DISPLAY_MAP[source]) return source

  if (!sourceYear) return SOURCE_DISPLAY_MAP[source]

  // NOTE: this assumes that if the source display name has a 4 digit number, it's a year 
  // (and will be replaced with the source year)
  return SOURCE_DISPLAY_MAP[source].replace(/\d{4}/, sourceYear)
}

const FIELD_MAP = {
  INDICATOR: 'indicator',
  INDICATOR_DESCRIPTION: 'indicator_description',
  COUNTRY_ISO_CODE: 'country_iso_code',
  COUNTRY_NAME: 'country_name',
  AREA_NAME: 'area_name',
  GEOGRAPHIC_SCOPE: 'geographic_scope',
  YEAR: 'year',
  SEX: 'sex',
  AGE: 'age',
  POPULATION_SEGMENT: 'population_segment',
  POPULATION_SUB_GROUP: 'population_sub_group',
  VALUE: 'value',
  VALUE_COMMENT: 'value_comment',
  UNIT_FORMAT: 'unit_format',
  SOURCE_ORGANIZATION: 'source_organization',
  SOURCE_DATABASE: 'source_database',
  SOURCE_YEAR: 'source_year',
  NOTES: 'notes',
  MODALITY: 'modality',
  MODALITY_CATEGORY: 'modality_category',
  VALUE_UPPER: 'value_upper',
  VALUE_LOWER: 'value_lower',
  IMPORT_FILE: 'import_file',
}
const F = FIELD_MAP
const CSV_FIELDS = [
  // NOTE: for now we're displaying the fieldId in the CSV, so displayName is irrelevant
  { fieldId: FIELD_MAP.INDICATOR, displayName: 'Indicator' },
  { fieldId: FIELD_MAP.VALUE, displayName: 'Value' },
  { fieldId: FIELD_MAP.VALUE_LOWER, displayName: 'Lower Bound' },
  { fieldId: FIELD_MAP.VALUE_UPPER, displayName: 'Upper Bound' },
  { fieldId: FIELD_MAP.VALUE_COMMENT, displayName: 'Value Comment' },
  // { fieldId: FIELD_MAP.UNIT_FORMAT, displayName: 'UF' },
  { fieldId: FIELD_MAP.SEX, displayName: 'Sex' },
  { fieldId: FIELD_MAP.AGE, displayName: 'Age' },
  { fieldId: FIELD_MAP.YEAR, displayName: 'Year' },
  { fieldId: FIELD_MAP.SOURCE_DATABASE, displayName: 'Source Database' },
  { fieldId: FIELD_MAP.NOTES, displayName: 'Notes' },
]

// SOURCE objects for source prio charts
const adultsGAM21 = {
  id: 'GAM21',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM21,
      [F.VALUE_COMMENT]: 'validated',
    },
  },
  // TODO-@*&: remove numbering to make maintenance easier. see TODO-@*&
  indicators: {
    total0: 'Den Age-All',
    men0: 'Den Age-Male Gte 15',
    women0: 'Den Age-Female Gte 15',

    pTotal0: 'Per Age-All',
    pMen0: 'Per Age-Male Gte 15',
    pWomen0: 'Per Age-Female Gte 15',
  },
}
const adultsGAM20 = {
  id: 'GAM20',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM20,
      [F.VALUE_COMMENT]: 'validated',
    },
  },
  indicators: {
    total1: 'Den Age-All',
    men1: 'Den Age-Male Gte 15',
    women1: 'Den Age-Female Gte 15',

    pTotal1: 'Per Age-All',
    pMen1: 'Per Age-Male Gte 15',
    pWomen1: 'Per Age-Female Gte 15',
  },
}
const adultsGAM19 = {
  id: 'GAM19',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM19,
    },
  },
  indicators: {
    total2: 'Total volume of tests conducted in past year',
    men2: 'Men (15+) - Number of tests',
    women2: 'Women (15+) - Number of tests',

    pTotal2: 'Total aggregate positivity',
    pMen2: 'Men (15+) -  Positivity',
    pWomen2: 'Women (15+) -  Positivity',
  },
}
const adultsNPD19 = {
  id: 'NPD19',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.NPD19,
    },
  },
  indicators: {
    // NOTE: same as GAM
    total3: 'Total volume of tests conducted in past year',
    men3: 'Men (15+) - Number of tests',
    women3: 'Women (15+) - Number of tests',

    pTotal3: 'Total aggregate positivity',
    pMen3: 'Men (15+) -  Positivity',
    pWomen3: 'Women (15+) -  Positivity',
  },
}
const adultsPCOP20 = {
  id: 'PCOP20',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PCOP20,
    },
  },
  indicators: {
    total4: 'Den Age-All',
    men4: 'Den Age-Male Gte 15',
    women4: 'Den Age-Female Gte 15',

    pTotal4: 'Per Age-All',
    pMen4: 'Per Age-Male Gte 15',
    pWomen4: 'Per Age-Female Gte 15',
  },
}
const adultsPROP20 = {
  id: 'PROP20',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PROP20,
    },
  },
  indicators: {
    total5: 'Den Age-All',
    men5: 'Den Age-Male Gte 15',
    women5: 'Den Age-Female Gte 15',

    pTotal5: 'Per Age-All',
    pMen5: 'Per Age-Male Gte 15',
    pWomen5: 'Per Age-Female Gte 15',
  },
}
const adultsPCOP19 = {
  id: 'PCOP19',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PCOP19,
    },
  },
  indicators: {
    total6: 'People Tested in Past Year',
    men6: 'Men (Tested in past year)',
    women6: 'Women (Tested in past year)',

    pTotal6: 'Aggregate Positivity - Tests conducted and positivity, by sex',
    pMen6: 'Men -  Positivity',
    pWomen6: 'Women -  Positivity',
  },
}
const adultsPROP19 = {
  id: 'PROP19',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PROP19,
    },
  },
  indicators: {
    total7: 'People Tested in Past Year',
    men7: 'Men (Tested in past year)',
    women7: 'Women (Tested in past year)',

    pTotal7: 'Aggregate Positivity - Tests conducted and positivity, by sex',
    pMen7: 'Men -  Positivity',
    pWomen7: 'Women -  Positivity',
  },
}
const adultsPCOP1718 = {
  id: 'PCOP1718',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PCOP1718,
    },
  },
  indicators: {
    total10: 'People Tested in Past Year',
    men10: 'Men (Tested in past year)',
    women10: 'Women (Tested in past year)',

    pTotal10: 'Aggregate Positivity - Tests conducted and positivity, by sex',
    pMen10: 'Men -  Positivity',
    pWomen10: 'Women -  Positivity',
  },
}
const adultsPROP17 = {
  id: 'PROP17',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PROP17,
    },
  },
  indicators: {
    total11: 'People Tested in Past Year',
    men11: 'Men (Tested in past year)',
    women11: 'Women (Tested in past year)',

    pTotal11: 'Aggregate Positivity - Tests conducted and positivity, by sex',
    pMen11: 'Men -  Positivity',
    pWomen11: 'Women -  Positivity',
  },
}
const adultsPEPFAR = {
  id: 'PEPFAR',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PEPFAR,
    },
  },
  indicators: {
    total4: 'People Tested in Past Year',
    men4: 'Men (15+) Tested in Past Year',
    women4: 'Women (15+) Tested in Past Year',

    pTotal4: 'Total positivity',
    pMen4: 'Positivity - Men (15+)',
    pWomen4: 'Positivity - Women (15+)',
  },
}

const communityGAM21 = {
  id: 'GAM21',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM21,
      [F.VALUE_COMMENT]: 'validated',
    },
  },
  indicators: {
    total0: 'Den Community-Community All',
    mobile0: 'Den Community-Community Mobile',
    VCT0: 'Den Community-Community Vct',
    other0: 'Den Community-Community Other',

    pTotal0: 'Per Community-Community All',
    pMobile0: 'Per Community-Community Mobile',
    pVCT0: 'Per Community-Community Vct',
    pOther0: 'Per Community-Community Other',
  },
}
const communityGAM20 = {
  id: 'GAM20',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM20,
      [F.VALUE_COMMENT]: 'validated',
    },
  },
  indicators: {
    total1: 'Den Community-Community All',
    mobile1: 'Den Community-Community Mobile',
    VCT1: 'Den Community-Community Vct',
    other1: 'Den Community-Community Other',

    pTotal1: 'Per Community-Community All',
    pMobile1: 'Per Community-Community Mobile',
    pVCT1: 'Per Community-Community Vct',
    pOther1: 'Per Community-Community Other',
  },
}
const communityGAM19 = {
  id: 'GAM19',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM19,
    },
  },
  indicators: {
    total2: 'Total Volume - Tests conducted and positivity at community level',
    mobile2: 'Mobile testing - Number of tests - Community',
    VCT2: 'VCT - Number of tests - Community',
    other2: 'Other - Number of tests - Community',

    pTotal2:
      'Aggregate Positivity - Tests conducted and positivity at community level',
    pMobile2: 'Mobile testing - Positivity - Community',
    pVCT2: 'VCT - Positivity - Community',
    pOther2: 'Other - Positivity - Community',
  },
}
const communityNPD19 = {
  id: 'NPD19',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.NPD19,
    },
  },
  indicators: {
    // same as GAM19
    total3: 'Total Volume - Tests conducted and positivity at community level',
    mobile3: 'Mobile testing - Number of tests - Community',
    VCT3: 'VCT - Number of tests - Community',
    other3: 'Other - Number of tests - Community',

    pTotal3:
      'Aggregate Positivity - Tests conducted and positivity at community level',
    pMobile3: 'Mobile testing - Positivity - Community',
    pVCT3: 'VCT - Positivity - Community',
    pOther3: 'Other - Positivity - Community',
  },
}
const communityPEPFAR = {
  id: 'PEPFAR',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PEPFAR,
    },
  },
  indicators: {
    total4: 'Total Community Tests',
    mobile4: 'Mobile testing - Number of tests - Community',
    VCT4: 'VCT - Number of tests - Community',
    other4: 'Other - Number of tests - Community',

    pTotal4: 'Positivity - Community Modalities Total',
    pMobile4: 'Positivity - Community Mobile Testing',
    pVCT4: 'Positivity - Community VCT Testing',
    pOther4: 'Positivity - Community Other Testing',
  },
}

const facilityGAM21 = {
  id: 'GAM21',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM21,
      [F.VALUE_COMMENT]: 'validated',
    },
  },
  indicators: {
    total0: 'Den Facility-Facility All',
    PITC0: 'Den Facility-Facility Provider Init',
    ANC0: 'Den Facility-Facility Anc',
    VCT0: 'Den Facility-Facility Vct',
    family0: 'Den Facility-Facility Fp Clinic',
    other0: 'Den Facility-Facility Other',

    pTotal0: 'Per Facility-Facility All',
    pPITC0: 'Per Facility-Facility Provider Init',
    pANC0: 'Per Facility-Facility Anc',
    pVCT0: 'Per Facility-Facility Vct',
    pFamily0: 'Per Facility-Facility Fp Clinic',
    pOther0: 'Per Facility-Facility Other',
  },
}
const facilityGAM20 = {
  id: 'GAM20',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM20,
      [F.VALUE_COMMENT]: 'validated',
    },
  },
  indicators: {
    total1: 'Den Facility-Facility All',
    PITC1: 'Den Facility-Facility Provider Init',
    ANC1: 'Den Facility-Facility Anc',
    VCT1: 'Den Facility-Facility Vct',
    family1: 'Den Facility-Facility Fp Clinic',
    other1: 'Den Facility-Facility Other',

    pTotal1: 'Per Facility-Facility All',
    pPITC1: 'Per Facility-Facility Provider Init',
    pANC1: 'Per Facility-Facility Anc',
    pVCT1: 'Per Facility-Facility Vct',
    pFamily1: 'Per Facility-Facility Fp Clinic',
    pOther1: 'Per Facility-Facility Other',
  },
}
const facilityGAM19 = {
  id: 'GAM19',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM19,
    },
  },
  indicators: {
    total2: 'Total Volume - Tests conducted and positivity at facility level',
    PITC2: 'PITC - Number of tests - Facility',
    ANC2: 'ANC - Number of tests - Facility',
    VCT2: 'VCT - Number of tests - Facility',
    other2: 'Other - Number of tests - Facility',

    pTotal2:
      'Aggregate Positivity - Tests conducted and positivity at facility level',
    pPITC2: 'PITC - Positivity - Facility',
    pANC2: 'ANC - Positivity - Facility',
    pVCT2: 'VCT - Positivity - Facility',
    pOther2: 'Other - Positivity - Facility',
  },
}
const facilityNPD19 = {
  id: 'NPD19',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.NPD19,
    },
  },
  indicators: {
    // same as GAM19
    total3: 'Total Volume - Tests conducted and positivity at facility level',
    PITC3: 'PITC - Number of tests - Facility',
    ANC3: 'ANC - Number of tests - Facility',
    VCT3: 'VCT - Number of tests - Facility',
    other3: 'Other - Number of tests - Facility',

    pTotal3:
      'Aggregate Positivity - Tests conducted and positivity at facility level',
    pPITC3: 'PITC - Positivity - Facility',
    pANC3: 'ANC - Positivity - Facility',
    pVCT3: 'VCT - Positivity - Facility',
    pOther3: 'Other - Positivity - Facility',
  },
}
const facilityPEPFAR = {
  id: 'PEPFAR',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PEPFAR,
    },
  },
  indicators: {
    // TODO: fix calculated values
    total4: 'Total Facility Tests',
    PITC4: 'PITC - Number of tests - Facility',
    ANC4: 'ANC - Number of tests - Facility',
    VCT4: 'VCT - Number of tests - Facility',
    other4: 'Other - Number of tests - Facility',

    pTotal4: 'Positivity - Facility Modalities Total',
    pPITC4: 'Positivity - Facility PITC Testing',
    pANC4: 'Positivity - Facility ANC Testing',
    pVCT4: 'Positivity - Facility VCT Testing',
    pOther4: 'Positivity - Facility Other Testing',
  },
}

const indexPEPFAR = {
  id: 'PEPFAR',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PEPFAR,
    },
  },
  indicators: {
    total1: 'Total Index Tests',
    community1: 'Index - Number of tests - Community',
    facility1: 'Index - Number of tests - Facility',

    pTotal1: 'Positivity- Index Testing Total',
    pCommunity1: 'Positivity - Community Index testing',
    pFacility1: 'Positivity - Facility Index Testing',
  },
}

const selfGAM21 = {
  id: 'GAM21',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM21,
      [F.VALUE_COMMENT]: 'validated',
    },
  },
  indicators: {
    distributed1: 'Self Test Distributed-Data Value',
  },
}
const selfGAM20 = {
  id: 'GAM20',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM20,
      [F.VALUE_COMMENT]: 'validated',
    },
  },
  indicators: {
    distributed2: 'Self Test Distributed-Data Value',
  },
}
const selfGAM19 = {
  id: 'GAM19',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM19,
    },
  },
  indicators: {
    distributed3: 'HIVSTs distributed',
  },
}
const selfNPD19 = {
  id: 'NPD19',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.NPD19,
    },
  },
  indicators: {
    // same as GAM19
    distributed4: 'HIVSTs distributed',
  },
}
const selfPEPFAR = {
  id: 'PEPFAR',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PEPFAR,
    },
  },
  indicators: {
    distributed5: 'HIV self-tests distributed',
  },
}
const forecastWME = {
  id: 'WME',
  filters: {
    ALL: {
      // [F.SOURCE_DATABASE]: SOURCE_DB_MAP.WME, // now "WHO HIVST Forecast 2021"
    },
  },
  indicators: {
    demand1: 'HIV RDT Demand Forecast - Total Volume',
    // need1: 'HIVST Forecasting Need Estimate',
  },
}

const kpKP22 = {
  id: 'KP22',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.KP22,
      [F.AREA_NAME]: 'NULL',
    },
  },
  indicators: {
    prevMsm1: 'HIV prevalence among men who have sex with men',
    awareMsm1:
      'HIV testing and status awareness among men who have sex with men',

    prevPwid1: 'HIV prevalence among people who inject drugs',
    awarePwid1:
      'HIV testing and status awareness among people who inject drugs',

    prevPris1: 'HIV prevalence among prisoners',
    // awarePris1: '',

    prevSw1: 'HIV prevalence among sex workers',
    awareSw1: 'HIV testing and status awareness among sex workers',

    prevTrans1: 'HIV prevalence among transgender people',
    awareTrans1: 'HIV testing and status awareness among transgender people',
  },
}
const kpKP20 = {
  id: 'KP20',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.KP20,
      [F.AREA_NAME]: 'NULL',
    },
  },
  indicators: {
    prevMsm2: 'HIV prevalence among men who have sex with men',
    awareMsm2: 'MSM (PLHIV who know status (%))',

    prevPwid2: 'HIV prevalence among people who inject drugs',
    awarePwid2: 'PWID (PLHIV who know status (%))',

    prevPris2: 'HIV prevalence among prisoners',
    // awarePris2: '',

    prevSw2: 'HIV prevalence among sex workers',
    awareSw2: 'SW (PLHIV who know status (%))',

    prevTrans2: 'HIV prevalence among transgender people',
    awareTrans2: 'Transgender (PLHIV who know status (%))',
  },
}
const kpGAM21 = {
  id: 'GAM21',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM21,
      [F.AREA_NAME]: 'NULL',
    },
  },
  indicators: {
    // TODO: update indicators, of form HIV testing and status awareness among men who have sex with men
    prevMsm3: 'HIV prevalence among men who have sex with men',
    awareMsm3:
      'HIV testing and status awareness among men who have sex with men',

    prevPwid3: 'HIV prevalence among people who inject drugs',
    awarePwid3:
      'HIV testing and status awareness among people who inject drugs',

    prevPris3: 'HIV prevalence among prisoners',
    // awarePris3: '',

    prevSw3: 'HIV prevalence among sex workers',
    awareSw3: 'HIV testing and status awareness among sex workers',

    prevTrans3: 'HIV prevalence among transgender people',
    awareTrans3: 'HIV testing and status awareness among transgender people',
  },
}
const kpPCOP20 = {
  id: 'PCOP20',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PCOP20,
      [F.AREA_NAME]: 'NULL',
    },
  },
  indicators: {
    yearMsm1: 'MSM (Tested in past year)',
    yearSw1: 'SW (Tested in past year)',
    yearPwid1: 'PWID (Tested in past year)',
    yearPris1: 'People in prisons (Tested in past year)',
    yearTrans1: 'Transgender (Tested in past year)',
  },
}
const kpPROP20 = {
  id: 'PROP20',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PROP20,
      [F.AREA_NAME]: 'NULL',
    },
  },
  indicators: {
    yearMsm2: 'MSM (Tested in past year)',
    yearSw2: 'SW (Tested in past year)',
    yearPwid2: 'PWID (Tested in past year)',
    yearPris2: 'People in prisons (Tested in past year)',
    yearTrans2: 'Transgender (Tested in past year)',
  },
}
const kpPCOP19 = {
  id: 'PCOP19',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PCOP19,
      [F.AREA_NAME]: 'NULL',
    },
  },
  indicators: {
    yearMsm3: 'MSM (Tested in past year)',
    yearSw3: 'SW (Tested in past year)',
    yearPwid3: 'PWID (Tested in past year)',
    yearPris3: 'People in prisons (Tested in past year)',
    yearTrans3: 'Transgender (Tested in past year)',
  },
}
const kpPROP19 = {
  id: 'PROP19',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PROP19,
      [F.AREA_NAME]: 'NULL',
    },
  },
  indicators: {
    yearMsm4: 'MSM (Tested in past year)',
    yearSw4: 'SW (Tested in past year)',
    yearPwid4: 'PWID (Tested in past year)',
    yearPris4: 'People in prisons (Tested in past year)',
    yearTrans4: 'Transgender (Tested in past year)',
  },
}
const kpPCOP1718 = {
  id: 'PCOP1718',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PCOP1718,
      [F.AREA_NAME]: 'NULL',
    },
  },
  indicators: {
    yearMsm5: 'MSM (Tested in past year)',
    yearSw5: 'SW (Tested in past year)',
    yearPwid5: 'PWID (Tested in past year)',
    yearPris5: 'People in prisons (Tested in past year)',
    yearTrans5: 'Transgender (Tested in past year)',
  },
}
const kpPROP17 = {
  id: 'PROP17',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PROP17,
      [F.AREA_NAME]: 'NULL',
    },
  },
  indicators: {
    yearMsm6: 'MSM (Tested in past year)',
    yearSw6: 'SW (Tested in past year)',
    yearPwid6: 'PWID (Tested in past year)',
    yearPris6: 'People in prisons (Tested in past year)',
    yearTrans6: 'Transgender (Tested in past year)',
  },
}
const kpTGF = {
  id: 'TGF',
  filters: {
    ALL: {
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.TGF,
      [F.AREA_NAME]: 'NULL',
    },
  },
  indicators: {
    yearMsm7: 'Number of HIV tests taken among men who have sex with men',
    yearSw7: 'Number of HIV tests taken among sex workers',
    yearPwid7: 'Number of HIV tests taken among people who use drugs',
    yearTrans7: 'Number of HIV tests taken among transgender population',
  },
}

// const groupsGAM20 = {
//   id: 'GAM20',
//   filters: {
//     ALL: {
//       [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM20,
//       [F.VALUE_COMMENT]: 'validated',
//     }
//   },
//   indicators: {
//     year: 'Den Age-Female Gte 15'
//   }
// }
// const groupsS90 = {
//   id: 'S90',
//   filters: {
//     ALL: {
//       [F.SOURCE_DATABASE]: SOURCE_DB_MAP.S90,
//     }
//   },
//   indicators: {
//     year: 'tests_total'
//   },
//   indicatorAges: {
//     year: 'ALL'
//   }
// }
// const groupsPCOP20 = {
//   id: 'PCOP20',
//   filters: {
//     ALL: {
//       [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PCOP20,
//     }
//   },
//   indicators: {
//     year: 'Den Age-Female Gte 15',
//     year: 'Women 15-24 (Tested in past year)',
//   }
// }

const CHARTS = {
  CONTEXT: {
    // title: 'context',
    id: 'CONTEXT',
  },
  P95: {
    title: 'Progress towards 95-95-95',
    id: 'P95',
    indicators: {
      status: 'Percent of people living with HIV who know their status',
      art: 'Percent of people who know their status who are on ART',
      suppression: 'Percent of people on ART who achieve viral suppression',
    },
  },
  PLHIV_DIAGNOSIS: {
    title: 'PLHIV by diagnosis and treatment status',
    id: 'PLHIV_DIAGNOSIS',
    yearRange: R_2015_ON,
    indicators: {
      plhiv: 'People living with HIV - adults (aged 15+)',
      know: 'People living with HIV who know their status',
      onArt: 'PLHIV know status on ART',
    },
  },
  PLHIV_SEX: {
    title: 'PLHIV who know status - by sex',
    id: 'PLHIV_SEX',
    yearRange: R_2015_ON,
    indicators: {
      status: 'Percent of people living with HIV who know their status',
    },
  },
  PLHIV_AGE: {
    title: 'PLHIV who know status - by age',
    id: 'PLHIV_AGE',
    yearRange: R_2015_ON,
    shinyOnly: true,
    indicators: {
      aware: 'aware',
    },
  },
  HIV_NEGATIVE: {
    title: 'HIV-negative tests - first-time testers and repeat testers',
    id: 'HIV_NEGATIVE',
    yearRange: R_2015_ON,
    shinyOnly: true,
    indicators: {
      retests: 'retests_total',
      firsts: 'tests_first',
    },
  },
  HIV_POSITIVE: {
    title: 'HIV-positive tests - new diagnoses and retests',
    id: 'HIV_POSITIVE',
    yearRange: R_2015_ON,
    shinyOnly: true,
    indicators: {
      arts: 'retests_art',
      awares: 'retests_aware',
      news: 'new_diagnoses',
    },
  },
  PREVALENCE: {
    title: 'Prevalence and positivity',
    nonShinyTitle: 'Prevalence',
    yearRange: R_2015_ON,
    id: 'PREVALENCE',
    shinyOnlyIndicators: {
      positivity: 'positivity',
      dYield: 'yldnew',
    },
    indicators: {
      // prevalence: 'HIV Prevalence - adults (15-49)',
      // prevalence: 'M- Adult prevalence (15+) (Percent) Male+Female',
      prevalence: 'Adult prevalence (15+) (Percent) Male+Female',

      // 15+
      plhiv: 'People living with HIV - adults (aged 15+)',
      onArt: 'People receiving antiretroviral therapy',
      population: 'Population aged 15+ Male+Female',
    },
  },
  // PREGNANCY: {
  //   title: 'Pregnant women',
  //   yearRange: R_2015_2019,
  //   id: 'PREGNANCY',
  //   indicators: {
  //     perAnc: 'PerctestedANC',
  //     perPregKnown: 'HIV testing in pregnant women',
  //   },
  // },

  ADULTS: {
    title: 'HIV tests conducted and positivity, by sex',
    id: 'ADULTS',
    sources: [
      adultsGAM21,
      adultsGAM20,
      adultsGAM19,
      adultsNPD19,
      adultsPCOP20,
      adultsPROP20,
      adultsPCOP19,
      adultsPROP19,
      adultsPCOP1718,
      adultsPROP17,
      adultsPEPFAR,
    ],
    indicatorIds: ['total', 'men', 'women', 'pTotal', 'pMen', 'pWomen'],
  },
  COMMUNITY: {
    title: 'HIV tests conducted and positivity at community level',
    id: 'COMMUNITY',
    sources: [
      communityGAM21,
      communityGAM20,
      communityGAM19,
      communityNPD19,
      communityPEPFAR,
    ],
    indicatorIds: [
      'total',
      'mobile',
      'VCT',
      'other',
      'pTotal',
      'pMobile',
      'pVCT',
      'pOther',
    ],
  },
  FACILITY: {
    title: 'HIV tests conducted and positivity at facility level',
    id: 'FACILITY',
    sources: [
      facilityGAM21,
      facilityGAM20,
      facilityGAM19,
      facilityNPD19,
      facilityPEPFAR,
    ],
    indicatorIds: [
      'total',
      'PITC',
      'ANC',
      'VCT',
      'family',
      'other',
      'pTotal',
      'pPITC',
      'pANC',
      'pVCT',
      'pFamily',
      'pOther',
    ],
  },
  INDEX: {
    title:
      'HIV tests conducted and positivity for provider-assisted referral / index testing',
    id: 'INDEX',
    sources: [indexPEPFAR],
    indicatorIds: [
      'total',
      'community',
      'facility',
      'pTotal',
      'pCommunity',
      'pFacility',
    ],
  },
  SELF_TESTS: {
    title: 'HIV self-tests',
    id: 'SELF_TESTS',
    sources: [selfGAM21, selfGAM20, selfGAM19, selfNPD19, selfPEPFAR],
    indicatorIds: ['distributed'],
    indicatorYears: {
      distributed: R_2018_ON,
    },
  },
  FORECAST: {
    title: 'WHO Integrated HIV RDT forecast',
    id: 'FORECAST',
    sources: [forecastWME],
    indicatorIds: ['demand'],
    indicatorYears: {
      demand: R_2020_2025,
      // need: R_2020_2025,
    },
  },

  KP_TABLE: {
    title: 'Key Populations',
    id: 'KP_TABLE',
    sources: [
      kpKP22,
      kpKP20,
      kpGAM21,
      kpPCOP20,
      kpPROP20,
      kpPCOP19,
      kpPROP19,
      kpPCOP1718,
      kpPROP17,
      kpTGF,
    ],
    filters: {
      prev: {},
    },
    indicatorIds: [
      'prevMsm',
      'prevPwid',
      'prevPris',
      'prevSw',
      'prevTrans',
      'awareMsm',
      'awarePwid',
      'awarePris',
      'awareSw',
      'awareTrans',
      'yearMsm',
      'yearPwid',
      'yearPris',
      'yearSw',
      'yearTrans',
    ],
  },
  POLICY_TABLE: {
    title: 'WHO HIV Testing Policy Compliance',
    id: 'POLICY_TABLE',
    filters: {
      ALL: {
        // query can only filter by strict match, so instead check for match in results
        // [F.SOURCE_DATABASE]: SOURCE_DB_MAP._NCPI_
        [F.AREA_NAME]: 'NULL',
      },
      age: {
        // [F.SOURCE_DATABASE]: SOURCE_DB_MAP.ULP,
      },
      provider: {
        // [F.SOURCE_DATABASE]: SOURCE_DB_MAP.ULP,
      },
      community: {
        // [F.SOURCE_DATABASE]: SOURCE_DB_MAP.ULP,
      },
      lay: {
        // [F.SOURCE_DATABASE]: SOURCE_DB_MAP.ULP,
      },
      hivst: {
        // [F.SOURCE_DATABASE]: SOURCE_DB_MAP.HIVST21,
      },
      assisted: {
        // [F.SOURCE_DATABASE]: SOURCE_DB_MAP.ULP,
      },
      social: {
        // [F.SOURCE_DATABASE]: SOURCE_DB_MAP.ULP,
      },
      compliance: {
        // [F.SOURCE_DATABASE]: SOURCE_DB_MAP.WSR,
      },
      // no longer displays on table
      verification: {
        // [F.SOURCE_DATABASE]: SOURCE_DB_MAP.WSR,
      },
      antenatal: {
        // [F.SOURCE_DATABASE]: SOURCE_DB_MAP.WSR,
      },
      dual: {
        // [F.SOURCE_DATABASE]: SOURCE_DB_MAP.WSR,
      },
    },
    indicators: {
      age: 'Laws requiring parental consent for adolescents to access HIV testing',
      provider:
        'From national authorities Provider-initiated testing and counselling',
      community:
        'From national authorities Community-based testing and counselling',
      lay: 'From national authorities Lay provider testing',
      hivst: 'From national authorities Self-testing',
      assisted: 'From national authorities Assisted partner notification',
      social: 'From national authorities Social network-based HIV testing',
      compliance:
        '3-test strategy/algorithm for an HIV-positive diagnosis used',
      verification: 'Verification testing before ART',
      antenatal:
        'From national authorities Dual HIV/syphilis rapid diagnostic tests for pregnant women in antenatal care',
      dual: 'From national authorities Dual HIV/syphilis rapid diagnostic tests for any key population group',
    },
  },
  GROUPS_TABLE: {
    title: 'Population Groups',
    id: 'GROUPS_TABLE',
    // sources: [],
    indicatorIds: ['plhiv', 'aware', 'prev', 'newly', 'year', 'ever'],
    // calculatedIndicatorIds: ['undiagnosed'],
    indicatorDemographics: {
      ALL: R_ALL_DEMO_GROUPS,
    },
    indicatorDemographicsNoShiny: {
      ALL: R_LIMITED_DEMO_GROUPS,
    },
    // indicator query objects spelled out manually, given their complexity
    // indicatorSourceDbMap: {
    // }
  },
}
const C = CHARTS
const ALL_CHARTS = [
  //population/country context?
  C.P95,
  C.PLHIV_DIAGNOSIS,
  C.PLHIV_SEX,
  C.PLHIV_AGE,
  C.HIV_NEGATIVE,
  C.HIV_POSITIVE,
  C.PREVALENCE,
  // C.PREGNANCY,
  C.ADULTS,
  C.COMMUNITY,
  C.FACILITY,
  C.INDEX,
  C.SELF_TESTS,
  C.FORECAST,
  C.KP_TABLE,
  C.POLICY_TABLE,
  C.GROUPS_TABLE,
]

const getGenericIndId = (indId) => {
  return indId.replace(/\d+$/, '')
}

const allSexVariations = [
  'all sexes',
  'both',
  'males, females',
  'males, females, unknown',
]
const isAllSex = (r) => {
  const sex = r[FIELD_MAP.SEX]

  const is = !sex || allSexVariations.includes(sex.toLowerCase())
  if (!is) {
    // console.log('Not considered ALLSEX: ', sex)
  }
  return is
}
const allAgeVariations = ['all ages', '15+, <15, unknown']
const isAllAge = (r) => {
  const age = r[FIELD_MAP.AGE]

  const is = !age || allAgeVariations.includes(age.toLowerCase())
  if (!is) {
    // console.log('Not considered ALLAGE: ', age)
  }
  return is
}

const isFemale = (str) => str.toLowerCase().includes('female')

// const findPrioritizedResult = ({ results, dbHierarchy, resultCriteria = {} }) => {
//   let prioritizedResult = null

//   return _.find(dbHierarchy, db => {
//     const fResults = _.filter(results, r => {
//       // r is from db and satisfies all the result criteria
//       r[F.SOURCE_DATABASE] === db && _.every(resultCriteria, ({ value, field }) =>
//         r[field] === value)
//     })

//     const latest = _.maxBy(fResults, 'year')
//     return latest
//   })
// }

const findPrioritizedResult = ({
  results,
  dbHierarchy,
  resultCriteria = {},
  allSexCheck,
  allAgeCheck,
}) => {
  return _.find(dbHierarchy, (db) => {
    const fResults = _.filter(results, (r) => {
      if (r[F.SOURCE_DATABASE] !== db) {
        return false
      }
      const matchesCriteria = _.every(
        resultCriteria,
        ({ value, field }) => r[field] === value
      )
      if (!matchesCriteria) {
        return false
      }
      if (allSexCheck && !isAllSex(r)) {
        return false
      }
      if (allAgeCheck && !isAllAge(r)) {
        return false
      }

      // r is has passed all the filters
      return true
    })

    const latest = _.maxBy(fResults, 'year')
    if (fResults.length > 1) {
      // console.log('*** multiple results: ***')
      // console.log(fResults)
      // console.log('!: ', latest)
    }
    return latest
  })
}

// this map specifies which records need to be pulled to cover the indicators relevant to each chart
const getIndicatorMap = (isShiny) => {
  const indicatorMap = {
    [C.CONTEXT.id]: [
      {
        id: 'population',
        [F.INDICATOR]: 'Population',
        [F.UNIT_FORMAT]: 'NUMBER',
        [F.SOURCE_ORGANIZATION]: SOURCE_DB_MAP.UNAIDS,
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          return _.maxBy(results, 'year')
        },
      },
      {
        id: 'classification',
        [F.INDICATOR]: 'Income Group',
        [F.SOURCE_ORGANIZATION]: SOURCE_DB_MAP.WB,
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          return _.maxBy(results, 'year')
        },
      },
    ],
    [C.P95.id]: _.map(C.P95.indicators, (v, k) => ({
      id: k,
      [F.INDICATOR]: v,
      [F.COUNTRY_ISO_CODE]: true,
      [F.AGE]: 'all ages',
      [F.AREA_NAME]: 'NULL',
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
      getter: (results) => {
        return _.maxBy(results, 'year')
      },
    })),
    [C.PLHIV_DIAGNOSIS.id]: _.map(C.PLHIV_DIAGNOSIS.indicators, (v, k) => ({
      id: k,
      [F.INDICATOR]: v,
      [F.AGE]: '15+',
      [F.SEX]: 'NULL',
      [F.AREA_NAME]: 'NULL',
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
      [F.COUNTRY_ISO_CODE]: true,
      getter: (results) => {
        return C.PLHIV_DIAGNOSIS.yearRange.map((y) => {
          const fResults = _.filter(results, (r) => r.year === y)

          if (fResults.length > 1) {
            console.warn('## should not be multi results##')
          }
          return fResults[0]
        })
      },
    })),
    [C.PLHIV_SEX.id]: ['Females', 'Males'].map(
      (
        sex // TODO: standardize
      ) => ({
        id: sex,
        [F.INDICATOR]: C.PLHIV_SEX.indicators.status,
        [F.AGE]: '15+',
        [F.SEX]: sex,
        [F.AREA_NAME]: 'NULL',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          return C.PLHIV_SEX.yearRange.map((y) => {
            return _.find(results, (r) => r.year === y)
          })
        },
      })
    ),
    [C.PREVALENCE.id]: [
      {
        id: 'prevalence',
        [F.INDICATOR]: C.PREVALENCE.indicators.prevalence,
        // [F.AGE]: '15-99', // TODO: 15-49 ok?
        // [F.SEX]: 'both',
        [F.AREA_NAME]: 'NULL',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          return C.PREVALENCE.yearRange.map((y) => {
            const fResults = _.filter(results, (r) => r.year === y)

            if (fResults.length > 1) {
              console.warn('## should not be multi results##')
            }
            return fResults[0]
          })
        },
      },
      {
        id: 'plhiv',
        [F.INDICATOR]: C.PREVALENCE.indicators.plhiv,
        [F.AGE]: '15+',
        [F.SEX]: 'NULL',
        [F.AREA_NAME]: 'NULL',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          return C.PREVALENCE.yearRange.map((y) => {
            const fResults = _.filter(results, (r) => r.year === y)

            if (fResults.length > 1) {
              console.warn('## should not be multi results##')
            }
            return fResults[0]
          })
        },
      },
      {
        id: 'onArt',
        [F.INDICATOR]: C.PREVALENCE.indicators.onArt,
        [F.AGE]: '15+',
        [F.SEX]: 'NULL',
        [F.AREA_NAME]: 'NULL',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          return C.PREVALENCE.yearRange.map((y) => {
            return _.find(results, (r) => r.year === y)
          })
        },
      },
      {
        id: 'population',
        [F.INDICATOR]: C.PREVALENCE.indicators.population,
        [F.AREA_NAME]: 'NULL',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          return C.PREVALENCE.yearRange.map((y) => {
            return _.find(results, (r) => r.year === y)
          })
        },
      },
    ],
    // [C.PREGNANCY.id]: [
    //   {
    //     id: 'perAnc',
    //     [F.INDICATOR]: C.PREGNANCY.indicators.perAnc,
    //     // [F.AGE]: '15+',
    //     // [F.SEX]: 'NULL',
    //     [F.AREA_NAME]: 'NULL',
    //     [F.SOURCE_DATABASE]: SOURCE_DB_MAP.WGHO,
    //     [F.COUNTRY_ISO_CODE]: true,
    //     getter: (results) => {
    //       return C.PREGNANCY.yearRange.map((y) => {
    //         return _.find(results, (r) => r.year === y)
    //       })
    //     },
    //   },
    //   {
    //     id: 'perPregKnown',
    //     [F.INDICATOR]: C.PREGNANCY.indicators.perPregKnown,
    //     // [F.AGE]: '15+',
    //     // [F.SEX]: 'NULL',
    //     [F.AREA_NAME]: 'NULL',
    //     [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC21,
    //     [F.COUNTRY_ISO_CODE]: true,
    //     getter: (results) => {
    //       return C.PREGNANCY.yearRange.map((y) => {
    //         return _.find(results, (r) => r.year === y)
    //       })
    //     },
    //   },
    // ],
    [C.ADULTS.id]: _.flatMap(C.ADULTS.sources, (s) => {
      return _.map(s.indicators, (indVal, indId) => {
        return _.extend({}, s.filters.ALL, s.filters[indId], {
          id: indId,
          [F.INDICATOR]: indVal,
          [F.AREA_NAME]: 'NULL',
          [F.COUNTRY_ISO_CODE]: true,
          getter: (results) => {
            if (results.length > 1) {
              // debugger
              console.warn(
                `**LOOKOUT! Taking highest year result for: * ', indI
              `,
                results[0].indicator,
                'R:',
                _.maxBy(results, 'year'),
                `
              `,
                'rs:',
                results
              )
            }
            return _.maxBy(results, 'year')
          },
        })
      })
    }),
    [C.COMMUNITY.id]: _.flatMap(C.COMMUNITY.sources, (s) => {
      return _.map(s.indicators, (indVal, indId) => {
        return _.extend({}, s.filters.ALL, s.filters[indId], {
          id: indId,
          [F.INDICATOR]: indVal,
          [F.AREA_NAME]: 'NULL',
          [F.COUNTRY_ISO_CODE]: true,
          getter: (results) => {
            if (results.length > 1) {
              // debugger
              console.warn(
                `**LOOKOUT! Taking highest year result for: * ', indI
              `,
                results[0].indicator,
                'R:',
                _.maxBy(results, 'year'),
                `
              `,
                'rs:',
                results
              )
            }
            return _.maxBy(results, 'year')
          },
        })
      })
    }),
    [C.FACILITY.id]: _.flatMap(C.FACILITY.sources, (s) => {
      return _.map(s.indicators, (indVal, indId) => {
        return _.extend({}, s.filters.ALL, s.filters[indId], {
          id: indId,
          // see TODO-@*&
          // id: indId + s.id,
          [F.INDICATOR]: indVal,
          [F.AREA_NAME]: 'NULL',
          [F.COUNTRY_ISO_CODE]: true,
          getter: (results) => {
            if (results.length > 1) {
              // debugger
              console.warn(
                `**LOOKOUT! Taking highest year result for: * ', indI
              `,
                results[0].indicator,
                'R:',
                _.maxBy(results, 'year'),
                `
              `,
                'rs:',
                results
              )
            }
            return _.maxBy(results, 'year')
          },
        })
      })
    }),
    [C.INDEX.id]: _.flatMap(C.INDEX.sources, (s) => {
      return _.map(s.indicators, (indVal, indId) => {
        return _.extend({}, s.filters.ALL, s.filters[indId], {
          id: indId,
          [F.INDICATOR]: indVal,
          [F.AREA_NAME]: 'NULL',
          [F.COUNTRY_ISO_CODE]: true,
          getter: (results) => {
            if (results.length > 1) {
              // debugger
              console.warn(
                `**LOOKOUT! Taking highest year result for: * ', indI
              `,
                results[0].indicator,
                'R:',
                _.maxBy(results, 'year'),
                `
              `,
                'rs:',
                results
              )
            }
            return _.maxBy(results, 'year')
          },
        })
      })
    }),
    [C.SELF_TESTS.id]: _.flatMap(C.SELF_TESTS.sources, (s) => {
      return _.map(s.indicators, (indVal, indId) => {
        return _.extend({}, s.filters.ALL, s.filters[indId], {
          id: indId,
          [F.INDICATOR]: indVal,
          [F.AREA_NAME]: 'NULL',
          [F.COUNTRY_ISO_CODE]: true,
          getter: (results) => {
            const genericIndId = getGenericIndId(indId)
            return C.SELF_TESTS.indicatorYears[genericIndId].map((y) => {
              const fResults = _.filter(results, (r) => r.year === y)
              if (fResults.length > 1) {
                // debugger
                console.warn(
                  `**LOOKOUT! Taking highest year result for: * ', indI
                `,
                  fResults[0].indicator,
                  'R:',
                  _.maxBy(fResults, 'year'),
                  `
                `,
                  'rs:',
                  fResults
                )
              }
              return _.maxBy(fResults, 'year')
            })
          },
        })
      })
    }),
    [C.FORECAST.id]: _.flatMap(C.FORECAST.sources, (s) => {
      return _.map(s.indicators, (indVal, indId) => {
        return _.extend({}, s.filters.ALL, s.filters[indId], {
          id: indId,
          [F.INDICATOR]: indVal,
          [F.AREA_NAME]: 'NULL',
          [F.COUNTRY_ISO_CODE]: true,
          getter: (results) => {
            const genericIndId = getGenericIndId(indId)
            return C.FORECAST.indicatorYears[genericIndId].map((y) => {
              const fResults = _.filter(results, (r) => r.year === y)
              if (fResults.length > 1) {
                // debugger
                console.warn(
                  `**LOOKOUT! Taking highest year result for: * ', indI
                `,
                  fResults[0].indicator,
                  'R:',
                  _.maxBy(fResults, 'year'),
                  `
                `,
                  'rs:',
                  fResults
                )
              }
              return _.maxBy(fResults, 'year')
            })
          },
        })
      })
    }),
    [C.KP_TABLE.id]: _.flatMap(C.KP_TABLE.sources, (s) => {
      return _.map(s.indicators, (indVal, indId) => {
        return _.extend({}, s.filters.ALL, s.filters[indId], {
          id: indId,
          [F.INDICATOR]: indVal,
          [F.COUNTRY_ISO_CODE]: true,
          getter: (results) => {
            // if (fResults.length > 1) {
            // debugger
            //   console.warn(`**LOOKOUT! Taking highest year result for: * ', indI
            //   `, fResults[0].indicator, 'R:', _.maxBy(fResults, 'year'), `
            //   `,'rs:', fResults)
            // }
            // don't allSexCheck msm results, which are all males
            const allSexCheck = !indId.toLowerCase().includes('msm')
            const fResults = results.filter((r) => {
              return isAllAge(r) && (!allSexCheck || isAllSex(r))
            })

            const result = _.maxBy(fResults, 'year')
            // if (!result && results.length > 1) {
            // console.log('@indicator: ', indId)
            // console.log('@@@@: ', fResults)
            // console.log('!!!!', results)
            // }
            return result
          },
        })
      })
    }),
    [C.POLICY_TABLE.id]: _.map(C.POLICY_TABLE.indicators, (v, k) =>
      _.extend({}, C.POLICY_TABLE.filters.ALL, C.POLICY_TABLE.filters[k], {
        id: k,
        [F.INDICATOR]: v,
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (results.length > 1) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for: ', 
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return _.maxBy(
            results,
            // in case we want to filter by source db
            // results.filter((r) =>
            //   r[FIELD_MAP.SOURCE_DATABASE].includes(SOURCE_DB_MAP._NCPI_)
            // ),
            'year'
          )
        },
      })
    ),
    [C.GROUPS_TABLE.id]: [
      // ESTIMATED NUMBER OF PLHIV
      {
        id: 'plhiv1',
        [F.INDICATOR]: 'HIV population (15+) Female',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${FEMALE[0]}${ALL_ADULTS}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'plhiv2',
        [F.INDICATOR]: 'HIV population (15+) Male',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${MALE[0]}${ALL_ADULTS}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'plhiv3',
        [F.INDICATOR]: 'HIV population (50+) Female',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${FEMALE[0]}${ADULTS50}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'plhiv4',
        [F.INDICATOR]: 'HIV population (50+) Male',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${MALE[0]}${ADULTS50}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'plhiv5',
        [F.INDICATOR]: 'People living with HIV - female adults (aged 15+)',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${FEMALE[0]}${ALL_ADULTS}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'plhiv6',
        [F.INDICATOR]: 'People living with HIV - male adults (aged 15+)',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${MALE[0]}${ALL_ADULTS}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'plhiv7',
        [F.INDICATOR]: 'People living with HIV - females aged 15-24',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${FEMALE[0]}${ADULTS15}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'plhiv8',
        [F.INDICATOR]: 'People living with HIV - males aged 15-24',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${MALE[0]}${ADULTS15}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'plhiv9',
        [F.INDICATOR]: 'People living with HIV - females aged 25-34',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }

          return { [`${FEMALE[0]}${ADULTS25}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'plhiv10',
        [F.INDICATOR]: 'People living with HIV - males aged 25-34',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }

          return { [`${MALE[0]}${ADULTS25}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'plhiv11',
        [F.INDICATOR]: 'People living with HIV - females aged 35-49',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }

          return { [`${FEMALE[0]}${ADULTS35}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'plhiv12',
        [F.INDICATOR]: 'People living with HIV - males aged 35-49',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }

          return { [`${MALE[0]}${ADULTS35}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'plhiv13',
        [F.INDICATOR]: 'People living with HIV - females aged 50+',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${FEMALE[0]}${ADULTS50}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'plhiv14',
        [F.INDICATOR]: 'People living with HIV - males aged 50+',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${MALE[0]}${ADULTS50}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'plhiv15',
        [F.INDICATOR]: 'People living with HIV - females aged 25-34',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC21,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }

          return { [`${FEMALE[0]}${ADULTS25}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'plhiv16',
        [F.INDICATOR]: 'People living with HIV - males aged 25-34',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC21,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }

          return { [`${MALE[0]}${ADULTS25}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'plhiv17',
        [F.INDICATOR]: 'People living with HIV - females aged 35-49',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC21,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }

          return { [`${FEMALE[0]}${ADULTS35}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'plhiv18',
        [F.INDICATOR]: 'People living with HIV - males aged 35-49',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC21,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }

          return { [`${MALE[0]}${ADULTS35}`]: _.maxBy(results, 'year') }
        },
      },
      // [ UNDIAGNOSED PLHIV = (1 - PLHIV WHO KNOW STATUS) * ESTIMATED # PLHIV]
      // PLHIV WHO KNOW STATUS (%)
      {
        id: 'aware1',
        [F.INDICATOR]:
          'Percent of people living with HIV who know their status',
        [F.AGE]: '15+',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const resultMap = {}

          _.each(['Females', 'Males'], (sex) => {
            const fResults = _.filter(results, (r) => r[F.SEX] === sex)

            resultMap[`${sex[0].toLowerCase()}${ALL_ADULTS}`] = _.maxBy(
              fResults,
              'year'
            )
          })

          return resultMap
        },
      },
      {
        id: 'aware2',
        [F.INDICATOR]: 'aware',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.S90,
        [F.YEAR]: LATEST_YEAR,
        [F.AREA_NAME]: 'NULL',
        [F.INDICATOR_DESCRIPTION]: 'positive',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const resultMap = {}
          R_SEXES.forEach((sex) => {
            ;[...R_ADULT_AGES, ALL_ADULTS].forEach((ageRange) => {
              const result = _.find(
                results,
                (r) => r[F.SEX] === sex && r[F.AGE] === ageRange
              )

              resultMap[`${sex[0]}${ageRange}`] = result
            })
          })
          return resultMap
        },
      },
      // HIV PREVALENCE
      {
        id: 'prev1',
        [F.INDICATOR]: 'Adult prevalence (15-24) (Percent) Female',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${FEMALE[0]}${ADULTS15}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'prev2',
        [F.INDICATOR]: 'HIV Prevalence - young women (15-24)',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC21,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${FEMALE[0]}${ADULTS15}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'prev3',
        [F.INDICATOR]: 'Adult prevalence (15-24) (Percent) Male',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${MALE[0]}${ADULTS15}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'prev4',
        [F.INDICATOR]: 'HIV Prevalence - young men (15-24)',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC21,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${MALE[0]}${ADULTS15}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'prev5',
        [F.INDICATOR]: 'Adult prevalence (15+) (Percent) Female',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${FEMALE[0]}${ALL_ADULTS}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'prev6',
        [F.INDICATOR]: 'HIV Prevalence - female adults (15-49)',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC21,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${FEMALE[0]}${ALL_ADULTS}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'prev7',
        [F.INDICATOR]: 'Adult prevalence (15+) (Percent) Male',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${MALE[0]}${ALL_ADULTS}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'prev8',
        [F.INDICATOR]: 'HIV Prevalence - male adults (15-49)',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC21,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${MALE[0]}${ALL_ADULTS}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'prev9',
        [F.INDICATOR]: 'Adult prevalence (25-34) (Percent) Female',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${FEMALE[0]}${ADULTS25}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'prev10',
        [F.INDICATOR]: 'HIV Prevalence - females aged 25-34',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC21,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${FEMALE[0]}${ADULTS25}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'prev11',
        [F.INDICATOR]: 'Adult prevalence (25-34) (Percent) Male',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${MALE[0]}${ADULTS25}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'prev12',
        [F.INDICATOR]: 'HIV Prevalence - males aged 25-34',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC21,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${MALE[0]}${ADULTS25}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'prev13',
        [F.INDICATOR]: 'Adult prevalence (35-49) (Percent) Female',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${FEMALE[0]}${ADULTS35}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'prev14',
        [F.INDICATOR]: 'HIV Prevalence - females aged 35-49',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC21,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${FEMALE[0]}${ADULTS35}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'prev15',
        [F.INDICATOR]: 'Adult prevalence (35-49) (Percent) Male',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${MALE[0]}${ADULTS35}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'prev16',
        [F.INDICATOR]: 'HIV Prevalence - males aged 35-49',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC21,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${MALE[0]}${ADULTS35}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'prev17',
        [F.INDICATOR]: 'Adult prevalence (50+) (Percent) Female',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${FEMALE[0]}${ADULTS50}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'prev18',
        [F.INDICATOR]: 'HIV Prevalence - females aged 50+',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC21,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${FEMALE[0]}${ADULTS50}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'prev19',
        [F.INDICATOR]: 'Adult prevalence (50+) (Percent) Male',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${MALE[0]}${ADULTS50}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'prev20',
        [F.INDICATOR]: 'HIV Prevalence - males aged 50+',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC21,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${MALE[0]}${ADULTS50}`]: _.maxBy(results, 'year') }
        },
      },
      // NEW HIV INFECTIONS
      {
        id: 'newly1',
        [F.INDICATOR]: 'New HIV infections (15+) Female',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }

          return { [`${FEMALE[0]}${ALL_ADULTS}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'newly2',
        [F.INDICATOR]: 'New HIV Infections - female adults (aged 15+)',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC21,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }

          return { [`${FEMALE[0]}${ALL_ADULTS}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'newly3',
        [F.INDICATOR]: 'New HIV infections (15+) Male',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${MALE[0]}${ALL_ADULTS}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'newly4',
        [F.INDICATOR]: 'New HIV Infections - male adults (aged 15+)',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC21,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${MALE[0]}${ALL_ADULTS}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'newly5',
        [F.INDICATOR]: 'New HIV infections (15-24) Female',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${FEMALE[0]}${ADULTS15}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'newly6',
        [F.INDICATOR]: 'New HIV Infections - females aged 15-24',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC21,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${FEMALE[0]}${ADULTS15}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'newly7',
        [F.INDICATOR]: 'New HIV infections (15-24) Male',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${MALE[0]}${ADULTS15}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'newly8',
        [F.INDICATOR]: 'New HIV Infections - males aged 15-24',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC21,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${MALE[0]}${ADULTS15}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'newly9',
        [F.INDICATOR]: 'New infections by age 25-34 ; Female',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${FEMALE[0]}${ADULTS25}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'newly10',
        [F.INDICATOR]: 'New HIV Infections - females aged 25-34',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC21,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }

          return { [`${FEMALE[0]}${ADULTS25}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'newly11',
        [F.INDICATOR]: 'New infections by age 25-34 ; Male',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${MALE[0]}${ADULTS25}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'newly12',
        [F.INDICATOR]: 'New HIV Infections - males aged 25-34',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC21,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${MALE[0]}${ADULTS25}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'newly13',
        [F.INDICATOR]: 'New infections by age 35-49 ; Female',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }

          return { [`${FEMALE[0]}${ADULTS35}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'newly14',
        [F.INDICATOR]: 'New HIV Infections - females aged 35-49',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC21,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }

          return { [`${FEMALE[0]}${ADULTS35}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'newly15',
        [F.INDICATOR]: 'New infections by age 35-49 ; Male',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${MALE[0]}${ADULTS35}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'newly16',
        [F.INDICATOR]: 'New HIV Infections - males aged 35-49',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC21,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${MALE[0]}${ADULTS35}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'newly17',
        [F.INDICATOR]: 'New HIV infections (50+) Female',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${FEMALE[0]}${ADULTS50}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'newly18',
        [F.INDICATOR]: 'New HIV Infections - females aged 50+',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC21,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${FEMALE[0]}${ADULTS50}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'newly19',
        [F.INDICATOR]: 'New HIV infections (50+) Male',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC22,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${MALE[0]}${ADULTS50}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'newly20',
        [F.INDICATOR]: 'New HIV Infections - males aged 50+',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.SPEC21,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${MALE[0]}${ADULTS50}`]: _.maxBy(results, 'year') }
        },
      },
      // TESTED IN PAST YEAR
      {
        id: 'year1',
        [F.INDICATOR]: 'tests_total',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.S90,
        [F.YEAR]: LATEST_YEAR,
        [F.AREA_NAME]: 'NULL_OR_ALL',
        [F.INDICATOR_DESCRIPTION]: 'all',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const resultMap = {}
          R_SEXES.forEach((sex) => {
            ;[...R_ADULT_AGES, ALL_ADULTS].forEach((ageRange) => {
              const countryCode = _.get(results, [0, F.COUNTRY_ISO_CODE])
              const countryApplies = _.get(
                COUNTRY_MAP,
                [countryCode, 'sumFix'],
                false
              )
              if (FEATURE_FLAGS.SHINY_SUM && countryApplies) {
                const fResults = _.filter(
                  results,
                  (r) => r[F.SEX] === sex && r[F.AGE] === ageRange
                )

                const firstRow = fResults[0]
                const sumRow = { ...firstRow }
                sumRow[F.AREA_NAME] = 'NULL' // let's pretend
                sumRow[F.VALUE_UPPER] = undefined
                sumRow[F.VALUE_LOWER] = undefined
                sumRow[F.VALUE] = 0
                const areaMap = {}
                fResults.forEach((r) => {
                  if (r[F.VALUE]) {
                    const rowArea = r[F.AREA_NAME]
                    // we're summing over regional values. if there's also a country-wide
                    // value (ie AREA_NAME = NULL), it should not be included in sum.
                    if (areaMap[rowArea] || !r[F.AREA_NAME]) {
                      console.warn(
                        `$$$$ duplicate (or NULL) area_name for tests_total ${sex} ${ageRange}: `,
                        r
                      )
                    } else {
                      areaMap[rowArea] = true
                      sumRow[F.VALUE] += Number(r[F.VALUE])
                      console.log('$$$: ', rowArea, r[F.VALUE], sumRow[F.VALUE])
                    }
                  }
                })
                resultMap[`${sex[0]}${ageRange}`] = sumRow
                console.log(
                  `$$$$ USING SUMMED ROW FOR tests_total ${sex} ${ageRange} `
                )
                console.log('$$$$: ', sumRow)
                console.log('$$$$ SUMMED OVER: ', fResults)
              } else {
                const result = _.find(
                  results,
                  (r) => r[F.SEX] === sex && r[F.AGE] === ageRange
                )
                resultMap[`${sex[0]}${ageRange}`] = result
              }
            })
          })
          return resultMap
        },
      },
      {
        id: 'year2',
        [F.INDICATOR]: 'Den Age-Female Gte 15',
        [F.VALUE_COMMENT]: 'validated',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM21,
        [F.YEAR]: LATEST_YEAR,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result for:
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${FEMALE[0]}${ALL_ADULTS}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'year3',
        [F.INDICATOR]: 'Den Age-Male Gte 15',
        [F.VALUE_COMMENT]: 'validated',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.GAM21,
        [F.YEAR]: LATEST_YEAR,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result.**
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${MALE[0]}${ALL_ADULTS}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'year4',
        [F.INDICATOR]: 'Den Age-Female Gte 15',
        // [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PCOP20,
        // [F.YEAR]: LATEST_YEAR,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const dbHierarchy = [SOURCE_DB_MAP.PCOP20, SOURCE_DB_MAP.PROP20]
          const result = findPrioritizedResult({ results, dbHierarchy })

          return { [`${FEMALE[0]}${ALL_ADULTS}`]: result }
        },
      },
      {
        id: 'year5',
        [F.INDICATOR]: 'Den Age-Male Gte 15',
        // [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PCOP20,
        // [F.YEAR]: LATEST_YEAR,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const dbHierarchy = [SOURCE_DB_MAP.PCOP20, SOURCE_DB_MAP.PROP20]
          const result = findPrioritizedResult({ results, dbHierarchy })

          return { [`${MALE[0]}${ALL_ADULTS}`]: result }
        },
      },
      {
        id: 'year6',
        [F.INDICATOR]: 'Women 15-24 (Tested in past year)',
        // [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PCOP20,
        // [F.YEAR]: LATEST_YEAR,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const dbHierarchy = [SOURCE_DB_MAP.PCOP20, SOURCE_DB_MAP.PROP20]
          const result = findPrioritizedResult({ results, dbHierarchy })

          return { [`${FEMALE[0]}${ADULTS15}`]: result }
        },
      },
      {
        id: 'year7',
        [F.INDICATOR]: 'Men 15-24 (Tested in past year)',
        // [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PCOP20,
        // [F.YEAR]: LATEST_YEAR,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const dbHierarchy = [SOURCE_DB_MAP.PCOP20, SOURCE_DB_MAP.PROP20]
          const result = findPrioritizedResult({ results, dbHierarchy })

          return { [`${MALE[0]}${ADULTS15}`]: result }
        },
      },
      {
        id: 'year8',
        [F.INDICATOR]: 'Women (15+) - Number of tests',
        // [F.SOURCE_DATABASE]
        // [F.YEAR]: '2018',
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const dbHierarchy = [SOURCE_DB_MAP.GAM, SOURCE_DB_MAP.NPD]
          const result = findPrioritizedResult({ results, dbHierarchy })

          return { [`${FEMALE[0]}${ALL_ADULTS}`]: result }
        },
      },
      {
        id: 'year9',
        [F.INDICATOR]: 'Men (15+) - Number of tests',
        // [F.SOURCE_DATABASE]
        // [F.YEAR]: '2018',
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const dbHierarchy = [SOURCE_DB_MAP.GAM, SOURCE_DB_MAP.NPD]
          const result = findPrioritizedResult({ results, dbHierarchy })

          return { [`${MALE[0]}${ALL_ADULTS}`]: result }
        },
      },
      {
        id: 'year10',
        [F.INDICATOR]: 'Women (Tested in past year)',
        // [F.SOURCE_DATABASE]
        // [F.YEAR]: '2018',
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const { PCOP19, PROP19, PCOP1718, PROP17 } = SOURCE_DB_MAP
          const dbHierarchy = [PCOP19, PROP19, PCOP1718, PROP17]

          const result = findPrioritizedResult({ results, dbHierarchy })

          return { [`${FEMALE[0]}${ALL_ADULTS}`]: result }
        },
      },
      {
        id: 'year11',
        [F.INDICATOR]: 'Men (Tested in past year)',
        // [F.SOURCE_DATABASE]
        // [F.YEAR]: '2018',
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const { PCOP19, PROP19, PCOP1718, PROP17 } = SOURCE_DB_MAP
          const dbHierarchy = [PCOP19, PROP19, PCOP1718, PROP17]

          const result = findPrioritizedResult({ results, dbHierarchy })

          return { [`${MALE[0]}${ALL_ADULTS}`]: result }
        },
      },
      {
        id: 'year12',
        [F.INDICATOR]: 'Women 15-24 (Tested in past year)',
        // [F.SOURCE_DATABASE]
        // [F.YEAR]: '2018',
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const { PCOP19, PROP19, PCOP1718, PROP17 } = SOURCE_DB_MAP
          const dbHierarchy = [PCOP19, PROP19, PCOP1718, PROP17]

          const result = findPrioritizedResult({ results, dbHierarchy })

          return { [`${FEMALE[0]}${ADULTS15}`]: result }
        },
      },
      {
        id: 'year13',
        [F.INDICATOR]: 'Men 15-24 (Tested in past year)',
        // [F.SOURCE_DATABASE]
        // [F.YEAR]: '2018',
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const { PCOP19, PROP19, PCOP1718, PROP17 } = SOURCE_DB_MAP
          const dbHierarchy = [PCOP19, PROP19, PCOP1718, PROP17]

          const result = findPrioritizedResult({ results, dbHierarchy })

          return { [`${MALE[0]}${ADULTS15}`]: result }
        },
      },
      {
        id: 'year14',
        [F.INDICATOR]: 'Women (15+) Tested in Past Year',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PEPFAR,
        // [F.YEAR]: '2018',
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result.**
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${FEMALE[0]}${ALL_ADULTS}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'year15',
        [F.INDICATOR]: 'Men (15+) Tested in Past Year',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.PEPFAR,
        // [F.YEAR]: '2018',
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result.**
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${MALE[0]}${ALL_ADULTS}`]: _.maxBy(results, 'year') }
        },
      },
      // EVER TESTED (%)
      {
        id: 'ever1',
        [F.INDICATOR]: 'evertest',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.S90,
        [F.YEAR]: LATEST_YEAR,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const resultMap = {}
          R_SEXES.forEach((sex) => {
            ;[...R_ADULT_AGES, ALL_ADULTS].forEach((ageRange) => {
              const result = _.find(
                results,
                (r) => r[F.SEX] === sex && r[F.AGE] === ageRange
              )

              resultMap[`${sex[0]}${ageRange}`] = result
            })
          })
          return resultMap
        },
      },
      {
        id: 'ever2',
        [F.INDICATOR]: 'Women ever receiving an HIV test',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.DHS,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result.**
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${FEMALE[0]}${ALL_ADULTS}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'ever3',
        [F.INDICATOR]: 'Men ever receiving an HIV test',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.DHS,
        [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          if (
            results.length > 1 &&
            _.uniqBy(results, 'year').length !== results.length
          ) {
            // debugger
            console.warn(
              `**LOOKOUT! Taking highest year result.**
            `,
              results[0].indicator,
              'R:',
              _.maxBy(results, 'year'),
              `
            `,
              'rs:',
              results
            )
          }
          return { [`${MALE[0]}${ALL_ADULTS}`]: _.maxBy(results, 'year') }
        },
      },
      {
        id: 'ever4',
        [F.INDICATOR]: 'ever_tested',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.MICS,
        // [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const resultMap = {}
          R_SEXES.forEach((sex) => {
            resultMap[`${sex[0]}${ADULTS15}`] = _.find(
              results,
              (r) => r[F.SEX] === sex && r[F.AGE] === ADULTS15
            )

            resultMap[`${sex[0]}${ALL_ADULTS}`] = _.find(
              results,
              (r) => r[F.SEX] === sex && r[F.AGE] === '15-49'
            )
          })
          return resultMap
        },
      },
      {
        id: 'ever5',
        [F.INDICATOR]: 'ever_tested_results',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.MICS,
        // [F.AREA_NAME]: 'NULL',
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          const resultMap = {}
          R_SEXES.forEach((sex) => {
            resultMap[`${sex[0]}${ADULTS15}`] = _.find(
              results,
              (r) => r[F.SEX] === sex && r[F.AGE] === ADULTS15
            )

            resultMap[`${sex[0]}${ALL_ADULTS}`] = _.find(
              results,
              (r) => r[F.SEX] === sex && r[F.AGE] === '15-49'
            )
          })
          return resultMap
        },
      },
    ],
  }

  if (isShiny) {
    // add shiny90-only charts
    indicatorMap[C.PLHIV_AGE.id] = R_ADULT_AGES.map((ageRange) => ({
      id: ageRange,
      [F.INDICATOR]: C.PLHIV_AGE.indicators.aware,
      [F.AGE]: ageRange,
      [F.SEX]: 'both',
      [F.AREA_NAME]: 'NULL',
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.S90,
      [F.COUNTRY_ISO_CODE]: true,
      getter: (results) => {
        return C.PLHIV_AGE.yearRange.map((y) => {
          const fResults = _.filter(results, (r) => r.year === y)

          if (fResults.length > 1) {
            console.warn('## should not be multi results##')
          }
          return fResults[0]
        })
      },
    }))
    indicatorMap[C.HIV_NEGATIVE.id] = _.map(
      C.HIV_NEGATIVE.indicators,
      (v, k) => ({
        id: k,
        [F.INDICATOR]: v,
        [F.INDICATOR_DESCRIPTION]: 'negative',
        [F.AGE]: '15-99',
        [F.SEX]: 'both',
        [F.AREA_NAME]: 'NULL_OR_ALL',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.S90,
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          return C.HIV_NEGATIVE.yearRange.map((y) => {
            const fResults = _.filter(results, (r) => r.year === y)

            let fixing = false
            const firstRow = fResults[0]
            const countryCode = _.get(firstRow, F.COUNTRY_ISO_CODE)
            const countryApplies = _.get(
              COUNTRY_MAP,
              [countryCode, 'sumFix'],
              false
            )
            if (FEATURE_FLAGS.SHINY_SUM && countryApplies) {
              fixing = true
              const sumRow = { ...firstRow }
              sumRow[F.AREA_NAME] = 'NULL' // let's pretend
              sumRow[F.VALUE_UPPER] = undefined
              sumRow[F.VALUE_LOWER] = undefined
              sumRow[F.VALUE] = 0
              fResults.forEach((r) => {
                if (r[F.VALUE]) {
                  // we're summing over regional values. if there's also a country-wide
                  // value (ie AREA_NAME = NULL), it should not be included in sum.
                  if (r[F.AREA_NAME]) {
                    sumRow[F.VALUE] += Number(r[F.VALUE])
                  } else {
                    console.log('$$$$ skipping NULL AREA_NAME: ', r)
                  }
                }
              })
              console.log(`$$$$ USING SUMMED ROW FOR ${v} ${y}`)
              console.log('$$$$ USING SUMMED ROW: ', sumRow)
              console.log('$$$$ SUMMED OVER: ', fResults)
              fResults.unshift(sumRow)
            }

            if (fResults.length > 1 && !fixing) {
              console.warn('## should not be multi results##')
            }
            return fResults[0]
          })
        },
      })
    )
    indicatorMap[C.HIV_POSITIVE.id] = _.map(
      C.HIV_POSITIVE.indicators,
      (v, k) => ({
        id: k,
        [F.INDICATOR]: v,
        [F.INDICATOR_DESCRIPTION]: 'positive',
        [F.AGE]: '15-99',
        [F.SEX]: 'both',
        [F.AREA_NAME]: 'NULL_OR_ALL',
        [F.SOURCE_DATABASE]: SOURCE_DB_MAP.S90,
        [F.COUNTRY_ISO_CODE]: true,
        getter: (results) => {
          return C.HIV_POSITIVE.yearRange.map((y) => {
            const fResults = _.filter(results, (r) => r.year === y)

            let fixing = false
            const firstRow = fResults[0]
            const countryCode = _.get(firstRow, F.COUNTRY_ISO_CODE)
            const countryApplies = _.get(
              COUNTRY_MAP,
              [countryCode, 'sumFix'],
              false
            )
            if (FEATURE_FLAGS.SHINY_SUM && countryApplies) {
              fixing = true
              const sumRow = { ...firstRow }
              sumRow[F.AREA_NAME] = 'NULL' // let's pretend
              sumRow[F.VALUE_UPPER] = undefined
              sumRow[F.VALUE_LOWER] = undefined
              sumRow[F.VALUE] = 0
              fResults.forEach((r) => {
                if (r[F.VALUE]) {
                  // we're summing over regional values. if there's also a country-wide
                  // value (ie AREA_NAME = NULL), it should not be included in sum.
                  if (r[F.AREA_NAME]) {
                    sumRow[F.VALUE] += Number(r[F.VALUE])
                  } else {
                    console.log('$$$$ skipping NULL AREA_NAME: ', r)
                  }
                }
              })
              console.log(`$$$$ USING SUMMED ROW FOR ${v} ${y}`)
              console.log('$$$$ USING SUMMED ROW: ', sumRow)
              console.log('$$$$ SUMMED OVER: ', fResults)
              fResults.unshift(sumRow)
            }

            if (fResults.length > 1 && !fixing) {
              console.warn('$$$$ ## should not be multi results##')
            }
            return fResults[0]
          })
        },
      })
    )

    // add shiny90-only fields for PREVALENCE
    const shinyPrevInds = _.map(C.PREVALENCE.shinyOnlyIndicators, (v, k) => ({
      id: k,
      [F.INDICATOR]: v,
      [F.AGE]: '15-99',
      [F.SEX]: 'both',
      [F.AREA_NAME]: 'NULL',
      [F.SOURCE_DATABASE]: SOURCE_DB_MAP.S90,
      [F.COUNTRY_ISO_CODE]: true,
      getter: (results) => {
        return C.PREVALENCE.yearRange.map((y) => {
          const fResults = _.filter(results, (r) => r.year === y)

          if (fResults.length > 1) {
            console.warn('## should not be multi results##')
          }
          return fResults[0]
        })
      },
    }))

    indicatorMap[C.PREVALENCE.id].push(...shinyPrevInds)
  }

  return indicatorMap
}

export {
  BASE_URL,
  CHARTS, // TODO: rename 'CHART_MAP'
  ALL_CHARTS,
  FIELD_MAP,
  CSV_FIELDS,
  AGGREGATE_GETTER,
  R_2015_ON,
  R_ADULT_AGES,
  AGE_MAP,
  R_SEXES,
  FEMALE,
  MALE,
  SOURCE_DB_MAP,
  SOURCE_DISPLAY_MAP,
  getSourceDisplayWithYear,
  getIndicatorMap,
  isFemale,
}
