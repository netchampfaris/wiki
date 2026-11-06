<script setup lang="ts">
import { FrappeUIProvider, setConfig, toast } from 'frappe-ui';
import { computed, onBeforeUnmount, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import MainLayout from './layouts/MainLayout.vue';
import { useSocket } from './socket';

// The /wiki-proto IA prototype brings its own shell and runs on stub data, so
// it skips MainLayout (which gates on a fetched user).
//
// `useRoute()` is still START_LOCATION on the first render, so `meta.proto` is
// not populated yet and MainLayout would mount for a tick — long enough for its
// WikiSettings child to fire an auto document resource. The URL is already
// correct at that point, so it settles the question synchronously.
const route = useRoute();
const isProto = computed(
	() =>
		Boolean(route.meta.proto) ||
		window.location.pathname.startsWith('/wiki-app/wiki-proto'),
);

setConfig('systemTimezone', window.timezone?.system || null);
setConfig('localTimezone', window.timezone?.user || null);

// Realtime reviewer-decision pings to the change-request author. The matching
// Notification Log entry (created server-side) is the durable copy; this is
// just the live nudge while the author has the app open.
function onChangeRequestUpdate(data: { subject?: string }) {
	if (data?.subject) toast.info(data.subject);
}

onMounted(() => {
	useSocket()?.on('wiki_change_request_update', onChangeRequestUpdate);
});
onBeforeUnmount(() => {
	useSocket()?.off('wiki_change_request_update', onChangeRequestUpdate);
});
</script>

<template>
	<FrappeUIProvider>
		<router-view v-if="isProto" />
		<MainLayout v-else>
			<router-view />
		</MainLayout>
	</FrappeUIProvider>
</template>