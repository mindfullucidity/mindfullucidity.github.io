import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { ChatGoogleGenerativeAI } from "npm:@langchain/google-genai";
import { HumanMessage, SystemMessage } from "npm:@langchain/core/messages";

import { setupAIModel } from "../_shared/model_setup.ts";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*' as const,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, X-AI-Settings' as const,
};

interface JournalEntryData {
  title: string;
  content: string;
  lucidity_level: string;
  lucidity_trigger: string;
  mood: number;
  characteristics: string[];
  analyses: Array<{ type: string; title: string; content: string }>;
}

interface UserSymbol {
  symbol_id: number;
  category: string;
  name: string;
  description: string | null;
}

interface DetectSymbolsRequest {
  journal_entry_data: JournalEntryData;
  user_symbols: UserSymbol[];
  selected_symbol_ids: number[];
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  try {
    const { journal_entry_data, user_symbols } = await req.json() as DetectSymbolsRequest;

    const modelSetupResult = await setupAIModel(req);

    if (modelSetupResult.status !== 200) {
      return new Response(JSON.stringify({ error: modelSetupResult.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: modelSetupResult.status,
      });
    }

    const model = modelSetupResult.model;

    const systemPrompt = `
# AI Symbol Detection Assistant

You are an AI assistant specialized in analyzing dream journal entries and identifying relevant symbols from a provided list.

## Task
Your primary task is to:
1.  Read the provided **Journal Entry** (including its title, content, lucidity details, mood, and characteristics).
2.  Review the associated **Analyses** for deeper context.
3.  Examine the **User Symbols** list.
4.  Determine which of the *given user-defined symbols* are explicitly mentioned or strongly implied within the journal entry and its analyses.
5.  **Crucially, if there are already selected symbols, you should consider them as a baseline.** Your output should be a comprehensive list of *all* relevant symbols, including any from the 'Already Selected Symbols' list that are still relevant, plus any new relevant symbols you detect from the entry.

**Important Constraints:**
*   **Focus only on the symbols provided in the 'User Symbols' list.** Do not infer or suggest symbols not present in this list.
*   **Return your answer as a JSON array of the 'symbol_id's of the relevant symbols.**
*   If no symbols are relevant, return an empty array: '[]'.
*   **Do not remove symbols that were already selected unless they are clearly irrelevant based on the current entry.** Prioritize adding new relevant symbols while retaining existing ones if they still make sense.

## Expected Output Format
Your response MUST be a JSON array containing only the 'symbol_id' (number) of each detected relevant symbol. No additional text, explanations, or formatting outside the JSON array.

### Example Output:
[101, 205, 312]
`;

const analyses_text = journal_entry_data.analyses.map(a => `### Type: ${a.type}
#### Title: ${a.title}
#### Content:
${a.content}`).join('\n');

  const user_symbols_text = user_symbols.map(s => `- **ID:** ${s.symbol_id}
  - **Category:** ${s.category}
  - **Name:** ${s.name}
  - **Description:** ${s.description || 'N/A'}`).join('\n');

    const humanPrompt = `## Journal Entry Details

    

### Title:
${journal_entry_data.title}

### Content:
${journal_entry_data.content}

### Metadata:
- **Lucidity Level:** ${journal_entry_data.lucidity_level}
- **Lucidity Trigger:** ${journal_entry_data.lucidity_trigger ? journal_entry_data.lucidity_trigger : 'N/A'}
- **Mood:** ${journal_entry_data.mood}%
- **Characteristics:** ${journal_entry_data.characteristics && journal_entry_data.characteristics.length > 0 ? journal_entry_data.characteristics.join(', ') : 'N/A'}

## Analyses

${analyses_text}


## User Symbols

${user_symbols_text}

## Already Selected Symbols

${journal_entry_data.selected_symbol_ids && journal_entry_data.selected_symbol_ids.length > 0 ? journal_entry_data.selected_symbol_ids.join(', ') : 'None'}

---

**Relevant Symbol IDs:**`;

    let detectedSymbolIds: number[];
    try {
      const { content } = await model.invoke([new SystemMessage(systemPrompt), new HumanMessage(humanPrompt)]);
      const rawContent = content as string;
      detectedSymbolIds = JSON.parse(rawContent);
      if (!Array.isArray(detectedSymbolIds)) {
        throw new Error("AI response was not a JSON array.");
      }
    } catch (invokeError) {
      console.error("Error during model invocation or parsing AI response:", invokeError);
      return new Response(JSON.stringify({ error: "Something went wrong while detecting symbols." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ detected_symbol_ids: detectedSymbolIds }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
