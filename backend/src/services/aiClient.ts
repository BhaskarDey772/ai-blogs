// AI Client service - tries to use ai-sdk if available, otherwise falls back to OpenAI REST
export class AIClient {
  static async generateContent(prompt: string): Promise<string> {
    console.log("[AI] generateContent prompt:", prompt);

    // Try to load ai-sdk if installed
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const ai = require("ai");
      if (ai && ai.OpenAI) {
        const client = new ai.OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const resp = await client.chat.completions.create({
          model: process.env.AI_MODEL || "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a helpful blog writer. Output markdown.",
            },
            { role: "user", content: prompt },
          ],
        });
        const out = resp.choices?.[0]?.message?.content || "";
        return out;
      }
    } catch (e) {
      console.warn(
        "ai-sdk not available or failed to run, falling back to REST if key present",
        e
      );
    }

    // Fallback: use OpenAI REST directly if key available
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      console.warn("No OPENAI_API_KEY set; returning placeholder content.");
      return `# ${new Date()
        .toISOString()
        .slice(0, 10)} - Auto Article\n\nAI-generated content placeholder.`;
    }

    try {
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: process.env.AI_MODEL || "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a helpful blog writer. Output markdown.",
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 1200,
        }),
      });

      const data: any = await resp.json();
      const text =
        data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || "";
      return text;
    } catch (err) {
      console.error("Error calling OpenAI REST API:", err);
      return `# ${new Date()
        .toISOString()
        .slice(0, 10)} - Auto Article\n\nAI-generated content placeholder.`;
    }
  }
}
