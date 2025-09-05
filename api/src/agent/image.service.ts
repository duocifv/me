// src/image/image.service.ts
import fs from 'node:fs';
import axios from 'axios';
import FormData from 'form-data';

export class ImageService {
  private apiKey: string;

  constructor() {
    if (!process.env.STABILITY_API_KEY) {
      throw new Error('STABILITY_API_KEY is not set in env');
    }
    this.apiKey = process.env.STABILITY_API_KEY;
  }

  async generateImage(prompt: string, filename: string): Promise<string> {
    const payload = {
      prompt,
      output_format: 'webp',
    };

    const response = await axios.postForm(
      'https://api.stability.ai/v2beta/stable-image/generate/ultra',
      axios.toFormData(payload, new FormData()),
      {
        validateStatus: undefined,
        responseType: 'arraybuffer',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: 'image/*',
        },
      },
    );
    console.log('response img 3::', response);

    if (response.status === 200) {
      const filePath = `./public/images/${filename}`;
      fs.writeFileSync(filePath, Buffer.from(response.data));
      return `/images/${filename}`;
    } else {
      throw new Error(`${response.status}: ${response.data.toString()}`);
    }
  }
}
