// Metadata cho mỗi document
export interface Metadata {
  [key: string]: string | number | boolean | null;
}

// Kết quả từ Chroma /query
export interface ChromaQueryResult {
  result: {
    ids: string[][]; // mỗi query trả về nhiều id
    embeddings: number[][] | null; // có thể null
    documents: string[][]; // mỗi query trả về nhiều documents
    uris: string[][] | null; // có thể null
    included: string[]; // ["documents", "metadatas", ...]
    data: unknown[] | null; // giữ an toàn, không dùng any
    metadatas: Metadata[][]; // metadata đi kèm documents
    distances: number[][]; // độ tương đồng cho mỗi doc
  };
}
