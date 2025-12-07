# Hack Club Search API

A Brave Search API proxy for Hack Club members. Get web and image search results through a simple, authenticated API.

## Quick Start

```bash
curl "{{BASE_URL}}/proxy/v1/web/search?q=hack+club" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Authentication

All API requests require a Bearer token. Get your API key from the [dashboard]({{BASE_URL}}/dashboard).

```
Authorization: Bearer sk-hc-v1-...
```

## Endpoints

### Web Search

Search the web for pages, news, videos, discussions, and more.

```
GET /proxy/v1/web/search
```

#### Parameters

| Parameter | Required | Type | Default | Description |
|-----------|----------|------|---------|-------------|
| `q` | Yes | string | - | Search query (max 400 chars, 50 words) |
| `country` | No | string | `US` | Country code for results |
| `search_lang` | No | string | `en` | Search language |
| `count` | No | int | `20` | Number of results (max 20) |
| `offset` | No | int | `0` | Pagination offset (max 9) |
| `safesearch` | No | string | `moderate` | `off`, `moderate`, or `strict` |
| `freshness` | No | string | - | `pd` (24h), `pw` (7d), `pm` (31d), `py` (365d) |
| `extra_snippets` | No | bool | `false` | Get up to 5 extra snippets per result |

#### Example Request

```bash
curl "{{BASE_URL}}/proxy/v1/web/search?q=raspberry+pi+projects&count=10&safesearch=strict" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Example Response

```json
{
  "type": "search",
  "query": {
    "original": "raspberry pi projects"
  },
  "web": {
    "type": "search",
    "results": [
      {
        "title": "50 Cool Raspberry Pi Projects",
        "url": "https://example.com/raspberry-pi-projects",
        "description": "Discover amazing projects you can build...",
        "age": "2 days ago"
      }
    ]
  }
}
```

### Image Search

Search for images across the web.

```
GET /proxy/v1/images/search
```

#### Parameters

| Parameter | Required | Type | Default | Description |
|-----------|----------|------|---------|-------------|
| `q` | Yes | string | - | Search query (max 400 chars, 50 words) |
| `country` | No | string | `US` | Country code for results |
| `search_lang` | No | string | `en` | Search language |
| `count` | No | int | `50` | Number of results (max 200) |
| `safesearch` | No | string | `strict` | `off` or `strict` |

#### Example Request

```bash
curl "{{BASE_URL}}/proxy/v1/images/search?q=circuit+board&count=20" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Example Response

```json
{
  "type": "images",
  "query": {
    "original": "circuit board"
  },
  "results": [
    {
      "title": "Circuit Board Close-up",
      "url": "https://example.com/image.jpg",
      "source": "example.com",
      "thumbnail": {
        "src": "https://imgs.search.brave.com/...",
        "width": 200,
        "height": 150
      },
      "properties": {
        "url": "https://example.com/full-image.jpg",
        "width": 1920,
        "height": 1080
      }
    }
  ]
}
```

### Usage Statistics

Get your API usage statistics.

```
GET /proxy/v1/stats
```

#### Example Response

```json
{
  "totalRequests": 1234
}
```

## Rate Limits

- 100 requests per 30 minutes per user
- Maximum query length: 400 characters

## Error Responses

```json
{
  "error": "Authentication required"
}
```

| Status | Description |
|--------|-------------|
| 400 | Bad request (missing or invalid query) |
| 401 | Authentication required or failed |
| 403 | Banned or identity verification required |
| 413 | Request too large |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

## Code Examples

### JavaScript

```javascript
const response = await fetch(
  'https://search.hackclub.com/proxy/v1/web/search?q=hack+club',
  {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  }
);
const data = await response.json();
console.log(data.web.results);
```

### Python

```python
import requests

response = requests.get(
    'https://search.hackclub.com/proxy/v1/web/search',
    params={'q': 'hack club'},
    headers={'Authorization': 'Bearer YOUR_API_KEY'}
)
data = response.json()
print(data['web']['results'])
```

## Support

Questions or issues? Reach out on the [Hack Club Slack](https://hackclub.com/slack) in #hackclub-search.
