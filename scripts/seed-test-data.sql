-- Twitter source for test data
INSERT OR IGNORE INTO sources (id, name, url, description, category, category_slug, kind, created_at, updated_at)
VALUES ('twitter-test', 'Twitter Test', 'https://x.com', 'Test twitter source', 'Twitter', 'twitter', 'tweets', 1709251200, 1709251200);

-- AI/ML
INSERT INTO radar_items (title, source, source_name, summary, image, url, type, metadata, timestamp, created_at, updated_at) VALUES
('GPT-5 Released: A New Frontier in AI', 'openai', 'OpenAI Blog', 'OpenAI announces GPT-5 with breakthrough reasoning capabilities.', 'https://picsum.photos/seed/1/1200/630', 'https://openai.com/blog/gpt-5', 'article', NULL, 1740902400, 1740902400, 1740902400),
('Gemini 3.0: Next Generation AI', 'google-ai', 'Google AI Blog', 'Google DeepMind unveils Gemini 3.0 with improved performance.', 'https://picsum.photos/seed/2/1200/630', 'https://blog.google/technology/ai/gemini-3', 'article', NULL, 1740898800, 1740898800, 1740898800),
('Fine-tuning LLMs with LoRA', 'huggingface', 'Hugging Face Blog', 'Learn how to efficiently fine-tune large language models using LoRA.', 'https://picsum.photos/seed/3/1200/630', 'https://huggingface.co/blog/lora-guide', 'article', NULL, 1740895200, 1740895200, 1740895200),
('AlphaFold 4 Predicts All Proteins', 'deepmind', 'DeepMind Blog', 'DeepMind achieves complete protein structure prediction.', 'https://picsum.photos/seed/4/1200/630', 'https://deepmind.google/blog/alphafold4', 'article', NULL, 1740891600, 1740891600, 1740891600),
('Building Agents with MCP', 'mcp', 'Model Context Protocol Blog', 'A deep dive into building AI agents using MCP.', NULL, 'https://modelcontextprotocol.io/blog/agents', 'article', NULL, 1740888000, 1740888000, 1740888000),
('Transformer Architecture in 2026', 'lilianweng', 'Lil''Log', 'A comprehensive review of transformer architecture evolution.', NULL, 'https://lilianweng.github.io/posts/transformers-2026/', 'article', NULL, 1740884400, 1740884400, 1740884400),
('Mastra v2.0 Released', 'mastra', 'Mastra Releases', 'Major release with new workflow engine.', NULL, 'https://github.com/mastra-ai/mastra/releases/v2.0', 'article', NULL, 1740880800, 1740880800, 1740880800),
('llama.cpp Performance Breakthrough', 'llama-cpp', 'llama.cpp Releases', 'New CUDA backend delivers 3x inference speedup.', NULL, 'https://github.com/ggerganov/llama.cpp/releases/v1.0', 'article', NULL, 1740877200, 1740877200, 1740877200),
('Introduction to AI Safety', 'anthropic-youtube', 'Anthropic', 'Anthropic discusses AI safety research.', 'https://picsum.photos/seed/9/1200/630', 'https://youtube.com/watch?v=test1', 'article', NULL, 1740873600, 1740873600, 1740873600),
('Open Source AI in 2026', 'simonwillison', 'Simon Willison''s Weblog', 'Simon reviews the landscape of open source AI.', NULL, 'https://simonwillison.net/2026/Mar/1/open-source-ai/', 'article', NULL, 1740866400, 1740866400, 1740866400),
('Agentic AI Foundation Report', 'aaif', 'Agentic AI Foundation', 'Annual report on autonomous AI agents.', 'https://picsum.photos/seed/12/1200/630', 'https://agenticai.org/report-2026', 'article', NULL, 1740862800, 1740862800, 1740862800),
('Strands Agents v3.0', 'strands-agents', 'Strands Agents SDK', 'New agent framework with multi-agent orchestration.', NULL, 'https://github.com/strands-agents/sdk-python/releases/v3.0', 'article', NULL, 1740870000, 1740870000, 1740870000);

-- Developer Tools
INSERT INTO radar_items (title, source, source_name, summary, image, url, type, metadata, timestamp, created_at, updated_at) VALUES
('React 20: Server Components by Default', 'react', 'React Blog', 'React 20 makes Server Components the default.', 'https://picsum.photos/seed/20/1200/630', 'https://react.dev/blog/react-20', 'article', NULL, 1740902000, 1740902000, 1740902000),
('TypeScript 6.0: Pattern Matching', 'typescript', 'TypeScript Blog', 'TypeScript 6.0 introduces native pattern matching.', 'https://picsum.photos/seed/21/1200/630', 'https://devblogs.microsoft.com/typescript/6-0', 'article', NULL, 1740898000, 1740898000, 1740898000),
('Bun 2.0: The Complete Runtime', 'bun', 'Bun Blog', 'Bun 2.0 ships with built-in database support.', 'https://picsum.photos/seed/22/1200/630', 'https://bun.sh/blog/bun-v2.0', 'article', NULL, 1740894000, 1740894000, 1740894000),
('Node.js 24 LTS Released', 'nodejs', 'Node.js Blog', 'Node.js 24 LTS brings improved ESM support.', NULL, 'https://nodejs.org/en/blog/release/v24.0.0', 'article', NULL, 1740890000, 1740890000, 1740890000),
('Next.js 16 Release', 'nextjs', 'Next.js Releases', 'Turbopack stable and partial prerendering GA.', NULL, 'https://github.com/vercel/next.js/releases/v16.0.0', 'article', NULL, 1740886000, 1740886000, 1740886000),
('Hono v5 Released', 'hono', 'Hono Releases', 'Middleware composition and improved D1 integration.', NULL, 'https://github.com/honojs/hono/releases/v5.0.0', 'article', NULL, 1740882000, 1740882000, 1740882000),
('Playwright 2.0: AI-Powered Testing', 'playwright', 'Playwright Releases', 'AI-driven test generation and self-healing selectors.', NULL, 'https://github.com/microsoft/playwright/releases/v2.0', 'article', NULL, 1740878000, 1740878000, 1740878000),
('Drizzle ORM 1.0 Stable', 'drizzle-orm', 'Drizzle ORM Releases', 'Full query builder and migration support.', NULL, 'https://github.com/drizzle-team/drizzle-orm/releases/v1.0', 'article', NULL, 1740874000, 1740874000, 1740874000),
('Rolldown Beta: 10x Faster Builds', 'rolldown', 'Rolldown Releases', 'Rust-powered bundler with Vite compatibility.', 'https://picsum.photos/seed/29/1200/630', 'https://github.com/rolldown/rolldown/releases/v0.1', 'article', NULL, 1740870000, 1740870000, 1740870000),
('Mutation Testing at Scale', 'google-testing', 'Google Testing Blog', 'How Google applies mutation testing across its monorepo.', NULL, 'https://testing.googleblog.com/2026/03/mutation-testing.html', 'article', NULL, 1740866000, 1740866000, 1740866000),
('PyTorch 3.0 Distributed Training', 'pytorch', 'PyTorch Blog', 'Automatic parallelism for distributed training.', 'https://picsum.photos/seed/31/1200/630', 'https://pytorch.org/blog/pytorch-3.0', 'article', NULL, 1740862000, 1740862000, 1740862000),
('Tailwind CSS 5.0', 'tailwindcss', 'Tailwind CSS Blog', 'New utility classes and improved JIT performance.', NULL, 'https://tailwindcss.com/blog/tailwindcss-v5', 'article', NULL, 1740858000, 1740858000, 1740858000);

-- Web Standards
INSERT INTO radar_items (title, source, source_name, summary, image, url, type, metadata, timestamp, created_at, updated_at) VALUES
('CSS Anchor Positioning Ships', 'w3c', 'W3C Blog', 'CSS Anchor Positioning is now available in all browsers.', 'https://picsum.photos/seed/40/1200/630', 'https://www.w3.org/blog/css-anchor-positioning', 'article', NULL, 1740901000, 1740901000, 1740901000),
('WebAssembly 3.0 Published', 'w3c', 'W3C Blog', 'W3C publishes WebAssembly 3.0 with GC support.', NULL, 'https://www.w3.org/blog/wasm-3.0', 'article', NULL, 1740897000, 1740897000, 1740897000),
('mozaic.fm ep.150: Web Standards 2026', 'mozaicfm', 'mozaic.fm', 'Web標準の2026年を振り返る。CSS Nesting、View Transitions。', NULL, 'https://mozaic.fm/episodes/150', 'article', NULL, 1740889000, 1740889000, 1740889000),
('Web Components v2', 'whatwg', 'WHATWG Blog', 'WHATWG finalizes Web Components v2 specification.', NULL, 'https://blog.whatwg.org/web-components-v2', 'article', NULL, 1740885000, 1740885000, 1740885000),
('The Modern Web Platform', 'jxck', 'Jxck blog', 'Modern Web Platformの全体像を整理する。', NULL, 'https://blog.jxck.io/entries/modern-web-platform', 'article', NULL, 1740881000, 1740881000, 1740881000),
('Accessibility in 2026', 'deque', 'Deque Blog', 'Web accessibility progress and remaining challenges.', 'https://picsum.photos/seed/46/1200/630', 'https://www.deque.com/blog/accessibility-2026', 'article', NULL, 1740877000, 1740877000, 1740877000);

-- Security & Privacy
INSERT INTO radar_items (title, source, source_name, summary, image, url, type, metadata, timestamp, created_at, updated_at) VALUES
('Critical OpenSSL Vulnerability', 'schneier', 'Schneier on Security', 'Critical vulnerability in OpenSSL allows remote code execution.', 'https://picsum.photos/seed/50/1200/630', 'https://www.schneier.com/blog/openssl-cve-2026', 'article', NULL, 1740900000, 1740900000, 1740900000),
('Project Zero: Browser Exploit Analysis', 'project-zero', 'Project Zero', 'Detailed analysis of a novel browser exploitation technique.', NULL, 'https://googleprojectzero.blogspot.com/2026/03/browser-exploit.html', 'article', NULL, 1740896000, 1740896000, 1740896000),
('Signal Protocol Update', 'signal', 'Signal Blog', 'Signal updates its encryption protocol with post-quantum support.', NULL, 'https://signal.org/blog/pq-update', 'article', NULL, 1740892000, 1740892000, 1740892000),
('Ghidra 12.0 Released', 'ghidra', 'Ghidra Releases', 'Major update with improved decompiler and new analysis features.', NULL, 'https://github.com/NationalSecurityAgency/ghidra/releases/v12.0', 'article', NULL, 1740888000, 1740888000, 1740888000),
('Tor Network Performance Report', 'torproject', 'Tor Project Blog', 'Annual performance and security report of the Tor network.', 'https://picsum.photos/seed/54/1200/630', 'https://blog.torproject.org/performance-2026', 'article', NULL, 1740884000, 1740884000, 1740884000);

-- Digital Identity
INSERT INTO radar_items (title, source, source_name, summary, image, url, type, metadata, timestamp, created_at, updated_at) VALUES
('Bluesky Federation Progress', 'bluesky', 'Bluesky Blog', 'Bluesky opens federation to third-party servers.', 'https://picsum.photos/seed/60/1200/630', 'https://bsky.social/blog/federation', 'article', NULL, 1740899000, 1740899000, 1740899000),
('Ethereum Identity Layer', 'ethereum', 'Ethereum Blog', 'Ethereum introduces a decentralized identity layer.', NULL, 'https://blog.ethereum.org/identity-layer', 'article', NULL, 1740895000, 1740895000, 1740895000),
('Mastodon 5.0 Released', 'mastodon', 'Mastodon Blog', 'Mastodon 5.0 with improved federation and moderation.', NULL, 'https://blog.joinmastodon.org/2026/03/mastodon-5.0/', 'article', NULL, 1740891000, 1740891000, 1740891000),
('OpenID Connect Federation 1.0', 'openid', 'OpenID Foundation', 'OpenID releases Federation 1.0 for cross-domain identity.', NULL, 'https://openid.net/blog/oidc-federation-1.0', 'article', NULL, 1740887000, 1740887000, 1740887000),
('Vitalik: Soulbound Tokens Update', 'vitalik', 'Vitalik Buterin', 'Progress on Soulbound Tokens and decentralized identity.', NULL, 'https://vitalik.eth.limo/soulbound-2026', 'article', NULL, 1740883000, 1740883000, 1740883000);

-- Platform & Services
INSERT INTO radar_items (title, source, source_name, summary, image, url, type, metadata, timestamp, created_at, updated_at) VALUES
('Cloudflare Workers AI: Local Inference', 'cloudflare', 'Cloudflare Blog', 'Local LLM inference with sub-100ms latency.', 'https://picsum.photos/seed/70/1200/630', 'https://blog.cloudflare.com/workers-ai-local', 'article', NULL, 1740901500, 1740901500, 1740901500),
('Vercel Edge Functions v3', 'vercel', 'Vercel Blog', 'Persistent connections and WebSocket support.', 'https://picsum.photos/seed/71/1200/630', 'https://vercel.com/blog/edge-functions-v3', 'article', NULL, 1740897500, 1740897500, 1740897500),
('GitHub Copilot Workspace GA', 'github-changelog', 'GitHub Changelog', 'Copilot Workspace is now generally available.', 'https://picsum.photos/seed/73/1200/630', 'https://github.blog/copilot-workspace-ga', 'article', NULL, 1740889500, 1740889500, 1740889500),
('Digital Agency: Government API Platform', 'digital-gov', 'Digital Gov Blog', 'Japan Digital Agency launches unified API platform.', NULL, 'https://www.digital.go.jp/en/news/api-platform', 'article', NULL, 1740885500, 1740885500, 1740885500);

-- Company Engineering
INSERT INTO radar_items (title, source, source_name, summary, image, url, type, metadata, timestamp, created_at, updated_at) VALUES
('Meta: Threads Fediverse Integration', 'meta-engineering', 'Meta Engineering Blog', 'How Meta integrated ActivityPub into Threads at scale.', 'https://picsum.photos/seed/80/1200/630', 'https://engineering.fb.com/threads-fediverse', 'article', NULL, 1740900500, 1740900500, 1740900500),
('Mercari: Modular Monolith Migration', 'mercari-engineering', 'Mercari Engineering Blog', 'メルカリのマイクロサービスからモジュラーモノリスへの移行。', NULL, 'https://engineering.mercari.com/blog/modular-monolith', 'article', NULL, 1740896500, 1740896500, 1740896500),
('LINEヤフー: 大規模Observability', 'lycorp-techblog', 'LINEヤフー Tech Blog', '大規模Observabilityプラットフォームの設計と運用。', NULL, 'https://techblog.lycorp.co.jp/ja/observability', 'article', NULL, 1740892500, 1740892500, 1740892500),
('freee: GraphQL Federation', 'freee-developers', 'freee Developers Blog', 'GraphQL Federationの導入と大規模運用の知見。', 'https://picsum.photos/seed/83/1200/630', 'https://developers.freee.co.jp/blog/graphql-federation', 'article', NULL, 1740888500, 1740888500, 1740888500),
('Meituan: Feature Platform Architecture', 'meituan', 'Meituan Tech Blog', 'Real-time feature platform for ML model serving.', NULL, 'https://tech.meituan.com/2026/03/feature-platform.html', 'article', NULL, 1740884500, 1740884500, 1740884500);

-- Personal Blog
INSERT INTO radar_items (title, source, source_name, summary, image, url, type, metadata, timestamp, created_at, updated_at) VALUES
('Overreacted: The Two Reacts', 'overreacted', 'Overreacted', 'Dan Abramov on Server and Client Components mental model.', NULL, 'https://overreacted.io/the-two-reacts-2/', 'article', NULL, 1740899500, 1740899500, 1740899500),
('antfu: ESLint Flat Config Guide', 'antfu', 'Anthony Fu', 'A practical guide to migrating to ESLint flat config.', NULL, 'https://antfu.me/posts/eslint-flat-config', 'article', NULL, 1740895500, 1740895500, 1740895500),
('Building a Knowledge Graph', 'jmuk', 'jmuk blog', 'ObsidianとLinked Dataで個人ナレッジグラフを構築する。', NULL, 'https://jmuk.org/knowledge-graph', 'article', NULL, 1740891500, 1740891500, 1740891500),
('Kent C. Dodds: Testing Best Practices', 'kentcdodds', 'Kent C. Dodds', 'Updated testing best practices for React in 2026.', NULL, 'https://kentcdodds.com/blog/testing-best-practices-2026', 'article', NULL, 1740887500, 1740887500, 1740887500),
('Martin Fowler: Event-Driven Architecture', 'martinfowler', 'Martin Fowler', 'A comprehensive guide to event-driven architecture patterns.', 'https://picsum.photos/seed/94/1200/630', 'https://martinfowler.com/articles/event-driven-2026.html', 'article', NULL, 1740883500, 1740883500, 1740883500);

-- Social Impact
INSERT INTO radar_items (title, source, source_name, summary, image, url, type, metadata, timestamp, created_at, updated_at) VALUES
('EFF: AI Surveillance Report', 'eff', 'Electronic Frontier Foundation', 'EFF reports on AI-powered surveillance technologies.', 'https://picsum.photos/seed/90/1200/630', 'https://www.eff.org/deeplinks/2026/03/ai-surveillance', 'article', NULL, 1740898500, 1740898500, 1740898500),
('Citizen Lab: Spyware Analysis', 'citizenlab', 'Citizen Lab', 'Technical analysis of new commercial spyware targeting journalists.', NULL, 'https://citizenlab.ca/2026/03/spyware-analysis/', 'article', NULL, 1740894500, 1740894500, 1740894500),
('g0v: Civic Tech Hackathon Report', 'g0v', 'g0v Blog', 'g0vハッカソンの最新レポート。市民テクノロジーの社会実装事例。', NULL, 'https://g0v.tw/en-US/blog/hackathon-2026', 'article', NULL, 1740890500, 1740890500, 1740890500);

-- Media & Culture
INSERT INTO radar_items (title, source, source_name, summary, image, url, type, metadata, timestamp, created_at, updated_at) VALUES
('Rebuild ep.400: Anniversary', 'rebuildfm', 'Rebuild', 'Rebuild 400回記念エピソード。テック業界の変遷。', NULL, 'https://rebuild.fm/400/', 'article', NULL, 1740900000, 1740900000, 1740900000),
('Lex Fridman: Linus Torvalds', 'lexfridman', 'Lex Fridman Podcast', 'Linus Torvalds on Linux, Rust in the kernel, and open source.', 'https://picsum.photos/seed/101/1200/630', 'https://lexfridman.com/linus-torvalds-2', 'article', NULL, 1740896000, 1740896000, 1740896000),
('fukabori.fm: WebAssembly Deep Dive', 'fukabori', 'fukabori.fm', 'WebAssemblyとComponent Modelについて深掘り。', NULL, 'https://fukabori.fm/episode/wasm-deep-dive', 'article', NULL, 1740892000, 1740892000, 1740892000),
('misreading.chat: Attention Paper', 'misreading', 'misreading.chat', 'Attention Is All You Needの続編論文を読む。', NULL, 'https://misreading.chat/attention-still', 'article', NULL, 1740888000, 1740888000, 1740888000),
('Rest of World: Tech in Africa', 'restofworld', 'Rest of World', 'How African startups are building homegrown tech platforms.', 'https://picsum.photos/seed/105/1200/630', 'https://restofworld.org/2026/africa-tech-platforms/', 'article', NULL, 1740884000, 1740884000, 1740884000);

-- Twitter tweets
INSERT INTO radar_items (title, source, source_name, summary, image, url, type, metadata, timestamp, created_at, updated_at) VALUES
('Tweet', 'twitter-test', 'Yann LeCun', 'The next breakthrough in AI will come from understanding causality, not just pattern matching.', NULL, 'https://x.com/ylecun/status/1', 'tweet', '{"icon":"https://pbs.twimg.com/profile_images/ylecun.jpg","handle":"ylecun","tweetId":"1"}', 1740902400, 1740902400, 1740902400),
('Tweet', 'twitter-test', 'Andrej Karpathy', 'Just released a new video on building GPT from scratch in 2026. Check it out: https://youtube.com/watch?v=karpathy2026', NULL, 'https://x.com/karpathy/status/2', 'tweet', '{"icon":"https://pbs.twimg.com/profile_images/karpathy.jpg","handle":"karpathy","tweetId":"2"}', 1740898800, 1740898800, 1740898800),
('Tweet', 'twitter-test', 'Guillermo Rauch', 'Next.js 16 is out!\n- Turbopack stable\n- Partial prerendering GA\n- Server Actions improvements\nhttps://nextjs.org/blog/next-16', NULL, 'https://x.com/rauchg/status/3', 'tweet', '{"icon":"https://pbs.twimg.com/profile_images/rauchg.jpg","handle":"rauchg","tweetId":"3"}', 1740895200, 1740895200, 1740895200),
('Tweet', 'twitter-test', 'Dan Abramov', 'React Server Components mental model is simpler than people think - just components that run on the server.', NULL, 'https://x.com/dan_abramov/status/4', 'tweet', '{"icon":"https://pbs.twimg.com/profile_images/dan.jpg","handle":"dan_abramov","tweetId":"4"}', 1740891600, 1740891600, 1740891600),
('Tweet', 'twitter-test', 'Evan You', 'Rolldown is now in beta! Built with Rust, compatible with Vite, and 10x faster builds.\nhttps://rolldown.rs', NULL, 'https://x.com/youyuxi/status/5', 'tweet', '{"icon":"https://pbs.twimg.com/profile_images/youyuxi.jpg","handle":"youyuxi","tweetId":"5"}', 1740888000, 1740888000, 1740888000),
('Tweet', 'twitter-test', 'Matz', 'Ruby 4.0がリリースされました。JITコンパイラの改善とRactorの安定化が主な変更点です。', NULL, 'https://x.com/yukihiro_matz/status/6', 'tweet', '{"icon":"https://pbs.twimg.com/profile_images/matz.jpg","handle":"yukihiro_matz","tweetId":"6"}', 1740884400, 1740884400, 1740884400),
('Tweet', 'twitter-test', 'Kent C. Dodds', 'Most apps do not need a state management library. React context + useReducer covers 90% of use cases.', NULL, 'https://x.com/kentcdodds/status/7', 'tweet', '{"icon":"https://pbs.twimg.com/profile_images/kent.jpg","handle":"kentcdodds","tweetId":"7"}', 1740880800, 1740880800, 1740880800),
('Tweet', 'twitter-test', 'Theo', 'I tried building my entire app with Claude Code and it actually worked. The future of programming is here.', NULL, 'https://x.com/theo/status/8', 'tweet', '{"icon":"https://pbs.twimg.com/profile_images/theo.jpg","handle":"t3dotgg","tweetId":"8"}', 1740877200, 1740877200, 1740877200),
('Tweet', 'twitter-test', 'swyx', 'The AI Engineer stack in 2026:\n- Claude for coding\n- Cursor for IDE\n- MCP for tool use\n- Vercel for deploy', NULL, 'https://x.com/swyx/status/10', 'tweet', '{"icon":"https://pbs.twimg.com/profile_images/swyx.jpg","handle":"swyx","tweetId":"10"}', 1740870000, 1740870000, 1740870000),
('Tweet', 'twitter-test', 'Rich Harris', 'Svelte 6 is coming. We have been rethinking reactivity from the ground up.', NULL, 'https://x.com/rich_harris/status/11', 'tweet', '{"icon":"https://pbs.twimg.com/profile_images/rich.jpg","handle":"rich_harris","tweetId":"11"}', 1740866400, 1740866400, 1740866400),
('Tweet', 'twitter-test', 'Ryan Dahl', 'Deno 3.0 is coming soon. Focusing on production TypeScript. More details at the next conference.', NULL, 'https://x.com/ry/status/12', 'tweet', '{"icon":"https://pbs.twimg.com/profile_images/ry.jpg","handle":"ry","tweetId":"12"}', 1740862800, 1740862800, 1740862800);
