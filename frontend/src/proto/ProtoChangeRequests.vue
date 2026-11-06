<!--
	Every edit in the real model goes through a change request, so this list is
	the cross-space inbox. The open question the prototype poses: should each
	space also carry its own filtered list in the space sidebar?
-->
<template>
	<div class="flex h-full min-h-0 flex-col">
		<header
			class="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-outline-gray-2 px-4"
		>
			<h1 class="text-base-medium text-ink-gray-9">Change requests</h1>
			<div class="flex items-center gap-1 rounded-4 bg-surface-gray-2 p-0.5">
				<button
					v-for="f in FILTERS"
					:key="f"
					type="button"
					class="rounded-4 px-2 py-1 text-xs transition"
					:class="
						filter === f
							? 'bg-surface-elevation-2 text-ink-gray-8 shadow-sm'
							: 'text-ink-gray-6 hover:text-ink-gray-8'
					"
					@click="filter = f"
				>
					{{ f }}
				</button>
			</div>
		</header>

		<div class="min-h-0 flex-1 overflow-y-auto">
			<div class="mx-auto w-full max-w-3xl px-4 py-4">
				<div
					v-if="!rows.length"
					class="flex flex-col items-center gap-2 py-16 text-center"
				>
					<span class="lucide-git-pull-request size-8 text-ink-gray-4" aria-hidden="true" />
					<p class="text-base-medium text-ink-gray-7">Nothing here</p>
					<p class="text-sm text-ink-gray-5">No change requests match this filter.</p>
				</div>

				<ul v-else class="divide-y divide-outline-gray-2">
					<li
						v-for="cr in rows"
						:key="cr.id"
						class="flex items-center gap-3 py-3 transition hover:bg-surface-gray-1"
					>
						<span
							class="lucide-git-pull-request size-4 shrink-0 text-ink-gray-5"
							aria-hidden="true"
						/>
						<div class="min-w-0 flex-1">
							<div class="truncate text-base-medium text-ink-gray-8">
								{{ cr.title }}
							</div>
							<div class="truncate text-xs text-ink-gray-5">
								{{ cr.id }} · {{ spaceById(cr.spaceId)?.name }} ·
								{{ cr.changed }} pages · {{ cr.author }} · {{ cr.updatedAt }}
							</div>
						</div>
						<Badge size="sm" variant="subtle" :theme="crStatusTheme[cr.status]">
							{{ cr.status }}
						</Badge>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script setup>
import { Badge } from 'frappe-ui';
import { computed, ref } from 'vue';
import { changeRequests, crStatusTheme, spaceById } from './data';

const FILTERS = ['Open', 'Merged', 'All'];
const filter = ref('Open');

const rows = computed(() => {
	if (filter.value === 'All') return changeRequests;
	if (filter.value === 'Merged')
		return changeRequests.filter((c) => c.status === 'Merged');
	return changeRequests.filter((c) => c.status !== 'Merged');
});
</script>
