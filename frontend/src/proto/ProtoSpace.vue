<!--
	A space, with or without a page open. The tree lives in the sidebar, so this
	renders only the content column.
-->
<template>
	<div v-if="!space" class="flex h-full items-center justify-center">
		<p class="text-sm text-ink-gray-5">No such space.</p>
	</div>

	<div v-else class="flex h-full min-h-0 flex-col">
		<PageContent :space-id="spaceId" :page-key="pageKey || null" />
	</div>
</template>

<script setup>
import { computed } from 'vue';
import PageContent from './PageContent.vue';
import { spaceById } from './data';

const props = defineProps({
	spaceId: { type: String, required: true },
	pageKey: { type: String, default: null },
});

const space = computed(() => spaceById(props.spaceId));
</script>
