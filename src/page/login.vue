<template>
<div class="login" @keydown.enter="handleSubmit">
  <div class="login-con">
    <Card :bordered="false">
      <p slot="title">
        <Icon type="log-in"></Icon>
        欢迎登录
      </p>
      <div class="form-con">
        <Form ref="loginForm" :model="loginObj" :rules="rules">
          <FormItem prop="userName">
            <Input v-model="loginObj.userName" placeholder="请输入用户名">
              <span slot="prepend">
                <Icon :size="16" type="md-person"></Icon>
              </span>
            </Input>
          </FormItem>
          <FormItem prop="password">
            <Input type="password" v-model="loginObj.password" placeholder="请输入密码">
              <span slot="prepend">
                <Icon :size="14" type="md-lock"></Icon>
              </span>
            </Input>
          </FormItem>
          <FormItem>
            <Button @click="login" type="primary" long>登录</Button>
          </FormItem>
        </Form>
        <p class="login-tip">输入任意用户名和密码即可</p>
      </div>
    </Card>
  </div>
</div>
</template>
<script>
import Util from '@/utils/index'
export default {
  data () {
    return {
      loginObj: { // 登录用户对象
        userName: 'admin',
        password: 'pass'
      },
      rules: { // 验证规则
        userName: [
          { required: true, message: '账号不能为空', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '密码不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    /**
    * @desc 登录
    */
    login: function () {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          let user = {
            id: '10010',
            userName: this.loginObj.userName
          }
          sessionStorage.setItem('user', user)
          Util.setCookie('userName', this.loginObj.userName)
          Util.setCookie('password', this.loginObj.password)
          this.$router.push({
            name: 'home'
          })
        }
      })
    }
  }
}
</script>
<style lang="scss">
@import "../style/login";
</style>
