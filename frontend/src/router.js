import { createRouter, createWebHistory } from 'vue-router';

const routes = [
	{
		path: '/',
		name: 'Home',
		redirect: '/spaces',
	},
	{
		path: '/spaces',
		name: 'SpaceList',
		component: () => import('@/pages/Spaces.vue'),
	},
	{
		path: '/change-requests',
		name: 'ChangeRequests',
		component: () => import('@/pages/Contributions.vue'),
	},
	{
		path: '/change-requests/:changeRequestId',
		name: 'ChangeRequestReview',
		component: () => import('@/pages/ContributionReview.vue'),
		props: true,
	},
	{
		path: '/contributions',
		redirect: { name: 'ChangeRequests' },
	},
	{
		path: '/contributions/:batchId',
		redirect: (to) => ({
			name: 'ChangeRequestReview',
			params: { changeRequestId: to.params.batchId },
		}),
	},
	{
		path: '/spaces/:spaceId',
		component: () => import('@/pages/SpaceDetails.vue'),
		props: true,
		children: [
			{
				path: '',
				name: 'SpaceDetails',
				component: () => import('@/components/SpaceWelcome.vue'),
			},
			{
				path: 'page/:pageId',
				name: 'SpacePage',
				component: () => import('@/components/WikiDocumentPanel.vue'),
				props: true,
			},
			{
				path: 'draft/:docKey',
				name: 'DraftChangeRequest',
				component: () => import('@/components/DraftContributionPanel.vue'),
				props: true,
			},
			{
				path: 'draft/:contributionId',
				redirect: (to) => ({
					name: 'DraftChangeRequest',
					params: {
						spaceId: to.params.spaceId,
						docKey: to.params.contributionId,
					},
				}),
			},
		],
	},
	// --- /wiki-proto ---------------------------------------------------------
	// Throwaway IA prototype. Stub data only, no backend, no auth guard.
	// Delete this block and src/proto/ to remove it.
	{
		path: '/wiki-proto',
		component: () => import('@/proto/ProtoApp.vue'),
		meta: { proto: true },
		children: [
			{
				path: '',
				name: 'ProtoHome',
				component: () => import('@/proto/ProtoHome.vue'),
			},
			{
				path: 'change-requests',
				name: 'ProtoChangeRequests',
				component: () => import('@/proto/ProtoChangeRequests.vue'),
			},
			{
				path: 'space/:spaceId',
				name: 'ProtoSpace',
				component: () => import('@/proto/ProtoSpace.vue'),
				props: true,
			},
			{
				path: 'space/:spaceId/page/:pageKey',
				name: 'ProtoPage',
				component: () => import('@/proto/ProtoSpace.vue'),
				props: true,
			},
		],
	},
];

// The app's base path. Kept in sync with APP_ROUTE in wiki_document.py (which
// also feeds website_route_rules) and APP_BASE in e2e/helpers/routes.ts.
const router = createRouter({
	history: createWebHistory('/wiki-app'),
	routes,
});

router.beforeEach(async (to, from, next) => {
	// The prototype runs on stub data, so it must not need a session.
	if (to.meta.proto) return next();

	const { useSessionStore } = await import('@/stores/session');
	const { useUserStore } = await import('@/stores/user');
	const sessionStore = useSessionStore();

	const userStore = useUserStore();
	let isLoggedIn = sessionStore.isLoggedIn;
	try {
		if (!userStore.data) {
			await userStore.fetch();
		}
	} catch (error) {
		isLoggedIn = false;
	}

	if (!isLoggedIn) {
		window.location.href = `/login?redirect-to=/wiki-app${encodeURIComponent(
			to.fullPath,
		)}`;
	} else {
		next();
	}
});

export default router;
