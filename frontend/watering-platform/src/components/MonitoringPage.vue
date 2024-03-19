<script setup>
import AppNavBar from "@/components/AppNavBar.vue";
import Monitoring from "@/components/Monitoring.vue";
import authService from "@/services/auth.service.js";
import {onMounted, onUnmounted, reactive} from "vue";
import {useRouter} from "vue-router";

const router = useRouter()

let token = reactive({});
let userPermissions = reactive({});

const checkInterval = 10000;

onMounted(async () => {
  token.value = await authService.authHeader();

  if (token.value) {
    const result = await authService.retrieveUserPermissions(token.value);
    if(!result) await router.push('/logout')
    userPermissions.value = result
  }
  userTokenUpdate()
});

const userTokenUpdate = () => {
  const intervalId = setInterval(async () => {
    token.value = await authService.authHeader();

    if (token.value) {
      const result = await authService.retrieveUserPermissions(token.value);
      if(!result) await router.push('/logout')
      userPermissions.value = result
    }
  }, checkInterval);

  onUnmounted(() => {
    clearInterval(intervalId);
  });
};

</script>

<template>
  <AppNavBar :userPermissions="userPermissions"/>
  <Monitoring :userPermissions="userPermissions" :token="token" class="justify-content-md-center col-12"></Monitoring>
</template>

<style scoped>
</style>
