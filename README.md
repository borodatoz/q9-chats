# @q9/chats

Public repo: [github.com/borodatoz/q9-chats](https://github.com/borodatoz/q9-chats)

Embeddable web chat widget for Q9 Admin Panel (`communication.*` module).

## Packages

| Package | Description |
|---------|-------------|
| `@q9/chats-core` | Types, API client (via site BFF) |
| `@q9/chats-widget` | React bubble + thread UI |
| `@q9/chats-loader` | Script-tag bootstrap for non-React sites |

## Architecture

```
Browser widget  →  Client BFF (/api/q9-chat)  →  Q9 Admin invoke + API key
```

**Never** put `q9_live_…` in the browser. See `docs/product/architecture/modules/chats/integrations/web-widget.md` in the admin repo.

## Quick start (Next.js)

```bash
pnpm install
pnpm dev:example
```

Set env in `examples/next-bff/.env.local`:

```env
Q9_ADMIN_URL=https://admin.example.com
Q9_CHAT_API_KEY=q9_live_...
```

## Install on client site

```bash
pnpm add @q9/chats-widget @q9/chats-core
```

```tsx
import { Q9ChatWidget } from "@q9/chats-widget";
import "@q9/chats-widget/styles.css";

<Q9ChatWidget
  apiBase="/api/q9-chat"
  title="Support"
  locale="en"
  welcomeMessage="Hello! How can we help?"
  faqItems={[{ question: "Hours?", answer: "Mon–Fri 9–18" }]}
/>
```

### Widget features

- Operator typing indicator (poll + admin composer hook)
- Offline mode + FAQ when no operators online
- Unread badge on launcher bubble
- Mobile fullscreen layout, ru/en i18n

Implement BFF route — see `examples/next-bff/app/api/q9-chat/route.ts`.

Docs (admin repo): `docs/product/user/modules/chats/web-widget.md`

## License

Proprietary — Q9
