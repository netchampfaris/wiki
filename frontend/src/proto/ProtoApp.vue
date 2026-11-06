<!--
	Shell for the /wiki-proto information-architecture prototype.

	Space navigation lives in the sidebar and drills: the sidebar shows the
	space library at the top level, and becomes the space once you enter one.
	There is only ever one navigation column, so content keeps full width.
-->
<template>
	<div class="flex h-screen w-full overflow-hidden bg-surface-sidebar">
		<SpaceSidebar v-if="spaceId" :key="spaceId" :space-id="spaceId" />
		<LibrarySidebar v-else />

		<main
			class="flex min-w-0 flex-1 flex-col overflow-hidden border-l border-outline-gray-2 bg-surface-base"
		>
			<router-view />
		</main>

		<SpaceSettingsDialog
			v-if="spaceId"
			:key="spaceId"
			:space-id="spaceId"
			v-model:open="ui.showSpaceSettings"
		/>
	</div>
</template>

<script setup>
import { usePageMeta } from 'frappe-ui';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import LibrarySidebar from './LibrarySidebar.vue';
import SpaceSettingsDialog from './SpaceSettingsDialog.vue';
import SpaceSidebar from './SpaceSidebar.vue';
import { ui } from './state';

usePageMeta(() => ({ title: 'Wiki IA prototype' }));

const route = useRoute();

const spaceId = computed(() => route.params.spaceId || null);
</script>
