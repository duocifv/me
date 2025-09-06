export interface BlogItem {
  title: string;
  description: string;
}

export interface Blog {
  id: number;
  title: string;
  intro: string;
  items: BlogItem[];
  markdown: string;
  slug: string;
  og: {
    image: string;
    description: string;
  };
  coverImage: string;
  createdAt: string;
  metadata: {
    sourceType: string;
    modelVersion: string;
    pipelineVersion: string;
    keywordDensity: number;
  };
}
