import colors, { barChartColorDark, barChartAccent, barChartColor, gunSmoke, copper } from "./colors"
import _ from 'lodash'

// custom label https://jsfiddle.net/BlackLabel/37h8kqdL/
// responsive rules https://jsfiddle.net/alphalpha/rxvjh8y3/
// legend mouseover event https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/plotoptions/series-events-legenditemclick/

const columnScat = {
  chart: { type: 'column' },
  plotOptions: {
    line: {
      lineWidth: 0,
      states: { hover: { lineWidthPlus: 0 } },
      marker: { 
        radius: 8,
        lineColor: '#FFFFFF',
        lineWidth: 1,
      }
    },
    column: {
      states: { hover: { 
        borderColor: 'black'
        }
      },
      dataLabels: {
        // enabled: true,
        inside: true,
        // crop: false,
        // align: 'left',
        format: '{point.category}',
        rotation: -90,
        style: { fontSize: '12px' },
        x: 5,
      },
    }
  },
  legend: { enabled: false },
  xAxis: {
    type: 'category',
    labels: {
      enabled: true,
      rotation: 0,
      style: {
        fontSize: '10px',
        whiteSpace: 'pre',
        textOverflow: 'overflow',
        width: 100,
      }
    }
  },
  tooltip: {
    shared: true
  },
  yAxis: [
    {
      min: 0,
      tickAmount: 5,
      title: { style: { color: barChartColorDark } },
      labels: { style: { color: barChartColorDark } },
    },
    {
      min: 0,
      tickAmount: 5,
      title: { style: { color: barChartAccent } },
      labels: { style: { color: barChartAccent } },
      opposite: true
    }
  ],

  series: [
    {
      color: barChartColor,
    },
    {
      color: barChartAccent,
      zIndex: 10,
      yAxis: 1
    },
  ]
}

const columnLine = {
  chart: { type: 'column' },
  plotOptions: {
    line: {
      marker: { radius: 5 },
    },
    column: {
      states: {
        hover: {
          borderColor: 'black',
        },
      },
    },
  },
  legend: { enabled: true },
  xAxis: {
    type: 'category',
    labels: {
      rotation: 0,
      style: {
        fontSize: '10px',
      },
    },
  },
  tooltip: {
    shared: true,
  },

  series: [
    {
      color: barChartColor,
    },
    {
      color: copper,
    },
  ],
}

const column = {
  chart: { type: 'column' },

  plotOptions: {
    column: {
      states: {
        hover: {
          borderColor: 'black',
        },
      },
    },
  },
  xAxis: {
    type: 'category',
    labels: {
      rotation: 0,
      style: {
        fontSize: '10px',
      },
    },
  },

  yAxis: {
    min: 0,
  },
  tooltip: {
    shared: true,
  },
}

const line = {
  chart: { type: 'line' },
  yAxis: { title: { text: null }, labels: { format: '{value}%' } },
  tooltip: { valueSuffix: '%' },
  plotOptions: {
      series: {
          label: {
              connectorAllowed: false
          },
          marker: { radius: 0 }
      }
  },
}

const area = {
  chart: { type: 'area' },
  plotOptions: {
    area: {
      stacking: 'normal',
      marker: {
        enabled: false
      }
    }
  },
  legend: {
    symbolRadius: 0,
  },
  yAxis: {
    title: { text: null },
    stackLabels: { enabled: false }
  },
  marker : {symbol : 'square', radius : 12 }
}

const getColumnScat = ({title, series, categories, options}) => {
  const specifics = {
    title: { text: title },
    xAxis: { categories },
    yAxis: [{ title: { text: series[0].name }}, { title: { text: series[1].name }}],
    series: series
  }
  return _.merge({}, columnScat, specifics, options)
}

const getColumnLine = ({title, series, categories, options}) => {
  const specifics = {
    title: { text: title },
    xAxis: { categories },
    yAxis: [{ title: { text: null }}],
    series: series
  }
  return _.merge({}, columnLine, specifics, options)
}

const getColumn = ({title, series, categories, options}) => {
  const specifics = {
    title: { text: title },
    xAxis: { categories },
    yAxis: { title: null }, 
    series: series
  }
  return _.merge({}, column, specifics, options)
}

const getLine = ({title, series, spline=false, options={}}) => {
  const specifics = {
    chart: { type: spline ? 'spline' : 'line' },
    title: { text: title },
    // xAxis: { categories },
    series
  }
  return _.merge({}, line, specifics, options)
}

const getArea = ({title, series, options={}}) => {
  const specifics = {
    title: { text: title },
    // xAxis: { categories },
    series
  }

  // console.log('****', _.merge({}, area, specifics, options))
  return _.merge({}, area, specifics, options)
}

export {
  getArea,
  getColumn,
  getColumnScat,
  getColumnLine,
  getLine
}
