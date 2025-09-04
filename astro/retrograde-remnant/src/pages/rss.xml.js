import rss from "@astrojs/rss";
import { SITE_DESCRIPTION, SITE_TITLE } from "../consts";

export async function GET(context) {
  // Lấy dữ liệu từ API
  const posts = await fetch(
    "https://vegetable-container.onrender.com/v1/agent/blogs"
  )
    .then((res) => res.json())
    .catch(() => []);

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: "https://novu.pages.dev",
    items: posts.map((post) => ({
      title: post.title,
      pubDate: post.createdAt,
      description: post.intro,
      link: `/blog/${post.id}/`,
    })),
  });
}
