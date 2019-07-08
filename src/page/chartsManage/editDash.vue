<template>
<div class="positionR">
  <div class="edit-dash-left" :style="{'height': colHeight + 'px'}">
    <Form>
      <div class="chart-set-title">名称</div>
      <Input v-model="dashObj.title"></Input>
      <div class="chart-set-title">背景</div>
      <FormItem label="">
        <RadioGroup v-model="dashObj.isBackgroundColor">
          <Radio label="is"><span>背景色</span></Radio>
          <Radio label="isnot"><span>背景图</span></Radio>
        </RadioGroup>
      </FormItem>
      <FormItem v-show="dashObj.isBackgroundColor === 'is'" label="背景色">
        <RadioGroup v-model="dashObj.hasBackgroundColor">
          <Radio label="false"><span>无</span></Radio>
          <Radio label="true"><span>有</span></Radio>
        </RadioGroup>
        <ColorPicker v-show="dashObj.hasBackgroundColor === 'true'" v-model="dashObj.backgroundColor" format="rgb" />
      </FormItem>
      <div v-show="dashObj.isBackgroundColor === 'isnot'" class="dash-background-con">
        <a href="javascript:void(0)" @click="showBackground">
          <template v-if="dashObj.background === ''">
            <div class="empty-background">无</div>
          </template>
          <template v-else>
            <img :src="dashObj.background">
          </template>
        </a>
      </div>
      <div class="line"></div>
      <div v-show="chartOrWord === 'word'">
        <div class="chart-set-title">文字</div>
        <Input v-model="currentWord.text"></Input>
        <label>字体大小</label>
        <Select v-model="currentWord.size" style="width:65px;">
          <Option v-for="(item, index) in fontSize" :value="item" :key="index">{{item + 'px'}}</Option>
        </Select>
        <label>颜色</label>
        <ColorPicker v-model="currentWord.color" format="rgb" /><br>
        <label>字体加粗</label>
        <Select v-model="currentWord.weight" style="width:100px;">
          <Option value="normal">普通</Option>
          <Option value="bold">加粗</Option>
        </Select>
      </div>
    </Form>
  </div>
  <div class="edit-dash-right">
    <div class="edit-dash-right-top">
     {{dashObj.title}}
      <span>
        <Button type="primary" @click="addChart">增加图表</Button>
        <Button type="primary" @click="addWord">增加文字</Button>
        <Button type="primary" @click="save">保存</Button>
      </span>
    </div>
    <div class="dash-con" :style="dashStyle" id="dashCon">
      <vue-draggable-resizable v-for="(item, index) in dashObj.charts" :w="100" :h="100" @activated="onDrag(item)" @dragstop="dragStop" @resizestop="resizeStop" :parent="'.dash-con'" :key="index">
        <div class="dash-chart-con" :style="{backgroundColor: item.chartObj.hasBackgroundColor === 'true' ? tem.chartObj.backgroundColor : 'none'}">
          <div class="dash-chart-inner" :id="'chart' + index"></div>
        </div>
      </vue-draggable-resizable>
      <vue-draggable-resizable v-for="(item, index) in dashObj.words" :w="200" :h="40" @activated="onDrag(item)" @dragstop="dragStop" @resizestop="resizeStop" :parent="'.dash-con'" :key="index">
        <div class="dash-word-con" :style="{color: item.color, fontSize: item.size + 'px', fontWeight: item.weight}">
          {{item.text}}
        </div>
      </vue-draggable-resizable>
    </div>
    <div class="dash-con" :style="dashStyle">
      <div v-for="(item, index) in loaddashObj.charts" class="dash-chart-con dash-chart-item" :style="{backgroundColor: item.chartObj.hasBackgroundColor === 'true' ? tem.chartObj.backgroundColor : 'none', left: (item.left * scale) + 'px', top: (item.top * scale) + 'px', width: (item.width * scale) + 'px', height: (item.height * scale) + 'px'}" :key="index">
        <div class="dash-chart-inner" :id="'achart' + index"></div>
      </div>
      <div class="dash-word-con" v-for="(item, index) in loaddashObj.words" :style="{left: (item.left * scale) + 'px', top: (item.top * scale) + 'px', width: (item.width * scale) + 'px', height: (item.height * scale) + 'px', color: item.color, fontSize: item.size + 'px', fontWeight: item.weight}" :key="index">
        {{item.text}}
      </div>
    </div>
  </div>
  <Modal v-model="modalBackground" width="1000" title="选择背景图" @on-ok="saveBackground">
    <div>
      <ul class="modal-background-list">
        <li v-for="(item, index) in backgroundList" :class="{'active': currentBackground === item}" @click="chooseBackground(item)" :key="index">
          <img :src="item">
        </li>
      </ul>
    </div>
  </Modal>
</div>
</template>

<script>
import Util from '@/utils/index'
import echarts from 'echarts/lib/echarts'
require('echarts/lib/chart/pie')
require('echarts/lib/chart/bar')
require('echarts/lib/chart/line')
require('echarts/lib/chart/gauge')
require('echarts/lib/chart/scatter')
require('echarts/lib/chart/funnel')
require('echarts/lib/chart/radar')
require('echarts/lib/component/tooltip')
require('echarts/lib/component/title')
require('echarts/lib/component/legend')
require('echarts/lib/component/toolbox')
require('es6-promise').polyfill()
export default {
  data () {
    return {
      dashObj: {title: '', isBackgroundColor: 'is', hasBackgroundColor: 'false', backgroundColor: 'rgb(255, 255, 255)', background: '', charts: [], words: []}, // 看板对象
      loaddashObj: {}, // 载入看板对象
      chart: {}, // 图表对象
      currentChart: {}, // 当前图表
      chartDiv: [], // 图表Div
      chartOption: [], // 图表配置
      dashWidth: '', // 看板宽度
      scale: 1, // 看板比例
      modalBackground: false, // 背景图对话框是否显示
      backgroundList: ['/static/img/bg.jpg', '/static/img/user-bg.png', '/static/img/blur-background04.jpg', '/static/img/blur-background08.jpg', '/static/img/blur-background09.jpg'], // 背景图列表
      currentBackground: '', // 选中背景图
      currentWord: {color: 'rgb(51, 51, 51)'}, // 当前文字
      chartOrWord: '', // 是图表还是文字
      fontSize: this.$store.state.fontSize, // 字体大小
      // chartJson: '{"chartObj":{"title":"未命名图表","showTitle":true,"titleFontSize":"18","titleColor":"rgb(51, 51, 51)","titleLocation":"left","type":"bar","x":{"show":true,"rotation":"0","showAll":false,"showLabels":true,"showTitle":false,"location":"end","labelFontSize":"12","labelColor":"rgb(51, 51, 51)","nameFontSize":"12","nameColor":"rgb(51, 51, 51)","lineWidth":"1","lineColor":"rgb(51, 51, 51)","lineType":"solid","showSplitLine":true,"splitLineWidth":"1","splitLineColor":"rgb(204, 204, 204)","splitLineType":"solid"},"y":{"show":true,"showLabels":true,"showTitle":false,"labelFontSize":"12","labelColor":"rgb(51, 51, 51)","nameFontSize":"12","nameColor":"rgb(51, 51, 51)","lineWidth":"1","lineColor":"rgb(51, 51, 51)","lineType":"solid","showSplitLine":false,"splitLineWidth":"1","splitLineColor":"rgb(204, 204, 204)","splitLineType":"solid"},"rightY":{"show":true,"showLabels":true,"showTitle":false,"labelFontSize":"12","labelColor":"rgb(51, 51, 51)","nameFontSize":"12","nameColor":"rgb(51, 51, 51)","lineWidth":"1","lineColor":"rgb(51, 51, 51)","lineType":"solid"},"showDatalabels":false,"datalabelFontSize":"12","symbolSize":10,"lineStyle":"straight","lineStep":"false","pieStyle":"pieShape","pieRose":"false","radarStyle":"line","legend":{"position":"top"},"gauge":{"unit":"","rateDigit":2,"conditions":[]},"funnelAlign":"center","hasBackgroundColor":"false","backgroundColor":"rgb(255, 255, 255)"},"x_field":[{"fieldType":"combobox","text":"industry","title":"行业","width":"278","height":"32","editable":"true","readonly":"false","required":"false","listDisplay":"true","type":"varchar(255)","selectType":"0","selectID":"select_industry","trWidth":200,"radios":[""],"checkboxs":[""]}],"y_field":[{"fieldType":"textbox","text":"version","title":"版本","width":"278","height":"32","editable":"false","readonly":"false","required":"false","listDisplay":"true","type":"varchar(255)","prompt":"","calculateType":"sum","color":"rgb(81, 130, 228)"}],"y_field_type":"","secondary_y_field":[],"secondary_y_field_type":"","currentColorTheme":{"name":"默认12","colors":["rgb(81, 130, 228)","rgb(155, 204, 102)","rgb(63, 178, 126)","rgb(247, 203, 74)","rgb(248, 141, 72)","rgb(243, 83, 82)","rgb(206, 98, 214)","rgb(137, 84, 212)","rgb(81, 86, 184)","rgb(81, 180, 241)","rgb(105, 212, 219)","rgb(212, 45, 107)"]},"radarMax":[820,952,901,934,1290,1630,1520]}',
      chartJson: '{"chartObj":{"title":"未命名图表","showTitle":true,"titleFontSize":"18","titleColor":"rgba(255,255,255,1)","titleLocation":"left","type":"line","x":{"show":true,"rotation":"0","showAll":false,"showLabels":true,"showTitle":false,"location":"end","labelFontSize":"12","labelColor":"rgba(255,255,255,1)","nameFontSize":"12","nameColor":"rgb(51, 51, 51)","lineWidth":"1","lineColor":"rgba(255,255,255,1)","lineType":"solid","showSplitLine":true,"splitLineWidth":"1","splitLineColor":"rgba(255,255,255,1)","splitLineType":"solid"},"y":{"show":true,"showLabels":true,"showTitle":false,"labelFontSize":"12","labelColor":"rgba(252,252,252,1)","nameFontSize":"12","nameColor":"rgb(51, 51, 51)","lineWidth":"1","lineColor":"rgba(255,255,255,1)","lineType":"solid","showSplitLine":false,"splitLineWidth":"1","splitLineColor":"rgb(204, 204, 204)","splitLineType":"solid"},"rightY":{"show":true,"showLabels":true,"showTitle":false,"labelFontSize":"12","labelColor":"rgb(51, 51, 51)","nameFontSize":"12","nameColor":"rgb(51, 51, 51)","lineWidth":"1","lineColor":"rgb(51, 51, 51)","lineType":"solid"},"showDatalabels":false,"datalabelFontSize":"12","symbolSize":10,"lineStyle":"straight","lineStep":"false","pieStyle":"pieShape","pieRose":"false","radarStyle":"line","legend":{"position":"top"},"gauge":{"unit":"","rateDigit":2,"conditions":[]},"funnelAlign":"center","hasBackgroundColor":"false","backgroundColor":"rgb(255, 255, 255)"},"x_field":[{"fieldType":"combobox","text":"industry","title":"行业","width":"278","height":"32","editable":"true","readonly":"false","required":"false","listDisplay":"true","type":"varchar(255)","selectType":"0","selectID":"select_industry","trWidth":200,"radios":[""],"checkboxs":[""]}],"y_field":[{"fieldType":"textbox","text":"version","title":"版本","width":"278","height":"32","editable":"false","readonly":"false","required":"false","listDisplay":"true","type":"varchar(255)","prompt":"","calculateType":"sum","color":"rgb(247, 203, 74)"}],"y_field_type":"","secondary_y_field":[],"secondary_y_field_type":"","currentColorTheme":{"name":"默认12","colors":["rgb(81, 130, 228)","rgb(155, 204, 102)","rgb(63, 178, 126)","rgb(247, 203, 74)","rgb(248, 141, 72)","rgb(243, 83, 82)","rgb(206, 98, 214)","rgb(137, 84, 212)","rgb(81, 86, 184)","rgb(81, 180, 241)","rgb(105, 212, 219)","rgb(212, 45, 107)"]},"radarMax":[820,952,901,934,1290,1630,1520]}',
      xData: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      yData: [[820, 932, 901, 934, 1290, 1330, 1320], [420, 952, 501, 634, 1090, 1630, 1520]],
      sYData: [[420, 932, 901, 534, 1290, 1330, 1120], [420, 452, 601, 634, 690, 1230, 1120]]
    }
  },
  methods: {
    /**
    * @desc 初始化
    */
    init: function () {
      this.chart = JSON.parse(this.chartJson)
    },
    /**
    * @desc 显示背景图列表
    */
    showBackground: function () {
      this.modalBackground = true
    },
    /**
    * @desc 选择背景图
    * @param {String} item 背景图
    */
    chooseBackground: function (item) {
      this.currentBackground = item
    },
    /**
    * @desc 保存背景图
    */
    saveBackground: function () {
      this.dashObj.background = this.currentBackground
      this.modalBackground = false
    },
    /**
    * @desc 增加图表
    */
    addChart: function () {
      this.dashObj.charts.push(JSON.parse(JSON.stringify(this.chart)))
      this.$nextTick(() => {
        this.dashObj.charts[this.dashObj.charts.length - 1].chartObj.title = '未命名图表' + Math.random()
        this.dashObj.charts[this.dashObj.charts.length - 1].left = 0
        this.dashObj.charts[this.dashObj.charts.length - 1].top = 0
        this.dashObj.charts[this.dashObj.charts.length - 1].width = 100
        this.dashObj.charts[this.dashObj.charts.length - 1].height = 100
      })
      console.log(this.dashObj.charts)
      this.$nextTick(() => {
        let temp = echarts.init(document.getElementById('chart' + (this.dashObj.charts.length - 1)))
        this.chartDiv.push(temp)
        this.chartOption[this.chartOption.length] = Util.initChartOption(this.chart.chartObj, this.chart.x_field, this.chart.y_field, this.chart.y_field_type, this.chart.scatter_y_field, this.chart.secondary_y_field, this.chart.secondary_y_field_type, this.chart.currentColorTheme, this.chart.radarMax, this.xData, this.yData, this.SYData)
        temp.setOption(this.chartOption[this.chartOption.length - 1])
        // console.log(this.chartDiv)
        // console.log(this.chartOption)
      })
    },
    /**
    * @desc 增加文字
    */
    addWord: function () {
      this.dashObj.words.push({text: '', color: 'rgb(51, 51, 51)', size: '16', weight: 'normal', left: 0, top: 0, width: 200, height: 40})
    },
    /**
    * @desc 选中图表或文字
    * @param {Object} item 图表
    */
    onDrag: function (item) {
      if (item.chartObj === undefined) {
        this.currentWord = item
        this.chartOrWord = 'word'
      } else {
        this.currentChart = item
        this.chartOrWord = 'chart'
        console.log(this.currentChart)
      }
    },
    /**
    * @desc 拖拽结束
    * @param {Num} left 左侧距离
    * @param {Num} top 顶侧距离
    */
    dragStop: function (left, top) {
      console.log(left + '-' + top)
      if (this.chartOrWord === 'word') {
        this.currentWord.left = left / this.scale
        this.currentWord.top = top / this.scale
      } else {
        this.currentChart.left = left / this.scale
        this.currentChart.top = top / this.scale
        console.log(this.dashObj.charts)
      }
    },
    /**
    * @desc 改变大小结束
    * @param {Num} left 左侧距离
    * @param {Num} top 顶侧距离
    * @param {Num} width 宽度
    * @param {Num} height 高度
    */
    resizeStop: function (left, top, width, height) {
      // console.log(left + '-' + top + '-' + width + '-' + height)
      if (this.chartOrWord === 'word') {
        this.currentWord.width = width / this.scale
        this.currentWord.height = height / this.scale
      } else {
        this.currentChart.width = width / this.scale
        this.currentChart.height = height / this.scale
        let index = this.dashObj.charts.indexOf(this.currentChart)
        // console.log(this.dashObj.charts)
        // console.log(this.currentChart)
        // console.log(index)
        let temp = echarts.init(document.getElementById('chart' + index))
        temp.dispose()
        temp = echarts.init(document.getElementById('chart' + index))
        temp.setOption(this.chartOption[index])
        // console.log(temp)
        // console.log(this.chartOption[index])
      }
    },
    /**
    * @desc 保存
    */
    save: function () {
      let temp = JSON.stringify(this.dashObj)
      console.log(temp)
      this.loaddashObj = JSON.parse(JSON.stringify(this.dashObj))
      this.$nextTick(() => {
        this.load()
      })
    },
    /**
    * @desc 载入看板
    */
    load: function () {
      for (let i = 0; i < this.loaddashObj.charts.length; i++) {
        let temp = echarts.init(document.getElementById('achart' + i))
        let oTemp = Util.initChartOption(this.chart.chartObj, this.chart.x_field, this.chart.y_field, this.chart.y_field_type, this.chart.scatter_y_field, this.chart.secondary_y_field, this.chart.secondary_y_field_type, this.chart.currentColorTheme, this.chart.radarMax, this.xData, this.yData, this.SYData)
        temp.setOption(oTemp)
      }
    }
  },
  computed: {
    colHeight () { // 页面高度
      return document.body.offsetHeight - 112
    },
    dashStyle () { // 看板背景样式
      let obj = {}
      if (this.dashObj.isBackgroundColor === 'is') {
        if (this.dashObj.hasBackgroundColor === 'true') {
          obj.backgroundColor = this.dashObj.backgroundColor
        }
      } else if (this.dashObj.isBackgroundColor !== undefined) {
        if (this.dashObj.background !== '' && this.dashObj.background !== undefined) {
          obj.background = `url(${this.dashObj.background}) center no-repeat`
          obj.backgroundSize = '100% 100%'
          console.log(obj)
        }
      }
      return obj
    }
  },
  mounted () {
    this.init()
    // 看板比例计算
    this.dashWidth = document.getElementById('dashCon').offsetWidth
    this.scale = this.dashWidth / 1000
    const that = this
    window.onresize = function temp () {
      that.dashWidth = document.getElementById('dashCon').offsetWidth
      this.scale = this.dashWidth / 1000
    }
  }
}
</script>

<style lang="scss">
.edit-dash-left{
  overflow-y: auto;
  overflow-x: hidden;
  border-right: 1px solid #ddd;
  z-index: 100;
  position: absolute;
  top: 0;
  left: 0;
  width: 300px;
  padding: 0 8px;
}
.edit-dash-right{
  padding: 10px;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 100;
  margin-left: 300px;
}
.chart-set-title{
  padding: 10px 0;
  color: #515a6e;
  font-size: 12px;
  font-weight: 600;
}
.dash-background-con{
  text-align: center;
  img{
    width: 200px;
    height: 120px;
  }
}
.empty-background{
  display: inline-block;
  width: 200px;
  height: 120px;
  line-height: 120px;
  font-size: 18px;
  text-align: center;
  color: #999;
  border: 1px solid #ddd;
}
.modal-background-list{
  li{
    float: left;
    width: 50%;
    padding: 15px;
    cursor: pointer;
    img{
      width: 100%;
      height: 280px;
    }
    &.active{
      img{
        box-shadow: 5px 5px 8px rgba(0, 0, 0, .3);
      }
    }
  }
}
.line{
  background-color: #999;
  margin: 10px 0;
}
.edit-dash-right-top{
  font-size: .18rem;
  height: .5rem;
  line-height: .5rem;
  span{
    float: right;
  }
}
.dash-con{
  position: relative;
  border: 1px solid #ddd;
  min-height: 8rem;
}
.dash-chart-con{
  width: 100%;
  height: 100%;
  position: relative;
}
.dash-chart-title{
  position: absolute;
  top: 5px;
  left: 0;
  right: 0;
  width: 100%;
}
.dash-chart-inner{
  height: 100%;
}
.dash-chart-item{
  position: absolute;
}
.dash-word-con{
  position: absolute;
  word-break: break-all;
}
</style>
