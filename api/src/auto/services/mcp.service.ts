// ai/mcp.service.ts
import axios from 'axios';
import { DynamicTool } from '@langchain/core/tools';
import { RAGService } from './rag.service';

const API_URL = 'https://dummyjson.com/products';

/**
 * Tool: Check stock của sản phẩm theo ID
 */
export const checkStockTool = new DynamicTool({
  name: 'check_stock',
  description: 'Check stock for an item by its numeric ID',
  func: async (input: string) => {
    try {
      const id = Number(input);
      if (Number.isNaN(id)) {
        return JSON.stringify({ itemId: input, stock: null });
      }
      const res = await axios.get(`${API_URL}/${id}`);
      const data = res.data;
      return JSON.stringify({ itemId: id, stock: data.stock });
    } catch (err) {
      console.error(err);
      return JSON.stringify({ itemId: input, stock: null });
    }
  },
});

/**
 * Tool: Get price của sản phẩm theo ID
 */
export const getPriceTool = new DynamicTool({
  name: 'get_price',
  description: 'Get price for an item by its numeric ID',
  func: async (input: string) => {
    try {
      const id = Number(input);
      if (Number.isNaN(id)) {
        return JSON.stringify({ itemId: input, stock: null });
      }
      const res = await axios.get(`${API_URL}/${id}`);
      const data = res.data;
      return JSON.stringify({ itemId: id, price: data.price });
    } catch (err) {
      console.error(err);
      return JSON.stringify({ itemId: input, price: null });
    }
  },
});

/**
 * Tool: Search sản phẩm theo từ khóa
 */
export const searchTool = new DynamicTool({
  name: 'search_products',
  description: 'Search for products by keyword',
  func: async (query: string) => {
    try {
      const res = await axios.get(
        `${API_URL}/search?q=${encodeURIComponent(query)}`,
      );
      return JSON.stringify(res.data.products);
    } catch (err) {
      console.error(err);
      return '[]';
    }
  },
});

export const ragSearchTool = (rag: RAGService) =>
  new DynamicTool({
    name: 'rag_search',
    description:
      'Search internal knowledge base for product info or contextual documents',
    func: async (query: string) => {
      try {
        const result = await rag.search(query, 3);
        return JSON.stringify({
          documents: result.documents,
          llmAnswer: result.llmAnswer,
        });
      } catch (err) {
        console.error(err);
        return JSON.stringify({ documents: [], llmAnswer: null });
      }
    },
  });
