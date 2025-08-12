import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import { GeminiService } from './gemini-formatter.service';
import { OpenRouterAnalysisService } from './ai-analysis.service';

@Injectable()
export class MedalpacaService {
  private readonly apiUrl = 'https://nvduocfpt-duoc2.hf.space/ask';
  constructor(
    private readonly geminiService: GeminiService,
    private readonly analysisService: OpenRouterAnalysisService,
  ) {}

  async convertGeminiToPrompMedalpacat(analysisText: string) {
    // 1. Dùng Gemini soạn lại đoạn văn thô thành đoạn văn chuẩn y khoa ngắn gọn, cô đọng
    const geminiPrompt = `
Bạn là chuyên gia y khoa. Đoạn văn sau đây chứa thông tin y khoa thô. Hãy SOẠN LẠI thành một đoạn mô tả / tóm tắt y khoa chuẩn, ngắn gọn, dễ hiểu, gồm:
- Tóm tắt triệu chứng chính (thời gian khởi phát, mức độ, yếu tố tăng/giảm)
- Những yếu tố tiền sử bệnh quan trọng
- Không kèm câu hỏi, chỉ tóm tắt thông tin để dễ đọc và chuẩn.
- Bắt buộc: chuyển thành tiếng anh chuyên khoa.
Đoạn văn thô:
${analysisText}
`;

    const rewritten = await this.geminiService.chatWithGeminiRaw(geminiPrompt);

    if (typeof rewritten !== 'string' || rewritten.trim() === '') {
      throw new InternalServerErrorException(
        'Gemini trả về không phải text hoặc trống',
      );
    }

    // 2. Dùng đoạn văn đã soạn lại làm phần <đoạn văn thô> để tạo prompt gửi MedAlpaca
    //     const medAlpacaPrompt = `
    // ### Instruction:
    // Bạn là chuyên gia y khoa. Dưới đây là thông tin bệnh nhân:

    // "${rewritten.trim()}"

    // Hãy soạn một trả lời Y KHOA CÓ CẤU TRÚC bao gồm các mục sau:
    // 1. Tóm tắt ngắn về triệu chứng và tiền sử bệnh.
    // 2. Những chẩn đoán khả dĩ (differential diagnoses), kèm ước lượng mức độ khả năng (cao, trung bình, thấp).
    // 3. Các xét nghiệm hoặc thăm khám cần thiết, phân loại theo mức độ ưu tiên.
    // 4. Phác đồ xử trí hoặc điều trị đề xuất, bao gồm xử trí cấp cứu nếu cần.
    // 5. Các dấu hiệu cảnh báo (red flags) cần lưu ý.
    // 6. Ghi chú về giới hạn thông tin và khuyến cáo bệnh nhân nên khám bác sĩ chuyên khoa để được chẩn đoán chính xác.

    // Trả lời ngắn gọn, rõ ràng, dùng bullet points hoặc danh sách số. Không đưa ra kết luận tuyệt đối, nên kèm mức độ chắc chắn.

    // ### Response:
    // `;

    const medAlpacaPrompt = `You are a medical specialist. The patient ${rewritten.trim()}. What are the possible diagnoses and reliability ?`;

    return medAlpacaPrompt;
  }

  async ask(text: string) {
    console.log('Gemini raw response:', text);
    if (!text) {
      throw new NotFoundException('Bạn phải gửi trường "text" trong body.');
    }

    const prompt = await this.convertGeminiToPrompMedalpacat(text);
    try {
      const response = await axios.post<{ output: string }>(this.apiUrl, {
        text: prompt,
      });
      if (response?.data) {
        return await this.analysisService.analyzeMedical(
          response?.data?.output,
        );
      }
      return null;
    } catch {
      // Có thể log error chi tiết nếu muốn
      throw new NotFoundException('Lỗi khi gọi API AI bên ngoài');
    }
  }
}
