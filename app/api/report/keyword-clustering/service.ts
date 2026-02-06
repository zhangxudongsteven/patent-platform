import { getEmbeddings } from "@/lib/service/embedding";

export async function generateClusters(params: {
  keywords: string[];
}): Promise<any[]> {
  try {
    const { keywords } = params;
    if (!keywords || keywords.length === 0) {
      return [];
    }

    // 1. 获取 Embeddings
    const embeddings = await getEmbeddings(keywords);

    // 2. 运行 Affinity Propagation
    // damping: 0.5, maxIter: 200, convergenceIter: 15
    // 支持 'euclidean' (负欧氏距离) 或 'cosine' (余弦相似度)
    const ap = new AffinityPropagation(0.5, 200, 15, null, "cosine");
    ap.fit(embeddings);

    const labels = ap.labels;
    const centers = ap.clusterCentersIndices;

    if (!labels || !centers) {
      throw new Error("聚类失败");
    }

    // 4. 整理聚类结果
    const clusterMap = new Map<number, string[]>();
    labels.forEach((labelIdx, keywordIdx) => {
      if (!clusterMap.has(labelIdx)) {
        clusterMap.set(labelIdx, []);
      }
      clusterMap.get(labelIdx)?.push(keywords[keywordIdx]);
    });

    let idCounter = 1;

    // 5. 生成结果
    // 根据用户要求，不再使用 LLM 命名，而是简单使用 1, 2, 3 进行命名
    const results = Array.from(clusterMap.entries()).map(
      ([_, clusterKeywords], index) => {
        return {
          id: idCounter++,
          name: (index + 1).toString(), // 简单的 1, 2, 3 命名
          keywords: clusterKeywords,
        };
      },
    );

    return results;
  } catch (error) {
    console.error("关键词聚类生成时发生错误:", error);
    // 降级处理：全部归为一个组
    return [
      {
        id: 1,
        name: "1",
        keywords: params.keywords,
      },
    ];
  }
}

export type AffinityMetric = "euclidean" | "cosine" | "precomputed";

/**
 * Affinity Propagation 聚类算法
 * 基于 sklearn.cluster.AffinityPropagation 的 TypeScript 重实现
 */
export class AffinityPropagation {
  private damping: number;
  private maxIter: number;
  private convergenceIter: number;
  private preference: number | null;
  private affinity: AffinityMetric;

  public clusterCentersIndices: number[] | null = null;
  public labels: number[] | null = null;
  public nIter: number = 0;

  constructor(
    damping: number = 0.5,
    maxIter: number = 200,
    convergenceIter: number = 15,
    preference: number | null = null,
    affinity: AffinityMetric = "euclidean",
  ) {
    if (damping < 0.5 || damping >= 1) {
      throw new Error("Damping factor must be between 0.5 and 1");
    }
    this.damping = damping;
    this.maxIter = maxIter;
    this.convergenceIter = convergenceIter;
    this.preference = preference;
    this.affinity = affinity;
  }

  // 创建全零矩阵的辅助函数
  private zeros(rows: number, cols: number): number[][] {
    return Array.from({ length: rows }, () => new Array(cols).fill(0));
  }

  /**
   * 拟合聚类模型
   * @param X 数据矩阵或相似度矩阵（如果 affinity 为 'precomputed'）
   */
  public fit(X: number[][]): this {
    let S: number[][];

    if (this.affinity === "precomputed") {
      S = X;
    } else if (this.affinity === "euclidean") {
      S = AffinityPropagation.computeNegativeEuclideanDistance(X);
    } else if (this.affinity === "cosine") {
      S = AffinityPropagation.computeCosineSimilarity(X);
    } else {
      throw new Error(`Unknown affinity metric: ${this.affinity}`);
    }

    const nSamples = S.length;
    if (nSamples === 0) return this;

    // 如果需要，初始化偏好值 (preference)
    let preferenceValue = this.preference;
    if (preferenceValue === null) {
      const flatS = S.flat();
      flatS.sort((a, b) => a - b);
      const mid = Math.floor(flatS.length / 2);
      preferenceValue =
        flatS.length % 2 !== 0 ? flatS[mid] : (flatS[mid - 1] + flatS[mid]) / 2;
    }

    // 将偏好值应用到对角线
    const S_matrix = S.map((row, i) =>
      row.map((val, j) => (i === j ? (preferenceValue as number) : val)),
    );

    // 初始化消息矩阵
    let A = this.zeros(nSamples, nSamples);
    let R = this.zeros(nSamples, nSamples);

    let convergenceCount = 0;
    const exemplarHistory: string[] = [];

    for (let it = 0; it < this.maxIter; it++) {
      // 1. 计算归属度 (Responsibility, R)
      // r(i, k) <- s(i, k) - max_{k' != k} { a(i, k') + s(i, k') }

      // 预计算 AS = A + S
      const AS = S_matrix.map((row, i) => row.map((val, j) => val + A[i][j]));

      // 寻找每行的最大值
      const maxAS = new Array(nSamples).fill(-Infinity);
      const maxIdxs = new Array(nSamples).fill(-1);
      const secondMaxAS = new Array(nSamples).fill(-Infinity);

      for (let i = 0; i < nSamples; i++) {
        for (let k = 0; k < nSamples; k++) {
          if (AS[i][k] > maxAS[i]) {
            secondMaxAS[i] = maxAS[i];
            maxAS[i] = AS[i][k];
            maxIdxs[i] = k;
          } else if (AS[i][k] > secondMaxAS[i]) {
            secondMaxAS[i] = AS[i][k];
          }
        }
      }

      // 更新 R
      const R_new = this.zeros(nSamples, nSamples);

      for (let i = 0; i < nSamples; i++) {
        for (let k = 0; k < nSamples; k++) {
          const maxVal = k === maxIdxs[i] ? secondMaxAS[i] : maxAS[i];
          const update = S_matrix[i][k] - maxVal;
          R_new[i][k] = (1 - this.damping) * update + this.damping * R[i][k];
        }
      }
      R = R_new;

      // 2. 计算可用度 (Availability, A)
      // a(i, k) <- min(0, r(k, k) + sum_{i' not in {i, k}} max(0, r(i', k))) for i != k
      // a(k, k) <- sum_{i' != k} max(0, r(i', k))

      const A_new = this.zeros(nSamples, nSamples);

      // 计算每列正归属度的和 (不包括对角线)
      // Rp = max(0, R)
      // Rp[diagonal] = 0
      const Rp = R.map((row, i) =>
        row.map((val, j) => (i === j ? 0 : Math.max(0, val))),
      );
      const Rp_sum = new Array(nSamples).fill(0);
      for (let k = 0; k < nSamples; k++) {
        for (let i = 0; i < nSamples; i++) {
          Rp_sum[k] += Rp[i][k];
        }
      }

      for (let i = 0; i < nSamples; i++) {
        for (let k = 0; k < nSamples; k++) {
          if (i !== k) {
            // a(i, k) = min(0, r(k, k) + sum_{i' != i, k} max(0, r(i', k)))
            // sum_{i' != i, k} max(0, r(i', k)) = Rp_sum[k] - Rp[i][k]
            // Note: Rp[i][k] is max(0, R[i][k])
            const val = R[k][k] + Rp_sum[k] - Rp[i][k];
            const update = Math.min(0, val);
            A_new[i][k] = (1 - this.damping) * update + this.damping * A[i][k];
          } else {
            // a(k, k) = sum_{i' != k} max(0, r(i', k)) = Rp_sum[k]
            const update = Rp_sum[k];
            A_new[k][k] = (1 - this.damping) * update + this.damping * A[i][k];
          }
        }
      }
      A = A_new;

      // 检查是否收敛
      // 识别聚类中心: i where R(i, i) + A(i, i) > 0
      const currentExemplars: number[] = [];
      for (let i = 0; i < nSamples; i++) {
        if (A[i][i] + R[i][i] > 0) {
          currentExemplars.push(i);
        }
      }

      const currentExemplarsStr = JSON.stringify(currentExemplars);
      exemplarHistory.push(currentExemplarsStr);
      if (exemplarHistory.length > this.convergenceIter) {
        exemplarHistory.shift();
      }

      if (exemplarHistory.length === this.convergenceIter) {
        const allSame = exemplarHistory.every((e) => e === exemplarHistory[0]);
        if (allSame) {
          convergenceCount++;
        } else {
          convergenceCount = 0;
        }
      }

      if (convergenceCount >= 1) {
        this.nIter = it + 1;
        break;
      }
    }

    // 最终分配
    const E = A.map((row, i) => row.map((val, j) => val + R[i][j]));
    const labels = new Array(nSamples).fill(-1);
    const clusterCentersIndices: number[] = [];

    // 寻找聚类中心 (Exemplars)
    for (let i = 0; i < nSamples; i++) {
      if (E[i][i] > 0) {
        clusterCentersIndices.push(i);
      }
    }

    // 分配标签
    if (clusterCentersIndices.length > 0) {
      for (let i = 0; i < nSamples; i++) {
        // 找到使相似度最大化的聚类中心 k
        let maxSim = -Infinity;
        let bestExemplar = -1;

        // 策略: 分配给 max S(i, exemplar) 的聚类中心
        // 这是标准的 AP 细化步骤
        for (const exemplarIdx of clusterCentersIndices) {
          const sim = S[i][exemplarIdx];
          if (sim > maxSim) {
            maxSim = sim;
            bestExemplar = exemplarIdx;
          }
        }
        labels[i] = bestExemplar;
      }

      // 将标签重映射到 0..n_clusters-1
      const uniqueLabels = Array.from(new Set(labels)).sort((a, b) => a - b);
      const labelMap = new Map();
      uniqueLabels.forEach((l, idx) => labelMap.set(l, idx));
      this.labels = labels.map((l) => labelMap.get(l));
      this.clusterCentersIndices = clusterCentersIndices;
    } else {
      this.labels = new Array(nSamples).fill(-1);
      this.clusterCentersIndices = [];
    }

    return this;
  }

  /**
   * 计算负欧氏距离平方矩阵的辅助函数
   * @param X 数据矩阵 (n_samples x n_features)
   */
  public static computeNegativeEuclideanDistance(X: number[][]): number[][] {
    const nSamples = X.length;
    if (nSamples === 0) return [];
    const nFeatures = X[0].length;
    const S = Array.from({ length: nSamples }, () =>
      new Array(nSamples).fill(0),
    );

    for (let i = 0; i < nSamples; i++) {
      for (let j = 0; j < nSamples; j++) {
        if (i === j) {
          S[i][j] = 0;
        } else {
          let sumSq = 0;
          for (let k = 0; k < nFeatures; k++) {
            const diff = X[i][k] - X[j][k];
            sumSq += diff * diff;
          }
          S[i][j] = -sumSq;
        }
      }
    }
    return S;
  }

  /**
   * 计算余弦相似度矩阵的辅助函数
   * @param X 数据矩阵 (n_samples x n_features)
   */
  public static computeCosineSimilarity(X: number[][]): number[][] {
    const nSamples = X.length;
    if (nSamples === 0) return [];
    const nFeatures = X[0].length;
    const S = Array.from({ length: nSamples }, () =>
      new Array(nSamples).fill(0),
    );

    // 预计算向量模长
    const magnitudes = new Array(nSamples).fill(0);
    for (let i = 0; i < nSamples; i++) {
      let sumSq = 0;
      for (let k = 0; k < nFeatures; k++) {
        sumSq += X[i][k] * X[i][k];
      }
      magnitudes[i] = Math.sqrt(sumSq);
    }

    for (let i = 0; i < nSamples; i++) {
      for (let j = 0; j < nSamples; j++) {
        if (i === j) {
          S[i][j] = 1.0; // 自身相似度为 1
        } else {
          let dotProduct = 0;
          for (let k = 0; k < nFeatures; k++) {
            dotProduct += X[i][k] * X[j][k];
          }
          const denom = magnitudes[i] * magnitudes[j];
          // 避免除以零
          S[i][j] = denom === 0 ? 0 : dotProduct / denom;
        }
      }
    }
    return S;
  }
}
