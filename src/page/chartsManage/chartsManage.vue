<template>
<div>
  <div class="positionR">
    <div class="edit-chart-left" :style="{'height': colHeight + 'px'}">
      <div class="edit-chart-left-con">
        <div class="edit-chart-left-title">表单</div>
        <Select v-model="currentForm" @on-change="changeForm">
          <Option v-for="(item, index) in formList" :value="item" :key="index">{{ item.name }}</Option>
        </Select>
        <div class="edit-chart-left-line"></div>
        <div class="edit-chart-left-title">字段</div>
        <ul class="edit-chart-left-list">
        <draggable v-model="fields" :options="dragOption" @end="dragEnd">
          <li v-for="(item, index) in fields" :key="index">{{item.title}}</li>
        </draggable>
        </ul>
      </div>
    </div>
    <div class="edit-chart-middle" :style="{'height': colHeight + 'px'}">
      <div class="edit-chart-field-con">
        <label>维度：</label>
        <div class="edit-chart-field-inner">
          <ul>
            <draggable v-model="x_field" :options="dragToXOption">
              <li v-for="(item, index) in x_field" :key="index">
                <Dropdown trigger="click" placement="bottom-start">
                  <Button type="primary">
                    <template v-if="item.alias !== '' && item.alias !== undefined">{{item.alias}}</template>
                    <template v-else>{{item.title}}</template>
                    <Icon type="ios-arrow-down"></Icon>
                  </Button>
                  <DropdownMenu slot="list">
                    <DropdownItem><a href="javascript:void(0)" @click="setFieldName(item)">设置字段</a></DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                <a href="javascript:void(0)" @click.stop="delXField(index)" class="close-btn" title="删除"><Icon type="md-close" /></a>
              </li>
            </draggable>
          </ul>
        </div>
      </div>
      <div class="edit-chart-field-con">
        <label>数值<template v-if="chartObj.type === 'scatter'">X</template>：</label>
        <div class="edit-chart-field-inner">
          <ul>
            <draggable v-model="y_field" :options="dragToYOption" class="drag-y-con">
              <li v-if="chartObj.type === 'line-and-bar'">
                <Select v-model="y_field_type" @on-change="changeYFieldType" style="width:100px;">
                  <Option value="line">折线图</Option>
                  <Option value="bar">柱状图</Option>
                  <Option value="stack-bar">堆叠柱状图</Option>
                </Select>
              </li>
              <li v-for="(item, index) in y_field" :key="index">
                <Dropdown trigger="click" placement="bottom-start">
                  <Button type="primary">
                    <template v-if="item.alias !== '' && item.alias !== undefined">{{item.alias}}</template>
                    <template v-else>{{item.title}}</template>
                    {{fieldCalculateTypeFormat(item)}}
                    <Icon type="ios-arrow-down"></Icon>
                  </Button>
                  <DropdownMenu slot="list">
                    <DropdownItem v-for="(itm, index) in chartFieldCalculateType" :key="index">
                      <a href="javascript:void(0)" :class="{'selected': item.calculateType === itm.value}" @click="setFieldCalculateType(item, itm.value)">{{itm.text}}</a>
                    </DropdownItem>
                    <DropdownItem divided><a href="javascript:void(0)" @click="setFieldName(item)">设置字段</a></DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                <a href="javascript:void(0)" @click.stop="delYField(index)" class="close-btn" title="删除"><Icon type="md-close" /></a>
              </li>
            </draggable>
            <li v-show="!showSecondaryY" class="edit-chart-field-btn">
              <a href="javascript:void(0)" @click="addSecondaryY">添加次轴</a>
            </li>
          </ul>
        </div>
        <div class="clear"></div>
      </div>
      <!-- 散点图数值 -->
      <!-- <div v-show="chartObj.type === 'scatter'" class="edit-chart-field-con">
        <label>数值Y：</label>
        <div class="edit-chart-field-inner">
          <ul>
            <draggable v-model="scatter_y_field" :options="dragToScatterOption" class="drag-scatter-con">
              <li v-for="(item, index) in scatter_y_field" :key="index">
                <Dropdown trigger="click" placement="bottom-start">
                  <Button type="primary">
                    <template v-if="item.alias !== '' && item.alias !== undefined">{{item.alias}}</template>
                    <template v-else>{{item.title}}</template>
                    {{fieldCalculateTypeFormat(item)}}
                    <Icon type="ios-arrow-down"></Icon>
                  </Button>
                  <DropdownMenu slot="list">
                    <DropdownItem v-for="(itm, index) in chartFieldCalculateType" :key="index">
                      <a href="javascript:void(0)" :class="{'selected': item.calculateType === itm.value}" @click="setFieldCalculateType(item, itm.value)">{{itm.text}}</a>
                    </DropdownItem>
                    <DropdownItem divided><a href="javascript:void(0)" @click="setFieldName(item)">设置字段</a></DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                <a href="javascript:void(0)" @click.stop="delScatterYField(index)" class="close-btn" title="删除"><Icon type="md-close" /></a>
              </li>
            </draggable>
          </ul>
        </div>
      </div> -->
      <!-- 次轴数值 -->
      <div v-show="showSecondaryY" class="edit-chart-field-con">
        <label>数值：</label>
        <div class="edit-chart-field-inner">
          <ul>
            <draggable v-model="secondary_y_field" :options="dragToSecondaryYOption" class="drag-secondary-con">
              <li v-if="chartObj.type === 'line-and-bar'">
                <Select v-model="secondary_y_field_type" @on-change="changeYFieldType" style="width:100px;">
                  <Option value="line">折线图</Option>
                  <Option value="bar">柱状图</Option>
                  <Option value="stack-bar">堆叠柱状图</Option>
                </Select>
              </li>
              <li v-for="(item, index) in secondary_y_field" :key="index">
                <Dropdown trigger="click" placement="bottom-start">
                  <Button type="primary">
                    <template v-if="item.alias !== '' && item.alias !== undefined">{{item.alias}}</template>
                    <template v-else>{{item.title}}</template>
                    {{fieldCalculateTypeFormat(item)}}
                    <Icon type="ios-arrow-down"></Icon>
                  </Button>
                  <DropdownMenu slot="list">
                    <DropdownItem v-for="(itm, index) in chartFieldCalculateType" :key="index">
                      <a href="javascript:void(0)" :class="{'selected': item.calculateType === itm.value}" @click="setFieldCalculateType(item, itm.value)">{{itm.text}}</a>
                    </DropdownItem>
                    <DropdownItem divided><a href="javascript:void(0)" @click="setFieldName(item)">设置字段</a></DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                <a href="javascript:void(0)" @click.stop="delSecondaryYField(index)" class="close-btn" title="删除"><Icon type="md-close" /></a>
              </li>
            </draggable>
            <li class="edit-chart-field-btn">
              <a href="javascript:void(0)" @click="delSecondaryY">移除次轴</a>
            </li>
          </ul>
        </div>
        <div class="clear"></div>
      </div>
      <div>
        <div class="chart-condition-con">
          <div class="chart-condition-title">筛选器</div>
          <draggable v-model="conditions" :options="dragToCOption" @add="conditionDragEnd" class="chart-condition-list">
            <Collapse v-for="(item, index) in conditions" :key="index">
              <Panel>
                {{item.title}}
                <a href="javascript:void(0)" @click.stop="delCondition(index)" title="删除" class="chart-condition-li-del"><Icon type="md-close" /></a>
                <a href="javascript:void(0)" @click.stop="setCondition(item)" title="编辑"><Icon type="ios-settings" /></a>
                <p slot="content">
                  <template v-if="item.type === 'exact' && item.options.length > 0">
                    <ul>
                      <li v-if="item.rangeType === '1'">包含下列选项</li>
                      <li v-if="item.rangeType === '0'">不包含下列选项</li>
                      <li v-for="(itm, i) in item.options" :key="i">{{itm.text}}</li>
                    </ul>
                  </template>
                  <template v-else-if="item.type === 'condition' && item.conditions.length > 0">
                    <ul>
                      <li v-if="item.condition_type === '0'">满足任一条件</li>
                      <li v-if="item.condition_type === '1'">满足所有条件</li>
                      <li v-for="(itm, i) in item.conditions" :key="i">
                        {{chartConditionFormat(itm.operator)}}&nbsp;&nbsp;{{itm.content}}
                      </li>
                    </ul>
                  </template>
                </p>
              </Panel>
            </Collapse>
          </draggable>
          <div class="chart-condition-title">颜色</div>
          <ul class="series-color-list" v-show="!['k'].includes(chartObj.type)">
            <template v-if="['treemap', 'sunburst', 'sankey'].includes(chartObj.type)">
              <li @click="showColorTheme">配色方案</li>
            </template>
            <template v-else>
              <li v-for="item in y_field" @click="showColorTheme" :key="item.title">
                <i v-show="['pie', 'funnel'].indexOf(chartObj.type) === -1" :style="{'background': item.color}"></i>
                <template v-if="item.alias !== '' && item.alias !== undefined">{{item.alias}}</template>
                <template v-else>{{item.title}}</template>
                {{fieldCalculateTypeFormat(item)}}
              </li>
              <li v-for="item in secondary_y_field" @click="showColorTheme" :key="item.title">
                <i :style="{'background': item.color}"></i>
                <template v-if="item.alias !== '' && item.alias !== undefined">{{item.alias}}</template>
                <template v-else>{{item.title}}</template>
                {{fieldCalculateTypeFormat(item)}}
              </li>
            </template>
          </ul>
        </div>
        <div class="chart-con">
          <!-- <div class="chart-title">{{chartObj.title}}</div> -->
          <div class="chart-search-condition-con">
            <ul>
              <li v-for="(item, index) in searchConditions" :key="index">
                <label>
                  <template v-if="item.alias !== '' && item.alias !== undefined">{{item.alias}}</template>
                  <template v-else>{{item.title}}</template>
                </label>{{item.value}}
                <template v-if="item.fieldType === 'combobox'">
                  <Select v-model="item.value" style="width:120px;">
                    <Option v-for="(itm, index) in selectData[item.selectID]" :value="itm.value" :key="index">{{itm.text}}</Option>
                  </Select>
                </template>
                <template v-else>
                  <span>{{chartConditionFormat(item.operator)}}</span>
                  <template v-if="['datebox', 'datetimebox', 'monthbox', 'yearbox'].indexOf(item.fieldType) !== -1">
                    <DatePicker :type="item.fieldType.substring(0, item.fieldType.indexOf('box'))" :style="{'width': item.fieldType === 'datetimebox' ? '160px' : '100px'}"></DatePicker>
                  </template>
                  <template v-else>
                    <Input v-model="item.value" style="width:120px;"></Input>
                  </template>
                </template>
              </li>
              <li class="clear"></li>
            </ul>
          </div>
          <div id="main" style="height:700px;"></div>
        </div>
      </div>
    </div>
    <div class="chart-set-con" :style="{'height': colHeight + 'px'}">
      <Form :model="chartObj" :label-width="72">
        <div class="chart-set-title">图表标题</div>
        <Input v-model="chartObj.title"></Input>
        <Checkbox v-model="chartObj.showTitle">显示标题</Checkbox>
        <div v-show="chartObj.showTitle" class="chart-set-inner-line">
          <label>字体大小</label>
          <Select v-model="chartObj.titleFontSize" style="width:65px;">
            <Option v-for="(item, index) in fontSize" :value="item" :key="index">{{item + 'px'}}</Option>
          </Select>
          <label>颜色</label>
          <ColorPicker v-model="chartObj.titleColor" format="rgb" />
          <!-- <label>标题位置</label>
          <Select v-model="chartObj.titleLocation">
            <Option value="left">左侧</Option>
            <Option value="center">中间</Option>
            <Option value="right">右侧</Option>
          </Select> -->
        </div>
        <div class="line"></div>
        <div class="chart-set-title">图表类型</div>
        <ul class="chart-type-list">
          <li v-for="(item, index) in chartType" :key="index">
            <Tooltip :placement="index % 7 === 0 ? 'top-start': 'top'">
              <a href="javascript:void(0)" :class="{'active': enableChartType.indexOf(item.type) !== -1, 'selected': item.type === chartObj.type}" @click="setChartType(item.type)">
                <i :class="['chart-type-icon', item.icon]"></i>
              </a>
              <div slot="content">
                <p>{{item.title}}</p>
                <p v-for="(itm, index) in item.tips" :key="index">{{itm}}</p>
              </div>
            </Tooltip>
          </li>
        </ul>
      </Form>
      <div class="line"></div>
      <div class="chart-set-title">图内筛选器<a href="javascript:void(0)" @click="editSearchCondition"><Icon type="ios-settings" /></a></div>
      <ul>
        <li v-for="(item, index) in searchConditions" :key="index">
          <template v-if="item.alias !== '' && item.alias !== undefined">{{item.alias}}</template>
          <template v-else>{{item.title}}</template>
        </li>
      </ul>
      <div class="line"></div>
      <div v-show="chartObj.type !== ''">
        <!-- 仪表盘配置 -->
        <Form v-show="['gauge'].indexOf(chartObj.type) !== -1" :model="chartObj" :label-width="100">
          <div class="chart-set-title">表盘配置</div>
          <FormItem label="标题">
            <Input v-model="chartObj.gauge.title"></Input>
          </FormItem>
          <FormItem label="是否显示标题">
            <i-switch v-model="chartObj.gauge.showTitle" />
          </FormItem>
          <div v-show="chartObj.gauge.showTitle" class="chart-set-inner-line">
            <label>字体大小</label>
            <Select v-model="chartObj.gauge.titleFontSize" style="width:65px;">
              <Option v-for="(item, index) in fontSize" :value="item" :key="index">{{item + 'px'}}</Option>
            </Select>
            <label>颜色</label>
            <ColorPicker v-model="chartObj.gauge.titleColor" format="rgb" />
          </div>
          <FormItem label="是否显示数据">
            <i-switch v-model="chartObj.gauge.showDetail" />
          </FormItem>
          <div v-show="chartObj.gauge.showDetail" class="chart-set-inner-line">
            <label>字体大小</label>
            <Select v-model="chartObj.gauge.detailFontSize" style="width:65px;">
              <Option v-for="(item, index) in fontSize" :value="item" :key="index">{{item + 'px'}}</Option>
            </Select>
          </div>
          <FormItem label="目标值">
            <InputNumber :min="0" v-model="chartObj.gauge.max"></InputNumber>
          </FormItem>
          <FormItem label="目标值单位">
            <Input v-model="chartObj.gauge.unit"></Input>
          </FormItem>
          <!-- <FormItem label="目标值单位">
            <Select v-model="chartObj.gauge.unit" style="width:80px;">
              <Option value="1">无</Option>
              <Option value="10000">万</Option>
              <Option value="100000000">亿</Option>
              <Option value="1000">k</Option>
              <Option value="1000000">M</Option>
              <Option value="1000000000">G</Option>
            </Select>
          </FormItem> -->
          <FormItem label="百分比小数位数">
            <InputNumber :min="0" v-model="chartObj.gauge.rateDigit"></InputNumber>
          </FormItem>
          <FormItem label="轴线宽度">
            <InputNumber :min="0" v-model="chartObj.gauge.axisLineWidth"></InputNumber>
          </FormItem>
          <FormItem label="是否显示标签">
            <i-switch v-model="chartObj.gauge.showAxisLabel" />
          </FormItem>
          <FormItem label="标签与刻度线的距离">
            <InputNumber :min="0" v-model="chartObj.gauge.axisLabelDistance"></InputNumber>
          </FormItem>
        </Form>
        <Form :model="chartObj" :label-width="72">
          <!-- 功能配置 -->
          <div class="chart-set-title">功能配置</div>
          <FormItem v-show="['gauge'].indexOf(chartObj.type) !== -1" label="条件格式">
            <a href="javascript:void(0)" @click="showGaugeCondition"><Icon type="ios-settings" /></a>
          </FormItem>
          <FormItem v-show="['radar'].indexOf(chartObj.type) !== -1" label="最大值">
            <a href="javascript:void(0)" @click="showRadarMax"><Icon type="ios-settings" /></a>
          </FormItem>
          <FormItem v-show="['line', 'area-line', 'stack-area-line', 'line-and-bar'].indexOf(chartObj.type) !== -1" label="视觉映射">
            <a href="javascript:void(0)" @click="showVisualMap"><Icon type="ios-settings" /></a>
          </FormItem>
          <div v-show="['line', 'bar', 'stack-bar', 'waterfall', 'transverse-bar', 'stack-transverse-bar', 'area-line', 'stack-area-line', 'scatter', 'line-and-bar', 'radar', 'k'].indexOf(chartObj.type) !== -1">
            <!-- X轴配置 -->
            <div class="chart-set-title">坐标X轴</div>
            <Checkbox v-model="chartObj.x.show">显示坐标轴</Checkbox><br>
            <div v-show="chartObj.x.show" class="chart-set-inner-line">
              <label>样式</label>
              <Select v-model="chartObj.x.lineType" style="width:65px;">
                <Option v-for="(item, index) in lineType" :value="item.value" :key="index">{{item.text}}</Option>
              </Select>
              <label>线宽</label>
              <Select v-model="chartObj.x.lineWidth" style="width:65px;">
                <Option v-for="(item, index) in lineWidth" :value="item" :key="index">{{item}}</Option>
              </Select>
              <label>颜色</label>
              <ColorPicker v-model="chartObj.x.lineColor" format="rgb" />
            </div>
            <Checkbox v-model="chartObj.x.showLabels">显示标签</Checkbox>
            <div v-show="chartObj.x.showLabels" class="chart-set-inner-line">
              <label>字体大小</label>
              <Select v-model="chartObj.x.labelFontSize" style="width:65px;">
                <Option v-for="(item, index) in fontSize" :value="item" :key="index">{{item + 'px'}}</Option>
              </Select>
              <label>颜色</label>
              <ColorPicker v-model="chartObj.x.labelColor" format="rgb" />
            </div>
            <div v-show="['radar'].indexOf(chartObj.type) === -1">
              <FormItem label="标题">
                <Input v-model="chartObj.x.title"></Input>
              </FormItem>
              <FormItem label="单位">
                <Input v-model="chartObj.x.unit"></Input>
              </FormItem>
              <FormItem label="标题位置">
                <Select v-model="chartObj.x.location">
                  <Option value="end">末尾</Option>
                  <Option value="start">开头</Option>
                  <Option value="center">中间</Option>
                </Select>
              </FormItem>
              <Checkbox v-model="chartObj.x.showTitle">显示标题和单位</Checkbox>
              <div v-show="chartObj.x.showTitle" class="chart-set-inner-line">
                <label>字体大小</label>
                <Select v-model="chartObj.x.nameFontSize" style="width:65px;">
                  <Option v-for="(item, index) in fontSize" :value="item" :key="index">{{item + 'px'}}</Option>
                </Select>
                <label>颜色</label>
                <ColorPicker v-model="chartObj.x.nameColor" format="rgb" />
              </div>
              <FormItem label="文字方向">
                <Select v-model="chartObj.x.rotation">
                  <Option value="0">默认</Option>
                  <Option value="90">竖向</Option>
                  <Option value="315">左倾斜45</Option>
                  <Option value="45">右倾斜45</Option>
                </Select>
              </FormItem>
              <Checkbox v-model="chartObj.x.showAll">强制显示所有标签</Checkbox><br>
              <Checkbox v-model="chartObj.dataZoom">区域缩放</Checkbox>
            </div>
            <div class="line"></div>
            <!-- Y轴配置 -->
            <div v-show="['radar'].indexOf(chartObj.type) === -1">
              <div class="chart-set-title">坐标y轴</div>
              <Checkbox v-model="chartObj.y.show">显示坐标轴</Checkbox><br>
              <div v-show="chartObj.y.show" class="chart-set-inner-line">
                <label>样式</label>
                <Select v-model="chartObj.y.lineType" style="width:65px;">
                  <Option v-for="(item, index) in lineType" :value="item.value" :key="index">{{item.text}}</Option>
                </Select>
                <label>线宽</label>
                <Select v-model="chartObj.y.lineWidth" style="width:65px;">
                  <Option v-for="(item, index) in lineWidth" :value="item" :key="index">{{item}}</Option>
                </Select>
                <label>颜色</label>
                <ColorPicker v-model="chartObj.y.lineColor" format="rgb" />
              </div>
              <Checkbox v-model="chartObj.y.showLabels">显示标签</Checkbox>
              <div v-show="chartObj.y.showLabels" class="chart-set-inner-line">
                <label>字体大小</label>
                <Select v-model="chartObj.y.labelFontSize" style="width:65px;">
                  <Option v-for="(item, index) in fontSize" :value="item" :key="index">{{item + 'px'}}</Option>
                </Select>
                <label>颜色</label>
                <ColorPicker v-model="chartObj.y.labelColor" format="rgb" />
              </div>
              <FormItem label="标题">
                <Input v-model="chartObj.y.title"></Input>
              </FormItem>
              <FormItem label="单位">
                <Input v-model="chartObj.y.unit"></Input>
              </FormItem>
              <Checkbox v-model="chartObj.y.showTitle">显示标题和单位</Checkbox>
              <div v-show="chartObj.y.showTitle" class="chart-set-inner-line">
                <label>字体大小</label>
                <Select v-model="chartObj.y.nameFontSize" style="width:65px;">
                  <Option v-for="(item, index) in fontSize" :value="item" :key="index">{{item + 'px'}}</Option>
                </Select>
                <label>颜色</label>
                <ColorPicker v-model="chartObj.y.nameColor" format="rgb" />
              </div>
            </div>
            <!-- 次坐标轴配置 -->
            <div v-show="showSecondaryY">
              <div class="chart-set-title">次坐标轴</div>
              <Checkbox v-model="chartObj.rightY.show">显示坐标轴</Checkbox><br>
              <div v-show="chartObj.rightY.show" class="chart-set-inner-line">
                <label>样式</label>
                <Select v-model="chartObj.rightY.lineType" style="width:65px;">
                  <Option v-for="(item, index) in lineType" :value="item.value" :key="index">{{item.text}}</Option>
                </Select>
                <label>线宽</label>
                <Select v-model="chartObj.rightY.lineWidth" style="width:65px;">
                  <Option v-for="(item, index) in lineWidth" :value="item" :key="index">{{item}}</Option>
                </Select>
                <label>颜色</label>
                <ColorPicker v-model="chartObj.rightY.lineColor" format="rgb" />
              </div>
              <Checkbox v-model="chartObj.rightY.showLabels">显示标签</Checkbox>
              <div v-show="chartObj.rightY.showLabels" class="chart-set-inner-line">
                <label>字体大小</label>
                <Select v-model="chartObj.rightY.labelFontSize" style="width:65px;">
                  <Option v-for="(item, index) in fontSize" :value="item" :key="index">{{item + 'px'}}</Option>
                </Select>
                <label>颜色</label>
                <ColorPicker v-model="chartObj.rightY.labelColor" format="rgb" />
              </div>
              <FormItem label="标题">
                <Input v-model="chartObj.rightY.title"></Input>
              </FormItem>
              <FormItem label="单位">
                <Input v-model="chartObj.rightY.unit"></Input>
              </FormItem>
              <Checkbox v-model="chartObj.rightY.showTitle">显示标题和单位</Checkbox>
              <div v-show="chartObj.rightY.showTitle" class="chart-set-inner-line">
                <label>字体大小</label>
                <Select v-model="chartObj.rightY.nameFontSize" style="width:65px;">
                  <Option v-for="(item, index) in fontSize" :value="item" :key="index">{{item + 'px'}}</Option>
                </Select>
                <label>颜色</label>
                <ColorPicker v-model="chartObj.rightY.nameColor" format="rgb" />
              </div>
            </div>
          </div>
          <div class="line"></div>
          <!-- 图表样式 -->
          <div class="chart-set-title">图表样式</div>
          <FormItem label="对齐方式" v-show="['funnel'].indexOf(chartObj.type) !== -1">
            <RadioGroup v-model="chartObj.funnelAlign">
              <Radio label="left"><span>居左</span></Radio>
              <Radio label="center"><span>居中</span></Radio>
              <Radio label="right"><span>居右</span></Radio>
            </RadioGroup>
          </FormItem>
          <Checkbox v-show="['gauge', 'treemap', 'sunburst', 'sankey', 'wordcloud'].indexOf(chartObj.type) === -1" v-model="chartObj.showDatalabels">显示图表标签</Checkbox>
          <div v-show="chartObj.showDatalabels" class="chart-set-inner-line">
            <label>字体大小</label>
            <Select v-model="chartObj.datalabelFontSize" style="width:65px;">
              <Option v-for="(item, index) in fontSize" :value="item" :key="index">{{item + 'px'}}</Option>
            </Select>
            <label>颜色</label>
            <ColorPicker v-model="chartObj.datalabelColor" format="rgb" />
          </div>
          <FormItem label="柱宽度" v-show="['bar', 'stack-bar', 'transverse-bar', 'stack-transverse-bar', 'waterfall', 'line-and-bar', 'k'].indexOf(chartObj.type) !== -1">
            <RadioGroup v-model="chartObj.barWidthType">
              <Radio label="false"><span>自适应</span></Radio>
              <Radio label="true"><span>指定值</span></Radio>
            </RadioGroup>
            <InputNumber v-show="chartObj.barWidthType === 'true'" :min="1" v-model="chartObj.barWidth"></InputNumber>
          </FormItem>
          <FormItem label="线条样式" v-show="['line', 'area-line', 'stack-area-line', 'line-and-bar', 'sankey'].indexOf(chartObj.type) !== -1">
            <RadioGroup v-model="chartObj.lineStyle">
              <Radio label="straight"><span>直线</span></Radio>
              <Radio label="curve"><span>曲线</span></Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="阶梯线图" v-show="['line', 'area-line', 'stack-area-line', 'line-and-bar'].indexOf(chartObj.type) !== -1">
            <Select v-model="chartObj.lineStep">
              <Option value="false">否</Option>
              <Option value="start">开头</Option>
              <Option value="middle">中间</Option>
              <Option value="end">末尾</Option>
            </Select>
          </FormItem>
          <Checkbox v-show="['line', 'area-line', 'stack-area-line', 'line-and-bar', 'bar', 'stack-bar', 'transverse-bar', 'stack-transverse-bar', 'waterfall', 'k'].indexOf(chartObj.type) !== -1" v-model="chartObj.markLine.showMarkLine">显示警戒线</Checkbox>
          <FormItem v-show="chartObj.markLine.showMarkLine" label="警戒线数值(数值用逗号隔开)">
            <Input v-model="markLines" @on-blur="setMarkLine"></Input>
          </FormItem>
          <div v-show="chartObj.markLine.showMarkLine"  class="chart-set-inner-line" style="padding-left: 105px;">
            <label>警戒线颜色</label>
            <ColorPicker v-model="chartObj.markLine.color" format="rgb" />
          </div>
          <div v-show="['pie'].indexOf(chartObj.type) !== -1">
            <FormItem label="饼图样式">
              <RadioGroup v-model="chartObj.pieStyle">
                <Radio label="pieShape"><span>饼状</span></Radio>
                <Radio label="donutShape"><span>环形</span></Radio>
              </RadioGroup>
            </FormItem>
            <FormItem label="南丁格尔图">
              <Select v-model="chartObj.pieRose">
                <Option value="false">否</Option>
                <Option value="radius">圆心角不同</Option>
                <Option value="area">圆心角相同</Option>
              </Select>
            </FormItem>
          </div>
          <div v-show="['treemap'].includes(chartObj.type)">
            <div class="chart-set-inner-line">
              <a href="javascript:void(0)" @click="showTreemapLevels">多层样式配置 <Icon type="ios-settings" style="font-size: .18rem;" /></a>
            </div>
            <div class="chart-set-inner-line">
              <label>边框宽度</label>
              <InputNumber :min="0" v-model="chartObj.treemap.borderWidth"></InputNumber>
              <label>边框颜色</label>
              <ColorPicker v-model="chartObj.treemap.borderColor" format="rgb" />
            </div>
            <div class="chart-set-inner-line">
              <label>间隔距离</label>
              <InputNumber :min="0" v-model="chartObj.treemap.gapWidth"></InputNumber>
            </div>
            <Checkbox v-model="chartObj.treemap.breadcrumb.show">显示面包屑</Checkbox>
            <div v-show="chartObj.treemap.breadcrumb.show">
              <div class="chart-set-inner-line">
                <label>面包屑高度</label>
                <InputNumber :min="1" v-model="chartObj.treemap.breadcrumb.height"></InputNumber>
                <label>面包屑颜色</label>
                <ColorPicker v-model="chartObj.treemap.breadcrumb.color" format="rgb" />
              </div>
              <div class="chart-set-inner-line">
                <label>面包屑阴影大小</label>
                <InputNumber :min="0" v-model="chartObj.treemap.breadcrumb.shadowBlur"></InputNumber>
                <label>阴影颜色</label>
                <ColorPicker v-model="chartObj.treemap.breadcrumb.shadowColor" format="rgb" />
              </div>
              <div class="chart-set-inner-line">
                <label>面包屑边框宽度</label>
                <InputNumber :min="0" v-model="chartObj.treemap.breadcrumb.borderWidth"></InputNumber>
                <label>边框颜色</label>
                <ColorPicker v-model="chartObj.treemap.breadcrumb.borderColor" format="rgb" />
              </div>
              <div class="chart-set-inner-line">
                <label>字体大小</label>
                <Select v-model="chartObj.treemap.breadcrumb.fontSize" style="width:65px;">
                  <Option v-for="(item, index) in fontSize" :value="item" :key="index">{{item + 'px'}}</Option>
                </Select>
                <label>文字颜色</label>
                <ColorPicker v-model="chartObj.treemap.breadcrumb.textColor" format="rgb" />
              </div>
            </div>
          </div>
          <div v-show="['sunburst'].includes(chartObj.type)">
            <div class="chart-set-inner-line">
              <label>内半径</label>
              <InputNumber :min="0" v-model="chartObj.sunburst.innerRadius"></InputNumber>%
              <label>外半径</label>
              <InputNumber :min="0" v-model="chartObj.sunburst.outerRadius"></InputNumber>%
            </div>
            <div class="chart-set-inner-line">
              <a href="javascript:void(0)" @click="showTreemapLevels">多层样式配置 <Icon type="ios-settings" style="font-size: .18rem;" /></a>
            </div>
          </div>
          <div v-show="['sankey'].includes(chartObj.type)">
            <div class="chart-set-inner-line">
              <label>矩形宽度</label>
              <InputNumber :min="1" v-model="chartObj.sankey.nodeWidth"></InputNumber>
              <label>线条颜色</label>
              <ColorPicker v-model="chartObj.sankey.lineColor" format="rgb" />
            </div>
            <div class="chart-set-inner-line">
              <label>字体大小</label>
              <Select v-model="chartObj.sankey.label.fontSize" style="width:65px;">
                <Option v-for="(item, index) in fontSize" :value="item" :key="index">{{item + 'px'}}</Option>
              </Select>
              <label>文字颜色</label>
              <ColorPicker v-model="chartObj.sankey.label.color" format="rgb" />
            </div>
          </div>
          <div v-show="['k'].includes(chartObj.type)">
            <div class="chart-set-inner-line" style="padding-left: 120px;">
              <label>阳线颜色</label>
              <ColorPicker v-model="chartObj.k.color" format="rgb" />
            </div>
            <div class="chart-set-inner-line" style="padding-left: 120px;">
              <label>阳线边框颜色</label>
              <ColorPicker v-model="chartObj.k.borderColor" format="rgb" />
            </div>
            <div class="chart-set-inner-line" style="padding-left: 120px;">
              <label>阴线颜色</label>
              <ColorPicker v-model="chartObj.k.color0" format="rgb" />
            </div>
            <div class="chart-set-inner-line" style="padding-left: 120px;">
              <label>阴线边框颜色</label>
              <ColorPicker v-model="chartObj.k.borderColor0" format="rgb" />
            </div>
          </div>
          <div v-show="['wordcloud'].includes(chartObj.type)">
            <div class="chart-set-inner-line">
              <label>随机颜色</label>
              <RadioGroup v-model="chartObj.wordcloud.radomColor">
                <Radio label="false"><span>否</span></Radio>
                <Radio label="true"><span>是</span></Radio>
              </RadioGroup>
              <label>字体颜色</label>
              <ColorPicker v-model="chartObj.wordcloud.color" format="rgb" />
            </div>
            <div class="chart-set-inner-line">
              <label>形状</label>
              <Select v-model="chartObj.wordcloud.shape" style="width: 160px;">
                <Option value="circle">圆形</Option>
                <Option value="cardioid">心型</Option>
                <Option value="diamond">钻石</Option>
                <Option value="triangle-forward">向前三角形</Option>
                <Option value="triangle">三角形</Option>
                <Option value="triangle-upright">垂直三角形</Option>
                <Option value="pentagon">五角形</Option>
                <Option value="star">星型</Option>
              </Select>
            </div>
            <div class="chart-set-inner-line">
              <label>字体大小范围</label>
              <InputNumber :min="10" v-model="chartObj.wordcloud.minsize"></InputNumber>
               - 
              <InputNumber :min="10" v-model="chartObj.wordcloud.maxsize"></InputNumber>
            </div>
            <div class="chart-set-inner-line">
              <label>角度范围</label>
              <Input v-model="chartObj.wordcloud.minrotation" style="width: 60px;"></Input>
               - 
              <Input v-model="chartObj.wordcloud.maxrotation" style="width: 60px;"></Input>
            </div>
            <div class="chart-set-inner-line">
              <label>角度步骤</label>
              <InputNumber :min="1" v-model="chartObj.wordcloud.rotationStep"></InputNumber>
            </div>
          </div>
          <div v-show="['map', 'mapLines'].includes(chartObj.type)">
            <div class="chart-set-inner-line">
              <label>地图中心点</label>
              <Input v-model="chartObj.map.centerX" style="width: 80px;"></Input>-
              <Input v-model="chartObj.map.centerY" style="width: 80px;"></Input>
            </div>
            <div class="chart-set-inner-line">
              <label>地图缩放级别</label>
              <InputNumber :min="1" v-model="chartObj.map.zoom"></InputNumber>
            </div>
            <div class="chart-set-inner-line" style="padding-left: 120px;">
              <label>地面颜色</label>
              <ColorPicker v-model="chartObj.map.landColor" />
            </div>
            <div class="chart-set-inner-line" style="padding-left: 120px;">
              <label>水颜色</label>
              <ColorPicker v-model="chartObj.map.waterColor" />
            </div>
            <!-- <div class="chart-set-inner-line" style="padding-left: 120px;">
              <label>铁路颜色</label>
              <ColorPicker v-model="chartObj.map.railwayColor" />
            </div> -->
            <div class="chart-set-inner-line" style="padding-left: 120px;">
              <label>建筑颜色</label>
              <ColorPicker v-model="chartObj.map.buildingColor" />
            </div>
            <div class="chart-set-inner-line" style="padding-left: 120px;">
              <label>高速颜色</label>
              <ColorPicker v-model="chartObj.map.highwayColor" />
            </div>
            <div class="chart-set-inner-line" style="padding-left: 120px;">
              <label>干道颜色</label>
              <ColorPicker v-model="chartObj.map.arterialColor" />
            </div>
          </div>
          <FormItem label="点大小" v-show="['scatter', 'map', 'mapLines'].indexOf(chartObj.type) !== -1">
            <InputNumber :min="1" v-model="chartObj.symbolSize"></InputNumber>
          </FormItem>
          <div v-show="['mapLines'].includes(chartObj.type)">
            <div class="chart-set-inner-line">
              <label>特效大小</label>
              <InputNumber :min="1" v-model="chartObj.mapLines.effectSize"></InputNumber>
              <label>特效颜色</label>
              <ColorPicker v-model="chartObj.mapLines.effectColor" />
            </div>
            <div class="chart-set-inner-line">
              <label>特效图形</label>
              <Select v-model="chartObj.mapLines.effectSymbol" style="width: 80px;">
                <Option value="circle">圆形</Option>
                <Option value="rect">矩形</Option>
                <Option value="roundRect">圆角矩形</Option>
                <Option value="triangle">三角形</Option>
                <Option value="diamond">菱形</Option>
                <Option value="pin">针状</Option>
                <Option value="arrow">箭头</Option>
              </Select>
              <label>线曲度</label>
              <InputNumber :min="0" :max="1" v-model="chartObj.mapLines.curveness"></InputNumber>
            </div>
            <div class="chart-set-inner-line">
              <label>线宽</label>
              <InputNumber :min="1" v-model="chartObj.mapLines.lineWidth"></InputNumber>
              <label>线颜色</label>
              <ColorPicker v-model="chartObj.mapLines.lineColor" />
            </div>
          </div>
          <FormItem label="雷达样式" v-show="['radar'].indexOf(chartObj.type) !== -1">
            <RadioGroup v-model="chartObj.radarStyle">
              <Radio label="line"><span>线条</span></Radio>
              <Radio label="area"><span>面积</span></Radio>
            </RadioGroup>
          </FormItem>
          <!-- <Checkbox v-model="chartObj.show_all_datalabels">强制显示所有标签</Checkbox> -->
          <FormItem label="图例设置" v-show="['pie'].indexOf(chartObj.type) !== -1">
            <Select v-model="chartObj.legend.position">
              <Option value="null">无图例</Option>
              <Option value="right">右侧图例</Option>
              <Option value="left">左侧图例</Option>
              <Option value="bottom">底部图例</Option>
              <Option value="top">头部图例</Option>
            </Select>
          </FormItem>
          <div v-show="['line', 'bar', 'stack-bar', 'waterfall', 'transverse-bar', 'stack-transverse-bar', 'area-line', 'stack-area-line', 'scatter', 'line-and-bar', 'radar', 'k'].indexOf(chartObj.type) !== -1">
            <FormItem label="图例设置"></FormItem>
            <div class="chart-set-inner-line">
              <Checkbox v-model="chartObj.x.showSplitLine">横向网格</Checkbox>
            </div>
            <div v-show="chartObj.x.showSplitLine" class="chart-set-inner-line">
              <label>样式</label>
              <Select v-model="chartObj.x.splitLineType" style="width:65px;">
                <Option v-for="(item, index) in lineType" :value="item.value" :key="index">{{item.text}}</Option>
              </Select>
              <label>线宽</label>
              <Select v-model="chartObj.x.splitLineWidth" style="width:65px;">
                <Option v-for="(item, index) in lineWidth" :value="item" :key="index">{{item}}</Option>
              </Select>
              <label>颜色</label>
              <ColorPicker v-model="chartObj.x.splitLineColor" format="rgb" />
            </div>
            <div class="chart-set-inner-line">
              <Checkbox v-model="chartObj.y.showSplitLine">纵向网格</Checkbox>
            </div>
            <div v-show="chartObj.y.showSplitLine" class="chart-set-inner-line">
              <label>样式</label>
              <Select v-model="chartObj.y.splitLineType" style="width:65px;">
                <Option v-for="(item, index) in lineType" :value="item.value" :key="index">{{item.text}}</Option>
              </Select>
              <label>线宽</label>
              <Select v-model="chartObj.y.splitLineWidth" style="width:65px;">
                <Option v-for="(item, index) in lineWidth" :value="item" :key="index">{{item}}</Option>
              </Select>
              <label>颜色</label>
              <ColorPicker v-model="chartObj.y.splitLineColor" format="rgb" />
            </div>
          </div>
          <FormItem label="背景色">
            <RadioGroup v-model="chartObj.hasBackgroundColor">
              <Radio label="false"><span>无</span></Radio>
              <Radio label="true"><span>有</span></Radio>
            </RadioGroup>
            <ColorPicker v-show="chartObj.hasBackgroundColor === 'true'" v-model="chartObj.backgroundColor" format="rgb" />
          </FormItem>
          <!-- <FormItem label="对齐方式" v-show="['transverse-bar', 'stack-transverse-bar'].indexOf(chartObj.type) !== -1">
            <RadioGroup v-model="chartObj.reversed">
              <Radio label="false"><span>左对齐</span></Radio>
              <Radio label="true"><span>右对齐</span></Radio>
            </RadioGroup>
          </FormItem> -->
        </Form>
      </div>
      <Button type="primary" @click="save">保存</Button>
    </div>
    <div class="clear"></div>
  </div>
  <!-- 设置字段 -->
  <Modal v-model="modalFieldName" title="设置字段" @on-ok="saveFieldName">
    <div class="modal-field-con">
      <div>
        <Form ref="formFieldName" :model="currentField" :label-width="120">
          <FormItem label="字段别名" class="whole-line-703">
            <Input v-model="currentField.alias"></Input>
          </FormItem>
          <FormItem label="字段描述" class="whole-line-703">
            <Input v-model="currentField.describe"></Input>
          </FormItem>
        </Form>
      </div>
    </div>
  </Modal>
  <!-- 编辑筛选项 -->
  <Modal v-model="modalCondition" title="编辑筛选项" @on-ok="saveCondition">
    <div class="modal-condition-con">
      <Form :model="currentCondition" :label-width="120">
        <RadioGroup v-model="currentCondition.type">
          <Radio v-show="['combobox'].indexOf(currentCondition.fieldType) !== -1" label="exact"><span>精确筛选</span></Radio>
          <Radio v-show="['datebox', 'datetimebox', 'monthbox', 'yearbox'].indexOf(currentCondition.fieldType) === -1" label="condition"><span>条件筛选</span></Radio>
          <Radio v-show="['datebox', 'datetimebox', 'monthbox', 'yearbox'].indexOf(currentCondition.fieldType) !== -1" label="date"><span>日期筛选</span></Radio>
        </RadioGroup>
        <!-- 精确筛选 -->
        <Card v-show="currentCondition.type === 'exact'">
          <Row>
            <Col span="12">
              <div class="modal-condition-title">{{currentCondition.title}}</div>
              <ul class="modal-condition-options">
                <li v-for="(item, index) in selectData[currentCondition.selectID]" :key="index">
                  {{item.text}}<a href="javascript:void(0)" @click="exactAdd(item)">添加</a>
                </li>
              </ul>
              <div class="modal-condition-options-all"><a href="javascript:void(0)" @click="exactAddAll">全部添加</a></div>
            </Col>
            <Col span="12">
              <Select v-model="currentCondition.rangeType">
                <Option value="1">包含下列选项</Option>
                <Option value="0">不包含下列选项</Option>
              </Select>
              <div v-show="currentCondition.options.length === 0" class="modal-condition-tips">请从左侧列表选择添加</div>
              <ul v-show="currentCondition.options.length > 0" class="modal-condition-options">
                <li v-for="(item, index) in currentCondition.options" :key="index">
                  {{item.text}}<a href="javascript:void(0)" @click="exactDel(item)">删除</a>
                </li>
              </ul>
              <div v-show="currentCondition.options.length > 0" class="modal-condition-options-all">
                <a href="javascript:void(0)" @click="exactClear">清空</a>
              </div>
            </Col>
          </Row>
        </Card>
        <!-- 条件筛选 -->
        <Card v-show="currentCondition.type === 'condition'">
          <Row>
            <Col span="24">
              <div class="modal-condition-title">筛选条件</div>
              <div class="modal-condition-condition">
                <Select v-show="currentCondition.conditions.length > 1" v-model="currentCondition.condition_type" style="width:140px;">
                  <Option value="0">满足任一条件</Option>
                  <Option value="1">满足所有条件</Option>
                </Select>
                <div v-for="(item, index) in currentCondition.conditions" :key="index">
                  <span>{{currentCondition.title}}</span>
                  <Select v-model="item.operator" style="width:100px;">
                    <Option :value="item.value" v-for="(item, index) in chartCondition" :key="index">{{item.text}}</Option>
                  </Select>
                  <Input v-model="item.content" style="width:160px;"></Input>
                  <template v-if="index === 0">
                    <a href="javascript:void(0)" @click="conditionAdd" title="增加条件"><Icon type="md-add" /></a>
                  </template>
                  <template v-else>
                    <a href="javascript:void(0)" @click="conditionDel(item)" title="删除该条件"><Icon type="md-remove" /></a>
                  </template>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
        <!-- 日期筛选 -->
        <Row v-show="currentCondition.type === 'date'" class="modal-condition-date">
          <div class="modal-condition-title">{{currentCondition.title}}</div>
          <div class="line"></div>
          <Col span="8">
            <div class="modal-condition-title">筛选项<a href="javascript:void(0)" @click="addDateCondition"><Icon type="md-add" /></a></div>
            <ul class="modal-condition-options">
              <li v-for="(item, index) in currentCondition.dateCondition" :class="{'active': item === currentDateCondition}" @click="editDateCondition(item)" :key="index">
                {{item.name}}<a href="javascript:void(0)" v-if="index > 5" @click.stop="delDateCondition(index)">删除</a>
              </li>
            </ul>
          </Col>
          <Col span="16">
            <Card>
              <Form :model="currentDateCondition" :label-width="60">
                <FormItem label="筛选项">
                  <Input v-model="currentDateCondition.name" :disabled="currentDateCondition.disabled"></Input>
                </FormItem>
                <FormItem label="时间设置">
                  <Select v-model="currentDateCondition.type" :disabled="currentDateCondition.disabled" style="width:90px;">
                    <Option value="fixed">固定时长</Option>
                    <Option value="accurate">精确日期</Option>
                  </Select>
                </FormItem>
                <div class="line"></div>
                <div v-show="currentDateCondition.type === 'fixed'">
                  <FormItem label="最近">
                    <Input v-model="currentDateCondition.fixed.start" :disabled="currentDateCondition.disabled" style="width:90px;"></Input>
                    <Select v-model="currentDateCondition.fixed.granularity" :disabled="currentDateCondition.disabled" style="width:60px;">
                      <Option value="day">天</Option>
                      <Option value="week">周</Option>
                      <Option value="month">月</Option>
                      <Option value="quarter">季</Option>
                      <Option value="year">年</Option>
                    </Select>
                  </FormItem>
                  <FormItem label="截至">
                    <RadioGroup v-model="currentDateCondition.fixed.end">
                      <Radio label="1" :disabled="currentDateCondition.disabled">
                        <span v-show="currentDateCondition.fixed.granularity === 'day' || currentDateCondition.fixed.granularity === undefined">今天</span>
                        <span v-show="currentDateCondition.fixed.granularity === 'week'">本周</span>
                        <span v-show="currentDateCondition.fixed.granularity === 'month'">本月</span>
                        <span v-show="currentDateCondition.fixed.granularity === 'quarter'">本季度</span>
                        <span v-show="currentDateCondition.fixed.granularity === 'year'">今年</span>
                      </Radio>
                      <Radio label="0" :disabled="currentDateCondition.disabled">
                        <span v-show="currentDateCondition.fixed.granularity === 'day' || currentDateCondition.fixed.granularity === undefined">昨天</span>
                        <span v-show="currentDateCondition.fixed.granularity === 'week'">上周</span>
                        <span v-show="currentDateCondition.fixed.granularity === 'month'">上月</span>
                        <span v-show="currentDateCondition.fixed.granularity === 'quarter'">上季度</span>
                        <span v-show="currentDateCondition.fixed.granularity === 'year'">去年</span>
                      </Radio>
                    </RadioGroup>
                  </FormItem>
                </div>
                <div v-show="currentDateCondition.type === 'accurate'">
                  <FormItem label="起始日期">
                    <DatePicker type="date" v-model="currentDateCondition.accurate.startDate" placement="top-start"></DatePicker>
                  </FormItem>
                  <FormItem label="截至日期">
                    <DatePicker type="date" v-model="currentDateCondition.accurate.endDate" placement="top-start"></DatePicker>
                  </FormItem>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  </Modal>
  <!-- 颜色设置 -->
  <Modal v-model="modalColorTheme" title="颜色设置" @on-ok="saveColorTheme">
    <div class="modal-field-con">
      <Card>
        <Row>
          <Col span="10">
            <div class="modal-condition-title">数值轴</div>
            <ul class="series-color-list">
              <li v-for="item in y_field" :class="{'active': currentColorThemeField === item}" @click="showFieldColorTheme(item)" :key="item.title">
                <i :style="{'background': item.color}"></i>
                <template v-if="item.alias !== '' && item.alias !== undefined">{{item.alias}}</template>
                <template v-else>{{item.title}}</template>
                {{fieldCalculateTypeFormat(item)}}
              </li>
              <li v-for="item in secondary_y_field" :class="{'active': currentColorThemeField === item}" @click="showFieldColorTheme(item)" :key="item.title">
                <i :style="{'background': item.color}"></i>
                <template v-if="item.alias !== '' && item.alias !== undefined">{{item.alias}}</template>
                <template v-else>{{item.title}}</template>
                {{fieldCalculateTypeFormat(item)}}
              </li>
            </ul>
          </Col>
          <Col span="14">
            &nbsp;&nbsp;&nbsp;&nbsp;配色方案
            <Select v-model="currentColorTheme" @on-change="changeColorTheme" style="width:150px;">
              <Option v-for="(item, index) in chartColorTheme" :value="item" :key="index">{{item.name}}</Option>
            </Select>
            <ul class="modal-theme-colors">
              <template v-if="['treemap', 'sunburst', 'sankey'].includes(chartObj.type)">
                <li v-for="(item, index) in currentColorTheme.colors" :style="{'background': item}" :key="index">
                  <Icon type="ios-checkmark" />
                </li>
              </template>
              <template v-else>
                <li v-for="(item, index) in currentColorTheme.colors" :class="{'active': item === currentColorThemeField.color}" :style="{'background': item}" @click="setFieldColor(item)" :key="index">
                  <Icon type="ios-checkmark" />
                </li>
              </template>
              <div class="clear"></div>
            </ul>
            <div v-if="!['treemap', 'sunburst', 'sankey'].includes(chartObj.type)" class="modal-condition-options-all">
              <ColorPicker v-model="currentColorThemeField.color" format="rgb" @on-change="setFieldColor" />自定义颜色
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  </Modal>
  <!-- 设置图内筛选器 -->
  <Modal v-model="modalSearchCondition" title="设置图内筛选器" width="650" @on-ok="saveSearchCondition">
    <div class="modal-field-con">
      <Card>
        <Row class="modal-search-condition-con">
          <Col span="8">
            <div class="modal-condition-title">字段</div>
            <ul class="modal-condition-options modal-condition-options-with-btn">
              <li v-for="(item, index) in fields" :title="item.title" :key="index">
                {{item.title}}<a href="javascript:void(0)" @click.stop="addSearchCondition(item)">添加</a>
              </li>
            </ul>
          </Col>
          <Col span="8">
            <div class="modal-condition-title">已添加</div>
            <ul class="modal-condition-options  modal-condition-options-with-btn">
              <li v-for="(item, index) in searchConditions" :class="{'active': item === currentSearchCondition}" @click="setCurrentSearchCondition(item)" :title="item.title" :key="index">
                <template v-if="item.alias !== '' && item.alias !== undefined">{{item.alias}}</template>
                <template v-else>{{item.title}}</template>
                <a href="javascript:void(0)" @click.stop="delSearchCondition(index)">删除</a>
              </li>
            </ul>
          </Col>
          <Col span="8">
            <div class="modal-condition-title">
              <template v-if="currentSearchCondition.fieldType === 'combobox'">选项</template>
              <template v-else>筛选条件</template>
            </div>
            <template v-if="currentSearchCondition.fieldType === 'combobox'">
              <ul class="modal-condition-options">
                <li v-for="(item, index) in selectData[currentSearchCondition.selectID]" :key="index">{{item.text}}</li>
              </ul>
            </template>
            <template v-else-if="currentSearchCondition.fieldType !== undefined">
              <Form :label-width="40">
                <FormItem label="别名">
                  <Input v-model="currentSearchCondition.alias" style="width:120px;"></Input>
                </FormItem>
                <FormItem label="条件">
                  <Select v-model="currentSearchCondition.operator" style="width:120px;">
                    <Option :value="item.value" v-for="(item, index) in chartCondition" :key="index">{{item.text}}</Option>
                  </Select>
                </FormItem>
              </Form>
            </template>
          </Col>
        </Row>
      </Card>
    </div>
  </Modal>
  <!-- 仪表盘条件配置 -->
  <Modal v-model="modalGaugeCondition" title="条件格式" @on-ok="saveGaugeCondition">
    <div class="modal-field-con">
      <div class="modal-condition-condition">
        <div v-if="chartObj.gauge.conditions.length === 0" class="modal-condition-tips">
          当前还没有设置条件 <Button type="button" @click="gaugeConditionAdd">点此添加</Button>
        </div>
        <draggable v-model="chartObj.gauge.conditions" :options="dragGaugeOption">
          <div v-for="(item, index) in chartObj.gauge.conditions" class="modal-gauge-condition" :key="index">
            <span>区间</span>
            <Input v-model="item.min" style="width:80px;"></Input> ~ 
            <Input v-model="item.max" style="width:80px;"></Input>
            <span>配色</span>
            <span class="select-color" @click="showGaugeConditionColor($event, item)"><span :style="{background: item.color}"></span></span>
            <template v-if="index === 0">
              <a href="javascript:void(0)" @click="gaugeConditionAdd" title="增加条件"><Icon type="md-add" /></a>
            </template>
            <a href="javascript:void(0)" @click="gaugeConditionDel(index)" title="删除该条件"><Icon type="md-remove" /></a>
          </div>
        </draggable>
      </div>
    </div>
  </Modal>
  <!-- 仪表盘条件颜色配置 -->
  <div v-show="modalGaugeConditionColor" class="gauge-condition-color-con" :style="{'top': modalGaugeConditionColorTop + 'px', 'left': modalGaugeConditionColorLeft + 'px'}">
    <ul>
      <li v-for="(item, index) in gaugeConditionsColors" @click="setCurrentGaugeConditionColor(item)" :key="index"><span :style="{background: item}"></span></li>
      <div class="clear"></div>
    </ul>
    <div class="line"></div>
    <div class="modal-condition-options-all">
      <ColorPicker v-model="currentGaugeCondition.color" format="rgb" />自定义颜色
    </div>
    <a class="gauge-condition-color-close" @click="closeCurrentGaugeConditionColor"><Icon type="md-close" /></a>
  </div>
  <!-- 雷达图最大值配置 -->
  <Modal v-model="modalRadarMax" title="最大值配置" @on-ok="saveRadarMax">
    <div class="modal-field-con">
      <ul class="radarMax-list">
        <li v-for="(item, index) in xData" :key="index">
          <span>{{item}}</span><InputNumber :min="1" v-model="radarMax[index]"></InputNumber>
        </li>
      </ul>
    </div>
  </Modal>
  <!-- 视觉映射配置 -->
  <Modal v-model="modalVisualMap" title="条件格式" @on-ok="saveVisualMap">
    <div class="modal-field-con">
      <div class="modal-condition-condition">
        <div v-if="chartObj.visualMaps.length === 0" class="modal-condition-tips">
          当前还没有设置条件 <Button type="button" @click="visualMapAdd">点此添加</Button>
        </div>
        <draggable v-model="chartObj.visualMaps" :options="dragGaugeOption">
          <div v-for="(item, index) in chartObj.visualMaps" class="modal-gauge-condition" :key="index">
            <span>区间</span>
            <Input v-model="item.min" style="width:80px;"></Input> ~ 
            <Input v-model="item.max" style="width:80px;"></Input>
            <span>配色</span>
            <span class="select-color" @click="showVisualMapColor($event, item)"><span :style="{background: item.color}"></span></span>
            <template v-if="index === 0">
              <a href="javascript:void(0)" @click="visualMapAdd" title="增加条件"><Icon type="md-add" /></a>
            </template>
            <a href="javascript:void(0)" @click="visualMapDel(index)" title="删除该条件"><Icon type="md-remove" /></a>
          </div>
        </draggable>
      </div>
    </div>
  </Modal>
  <!-- 视觉映射颜色配置 -->
  <div v-show="modalVisualMapColor" class="gauge-condition-color-con" :style="{'top': modalVisualMapColorTop + 'px', 'left': modalVisualMapColorLeft + 'px'}">
    <ul>
      <li v-for="(item, index) in gaugeConditionsColors" @click="setCurrentVisualMapColor(item)" :key="index"><span :style="{background: item}"></span></li>
      <div class="clear"></div>
    </ul>
    <div class="line"></div>
    <div class="modal-condition-options-all">
      <ColorPicker v-model="currentVisualMap.color" format="rgb" />自定义颜色
    </div>
    <a class="gauge-condition-color-close" @click="closeCurrentVisualMapColor"><Icon type="md-close" /></a>
  </div>
  <!-- 矩形树图多层配置 -->
  <Modal v-model="modalTreemapLevels" title="矩形树图多层配置" @on-ok="saveTreemapLevels">
    <div class="modal-field-con">
      <Button type="button" @click="treemapLevelsAdd">添加层级配置</Button>
      <ul class="treemapLevelsList">
        <li v-for="(item, index) in chartObj.treemap.levels" :key="index">
          <span>边框宽度</span><InputNumber :min="0" v-model="item.borderWidth"></InputNumber>
          <span>边框颜色</span><ColorPicker v-model="item.borderColor" format="rgb" />
          <span>间隔距离</span><InputNumber :min="0" v-model="item.gapWidth"></InputNumber>
          <a href="javascript:void(0)" @click="treemapLevelsDel(index)" title="删除该层级配置"><Icon type="md-remove" /></a>
        </li>
      </ul>
    </div>
  </Modal>
</div>
</template>
<script>
import Util from '@/utils/index'
import draggable from 'vuedraggable'
import echarts from 'echarts/lib/echarts'
import 'echarts-liquidfill'
require('echarts/lib/chart/pie')
require('echarts/lib/chart/bar')
require('echarts/lib/chart/line')
require('echarts/lib/chart/gauge')
require('echarts/lib/chart/scatter')
require('echarts/lib/chart/funnel')
require('echarts/lib/chart/radar')
require('echarts/lib/chart/treemap')
require('echarts/lib/chart/sunburst')
require('echarts/lib/chart/sankey')
require('echarts/lib/chart/candlestick')
require('echarts/extension/bmap/bmap')
require('echarts-wordcloud')
require('echarts/lib/component/tooltip')
require('echarts/lib/component/title')
require('echarts/lib/component/legend')
require('echarts/lib/component/toolbox')
require('es6-promise').polyfill()
export default {
  components: {
    draggable // 拖拽插件
  },
  data () {
    return {
      loading: false, // 载入中
      formList: [], // 表单数据
      fields: [], // 表单字段
      chartObj: { // 图表对象
        title: '未命名图表',
        showTitle: false,
        titleFontSize: '18',
        titleColor: 'rgb(51, 51, 51)',
        titleLocation: 'left',
        type: '',
        x: {show: true, rotation: '0', showAll: false, showLabels: true, showTitle: false, location: 'end', labelFontSize: '12', labelColor: 'rgb(51, 51, 51)', nameFontSize: '12', nameColor: 'rgb(51, 51, 51)', lineWidth: '1', lineColor: 'rgb(51, 51, 51)', lineType: 'solid', showSplitLine: true, splitLineWidth: '1', splitLineColor: 'rgb(204, 204, 204)', splitLineType: 'solid'},
        y: {show: true, showLabels: true, showTitle: false, labelFontSize: '12', labelColor: 'rgb(51, 51, 51)', nameFontSize: '12', nameColor: 'rgb(51, 51, 51)', lineWidth: '1', lineColor: 'rgb(51, 51, 51)', lineType: 'solid', showSplitLine: false, splitLineWidth: '1', splitLineColor: 'rgb(204, 204, 204)', splitLineType: 'solid'},
        rightY: {show: true, showLabels: true, showTitle: false, labelFontSize: '12', labelColor: 'rgb(51, 51, 51)', nameFontSize: '12', nameColor: 'rgb(51, 51, 51)', lineWidth: '1', lineColor: 'rgb(51, 51, 51)', lineType: 'solid'},
        showDatalabels: false,
        datalabelFontSize: '12',
        datalabelColor: 'rgb(0, 0, 0)',
        symbolSize: 10,
        barWidthType: 'false',
        barWidth: 20,
        lineStyle: 'straight',
        lineStep: 'false',
        markLine: { showMarkLine: false, markLines: '', color: 'rgb(204,0,51)' },
        pieStyle: 'pieShape',
        pieRose: 'false',
        radarStyle: 'line',
        legend: {
          position: 'top'
        },
        gauge: {showTitle: true, titleFontSize: '15', titleColor: 'rgb(51, 51, 51)', showDetail: true, detailFontSize: '15', unit: '', rateDigit: 2, conditions: [], axisLineWidth: 30, showAxisLabel: true, axisLabelDistance: 5},
        visualMaps: [],
        treemap: {
          levels: [],
          borderWidth: 0,
          borderColor: 'rgb(255, 255, 255)',
          gapWidth: 0,
          breadcrumb: {show: true, height: 22, color: 'rgb(0, 0, 0)', borderWidth: 1, borderColor: 'rgb(255, 255, 255)', shadowBlur: 3, shadowColor: 'rgb(150, 150, 150)', fontSize: '12', textColor: 'rgb(255, 255, 255)'}
        },
        sunburst: {innerRadius: 0, outerRadius: 90},
        sankey: {lineColor: 'rgb(49,70,86)', nodeWidth: 20, label: {fontSize: '12', color: 'rgb(0, 0, 0)'}},
        k: {color: 'rgb(194,53,49)', borderColor: 'rgb(194,53,49)', color0: 'rgb(49,70,86)', borderColor0: 'rgb(49,70,86)'},
        wordcloud: {shape: 'circle', minsize: 12, maxsize: 60, minrotation: -90, maxrotation: 90, rotationStep: 45, color: 'rgb(81, 130, 228)', radomColor: 'false'},
        map: {centerX: 104.114129, centerY: 37.550339, zoom: 5, landColor: '#fff', waterColor: '#BEDBF9', railwayColor: '#BEDBF9', highwayColor: '#F7D164', buildingColor: '#f8f7f3', arterialColor: '#fff'},
        mapLines: {effectSize: 10, effectColor: 'rgb(81, 130, 228)', effectSymbol: 'circle', lineWidth: 1, lineColor: 'rgb(81, 130, 228)', curveness: 0.2},
        funnelAlign: 'center',
        dataZoom: false,
        hasBackgroundColor: 'false',
        backgroundColor: 'rgb(255, 255, 255)'
      },
      currentForm: {}, // 选中表单
      currentField: {},  // 选中字段
      modalFieldName: false, // 设置字段名对话框是否显示
      x_field: [], // 维度字段
      y_field: [], // 数值字段
      y_field_type: '', // 数值图表类型
      // scatter_y_field: [], // 散点图数值Y字段
      secondary_y_field: [], // 次坐标轴数值字段
      secondary_y_field_type: '', // 次坐标轴数值图表类型
      showSecondaryY: false, // 是否显示次坐标轴数值
      xData: [], // 维度数据
      yData: [], // 数值数据
      SYData: [], // 次轴数据
      conditions: [], // 筛选条件
      option: {}, // echarts图表配置
      charts: '', // echarts图表对象
      searchConditions: [], // 图内筛选器
      currentSearchCondition: [], // 当前图内筛选器
      modalCondition: false, // 筛选条件对话框是否显示
      currentCondition: {options: [], conditions: [], dateCondition: []}, // 编辑中的筛选条件
      selectData: this.$store.state.selectData, // 下拉数据
      chartFieldCalculateType: this.$store.state.chartFieldCalculateType, // 图表字段计算方式
      chartType: this.$store.state.chartType, // 图表类型
      chartCondition: this.$store.state.chartCondition, // 筛选条件
      chartDateCondition: this.$store.state.chartDateCondition, // 图表日期筛选项
      currentDateCondition: {fixed: {}, accurate: {}}, // 当前编辑的日期筛选项
      enableChartType: [], // 当前可选图表类型
      chartColorTheme: this.$store.state.chartColorTheme, // 图表配色
      currentColorTheme: {},  // 当前图表配色
      currentColorThemeField: {color: ''},  // 当前字段图表配色
      modalColorTheme: false, // 图表配色对话框是否显示
      modalSearchCondition: false, // 图内筛选器对话框是否显示
      modalGaugeCondition: false, // 仪表盘条件对话框是否显示
      modalGaugeConditionColor: false, // 仪表盘条件配色对话框是否显示
      currentGaugeCondition: {color: ''}, // 选中仪表盘配置
      modalGaugeConditionColorTop: 0, // 仪表盘条件配色对话框上距离
      modalGaugeConditionColorLeft: 0, // 仪表盘条件配色对话框左距离
      gaugeConditionsColors: this.$store.state.gaugeConditionsColors, // 仪表盘配置颜色
      modalRadarMax: false, // 雷达图最大值对话框是否显示
      radarMax: [], // 雷达图最大值
      modalVisualMap: false, // 视觉映射对话框是否显示
      modalVisualMapColor: false, // 视觉映射配色对话框是否显示
      currentVisualMap: {color: ''}, // 选中视觉映射配置
      modalVisualMapColorTop: 0, // 视觉映射配色对话框上距离
      modalVisualMapColorLeft: 0, // 视觉映射配色对话框左距离
      modalTreemapLevels: false, // 矩形树图多层配置对话框是否显示
      fontSize: this.$store.state.fontSize, // 字体大小
      lineWidth: this.$store.state.lineWidth, // 图表线条宽度
      lineType: this.$store.state.lineType, // 图表线条类型
      markLines: '' // 警戒线数值
    }
  },
  methods: {
    /**
    * @desc 初始化
    */
    init: function () {
      /* this.$api.post('/crm/ActionFormUtil/getAllTable.do', {}, r => {
        if (r.data) {
          this.formList = r.data.rows
        }
      }) */
      this.fields = [{ title: '日期' }, { title: '用户' }, { title: '销售额' }, { title: '产量' }, { title: '流量' }]
      this.currentColorTheme = this.chartColorTheme[0]
    },
    /**
    * @desc 选择表单
    */
    changeForm: function () {
      let temp = JSON.parse(this.currentForm.str_json).field
      for (let i = 0; i < temp.length; i++) {
        if (['tablebox', 'filebox'].indexOf(temp[i].fieldType) === -1) {
          this.fields.push(temp[i])
        }
      }
      this.x_field = []
      this.y_field = []
      this.xData = []
      this.yData = []
      this.currentField = {}
      this.conditions = []
      this.searchConditions = []
      this.currentCondition = {options: [], conditions: [], dateCondition: []}
      this.currentDateCondition = {fixed: {}, accurate: {}}
      this.enableChartType = []
    },
    /**
    * @desc 拖拽结束
    * @param {Object} event 事件
    */
    dragEnd: function (event) {
      if (event.to.className === 'drag-y-con') {
        this.setFieldCalculateType(this.y_field[this.y_field.length - 1], 'sum')
        console.log(this.y_field.length)
        console.log(this.secondary_y_field.length)
        console.log(this.currentColorTheme.colors[this.y_field.length + this.secondary_y_field.length - 1])
        this.y_field[this.y_field.length - 1].color = this.currentColorTheme.colors[this.y_field.length + this.secondary_y_field.length - 1]
      } else if (event.to.className === 'drag-scatter-con') {
        this.setFieldCalculateType(this.scatter_y_field[this.scatter_y_field.length - 1], 'sum')
        this.scatter_y_field[this.scatter_y_field.length - 1].color = this.currentColorTheme.colors[this.scatter_y_field.length - 1]
      } else if (event.to.className === 'drag-secondary-con') {
        this.setFieldCalculateType(this.secondary_y_field[this.secondary_y_field.length - 1], 'sum')
        this.secondary_y_field[this.secondary_y_field.length - 1].color = this.currentColorTheme.colors[this.y_field.length + this.secondary_y_field.length - 1]
        this.createChart()
      }
      if (event.to.className !== 'chart-condition-list') {
        this.changeEnableChartType()
        this.dataChange()
      }
    },
    /**
    * @desc 删除维度字段
    * @param {Num} index 字段位置
    */
    delXField: function (index) {
      this.x_field.splice(index, 1)
      this.changeEnableChartType()
    },
    /**
    * @desc 删除数值字段
    * @param {Num} index 字段位置
    */
    delYField: function (index) {
      this.y_field.splice(index, 1)
      this.changeEnableChartType()
    },
    /* delScatterYField: function (index) { // 删除散点图数值Y字段
      this.scatter_y_field.splice(index, 1)
      this.changeEnableChartType()
    }, */
    /**
    * @desc 删除次坐标轴数值字段
    * @param {Num} index 字段位置
    */
    delSecondaryYField: function (index) {
      this.secondary_y_field.splice(index, 1)
      this.changeEnableChartType()
    },
    /**
    * @desc 添加次轴
    */
    addSecondaryY: function () {
      this.showSecondaryY = true
    },
    /**
    * @desc 移除次轴
    */
    delSecondaryY: function () {
      this.showSecondaryY = false
      this.secondary_y_field_type = ''
      this.y_field = [...this.y_field, ...this.secondary_y_field]
      this.secondary_y_field = []
      this.createChart()
    },
    /**
    * @desc 设置双轴图的数值图表类型
    */
    changeYFieldType: function () {
      this.createChart()
    },
    /**
    * @desc 刷新可选择图表类型
    */
    changeEnableChartType: function () {
      this.enableChartType = []
      if (this.x_field.length === 0 && this.y_field.length === 1) {
        this.enableChartType.push('gauge')
      }
      if ((this.x_field.length === 1 || this.x_field.length === 2) && this.y_field.length > 0) {
        this.enableChartType.push('line')
      }
      if (this.x_field.length < 3 && this.y_field.length > 0) {
        this.enableChartType.push('bar')
      }
      if ((this.x_field.length === 1 && this.y_field.length === 1) || (this.x_field.length === 0 && this.y_field.length > 1)) {
        this.enableChartType.push('pie')
      }
      if ((this.x_field.length === 1 || this.x_field.length === 2) && this.y_field.length > 1) {
        this.enableChartType.push('stack-bar')
      }
      if (((this.x_field.length === 1 || this.x_field.length === 2) && this.y_field.length === 1) || (this.x_field.length === 0 && this.y_field.length > 1)) {
        this.enableChartType.push('waterfall')
      }
      if (this.x_field.length < 3 && this.y_field.length > 0) {
        this.enableChartType.push('transverse-bar')
      }
      if (this.x_field.length < 3 && this.y_field.length > 1) {
        this.enableChartType.push('stack-transverse-bar')
      }
      if (this.x_field.length < 2 && this.y_field.length > 0) {
        this.enableChartType.push('area-line')
      }
      if (this.x_field.length === 1 && this.y_field.length > 1) {
        this.enableChartType.push('stack-area-line')
      }
      if (this.y_field.length > 0) {
        this.enableChartType.push('scatter')
      }
      if (this.x_field.length > 1 && this.y_field.length === 1) {
        this.enableChartType.push('sunburst')
      }
      if (this.x_field.length > 0 && this.y_field.length < 2) {
        this.enableChartType.push('treemap')
      }
      if ((this.x_field.length === 1 && this.y_field.length === 1) || (this.x_field.length === 0 && this.y_field.length > 1)) {
        this.enableChartType.push('funnel')
      }
      if ((this.x_field.length < 3 && this.y_field.length > 1) || (this.y_field.length > 0 && this.secondary_y_field.length > 0)) {
        this.enableChartType.push('line-and-bar')
      }
      if (this.x_field.length > 1 && this.y_field.length === 1) {
        this.enableChartType.push('sankey')
      }
      if ((this.x_field.length === 1 || this.x_field.length === 2) && this.y_field.length === 1) {
        this.enableChartType.push('k')
      }
      if (this.x_field.length === 1 && this.y_field.length === 0) {
        this.enableChartType.push('wordcloud')
      }
      if (this.x_field.length === 0 && this.y_field.length === 1) {
        this.enableChartType.push('liquidfill')
      }
      if (this.x_field.length === 1 && this.y_field.length === 1) {
        this.enableChartType.push('map')
        this.enableChartType.push('mapLines')
      }
      if (this.x_field.length === 1 && this.y_field.length > 0) {
        this.enableChartType.push('radar')
        this.xData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        this.yData = [[820, 932, 901, 934, 1290, 1330, 1320], [420, 952, 501, 634, 1090, 1630, 1520]]
        for (let i = 0; i < this.yData.length; i++) {
          if (i === 0) {
            this.radarMax = this.yData[0]
          } else {
            for (let j = 0; j < this.radarMax.length; j++) {
              if (this.yData[i][j] > this.radarMax[j]) {
                this.radarMax[j] = this.yData[i][j]
              }
            }
          }
        }
      }
    },
    /**
    * @desc 设置图表类型
    * @param {String} type 图表类型
    */
    setChartType: function (type) {
      if (this.enableChartType.indexOf(type) !== -1) {
        this.chartObj.type = type
        if (type === 'gauge' && this.chartObj.gauge.conditions.length === 0) {
          this.chartObj.gauge.conditions = this.$store.state.gaugeConditions
        }
        if (type === 'line-and-bar') {
          this.showSecondaryY = true
          this.y_field_type = 'bar'
          this.secondary_y_field_type = 'line'
          if (this.y_field.length > 1) {
            this.secondary_y_field = this.y_field.splice(this.y_field.length - 1, 1)
          }
        } else if (this.showSecondaryY) {
          this.delSecondaryY()
        }
      }
    },
    /**
    * @desc 设置字段名称
    * @param {String} type 要设置的字段
    */
    setFieldName: function (item) {
      this.currentField = item
      this.modalFieldName = true
    },
    /**
    * @desc 保存字段名称
    */
    saveFieldName: function () {
      this.modalFieldName = false
      this.createChart()
    },
    /**
    * @desc 设置字段计算方式
    * @param {Object} item 要设置的字段
    * @param {String} calculateType 计算方式
    */
    setFieldCalculateType: function (item, calculateType) {
      this.$set(item, 'calculateType', calculateType)
    },
    /**
    * @desc 字段计算方式格式化
    * @param {Object} item 字段对象
    * @return {String} 计算方式文本
    */
    fieldCalculateTypeFormat: function (item) {
      let str = ''
      let temp = this.chartFieldCalculateType.find((element) => (element.value === item.calculateType))
      if (temp !== undefined) {
        str = `(${temp.text})`
      }
      return str
    },
    /**
    * @desc 拖拽增加筛选条件
    */
    conditionDragEnd: function (e) {
      let index = this.conditions.length - 1
      this.conditions[index].type = 'exact'
      this.$set(this.conditions[index], 'options', [])
      this.$set(this.conditions[index], 'conditions', [{}])
      this.$set(this.conditions[index], 'rangeType', '1')
      this.$set(this.conditions[index], 'condition_type', '0')
      delete this.conditions[index].editable
      delete this.conditions[index].height
      delete this.conditions[index].listDisplay
      delete this.conditions[index].readonly
      delete this.conditions[index].required
      delete this.conditions[index].width
    },
    /**
    * @desc 格式化筛选条件
    * @param {String} value 筛选条件值
    * @return {String} 筛选条件文本
    */
    chartConditionFormat: function (value) {
      let temp = this.chartCondition.find((element) => (element.value === value))
      return temp === undefined ? '' : temp.text
    },
    /**
    * @desc 设置筛选条件
    * @param {Object} item 筛选条件对象
    */
    setCondition: function (item) {
      this.currentCondition = item
      if (['combobox'].indexOf(this.currentCondition.fieldType) === -1) {
        this.currentCondition.type = 'condition'
      }
      if (['datebox', 'datetimebox', 'monthbox', 'yearbox'].indexOf(this.currentCondition.fieldType) !== -1) {
        this.currentCondition.type = 'date'
        if (this.currentCondition.dateCondition === undefined) {
          this.currentCondition.dateCondition = JSON.parse(JSON.stringify(this.chartDateCondition))
        }
        this.currentDateCondition = this.currentCondition.dateCondition[0]
      }
      this.modalCondition = true
    },
    /**
    * @desc 删除筛选条件
    * @param {Num} index 筛选条件位置
    */
    delCondition: function (index) {
      this.conditions.splice(index, 1)
    },
    /**
    * @desc 保存筛选条件
    */
    saveCondition: function () {
      this.modalCondition = false
    },
    /**
    * @desc 增加精确筛选选项
    * @param {Object} item 精确筛选选项对象
    */
    exactAdd: function (item) {
      if (this.currentCondition.options.indexOf(item) === -1) {
        this.currentCondition.options.push(item)
      }
    },
    /**
    * @desc 增加全部精确筛选选项
    */
    exactAddAll: function () {
      this.currentCondition.options = JSON.parse(JSON.stringify(this.selectData[this.currentCondition.selectID]))
    },
    /**
    * @desc 删除精确筛选选项
    * @param {Object} item 精确筛选选项对象
    */
    exactDel: function (item) {
      this.currentCondition.options.splice(this.currentCondition.options.indexOf(item), 1)
    },
    /**
    * @desc 清空精确筛选选项
    */
    exactClear: function () {
      this.currentCondition.options = []
    },
    /**
    * @desc 增加条件筛选
    */
    conditionAdd: function () {
      this.currentCondition.conditions.push({})
    },
    /**
    * @desc 删除条件筛选
    * @param {Object} item 条件筛选对象
    */
    conditionDel: function (item) {
      this.currentCondition.conditions.splice(this.currentCondition.conditions.indexOf(item), 1)
    },
    /**
    * @desc 增加日期筛选项
    */
    addDateCondition: function () {
      let temp = {name: '未命名', fixed: {}, relative: {}, accurate: {}}
      this.currentCondition.dateCondition.push(temp)
      this.currentDateCondition = temp
    },
    /**
    * @desc 编辑日期筛选项
    * @param {Object} item 日期筛选项对象
    */
    editDateCondition: function (item) {
      this.currentDateCondition = item
    },
    /**
    * @desc 删除日期筛选项
    * @param {Num} index 日期筛选项位置
    */
    delDateCondition: function (index) {
      if (this.currentDateCondition === this.currentCondition.dateCondition[index]) {
        this.currentDateCondition = this.currentCondition.dateCondition[0]
      } else {
        let temp = this.currentDateCondition
        this.currentDateCondition = {}
        this.currentDateCondition = temp
      }
      this.currentCondition.dateCondition.splice(index, 1)
    },
    /**
    * @desc 显示编辑图表配色
    */
    showColorTheme: function () {
      this.currentColorThemeField = this.y_field[0]
      this.modalColorTheme = true
    },
    /**
    * @desc 修改图表配色
    */
    changeColorTheme: function () {
      for (let i = 0; i < this.y_field.length; i++) {
        if (this.currentColorTheme.colors[i] !== '' && this.currentColorTheme.colors[i] !== undefined) {
          this.y_field[i].color = this.currentColorTheme.colors[i]
        }
      }
      this.createChart()
    },
    /**
    * @desc 保存图表配色
    */
    saveColorTheme: function () {
      this.modalColorTheme = false
    },
    /**
    * @desc 显示字段图表配色
    * @param {Object} item 字段图表配色对象
    */
    showFieldColorTheme: function (item) {
      this.currentColorThemeField = item
    },
    /**
    * @desc 设置字段图表配色
    * @param {String} color 颜色值
    */
    setFieldColor: function (color) {
      let temp = this.currentColorThemeField
      let i = 0
      let flag = true
      this.y_field.indexOf(this.currentColorThemeField) !== -1 ? i = this.y_field.indexOf(this.currentColorThemeField) : (_ => {
        i = this.secondary_y_field.indexOf(this.currentColorThemeField)
        flag = false
      })()
      this.currentColorThemeField = {}
      this.currentColorThemeField = temp
      if (flag) {
        this.y_field[i].color = ''
        this.$set(this.y_field[i], 'color', color)
      } else {
        this.secondary_y_field[i].color = ''
        this.$set(this.secondary_y_field[i], 'color', color)
      }
      this.createChart()
    },
    /* saveColorChange: function (color) { // 设置自定义颜色
      this.currentColorThemeField.color = color
      let temp = this.currentColorThemeField
      let i = this.y_field.indexOf(this.currentColorThemeField)
      this.currentColorThemeField = {}
      this.currentColorThemeField = temp
      this.y_field[i].color = ''
      this.$set(this.y_field[i], 'color', color)
      this.createChart()
    }, */
    /**
    * @desc 编辑图内筛选器
    */
    editSearchCondition: function () {
      this.modalSearchCondition = true
    },
    /**
    * @desc 保存图内筛选器
    */
    saveSearchCondition: function () {
      this.modalSearchCondition = false
    },
    /**
    * @desc 增加图内筛选器
    * @param {Object} item 图内筛选器对象
    */
    addSearchCondition: function (item) {
      this.searchConditions.push(item)
    },
    /**
    * @desc 设置当前图内筛选器
    * @param {Object} item 图内筛选器对象
    */
    setCurrentSearchCondition: function (item) {
      this.currentSearchCondition = item
    },
    /**
    * @desc 删除图内筛选器
    * @param {Num} index 图内筛选器位置
    */
    delSearchCondition: function (index) {
      if (this.searchConditions.length === 1) {
        this.currentSearchCondition = {}
      } else {
        if (this.currentSearchCondition === this.searchConditions[index]) {
          this.currentSearchCondition = this.searchConditions[0]
        } else {
          let temp = this.currentSearchCondition
          this.currentSearchCondition = {}
          this.currentSearchCondition = temp
        }
      }
      this.searchConditions.splice(index, 1)
    },
    /**
    * @desc 显示仪表盘条件配置
    */
    showGaugeCondition: function () {
      this.modalGaugeCondition = true
    },
    /**
    * @desc 保存仪表盘条件配置
    */
    saveGaugeCondition: function () {
      this.modalGaugeCondition = false
    },
    /**
    * @desc 增加一条仪表盘条件配置
    */
    gaugeConditionAdd: function () {
      this.chartObj.gauge.conditions.push({min: '', max: '', color: 'rgb(145, 199, 174)'})
    },
    /**
    * @desc 删除一条仪表盘条件配置
    * @param {Num} index 仪表盘条件配置位置
    */
    gaugeConditionDel: function (index) {
      this.chartObj.gauge.conditions.splice(index, 1)
    },
    /**
    * @desc 显示仪表盘条件颜色配置
    * @param {Object} event 事件
    * @param {Object} item 仪表盘条件配置对象
    */
    showGaugeConditionColor: function (event, item) {
      this.currentGaugeCondition = item
      this.modalGaugeConditionColorTop = event.clientY
      this.modalGaugeConditionColorLeft = event.clientX
      this.modalGaugeConditionColor = true
    },
    /**
    * @desc 设置仪表盘条件颜色配置
    * @param {String} color 颜色值
    */
    setCurrentGaugeConditionColor: function (color) {
      this.currentGaugeCondition.color = color
    },
    /**
    * @desc 关闭仪表盘条件颜色配置
    */
    closeCurrentGaugeConditionColor: function () {
      this.modalGaugeConditionColor = false
    },
    /**
    * @desc 显示雷达图最大值配置
    */
    showRadarMax: function () {
      this.modalRadarMax = true
    },
    /**
    * @desc 关闭雷达图最大值配置
    */
    saveRadarMax: function () {
      this.modalRadarMax = false
      this.createChart()
    },
    /**
    * @desc 显示视觉映射配置
    */
    showVisualMap: function () {
      this.modalVisualMap = true
    },
    /**
    * @desc 关闭视觉映射配置
    */
    saveVisualMap: function () {
      this.modalVisualMap = false
    },
    /**
    * @desc 增加一条视觉映射配置
    */
    visualMapAdd: function () {
      this.chartObj.visualMaps.push({min: '', max: '', color: 'rgb(145, 199, 174)'})
    },
    /**
    * @desc 删除一条视觉映射配置
    * @param {Num} index 视觉映射配置位置
    */
    visualMapDel: function (index) {
      this.chartObj.visualMaps.splice(index, 1)
    },
    /**
    * @desc 显示视觉映射颜色配置
    * @param {Object} event 事件
    * @param {Object} item 视觉映射配置对象
    */
    showVisualMapColor: function (event, item) {
      this.currentVisualMap = item
      this.modalVisualMapColorTop = event.clientY
      this.modalVisualMapColorLeft = event.clientX
      this.modalVisualMapColor = true
    },
    /**
    * @desc 设置视觉映射颜色配置
    * @param {String} color 颜色值
    */
    setCurrentVisualMapColor: function (color) {
      this.currentVisualMap.color = color
    },
    /**
    * @desc 关闭视觉映射颜色配置
    */
    closeCurrentVisualMapColor: function () {
      this.modalVisualMapColor = false
    },
    /**
    * @desc 显示矩形树图多层配置
    */
    showTreemapLevels: function () {
      this.modalTreemapLevels = true
    },
    /**
    * @desc 增加一条矩形树图层级配置
    */
    treemapLevelsAdd: function () {
      this.chartObj.treemap.levels.push({borderColor: 'rgb(255,255,255)', borderWidth: 0, gapWidth: 0})
    },
    /**
    * @desc 删除一条矩形树图层级配置
    * @param {Number} index 层级配置位置
    */
    treemapLevelsDel: function (index) {
      this.chartObj.treemap.levels.splice(index, 1)
    },
    /**
    * @desc 关闭矩形树图多层配置
    */
    saveTreemapLevels: function () {
      this.modalTreemapLevels = false
      this.createChart()
    },
    /**
    * @desc 保存警戒线数值
    */
    setMarkLine: function () {
      this.chartObj.markLine.markLines = this.markLines
    },
    /**
    * @desc 是否刷新图表
    */
    dataChange: function () {
      if (this.x_field.length > 0 && this.y_field.length > 0 && !Util.isEmpty(this.currentForm.title)) {
        this.initChart()
      }
    },
    /**
    * @desc 取图表数据
    */
    initChart: function () {
      /* let temp = ''
      this.$api.post('/crm/ActionFormSelectUtil/Select/getChartsDataBySearch.do', {formName: this.currentForm.title, field: this.x_field[0], condition: temp, create_user_id: '1010'}, r => {
        console.log(r)
        if (r.data.length > 0) {
          this.xData = r.data.split(',')
        }
        this.$api.post('/crm/ActionFormSelectUtil/Select/getChartsDataBySearch.do', {formName: this.currentForm.title, field: this.y_field[0], condition: temp, create_user_id: '1010'}, r => {
          if (r.data.length > 0) {
            this.yData = r.data.split(',')
          }
          this.createChart()
        })
      }) */
      this.createChart()
    },
    /**
    * @desc 绘制图表
    */
    createChart: function () {
      if (this.charts) {
        this.charts.dispose()
      }
      this.charts = echarts.init(document.getElementById('main'))
      console.log(this.xData)
      console.log(this.yData)
      this.option = Util.initChartOption(this.chartObj, this.x_field, this.y_field, this.y_field_type, this.scatter_y_field, this.secondary_y_field, this.secondary_y_field_type, this.currentColorTheme, this.radarMax, this.xData, this.yData, this.SYData)
      this.charts.setOption(this.option)
    },
    /**
    * @desc 保存
    */
    save: function () {
      let obj = {
        chartObj: this.chartObj,
        x_field: this.x_field,
        y_field: this.y_field,
        y_field_type: this.y_field_type,
        scatter_y_field: this.scatter_y_field,
        secondary_y_field: this.secondary_y_field,
        secondary_y_field_type: this.secondary_y_field_type,
        currentColorTheme: this.currentColorTheme,
        radarMax: this.radarMax
      }
      console.log(JSON.stringify(obj))
    }
  },
  computed: {
    colHeight () { // 页面高度
      return document.body.offsetHeight - 112
    },
    dragOption () { // 拖拽源配置
      return {
        group: {
          name: 'fields',
          pull: 'clone'
        },
        sort: false
      }
    },
    dragToXOption () { // 拖拽到维度配置
      return {
        group: {
          put: ['fields']
        }
      }
    },
    dragToYOption () { // 拖拽到数值配置
      return {
        group: {
          put: ['fields']
        }
      }
    },
    /* dragToScatterOption () {
      return {
        group: {
          put: ['fields']
        }
      }
    }, */
    dragToSecondaryYOption () { // 拖拽到次轴配置
      return {
        group: {
          put: ['fields']
        }
      }
    },
    dragToCOption () { // 拖拽到筛选器配置
      return {
        group: {
          put: ['fields']
        }
      }
    },
    dragGaugeOption () { // 仪表盘条件拖拽配置
      return {
        sort: true
      }
    }
  },
  mounted () {
    this.init()
  },
  watch: {
    chartObj: { // 重新绘制图表
      handler () {
        console.log('watch')
        this.createChart()
      },
      deep: true
    }
  }
}
</script>
<style lang="scss">
.edit-chart-left{
  overflow-y: auto;
  overflow-x: hidden;
  border-right: 1px solid #ddd;
  z-index: 100;
  position: absolute;
  top: 0;
  left: 0;
  width: 220px;
}
.edit-chart-left-con{
  padding: 10px;
}
.edit-chart-left-title{
  font-size: 0.13rem;
  font-weight: 600;
  line-height: 30px;
}
.edit-chart-left-line{
  height: 1px;
  background-color: #ddd;
  margin: 10px -10px;
}
.edit-chart-left-list{
  border-top: 1px solid #ddd;
  padding-left: 10px;
  li{
    line-height: 30px;
    cursor: move;
  }
}
.edit-chart-middle{
  padding: 10px;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 100;
  margin-left: 220px;
  margin-right: 320px;
}
.edit-chart-field-con{
  padding: 5px 0;
  border-bottom: 1px solid #ddd;
  label{
    float: left;
    width: 60px;
    line-height: 34px;
  }
}
.edit-chart-field-inner{
  margin-left: 60px;
  ul{
    position: relative;
    padding-right: 100px;
    &>div{
      min-height: 34px;
    }
    &>div>li{
      float: left;
      height: 34px;
      line-height: 34px;
      position: relative;
      &:hover{
        .close-btn{
          display: block;
        }
      }
      .ivu-select{
        margin-right: 20px;
      }
    }
  }
  ul.ivu-select-dropdown-list, ul.ivu-dropdown-menu{
    padding-right: 0;
  }
  .ivu-dropdown{
    margin-right: 10px;
    a{
      color: #333;
      &.selected{
        color: #2d8cf0;
      }
    }
    .ivu-btn{
      padding-right: 25px;
    }
  }
  .close-btn{
    position: absolute;
    top: 11px;
    right: 14px;
    display: inline-block;
    width: 14px;
    height: 14px;
    line-height: 13px;
    background-color: #ffffff;
    border-radius: 50%;
    text-align: center;
    display: none;
    &:hover{
      opacity: .7;
    }
    i{
      font-size: 0.12rem;
    }
  }
}
.edit-chart-field-btn{
  position: absolute;
  top: 0;
  right: 5px;
  height: 34px;
  line-height: 34px;
}
.chart-set-con{
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.1rem;
  z-index: 1000;
  position: absolute;
  top: 0;
  right: 0;
  width: 320px;
  label.ivu-form-item-label{
    text-align: left;
  }
  .ivu-form-item{
    margin-bottom: 0;
  }
  label{
    margin-bottom: 5px;
  }
  .line{
    margin: 0.15rem 0 0.05rem 0;
  }
  .ivu-form-item-content, .chart-set-title{
    &>a{
      float: right;
      margin-right: 0.1rem;
      i{
        font-size: 0.18rem;
      }
    }
  }
}
.chart-set-title{
  padding: 10px 0;
  color: #515a6e;
  font-size: 12px;
  font-weight: 600;
}
.chart-set-inner-line{
  padding-left: 18px;
  margin-bottom: 5px;
  label{
    padding-right: 3px;
  }
  .ivu-color-picker{
    .ivu-select-dropdown{
      margin-left: -140px;
    }
    .ivu-input-icon-normal + .ivu-input{
      padding-right: 7px;
    }
  }
  .ivu-select, .ivu-color-picker{
    position: relative;
  }
}
.chart-type-list{
  display: inline-block;
  width: 100%;
  li{
    float: left;
    a{
      width: 40px;
      height: 40px;
      display: inline-block;
      padding: 4px;
      &.selected{
        box-shadow: 0 0 0 2px rgba(81,130,227,.06), inset 0 0 0 2px rgba(81,129,228,.6);
        background-color: #ffffff;
      }
    }
  }
}
.chart-type-icon{
  width: 32px;
  height: 32px;
  display: inline-block;
}
.chart-icon-line{
  background: url(../../assets/img/svg-sprite_d1903b5.svg) -1200px -1198px no-repeat;
}
.chart-icon-bar{
  background: url(../../assets/img/svg-sprite_d1903b5.svg) -800px -871px no-repeat;
}
.chart-icon-pie{
  background: url(../../assets/img/svg-sprite_d1903b5.svg) -1260px -1302px no-repeat;
}
.chart-icon-gauge{
  background: url(../../assets/img/svg-sprite_d1903b5.svg) -268px -1302px no-repeat;
}
.chart-icon-stack-bar{
  background: url(../../assets/img/svg-sprite_d1903b5.svg) -864px -871px no-repeat;
}
.chart-icon-waterfall{
  background: url(../../assets/img/svg-sprite_d1903b5.svg) -1004px -1302px no-repeat;
}
.chart-icon-transverse-bar{
  background: url(../../assets/img/svg-sprite_d1903b5.svg) -1188px -1238px no-repeat;
}
.chart-icon-stack-transverse-bar{
  background: url(../../assets/img/svg-sprite_d1903b5.svg) -1252px -1238px no-repeat;
}
.chart-icon-area-line{
  background: url(../../assets/img/svg-sprite_d1903b5.svg) -1341px -520px no-repeat;
}
.chart-icon-stack-area-line{
  background: url(../../assets/img/svg-sprite_d1903b5.svg) -1341px -602px no-repeat;
}
.chart-icon-scatter{
  background: url(../../assets/img/svg-sprite_d1903b5.svg) -620px -1302px no-repeat;
}
.chart-icon-sunburst{
  background: url(../../assets/img/svg-sprite_d1903b5.svg) -1341px -766px no-repeat;
}
.chart-icon-treemap{
  background: url(../../assets/img/svg-sprite_d1903b5.svg) -1340px -876px no-repeat;
}
.chart-icon-funnel{
  background: url(../../assets/img/svg-sprite_d1903b5.svg) -1068px -1302px no-repeat;
}
.chart-icon-line-and-bar{
  background: url(../../assets/img/svg-sprite_d1903b5.svg) -204px -1302px no-repeat;
}
.chart-icon-sankey{
  background: url(../../assets/img/svg-sprite_d1903b5.svg) -876px -1302px no-repeat;
}
.chart-icon-radar{
  background: url(../../assets/img/svg-sprite_d1903b5.svg) -748px -1302px no-repeat;
}
.chart-icon-k{
  background: url(../../assets/img/svg-sprite_d1903b5.svg) -684px -1300px no-repeat;
}
.chart-icon-wordcloud{
  background: url(../../assets/img/svg-sprite_d1903b5.svg) -709px -387px no-repeat;
}
.chart-icon-liquidfill{
  background: url(../../assets/img/svg-sprite_d1903b5.svg) -333px -1300px no-repeat;
}
.chart-icon-map{
  background: url(../../assets/img/svg-sprite_d1903b5.svg) -333px -1300px no-repeat;
}
.chart-icon-mapLines{
  background: url(../../assets/img/svg-sprite_d1903b5.svg) -333px -1300px no-repeat;
}
.active, .chart-type-list li a.selected{
  .chart-icon-line{
    background: url(../../assets/img/svg-sprite_d1903b5.svg) -1092px -1238px no-repeat;
  }
  .chart-icon-bar{
    background: url(../../assets/img/svg-sprite_d1903b5.svg) -832px -871px no-repeat;
  }
  .chart-icon-pie{
    background: url(../../assets/img/svg-sprite_d1903b5.svg) -1156px -1238px no-repeat;
  }
  .chart-icon-gauge{
    background: url(../../assets/img/svg-sprite_d1903b5.svg) -300px -1302px no-repeat;
  }
  .chart-icon-stack-bar{
    background: url(../../assets/img/svg-sprite_d1903b5.svg) -896px -871px no-repeat;
  }
  .chart-icon-waterfall{
    background: url(../../assets/img/svg-sprite_d1903b5.svg) -1036px -1302px no-repeat;
  }
  .chart-icon-transverse-bar{
    background: url(../../assets/img/svg-sprite_d1903b5.svg) -1220px -1238px no-repeat;
  }
  .chart-icon-stack-transverse-bar{
    background: url(../../assets/img/svg-sprite_d1903b5.svg) -1284px -1238px no-repeat;
  }
  .chart-icon-area-line{
    background: url(../../assets/img/svg-sprite_d1903b5.svg) -1341px -552px no-repeat;
  }
  .chart-icon-stack-area-line{
    background: url(../../assets/img/svg-sprite_d1903b5.svg) -1341px -634px no-repeat;
  }
  .chart-icon-scatter{
    background: url(../../assets/img/svg-sprite_d1903b5.svg) -652px -1302px no-repeat;
  }
  .chart-icon-sunburst{
    background: url(../../assets/img/svg-sprite_d1903b5.svg) -1341px -798px no-repeat;
  }
  .chart-icon-treemap{
    background: url(../../assets/img/svg-sprite_d1903b5.svg) -1105px -594px no-repeat;
  }
  .chart-icon-funnel{
    background: url(../../assets/img/svg-sprite_d1903b5.svg) -1100px -1302px no-repeat;
  }
  .chart-icon-line-and-bar{
    background: url(../../assets/img/svg-sprite_d1903b5.svg) -236px -1302px no-repeat;
  }
  .chart-icon-sankey{
    background: url(../../assets/img/svg-sprite_d1903b5.svg) -908px -1302px no-repeat;
  }
  .chart-icon-radar{
    background: url(../../assets/img/svg-sprite_d1903b5.svg) -780px -1302px no-repeat;
  }
  .chart-icon-k{
    background: url(../../assets/img/svg-sprite_d1903b5.svg) -716px -1300px no-repeat;
  }
  .chart-icon-wordcloud{
    background: url(../../assets/img/svg-sprite_d1903b5.svg) -672px -1520px no-repeat;
  }
  .chart-icon-liquidfill{
    background: url(../../assets/img/svg-sprite_d1903b5.svg) -364px -1300px no-repeat;
  }
  .chart-icon-map{
    background: url(../../assets/img/svg-sprite_d1903b5.svg) -364px -1300px no-repeat;
  }
  .chart-icon-mapLines{
    background: url(../../assets/img/svg-sprite_d1903b5.svg) -364px -1300px no-repeat;
  }
}
.chart-condition-con{
  float: left;
  width: 160px;
  height: 100%;
  border-right: 1px solid #dddddd;
  padding-right: 10px;
}
.chart-condition-title{
  padding: 0.1rem 0;
}
.chart-condition-list{
  min-height: 200px;
  .ivu-collapse{
    margin-bottom: 5px;
  }
  .ivu-collapse>.ivu-collapse-item>.ivu-collapse-header{
    height: 30px;
    line-height: 30px;
    padding-left: 8px;
    padding-right: 40px;
    position: relative;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    a{
      position: absolute;
      top: 0;
      right: 5px;
      &.chart-condition-li-del{
        right: 25px;
      }
      i{
        font-size: 15px;
      }
    }
  }
  .ivu-collapse>.ivu-collapse-item>.ivu-collapse-header>i{
    margin-right: 0;
  }
  li{
    padding: 5px 0;
  }
}
.ivu-card{
  font-size: 0.12rem;
}
.modal-condition-con{
  font-size: 0.12rem;
  .ivu-card{
    margin-top: 0.15rem;
  }
  .ivu-card-body{
    padding: 0;
  }
  .ivu-col{
    padding: 0.1rem;
  }
  .ivu-col:first-child{
    border-right: 1px solid #eeeeee;
  }
}
.modal-condition-title{
  padding: 0.08rem 0;
  font-size: 0.12rem;
  a{
    float: right;
    margin-right: 10px;
    i{
      font-size: 0.2rem;
    }
  }
}
.modal-condition-options{
  min-height: 180px;
  li{
    font-size: 0.12rem;
    padding: 0.06rem 10px 0.06rem 5px;
    &:hover{
      background-color: #f5f5f5;
      a{
        visibility: visible;
      }
    }
    &.active{
      background-color: #f5f5f5;
    }
    a{
      float: right;
      visibility: hidden;
    }
  }
}
.modal-condition-options-with-btn{
  li{
    padding-right: 30px;
    position: relative;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    a{
      float: none;
      position: absolute;
      right: 3px;
      top: 6px;
    }
  }
}
.modal-condition-options-all{
  text-align: center;
  a{
    font-size: 0.12rem;
  }
  i{
    display: inline-block;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    margin-right: 3px;
    vertical-align: middle;
  }
}
.modal-condition-tips{
  height: 180px;
  line-height: 180px;
  text-align: center;
  color: #999;
  font-size: 0.12rem;
}
.modal-condition-condition{
  font-size: 0.12rem;
  min-height: 201px;
  span{
    margin-right: 8px;
  }
  .ivu-select{
    margin-right: 8px;
  }
  a{
    margin-left: 30px;
  }
  i{
    font-size: 0.2rem;
  }
  &>div{
    margin-bottom: 5px;
  }
}
.modal-condition-date{
  .ivu-col{
    padding: 0;
  }
  .ivu-col:first-child{
    border-right: none;
  }
  .ivu-card{
    padding: 0.1rem 0.15rem;
    margin-top: 0.06rem;
  }
  .ivu-form-item{
    margin-bottom: 0.05rem;
  }
  .modal-condition-options li{
    cursor: pointer;
  }
  .line{
    margin: 0.2rem 0;
  }
}
.series-color-list{
  li{
    margin-bottom: 5px;
    font-size: 0.12rem;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    cursor: pointer;
    &.active{
      background-color: #f5f5f5;
    }
    i{
      display: inline-block;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      margin-right: 8px;
      vertical-align: middle;
    }
  }
}
.modal-theme-colors{
  padding: 10px;
  li{
    float: left;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    text-align: center;
    margin: 0 6px 10px 6px;
    i{
      visibility: hidden;
      color: #ffffff;
      font-size: 32px;
    }
    &.active{
      box-shadow: 0 0 0 1px rgba(0,0,0,.06), 0 1px 2px 0 rgba(0,0,0,.2), inset 0 0 0 2px rgba(255,255,255,.6);
      i{
        visibility: visible;
      }
    }
  }
}
.ivu-color-picker-input{
  cursor: pointer;
}
.ivu-input-icon-normal+.ivu-input{
  padding-right: 0;
}
.ivu-color-picker .ivu-input-icon-normal+.ivu-input{
  padding-right: 7px;
}
.ivu-color-picker-focused{
  border: none;
  box-shadow: none;
}
.ivu-color-picker-rel{
  i{
    display: none;
  }
}
.ivu-color-picker{
  .ivu-input{
    border: none;
  }
}
body .ivu-modal .ivu-color-picker .ivu-select-dropdown{
  top: -30px!important;
  left: 0px!important;
}
.ivu-color-picker-confirm{
  .ivu-btn-default{
    display: none;
  }
}
.modal-search-condition-con{
  .ivu-col{
    border-right: 1px solid #eeeeee;
    padding: 0 0.05rem;
    &:last-child{
      border-right: none;
    }
  }
  .modal-condition-options{
    height: 240px;
    overflow: auto;
  }
}
.chart-search-condition-con{
  &>ul{
    &>li{
      float: left;
      margin: 10px;
    }
  }
}
.modal-gauge-condition{
  margin-bottom: 8px;
  cursor: move;
  span{
    display: inline-block;
    vertical-align: middle;
    margin: 0 10px;
  }
}
.select-color{
  display: inline-block;
  width: 44px;
  height: 32px;
  position: relative;
  cursor: pointer;
  span{
    display: inline-block;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    margin: 0;
  }
  &:after{
    right: 0;
    top: 14px;
    position: absolute;
    content: '';
    border-width: 4px;
    border-style: solid;
    border-color: #A3ABB0 rgba(0,0,0,0) rgba(0,0,0,0);
  }
}
.gauge-condition-color-con{
  position: fixed;
  width: 240px;
  padding: 20px;
  background-color: #ffffff;
  z-index: 10000;
  ul{
    li{
      float: left;
      margin: 0 8px 8px 0;
      cursor: pointer;
      span{
        display: inline-block;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        &:hover{
          box-shadow: 0 0 0 1px rgba(0,0,0,.06), 0 1px 2px 0 rgba(0,0,0,.2), inset 0 0 0 2px #FFF;
        }
      }
    }
  }
}
.gauge-condition-color-close{
  position: absolute;
  top: 5px;
  right: 8px;
  i{
    color: #999;
    font-size: 0.16rem;
  }
}
.radarMax-list{
  li{
    float: left;
    width: 50%;
    &>span{
      display: inline-block;
      width: 140px;
      text-align: right;
      padding-right: 15px;
    }
  }
}
.treemapLevelsList{
  margin-top: 8px;
  li{
    margin-bottom: 5px;
    span{
      padding-right: 3px;
    }
    a{
      font-size: .2rem;
      margin-left: 15px;
    }
  }
}
.chart-con{
  padding: 10px 10px 10px 170px;
}
.chart-title{
  font-size: 0.18rem;
}
#main{
  float: left;
  width: 100%;
}
</style>
