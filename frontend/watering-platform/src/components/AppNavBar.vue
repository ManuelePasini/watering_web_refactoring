<script setup>
  import {reactive} from "vue";
  import authService from "@/services/auth.service.js";
  import {useRouter} from "vue-router";
  const router = useRouter()

  const props = defineProps(['userPermissions'])
  const reactiveUserPermissions = reactive(props.userPermissions)

  const handleLogout = async () => {
    authService.logout()
    await router.push('/logout')
  }

</script>

<template>
  <nav class="navbar fixed-top navbar-expand-lg navbar-dark bg-dark d-flex justify-content-between">
    <a class="navbar-brand flex-fill" href="#"> Monitoraggio idrico </a>
    <a class="navbar-brand" href="https://big.csr.unibo.it"> <img src="../assets/images/10simple.png" height="40" alt=""> </a>
    <div class="navbar-user" v-if="reactiveUserPermissions && reactiveUserPermissions.value">
      <span class="navbar-text" style="margin-right: 20px;">{{reactiveUserPermissions.value.user}}</span>
      <button class="btn btn-outline-info" @click="handleLogout" role="button">Logout</button>
    </div>
  </nav>
</template>

<style scoped>

.navbar-brand {
  padding: 0px;
  margin: 5px;
}

.navbar-text{
  padding: 10px;
}

.navbar-brand:hover {
  background-color: transparent;
}

.navbar-user {
  margin-right: 20px;
}

</style>