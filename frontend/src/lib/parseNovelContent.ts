export function parseNovelContent(value: string | null | undefined) {
  try {
    if (!value) {
      return { type: "doc", content: [] };
    }

    const json = JSON.parse(value);

    // Validate minimum schema structure
    if (json?.type === "doc" && Array.isArray(json.content)) {
      return json;
    }

    // Return empty doc if not valid
    return { type: "doc", content: [] };
  } catch (e) {
    return { type: "doc", content: [] };
  }
}
