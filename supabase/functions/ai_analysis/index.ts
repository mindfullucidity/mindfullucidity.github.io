import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { HumanMessage, SystemMessage } from "npm:@langchain/core/messages";
import { StructuredOutputParser } from "npm:langchain/output_parsers";
import { z } from "npm:zod";
import { createClient } from "npm:@supabase/supabase-js";

import { setupAIModel } from "../_shared/model_setup.ts";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
);

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
  userGender?: string;
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
    const { entry, analyses, generate, userGender } = await req.json() as RequestPayload;

    const modelSetupResult = await setupAIModel(req);

    if (modelSetupResult.status !== 200) {
      return new Response(JSON.stringify({ error: modelSetupResult.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: modelSetupResult.status,
      });
    }

    const model = modelSetupResult.model;

    let systemPrompt = `You are a compassionate spiritual guide and insightful dream interpreter, dedicated to helping individuals uncover deeper meaning and foster self-realization through their journal entries. Your purpose is to illuminate the hidden wisdom within their experiences, guiding them towards profound personal growth and understanding. Always ensure the generated content is appropriate and adheres to safety guidelines, suitable for a general audience.

    Crucially, your analysis should be presented as a standalone reflection, not as a direct message in a chat. Begin immediately with the analysis content, without any conversational opening or direct address to the user. While your tone should be empathetic and supportive, refrain from needless compliments or pandering; focus on genuine insights and guidance.`;
    let humanPrompt = '';

    if (userGender) {
      humanPrompt += `User Details:\n\tGender: ${userGender}\n\n`;
    }

    humanPrompt += `Journal Entry:\nTitle: ${entry.title}\nContent: ${entry.content}\n\n`;

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
        systemPrompt += ` Your sacred task is to offer a Jungian reflection on this journal entry, weaving in any existing insights. Gently explore the archetypal energies (such as the Self, the Shadow, the Anima/Animus, the Hero) and potent symbols that emerge, revealing how they resonate with the journey of your soul's unfolding and the path of individuation.`;
        break;
      case "cognitive-behavioral":
        systemPrompt += ` Your sacred task is to offer a compassionate Cognitive Behavioral reflection on this journal entry, integrating any existing insights. Gently identify the automatic thoughts and cognitive patterns that may be clouding perception (such as all-or-nothing thinking, catastrophizing, or overgeneralization), and observe their gentle impact on emotions and actions. Offer pathways towards alternative, more balanced perspectives and nurturing coping strategies.`;
        break;
      case "freudian":
        systemPrompt += ` Your sacred task is to offer a Freudian reflection on this journal entry, integrating any existing insights. Gently explore the unconscious drives, defense mechanisms, and early childhood experiences that may be influencing the thoughts, feelings, and behaviors described. Consider how repressed desires, conflicts, or unresolved issues from the past might manifest in the present narrative.`;
        break;
    }

    systemPrompt += `\n\n`;
    switch (generate.depth) {
      case "to-the-point":
        systemPrompt += `The analysis should be a concise, yet profound, spiritual insight, offering the core realization in fewer than 50 words.`;
        break;
      case "details":
        systemPrompt += `The analysis should offer gentle guidance and deeper reflections, providing meaningful details in fewer than 400 words, without overwhelming the seeker.`;
        break;
      case "in-depth":
        systemPrompt += `The analysis can unfold as extensively as needed to provide a comprehensive and deeply transformative spiritual exploration.`;
        break;
    }
    if (generate.note) {
      systemPrompt += ` Additionally, hold this sacred note in your awareness: ${generate.note}.`;
    }
        systemPrompt += `

Present this spiritual guidance directly as a markdown compliant string. Do not enclose it in JSON, provide a separate title, or include any conversational greetings or direct addresses to the user. Focus solely on the insightful analysis.`;

    humanPrompt += `Generate a new AI analysis based on the type "${generate.type}" and depth "${generate.depth}".`;
    if (generate.note) {
      humanPrompt += ` Consider the following note: "${generate.note}".`;
    }

    const stream = await model.stream([
      new SystemMessage(systemPrompt),
      new HumanMessage(humanPrompt),
    ]);

    const customReadable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of stream) {
            if (chunk.content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk.content })}\n\n`));
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(customReadable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
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
