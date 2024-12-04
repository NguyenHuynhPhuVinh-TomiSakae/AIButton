import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs/promises';
import moment from "moment";
import dotenv from 'dotenv';

// Cấu hình dotenv
dotenv.config();

const generateButtons = async () => {
  // Kiểm tra nếu không có API key
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY không tồn tại trong file .env');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-exp-1121",
    generationConfig: {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: "application/json"
    }
  });

  // Đọc file buttons.js hiện tại nếu tồn tại
  let existingButtons = [];
  try {
    const fileContent = await fs.readFile('./buttons.js', 'utf8');
    const match = fileContent.match(/const buttons = (\[[\s\S]*?\]);[\s\S]*?export default buttons;/);
    if (match) {
      existingButtons = eval(match[1]) || [];
    }
  } catch (error) {
    console.log(`[${moment().format('HH:mm:ss')}] Tạo file buttons.js mới`);
  }

  const prompt = `Tạo 1 nút (CHỈ MỘT NÚT DUY NHẤT) với Tailwind CSS có kiểu thiết kế mới lạ và độc đáo. 
  ${existingButtons.length > 0
      ? `TUYỆT ĐỐI KHÔNG ĐƯỢC TRÙNG VỚI CÁC NÚT SAU (cả về tên và kiểu dáng):
       Tên: ${existingButtons.slice(-20).filter(btn => btn && btn.name).map(btn => btn.name).join(', ')}
       Classes đã sử dụng: ${existingButtons.slice(-20).filter(btn => btn && btn.classes).map(btn => btn.classes).join(', ')}`
      : ''
    }

  Trả về dưới dạng mảng JavaScript với format như sau:
  [
    {
      name: "Tên nút (phải khác với các tên đã có)",
      code: "<button class='các-class-tailwind'>Nội dung nút</button>",
      classes: "các-class-tailwind"
    }
  ]
  
  Yêu cầu thiết kế:
  - CHỈ TẠO MỘT NÚT DUY NHẤT
  - Nút PHẢI CÓ THIẾT KẾ HOÀN TOÀN MỚI, không được trùng với bất kỳ nút nào đã có
  - Classes được sử dụng phải hoàn toàn khác với các classes đã có
  - Phải sử dụng ít nhất 2 trong các yếu tố sau để tạo sự khác biệt:
    + Gradient độc đáo (ví dụ: từ 3 màu trở lên hoặc gradient góc đặc biệt)
    + Animation phức tạp (kết hợp nhiều hiệu ứng)
    + Border style không phổ biến (double, dotted, dashed với màu sắc đặc biệt)
    + Kết hợp nhiều pseudo-class (:hover + :focus + :active)
    + Sử dụng các hiệu ứng đặc biệt (backdrop-filter, clip-path, transform)
  - Màu sắc phải khác biệt hoàn toàn với các nút trước đó
  - Hình dạng nút phải độc đáo (có thể không phải hình chữ nhật thông thường)
  - Đảm bảo trả về đúng định dạng JSON với ĐÚNG MỘT PHẦN TỬ trong mảng`;

  const result = await model.generateContent(prompt);
  const newButton = JSON.parse(result.response.text())[0];

  // Kiểm tra nút mới có hợp lệ không
  if (newButton && newButton.name && newButton.code && newButton.classes) {
    // Thêm nút mới vào mảng hiện có
    existingButtons.push(newButton);

    // Ghi vào file buttons.js với định dạng đẹp hơn
    const buttonCode = `const buttons = ${JSON.stringify(existingButtons, null, 4)};\n\nexport default buttons;\n`;
    await fs.writeFile('./buttons.js', buttonCode);

    console.log(`[${moment().format('HH:mm:ss')}] [AI] Đã thêm 1 nút mới`);
  } else {
    console.log(`[${moment().format('HH:mm:ss')}] [AI] Không thêm nút mới do dữ liệu không hợp lệ`);
  }
}

console.log(`[${moment().format('HH:mm:ss')}] Bắt đầu tạo nút...`);
generateButtons().catch(error => {
  console.error(`[${moment().format('HH:mm:ss')}] Lỗi:`, error);
});
