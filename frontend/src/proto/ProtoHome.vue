<!--
	Level 0: the space library. This is what you land on, and in the `drill`
	variant it is also the only screen where the sidebar shows spaces.
-->
<template>
	<div class="flex h-full min-h-0 flex-col">
		<header
			class="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-outline-gray-2 px-4"
		>
			<h1 class="text-base-medium text-ink-gray-9">Spaces</h1>
			<Button variant="solid" theme="gray" @click="noop">
				<template #prefix>
					<span class="lucide-plus size-4" aria-hidden="true" />
				</template>
				New space
			</Button>
		</header>

		<div class="min-h-0 flex-1 overflow-y-auto">
			<div class="mx-auto w-full max-w-4xl px-4 py-6">
				<p class="mb-5 text-sm text-ink-gray-5">
					Each space owns a route prefix and its own page tree. Spaces are how
					one wiki hosts several documentations side by side.
				</p>

				<div class="grid gap-3 sm:grid-cols-2">
					<RouterLink
						v-for="space in ordered"
						:key="space.id"
						:to="{ name: 'ProtoSpace', params: { spaceId: space.id } }"
						class="group flex flex-col gap-3 rounded-6 border border-outline-gray-2 bg-surface-elevation-2 p-4 transition hover:border-outline-gray-3 hover:bg-surface-gray-1"
					>
						<div class="flex min-w-0 items-start gap-3">
							<div
								class="flex size-9 shrink-0 items-center justify-center rounded-4"
								:class="tile(space.colour)"
							>
								<span :class="[space.icon, 'size-4']" aria-hidden="true" />
							</div>
							<div class="min-w-0 flex-1">
								<div class="truncate text-base-medium text-ink-gray-8">
									{{ space.name }}
								</div>
								<div class="truncate font-mono text-xs text-ink-gray-5">
									/{{ space.route }}
								</div>
							</div>
							<!-- Access and publish state are independent in the data model,
							     so they are two separate affordances, never one badge. -->
							<div class="flex shrink-0 items-center gap-1.5 pt-0.5">
								<Tooltip v-if="space.gitSynced" text="Synced from GitHub">
									<span class="lucide-folder-git-2 size-3.5 text-ink-gray-5" aria-hidden="true" />
								</Tooltip>
								<Tooltip
									v-if="space.access === 'restricted'"
									:text="`Restricted to ${space.roles.length} role(s)`"
								>
									<span class="lucide-lock size-3.5 text-ink-gray-5" aria-hidden="true" />
								</Tooltip>
								<Tooltip v-if="!space.isPublished" text="Unpublished">
									<span class="lucide-eye-off size-3.5 text-ink-gray-5" aria-hidden="true" />
								</Tooltip>
							</div>
						</div>

						<div class="flex items-center gap-2 text-xs text-ink-gray-5">
							<span>{{ space.pageCount }} pages</span>
							<span aria-hidden="true">·</span>
							<span>{{ space.access === 'public' ? 'Public' : 'Restricted' }}</span>
							<template v-if="space.draft">
								<span aria-hidden="true">·</span>
								<Badge size="sm" variant="subtle" :theme="crStatusTheme[space.draft.status]">
									{{ space.draft.status }}
								</Badge>
							</template>
							<template v-else-if="space.gitSynced">
								<span aria-hidden="true">·</span>
								<span>Synced {{ space.lastSyncedAt }}</span>
							</template>
						</div>
					</RouterLink>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { Badge, Button, Tooltip } from 'frappe-ui';
import { computed } from 'vue';
import { crStatusTheme, spaces } from './data';

const ordered = computed(() =>
	[...spaces].sort((a, b) => a.switcherOrder - b.switcherOrder),
);

const TILES = {
	blue: 'bg-surface-blue-2 text-ink-blue-3',
	green: 'bg-surface-green-2 text-ink-green-3',
	orange: 'bg-surface-amber-2 text-ink-amber-3',
	red: 'bg-surface-red-2 text-ink-red-3',
};

const tile = (colour) => TILES[colour] || 'bg-surface-gray-3 text-ink-gray-7';

const noop = () => {};
</script>
