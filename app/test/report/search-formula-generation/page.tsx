'use client';

import { useState } from 'react';

export default function SearchFormulaTestPage() {
  const [ipcCodes, setIpcCodes] = useState('');
  const [keywords, setKeywords] = useState('');
  const [result, setResult] = useState<{ format1: string; format2: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!keywords.trim()) {
      setError('请输入关键词');
      return;
    }

    if (!ipcCodes.trim()) {
      setError('请输入IPC/CPC分类号');
      return;
    }

    const keywordList = keywords.split(/[，、,\n]/).map(k => k.trim()).filter(k => k);
    const ipcList = ipcCodes.split(/[，、,\n]/).map(k => k.trim()).filter(k => k);

    if (keywordList.length === 0) {
      setError('请输入有效的关键词');
      return;
    }

    if (ipcList.length === 0) {
      setError('请输入有效的IPC/CPC分类号');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const [response1, response2] = await Promise.all([
        fetch('/api/report/search-formula-generation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            keywords: keywordList,
            ipcCodes: ipcList,
            outputFormat: 'format1',
          }),
        }),
        fetch('/api/report/search-formula-generation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            keywords: keywordList,
            ipcCodes: ipcList,
            outputFormat: 'format2',
          }),
        }),
      ]);

      const data1 = await response1.json();
      const data2 = await response2.json();

      if (data1.error || data2.error) {
        setError(data1.error || data2.error || '生成失败');
      } else {
        setResult({
          format1: data1.formula,
          format2: data2.formula,
        });
      }
    } catch (err) {
      console.error('请求出错:', err);
      setError('网络或服务器错误');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleClear = () => {
    setIpcCodes('');
    setKeywords('');
    setResult(null);
    setError('');
  };

  return (
    <div className="p-5 flex gap-7 h-[calc(100vh-120px)]">
      <div className="flex-1 max-w-[400px] flex flex-col">
        <h2 className="mb-5">专利检索式生成</h2>
        
        <div className="my-5 flex flex-col gap-4">
          <div>
            <label className="block mb-1.5 font-medium">IPC/CPC *</label>
            <textarea
              value={ipcCodes}
              onChange={(e) => setIpcCodes(e.target.value)}
              placeholder="例如：&#10;G06F&#10;G06N&#10;A61B"
              className="w-full p-2.5 border border-gray-200 rounded h-32 resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">
              支持用顿号、逗号或换行分隔
            </p>
          </div>

          <div>
            <label className="block mb-1.5 font-medium">关键词 *</label>
            <textarea
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="例如：&#10;人工智能&#10;医疗诊断&#10;机器学习&#10;深度学习&#10;图像识别"
              className="w-full p-2.5 border border-gray-200 rounded h-32 resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">
              支持用顿号、逗号或换行分隔
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`p-3 font-medium text-white rounded-md ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'}`}
          >
            {loading ? '生成中...' : '生成检索式'}
          </button>

          <button
            onClick={handleClear}
            className="p-3 font-medium bg-gray-200 hover:bg-gray-300 rounded-md cursor-pointer"
          >
            清空
          </button>

          {error && (
            <div className="text-red-500 my-2.5 p-2.5 bg-red-50 rounded">
              错误：{error}
            </div>
          )}

          <div className="mt-5 p-3.5 bg-gray-100 rounded">
            <h4 className="mb-2.5">使用提示</h4>
            <ul className="text-sm leading-relaxed">
              <li>输入关键词和IPC/CPC分类号后，系统会按照Incopat标准生成两种格式的检索式</li>
              <li>格式1包含关键词和IPC/CPC分类号，适合精确检索</li>
              <li>格式2仅包含关键词，适合广泛检索</li>
              <li>生成的检索式可直接用于Incopat专利数据库</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-[400px] border-l border-gray-200 pl-7 overflow-y-auto">
        <h2 className="mb-5">生成结果</h2>
        
        {!result && (
          <div className="p-7 bg-gray-50 rounded text-center">
            <p>暂无结果，请点击左侧"生成检索式"按钮。</p>
          </div>
        )}

        {result && (
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <h3 className="text-base font-medium">格式1：关键词 + IPC/CPC</h3>
                <button
                  onClick={() => handleCopy(result.format1)}
                  className="px-3.5 py-1.5 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 text-sm"
                >
                  复制
                </button>
              </div>
              <pre className="p-4 bg-blue-50 rounded text-sm whitespace-pre-wrap border border-blue-200">
                {result.format1}
              </pre>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2.5">
                <h3 className="text-base font-medium">格式2：仅关键词</h3>
                <button
                  onClick={() => handleCopy(result.format2)}
                  className="px-3.5 py-1.5 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 text-sm"
                >
                  复制
                </button>
              </div>
              <pre className="p-4 bg-green-50 rounded text-sm whitespace-pre-wrap border border-green-200">
                {result.format2}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
