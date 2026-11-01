import * as XLSX from 'xlsx';
import { ParsedExcelRow, AnswerKey, Difficulty, Question } from '../types';

/**
 * Normalizes question text for duplicate detection (lowercase, removes special chars, collapses spaces)
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks similarity between two strings (0 to 1) based on word-overlap
 */
export function checkTextSimilarity(text1: string, text2: string): number {
  const norm1 = normalizeText(text1);
  const norm2 = normalizeText(text2);
  if (norm1 === norm2) return 1.0;

  const words1 = new Set(norm1.split(' ').filter(w => w.length > 2));
  const words2 = new Set(norm2.split(' ').filter(w => w.length > 2));
  if (words1.size === 0 || words2.size === 0) return 0;

  let common = 0;
  for (const w of words1) {
    if (words2.has(w)) common++;
  }

  const union = new Set([...words1, ...words2]).size;
  return common / union;
}

export interface ParseOptions {
  existingQuestionsInTopic?: Question[];
}

/**
 * Parses raw 2D array or object array from SheetJS into ParsedExcelRow[]
 * Enforces all validation rules in Section 13 of Master Prompt.
 */
export function parseAndValidateExcelData(
  rawData: any[][],
  options: ParseOptions = {}
): {
  rows: ParsedExcelRow[];
  totalValid: number;
  totalInvalid: number;
  totalDuplicates: number;
} {
  if (!rawData || rawData.length <= 1) {
    return { rows: [], totalValid: 0, totalInvalid: 0, totalDuplicates: 0 };
  }

  // Row 0 is header. Data starts from index 1 (Excel Row 2)
  const rows: ParsedExcelRow[] = [];
  const normalizedSeenInFile = new Map<string, number>();

  const existingNormalized = (options.existingQuestionsInTopic || []).map(q => ({
    questionId: q.questionId,
    text: normalizeText(q.questionText),
    originalText: q.questionText
  }));

  for (let i = 1; i < rawData.length; i++) {
    const rawRow = rawData[i];
    const rowNumber = i + 1; // 1-indexed for Excel display

    // Check if entire row is empty
    if (!rawRow || rawRow.every((val: any) => val === undefined || val === null || String(val).trim() === '')) {
      continue;
    }

    const errors: string[] = [];
    const questionText = rawRow[1] ? String(rawRow[1]).trim() : '';
    const optionA = rawRow[2] ? String(rawRow[2]).trim() : '';
    const optionB = rawRow[3] ? String(rawRow[3]).trim() : '';
    const optionC = rawRow[4] ? String(rawRow[4]).trim() : '';
    const optionD = rawRow[5] ? String(rawRow[5]).trim() : '';
    const rawAnswer = rawRow[6] ? String(rawRow[6]).trim().toUpperCase() : '';
    const rawDifficulty = rawRow[7] ? String(rawRow[7]).trim() : '';
    const explanation = rawRow[8] ? String(rawRow[8]).trim() : '';
    const legalReference = rawRow[9] ? String(rawRow[9]).trim() : '';

    // Validation 1: Question text
    if (!questionText) {
      errors.push(`Dòng ${rowNumber}: Thiếu nội dung câu hỏi.`);
    }

    // Validation 2: All 4 options required
    if (!optionA) errors.push(`Dòng ${rowNumber}: Thiếu đáp án A.`);
    if (!optionB) errors.push(`Dòng ${rowNumber}: Thiếu đáp án B.`);
    if (!optionC) errors.push(`Dòng ${rowNumber}: Thiếu đáp án C.`);
    if (!optionD) errors.push(`Dòng ${rowNumber}: Thiếu đáp án D.`);

    // Validation 3: Correct answer must be A, B, C, or D
    let correctAnswer: AnswerKey = 'A';
    if (!['A', 'B', 'C', 'D'].includes(rawAnswer)) {
      errors.push(`Dòng ${rowNumber}: Đáp án đúng không hợp lệ ("${rawAnswer}"). Chỉ chấp nhận A, B, C hoặc D.`);
    } else {
      correctAnswer = rawAnswer as AnswerKey;
    }

    // Validation 4: Difficulty level
    let difficulty: Difficulty = 'Trung bình';
    const normDiff = rawDifficulty.toLowerCase();
    if (normDiff === 'dễ' || normDiff === 'de') {
      difficulty = 'Dễ';
    } else if (normDiff === 'trung bình' || normDiff === 'trung binh' || normDiff === 'tb') {
      difficulty = 'Trung bình';
    } else if (normDiff === 'khó' || normDiff === 'kho') {
      difficulty = 'Khó';
    } else {
      errors.push(`Dòng ${rowNumber}: Mức độ không hợp lệ ("${rawDifficulty}"). Chỉ chấp nhận Dễ, Trung bình, hoặc Khó.`);
    }

    // Duplicate detection
    let isDuplicate = false;
    let duplicateOf = '';

    if (questionText) {
      const norm = normalizeText(questionText);

      // Check within same file
      if (normalizedSeenInFile.has(norm)) {
        isDuplicate = true;
        duplicateOf = `Trùng với dòng ${normalizedSeenInFile.get(norm)} trong cùng tệp tải lên`;
        errors.push(`Dòng ${rowNumber}: Câu hỏi trùng lặp với dòng ${normalizedSeenInFile.get(norm)}.`);
      } else {
        normalizedSeenInFile.set(norm, rowNumber);

        // Check against existing question bank
        for (const ex of existingNormalized) {
          if (norm === ex.text || checkTextSimilarity(questionText, ex.originalText) > 0.85) {
            isDuplicate = true;
            duplicateOf = `Có thể trùng với câu hỏi đã có trong hệ thống (Mã: ${ex.questionId})`;
            // Warning: Duplicate with existing is flagged for admin review
            break;
          }
        }
      }
    }

    const isValid = errors.length === 0;

    rows.push({
      rowNumber,
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      difficulty,
      explanation,
      legalReference,
      isValid,
      errors,
      isDuplicate,
      duplicateOf
    });
  }

  const totalValid = rows.filter(r => r.isValid).length;
  const totalInvalid = rows.filter(r => !r.isValid).length;
  const totalDuplicates = rows.filter(r => r.isDuplicate).length;

  return { rows, totalValid, totalInvalid, totalDuplicates };
}

/**
 * Creates the official Excel template (.xlsx) with 3 sheets per Section 13.2
 */
export function createExcelTemplateWorkbook(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Mẫu câu hỏi (Mau_Cau_Hoi)
  const sampleHeaders = [
    'STT',
    'Nội dung câu hỏi',
    'Đáp án A',
    'Đáp án B',
    'Đáp án C',
    'Đáp án D',
    'Đáp án đúng',
    'Mức độ',
    'Giải thích',
    'Căn cứ pháp lý'
  ];

  const sampleRows = [
    sampleHeaders,
    [
      1,
      'Theo Luật Viên chức, viên chức là công dân Việt Nam được tuyển dụng theo tiêu chí nào?',
      'Được tuyển dụng theo vị trí việc làm, làm việc tại đơn vị sự nghiệp công lập theo hợp đồng làm việc',
      'Được bổ nhiệm giữ chức vụ lãnh đạo suốt đời',
      'Làm việc theo hợp đồng lao động tại doanh nghiệp',
      'Được bầu cử theo nhiệm kỳ tại cơ quan nhà nước',
      'A',
      'Dễ',
      'Viên chức được tuyển dụng theo vị trí việc làm và làm việc tại đơn vị sự nghiệp công lập.',
      'Điều 2, Luật Viên chức số 129/2025/QH15'
    ],
    [
      2,
      'Thời hạn xử lý kỷ luật đối với viên chức thông thường không quá bao nhiêu ngày?',
      'Không quá 30 ngày',
      'Không quá 90 ngày (vụ việc phức tạp không quá 150 ngày)',
      'Không quá 180 ngày',
      'Không quá 365 ngày',
      'B',
      'Trung bình',
      'Thời hạn xử lý kỷ luật viên chức thông thường là 90 ngày, vụ việc phức tạp không quá 150 ngày.',
      'Điều 5, Nghị định số 234/2026/NĐ-CP'
    ]
  ];

  const wsQuestions = XLSX.utils.aoa_to_sheet(sampleRows);
  // Auto-width columns
  wsQuestions['!cols'] = [
    { wch: 6 },
    { wch: 45 },
    { wch: 30 },
    { wch: 30 },
    { wch: 30 },
    { wch: 30 },
    { wch: 14 },
    { wch: 14 },
    { wch: 35 },
    { wch: 30 }
  ];
  XLSX.utils.book_append_sheet(wb, wsQuestions, 'Mau_Cau_Hoi');

  // Sheet 2: Hướng dẫn nhập dữ liệu (Huong_Dan)
  const guideRows = [
    ['QUY ĐỊNH VÀ HƯỚNG DẪN NHẬP DỮ LIỆU CÂU HỎI BẰNG EXCEL'],
    ['Hệ thống Ôn Thi Viên Chức Bắc Ninh - OnVienChucBacNinh'],
    [''],
    ['1. Cấu trúc cột bắt buộc:', ''],
    ['Cột 1: STT', 'Số thứ tự dòng (1, 2, 3...)'],
    ['Cột 2: Nội dung câu hỏi', 'Bắt buộc. Không để trống. Tối thiểu 10 ký tự.'],
    ['Cột 3: Đáp án A', 'Bắt buộc. Phương án lựa chọn A.'],
    ['Cột 4: Đáp án B', 'Bắt buộc. Phương án lựa chọn B.'],
    ['Cột 5: Đáp án C', 'Bắt buộc. Phương án lựa chọn C.'],
    ['Cột 6: Đáp án D', 'Bắt buộc. Phương án lựa chọn D.'],
    ['Cột 7: Đáp án đúng', 'Bắt buộc. Chỉ điền 1 chữ cái: A hoặc B hoặc C hoặc D.'],
    ['Cột 8: Mức độ', 'Bắt buộc. Chỉ điền một trong 3 giá trị: Dễ, Trung bình, Khó.'],
    ['Cột 9: Giải thích', 'Không bắt buộc. Ghi chú lý giải đáp án đúng.'],
    ['Cột 10: Căn cứ pháp lý', 'Không bắt buộc. Ghi rõ số điều, khoản, tên văn bản luật.'],
    [''],
    ['2. Lưu ý kiểm tra lỗi:', ''],
    ['- Mỗi câu hỏi phải có đủ 4 đáp án A, B, C, D.', ''],
    ['- Đáp án đúng không phân biệt chữ hoa, chữ thường nhưng chỉ chấp nhận A, B, C, D.', ''],
    ['- Hệ thống sẽ tự động đối soát câu hỏi trùng lặp với ngân hàng hiện tại.', ''],
    ['- Admin có thể chọn chế độ Thêm mới hoặc Thay thế toàn bộ chủ đề khi tải lên.', '']
  ];
  const wsGuide = XLSX.utils.aoa_to_sheet(guideRows);
  wsGuide['!cols'] = [{ wch: 30 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Huong_Dan');

  // Sheet 3: Danh mục giá trị (DanhMuc_GiaTri)
  const categoryRows = [
    ['CỘT', 'GIÁ TRỊ HỢP LỆ', 'GHI CHÚ'],
    ['Đáp án đúng', 'A', 'Chọn phương án A'],
    ['Đáp án đúng', 'B', 'Chọn phương án B'],
    ['Đáp án đúng', 'C', 'Chọn phương án C'],
    ['Đáp án đúng', 'D', 'Chọn phương án D'],
    ['Mức độ', 'Dễ', 'Câu hỏi nhận biết, cơ bản'],
    ['Mức độ', 'Trung bình', 'Câu hỏi thông hiểu, vận dụng'],
    ['Mức độ', 'Khó', 'Câu hỏi so sánh, tình huống pháp lý']
  ];
  const wsCategories = XLSX.utils.aoa_to_sheet(categoryRows);
  wsCategories['!cols'] = [{ wch: 18 }, { wch: 20 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsCategories, 'DanhMuc_GiaTri');

  return wb;
}
