// Stub data for the /wiki-proto IA prototype. No backend, no resources.
// Shapes mirror the real doctypes so the prototype can be lifted onto the API
// later: Wiki Space, Wiki Document (tree of group | page | external link),
// Wiki Change Request.

// --- helpers ---------------------------------------------------------------

const group = (key, label, children, extra = {}) => ({
	key,
	label,
	type: 'group',
	isPublished: true,
	expanded: true,
	children,
	...extra,
});

const page = (key, label, extra = {}) => ({
	key,
	label,
	type: 'page',
	isPublished: true,
	...extra,
});

const link = (key, label, url) => ({
	key,
	label,
	type: 'link',
	url,
	isPublished: true,
});

// --- spaces ----------------------------------------------------------------
// `access` is derived in the real model: no roles => 'public', else 'restricted'.
// `isPublished` is independent of access. Both drive the sidebar state dot.

export const spaces = [
	{
		id: 'framework',
		name: 'Frappe Framework',
		route: 'framework',
		icon: 'lucide-box',
		colour: 'blue',
		isPublished: true,
		access: 'public',
		roles: [],
		gitSynced: true,
		repo: 'frappe/frappe_docs',
		branch: 'main',
		docsSubdir: 'docs',
		lastSyncStatus: 'Success',
		lastSyncedAt: '2 hours ago',
		lastSyncedCommit: 'a3f19c2',
		feedback: true,
		showInSwitcher: true,
		switcherOrder: 1,
		pageCount: 148,
		draft: null,
	},
	{
		id: 'erpnext',
		name: 'ERPNext',
		route: 'erpnext',
		icon: 'lucide-building-2',
		colour: 'green',
		isPublished: true,
		access: 'public',
		roles: [],
		gitSynced: false,
		feedback: true,
		showInSwitcher: true,
		switcherOrder: 2,
		pageCount: 412,
		draft: {
			id: 'CR-0231',
			title: 'Rewrite the stock reconciliation guide',
			status: 'Draft',
			changed: 6,
		},
	},
	{
		id: 'handbook',
		name: 'Company Handbook',
		route: 'handbook',
		icon: 'lucide-notebook-pen',
		colour: 'orange',
		isPublished: true,
		access: 'restricted',
		roles: [
			{ role: 'Wiki Approver', permission: 'Write' },
			{ role: 'Employee', permission: 'Read' },
		],
		gitSynced: false,
		feedback: false,
		showInSwitcher: false,
		switcherOrder: 3,
		pageCount: 37,
		draft: {
			id: 'CR-0233',
			title: 'Add the 2026 leave policy',
			status: 'In Review',
			changed: 2,
		},
	},
	{
		id: 'runbooks',
		name: 'Internal Runbooks',
		route: 'runbooks',
		icon: 'lucide-siren',
		colour: 'red',
		isPublished: false,
		access: 'restricted',
		roles: [{ role: 'System Manager', permission: 'Write' }],
		gitSynced: false,
		feedback: false,
		showInSwitcher: false,
		switcherOrder: 4,
		pageCount: 12,
		draft: null,
	},
];

export const spaceById = (id) => spaces.find((s) => s.id === id) || null;

// --- document trees --------------------------------------------------------

export const trees = {
	framework: [
		group('fw-start', 'Getting Started', [
			page('fw-install', 'Installation'),
			page('fw-tutorial', 'Tutorial'),
			page('fw-bench', 'Bench CLI'),
		]),
		group('fw-model', 'Data Model', [
			page('fw-doctype', 'DocType'),
			page('fw-fields', 'Field Types'),
			page('fw-naming', 'Naming'),
			page('fw-child', 'Child Tables'),
		]),
		group(
			'fw-api',
			'API',
			[
				page('fw-rest', 'REST API'),
				page('fw-python', 'Python API'),
				page('fw-js', 'JavaScript API'),
			],
			{ expanded: false },
		),
		link('fw-gh', 'Source on GitHub', 'https://github.com/frappe/frappe'),
	],
	erpnext: [
		group('erp-intro', 'Introduction', [
			page('erp-what', 'What is ERPNext'),
			page('erp-setup', 'Setup Wizard'),
		]),
		group('erp-stock', 'Stock', [
			page('erp-item', 'Item'),
			page('erp-warehouse', 'Warehouse'),
			page('erp-recon', 'Stock Reconciliation', { dirty: true }),
			page('erp-valuation', 'Valuation Methods', { isPublished: false }),
		]),
		group(
			'erp-acc',
			'Accounting',
			[page('erp-coa', 'Chart of Accounts'), page('erp-je', 'Journal Entry')],
			{ expanded: false },
		),
	],
	handbook: [
		group('hb-people', 'People', [
			page('hb-onboarding', 'Onboarding'),
			page('hb-leave', 'Leave Policy', { dirty: true }),
			page('hb-expenses', 'Expenses'),
		]),
		group('hb-eng', 'Engineering', [
			page('hb-review', 'Code Review'),
			page('hb-oncall', 'On-call'),
		]),
		page('hb-values', 'Our Values'),
	],
	runbooks: [
		group('rb-inc', 'Incidents', [
			page('rb-sev1', 'Sev-1 Playbook'),
			page('rb-postmortem', 'Postmortem Template'),
		]),
		page('rb-access', 'Access Requests', { isPublished: false }),
	],
};

// --- pages -----------------------------------------------------------------

const body = (title, lead) => `
<p>${lead}</p>
<h2>Before you start</h2>
<p>This page is stub content for the information-architecture prototype. Nothing here is saved, and no request reaches the server.</p>
<ul><li>The tree on the left is the Wiki Document tree.</li><li>The header row above owns page actions.</li><li>Page settings are meta fields on the same document.</li></ul>
<h2>Example</h2>
<p>Run <code>bench --site wiki.localhost migrate</code> after changing a DocType.</p>
<blockquote><p>Every edit here goes through a change request. Nothing writes to a live document.</p></blockquote>
<p>Open <strong>Page settings</strong> in the header to edit the route and the social preview.</p>
`;

const mkPage = (key, title, spaceId, route, extra = {}) => ({
	key,
	title,
	spaceId,
	slug: route.split('/').pop(),
	route,
	isPublished: true,
	metaTitle: '',
	metaDescription: '',
	metaImage: null,
	updatedBy: 'Faris Ansari',
	updatedAt: '3 days ago',
	content: body(title, extra.lead || `Reference for ${title}.`),
	...extra,
});

export const pages = {
	'fw-install': mkPage('fw-install', 'Installation', 'framework', 'framework/getting-started/installation', { lead: 'Install a Frappe bench on macOS, Linux, or in a container.' }),
	'fw-tutorial': mkPage('fw-tutorial', 'Tutorial', 'framework', 'framework/getting-started/tutorial'),
	'fw-bench': mkPage('fw-bench', 'Bench CLI', 'framework', 'framework/getting-started/bench-cli'),
	'fw-doctype': mkPage('fw-doctype', 'DocType', 'framework', 'framework/data-model/doctype', { lead: 'A DocType is both a schema and a controller.' }),
	'fw-fields': mkPage('fw-fields', 'Field Types', 'framework', 'framework/data-model/field-types'),
	'fw-naming': mkPage('fw-naming', 'Naming', 'framework', 'framework/data-model/naming'),
	'fw-child': mkPage('fw-child', 'Child Tables', 'framework', 'framework/data-model/child-tables'),
	'fw-rest': mkPage('fw-rest', 'REST API', 'framework', 'framework/api/rest'),
	'fw-python': mkPage('fw-python', 'Python API', 'framework', 'framework/api/python'),
	'fw-js': mkPage('fw-js', 'JavaScript API', 'framework', 'framework/api/javascript'),

	'erp-what': mkPage('erp-what', 'What is ERPNext', 'erpnext', 'erpnext/introduction/what-is-erpnext'),
	'erp-setup': mkPage('erp-setup', 'Setup Wizard', 'erpnext', 'erpnext/introduction/setup-wizard'),
	'erp-item': mkPage('erp-item', 'Item', 'erpnext', 'erpnext/stock/item'),
	'erp-warehouse': mkPage('erp-warehouse', 'Warehouse', 'erpnext', 'erpnext/stock/warehouse'),
	'erp-recon': mkPage('erp-recon', 'Stock Reconciliation', 'erpnext', 'erpnext/stock/stock-reconciliation', { dirty: true, updatedAt: 'just now', lead: 'Correct stock quantity and valuation without a transaction.' }),
	'erp-valuation': mkPage('erp-valuation', 'Valuation Methods', 'erpnext', 'erpnext/stock/valuation-methods', { isPublished: false }),
	'erp-coa': mkPage('erp-coa', 'Chart of Accounts', 'erpnext', 'erpnext/accounting/chart-of-accounts'),
	'erp-je': mkPage('erp-je', 'Journal Entry', 'erpnext', 'erpnext/accounting/journal-entry'),

	'hb-onboarding': mkPage('hb-onboarding', 'Onboarding', 'handbook', 'handbook/people/onboarding'),
	'hb-leave': mkPage('hb-leave', 'Leave Policy', 'handbook', 'handbook/people/leave-policy', { dirty: true, updatedAt: 'just now' }),
	'hb-expenses': mkPage('hb-expenses', 'Expenses', 'handbook', 'handbook/people/expenses'),
	'hb-review': mkPage('hb-review', 'Code Review', 'handbook', 'handbook/engineering/code-review'),
	'hb-oncall': mkPage('hb-oncall', 'On-call', 'handbook', 'handbook/engineering/on-call'),
	'hb-values': mkPage('hb-values', 'Our Values', 'handbook', 'handbook/our-values'),

	'rb-sev1': mkPage('rb-sev1', 'Sev-1 Playbook', 'runbooks', 'runbooks/incidents/sev-1-playbook'),
	'rb-postmortem': mkPage('rb-postmortem', 'Postmortem Template', 'runbooks', 'runbooks/incidents/postmortem-template'),
	'rb-access': mkPage('rb-access', 'Access Requests', 'runbooks', 'runbooks/access-requests', { isPublished: false }),
};

// --- change requests -------------------------------------------------------

export const changeRequests = [
	{ id: 'CR-0233', title: 'Add the 2026 leave policy', spaceId: 'handbook', status: 'In Review', author: 'Faris Ansari', updatedAt: '20 minutes ago', changed: 2 },
	{ id: 'CR-0231', title: 'Rewrite the stock reconciliation guide', spaceId: 'erpnext', status: 'Draft', author: 'Faris Ansari', updatedAt: '1 hour ago', changed: 6 },
	{ id: 'CR-0229', title: 'Fix broken links in the API section', spaceId: 'framework', status: 'Changes Requested', author: 'Aditya Duggal', updatedAt: 'yesterday', changed: 11 },
	{ id: 'CR-0224', title: 'Document the new naming series', spaceId: 'framework', status: 'Merged', author: 'Shariq Ansari', updatedAt: '3 days ago', changed: 4 },
];

export const crStatusTheme = {
	Draft: 'gray',
	'In Review': 'amber',
	'Changes Requested': 'red',
	Approved: 'green',
	Merged: 'blue',
	Rejected: 'red',
};

// --- tree utilities --------------------------------------------------------

export function flattenTree(nodes, out = []) {
	for (const n of nodes || []) {
		out.push(n);
		if (n.children) flattenTree(n.children, out);
	}
	return out;
}

export function findNode(spaceId, key) {
	return flattenTree(trees[spaceId] || []).find((n) => n.key === key) || null;
}

export function firstPageOf(spaceId) {
	return flattenTree(trees[spaceId] || []).find((n) => n.type === 'page') || null;
}

export function ancestorsOf(spaceId, key) {
	const path = [];
	const walk = (nodes, trail) => {
		for (const n of nodes || []) {
			const next = [...trail, n];
			if (n.key === key) {
				path.push(...next);
				return true;
			}
			if (n.children && walk(n.children, next)) return true;
		}
		return false;
	};
	walk(trees[spaceId] || [], []);
	return path;
}
