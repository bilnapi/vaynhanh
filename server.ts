import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google Gemini API client if key exists
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Built-in intelligent financial assistant fallback knowledge base
function getSmartFallbackReply(userMessage: string): string {
  const query = userMessage.toLowerCase();

  if (query.includes('nợ xấu') || query.includes('cic') || query.includes('nhóm 1') || query.includes('nhóm 2') || query.includes('nhóm 3') || query.includes('nhóm 4') || query.includes('nhóm 5')) {
    return `Chào bạn! Về vấn đề nợ xấu CIC:\n
1. **Nợ xấu nhóm 1 & 2 (Nợ chú ý):** Cả 4 đối tác **MoneyCat, Vay VND, Jeff, Money Veo** đều hỗ trợ duyệt 100% online.\n
2. **Nợ xấu nhóm 3, 4, 5 (Nợ quá hạn trên 90 ngày):** Đối tác **Jeff** (nền tảng so sánh hơn 20 tổ chức) và **MoneyCat** có tỷ lệ giải ngân cao nhất vì họ xét duyệt dựa trên điểm tin cậy cá nhân và số điện thoại chính chủ, không truy xét quá khắt khe CIC ngân hàng.\n
💡 **Mẹo tăng tỷ lệ duyệt:**
- Khai báo công việc ổn định (thu nhập từ 5-7 triệu/tháng).
- Đăng ký cùng lúc 2-3 đối tác để tối đa cơ hội duyệt tiền ngay trong 5 phút.`;
  }

  if (query.includes('moneycat') || query.includes('tiêu chí') || query.includes('lãi suất moneycat')) {
    return `**MoneyCat** là đơn vị cho vay trực tuyến hàng đầu:\n
- Hạn mức: 1.000.000đ - 10.000.000đ\n
- Ưu đãi: 0% lãi suất cho khoản vay đầu tiên trong 14 ngày\n
- Thời gian duyệt: 5 phút tự động bằng AI, tiền về ATM trong 15 phút\n
- Hỗ trợ nợ xấu nhóm 1, 2, 3.\n
👉 Bạn có thể bấm trực tiếp vào nút **Đăng ký MoneyCat** trên ứng dụng để nhận tiền ngay nhé!`;
  }

  if (query.includes('vay vnd') || query.includes('vayvnd')) {
    return `**Vay VND** nổi tiếng với tốc độ giải ngân thần tốc:\n
- Hạn mức: 1.000.000đ - 15.000.000đ\n
- Duyệt tự động 3-5 phút, tỷ lệ duyệt lên tới 98%\n
- Không cần chứng minh thu nhập rườm rà, không gọi người thân\n
- Thích hợp cho người cần tiền gấp trong ngày.\n
👉 Chọn thẻ **Vay VND** trên màn hình để chuyển thẳng đến cổng giải ngân chính thức.`;
  }

  if (query.includes('jeff')) {
    return `**Jeff** là nền tảng kết nối tài chính quốc tế uy tín:\n
- Hạn mức: 500.000đ lên tới 30.000.000đ\n
- Tự động quét và đề xuất đối tác tài chính có khả năng duyệt cao nhất cho hồ sơ nợ xấu\n
- Hỗ trợ cả nợ xấu nhóm 3, 4, 5\n
- Thời gian giải ngân linh hoạt 5 - 15 phút.`;
  }

  if (query.includes('money veo') || query.includes('moneyveo')) {
    return `**Money Veo (Money Vèo)** mang công nghệ FinTech vượt trội:\n
- Hạn mức: 1.000.000đ - 10.000.000đ\n
- Hệ thống xét duyệt hồ sơ hoàn toàn tự động 24/7 kể cả ban đêm và ngày nghỉ lễ\n
- Minh bạch 100% về phí và lãi suất, không phát sinh chi phí ngầm.`;
  }

  if (query.includes('thủ tục') || query.includes('điều kiện') || query.includes('hồ sơ')) {
    return `Thủ tục đăng ký vay tại VayNhanh cực kỳ đơn giản:\n
1. Độ tuổi từ 18 - 60 tuổi, là công dân Việt Nam.\n
2. Bản gốc CCCD/CMND còn hiệu lực (chụp 2 mặt rõ nét).\n
3. Số điện thoại chính chủ đang hoạt động.\n
4. Tài khoản ngân hàng (ATM) chính chủ để nhận tiền giải ngân trong 5 phút.\n
*Không cần thế chấp tài sản, không giữ giấy tờ gốc.*`;
  }

  if (query.includes('thẩm định') || query.includes('người thân') || query.includes('gọi')) {
    return `Bạn hoàn toàn yên tâm nhé! Các đối tác **MoneyCat, Vay VND, Jeff, Money Veo** tại VayNhanh đều áp dụng quy trình **Duyệt Tự Động 100% bằng hệ thống máy tính**, KHÔNG gọi điện thẩm định người thân, bạn bè hay đồng nghiệp công ty. Thông tin của bạn được bảo mật tuyệt đối 256-bit SSL.`;
  }

  if (query.includes('lãi suất') || query.includes('cách tính')) {
    return `Khoản vay đầu tiên tại hầu hết đối tác được áp dụng chương trình **0% Lãi Suất & Phí** trong kỳ đầu. Với các kỳ tiếp theo, lãi suất dao động từ 12% - 18.25%/năm theo đúng quy định pháp luật. Bạn có thể sử dụng ngay công cụ **Tính Lãi Suất Tự Động** ở góc màn hình để xem chi tiết tiền gốc và lãi từng tháng!`;
  }

  return `Chào bạn! Tôi là Trợ lý Tài Chính 24/7 của VayNhanh. Tôi có thể hỗ trợ bạn:\n
- Tư vấn gói vay duyệt nợ xấu tốt nhất (MoneyCat, Vay VND, Jeff, Money Veo)\n
- Hướng dẫn điều kiện và mẹo để được duyệt 100% trong 5 phút\n
- Giải đáp thắc mắc về nợ xấu CIC, cách thức nhận tiền qua thẻ ATM\n
- Hướng dẫn tính lãi suất và lịch trả nợ.\n
Bạn đang cần vay bao nhiêu tiền hoặc đang gặp vướng mắc ở bước nào?`;
}

// API: Chatbot 24/7 endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Nội dung tin nhắn không hợp lệ.' });
    }

    if (aiClient) {
      try {
        const systemInstruction = `Bạn là Chuyên gia Tư vấn Tài chính & Hỗ trợ Nợ Xấu cao cấp của nền tảng VayNhanh (Việt Nam).
Nhiệm vụ của bạn là tư vấn cho khách hàng đang có nhu cầu vay tiền gấp hoặc bị nợ xấu (CIC nhóm 1, 2, 3, 4, 5).
Các đối tác trực tiếp trên nền tảng gồm:
1. MoneyCat (Link: https://go.3rdvn.io.vn/t/b1bb1922c3a8915d) - Duyệt nhanh 5 phút, 0% lãi suất lần đầu, hạn mức 1-10 triệu.
2. Vay VND (Link: https://go.3rdvn.io.vn/t/18b4b49f7b9fa55d) - Tỷ lệ duyệt 98%, hạn mức 1-15 triệu, không gọi người thân.
3. Jeff (Link: https://go.3rdvn.io.vn/t/f101003aa09433f3) - Nền tảng so sánh hơn 20 tổ chức, hạn mức tới 30 triệu, chấp nhận nợ xấu nặng.
4. Money Veo (Link: https://go.3rdvn.io.vn/t/a27087d3b0ec5d68) - Duyệt 24/7 công nghệ FinTech hiện đại, hạn mức 1-10 triệu.

Phong cách trả lời: Ân cần, đồng cảm, chuyên nghiệp, tiếng Việt chuẩn mực, gạch đầu dòng rõ ràng, trung thực về tài chính, khuyến khích người dùng có trách nhiệm trả nợ đúng hạn. Luôn hướng dẫn người dùng nhấn vào các nút đăng ký đối tác trên trang web.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\nTin nhắn của người dùng: ${message}` }],
            },
          ],
        });

        const reply = response.text || getSmartFallbackReply(message);
        return res.json({ reply });
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to smart local knowledge base:', geminiError);
        return res.json({ reply: getSmartFallbackReply(message) });
      }
    }

    // Fallback when no API key configured
    return res.json({ reply: getSmartFallbackReply(message) });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({ error: 'Đã có lỗi xảy ra khi xử lý phản hồi.' });
  }
});

// API: Realtime application email alert simulation
app.post('/api/subscribe-email', (req: Request, res: Response) => {
  const { email, applicationId } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Địa chỉ email không hợp lệ.' });
  }
  return res.json({
    success: true,
    message: `Đã kích hoạt thông báo tự động tới email ${email} cho hồ sơ #${applicationId || 'VN-HOTRO'}. Bạn sẽ nhận email cập nhật từng bước phê duyệt và giải ngân.`,
    timestamp: new Date().toISOString(),
  });
});

// Production & Vite setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VayNhanh server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
