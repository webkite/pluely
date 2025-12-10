import { Message } from "@/types";

export function getByPath(obj: any, path: string): any {
  if (!path) return obj;
  return path
    .replace(/\[/g, ".")
    .replace(/\]/g, "")
    .split(".")
    .reduce((o, k) => (o || {})[k], obj);
}

export function setByPath(obj: any, path: string, value: any): void {
  const keys = path.split(".");
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i].replace(/\[(\d+)\]/g, ".$1");
    if (!current[key]) current[key] = /^\d+$/.test(keys[i + 1]) ? [] : {};
    current = current[key];
  }
  current[keys[keys.length - 1].replace(/\[(\d+)\]/g, ".$1")] = value;
}

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = (reader.result as string)?.split(",")[1] ?? "";
      resolve(base64data);
    };
    reader.onerror = reject;
  });
}

export function extractVariables(
  curl: string,
  includeAll = false
): { key: string; value: string }[] {
  if (typeof curl !== "string") {
    return [];
  }

  const regex = /\{\{([A-Z_]+)\}\}/g;
  const matches = curl?.match(regex) || [];
  const variables = matches
    .map((match) => {
      if (typeof match === "string") {
        return match.slice(2, -2);
      }
      return "";
    })
    .filter((v) => v !== "");

  const uniqueVariables = [...new Set(variables)];

  const doNotInclude = includeAll
    ? []
    : ["SYSTEM_PROMPT", "TEXT", "IMAGE", "AUDIO"];

  const filteredVariables = uniqueVariables?.filter(
    (variable) => !doNotInclude?.includes(variable)
  );

  return filteredVariables.map((variable) => ({
    key: variable?.toLowerCase()?.replace(/_/g, "_") || "",
    value: variable,
  }));
}

/**
 * Recursively processes a user message template to replace placeholders for text and images.
 * @param template The user message template object.
 * @param userMessage The user's text message.
 * @param imagesBase64 An array of base64 encoded images.
 * @returns The processed user message object.
 */
export function processUserMessageTemplate(
  template: any,
  userMessage: string,
  imagesBase64: string[] = []
): any {
  const escapeForJson = (value: string) =>
    JSON.stringify(value ?? "").slice(1, -1);

  const templateStr = JSON.stringify(template).replace(
    /\{\{TEXT\}\}/g,
    escapeForJson(userMessage)
  );
  const result = JSON.parse(templateStr);

  const imageReplacer = (node: any): any => {
    if (Array.isArray(node)) {
      const imageTemplateIndex = node.findIndex((item) =>
        JSON.stringify(item).includes("{{IMAGE}}")
      );

      if (imageTemplateIndex > -1) {
        const imageTemplate = node[imageTemplateIndex];
        const imageParts =
          imagesBase64.length > 0
            ? imagesBase64.map((img) => {
                const partStr = JSON.stringify(imageTemplate).replace(
                  /\{\{IMAGE\}\}/g,
                  img
                );
                return JSON.parse(partStr);
              })
            : [];

        const finalArray = [
          ...node.slice(0, imageTemplateIndex),
          ...imageParts,
          ...node.slice(imageTemplateIndex + 1),
        ];
        return finalArray.map(imageReplacer);
      }
      return node.map(imageReplacer);
    } else if (node && typeof node === "object") {
      const newNode: { [key: string]: any } = {};
      for (const key in node) {
        newNode[key] = imageReplacer(node[key]);
      }
      return newNode;
    }
    return node;
  };

  return imageReplacer(result);
}

/**
 * Builds a dynamic messages array from a template, incorporating history and the current user message.
 * @param messagesTemplate The message template array from the cURL configuration.
 * @param history An array of previous messages in the conversation.
 * @param userMessage The user's current text message.
 * @param imagesBase64 An array of base64 encoded images for the current message.
 * @returns The fully constructed messages array.
 */
export function buildDynamicMessages(
  messagesTemplate: any[],
  history: Message[],
  userMessage: string,
  imagesBase64: string[] = []
): any[] {
  const userMessageTemplateIndex = messagesTemplate.findIndex((m) =>
    JSON.stringify(m).includes("{{TEXT}}")
  );

  if (userMessageTemplateIndex === -1) {
    return [...history, { role: "user", content: userMessage }]; // Fallback
  }

  const prefixMessages = messagesTemplate.slice(0, userMessageTemplateIndex);
  const suffixMessages = messagesTemplate.slice(userMessageTemplateIndex + 1);
  const userMessageTemplate = messagesTemplate[userMessageTemplateIndex];

  const newUserMessage = processUserMessageTemplate(
    userMessageTemplate,
    userMessage,
    imagesBase64
  );

  return [...prefixMessages, ...history, newUserMessage, ...suffixMessages];
}

/**
 * Recursively walks through an object and replaces variable placeholders.
 * @param node The object or value to process.
 * @param variables A key-value map of variables to replace.
 * @returns The processed object.
 */
export function deepVariableReplacer(
  node: any,
  variables: Record<string, string>
): any {
  if (typeof node === "string") {
    let result = node;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
    }
    return result;
  }
  if (Array.isArray(node)) {
    return node.map((item) => deepVariableReplacer(item, variables));
  }
  if (node && typeof node === "object") {
    const newNode: { [key: string]: any } = {};
    for (const key in node) {
      newNode[key] = deepVariableReplacer(node[key], variables);
    }
    return newNode;
  }
  return node;
}

/**
 * Extracts content from a streaming API response chunk by trying a series of common JSON paths.
 * This makes the system more resilient to variations in streaming formats.
 * 
 * Supports:
 * - OpenAI Chat Completions API: choices[0].delta.content
 * - OpenAI Responses API: type="response.output_text.delta", delta field
 * - Gemini: candidates[0].content.parts[0].text
 * - Claude: delta.text
 * - Cohere: text
 * 
 * @param chunk The parsed JSON object from a stream line.
 * @param defaultPath The default, non-streaming content path for the provider.
 * @returns The extracted text content, or null if not found.
 */
export function getStreamingContent(
  chunk: any,
  defaultPath: string
): string | null {
  // Check for OpenAI Responses API semantic events first
  // The Responses API uses "type" field to identify event types
  const eventType = chunk?.type;
  
  if (eventType === "response.output_text.delta") {
    // OpenAI Responses API: text content is in "delta" field directly
    const delta = chunk?.delta;
    if (typeof delta === "string" && delta) {
      return delta;
    }
  }
  
  // A set of possible paths to check for streaming content.
  // Using a Set automatically handles duplicates.
  const possiblePaths = new Set([
    // 1. First, try a common modification for OpenAI-like providers.
    defaultPath.replace(".message.", ".delta."),
    // 2. Then, add other common patterns.
    "choices[0].delta.content", // OpenAI, Groq, Mistral, Perplexity
    "candidates[0].content.parts[0].text", // Gemini
    "delta.text", // Claude
    "text", // Cohere
    "output", // OpenAI Responses API (string)
    "output.content", // OpenAI Responses API (object)
    "output.text", // OpenAI Responses API (object)
    "delta", // Generic delta field
    // 3. Finally, use the original path as a fallback (for Gemini and others).
    defaultPath,
  ]);

  for (const path of possiblePaths) {
    // Skip empty or null paths
    if (!path) continue;

    const content = getByPath(chunk, path);

    // We only care about non-empty string content.
    // Some paths might resolve to objects (e.g., `choices[0].delta`), so we check the type.
    if (typeof content === "string" && content) {
      return content;
    }
  }

  // Return null if no content is found after trying all paths.
  return null;
}

export interface StreamDelta {
  content: string | null;
  reasoning: string | null;
}

/**
 * Extracts both content and reasoning from streaming response chunks.
 * 
 * Supports:
 * - OpenAI Chat Completions API: choices[0].delta.content, choices[0].delta.reasoning_content
 * - OpenAI Responses API: type="response.output_text.delta" for content,
 *                         type="response.reasoning_summary_text.delta" for reasoning
 * - DeepSeek R1: choices[0].delta.reasoning_content
 * 
 * @param chunk The parsed JSON object from a stream line.
 * @param defaultPath The default, non-streaming content path for the provider.
 * @returns StreamDelta with content and reasoning fields.
 */
export function getStreamingDelta(
  chunk: any,
  defaultPath: string
): StreamDelta {
  // Check for OpenAI Responses API semantic events first
  const eventType = chunk?.type;
  
  // Handle Responses API events
  if (eventType === "response.output_text.delta") {
    // Text content delta
    const delta = chunk?.delta;
    if (typeof delta === "string") {
      return { content: delta, reasoning: null };
    }
  }
  
  if (eventType === "response.reasoning_summary_text.delta") {
    // Reasoning content delta (for o1, o3 models)
    const delta = chunk?.delta;
    if (typeof delta === "string") {
      return { content: null, reasoning: delta };
    }
  }
  
  // Fall back to standard content extraction
  const content = getStreamingContent(chunk, defaultPath);

  // Check for reasoning content
  const reasoningPaths = [
    "choices[0].delta.reasoning_content", // DeepSeek R1
    "choices[0].delta.reasoning",
    "reasoning_content",
    "reasoning",
  ];

  let reasoning: string | null = null;
  for (const path of reasoningPaths) {
    const r = getByPath(chunk, path);
    if (typeof r === "string" && r) {
      reasoning = r;
      break;
    }
  }

  return { content, reasoning };
}
