<!--
	The document tree for one space. Every sidebar variant renders this same
	component, so it owns no chrome of its own: the caller supplies the scroll
	region, the padding, and the filter string.
-->
<template>
	<div>
		<!--
			Filtering flattens. A filtered hierarchy hides matches behind collapsed
			parents, so the tree is replaced by a result list rather than pruned.
		-->
		<template v-if="query">
			<ul v-if="matches.length" class="flex flex-col">
				<li v-for="node in matches" :key="node.key">
					<RouterLink
						:to="pageRoute(node.key)"
						class="flex h-7 items-center gap-1.5 rounded-4 px-1.5"
						:class="
							node.key === pageKey
								? 'bg-surface-gray-3 text-ink-gray-9'
								: 'hover:bg-surface-gray-2'
						"
					>
						<span
							class="lucide-file-text size-4 shrink-0 text-ink-gray-5"
							aria-hidden="true"
						/>
						<span class="truncate text-base" :class="labelClass(node)">
							{{ node.label }}
						</span>
						<span class="ml-auto flex shrink-0 items-center gap-1.5 pl-1.5">
							<Tooltip v-if="node.isPublished === false" text="Unpublished">
								<span
									class="lucide-eye-off size-3.5 text-ink-gray-4"
									aria-hidden="true"
								/>
							</Tooltip>
							<Tooltip v-if="node.dirty" text="Unsaved changes in the draft">
								<span
									class="size-1.5 rounded-full bg-surface-orange-5"
									aria-hidden="true"
								/>
							</Tooltip>
						</span>
					</RouterLink>
				</li>
			</ul>
			<p v-else class="px-1.5 py-3 text-sm text-ink-gray-5">
				No pages match "{{ filter }}".
			</p>
		</template>

		<Tree
			v-else
			:nodes="nodes"
			node-key="key"
			guides="lines"
			:draggable="!readonly"
			style="--tree-row-height: 28px"
		>
			<!--
				The row is fully overridden so a page can be a real router link. The
				chevron has to stay a sibling of that link, not a child of it.
			-->
			<template #item="{ node, expanded, hasChildren, toggle }">
				<div
					class="group/node -mx-1.5 flex h-full min-w-0 flex-1 items-center gap-1.5 rounded-4 px-1.5"
					:class="
						node.type === 'page' && node.key === pageKey
							? 'bg-surface-gray-3 text-ink-gray-9'
							: 'hover:bg-surface-gray-2'
					"
				>
					<button
						v-if="hasChildren"
						type="button"
						class="flex size-4 shrink-0 items-center justify-center rounded-2 text-ink-gray-5 hover:bg-surface-gray-3 hover:text-ink-gray-7"
						:aria-label="expanded ? 'Collapse' : 'Expand'"
						@click.stop="toggle"
					>
						<span
							class="lucide-chevron-right size-3.5 transition-transform duration-150"
							:class="{ 'rotate-90': expanded }"
							aria-hidden="true"
						/>
					</button>
					<span v-else class="size-4 shrink-0" aria-hidden="true" />

					<RouterLink
						v-if="node.type === 'page'"
						:to="pageRoute(node.key)"
						class="flex h-full min-w-0 flex-1 items-center gap-1.5"
					>
						<span
							class="lucide-file-text size-4 shrink-0 text-ink-gray-5"
							aria-hidden="true"
						/>
						<span class="truncate text-base" :class="labelClass(node)">
							{{ node.label }}
						</span>
					</RouterLink>

					<a
						v-else-if="node.type === 'link'"
						:href="node.url"
						target="_blank"
						rel="noopener noreferrer"
						class="flex h-full min-w-0 flex-1 items-center gap-1.5"
					>
						<span
							class="lucide-external-link size-4 shrink-0 text-ink-gray-5"
							aria-hidden="true"
						/>
						<span class="truncate text-base" :class="labelClass(node)">
							{{ node.label }}
						</span>
					</a>

					<span v-else class="flex h-full min-w-0 flex-1 items-center gap-1.5">
						<span
							:class="[
								expanded ? 'lucide-folder-open' : 'lucide-folder',
								'size-4 shrink-0 text-ink-gray-5',
							]"
							aria-hidden="true"
						/>
						<span class="truncate text-base-medium" :class="labelClass(node)">
							{{ node.label }}
						</span>
					</span>

					<!--
						The trailing zone always occupies its width, including the
						hover-only add button, so no row reflows under the pointer.
					-->
					<span class="flex shrink-0 items-center gap-1.5">
						<span
							v-if="node.type === 'link'"
							class="lucide-arrow-up-right size-3.5 text-ink-gray-4"
							aria-hidden="true"
						/>
						<Tooltip v-if="node.isPublished === false" text="Unpublished">
							<span
								class="lucide-eye-off size-3.5 text-ink-gray-4"
								aria-hidden="true"
							/>
						</Tooltip>
						<Tooltip v-if="node.dirty" text="Unsaved changes in the draft">
							<span
								class="size-1.5 rounded-full bg-surface-orange-5"
								aria-hidden="true"
							/>
						</Tooltip>
						<Tooltip v-if="canAdd(node)" text="New page in this group">
							<Button
								variant="ghost"
								size="xs"
								icon="lucide-plus"
								class="opacity-0 transition group-hover/node:opacity-100 focus-visible:opacity-100"
								@click.stop.prevent="noop"
							/>
						</Tooltip>
					</span>
				</div>
			</template>

			<template #empty>
				<p class="px-1.5 py-3 text-sm text-ink-gray-5">This space has no pages yet.</p>
			</template>
		</Tree>
	</div>
</template>

<script setup>
import { Button, Tooltip, Tree } from 'frappe-ui';
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { flattenTree, trees } from './data';

const props = defineProps({
	spaceId: { type: String, required: true },
	pageKey: { type: String, default: null },
	readonly: { type: Boolean, default: false },
	filter: { type: String, default: '' },
});

const nodes = computed(() => trees[props.spaceId] || []);

const query = computed(() => props.filter.trim().toLowerCase());

const matches = computed(() => {
	if (!query.value) return [];
	return flattenTree(nodes.value).filter(
		(node) =>
			node.type === 'page' && node.label.toLowerCase().includes(query.value),
	);
});

const pageRoute = (pageKey) => ({
	name: 'ProtoPage',
	params: { spaceId: props.spaceId, pageKey },
});

// Unpublished wins over selection: a dimmed label is the state being reported,
// and the row background already carries the selection.
const labelClass = (node) => {
	if (node.isPublished === false) return 'text-ink-gray-4';
	if (node.type === 'group') return 'text-ink-gray-8';
	if (node.key === props.pageKey) return 'text-ink-gray-9';
	return 'text-ink-gray-7';
};

const canAdd = (node) => !props.readonly && node.type === 'group';

const noop = () => {};
</script>
