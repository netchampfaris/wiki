<template>
	<div class="flex h-full flex-col">
		<div
			class="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-outline-gray-2 px-3"
		>
			<Breadcrumbs :items="breadcrumbs" class="min-w-0 flex-1" />

			<div class="flex shrink-0 items-center gap-2">
				<span v-if="page" class="hidden text-xs text-ink-gray-5 sm:inline">
					Edited {{ page.updatedAt }} by {{ page.updatedBy }}
				</span>

				<Tooltip text="View live page">
					<Button variant="ghost" icon="lucide-eye" label="View live page" />
				</Tooltip>

				<!-- Page settings is a panel, not a buried menu item: meta fields are
				     edited alongside the page, so the toggle stays in the header and
				     reads as pressed while the panel is open. -->
				<Tooltip v-if="pageKey" text="Page settings">
					<Button
						:variant="ui.showPageSettings ? 'subtle' : 'ghost'"
						icon="lucide-panel-right"
						label="Page settings"
						@click="togglePageSettings"
					/>
				</Tooltip>

				<template v-if="space?.gitSynced">
					<Button
						variant="outline"
						icon-left="lucide-folder-git-2"
						label="Edit on GitHub"
					/>
					<Badge theme="gray" label="Read-only" />
				</template>

				<template v-else>
					<Button variant="solid" theme="gray" label="Save" @click="save" />
					<Dropdown :options="pageMenu" side="bottom" align="end">
						<Tooltip text="More actions">
							<Button
								variant="ghost"
								icon="lucide-more-vertical"
								label="More actions"
							/>
						</Tooltip>
					</Dropdown>
				</template>
			</div>
		</div>

		<div class="flex min-h-0 flex-1">
			<div class="min-h-0 flex-1 overflow-y-auto">
				<div class="mx-auto w-full max-w-3xl px-8 py-10">
					<div
						v-if="!pageKey"
						class="flex flex-col items-center justify-center py-20 text-center"
					>
						<span
							class="lucide-file-text size-8 text-ink-gray-4"
							aria-hidden="true"
						/>
						<p class="mt-3 text-base font-medium text-ink-gray-8">
							Pick a page to edit
						</p>
						<p class="mt-1 text-sm text-ink-gray-5">
							Choose a page from the tree on the left.
						</p>
						<Button
							v-if="!space?.gitSynced"
							class="mt-4"
							variant="subtle"
							icon-left="lucide-plus"
							label="New page"
						/>
					</div>

					<template v-else>
						<input
							v-model="draft.title"
							type="text"
							placeholder="Untitled"
							class="w-full border-0 bg-transparent p-0 text-3xl font-semibold text-ink-gray-9 outline-none"
							:readonly="space?.gitSynced"
						/>
						<!-- Keyed so a page switch rebuilds the editor: the tiptap instance
						     takes its content at creation, not from the bound value. -->
						<!-- <Editor> is renderless: it owns the lifecycle and v-model,
						     and the consumer renders the content region itself. -->
						<Editor
							:key="pageKey"
							v-model="draft.content"
							:extensions="extensions"
							format="html"
							placeholder="Write something..."
							:editable="!space?.gitSynced"
						>
							<template #default="{ editor }">
								<EditorContent :editor="editor" class="mt-6" />
							</template>
						</Editor>
					</template>
				</div>
			</div>

			<div
				v-if="ui.showPageSettings && pageKey"
				class="w-[352px] shrink-0 overflow-y-auto border-l border-outline-gray-2"
			>
				<PageSettingsPanel :space-id="spaceId" :page-key="pageKey" />
			</div>
		</div>
	</div>
</template>

<script setup>
import {
	Badge,
	Breadcrumbs,
	Button,
	Dropdown,
	Tooltip,
	toast,
} from 'frappe-ui';
import { Editor, EditorContent, RichTextKit } from 'frappe-ui/editor';
import { computed, reactive, watch } from 'vue';
import PageSettingsPanel from './PageSettingsPanel.vue';
import { ancestorsOf, pages, spaceById } from './data';
import { togglePageSettings, ui } from './state';

const props = defineProps({
	spaceId: { type: String, required: true },
	pageKey: { type: String, default: null },
});

const extensions = [RichTextKit];

const space = computed(() => spaceById(props.spaceId));
const page = computed(() => (props.pageKey ? pages[props.pageKey] : null));
const draft = reactive({ title: '', content: '' });

watch(
	() => props.pageKey,
	() => {
		draft.title = page.value?.title || '';
		draft.content = page.value?.content || '';
	},
	{ immediate: true },
);

const breadcrumbs = computed(() => {
	const items = [
		{
			label: space.value?.name || 'Space',
			route: { name: 'ProtoSpace', params: { spaceId: props.spaceId } },
		},
	];
	const trail = props.pageKey ? ancestorsOf(props.spaceId, props.pageKey) : [];
	trail.forEach((node, i) => {
		// The last crumb is the page itself, so it tracks the unsaved title.
		const isPage = i === trail.length - 1;
		items.push({ label: (isPage ? draft.title : node.label) || 'Untitled' });
	});
	return items;
});

const pageMenu = [
	{
		label: 'Page settings',
		icon: 'lucide-settings',
		onClick: togglePageSettings,
	},
	{ label: 'Rename', icon: 'lucide-pencil', onClick: stub },
	{ label: 'Change route', icon: 'lucide-route', onClick: stub },
	{ label: 'Unpublish', icon: 'lucide-eye-off', onClick: stub },
	{ label: 'Delete', icon: 'lucide-trash-2', theme: 'red', onClick: stub },
];

function save() {
	toast.success('Saved to draft');
}

// The prototype only exercises the shape of this menu; the rest of the items
// have no behaviour to stand in for.
function stub() {
	toast.success('Not wired up in this prototype');
}
</script>
