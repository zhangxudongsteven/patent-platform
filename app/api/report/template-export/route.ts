import { NextRequest } from "next/server";
import { generateReportDocumentFromTemplate } from "./service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      proposalName,
      ipcList,
      generatedFormula,
      searchResults,
      standardAdaptation,
      vehicleApplication,
      usageProspect,
      authorizationProspect,
      proposalGrade,
      conclusion,
    } = body;

    if (!proposalName || !generatedFormula) {
      return new Response(JSON.stringify({ error: "缺少必要信息" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const docxBuffer = await generateReportDocumentFromTemplate({
      proposalName,
      ipcList,
      generatedFormula,
      searchResults,
      standardAdaptation,
      vehicleApplication,
      usageProspect,
      authorizationProspect,
      proposalGrade,
      conclusion,
    });

    const encodedFilename = encodeURIComponent(`${proposalName}.docx`);

    return new Response(new Uint8Array(docxBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodedFilename}`,
      },
    });
  } catch (error) {
    console.error("文档生成错误:", error);
    return new Response(JSON.stringify({ error: "文档生成失败" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
