# Hack Club Search

A Brave Search API proxy for Hack Club members.

## Features

- Web search with news, videos, discussions, and more
- Image search
- Request logging and usage statistics
- OAuth authentication via Hack Club

## Setup

1. Clone the repository
2. Install dependencies: `bun install`
3. Copy `.env.example` to `.env` and fill in the values
4. Run database migrations: `bun run db:push`
5. Start the development server: `bun run dev`

## Environment Variables

```env
DATABASE_URL=postgresql://...
BASE_URL=http://localhost:3000
PORT=3000

HACK_CLUB_CLIENT_ID=...
HACK_CLUB_CLIENT_SECRET=...

BRAVE_SEARCH_API_KEY=...

NODE_ENV=development
ENFORCE_IDV=false
```

## API Endpoints

- `GET /proxy/v1/web/search?q=...` - Web search
- `GET /proxy/v1/images/search?q=...` - Image search
- `GET /proxy/v1/stats` - Usage statistics
- `GET /proxy/v1/openapi.json` - OpenAPI specification

## Development

```bash
bun run dev      # Start dev server
bun run typecheck # Run TypeScript checks
bun run lint     # Run linter
```

## License

MIT
