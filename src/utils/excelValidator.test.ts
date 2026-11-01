import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAndValidateExcelData, normalizeText, checkTextSimilarity, createExcelTemplateWorkbook } from './excelValidator';

test('normalizeText collapses spacing, lowercases, and removes punctuation', () => {
  const raw = '  Theo Luật Viên chức,  viên chức là ai???  ';
  const norm = normalizeText(raw);
  assert.equal(norm, 'theo luật viên chức viên chức là ai');
});

test('checkTextSimilarity returns high score for identical or slightly varying questions', () => {
  const t1 = 'Theo Luật Viên chức số 129/2025/QH15, viên chức là công dân Việt Nam được tuyển dụng theo tiêu chí nào?';
  const t2 = 'Theo Luật Viên chức năm 2025, viên chức là công dân Việt Nam tuyển dụng theo tiêu chí nào?';
  const score = checkTextSimilarity(t1, t2);
  assert.ok(score > 0.65, `Expected similarity > 0.65, got ${score}`);
});

test('parseAndValidateExcelData catches missing options, invalid answer key, and invalid difficulty', () => {
  const sampleData = [
    // Header
    ['STT', 'Nội dung câu hỏi', 'Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D', 'Đáp án đúng', 'Mức độ', 'Giải thích', 'Căn cứ'],
    // Valid row
    [1, 'Câu hỏi hợp lệ số 1', 'Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C', 'Lựa chọn D', 'A', 'Dễ', '', ''],
    // Row 3: Missing option C
    [2, 'Câu hỏi thiếu đáp án C', 'Lựa chọn A', 'Lựa chọn B', '', 'Lựa chọn D', 'B', 'Trung bình', '', ''],
    // Row 4: Invalid answer key 'E'
    [3, 'Câu hỏi đáp án sai', 'Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C', 'Lựa chọn D', 'E', 'Khó', '', ''],
    // Row 5: Invalid difficulty 'Cực khó'
    [4, 'Câu hỏi mức độ sai', 'Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C', 'Lựa chọn D', 'C', 'Cực khó', '', '']
  ];

  const result = parseAndValidateExcelData(sampleData);

  assert.equal(result.rows.length, 4);
  assert.equal(result.totalValid, 1);
  assert.equal(result.totalInvalid, 3);

  // Check row 3 error
  const rowMissingC = result.rows.find(r => r.rowNumber === 3);
  assert.ok(rowMissingC);
  assert.equal(rowMissingC.isValid, false);
  assert.ok(rowMissingC.errors.some(e => e.includes('Thiếu đáp án C')));

  // Check row 4 error
  const rowInvalidKey = result.rows.find(r => r.rowNumber === 4);
  assert.ok(rowInvalidKey);
  assert.equal(rowInvalidKey.isValid, false);
  assert.ok(rowInvalidKey.errors.some(e => e.includes('Đáp án đúng không hợp lệ')));

  // Check row 5 error
  const rowInvalidDiff = result.rows.find(r => r.rowNumber === 5);
  assert.ok(rowInvalidDiff);
  assert.equal(rowInvalidDiff.isValid, false);
  assert.ok(rowInvalidDiff.errors.some(e => e.includes('Mức độ không hợp lệ')));
});

test('createExcelTemplateWorkbook builds 3 sheets with proper headers', () => {
  const wb = createExcelTemplateWorkbook();
  assert.ok(wb.SheetNames.includes('Mau_Cau_Hoi'));
  assert.ok(wb.SheetNames.includes('Huong_Dan'));
  assert.ok(wb.SheetNames.includes('DanhMuc_GiaTri'));
});
