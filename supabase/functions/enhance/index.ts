import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { ChatGoogleGenerativeAI } from "npm:@langchain/google-genai";
import { HumanMessage, SystemMessage } from "npm:@langchain/core/messages";
import { StructuredOutputParser } from "npm:langchain/output_parsers";
import { z } from "npm:zod";

interface JournalEntry {
  title: string;
  content: string;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*' as const,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' as const,
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  try {
    const { type, object } = await req.json();

    if (type === "journal_entry") {
      const { title, content } = object as JournalEntry;

      const parser = StructuredOutputParser.fromZodSchema(
        z.object({
          title: z.string().describe("The title of the journal entry"),
          content: z.string().describe("The content of the journal entry"),
        })
      );

      const systemPrompt = `You are an AI assistant that enhances dream journal entries.\n      Your goal is to refine the provided journal entry, improving its clarity, coherence, and expressiveness.\n      Maintain the original meaning and core story of the entry.\n      Do not add new information or alter facts.\n      Ensure the output is a valid JSON object with 'title' and 'content' keys.\n      If no title is provided please generate one, if one exist only fix spellings of it\n      ${parser.getFormatInstructions()}`;

      const humanPrompt = `Original Journal Entry:\n      Title: ${title}\n      Content: ${content}`;

      const model = new ChatGoogleGenerativeAI({
        apiKey: Deno.env.get("GOOGLE_API_KEY"),
        model: "gemini-2.5-flash",
      });

      const { content: enhancedContent } = await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(humanPrompt),
      ]);

      const parsedContent = await parser.parse(enhancedContent as string);

      return new Response(JSON.stringify({ type: "journal_entry", object: parsedContent }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ error: "Unsupported type" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});