import {
  AiDraftQuestion,
  aiDraftQuestionSchema,
} from "../schemas/ai-import-schema";
import { BuilderQuestionType } from "../schemas/builder-definition-schema";

export interface ExtractionResult {
  questions: AiDraftQuestion[];
  detectedCount: number;
  suggestedTitle?: string;
  suggestedDescription?: string;
}

/**
 * Extracts form questions from source text using LLM inference (if configured)
 * or a comprehensive intelligent parser.
 */
export async function extractQuestionsFromText(
  sourceText: string
): Promise<ExtractionResult> {
  const trimmed = sourceText.trim();
  if (!trimmed) {
    return { questions: [], detectedCount: 0 };
  }

  // Attempt external LLM extraction if an API key / gateway is configured
  const llmResult = await tryLlmExtraction(trimmed);
  if (llmResult && llmResult.questions.length > 0) {
    return llmResult;
  }

  // Fallback to intelligent semantic parser
  return parseQuestionsHeuristically(trimmed);
}

/**
 * Attempts extraction using OpenAI-compatible or Neon AI Gateway endpoint if configured.
 */
async function tryLlmExtraction(
  text: string
): Promise<ExtractionResult | null> {
  const apiKey =
    process.env.AI_GATEWAY_TOKEN ||
    process.env.NEON_AI_GATEWAY_KEY ||
    process.env.OPENAI_API_KEY;

  const baseUrl =
    process.env.AI_GATEWAY_URL ||
    process.env.OPENAI_BASE_URL ||
    (process.env.OPENAI_API_KEY ? "https://api.openai.com/v1" : null);

  if (!apiKey || !baseUrl) {
    return null;
  }

  try {
    const prompt = `You are a form analysis assistant. Extract structured form questions from the user's source text into a JSON object.
Supported question types are:
- SHORT_TEXT: Single line text (e.g. name, title, address)
- LONG_TEXT: Multi-line paragraph (e.g. feedback, bio, why, explanation)
- MULTIPLE_CHOICE: Single choice radio list
- CHECKBOX: Multi-select choices (e.g. "select all that apply")
- DROPDOWN: Dropdown select list
- RATING: Numeric rating scale (e.g. 1 to 5)
- EMAIL: Email address
- NUMBER: Numeric input (e.g. age, quantity, count)
- PHONE: Phone number
- DATE: Date picker

Return ONLY valid JSON matching this structure:
{
  "suggestedTitle": "Title if found",
  "suggestedDescription": "Description if found",
  "questions": [
    {
      "label": "Question text",
      "type": "SHORT_TEXT | LONG_TEXT | MULTIPLE_CHOICE | CHECKBOX | DROPDOWN | RATING | EMAIL | NUMBER | PHONE | DATE",
      "description": "Optional instructions or null",
      "required": true or false,
      "options": [{"label": "Choice 1"}, {"label": "Choice 2"}],
      "settings": {
        "placeholder": "Optional placeholder",
        "minRating": 1,
        "maxRating": 5
      }
    }
  ]
}

Source text to analyze:
${text.slice(0, 15000)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an expert form extractor. Respond with pure JSON only, no markdown backticks.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    // Clean markdown code fence if present
    const cleanJson = content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    const parsed = JSON.parse(cleanJson);
    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      return null;
    }

    const questions: AiDraftQuestion[] = [];
    for (let i = 0; i < parsed.questions.length; i++) {
      const q = parsed.questions[i];
      const validLabel = q.label?.trim() || `Question ${i + 1}`;
      const validOptions = Array.isArray(q.options)
        ? q.options.map((opt: any, optIdx: number) => ({
            id: `opt-${Date.now()}-${i}-${optIdx}`,
            label: typeof opt === "string" ? opt : opt.label || `Option ${optIdx + 1}`,
            value:
              typeof opt === "string"
                ? opt.toLowerCase().replace(/\s+/g, "_")
                : opt.value || opt.label?.toLowerCase().replace(/\s+/g, "_") || `option_${optIdx + 1}`,
          }))
        : undefined;

      const validated = aiDraftQuestionSchema.safeParse({
        id: `draft-${Date.now()}-${i}`,
        label: validLabel,
        type: q.type || "SHORT_TEXT",
        description: q.description || null,
        required: Boolean(q.required),
        options: validOptions,
        settings: q.settings,
      });

      if (validated.success) {
        questions.push(validated.data);
      }
    }

    return {
      questions,
      detectedCount: questions.length,
      suggestedTitle: parsed.suggestedTitle,
      suggestedDescription: parsed.suggestedDescription,
    };
  } catch {
    // If LLM call fails, gracefully fallback
    return null;
  }
}

/**
 * Intelligent semantic and rule-based parser that converts arbitrary questionnaire/survey
 * text into structured, typed Formly questions.
 */
export function parseQuestionsHeuristically(
  text: string
): ExtractionResult {
  const lines = text.split(/\r?\n/).map((l) => l.trimEnd());
  const questions: AiDraftQuestion[] = [];

  let suggestedTitle: string | undefined;
  let suggestedDescription: string | undefined;

  interface RawItem {
    rawHeader: string;
    descriptionLines: string[];
    options: string[];
    forcedType?: BuilderQuestionType;
  }

  const items: RawItem[] = [];
  let currentItem: RawItem | null = null;

  // Patterns
  const titleHeaderRegex = /^#\s+(.+)$/;
  const sectionHeaderRegex = /^##+\s+(.+)$/;
  const numberedQuestionRegex =
    /^(?:(?:Q(?:uestion)?\s*(\d+)[:.]?)|(?:\[?(\d+)\]?[.)]))\s*(.+)$/i;
  const bulletQuestionRegex = /^[-*•]\s+(.+)$/;
  const optionRegex =
    /^(?:[-*•]|\([xX ]?\)|\[[xX ]?\]|[a-zA-Z]\)|[a-zA-Z]\.|\d+\))\s+(.+)$/;
  const promptIndicatorRegex =
    /\?|:|\b(name|email|phone|date|rate|select|choose|feedback|comments)\b/i;

  for (let idx = 0; idx < lines.length; idx++) {
    const rawLine = lines[idx];
    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    // Check for top-level form title if not yet found
    if (!suggestedTitle && titleHeaderRegex.test(line)) {
      const match = line.match(titleHeaderRegex);
      if (match) {
        suggestedTitle = match[1].trim();
        continue;
      }
    }

    // Check if line is a markdown section header
    if (sectionHeaderRegex.test(line)) {
      const match = line.match(sectionHeaderRegex);
      if (match) {
        const headerText = match[1].trim();
        // If it looks like a question or form field, treat as new item
        if (
          promptIndicatorRegex.test(headerText) ||
          items.length > 0 ||
          suggestedTitle
        ) {
          if (currentItem) items.push(currentItem);
          currentItem = {
            rawHeader: headerText,
            descriptionLines: [],
            options: [],
          };
          continue;
        } else if (!suggestedTitle) {
          suggestedTitle = headerText;
          continue;
        }
      }
    }

    // Check if line is a numbered question: "1. What is...", "Q2: Rate...", "[3] Enter your name"
    const numberedMatch = line.match(numberedQuestionRegex);
    if (numberedMatch) {
      if (currentItem) items.push(currentItem);
      const questionText = numberedMatch[3].trim();
      currentItem = {
        rawHeader: questionText,
        descriptionLines: [],
        options: [],
      };
      continue;
    }

    // Check if line is an option for the current question
    // E.g.: "a) Yes", "[ ] Option 1", "( ) Strongly Agree", "- Red", "* Blue"
    const optionMatch = line.match(optionRegex);
    if (currentItem && optionMatch) {
      const candidateOption = optionMatch[1].trim();
      // Ensure candidate doesn't end with a question mark (which would indicate a new bullet question)
      if (!candidateOption.endsWith("?") && candidateOption.length < 150) {
        currentItem.options.push(candidateOption);
        continue;
      }
    }

    // Check if line is a bulleted question: "- What is your favorite color?"
    const bulletMatch = line.match(bulletQuestionRegex);
    if (bulletMatch && (line.endsWith("?") || !currentItem)) {
      if (currentItem) items.push(currentItem);
      currentItem = {
        rawHeader: bulletMatch[1].trim(),
        descriptionLines: [],
        options: [],
      };
      continue;
    }

    // Check if line ends with '?' or ':' (e.g. "How did you hear about us?", "Full Name:")
    if (line.endsWith("?") || (line.endsWith(":") && line.length < 80)) {
      if (currentItem) items.push(currentItem);
      currentItem = {
        rawHeader: line,
        descriptionLines: [],
        options: [],
      };
      continue;
    }

    // Check if line looks like a known standalone form field (e.g. "Full Name", "Company", "Email")
    if (isCommonFieldLabel(line)) {
      if (currentItem) items.push(currentItem);
      currentItem = {
        rawHeader: line,
        descriptionLines: [],
        options: [],
      };
      continue;
    }

    // Otherwise, line is part of description or continuation
    if (currentItem) {
      if (line.toLowerCase().startsWith("options:") || line.toLowerCase().startsWith("choices:")) {
        // Parse inline choices e.g. "Options: Yes, No, Maybe"
        const inlineChoices = line
          .replace(/^(?:options|choices):\s*/i, "")
          .split(/[,;/]/)
          .map((c) => c.trim())
          .filter(Boolean);
        if (inlineChoices.length > 0) {
          currentItem.options.push(...inlineChoices);
          continue;
        }
      }
      currentItem.descriptionLines.push(line);
    } else {
      // If we haven't started an item yet, could be form description
      if (!suggestedDescription) {
        suggestedDescription = line;
      }
    }
  }

  if (currentItem) {
    items.push(currentItem);
  }

  // Convert raw items into validated AiDraftQuestion objects
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    let header = item.rawHeader.trim();

    // Check for required flag: e.g. "*", "(required)", "[required]", "mandatory"
    let isRequired = false;
    if (/\*$/.test(header) || /\(\s*required\s*\)/i.test(header) || /\[\s*required\s*\]/i.test(header)) {
      isRequired = true;
      header = header
        .replace(/\*$/, "")
        .replace(/\(\s*required\s*\)/gi, "")
        .replace(/\[\s*required\s*\]/gi, "")
        .trim();
    }

    // Remove trailing colon or leading numbering if left
    header = header.replace(/:$/, "").replace(/^\d+[.)]\s*/, "").trim();
    if (!header) {
      header = `Question ${i + 1}`;
    }

    // Determine type
    const lowerHeader = header.toLowerCase();
    const descriptionText = item.descriptionLines.join(" ").trim();
    const lowerDesc = descriptionText.toLowerCase();

    let type: BuilderQuestionType = "SHORT_TEXT";
    let needsAttention = false;
    let attentionReason: string | undefined;

    if (item.options.length > 0) {
      // Choice question
      const isMultiSelect =
        lowerHeader.includes("select all") ||
        lowerHeader.includes("choose all") ||
        lowerHeader.includes("check all") ||
        lowerHeader.includes("one or more") ||
        lowerHeader.includes("any of the following") ||
        lowerDesc.includes("select all") ||
        lowerDesc.includes("check all");

      const isDropdown =
        lowerHeader.includes("dropdown") ||
        lowerHeader.includes("select your state") ||
        lowerHeader.includes("country");

      if (isMultiSelect) {
        type = "CHECKBOX";
      } else if (isDropdown) {
        type = "DROPDOWN";
      } else {
        type = "MULTIPLE_CHOICE";
      }

      if (item.options.length < 2) {
        needsAttention = true;
        attentionReason = "Detected fewer than 2 choices. Please verify or add more options.";
      }
    } else {
      // Infer from text keywords
      if (
        lowerHeader.includes("email") ||
        lowerHeader.includes("e-mail")
      ) {
        type = "EMAIL";
      } else if (
        lowerHeader.includes("phone") ||
        lowerHeader.includes("mobile") ||
        lowerHeader.includes("telephone") ||
        lowerHeader.includes("cell")
      ) {
        type = "PHONE";
      } else if (
        lowerHeader.includes("date") ||
        lowerHeader.includes("birthday") ||
        lowerHeader.includes("birth date") ||
        lowerHeader.includes("start date") ||
        lowerHeader.includes("deadline")
      ) {
        type = "DATE";
      } else if (
        lowerHeader.includes("rate") ||
        lowerHeader.includes("rating") ||
        lowerHeader.includes("scale of") ||
        lowerHeader.includes("how satisfied") ||
        lowerHeader.includes("satisfaction") ||
        lowerHeader.includes("stars")
      ) {
        type = "RATING";
      } else if (
        lowerHeader.includes("age") ||
        lowerHeader.includes("how many") ||
        lowerHeader.includes("number of") ||
        lowerHeader.includes("years of experience") ||
        lowerHeader.includes("quantity") ||
        lowerHeader.includes("salary") ||
        lowerHeader.includes("budget")
      ) {
        type = "NUMBER";
      } else if (
        lowerHeader.includes("why") ||
        lowerHeader.includes("describe") ||
        lowerHeader.includes("explain") ||
        lowerHeader.includes("feedback") ||
        lowerHeader.includes("comments") ||
        lowerHeader.includes("tell us") ||
        lowerHeader.includes("in your own words") ||
        lowerHeader.includes("message") ||
        lowerHeader.includes("bio") ||
        lowerHeader.includes("details")
      ) {
        type = "LONG_TEXT";
      } else {
        type = "SHORT_TEXT";
      }
    }

    // Build options
    let formattedOptions = undefined;
    if (["MULTIPLE_CHOICE", "CHECKBOX", "DROPDOWN"].includes(type)) {
      formattedOptions = item.options.map((opt, optIdx) => ({
        id: `opt-${Date.now()}-${i}-${optIdx}`,
        label: opt,
        value: opt.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || `option_${optIdx + 1}`,
      }));
    }

    // Settings
    let settings = undefined;
    if (type === "RATING") {
      let maxRating = 5;
      if (lowerHeader.includes("10") || lowerDesc.includes("10")) {
        maxRating = 10;
      }
      settings = { minRating: 1, maxRating };
    } else if (type === "SHORT_TEXT") {
      settings = { placeholder: "Short answer text" };
    } else if (type === "LONG_TEXT") {
      settings = { placeholder: "Long answer text" };
    }

    questions.push({
      id: `draft-${Date.now()}-${i}`,
      label: header,
      type,
      description: descriptionText.length > 0 ? descriptionText : null,
      required: isRequired,
      options: formattedOptions,
      settings,
      needsAttention,
      attentionReason,
    });
  }

  return {
    questions,
    detectedCount: questions.length,
    suggestedTitle,
    suggestedDescription,
  };
}

function isCommonFieldLabel(line: string): boolean {
  const common = [
    "full name",
    "first name",
    "last name",
    "name",
    "email",
    "email address",
    "phone",
    "phone number",
    "mobile number",
    "company",
    "organization",
    "job title",
    "department",
    "address",
    "street address",
    "city",
    "state",
    "zip code",
    "postal code",
    "country",
    "date of birth",
    "website",
    "linkedin profile",
    "comments",
    "feedback",
    "additional notes",
  ];
  return common.includes(line.toLowerCase().replace(/[:*]/g, "").trim());
}
