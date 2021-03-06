import colors from "./colors";
import { withRouter } from "react-router";

export default {
  "plotOptions": { 
    // "scatter": { "marker": { "radius": 5 }},
    // "series": { "stickyTracking": true },
    "scatter": { "stickyTracking": false },
    "area": { "marker": { "radius": 3 }, "stickyTracking": true },
    "line": { "marker": { "radius": 3 }, "stickyTracking": false },
    "spline": { "stickyTracking": false },
    "column": { "pointWidth": 30, "stickyTracking": false },
    // "column": { "maxPointWidth": 40 },
    // "series": { "yAxis": { "stackLabels": { enabled: true } } },
  },
  "tooltip": {
    // tooltip can escape chart bounds. so separate SVG is created, which solves
    // the problem of HTML titles/subtitles appearing on top of it
    "outside": true,
    "backgroundColor": 'rgba(256, 256, 256, .95)',
      // borderWidth: '1px',
    // "useHTML": true,
    //   style: {
    //     color: 'white',
    //   }
  },
  "chart": {
    // "className": "charty-mcchartface",
    "alignTicks": true,
    "height": 400,
    "backgroundColor": "#FFFFFF",
    "plotBackgroundColor": "#F8F8F8",
    "style": {
      "color": "#000000",
      "fontFamily": "'Archivo Narrow', sans-serif"
      // "fontFamily": "Verdana, sans-serif"
    },
    // "margin": [100, 100, 100, 100],
    "spacing": [30, 30, 25, 25], // keep in sync with chartConfigs spacing
  },
  "title": { "align": "left", "x": 40 },
  "subtitle": { "align": "left", "x": 40 },
  // "subtitle": { "align": "left" },
  "legend": {
    "enabled": true,
    "useHTML": true,
    "labelFormatter": function () {
      return `<span title='${this.userOptions.description || ""}'>${this.name}</span>`
    }
  },
  "credits": { "enabled": false },
  "colors": colors,
  "xAxis": {
    "tickInterval": 1,

    // "tickAmount": 5,
    "stackLabels": { "enabled": true, "style": { "fontWeight": "bold", "color": "gray" } },
    "labels": {
      "style": {
        "color": "#666666"
      }
    },
    "title": {
      "style": {
        "color": "#000000"
      }
    },
    "startOnTick": false,
    "endOnTick": false,
    "gridLineColor": "#FFFFFF",
    "gridLineWidth": 1.5,
    "tickWidth": 1.5,
    "tickLength": 5,
    "tickColor": "#666666",
    "minorTickInterval": 0,
    "minorGridLineColor": "#FFFFFF",
    "minorGridLineWidth": 0.5
  },
  "yAxis": {
    "tickAmount": 5,
    "stackLabels": { "enabled": true, "style": { "fontWeight": "bold", "color": "gray" } },
    "labels": {
      "style": {
        "color": "#666666"
      }
    },
    "title": {
      "style": {
        "color": "#000000"
      }
    },
    "startOnTick": false,
    "endOnTick": false,
    "gridLineColor": "#FFFFFF",
    "gridLineWidth": 1.5,
    "tickWidth": 1.5,
    "tickLength": 5,
    "tickColor": "#666666",
    "minorTickInterval": 0,
    "minorGridLineColor": "#FFFFFF",
    "minorGridLineWidth": 0.5
  },
  "legendBackgroundColor": "rgba(0, 0, 0, 0.5)",
  "background2": "#505053",
  "dataLabelsColor": "#B0B0B3",
  "textColor": "#C0C0C0",
  "contrastTextColor": "#F0F0F3",
  "maskColor": "rgba(255,255,255,0.3)"
}
