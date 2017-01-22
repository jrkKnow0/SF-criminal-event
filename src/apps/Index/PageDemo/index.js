/**
 * Created by huangxinxin on 2017/1/16.
 */
import style from './style.less'
import template from './template.html'
import Container from '../../../components/Container'
import LineChart from '../../../components/LineChart'
import Wordle from '../../../components/Wordle'
import $ from 'jquery'

export default {
  template,
  data () {
    return {
      style,
      lineChartOption: null,
      wordleOption: null
    }
  },
  components: {
    Container,
    LineChart,
    Wordle
  },
  methods: {
    calCloudData (data, topN, filter) {
      let dict = {}
      for (let i = 0; i < data.length; ++i) {
        let curDescript = data[i].Descript
        if (typeof (curDescript) === 'undefined') { continue } // 跳过那些没写descript的条目
        let curList = curDescript.replace(/\(|\)|,/g, '').split(' ') // 筛掉左右括号和逗号以后切词
        for (let j = 0; j < curList.length; ++j) {
          let curWord = curList[j]
          if (curWord in dict) {
            dict[curWord]++
          } else {
            let meaninglessWordDict = {'A': 1, 'OF': 1, 'OR': 1, 'FROM': 1} // 滤掉没有意义的词
            if (!(curWord in meaninglessWordDict)) {
              dict[curWord] = 1
            }
          }
        }
      }
      let countList = []
      for (let word in dict) {
        countList.push(dict[word])
      }
      let sortList = countList.sort(function (a, b) { return b - a }) // 直接sort是排序字符串，所以需要写compare函数
      sortList = sortList.slice(0, topN - 1)
      let cloudData = {}
      for (let word in dict) {
        let curCount = dict[word]
        for (let i = 0; i < sortList.length; ++i) {
          if (curCount === sortList[i]) {
            cloudData[word] = curCount
          }
        }
      }
      return cloudData
    },
    getIncidentData () {
      $.getJSON('/api/get_incident_san_francisco', (data) => {
        console.log('incident=>', data)
        let cloudData = this.calCloudData(data, 10, [])
        this.wordleOption = {
          data: cloudData,
          wordCloudFont: 'Algerian',
          wordSize: '40'
        }
      })
    },

    getLineChartViewData () {
      $.getJSON('/api/get_aqi_beijing', (data) => {
        // console.log('air=>', data)
        this.lineChartOption = {
          title: {
            text: 'Beijing AQI'
          },
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            data: data.map(function (item) {
              return item[ 0 ]
            })
          },
          yAxis: {
            splitLine: {
              show: false
            }
          },
          toolbox: {
            left: 'center',
            feature: {
              dataZoom: {
                yAxisIndex: 'none'
              },
              restore: {},
              saveAsImage: {}
            }
          },
          dataZoom: [ {
            startValue: '2014-06-01'
          }, {
            type: 'inside'
          } ],
          visualMap: {
            top: 10,
            right: 10,
            pieces: [ {
              gt: 0,
              lte: 50,
              color: '#096'
            }, {
              gt: 50,
              lte: 100,
              color: '#ffde33'
            }, {
              gt: 100,
              lte: 150,
              color: '#ff9933'
            }, {
              gt: 150,
              lte: 200,
              color: '#cc0033'
            }, {
              gt: 200,
              lte: 300,
              color: '#660099'
            }, {
              gt: 300,
              color: '#7e0023'
            } ],
            outOfRange: {
              color: '#999'
            }
          },
          series: {
            name: 'Beijing AQI',
            type: 'line',
            data: data.map(function (item) {
              return item[ 1 ]
            }),
            markLine: {
              silent: true,
              data: [ {
                yAxis: 50
              }, {
                yAxis: 100
              }, {
                yAxis: 150
              }, {
                yAxis: 200
              }, {
                yAxis: 300
              } ]
            }
          }
        }
      })
    },
    onChartClick (params) {
      console.log('我收到了', params)
    }
  },
  created () {
    this.getIncidentData()
    this.getLineChartViewData()
  }
}
