// Shared UI state for the prototype. Deliberately module-scoped and reactive
// so any component can read or flip it without prop drilling.
import { reactive } from 'vue';

// Transient UI state: the two overlays the prototype can open.
export const ui = reactive({
	showSpaceSettings: false,
	showPageSettings: false,
	spaceSettingsTab: 'general',
});

export function openSpaceSettings(tab = 'general') {
	ui.spaceSettingsTab = tab;
	ui.showSpaceSettings = true;
}

export function togglePageSettings() {
	ui.showPageSettings = !ui.showPageSettings;
}
