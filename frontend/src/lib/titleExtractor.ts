function extractTitleFromContent(jsonString: string): string {
  try {
    const json = JSON.parse(jsonString);
    if (!json?.content) return "Untitled";

    for (const node of json.content) {
      if (node.type === "heading" || node.type === "paragraph") {
        const textNode = node.content?.find(
          (n: any) => n.type === "text" && n.text?.trim()
        );
        if (textNode) return textNode.text.trim();
      }
    }
    return "Untitled";
  } catch {
    return "Untitled";
  }
}
export default extractTitleFromContent;