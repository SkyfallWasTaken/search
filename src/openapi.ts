import { type } from "arktype";

// Stats schema for user token usage
export const StatsSchema = type({
  totalRequests: type("number.integer").describe(
    "The total number of requests",
  ),
});

// Query parameters for web search (Base AI plan compatible)
export const WebSearchQuerySchema = type({
  q: type("string").describe(
    "The user's search query term. Maximum 400 characters and 50 words.",
  ),
  "country?": type("string").describe(
    "The search query country (2 character code). Default: US",
  ),
  "search_lang?": type("string").describe(
    "The search language preference (2+ character code). Default: en",
  ),
  "ui_lang?": type("string").describe(
    "User interface language preferred in response. Default: en-US",
  ),
  "count?": type("number.integer").describe(
    "Number of search results (max 20). Default: 20",
  ),
  "offset?": type("number.integer").describe(
    "Zero-based offset for pagination (max 9). Default: 0",
  ),
  "safesearch?": type("'off' | 'moderate' | 'strict'").describe(
    "Filter for adult content. Default: moderate",
  ),
  "freshness?": type("string").describe(
    "Filter by discovery time: pd (24h), pw (7d), pm (31d), py (365d), or YYYY-MM-DDtoYYYY-MM-DD",
  ),
  "text_decorations?": type("boolean").describe(
    "Whether to include decoration markers in snippets. Default: true",
  ),
  "spellcheck?": type("boolean").describe(
    "Whether to spellcheck the query. Default: true",
  ),
  "result_filter?": type("string").describe(
    "Comma-delimited result types: discussions, faq, infobox, news, query, summarizer, videos, web, locations",
  ),
  "units?": type("'metric' | 'imperial'").describe(
    "Measurement units. Default: derived from country",
  ),
  "extra_snippets?": type("boolean").describe(
    "Get up to 5 additional snippets per result. Available on Base AI plan.",
  ),
  "summary?": type("boolean").describe(
    "Enable summary key generation for summarizer.",
  ),
});

// Query parameters for image search
export const ImageSearchQuerySchema = type({
  q: type("string").describe(
    "The user's search query term. Maximum 400 characters and 50 words.",
  ),
  "country?": type("string").describe(
    "The search query country (2 character code). Default: US",
  ),
  "search_lang?": type("string").describe(
    "The search language preference (2+ character code). Default: en",
  ),
  "count?": type("number.integer").describe(
    "Number of search results (max 200). Default: 50",
  ),
  "safesearch?": type("'off' | 'strict'").describe(
    "Filter for adult content. Default: strict",
  ),
  "spellcheck?": type("boolean").describe(
    "Whether to spellcheck the query. Default: true",
  ),
});

// MetaUrl shared type
const MetaUrlSchema = type({
  "scheme?": type("string").describe("The protocol scheme extracted from URL"),
  "netloc?": type("string").describe("The network location part of the URL"),
  "hostname?": type("string").describe("The lowercased domain name"),
  "favicon?": type("string").describe("The favicon URL"),
  "path?": type("string").describe("The hierarchical path of the URL"),
});

// Thumbnail shared type
const ThumbnailSchema = type({
  "src?": type("string").describe("The served URL of the thumbnail"),
  "original?": type("string").describe("The original URL of the image"),
  "width?": type("number.integer").describe("Width of the thumbnail"),
  "height?": type("number.integer").describe("Height of the thumbnail"),
});

// Profile type
const ProfileSchema = type({
  "name?": type("string").describe("The name of the profile"),
  "long_name?": type("string").describe("The long name of the profile"),
  "url?": type("string").describe("The profile URL"),
  "img?": type("string").describe("The profile image URL"),
});

// Rating type
const RatingSchema = type({
  "ratingValue?": type("number").describe("The rating value"),
  "bestRating?": type("number").describe("Best rating received"),
  "reviewCount?": type("number.integer").describe("Number of reviews"),
  "profile?": ProfileSchema.describe("The profile associated with the rating"),
  "is_tripadvisor?": type("boolean").describe("Whether from Tripadvisor"),
});

// Search result type
const SearchResultSchema = type({
  "type?": type("string").describe("Result type identifier"),
  "title?": type("string").describe("The title of the web page"),
  "url?": type("string").describe("The URL where the page is served"),
  "description?": type("string").describe("Description of the web page"),
  "age?": type("string").describe("Age of the result"),
  "page_age?": type("string").describe("Date representing page age"),
  "page_fetched?": type("string").describe("When the page was last fetched"),
  "language?": type("string").describe("The main language of the result"),
  "family_friendly?": type("boolean").describe("Whether family friendly"),
  "meta_url?": MetaUrlSchema.describe("Aggregated URL information"),
  "thumbnail?": ThumbnailSchema.describe("Thumbnail of the result"),
  "extra_snippets?": type("string[]").describe("Extra alternate snippets"),
});

// Web search results
const SearchSchema = type({
  "type?": type("string").describe("Always 'search'"),
  "results?": SearchResultSchema.array().describe("List of search results"),
  "family_friendly?": type("boolean").describe("Whether results are family friendly"),
});

// Query info
const QuerySchema = type({
  "original?": type("string").describe("The original query"),
  "show_strict_warning?": type("boolean").describe("Whether more content is available but restricted"),
  "altered?": type("string").describe("The altered query used for search"),
  "safesearch?": type("boolean").describe("Whether safesearch was enabled"),
  "is_navigational?": type("boolean").describe("Whether query is navigational"),
  "is_geolocal?": type("boolean").describe("Whether query has location relevance"),
  "local_decision?": type("string").describe("Whether query is location sensitive"),
  "is_news_breaking?": type("boolean").describe("Whether query has breaking news"),
  "spellcheck_off?": type("boolean").describe("Whether spellchecker was off"),
  "country?": type("string").describe("The country used"),
  "more_results_available?": type("boolean").describe("Whether more results available"),
});

// Discussion result
const DiscussionResultSchema = type({
  "type?": type("string").describe("Always 'discussion'"),
  "data?": type({
    "forum_name?": type("string").describe("Name of the forum"),
    "num_answers?": type("number.integer").describe("Number of answers"),
    "score?": type("string").describe("Score of the post"),
    "title?": type("string").describe("Title of the post"),
    "question?": type("string").describe("Question asked"),
    "top_comment?": type("string").describe("Top-rated comment"),
  }).describe("Forum data"),
});

// Discussions
const DiscussionsSchema = type({
  "type?": type("string").describe("Always 'search'"),
  "results?": DiscussionResultSchema.array().describe("Discussion results"),
  "mutated_by_goggles?": type("boolean").describe("Whether changed by Goggle"),
});

// FAQ
const FAQSchema = type({
  "type?": type("string").describe("Always 'faq'"),
  "results?": type({
    "question?": type("string").describe("The question"),
    "answer?": type("string").describe("The answer"),
    "title?": type("string").describe("Title of the post"),
    "url?": type("string").describe("URL to the post"),
    "meta_url?": MetaUrlSchema.describe("Aggregated URL info"),
  }).array().describe("List of Q&A results"),
});

// News result
const NewsResultSchema = type({
  "type?": type("string").describe("Result type"),
  "title?": type("string").describe("Title of the news"),
  "url?": type("string").describe("URL of the news"),
  "description?": type("string").describe("Description"),
  "age?": type("string").describe("Age of the article"),
  "page_age?": type("string").describe("Date of the article"),
  "meta_url?": MetaUrlSchema.describe("URL info"),
  "source?": type("string").describe("Source of the news"),
  "breaking?": type("boolean").describe("Whether breaking news"),
  "is_live?": type("boolean").describe("Whether currently live"),
  "thumbnail?": ThumbnailSchema.describe("Thumbnail"),
  "extra_snippets?": type("string[]").describe("Extra snippets"),
});

// News
const NewsSchema = type({
  "type?": type("string").describe("Always 'news'"),
  "results?": NewsResultSchema.array().describe("News results"),
  "mutated_by_goggles?": type("boolean").describe("Whether changed by Goggle"),
});

// Video data
const VideoDataSchema = type({
  "duration?": type("string").describe("Duration in HH:MM:SS or MM:SS"),
  "views?": type("string").describe("Number of views"),
  "creator?": type("string").describe("Creator of the video"),
  "publisher?": type("string").describe("Publisher of the video"),
  "thumbnail?": ThumbnailSchema.describe("Video thumbnail"),
  "tags?": type("string[]").describe("Tags"),
  "author?": ProfileSchema.describe("Author profile"),
});

// Video result
const VideoResultSchema = type({
  "type?": type("string").describe("Always 'video_result'"),
  "title?": type("string").describe("Video title"),
  "url?": type("string").describe("Video URL"),
  "description?": type("string").describe("Description"),
  "age?": type("string").describe("Age of the video"),
  "page_age?": type("string").describe("Page age"),
  "video?": VideoDataSchema.describe("Video metadata"),
  "meta_url?": MetaUrlSchema.describe("URL info"),
  "thumbnail?": ThumbnailSchema.describe("Thumbnail"),
});

// Videos
const VideosSchema = type({
  "type?": type("string").describe("Always 'videos'"),
  "results?": VideoResultSchema.array().describe("Video results"),
  "mutated_by_goggles?": type("boolean").describe("Whether changed by Goggle"),
});

// Location result
const LocationResultSchema = type({
  "type?": type("string").describe("Always 'location_result'"),
  "id?": type("string").describe("Temporary ID for extra info retrieval"),
  "title?": type("string").describe("Title"),
  "url?": type("string").describe("URL"),
  "description?": type("string").describe("Description"),
  "provider_url?": type("string").describe("Provider URL"),
  "coordinates?": type("number[]").describe("Lat/long coordinates"),
  "zoom_level?": type("number.integer").describe("Map zoom level"),
  "thumbnail?": ThumbnailSchema.describe("Location thumbnail"),
  "rating?": RatingSchema.describe("Business rating"),
});

// Locations
const LocationsSchema = type({
  "type?": type("string").describe("Always 'locations'"),
  "results?": LocationResultSchema.array().describe("Location results"),
});

// Mixed response (ranking order)
const MixedResponseSchema = type({
  "type?": type("string").describe("Always 'mixed'"),
  "main?": type({
    "type?": type("string").describe("Result type"),
    "index?": type("number.integer").describe("Position index"),
    "all?": type("boolean").describe("Whether to put all results at position"),
  }).array().describe("Main section ranking"),
  "top?": type("unknown[]").describe("Top section ranking"),
  "side?": type("unknown[]").describe("Side section ranking"),
});

// Infobox
const InfoboxSchema = type({
  "type?": type("string").describe("Always 'infobox'"),
  "position?": type("number.integer").describe("Position on page"),
  "label?": type("string").describe("Entity label"),
  "category?": type("string").describe("Category classification"),
  "long_desc?": type("string").describe("Longer description"),
  "thumbnail?": ThumbnailSchema.describe("Entity thumbnail"),
  "attributes?": type("unknown").describe("Entity attributes"),
  "website_url?": type("string").describe("Official website"),
  "ratings?": RatingSchema.array().describe("Entity ratings"),
});

// Graph infobox wrapper
const GraphInfoboxSchema = type({
  "type?": type("string").describe("Always 'graph'"),
  "results?": InfoboxSchema.describe("Infobox results"),
});

// Summarizer
const SummarizerSchema = type({
  "type?": type("string").describe("Always 'summarizer'"),
  "key?": type("string").describe("Key for summarizer API"),
});

// Web Search API Response
export const WebSearchResponseSchema = type({
  "type?": type("string").describe("Always 'search'"),
  "query?": QuerySchema.describe("Query information"),
  "web?": SearchSchema.describe("Web search results"),
  "discussions?": DiscussionsSchema.describe("Discussion results"),
  "faq?": FAQSchema.describe("FAQ results"),
  "news?": NewsSchema.describe("News results"),
  "videos?": VideosSchema.describe("Video results"),
  "locations?": LocationsSchema.describe("Location results"),
  "infobox?": GraphInfoboxSchema.describe("Infobox results"),
  "mixed?": MixedResponseSchema.describe("Ranking order"),
  "summarizer?": SummarizerSchema.describe("Summarizer key"),
});

// Image search result
const ImageResultSchema = type({
  "type?": type("string").describe("Always 'image_result'"),
  "title?": type("string").describe("Image title"),
  "url?": type("string").describe("Page URL where image was found"),
  "source?": type("string").describe("Source domain"),
  "page_fetched?": type("string").describe("When page was last fetched"),
  "thumbnail?": type({
    "src?": type("string").describe("Served URL"),
    "width?": type("number.integer").describe("Width"),
    "height?": type("number.integer").describe("Height"),
  }).describe("Image thumbnail"),
  "properties?": type({
    "url?": type("string").describe("Image URL"),
    "placeholder?": type("string").describe("Placeholder URL"),
    "width?": type("number.integer").describe("Width"),
    "height?": type("number.integer").describe("Height"),
  }).describe("Image properties"),
  "meta_url?": MetaUrlSchema.describe("URL info"),
  "confidence?": type("'low' | 'medium' | 'high'").describe("Confidence level"),
});

// Image Search Query (response)
const ImageQuerySchema = type({
  "original?": type("string").describe("The original query"),
  "altered?": type("string").describe("Altered query by spellchecker"),
  "spellcheck_off?": type("boolean").describe("Whether spellchecker was off"),
  "show_strict_warning?": type("string").describe("Whether lack of results is due to strict safesearch"),
});

// Image Search Extra
const ImageExtraSchema = type({
  "might_be_offensive?": type("boolean").describe("Whether results might be offensive"),
});

// Image Search API Response
export const ImageSearchResponseSchema = type({
  "type?": type("string").describe("Always 'images'"),
  "query?": ImageQuerySchema.describe("Query information"),
  "results?": ImageResultSchema.array().describe("Image results"),
  "extra?": ImageExtraSchema.describe("Extra information"),
});
