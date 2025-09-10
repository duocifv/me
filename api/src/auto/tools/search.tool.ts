import axios from 'axios';
import { DynamicTool } from '@langchain/core/tools';

const API_URL = 'https://dummyjson.com/products';

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
