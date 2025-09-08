// ai/mcp.service.ts
import axios from 'axios';

export class MCPService {
  private apiUrl = 'https://dummyjson.com/products';

  async checkStock(itemId: number) {
    try {
      const res = await axios.get(`${this.apiUrl}/${itemId}`);
      const data = res.data;
      return { itemId, stock: data.stock };
    } catch (err) {
      console.error(err);
      return { itemId, stock: null };
    }
  }

  async getPrice(itemId: number) {
    try {
      const res = await axios.get(`${this.apiUrl}/${itemId}`);
      const data = res.data;
      return { itemId, price: data.price };
    } catch (err) {
      console.error(err);
      return { itemId, price: null };
    }
  }

  async search(query: string) {
    try {
      const res = await axios.get(
        `${this.apiUrl}/search?q=${encodeURIComponent(query)}`,
      );
      return res.data.products;
    } catch (err) {
      console.error(err);
      return [];
    }
  }
}
