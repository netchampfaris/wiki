<!--
	Level 1 of the drill-in model: the sidebar becomes the space. This is the
	proposal under test, so the mode strip under the header is the load-bearing
	part — a git-synced space and a space with an open draft are read and edited
	in different ways, and the sidebar has to say which one you are in before you
	click anything.
-->
<template>
	<Sidebar v-if="space" v-model:collapsed="collapsed" width="260px">
		<!-- Header: back out to the library, space identity, space actions. -->
		<div
			class="flex h-12 shrink-0 items-center gap-1.5 border-b border-outline-gray-2 px-2"
		>
			<Button
				variant="ghost"
				icon="lucide-chevron-left"
				tooltip="All spaces"
				:route="{ name: 'ProtoHome' }"
			/>
			<template v-if="!collapsed">
				<span
					class="flex size-5 shrink-0 items-center justify-center rounded-2"
					:class="tile(space.colour)"
				>
					<span :class="[space.icon, 'size-3.5']" aria-hidden="true" />
				</span>
				<span class="min-w-0 flex-1 truncate text-base-medium text-ink-gray-8">
					{{ space.name }}
				</span>
				<Dropdown :options="menuOptions" align="end">
					<Button
						variant="ghost"
						icon="lucide-more-horizontal"
						tooltip="Space actions"
					/>
				</Dropdown>
			</template>
		</div>

		<template v-if="!collapsed">
			<!-- Mode strip. Git-synced and draft are mutually exclusive states. -->
			<div v-if="space.gitSynced" class="shrink-0 px-2 pt-2">
				<div
					class="flex items-center gap-1.5 rounded-4 bg-surface-gray-2 px-2 py-1.5"
				>
					<span
						class="lucide-folder-git-2 size-3.5 shrink-0 text-ink-gray-6"
						aria-hidden="true"
					/>
					<span class="min-w-0 flex-1 truncate text-xs text-ink-gray-7">
						Synced from {{ space.repo }}@{{ space.branch }}
					</span>
					<Badge size="sm" variant="subtle" :theme="syncTheme">
						{{ space.lastSyncStatus }}
					</Badge>
					<Button
						variant="ghost"
						size="xs"
						icon="lucide-refresh-cw"
						tooltip="Sync now"
						@click="noop"
					/>
				</div>
				<p class="px-2 pt-1 text-xs text-ink-gray-5">
					Read-only · last synced {{ space.lastSyncedAt }}
				</p>
			</div>

			<div v-else-if="space.draft" class="shrink-0 px-2 pt-2">
				<div class="rounded-4 px-2 py-1.5" :class="strip(space.draft.status)">
					<div class="truncate text-xs-medium">
						{{ space.draft.title }}
					</div>
					<div class="mt-1 flex items-center gap-1.5">
						<span class="min-w-0 flex-1 truncate text-xs text-ink-gray-6">
							{{ space.draft.changed }} pages changed
						</span>
						<Button variant="outline" size="xs" label="Submit" @click="noop" />
						<Button variant="ghost" size="xs" label="Discard" @click="noop" />
					</div>
				</div>
			</div>

			<!-- Search filters the tree in place; ProtoTree swaps to a flat list. -->
			<div class="shrink-0 px-2 py-2">
				<TextInput
					v-model="search"
					size="sm"
					type="text"
					:placeholder="`Search ${space.name}`"
					class="w-full"
				>
					<template #prefix>
						<span
							class="lucide-search size-4 text-ink-gray-5"
							aria-hidden="true"
						/>
					</template>
				</TextInput>
			</div>

			<div class="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
				<ProtoTree
					:space-id="spaceId"
					:page-key="pageKey"
					:readonly="space.gitSynced"
					:filter="search"
				/>
			</div>
		</template>
		<div v-else class="min-h-0 flex-1" />

		<div class="shrink-0 border-t border-outline-gray-2 p-2">
			<Button
				v-if="!collapsed && !space.gitSynced"
				class="w-full"
				variant="subtle"
				icon-left="lucide-plus"
				label="New page"
				@click="noop"
			/>
			<div :class="{ 'mt-1': !collapsed && !space.gitSynced }">
				<SidebarCollapseToggle />
			</div>
		</div>
	</Sidebar>
</template>

<script setup>
import {
	Badge,
	Button,
	Dropdown,
	Sidebar,
	SidebarCollapseToggle,
	TextInput,
} from 'frappe-ui';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ProtoTree from './ProtoTree.vue';
import { crStatusTheme, spaceById } from './data';
import { openSpaceSettings } from './state';

const props = defineProps({
	spaceId: { type: String, required: true },
});

const route = useRoute();
const router = useRouter();

const collapsed = ref(false);
const search = ref('');

const space = computed(() => spaceById(props.spaceId));
const pageKey = computed(() => route.params.pageKey || null);

const menuOptions = computed(() => {
	const options = [
		{
			label: 'Space settings',
			icon: 'lucide-settings',
			onClick: () => openSpaceSettings('general'),
		},
		{ label: 'View live site', icon: 'lucide-external-link', onClick: noop },
		{
			label: 'Switch space',
			icon: 'lucide-arrow-left-right',
			onClick: () => router.push({ name: 'ProtoHome' }),
		},
	];
	if (space.value?.gitSynced) {
		options.push({
			label: 'Sync now',
			icon: 'lucide-refresh-cw',
			onClick: noop,
		});
	}
	return options;
});

// Badge has no orange theme, so amber carries the warning step here.
const SYNC_THEMES = { Success: 'green', Partial: 'amber', Failed: 'red' };
const syncTheme = computed(
	() => SYNC_THEMES[space.value?.lastSyncStatus] || 'gray',
);

const TILES = {
	blue: 'bg-surface-blue-2 text-ink-blue-3',
	green: 'bg-surface-green-2 text-ink-green-3',
	orange: 'bg-surface-amber-2 text-ink-amber-3',
	red: 'bg-surface-red-2 text-ink-red-3',
};
const tile = (colour) => TILES[colour] || 'bg-surface-gray-3 text-ink-gray-7';

const STRIPS = {
	gray: 'bg-surface-gray-2 text-ink-gray-7',
	blue: 'bg-surface-blue-2 text-ink-blue-3',
	green: 'bg-surface-green-2 text-ink-green-3',
	orange: 'bg-surface-orange-2 text-ink-orange-3',
	red: 'bg-surface-red-2 text-ink-red-3',
};
const strip = (status) =>
	STRIPS[crStatusTheme[status]] || 'bg-surface-gray-2 text-ink-gray-7';

const noop = () => {};
</script>
