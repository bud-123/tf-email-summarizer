import { gmail_v1 } from 'googleapis';

export interface Email {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  body: string;
}

/**
 * Fetches recent unread emails from Gmail
 */
export async function readEmails(
  gmail: gmail_v1.Gmail,
  maxResults: number = 10
): Promise<Email[]> {
  try {
    // List messages with query filters
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread',
      maxResults,
    });

    const messages = response.data.messages || [];
    
    if (messages.length === 0) {
      console.log('No unread emails found');
      return [];
    }

    // Fetch full details for each message
    const emails: Email[] = [];
    
    for (const message of messages) {
      if (!message.id) continue;

      const details = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full',
      });

      const headers = details.data.payload?.headers || [];
      const subject = headers.find((h) => h.name === 'Subject')?.value || 'No Subject';
      const from = headers.find((h) => h.name === 'From')?.value || 'Unknown';
      const date = headers.find((h) => h.name === 'Date')?.value || '';

      // Extract email body
      const body = extractBody(details.data.payload);

      emails.push({
        id: message.id,
        threadId: message.threadId || '',
        subject,
        from,
        date,
        snippet: details.data.snippet || '',
        body,
      });
    }

    return emails;
  } catch (error) {
    console.error('Error reading emails:', error);
    throw error;
  }
}

/**
 * Extracts the body text from an email payload
 */
function extractBody(payload: gmail_v1.Schema$MessagePart | undefined): string {
  if (!payload) return '';

  // Check if body data exists
  if (payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }

  // Check multipart messages
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
    }
    
    // Fallback to HTML if no plain text
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
    }
  }

  return '';
}
