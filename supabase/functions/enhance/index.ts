import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { ChatGoogleGenerativeAI } from "npm:@langchain/google-genai";
import { HumanMessage, SystemMessage } from "npm:@langchain/core/messages";
import { StructuredOutputParser } from "npm:langchain/output_parsers";
import { z } from "npm:zod";

import { setupAIModel } from "../_shared/model_setup.ts";

interface JournalEntry {
  title: string;
  content: string;
}

interface PersonalAnalysis {
  type: string;
  content: string;
}

interface JournalDetails {
  lucidity_level: number;
  lucidity_trigger: string;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*' as const,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, X-AI-Settings' as const,
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


    const modelSetupResult = await setupAIModel(req);

    if (modelSetupResult.status !== 200) {
      return new Response(JSON.stringify({ error: modelSetupResult.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: modelSetupResult.status,
      });
    }

    const model = modelSetupResult.model;

    const { messages, parser, responseType } = parseRequest(type, object);

    if (!messages || !parser) {
      return new Response(JSON.stringify({ error: "Unsupported type or invalid request object" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    messages.forEach((message, index) => {
      console.log(`Message ${index} length: ${message.content.length}`);
    });
    const { content: enhancedContent } = await model.invoke(messages);

    const parsedContent = await parseResponse(responseType, enhancedContent as string, parser);

    return new Response(JSON.stringify({ type: responseType, object: parsedContent }), {
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

function parseRequest(type: string, object: any) {
  switch (type) {
    case "journal_entry": {
      const { title, content } = object as JournalEntry;
      const parser = StructuredOutputParser.fromZodSchema(
        z.object({
          title: z.string().describe("The title of the journal entry"),
          content: z.string().describe("The content of the journal entry"),
        })
      );
      const systemPrompt = `You are an AI assistant that enhances dream journal entries.
      Your goal is to refine the provided journal entry, improving its clarity, coherence, and expressiveness.
      Maintain the original meaning and core story of the entry.
      Do not add new information or alter facts.
      Ensure the output is a valid JSON object with 'title' and 'content' keys.
      If no title is provided please generate one(keep it to 4 or less words), if one exist only fix spellings of it
      ${parser.getFormatInstructions()}`;
      const humanPrompt = `Original Journal Entry:
      Title: ${title}
      Content: ${content}`;
      return {
        messages: [new SystemMessage(systemPrompt), new HumanMessage(humanPrompt)],
        parser,
        responseType: "journal_entry",
      };
    }
    case "personal_analysis": {
      const { type: analysisType, content } = object as PersonalAnalysis;
      const parser = StructuredOutputParser.fromZodSchema(
        z.object({
          type: z.string().describe("The type of the personal analysis"),
          content: z.string().describe("The content of the personal analysis"),
        })
      );
      const systemPrompt = `You are an AI assistant that enhances personal journal analyses.
      Your goal is to refine the provided personal analysis, improving its clarity, coherence, and expressiveness.
      Maintain the original meaning and core insights of the analysis.
      Do not add new information or alter facts.
      Ensure the output is a valid JSON object with 'type' and 'content' keys.
      ${parser.getFormatInstructions()}`;
      const humanPrompt = `Original Personal Analysis:
      Type: ${analysisType}
      Content: ${content}`;
      return {
        messages: [new SystemMessage(systemPrompt), new HumanMessage(humanPrompt)],
        parser,
        responseType: "personal_analysis",
      };
    }
    case "journal_details": {
      const { lucidity_level, lucidity_trigger } = object as JournalDetails;
      const parser = StructuredOutputParser.fromZodSchema(
        z.object({
          lucidity_trigger: z.string().describe("The enhanced lucidity trigger text"),
        })
      );
      const systemPrompt = `You are an AI assistant that enhances lucidity trigger descriptions for dream journal entries.
Your goal is to refine the provided lucidity trigger, improving its clarity, coherence, and expressiveness.
Maintain the original meaning and core idea of the trigger.
Do not add new information or alter facts.
Ensure the output is a valid JSON object with a 'lucidity_trigger' key.
Context: The user's lucidity level was ${lucidity_level}.`;
      const humanPrompt = `Original Lucidity Trigger: ${lucidity_trigger}`;
      return {
        messages: [new SystemMessage(systemPrompt), new HumanMessage(humanPrompt)],
        parser,
        responseType: "journal_details",
      };
    }
    default:
      return { messages: null, parser: null, responseType: null };
  }
}

async function parseResponse(type: string, enhancedContent: string, parser: StructuredOutputParser<any>) {
  switch (type) {
    case "journal_entry":
    case "personal_analysis":
    case "journal_details":
      return await parser.parse(enhancedContent);
    default:
      throw new Error("Unsupported response type");
  }
}