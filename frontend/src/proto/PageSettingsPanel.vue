<template>
	<!-- The panel and the dialog are the same fields in different chrome, so the
	     body is defined once and replayed into whichever branch renders. -->
	<DefineBody>
		<div class="space-y-6">
			<div>
				<div class="mb-2 text-xs font-medium text-ink-gray-5">General</div>
				<div class="space-y-3">
					<TextInput v-model="form.title" label="Title" placeholder="Untitled" />
					<TextInput v-model="form.slug" label="Slug" placeholder="page-slug" />
					<TextInput
						v-model="form.route"
						label="Route"
						:description="publicUrl"
						placeholder="space/section/page"
					/>
					<Switch
						v-model="form.isPublished"
						label="Published"
						description="Visible on the public site"
					/>
				</div>
			</div>

			<div>
				<div class="mb-2 text-xs font-medium text-ink-gray-5">
					Social preview
				</div>
				<div class="space-y-3">
					<TextInput
						v-model="form.metaTitle"
						label="Meta title"
						placeholder="Leave empty to use the page title"
					/>
					<Textarea
						v-model="form.metaDescription"
						label="Meta description"
						:rows="3"
						placeholder="A short summary for search results and link previews"
					/>
					<div>
						<div class="mb-1.5 text-sm text-ink-gray-5">Meta image</div>
						<button
							type="button"
							class="flex aspect-[1200/630] w-full flex-col items-center justify-center gap-1 rounded-4 border border-dashed border-outline-gray-3 bg-surface-gray-1 hover:bg-surface-gray-2"
						>
							<span
								class="lucide-image-up size-5 text-ink-gray-4"
								aria-hidden="true"
							/>
							<span class="text-sm text-ink-gray-6">Upload image</span>
							<span class="text-xs text-ink-gray-4">
								Recommended 1200&times;630
							</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	</DefineBody>

	<div class="flex h-full flex-col">
		<div
			class="flex h-12 shrink-0 items-center justify-between border-b border-outline-gray-2 px-3"
		>
			<span class="truncate text-base font-medium text-ink-gray-8">
				Page settings
			</span>
			<Tooltip text="Close page settings">
				<Button
					variant="ghost"
					icon="lucide-x"
					label="Close page settings"
					@click="ui.showPageSettings = false"
				/>
			</Tooltip>
		</div>
		<div class="min-h-0 flex-1 overflow-y-auto p-3">
			<ReuseBody />
		</div>
		<div class="shrink-0 border-t border-outline-gray-2 p-3">
			<Button variant="solid" theme="gray" label="Save" class="w-full" @click="save" />
		</div>
	</div>
</template>

<script setup>
import { createReusableTemplate } from '@vueuse/core';
import {
	Button,
	Switch,
	TextInput,
	Textarea,
	Tooltip,
	toast,
} from 'frappe-ui';
import { computed, reactive, watch } from 'vue';
import { pages } from './data';
import { ui } from './state';

const props = defineProps({
	spaceId: { type: String, required: true },
	pageKey: { type: String, default: null },
});


const [DefineBody, ReuseBody] = createReusableTemplate();

const form = reactive({
	title: '',
	slug: '',
	route: '',
	isPublished: true,
	metaTitle: '',
	metaDescription: '',
});

// The fields edit a draft, not the stub record: nothing lands until Save, and
// switching pages must discard whatever was typed.
watch(
	() => props.pageKey,
	(key) => {
		const source = key ? pages[key] : null;
		form.title = source?.title || '';
		form.slug = source?.slug || '';
		form.route = source?.route || '';
		form.isPublished = source?.isPublished ?? true;
		form.metaTitle = source?.metaTitle || '';
		form.metaDescription = source?.metaDescription || '';
	},
	{ immediate: true },
);

const publicUrl = computed(() => `/${form.route}`);

function save() {
	const source = props.pageKey ? pages[props.pageKey] : null;
	if (source) Object.assign(source, { ...form });
	toast.success('Page settings saved');
}
</script>
