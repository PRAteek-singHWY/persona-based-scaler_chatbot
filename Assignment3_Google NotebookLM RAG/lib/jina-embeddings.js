import { Embeddings } from "@langchain/core/embeddings";

export class JinaEmbeddings extends Embeddings {
  constructor(fields = {}) {
    super(fields);
    this.apiKey = fields.apiKey || process.env.JINA_API_KEY;
    this.model = fields.model || "jina-embeddings-v3";
    this.dimensions = fields.dimensions || 1024;
    this.batchSize = fields.batchSize || 24;
    this.baseUrl = fields.baseUrl || "https://api.jina.ai/v1/embeddings";
    if (!this.apiKey) throw new Error("JINA_API_KEY is required");
  }

  async embedDocuments(texts) {
    const out = [];
    for (let i = 0; i < texts.length; i += this.batchSize) {
      const batch = texts.slice(i, i + this.batchSize);
      const vectors = await this.callJina(batch);
      out.push(...vectors);
    }
    return out;
  }

  async embedQuery(text) {
    const [vec] = await this.callJina([text]);
    return vec;
  }

  async callJina(input) {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Jina API error ${res.status}: ${errText}`);
    }
    const json = await res.json();
    return json.data
      .sort((a, b) => a.index - b.index)
      .map((d) => d.embedding);
  }
}
