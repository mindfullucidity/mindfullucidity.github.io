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

      const { content: enhancedContent } = await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(humanPrompt),
      ]);

      const parsedContent = await parser.parse(enhancedContent as string);

      return new Response(JSON.stringify({ type: "journal_entry", object: parsedContent }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else if (type === "personal_analysis") {
      const { type: analysisType, content } = object as PersonalAnalysis;

      const parser = StructuredOutputParser.fromZodSchema(
        z.object({
          type: z.string().describe("The type of the personal analysis"),
          content: z.string().describe("The content of the personal analysis"),
        })
      );

      const systemPrompt = `You are an AI assistant that enhances personal journal analyses.\n      Your goal is to refine the provided personal analysis, improving its clarity, coherence, and expressiveness.\n      Maintain the original meaning and core insights of the analysis.\n      Do not add new information or alter facts.\n      Ensure the output is a valid JSON object with 'type' and 'content' keys.\n      ${parser.getFormatInstructions()}`;

      const humanPrompt = `Original Personal Analysis:\n      Type: ${analysisType}\n      Content: ${content}`;

      const { content: enhancedContent } = await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(humanPrompt),
      ]);

      const parsedContent = await parser.parse(enhancedContent as string);

      return new Response(JSON.stringify({ type: "personal_analysis", object: parsedContent }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else if (type === "journal_details") {
      const { lucidity_level, lucidity_trigger } = object as JournalDetails;

      const parser = StructuredOutputParser.fromZodSchema(
        z.object({
          lucidity_trigger: z.string().describe("The enhanced lucidity trigger text"),
        })
      );

      const systemPrompt = `You are an AI assistant that enhances lucidity trigger descriptions for dream journal entries.\nYour goal is to refine the provided lucidity trigger, improving its clarity, coherence, and expressiveness.\nMaintain the original meaning and core idea of the trigger.\nDo not add new information or alter facts.\nEnsure the output is a valid JSON object with a 'lucidity_trigger' key.\nContext: The user's lucidity level was ${lucidity_level}.`;

      const humanPrompt = `Original Lucidity Trigger: ${lucidity_trigger}`;

      const { content: enhancedContent } = await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(humanPrompt),
      ]);

      const parsedContent = await parser.parse(enhancedContent as string);

      return new Response(JSON.stringify({ type: "journal_details", object: parsedContent }), {
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