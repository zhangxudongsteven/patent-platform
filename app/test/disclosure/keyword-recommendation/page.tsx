// app/test/disclosure/keyword-recommendation/page.tsx
'use client'; // 因为是交互页面，需要标记为客户端组件

import { useState } from 'react';

export default function KeywordRecommendationTestPage() {
  // 状态管理：输入参数和结果
  const [coreKeyword, setCoreKeyword] = useState('');
  const [technicalField, setTechnicalField] = useState('通用技术');
  const [desiredCount, setDesiredCount] = useState(5);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 调用您编写的后端API
  const handleRecommend = async () => {
    if (!coreKeyword.trim()) {
      setError('请输入核心关键词');
      return;
    }

    setLoading(true);
    setError('');
    setRecommendations([]);

    try {
      // 调用 GET 接口，您也可以改用 POST
      const response = await fetch(
        `/api/disclosure/keyword-recommendation?keyword=${encodeURIComponent(coreKeyword)}&field=${technicalField}&count=${desiredCount}`
      );

      const data = await response.json();

      if (data.success) {
        setRecommendations(data.data.recommendations);
      } else {
        setError(data.error || '推荐失败');
      }
    } catch (err) {
      console.error('请求出错:', err);
      setError('网络或服务器错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', display: 'flex', gap: '30px', height: 'calc(100vh - 120px)' }}>
      {/* 左侧输入区域 */}
      <div style={{ flex: 1, maxWidth: '400px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ marginBottom: '20px' }}>关键词推荐设置</h2>
        
        <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 核心关键词输入 */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>核心关键词 *</label>
            <input
              type="text"
              value={coreKeyword}
              onChange={(e) => setCoreKeyword(e.target.value)}
              placeholder="例如：智能座舱"
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          {/* 技术领域输入 */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>技术领域</label>
            <input
              type="text"
              value={technicalField}
              onChange={(e) => setTechnicalField(e.target.value)}
              placeholder="例如：汽车电子"
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          {/* 期望数量输入 */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>期望推荐数量</label>
            <input
              type="number"
              min="1"
              max="20"
              value={desiredCount}
              onChange={(e) => setDesiredCount(Number(e.target.value))}
              style={{ width: '100px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          {/* 触发按钮 */}
          <button
            onClick={handleRecommend}
            disabled={loading}
            style={{
              padding: '12px 24px',
              background: loading ? '#ccc' : '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              width: '100%',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            {loading ? '推荐中...' : '开始推荐'}
          </button>
        </div>

        {/* 错误信息显示 */}
        {error && (
          <div style={{ color: 'red', margin: '10px 0', padding: '10px', background: '#ffe6e6', borderRadius: '4px' }}>
            错误：{error}
          </div>
        )}

        {/* 使用提示 */}
        <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '4px' }}>
          <h4 style={{ marginBottom: '10px' }}>使用提示</h4>
          <ul style={{ fontSize: '14px', lineHeight: '1.5' }}>
            <li>输入核心关键词后，系统会基于LLM技术生成相关的扩展关联词</li>
            <li>选择合适的技术领域可以提高推荐结果的相关性</li>
            <li>推荐的关联词可用于专利检索、技术分析或专利申请文件撰写</li>
          </ul>
        </div>
      </div>

      {/* 右侧输出区域 */}
      <div style={{ flex: 1, minWidth: '400px', borderLeft: '1px solid #eee', paddingLeft: '30px' }}>
        <h2 style={{ marginBottom: '20px' }}>推荐结果</h2>
        
        {/* 结果展示区域 */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: '500' }}>生成的关联词（共 {recommendations.length} 个）</h3>
          {recommendations.length > 0 ? (
            <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '4px', maxHeight: '400px', overflowY: 'auto' }}>
              {recommendations.map((word, index) => (
                <div key={index} style={{ padding: '8px', borderBottom: '1px solid #eee', fontSize: '14px' }}>
                  {word}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '30px', background: '#f9f9f9', borderRadius: '4px', textAlign: 'center' }}>
              <p>暂无推荐结果，请点击左侧“开始推荐”按钮。</p>
            </div>
          )}
        </div>

        {/* 复制结果区域 */}
        {recommendations.length > 0 && (
          <div>
            <h3 style={{ marginBottom: '10px', fontSize: '16px', fontWeight: '500' }}>推荐结果（可直接复制）</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={recommendations.join('、')}
                readOnly
                style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <button
                onClick={() => navigator.clipboard.writeText(recommendations.join('、'))}
                style={{
                  padding: '0 15px',
                  background: '#0070f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                复制
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}