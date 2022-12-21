# Annual update instructions

Assuming new datasets take the same shape as previous years, the integration of a new year of data should not take too much work. Once the data is added to the DB, tweak the `constants/charts.js` consts as follows: 1) add the year (e.g. '2021') to the year range arrays (`R_2015_ON` and `R_2018_ON`), 2) update the `LATEST_YEAR` variable, 3) update charts' `SOURCE_DATABASE` as necessary (mainly charts with a `YEAR` of `LATEST_YEAR`); for instance, if `LATEST_YEAR` is updated -> 2021 a chart with a source db of `GAM20` might need to be updated to `GAM21`. 

See commit ****