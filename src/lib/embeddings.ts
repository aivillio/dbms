/**
 * Generates or mocks 768-dimensional dense vector embeddings.
 * In production with an OPENAI_API_KEY, calls text-embedding-3-small (dimensions=768).
 * Falls back to deterministic L2-normalized vector generation for local testing.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && apiKey !== 'your_openai_api_key_here') {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text,
          dimensions: 768,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.data[0].embedding;
      }
    } catch (err) {
      console.warn('OpenAI API call failed, falling back to local deterministic embedding', err);
    }
  }

  // Fallback: Deterministic L2-normalized pseudo-embedding for 768 dimensions
  const vec: number[] = [];
  let sumSq = 0;
  for (let i = 0; i < 768; i++) {
    const charCode = text.charCodeAt(i % text.length) || 42;
    const val = Math.sin(charCode * (i + 1)) * Math.cos(charCode * (i + 2));
    vec.push(val);
    sumSq += val * val;
  }
  const norm = Math.sqrt(sumSq) || 1;
  return vec.map((v) => v / norm);
}
