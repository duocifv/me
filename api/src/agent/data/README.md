# Data for LlamaIndex / AgentService

Đây là thư mục mẫu `data/` chứa các file văn bản dùng làm nguồn dữ liệu cho LlamaIndex.

Files included:
- tips_lifehack.txt        : Lifehacks and tips (Vietnamese)
- motivational_quotes.txt  : Motivational quotes (Vietnamese + some originals)
- micro_stories.txt        : Short micro-stories for feeds

Usage:
1. Copy the `data/` folder into the root of your NestJS project (same level as package.json).
2. LlamaIndex in AgentService will read all files in ./data and index them.
3. If you do not use embeddings, LlamaIndex may require an embed provider to build a vector index.
   In that case, either configure an embedding provider or adapt code to use simple keyword search.

Example:
```ts
// process.cwd()/data/... will be read by AgentService
```
