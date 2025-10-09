import { Email } from './readEmails';

export interface EmailSummary {
  email: Email;
  summary: string;
  actionItems: string[];
  priority: 'high' | 'medium' | 'low';
}

/**
 * Processes and summarizes a list of emails using OpenAI
 */
export async function processEmails(emails: Email[]): Promise<EmailSummary[]> {
  const summaries: EmailSummary[] = [];

  for (const email of emails) {
    try {
      const summary = await summarizeEmail(email);
      summaries.push(summary);
    } catch (error) {
      console.error(`Error processing email ${email.id}:`, error);
      // Continue processing other emails even if one fails
    }
  }

  return summaries;
}

/**
 * Summarizes a single email using OpenAI API
 */
async function summarizeEmail(email: Email): Promise<EmailSummary> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  const prompt = `
Analyze the following email and provide:
1. A brief summary (2-3 sentences)
2. Action items (if any)
3. Priority level (high/medium/low)

Email Subject: ${email.subject}
From: ${email.from}
Date: ${email.date}
Body:
${email.body.slice(0, 2000)} ${email.body.length > 2000 ? '...' : ''}

Respond in JSON format:
{
  "summary": "Brief summary here",
  "actionItems": ["action 1", "action 2"],
  "priority": "medium"
}
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an email assistant that summarizes emails concisely and identifies action items.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    const parsed = JSON.parse(content);

    return {
      email,
      summary: parsed.summary || 'Unable to generate summary',
      actionItems: parsed.actionItems || [],
      priority: parsed.priority || 'medium',
    };
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    
    // Return a basic summary if AI processing fails
    return {
      email,
      summary: `Email from ${email.from}: ${email.subject}`,
      actionItems: [],
      priority: 'medium',
    };
  }
}
