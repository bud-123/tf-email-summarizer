import { Request, Response } from 'express';
import { validateEnv, getGmailClient } from './auth';
import { readEmails } from './readEmails';
import { processEmails } from './processEmails';
import { sendSummaryEmail } from './sendEmail';

/**
 * Cloud Function entry point for email summarization
 * This function is triggered by HTTP request (from Cloud Scheduler or manually)
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

// Export as the main function for Cloud Functions
export { summarizeEmail as main };
