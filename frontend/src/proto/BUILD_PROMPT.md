# Build prompt: Frappe Wiki IA prototype

Paste everything below into an agent.

---

Build a throwaway information-architecture prototype for the Frappe Wiki content
editor. Put it on a dedicated `/wiki-proto` route. Use stub data only. Make no
backend calls.

## Context

- App: `apps/wiki` in a Frappe bench. Frontend is `frontend/` (Vue 3, Vite,
  Tailwind v3, frappe-ui).
- The SPA base path is `/wiki-app`. So the prototype URL is
  `http://wiki.localhost:8080/wiki-app/wiki-proto`.
- The Vite dev server runs on port 8080 behind the Frappe proxy. It restarts by
  itself when `vite.config.js` changes.
- frappe-ui is `1.0.0-beta.55`. Load the `frappe-ui` skill before you style
  anything. Use design tokens. Never invent a spacing, radius, or colour value.
- Put every new file in `frontend/src/proto/`. Touch nothing else except the two
  files named in "Wiring" and the one config fix in "Landmines".

## The question the prototype answers

The sidebar is unused today. Space navigation lives inside the page. Show
whether spaces belong in the sidebar instead.

The answer to build: **yes, a drill-in sidebar.**

- Top level: the sidebar lists the spaces.
- Enter a space: the same sidebar becomes that space, showing its page tree.
- There is only ever one navigation column, so content keeps full width.

Do not build alternative layouts. Do not build a variant switcher.

## Information architecture

Mirror the real doctypes so the prototype can be lifted onto the API later.

**Wiki Space.** Owns a route prefix. Every page under it is prefixed by it, for
example `/framework/...`. Spaces are how one wiki hosts several documentations
side by side, such as public docs in one space and private docs in another.

Fields that matter: `name`, `route`, icon, logo, `isPublished`, access,
`showInSwitcher`, `switcherOrder`, git sync settings.

**Access and publish are two independent fields.** Access is derived from a
roles child table: no roles means public, any role means restricted.
`isPublished` is separate. Never merge them into one badge. A restricted space
that is also unpublished is the case that matters most, and one badge hides it.

**Wiki Document.** A tree per space. A node is one of three types:

- `group`: a folder, expandable, holds children
- `page`: opens in the editor
- `link`: an external URL, opens in a new tab

Public URL is `<space.route>/<ancestor slugs>/<own slug>`.

**Wiki Change Request.** The only write path. Nothing writes to a live document.
A space has at most one open draft. Statuses and their Badge themes:

```
Draft: gray, In Review: amber, Changes Requested: red,
Approved: green, Merged: blue, Rejected: red
```

`Badge` has no `orange` theme. Use `amber`.

**Git sync.** Per space, one way, repo to wiki. A git-synced space is read-only
in the editor. Show the repo, branch, docs folder, last sync status, and last
synced time. Replace Save with "Edit on GitHub" plus a "Read-only" badge. Hide
"New page". Disable tree drag.

**No tabs.** Do not build tabbed navigation inside a space. The tree is the only
level of grouping.

## Routes

Add these as children of a `/wiki-proto` parent route rendering `ProtoApp.vue`.
Set `meta: { proto: true }` on the parent.

```
''                              -> ProtoHome
'change-requests'               -> ProtoChangeRequests
'space/:spaceId'                -> ProtoSpace          (props: true)
'space/:spaceId/page/:pageKey'  -> ProtoSpace          (props: true)
```

## Files to create in `frontend/src/proto/`

### `data.js`

Stub data. No resources, no fetch. Export:

- `spaces`: 4 spaces. Give each a distinct state so every affordance is visible.
  - `framework` (Frappe Framework, `/framework`): public, published, git-synced,
    repo `frappe/frappe_docs`, branch `main`, last sync Success 2 hours ago.
  - `erpnext` (ERPNext, `/erpnext`): public, published, has an open Draft change
    request with 6 pages changed.
  - `handbook` (Company Handbook, `/handbook`): restricted (2 roles), published,
    has an In Review change request.
  - `runbooks` (Internal Runbooks, `/runbooks`): restricted, **unpublished**.
- `trees`: one node array per space. Use `group` / `page` / `link` helpers. Give
  some groups `expanded: false`. Mark one page `dirty: true` and one page
  `isPublished: false` so those tree states render. Give the framework tree a
  `link` node ("Source on GitHub").
- `pages`: a flat map keyed by page key. Each holds `title`, `slug`, `route`,
  `isPublished`, `metaTitle`, `metaDescription`, `metaImage`, `updatedBy`,
  `updatedAt`, `content` (an HTML string).
- `changeRequests`: 4 requests across the spaces, one of them Merged.
- `crStatusTheme`: the status-to-theme map above.
- Helpers: `spaceById`, `flattenTree`, `findNode`, `firstPageOf`, `ancestorsOf`.

Body content should be plain HTML with `<p>`, `<h2>`, `<ul>`, inline `<code>`,
and `<blockquote>`. Do not start it with an `<h1>`, because the title is a
separate input. Do not include a `<pre><code>` block.

### `state.js`

Module-scoped reactive UI state, so no prop drilling.

```js
export const ui = reactive({
  showSpaceSettings: false,
  showPageSettings: false,
  spaceSettingsTab: 'general',
});
export function openSpaceSettings(tab = 'general') { ... }
export function togglePageSettings() { ... }
```

### `ProtoApp.vue`

The shell. A flex row, `h-screen`, `overflow-hidden`.

- `SpaceSidebar` when `route.params.spaceId` is set, else `LibrarySidebar`.
- Key the space sidebar by `spaceId`.
- `<main>` holds `<router-view />`, with `border-l` and `bg-surface-base`.
- Mount `SpaceSettingsDialog` once here, bound to `ui.showSpaceSettings`.
- Set the page title with `usePageMeta`.

### `LibrarySidebar.vue`

Level 0. Use frappe-ui `Sidebar`, width `260px`.

- `SidebarHeader` with title, subtitle, logo, and a menu.
- `SidebarItem` rows for Search and Change Requests. Put the open change-request
  count in the Change Requests `suffix`. Exclude Merged from that count.
- A `SidebarSection label="Spaces" collapsible` listing the spaces, ordered by
  `switcherOrder`.
- Each space row: a coloured icon tile in `#prefix`. In `#suffix`, up to three
  separate tooltipped icons: git-synced, restricted, unpublished. Keep them
  separate, per the IA rule above.
- Footer: "New space" button plus `SidebarCollapseToggle`.

### `SpaceSidebar.vue`

Level 1. The proposal under test. Same `Sidebar`, width `260px`.

Top to bottom:

1. **Header row.** A back button to the library, the space icon tile, the space
   name, and a space-actions `Dropdown` (Space settings, View live site, Switch
   space, and Sync now when git-synced).
2. **Mode strip.** This is the load-bearing part. Git-synced and open-draft are
   mutually exclusive states, and the sidebar must say which one you are in
   before you click anything.
   - Git-synced: repo and branch, a sync-status badge, a "Sync now" button, and
     a "Read-only, last synced X" line.
   - Open draft: the draft title, "N pages changed", and Submit and Discard
     buttons.
3. **Search input.** Filters the tree in place.
4. **The tree.** `ProtoTree`, in a `min-h-0 flex-1 overflow-y-auto` region.
5. **Footer.** "New page" (hidden when git-synced) plus `SidebarCollapseToggle`.

### `ProtoTree.vue`

The document tree for one space. It owns no chrome. The caller supplies the
scroll region, the padding, and the filter string.

Props: `spaceId`, `pageKey`, `readonly`, `filter`.

- Use the frappe-ui `Tree` with `guides="lines"` and
  `style="--tree-row-height: 28px"`. Set `:draggable="!readonly"`.
- Override the `#item` slot fully, so a page row can be a real `RouterLink`. The
  expand chevron must stay a sibling of that link, never a child.
- Row per type: page gets a file icon and a router link, link gets an
  external-link icon and an `<a target="_blank">`, group gets a folder icon that
  changes on expand.
- Trailing zone, always occupying its width so no row reflows on hover:
  unpublished eye-off icon, a small dot for `dirty`, and a hover-only "add page"
  button on groups (hidden when readonly).
- **When `filter` is set, replace the tree with a flat result list.** A filtered
  hierarchy hides matches behind collapsed parents. Show an empty state when
  nothing matches.
- Selected row: `bg-surface-gray-3`. Unpublished label dims to `text-ink-gray-4`
  and that wins over selection, because the background already carries selection.

### `ProtoHome.vue`

The space library. A 12-unit header with "Spaces" and a "New space" button, then
a responsive 2-column grid of space cards. Each card shows the icon tile, name,
route prefix in mono, the same three state icons, page count, access, and either
the draft status badge or the last sync time.

### `ProtoSpace.vue`

Thin. Renders "No such space" or `PageContent`.

### `PageContent.vue`

The editor column.

- A 12-unit header row: `Breadcrumbs` on the left. On the right: last-edited
  text, a "View live page" button, a **Page settings toggle**, then either the
  git-synced pair (Edit on GitHub, Read-only badge) or Save plus a "More
  actions" dropdown.
- The page settings toggle is `icon="lucide-panel-right"`. It must read as
  pressed while the panel is open: `:variant="ui.showPageSettings ? 'subtle' : 'ghost'"`.
  Do not bury page settings in the overflow menu only.
- Body: a max-width column holding a borderless title input and the editor.
- Right panel: `PageSettingsPanel` in a `w-[352px] shrink-0 border-l` column,
  shown when `ui.showPageSettings` and a page is open.
- When no page is selected, show an empty state instead of the editor.
- Keep a local `reactive` draft of title and content. Reset it in a
  `watch(() => props.pageKey, ..., { immediate: true })`.
- Breadcrumbs come from `ancestorsOf`. The last crumb tracks the unsaved title.

Editor block, exactly this shape:

```vue
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
```

```js
import { Editor, EditorContent, RichTextKit } from 'frappe-ui/editor';
const extensions = [RichTextKit];
```

### `PageSettingsPanel.vue`

A panel only. No dialog variant.

- Header row with the title and a close button that sets `ui.showPageSettings = false`.
- Scrollable body in two labelled sections.
  - General: Title, Slug, Route (with the resolved public URL as its
    `description`), and a Published switch.
  - Social preview: Meta title, Meta description textarea, and a dashed
    1200x630 upload target.
- Footer with a full-width Save that fires a toast.

### `SpaceSettingsDialog.vue`

Use the frappe-ui `SettingsDialog` family with
`v-model:tab="ui.spaceSettingsTab"`. Four tabs:

- **General**: Space name, Route prefix (description "Pages live under
  /<route>/..."), Space logo with Upload and Remove, Published switch.
- **Navigation**: Show in space switcher, Order.
- **Access**: public or restricted, the roles table with Read and Write, Accept
  contributions, Collect feedback.
- **Git sync**: Repository, Branch, Docs folder, Last sync status and commit.

Each page gets a `SettingsHeader` with a Save button.

### `ProtoChangeRequests.vue`

A header with Open, Merged, All filter buttons. Then a list. Each row: title,
then `CR-id · Space · N pages · Author · when`, with the status badge on the
right. Show an empty state when the filter matches nothing.

## Wiring (the only files outside `src/proto/`)

**`src/router.js`.** Add the route block. Then bypass the auth guard at the top
of `router.beforeEach`, because the prototype runs on stub data and must not
need a session:

```js
if (to.meta.proto) return next();
```

**`src/App.vue`.** Bypass the app's `MainLayout` for proto routes:

```js
const route = useRoute();
const isProto = computed(
  () => Boolean(route.meta.proto) ||
        window.location.pathname.startsWith('/wiki-app/wiki-proto'),
);
```

```vue
<router-view v-if="isProto" />
<MainLayout v-else><router-view /></MainLayout>
```

The `window.location` half is required. See the landmine below.

## Landmines. Read these before you write code.

1. **`useRoute()` is `START_LOCATION` on the first render.** `route.meta.proto`
   is undefined at that point, so `MainLayout` mounts for one tick. That tick is
   long enough for its `WikiSettings` child to fire an auto document resource,
   which 403s on the prototype route. The URL is already correct, so test
   `window.location.pathname` as well. This is why `isProto` has two halves.

2. **Two `prosemirror-view` instances crash the editor.** On first mount you get:

   ```
   TypeError: Cannot read properties of undefined (reading 'localsInner')
     at DecorationGroup.locals -> iterDeco -> docViewDesc -> EditorView.updateStateInner
   ```

   The throw escapes Vue's post-flush queue and wedges the scheduler. After
   that, no component update runs on that screen. State changes and the DOM
   never follows, so every toggle looks dead. It is not a layout bug.

   Cause: `optimizeDeps.exclude: ['frappe-ui', ...]` makes frappe-ui resolve its
   own copy while `@tiptap/*` uses the pre-bundled one. `DecorationSet` from one
   is not `instanceof` the other, so `DecorationGroup.from` reads `.members` off
   a foreign set, gets `undefined`, and appends it.

   Fix, in `frontend/vite.config.js`, inside `optimizeDeps.include`. Add all 13,
   not just the ones that throw. `prosemirror-tables` claims the `cell`
   selection JSON ID and fails differently when duplicated:

   ```
   prosemirror-changeset, prosemirror-commands, prosemirror-dropcursor,
   prosemirror-gapcursor, prosemirror-history, prosemirror-inputrules,
   prosemirror-keymap, prosemirror-model, prosemirror-schema-list,
   prosemirror-state, prosemirror-tables, prosemirror-transform,
   prosemirror-view
   ```

   This is dev-server only. Production builds resolve once and were never
   affected. Leave a comment saying so.

3. **`<Editor>` is renderless.** It owns the lifecycle and `v-model` and renders
   nothing. You must render `<EditorContent :editor="editor" />` in its default
   slot, or the body stays blank.

4. **`RichTextKit` is a Tiptap `Extension` object, not a factory.** Write
   `[RichTextKit]`. `RichTextKit()` throws and the whole route renders blank.

5. **Retired tokens in beta.55.** `surface-white` is gone. `surface-white` maps
   to `surface-base`, `surface-modal` to `surface-elevation-2`, and
   `surface-menu-bar` to `surface-sidebar`. The preset also replaces
   `borderRadius` with a numeric scale and has no DEFAULT key, so bare `rounded`
   and `rounded-lg` produce nothing. Use `rounded-2`, `rounded-4`, `rounded-6`.
   `size-4.5` is not a class either.

6. **lucide-static dropped brand icons.** `lucide-github` renders nothing. Use
   `lucide-folder-git-2`.

7. **Tailwind's forms reset styles `[type="text"]`.** The borderless title input
   needs an explicit `border-0 p-0`, or it renders as a boxed field.

8. **A segmented control does not fit a 260px sidebar.** Four labels truncate to
   two characters each. If you ever need one there, use a full-width dropdown
   naming the active item instead.

9. **`Dropdown` takes `side` and `align`.** There is no `placement` prop.

## Verify before you report done

Run all of this. Do not report success on anything you did not run.

- `yarn build` passes.
- The browser console is clean on every screen. No Vue warnings, no uncaught
  errors. A `localsInner` error means landmine 2 is not fixed.
- The prototype fetches no wiki data. Only the `main.js` bootstrap calls
  (translations, socket) should appear in the network panel.
- Walk every screen: library, a space with a draft, the git-synced space, a page
  in the editor, the page settings panel, all four space settings tabs, and
  change requests.
- Toggle the page settings panel open and closed. If it does not move, you have
  a wedged scheduler, not a CSS problem.
- Type in the editor and confirm the text lands.
- `git status` shows only `src/proto/`, `src/router.js`, `src/App.vue`, and
  `vite.config.js`.

## Rules

- Branch before you start. Never commit on `develop` or `main`.
- Comments explain why, not how.
- Close your report with one line on what you did not do.
