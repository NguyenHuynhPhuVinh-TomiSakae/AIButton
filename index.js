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
  
  Lưu ý:
  - CHỈ TẠO MỘT NÚT DUY NHẤT
  - Nút PHẢI CÓ THIẾT KẾ HOÀN TOÀN MỚI, không được trùng với bất kỳ nút nào đã có
  - Classes được sử dụng phải hoàn toàn khác với các classes đã có
  - Phong cách thiết kế phải độc đáo và không giống với các nút trước đó
  - Sử dụng các hiệu ứng hover, focus, active độc đáo
  - Khuyến khích sử dụng gradient, shadow, animation đặc biệt
  - Đảm bảo trả về đúng định dạng JSON với ĐÚNG MỘT PHẦN TỬ trong mảng`;

  const result = await model.generateContent(prompt);
  const newButton = JSON.parse(result.response.text())[0];

  // Thêm nút mới vào mảng hiện có
  existingButtons.push(newButton);

  // Ghi vào file buttons.js với định dạng đẹp hơn
  const buttonCode = `const buttons = ${JSON.stringify(existingButtons, null, 4)};\n\nexport default buttons;\n`;
  await fs.writeFile('./buttons.js', buttonCode);

  console.log(`[${moment().format('HH:mm:ss')}] [AI] Đã thêm 1 nút mới`);
}

console.log(`[${moment().format('HH:mm:ss')}] Bắt đầu tạo nút...`);
generateButtons().catch(error => {
  console.error(`[${moment().format('HH:mm:ss')}] Lỗi:`, error);
});
