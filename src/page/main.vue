<template>
<div class="main-con">
  <div class="left-menu-con" :style="{width: leftMenuWidth + 'px'}">
    <Menu :theme="leftMenuTheme" :style="{width: leftMenuWidth + 'px'}" active-name="menulist" :open-names="['1']" accordion @on-select="routeTo">
      <template v-for="item in menuList">
        <template v-if="item.children !== null && item.children !== undefined && item.children.length > 0">
          <Submenu :name="item" :key="item.text">
            <template slot="title">
              <Icon :type="item.iconCls !== null ? 'ios-alert' : 'ios-alert'"></Icon>
              {{item.text}}
            </template>
            <template v-for="tmp in item.children">
              <template v-if="tmp.children !== null && tmp.children !== undefined && tmp.children.length > 0">
                <Submenu :name="tmp" :key="tmp.text">
                  <template slot="title">{{tmp.text}}</template>
                  <MenuItem  v-for="tm in tmp.children" :name="tm" :key="tm.text">{{tm.text}}</MenuItem>
                </Submenu>
              </template>
              <template v-else>
                <MenuItem :name="tmp" :key="tmp.text">{{tmp.text}}</MenuItem>
              </template>
            </template>
          </Submenu>
        </template>
        <template v-else>
          <MenuItem :name="item" :key="item.text">
            <Icon :type="item.iconCls !== null ? 'ios-alert' : 'ios-alert'" :key="item.text"></Icon>
            {{item.text}}
          </MenuItem>
        </template>
      </template>
    </Menu>
  </div>
  <div class="right-top-con" :style="{paddingLeft:leftMenuWidth + 'px'}">
    <div class="header">
      <Button class="header-menu-icon" :style="{transform: 'rotateZ(' + (this.shrink ? '-90' : '0') + 'deg)'}" type="text" @click="changeMenuWidth">
        <Icon type="md-reorder" size="32"></Icon>
      </Button>
      <span class="header-title">
        <img v-if="systemObj.system_icon !== '' && systemObj.system_icon !== undefined" :src="iconPath" class="header-icon">
        {{systemObj.system_name}}
      </span>
      <div class="user-dropdown-menu-con">
        <Dropdown transfer placement="bottom-end" @on-click="handleClickUserDropdown">
          <a href="javascript:void(0)">
            <Avatar icon="md-person" size="small" /> {{userName}}
            <Icon type="md-arrow-dropdown" />
          </a>
          <DropdownMenu slot="list">
            <DropdownItem name="ownSpace">个人中心</DropdownItem>
            <DropdownItem name="editPassword">修改密码</DropdownItem>
            <DropdownItem name="loginout" divided>退出登录</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
    <div class="tags-con">
      <opened-page-tags :pageTagsList="pageTagsList"></opened-page-tags>
    </div>
  </div>
  <div class="single-page-con" :style="{paddingLeft:leftMenuWidth + 'px'}">
    <keep-alive :include="cachePage">
        <router-view></router-view>
    </keep-alive>
  </div>
  <Modal v-model="modalPassword" title="修改密码" @on-ok="savePassword">
    <div class="modal-field-con">
      <div>
        <Form ref="formPosition" :model="passwordObj" :label-width="120">
          <FormItem label="旧密码" class="whole-line-703">
            <Input v-model="passwordObj.oldPass" type="password"></Input>
          </FormItem>
          <FormItem label="新密码" class="whole-line-703">
            <Input v-model="passwordObj.newPass" type="password"></Input>
          </FormItem>
          <FormItem label="确认新密码" class="whole-line-703">
            <Input v-model="passwordObj.newPass1" type="password"></Input>
          </FormItem>
        </Form>
      </div>
    </div>
  </Modal>
</div>
</template>
<script>
import openedPageTags from './main-components/opened-page-tags.vue'
export default {
  components: {
    openedPageTags
  },
  data () {
    return {
      leftMenuTheme: this.$store.state.leftMenuTheme, // 左侧菜单样式
      leftMenuWidth: 250, // 左侧菜单宽度
      shrink: false, // 左侧菜单切换
      userName: '', // 用户名
      systemObj: {system_name: '克莱特商务云平台'}, // 系统名称对象
      modalPassword: false, // 修改密码对话框是否显示
      passwordObj: {}, // 密码对象
      menuList: [ // 左侧菜单列表
        {
          text: '图表管理',
          iconCls: 'ios-alert',
          url: '/chartsManage'
        },
        {
          text: '看板管理',
          iconCls: 'ios-alert',
          url: '/editDash'
        }
      ]
    }
  },
  computed: {
    cachePage: function () {
      return this.$store.state.cachePage // 缓存的页面
    },
    pageTagsList: function () {
      return this.$store.state.pageOpenedList // 打开的页面列表
    },
    iconPath () { // 系统图标路径
      return '/apis' + this.systemObj.system_icon
    }
  },
  methods: {
    /**
    * @desc 初始化
    */
    init: function () {
      // this.$store.dispatch('updateMenuList')
      // this.userName = localStorage.userName
      // this.$store.dispatch('setSelectData')
    },
    /**
    * @desc 切换菜单显示
    */
    changeMenuWidth: function () {
      this.shrink = !this.shrink
      if (this.shrink) {
        this.leftMenuWidth = 0
      } else {
        this.leftMenuWidth = 250
      }
    },
    /**
    * @desc 用户菜单点击
    * @param {String} name 菜单名
    */
    handleClickUserDropdown (name) { // 用户菜单点击
      if (name === 'ownSpace') {
        this.$store.dispatch('increateTag', {title: '个人中心', path: '', name: 'ownspace'})
        this.$router.push({
          name: 'ownspace'
        })
      } else if (name === 'editPassword') {
        this.modalPassword = true
      } else if (name === 'loginout') {
        this.$store.commit('logout', this)
        this.$router.push({
          name: 'login'
        })
      }
    },
    /**
    * @desc 保存密码
    */
    savePassword: function () { // 保存密码
    },
    /**
    * @desc 路由跳转
    * @param {Object} e 链接对象
    */
    routeTo: function (e) {
      this.$store.dispatch('increateTag', e)
      this.$router.push({
        // path: '/' + e.name
        path: e.url
      })
    }
  },
  mounted () {
    this.init()
  }
}
</script>
<style lang="scss">
@import "../style/style";
</style>
