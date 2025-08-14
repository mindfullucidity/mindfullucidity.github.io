import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { ChatGoogleGenerativeAI } from "npm:@langchain/google-genai";
import { HumanMessage, SystemMessage } from "npm:@langchain/core/messages";


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

    const { messages, responseType } = parseRequest(type, object);

    if (!messages) {
      return new Response(JSON.stringify({ error: "Unsupported type or invalid request object" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    messages.forEach((message, index) => {
      console.log(`Message ${index} length: ${message.content.length}`);
    });
    let enhancedContent: string;
    try {
      const { content } = await model.invoke(messages);
      enhancedContent = content as string;
    } catch (invokeError) {
      console.error("Error during model invocation:", invokeError);
      return new Response(JSON.stringify({ error: "Something went wrong while generating" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const parsedContent = await parseResponse(responseType, enhancedContent as string);

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
      const systemPrompt = `You are an AI assistant that enhances dream journal entries.
      Your goal is to refine the provided journal entry, improving its clarity, coherence, and expressiveness.
      Maintain the original meaning and core story of the entry.
      Do not add new information or alter facts.
      Ensure the output is in the format:
      :type:
      {type}
      :content:
      {content}
      where {type} is the title and {content} is the journal entry content.
      If no title is provided please generate one(keep it to 4 or less words), if one exist only fix spellings of it
      End the response with a new line followed by :EOF:`;
      const humanPrompt = `Original Journal Entry:
      Title: ${title}
      Content: ${content}`;
      return {
        messages: [new SystemMessage(systemPrompt), new HumanMessage(humanPrompt)],
        responseType: "journal_entry",
      };
    }
    case "personal_analysis": {
      const { type: analysisType, content } = object as PersonalAnalysis;
      const systemPrompt = `You are an AI assistant that enhances personal journal analyses.
      Your goal is to refine the provided personal analysis, improving its clarity, coherence, and expressiveness.
      Maintain the original meaning and core insights of the analysis.
      Do not add new information or alter facts.
      Ensure the output is in the format:
      :type:
      {type}
      :content:
      {content}
      where {type} is the analysis type and {content} is the personal analysis content.
      End the response with a new line followed by :EOF:`;
      const humanPrompt = `Original Personal Analysis:
      Type: ${analysisType}
      Content: ${content}`;
      return {
        messages: [new SystemMessage(systemPrompt), new HumanMessage(humanPrompt)],
        responseType: "personal_analysis",
      };
    }
    case "journal_details": {
      const { lucidity_level, lucidity_trigger } = object as JournalDetails;
      const systemPrompt = `You are an AI assistant that enhances lucidity trigger descriptions for dream journal entries.
Your goal is to refine the provided lucidity trigger, improving its clarity, coherence, and expressiveness.
Maintain the original meaning and core idea of the trigger.
Do not add new information or alter facts.
Ensure the output is in the format:
:type:
{type}
:content:
{content}
where {type} is 'lucidity_trigger' and {content} is the enhanced lucidity trigger text.
Context: The user's lucidity level was ${lucidity_level}.
End the response with a new line followed by :EOF:`;
      const humanPrompt = `Original Lucidity Trigger: ${lucidity_trigger}`;
      return {
        messages: [new SystemMessage(systemPrompt), new HumanMessage(humanPrompt)],
        responseType: "journal_details",
      };
    }
    default:
      return { messages: null, responseType: null };
  }
}

async function parseResponse(type: string, enhancedContent: string) {
  enhancedContent = enhancedContent.replace(/:EOF:$/, '').trim();

  const typeMatch = enhancedContent.match(/:type:\n([\s\S]*?)\n:content:/);
  const contentMatch = enhancedContent.match(/:content:\n([\s\S]*)/);

  if (!typeMatch || !contentMatch) {
    throw new Error("Invalid response format from AI. Expected ':type:\n{type}\n:content:\n{content}'");
  }

  const extractedType = typeMatch[1].trim();
  const extractedContent = contentMatch[1].trim();

  switch (type) {
    case "journal_entry":
      return { title: extractedType, content: extractedContent };
    case "personal_analysis":
      return { type: extractedType, content: extractedContent };
    case "journal_details":
      return { lucidity_trigger: extractedContent };
    default:
      throw new Error("Unsupported response type");
  }
}