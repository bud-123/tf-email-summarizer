import express, { Request, Response } from 'express';
import cors from 'cors';
import { validateEnv, getGmailClient } from './auth';
import { readEmails } from './readEmails';
import { processEmails } from './processEmails';
import { sendSummaryEmail } from './sendEmail';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Cloud Function-style handler for email summarization
 * This function can be mounted on an Express route and is compatible with GCF's HTTP signature.
 */
export async function summarizeEmail(req: Request, res: Response): Promise<void> {
  console.log('Email summarizer function invoked');

  try {
    // Validate environment variables
    validateEnv();

    // Get authenticated Gmail client
    const gmail = getGmailClient();

    // Read recent unread emails
    console.log('Fetching unread emails...');
    const emails = await readEmails(gmail, 20); // Fetch up to 20 unread emails

    if (emails.length === 0) {
      console.log('No unread emails to process');
      res.status(200).json({
        success: true,
        message: 'No unread emails to process',
        emailsProcessed: 0,
      });
      return;
    }

    console.log(`Found ${emails.length} unread email(s)`);

    // Process and summarize emails
    console.log('Processing emails with AI...');
    const summaries = await processEmails(emails);

    // Get recipient email from environment or use authenticated user's email
    const recipientEmail = process.env.SUMMARY_EMAIL || 'me';

    // Send summary email
    console.log('Sending summary email...');
    await sendSummaryEmail(gmail, summaries, recipientEmail);

    // Respond with success
    res.status(200).json({
      success: true,
      message: 'Email summary sent successfully',
      emailsProcessed: summaries.length,
      summaries: summaries.map((s) => ({
        subject: s.email.subject,
        from: s.email.from,
        priority: s.priority,
        summary: s.summary,
      })),
    });

    console.log('Email summarizer function completed successfully');
  } catch (error) {
    console.error('Error in email summarizer function:', error);

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
}

// Export as the main function for Cloud Functions compatibility
export { summarizeEmail as main };

// Express server to mimic Cloud Functions locally
function createServer() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  // Health check
  app.get('/healthz', (_req, res) => res.status(200).send('ok'));

  // Mimic GCF: accept any method at root
  app.all('/', (req, res) => summarizeEmail(req, res));
  // Also expose an explicit path
  app.all('/summarize', (req, res) => summarizeEmail(req, res));

  return app;
}

// Only start the server when running this file directly (not when imported by GCF)
if (require.main === module) {
  const port = process.env.PORT ? Number(process.env.PORT) : 8080;
  const app = createServer();
  app.listen(port, () => {
    console.log(`Express server listening on http://localhost:${port}`);
  });
}

export { createServer };
