const xlsx = require('xlsx');
const pdfParse = require('pdf-parse');
const AdmZip = require('adm-zip');
const path = require('path');

async function parseExcel(buffer) {
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  let result = [];
  workbook.SheetNames.forEach(sheetName => {
    const sheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
    result.push({ sheetName, data: sheet });
  });
  return result;
}

async function parsePDF(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}

async function parseZIP(buffer) {
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();
  let files = [];
  for (let entry of entries) {
    if (!entry.isDirectory) {
      const ext = path.extname(entry.entryName).toLowerCase();
      if (ext === '.xlsx') {
        files.push(await parseExcel(entry.getData()));
      } else if (ext === '.pdf') {
        files.push(await parsePDF(entry.getData()));
      }
    }
  }
  return files;
}

async function parseFile(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.xlsx') {
    return await parseExcel(file.buffer);
  } else if (ext === '.pdf') {
    return await parsePDF(file.buffer);
  } else if (ext === '.zip') {
    return await parseZIP(file.buffer);
  } else {
    throw new Error('Unsupported file type');
  }
}

module.exports = { parseFile };