
import { createClient } from 'npm:@supabase/supabase-js';
import { ChatGoogleGenerativeAI } from "npm:@langchain/google-genai";

interface AISettings {
  enabled: boolean;
  provider: string;
  model: string;
  apiKey: string;
  suggestions: boolean;
  codeReview: boolean;
  customAiModelPopulated: boolean;
}

interface SettingsCookie {
  ai: AISettings;
}

export async function setupAIModel(req: Request) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const aiSettingsHeader = req.headers.get('X-AI-Settings');
  let settings: SettingsCookie | null = null;

  if (aiSettingsHeader) {
    try {
      settings = JSON.parse(aiSettingsHeader);
    } catch (e) {
      console.error('Failed to parse X-AI-Settings header:', e);
    }
  }

  const aiSettings = settings?.ai;

  if (aiSettings?.enabled && aiSettings?.customAiModelPopulated) {
    // User has custom AI model enabled and populated
    if (aiSettings.provider === 'google-gemini') {
      const model = new ChatGoogleGenerativeAI({
        apiKey: aiSettings.apiKey,
        model: aiSettings.model,
      });
      return {
        status: 200,
        message: 'Custom AI model setup',
        model: model
      };
    } else {
      return {
        status: 400,
        message: `Unsupported AI provider: ${aiSettings.provider}`
      };
    }
  } else {
    // Check public model usage via Supabase SQL function
    const authHeader = req.headers.get('Authorization')
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError) {
      console.error('Error getting user:', userError);
      return {
        status: 401,
        message: 'Unauthorized: Could not get user information.'
      };
    }

    const userId = userData?.user?.id;
    const userRole = userData?.user?.app_metadata?.user_role;

    if (!userId) {
      return {
        status: 401,
        message: 'Unauthorized: User ID not found.'
      };
    }

    // If the user is a 'plus' subscriber, skip the rate limit check
    if (userRole === 'plus') {
      console.log('User is a plus subscriber, skipping AI usage check.');
      const model = new ChatGoogleGenerativeAI({
        apiKey: Deno.env.get('GOOGLE_API_KEY'),
        model: 'gemini-2.5-flash',
      });
      return {
        status: 200,
        message: 'Public AI model setup (Plus subscriber)',
        model: model
      };
    }

    const { error } = await supabase.rpc('check_ai_usage', { p_user_id: userId });

    if (error) {
      console.error('Error checking AI usage:', error);
      if (error.message.includes('Rate limit exceeded')) {
        return {
          status: 429,
          message: error.message
        };
      } else {
        return {
          status: 500,
          message: 'Error checking AI usage: ' + error.message
        };
      }
    }

    // If no error, it means the check passed and usage was decremented
    console.log('Using public AI model (rate limit checked).');
    const model = new ChatGoogleGenerativeAI({
      apiKey: Deno.env.get('GOOGLE_API_KEY'),
      model: 'gemini-2.5-flash',
    });
    return {
      status: 200,
      message: 'Public AI model setup',
      model: model
    };
}
}