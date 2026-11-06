<!--
	Level 0 of the drill-in model: the space list. Access and publish state are
	independent fields on Wiki Space, so each gets its own suffix icon. One
	merged badge would hide the case that matters most — a restricted space that
	is also unpublished.
-->
<template>
	<Sidebar v-model:collapsed="collapsed" width="260px">
		<SidebarHeader
			title="Frappe Wiki"
			subtitle="wiki.localhost"
			logo="/assets/wiki/images/wiki-logo.png"
			:menu-items="menuItems"
		/>

		<div class="min-h-0 flex-1 overflow-y-auto px-2">
			<SidebarItem label="Search" icon="lucide-search" @click="noop" />
			<SidebarItem
				label="Change Requests"
				icon="lucide-git-pull-request"
				:to="{ name: 'ProtoChangeRequests' }"
				:suffix="openChangeRequests"
			/>

			<SidebarSection label="Spaces" collapsible>
				<SidebarItem
					v-for="space in ordered"
					:key="space.id"
					:label="space.name"
					:to="{ name: 'ProtoSpace', params: { spaceId: space.id } }"
					:active="route.params.spaceId === space.id"
				>
					<template #prefix>
						<span
							class="flex size-5 items-center justify-center rounded-2"
							:class="tile(space.colour)"
						>
							<span :class="[space.icon, 'size-3.5']" aria-hidden="true" />
						</span>
					</template>
					<template #suffix>
						<span class="mr-2 flex items-center gap-1">
							<Tooltip v-if="space.gitSynced" text="Synced from GitHub">
								<span
									class="lucide-folder-git-2 size-3.5 text-ink-gray-4"
									aria-hidden="true"
								/>
							</Tooltip>
							<Tooltip
								v-if="space.access === 'restricted'"
								text="Restricted access"
							>
								<span
									class="lucide-lock size-3.5 text-ink-gray-4"
									aria-hidden="true"
								/>
							</Tooltip>
							<Tooltip v-if="!space.isPublished" text="Unpublished">
								<span
									class="lucide-eye-off size-3.5 text-ink-gray-4"
									aria-hidden="true"
								/>
							</Tooltip>
						</span>
					</template>
				</SidebarItem>
			</SidebarSection>
		</div>

		<div class="shrink-0 border-t border-outline-gray-2 p-2">
			<Button
				v-if="!collapsed"
				class="w-full"
				variant="subtle"
				icon-left="lucide-plus"
				label="New space"
				@click="noop"
			/>
			<div :class="{ 'mt-1': !collapsed }">
				<SidebarCollapseToggle />
			</div>
		</div>
	</Sidebar>
</template>

<script setup>
import {
	Button,
	Sidebar,
	SidebarCollapseToggle,
	SidebarHeader,
	SidebarItem,
	SidebarSection,
	Tooltip,
} from 'frappe-ui';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { changeRequests, spaces } from './data';

const route = useRoute();

const collapsed = ref(false);

const ordered = computed(() =>
	[...spaces].sort((a, b) => a.switcherOrder - b.switcherOrder),
);

// Merged requests are done, so they do not belong in the sidebar count.
const openChangeRequests = computed(() =>
	String(changeRequests.filter((cr) => cr.status !== 'Merged').length),
);

const menuItems = [
	{ label: 'Settings', icon: 'lucide-settings', onClick: () => {} },
	{ label: 'Toggle theme', icon: 'lucide-sun-moon', onClick: () => {} },
	{ label: 'Log out', icon: 'lucide-log-out', onClick: () => {} },
];

const TILES = {
	blue: 'bg-surface-blue-2 text-ink-blue-3',
	green: 'bg-surface-green-2 text-ink-green-3',
	orange: 'bg-surface-amber-2 text-ink-amber-3',
	red: 'bg-surface-red-2 text-ink-red-3',
};
const tile = (colour) => TILES[colour] || 'bg-surface-gray-3 text-ink-gray-7';

const noop = () => {};
</script>
