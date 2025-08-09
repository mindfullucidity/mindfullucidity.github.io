import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { HumanMessage, SystemMessage } from "npm:@langchain/core/messages";
import { StructuredOutputParser } from "npm:langchain/output_parsers";
import { z } from "npm:zod";

import { setupAIModel } from "../_shared/model_setup.ts";

interface JournalEntry {
  title: string;
  content: string;
}

interface Analysis {
  type: string;
  title: string;
  content: string;
}

interface GenerateOptions {
  type: string;
  depth: string;
  note: string;
}

interface RequestPayload {
  entry: JournalEntry;
  analyses: Analysis[];
  generate: GenerateOptions;
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
    const { entry, analyses, generate } = await req.json() as RequestPayload;

    const modelSetupResult = await setupAIModel(req);

    if (modelSetupResult.status !== 200) {
      return new Response(JSON.stringify({ error: modelSetupResult.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: modelSetupResult.status,
      });
    }

    const model = modelSetupResult.model;

    let systemPrompt = `You are an AI assistant specialized in generating insightful analyses of journal entries.`;
    let humanPrompt = `Journal Entry:\nTitle: ${entry.title}\nContent: ${entry.content}\n\n`;

    if (analyses && analyses.length > 0) {
      humanPrompt += `Existing Analyses:\n`;
      analyses.forEach(analysis => {
        const analysisSource = analysis.type === "personal" ? "User's Personal Analysis" : "AI Analysis";
        humanPrompt += `${analysisSource} (Type: ${analysis.type}, Title: ${analysis.title}): ${analysis.content}\n`;
      });
      humanPrompt += `\n`;
    }

    switch (generate.type) {
      case "jungian":
        systemPrompt += ` Your task is to provide a Jungian analysis of the provided journal entry, taking into account any existing analyses. Focus on identifying archetypes (e.g., the Self, the Shadow, the Anima/Animus, the Hero), symbols, and manifestations of the collective unconscious. Explain how these elements relate to the user's personal growth and individuation process.`;
        break;
      case "symbolic":
        systemPrompt += ` Your task is to provide a symbolic analysis of the provided journal entry, taking into account any existing analyses. Identify key symbols, metaphors, and imagery present in the entry. Explain their potential meanings and interpretations, considering both universal and personal contexts. Discuss how these symbols might represent underlying emotions, conflicts, or aspirations.`;
        break;
      case "narrative":
        systemPrompt += ` Your task is to provide a narrative analysis of the provided journal entry, taking into account any existing analyses. Analyze the journal entry as a story, focusing on its plot, characters (including the self as a character), setting, and overarching themes. Discuss the narrative arc, conflicts, resolutions, and how the story reflects the user's experiences and perceptions.`;
        break;
      case "cognitive-behavioral":
        systemPrompt += ` Your task is to provide a Cognitive Behavioral Therapy (CBT) analysis of the provided journal entry, taking into account any existing analyses. Identify automatic thoughts, cognitive distortions (e.g., all-or-nothing thinking, catastrophizing, overgeneralization), and their impact on emotions and behaviors. Suggest alternative, more balanced thoughts or coping strategies.`;
        break;
      case "psychodynamic":
        systemPrompt += ` Your task is to provide a psychodynamic analysis of the provided journal entry, taking into account any existing analyses. Explore unconscious processes, early experiences, defense mechanisms, and recurring patterns in relationships or behaviors. Discuss how past experiences might influence current feelings and actions described in the entry.`;
        break;
      case "humanistic":
        systemPrompt += ` Your task is to provide a humanistic analysis of the provided journal entry, taking into account any existing analyses. Focus on themes of self-actualization, personal growth, free will, and the search for meaning. Emphasize the user's subjective experience, potential, and inherent drive towards fulfillment. Discuss how the entry reflects their values, aspirations, and current state of being.`;
        break;
    }

    systemPrompt += `\n\n`;
    switch (generate.depth) {
      case "to-the-point":
        systemPrompt += `The analysis should be fewer than 50 words and give the core of the analysis.`;
        break;
      case "details":
        systemPrompt += `The analysis should be fewer than 400 words and give some details but not go too in-depth.`;
        break;
      case "in-depth":
        systemPrompt += `The analysis can be as long as it needs to be for a full analysis.`;
        break;
    }
    if (generate.note) {
      systemPrompt += ` Additional notes/instructions: ${generate.note}.`;
    }
        systemPrompt += `

Provide the analysis content directly as a markdown compliant string. Do not wrap it in JSON or provide a title.`;

    humanPrompt += `Generate a new AI analysis based on the type "${generate.type}" and depth "${generate.depth}".`;
    if (generate.note) {
      humanPrompt += ` Consider the following note: "${generate.note}".`;
    }

    const generatedResponse = await model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(humanPrompt),
    ]);

    // Extract the content from the generated response
    const contentString = generatedResponse.content;

    return new Response(JSON.stringify({ type: "ai_analysis", object: { content: contentString } }), {
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
