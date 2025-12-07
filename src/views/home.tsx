import { Layout } from "./layout";

export const Home = () => {
  return (
    <Layout title="Hack Club Search">
      <div class="text-center py-20 px-4 min-h-[80vh] flex flex-col justify-center items-center">
        <div class="mb-8 inline-block">
          <div class="w-20 h-20 bg-brand-primary rounded-2xl flex items-center justify-center text-white font-bold text-4xl transform -rotate-6">
            🔍
          </div>
        </div>

        <h1 class="text-5xl md:text-7xl font-bold text-brand-heading mb-6 tracking-tight">
          Hack Club Search
        </h1>

        <p class="text-xl md:text-2xl text-brand-text mb-12 max-w-2xl mx-auto leading-relaxed">
          Brave Search API proxy for Hack Club members
        </p>

        <a
          href="/auth/login"
          class="inline-block bg-brand-primary text-white px-8 py-4 rounded-full text-lg font-bold hover:tracking-wider transition-all mb-20"
        >
          Sign in with Hack Club
        </a>

        <h2 class="text-3xl font-bold mb-10 text-brand-heading">
          Available Endpoints
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto mb-20">
          <div class="bg-white border-2 border-brand-border/50 rounded-2xl p-6 text-left">
            <div class="flex items-center gap-2 mb-3">
              <span class="px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-green-100 text-green-700 border border-green-200">
                GET
              </span>
              <code class="text-sm font-mono text-brand-primary">/proxy/v1/web/search</code>
            </div>
            <h3 class="text-xl font-bold text-brand-heading mb-2">Web Search</h3>
            <p class="text-brand-text">
              Search the web for pages, news, videos, discussions, and more.
            </p>
          </div>

          <div class="bg-white border-2 border-brand-border/50 rounded-2xl p-6 text-left">
            <div class="flex items-center gap-2 mb-3">
              <span class="px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-green-100 text-green-700 border border-green-200">
                GET
              </span>
              <code class="text-sm font-mono text-brand-primary">/proxy/v1/images/search</code>
            </div>
            <h3 class="text-xl font-bold text-brand-heading mb-2">Image Search</h3>
            <p class="text-brand-text">
              Search for images across the web.
            </p>
          </div>
        </div>

        <p class="text-brand-text/60 font-medium">© 2025 Hack Club</p>
      </div>
    </Layout>
  );
};
