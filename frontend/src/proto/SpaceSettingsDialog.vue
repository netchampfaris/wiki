<template>
	<SettingsDialog v-model:open="open" v-model:tab="ui.spaceSettingsTab">
		<template #title>Space settings</template>

		<SettingsSidebar>
			<div>
				<span class="block px-2 pt-1 pb-3 text-lg-semibold text-ink-gray-9">
					{{ form.name || 'Space' }}
				</span>
				<div class="flex flex-col gap-1">
					<SettingsNavItem
						v-for="tab in navTabs"
						:key="tab.value"
						:value="tab.value"
					>
						<template #prefix>
							<span :class="[tab.icon, 'size-4 shrink-0 text-ink-gray-6']" aria-hidden="true" />
						</template>
						{{ tab.label }}
					</SettingsNavItem>
				</div>
			</div>
		</SettingsSidebar>

		<SettingsContent>
			<SettingsPanel value="general">
				<SettingsHeader title="General">
					<template #actions>
						<Button variant="solid" theme="gray" label="Save" @click="save" />
					</template>
				</SettingsHeader>
				<SettingsBody>
					<div class="divide-y divide-outline-gray-1 pt-6">
						<SettingsRow title="Space name">
							<TextInput v-model="form.name" class="w-64" placeholder="Space name" />
						</SettingsRow>
						<SettingsRow
							title="Route prefix"
							:description="`Pages live under /${form.route}/...`"
						>
							<TextInput v-model="form.route" class="w-64" placeholder="route" />
						</SettingsRow>
						<SettingsRow title="Space logo">
							<div class="flex items-center gap-3">
								<div
									class="flex size-16 shrink-0 items-center justify-center rounded-4 border border-outline-gray-2 bg-surface-gray-1"
								>
									<span
										:class="[space?.icon || 'lucide-image', 'size-6 text-ink-gray-5']"
										aria-hidden="true"
									/>
								</div>
								<Button variant="outline" label="Upload" />
								<Button variant="ghost" theme="red" label="Remove" />
							</div>
						</SettingsRow>
						<SettingsRow
							title="Published"
							description="Renders on the public site"
						>
							<Switch v-model="form.isPublished" />
						</SettingsRow>
					</div>
				</SettingsBody>
			</SettingsPanel>

			<SettingsPanel value="navigation">
				<SettingsHeader title="Navigation">
					<template #actions>
						<Button variant="solid" theme="gray" label="Save" @click="save" />
					</template>
				</SettingsHeader>
				<SettingsBody>
					<div class="divide-y divide-outline-gray-1 pt-6">
						<SettingsRow title="Show in space switcher">
							<Switch v-model="form.showInSwitcher" />
						</SettingsRow>
						<SettingsRow title="Order">
							<TextInput
								v-model="form.switcherOrder"
								type="number"
								class="w-20"
							/>
						</SettingsRow>
					</div>
				</SettingsBody>
			</SettingsPanel>

			<SettingsPanel value="access">
				<SettingsHeader title="Access">
					<template #actions>
						<Button variant="solid" theme="gray" label="Save" @click="save" />
					</template>
				</SettingsHeader>
				<SettingsBody>
					<div class="pt-6">
						<p class="text-sm text-ink-gray-6">
							A space with no roles is public. Add a role to restrict it.
						</p>

						<div class="mt-4 rounded-4 border border-outline-gray-2">
							<div
								class="grid grid-cols-[1fr_10rem_auto] items-center gap-3 border-b border-outline-gray-2 px-3 py-2 text-xs font-medium text-ink-gray-5"
							>
								<span>Role</span>
								<span>Permission</span>
								<span class="size-7" aria-hidden="true" />
							</div>

							<div
								v-if="!form.roles.length"
								class="px-3 py-6 text-center text-sm text-ink-gray-5"
							>
								No roles. This space is public.
							</div>

							<div
								v-for="(row, i) in form.roles"
								:key="i"
								class="grid grid-cols-[1fr_10rem_auto] items-center gap-3 border-b border-outline-gray-2 px-3 py-2 last:border-0"
							>
								<TextInput v-model="row.role" placeholder="Role name" />
								<Select v-model="row.permission" :options="permissionOptions" />
								<Tooltip text="Remove role">
									<Button
										variant="ghost"
										icon="lucide-x"
										label="Remove role"
										@click="form.roles.splice(i, 1)"
									/>
								</Tooltip>
							</div>
						</div>

						<Button
							class="mt-3"
							variant="subtle"
							icon-left="lucide-plus"
							label="Add role"
							@click="addRole"
						/>

						<div class="mt-6 divide-y divide-outline-gray-1">
							<SettingsRow title="Accept contributions">
								<Switch v-model="form.acceptContributions" />
							</SettingsRow>
							<SettingsRow title="Collect feedback">
								<Switch v-model="form.feedback" />
							</SettingsRow>
						</div>
					</div>
				</SettingsBody>
			</SettingsPanel>

			<SettingsPanel value="git-sync">
				<SettingsHeader title="Git sync" />
				<SettingsBody>
					<div v-if="space?.gitSynced" class="pt-6">
						<div class="divide-y divide-outline-gray-1">
							<SettingsRow title="Repository">
								<span class="truncate font-mono text-xs text-ink-gray-7">
									{{ space.repo }}
								</span>
							</SettingsRow>
							<SettingsRow title="Branch">
								<span class="font-mono text-xs text-ink-gray-7">
									{{ space.branch }}
								</span>
							</SettingsRow>
							<SettingsRow title="Docs folder">
								<span class="font-mono text-xs text-ink-gray-7">
									{{ space.docsSubdir }}
								</span>
							</SettingsRow>
							<SettingsRow title="Last sync">
								<div class="flex items-center gap-2">
									<Badge
										:theme="space.lastSyncStatus === 'Success' ? 'green' : 'red'"
										:label="space.lastSyncStatus"
									/>
									<span class="text-sm text-ink-gray-6">
										{{ space.lastSyncedAt }}
									</span>
									<span class="font-mono text-xs text-ink-gray-5">
										{{ space.lastSyncedCommit }}
									</span>
								</div>
							</SettingsRow>
						</div>

						<Button
							class="mt-4"
							variant="outline"
							icon-left="lucide-refresh-cw"
							label="Sync now"
							@click="syncNow"
						/>

						<p class="mt-4 text-sm text-ink-gray-5">
							A synced space is read-only in the editor. Edit the files in the
							repository.
						</p>
					</div>

					<div
						v-else
						class="flex flex-col items-center justify-center py-16 text-center"
					>
						<span
							class="lucide-folder-git-2 size-8 text-ink-gray-4"
							aria-hidden="true"
						/>
						<p class="mt-3 text-base font-medium text-ink-gray-8">
							Not connected to a repository
						</p>
						<p class="mt-1 max-w-sm text-sm text-ink-gray-5">
							Once connected, this space becomes read-only in the editor.
						</p>
						<Button
							class="mt-4"
							variant="outline"
							icon-left="lucide-folder-git-2"
							label="Connect a GitHub repository"
						/>
					</div>
				</SettingsBody>
			</SettingsPanel>
		</SettingsContent>
	</SettingsDialog>
</template>

<script setup>
import {
	Badge,
	Button,
	Select,
	SettingsBody,
	SettingsContent,
	SettingsDialog,
	SettingsHeader,
	SettingsNavItem,
	SettingsPanel,
	SettingsRow,
	SettingsSidebar,
	Switch,
	TextInput,
	Tooltip,
	toast,
} from 'frappe-ui';
import { computed, reactive, watch } from 'vue';
import { spaceById } from './data';
import { ui } from './state';

const props = defineProps({
	spaceId: { type: String, required: true },
});

const open = defineModel('open', { type: Boolean, default: false });

const navTabs = [
	{ label: 'General', value: 'general', icon: 'lucide-settings' },
	{ label: 'Navigation', value: 'navigation', icon: 'lucide-list-tree' },
	{ label: 'Access', value: 'access', icon: 'lucide-lock' },
	{ label: 'Git sync', value: 'git-sync', icon: 'lucide-folder-git-2' },
];

const permissionOptions = [
	{ label: 'Read', value: 'Read' },
	{ label: 'Write', value: 'Write' },
];

const space = computed(() => spaceById(props.spaceId));

const form = reactive({
	name: '',
	route: '',
	isPublished: true,
	showInSwitcher: true,
	switcherOrder: 1,
	roles: [],
	acceptContributions: true,
	feedback: false,
});

// The dialog edits a draft so Cancel-by-dismiss leaves the stub data alone.
// `roles` is cloned per row, otherwise the Select would write straight through.
watch(
	space,
	(value) => {
		form.name = value?.name || '';
		form.route = value?.route || '';
		form.isPublished = value?.isPublished ?? true;
		form.showInSwitcher = value?.showInSwitcher ?? true;
		form.switcherOrder = value?.switcherOrder ?? 1;
		form.roles = (value?.roles || []).map((r) => ({ ...r }));
		form.acceptContributions = value?.acceptContributions ?? true;
		form.feedback = value?.feedback ?? false;
	},
	{ immediate: true },
);

function addRole() {
	form.roles.push({ role: '', permission: 'Read' });
}

function save() {
	if (space.value) {
		Object.assign(space.value, {
			...form,
			roles: form.roles.map((r) => ({ ...r })),
		});
	}
	toast.success('Space settings saved');
}

function syncNow() {
	toast.success('Sync queued');
}
</script>
