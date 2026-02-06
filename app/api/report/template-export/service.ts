import { readFile } from "fs/promises";
import { join } from "path";
import AdmZip from "adm-zip";

export interface ReportData {
  proposalName: string;
  ipcList: Array<{ code: string }>;
  generatedFormula: string;
  searchResults: Array<{
    id: string;
    title: string;
    applicant: string;
    publicationNumber: string;
    publicationDate: string;
    relevance: number;
    similarities: string;
    differences: string;
    category: "X" | "Y" | "A";
  }>;
  standardAdaptation: boolean;
  vehicleApplication: boolean;
  usageProspect: string;
  authorizationProspect: string;
  proposalGrade: string;
  conclusion: string;
}

export async function generateReportDocumentFromTemplate(
  data: ReportData,
): Promise<Buffer> {
  const {
    proposalName,
    ipcList,
    generatedFormula,
    searchResults,
    usageProspect,
    authorizationProspect,
    proposalGrade,
    conclusion,
  } = data;
  const templatePath = join(process.cwd(), "public", "检索报告模板.docx");
  const templateBuffer = await readFile(templatePath);

  const zip = new AdmZip(templateBuffer);

  let documentXml = zip.readAsText("word/document.xml");

  const ipcCodes = ipcList.map((ipc) => ipc.code).join("、");

  const replacements: Record<string, string> = {
    提案名称: proposalName,
    检索日期: new Date().toLocaleDateString("zh-CN"),
    检索领域: ipcCodes,
    检索式: generatedFormula,
    提案等级: proposalGrade,
    授权前景: authorizationProspect,
    用途前景: usageProspect,
    结论: conclusion,
  };

  for (const [placeholder, value] of Object.entries(replacements)) {
    const escapedValue = convertToWordFormat(value);
    const pattern = new RegExp(
      `{{[^}]*${escapeRegExp(placeholder)}[^}]*}}`,
      "g",
    );
    documentXml = documentXml.replace(pattern, escapedValue);
  }

  documentXml = processSearchResults(documentXml, searchResults);

  zip.addFile("word/document.xml", Buffer.from(documentXml, "utf-8"));

  return zip.toBuffer();
}

function processSearchResults(
  documentXml: string,
  searchResults: ReportData["searchResults"],
): string {
  if (!searchResults || searchResults.length === 0) {
    return documentXml;
  }

  const resultRows = searchResults
    .map((result) => {
      const category = result.category;
      const pubAndTitle = `${result.publicationNumber}\\${result.title}`;
      const similarities = result.similarities || "无";
      const differences = result.differences || "无";
      const similaritiesAndDifferences = `相同点：${similarities}\n不同点：${differences}`;
      const formattedContent = convertToWordFormat(similaritiesAndDifferences);

      return `<w:tr w14:paraId="RESULT-${result.id}"><w:tblPrEx><w:tblCellMar><w:top w:w="15" w:type="dxa"/><w:left w:w="15" w:type="dxa"/><w:bottom w:w="15" w:type="dxa"/><w:right w:w="15" w:type="dxa"/></w:tblCellMar></w:tblPrEx><w:trPr><w:trHeight w:val="1949" w:hRule="atLeast"/></w:trPr><w:tc><w:tcPr><w:tcW w:w="754" w:type="dxa"/><w:tcBorders><w:top w:val="nil"/><w:left w:val="single" w:color="auto" w:sz="8" w:space="0"/><w:bottom w:val="single" w:color="auto" w:sz="4" w:space="0"/><w:right w:val="single" w:color="auto" w:sz="8" w:space="0"/></w:tcBorders><w:tcMar><w:top w:w="0" w:type="dxa"/><w:left w:w="108" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tcMar></w:tcPr><w:p w14:paraId="CAT-${result.id}"><w:pPr><w:rPr><w:rFonts w:hint="eastAsia" w:eastAsiaTheme="minorEastAsia"/><w:lang w:val="en-US" w:eastAsia="zh-CN"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:hint="eastAsia"/></w:rPr><w:t>${escapeXml(category)}</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="3246" w:type="dxa"/><w:tcBorders><w:top w:val="nil"/><w:left w:val="single" w:color="auto" w:sz="8" w:space="0"/><w:bottom w:val="single" w:color="auto" w:sz="4" w:space="0"/><w:right w:val="single" w:color="auto" w:sz="8" w:space="0"/></w:tcBorders><w:tcMar><w:top w:w="0" w:type="dxa"/><w:left w:w="108" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tcMar></w:tcPr><w:p w14:paraId="PUB-${result.id}"><w:pPr><w:rPr><w:rFonts w:hint="eastAsia" w:eastAsiaTheme="minorEastAsia"/><w:lang w:val="en-US" w:eastAsia="zh-CN"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:hint="eastAsia"/></w:rPr><w:t>${escapeXml(pubAndTitle)}</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="4522" w:type="dxa"/><w:tcBorders><w:top w:val="nil"/><w:left w:val="single" w:color="auto" w:sz="8" w:space="0"/><w:bottom w:val="single" w:color="auto" w:sz="4" w:space="0"/><w:right w:val="single" w:color="auto" w:sz="8" w:space="0"/></w:tcBorders><w:tcMar><w:top w:w="0" w:type="dxa"/><w:left w:w="108" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tcMar></w:tcPr><w:p w14:paraId="SIM-${result.id}"><w:pPr><w:rPr><w:rFonts w:hint="eastAsia" w:eastAsiaTheme="minorEastAsia"/><w:lang w:val="en-US" w:eastAsia="zh-CN"/></w:rPr></w:pPr>${formattedContent}</w:p></w:tc></w:tr>`;
    })
    .join("");

  const pattern = /<w:tr w14:paraId="04A067BB">[\s\S]*?<\/w:tr>/;
  documentXml = documentXml.replace(pattern, resultRows);

  return documentXml;
}

function convertToWordFormat(text: string): string {
  const lines = text.split(/\r?\n/);
  if (lines.length === 1) {
    return `<w:r><w:rPr><w:rFonts w:hint="eastAsia" w:eastAsiaTheme="minorEastAsia"/><w:lang w:val="en-US" w:eastAsia="zh-CN"/></w:rPr><w:t>${escapeXml(lines[0])}</w:t></w:r>`;
  }

  return lines
    .map((line, index) => {
      if (line === "") {
        return `<w:p><w:pPr><w:rPr><w:rFonts w:hint="eastAsia" w:eastAsiaTheme="minorEastAsia"/><w:lang w:val="en-US" w:eastAsia="zh-CN"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:hint="eastAsia" w:eastAsiaTheme="minorEastAsia"/><w:lang w:val="en-US" w:eastAsia="zh-CN"/></w:rPr><w:t xml:space="preserve"> </w:t></w:r></w:p>`;
      }
      const content = index === 0 ? line : `　　${line}`;
      return `<w:r><w:rPr><w:rFonts w:hint="eastAsia" w:eastAsiaTheme="minorEastAsia"/><w:lang w:val="en-US" w:eastAsia="zh-CN"/></w:rPr><w:t>${escapeXml(content)}</w:t></w:r>`;
    })
    .join("<w:br/>");
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
