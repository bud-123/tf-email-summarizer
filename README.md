# Gmail Summarizer (TypeScript + Terraform + GCP)

This project is a **serverless Gmail automation system** that reads and processes emails on a schedule.  
It’s built with **TypeScript**, deployed to **Google Cloud Functions (2nd gen)** via **Terraform**, and secured through **GCP Secret Manager**.

---

## Overview

The Gmail Processor app:
- Authenticates securely with your Gmail account
- Reads and processes recent emails (custom logic pluggable)
- Optionally sends automated responses
- Runs on a schedule using **Cloud Scheduler**
- Is fully IaC-managed with Terraform
- Requires **no local secrets** — credentials live in Secret Manager

---

## Architecture

```

┌──────────────────────────┐
│   Cloud Scheduler (cron) │
└────────────┬─────────────┘
│ triggers
┌────────────▼─────────────┐
│ Cloud Function (main)    │
│  - Reads Gmail via API   │
│  - Runs process logic    │
│  - Optionally sends mail │
└────────────┬─────────────┘
│
┌────────────▼─────────────┐
│ Secret Manager           │
│  - Stores OAuth tokens   │
│  - Accessed via env vars │
└──────────────────────────┘

```

---

## Repository Structure

```

gmail-processor/
├── app/
│   ├── src/
│   │   ├── auth.ts            # Gmail OAuth logic (from Secret Manager)
│   │   ├── readEmails.ts      # Reads recent messages
│   │   ├── processEmails.ts   # Custom business logic placeholder
│   │   ├── sendEmail.ts       # Sends outgoing emails
│   │   └── index.ts           # Cloud Function entrypoint
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.sample            # Optional local testing
│
├── terraform/
│   ├── main.tf                # High-level orchestration
│   ├── providers.tf           # Google provider configuration
│   ├── variables.tf           # Input variables
│   ├── outputs.tf             # Output values
│   ├── cloudfunction.tf       # Cloud Function + Scheduler
│   └── backend.tf             # Remote state (if used)
│
├── .gitignore
└── README.md

````

---

## Secret Management

This project assumes Gmail credentials already exist in **Google Secret Manager**.  
They must be named exactly:

| Secret Name | Description |
|--------------|-------------|
| `gmail_client_id` | OAuth client ID |
| `gmail_client_secret` | OAuth client secret |
| `gmail_refresh_token` | Refresh token with Gmail API access |

To create them manually:
```bash
gcloud secrets create gmail_client_id --replication-policy="automatic"
echo -n "<YOUR_CLIENT_ID>" | gcloud secrets versions add gmail_client_id --data-file=-

gcloud secrets create gmail_client_secret --replication-policy="automatic"
echo -n "<YOUR_CLIENT_SECRET>" | gcloud secrets versions add gmail_client_secret --data-file=-

gcloud secrets create gmail_refresh_token --replication-policy="automatic"
echo -n "<YOUR_REFRESH_TOKEN>" | gcloud secrets versions add gmail_refresh_token --data-file=-
````

---

## Deployment (Terraform)

### 1. Initialize Terraform

```bash
cd terraform
terraform init
```

### 2. Plan the Deployment

```bash
terraform plan \
  -var="project_id=<YOUR_GCP_PROJECT_ID>" \
  -var="region=us-central1"
```

### 3. Apply Changes

```bash
terraform apply -auto-approve
```

Terraform will:

* Package your local app as `function.zip`
* Deploy the Cloud Function
* Create a Cloud Scheduler job to trigger it daily

---

## Local Development

You can run and test the app locally without deploying:

```bash
cd app
npm install
npx ts-node src/index.ts
```

Copy `.env.sample` → `.env` and fill in your credentials:

```bash
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_REFRESH_TOKEN=...
```

This lets you verify Gmail read/send logic before deployment.

---

## Extending the Processor

Edit `app/src/processEmails.ts` to define your own logic.
Example ideas:

* Auto-reply to specific senders
* Parse receipts or invoices
* Flag suspicious emails
* Forward important messages
* Store data in BigQuery or Firestore

Each message provides `from`, `subject`, and `snippet` fields for easy parsing.

---

## Environment Variables (Automatically Set)

| Variable              | Source         | Description         |
| --------------------- | -------------- | ------------------- |
| `GMAIL_CLIENT_ID`     | Secret Manager | OAuth client ID     |
| `GMAIL_CLIENT_SECRET` | Secret Manager | OAuth secret        |
| `GMAIL_REFRESH_TOKEN` | Secret Manager | OAuth refresh token |

You never need to commit or upload these manually.

---

## CI/CD Integration

For automated deployments, run:

```bash
terraform plan -out=tfplan
terraform apply "tfplan"
```

You can integrate this with Cloud Build, GitHub Actions, or GitLab CI to rebuild and redeploy on push to `main`.

---

## Git Hygiene

Key ignored files:

```
node_modules/
dist/
function.zip
token.json
credentials.json
terraform/.terraform/
terraform.tfstate*
```

Secrets and build artifacts are never committed.

---

## Future Enhancements

* Add Cloud Logging integration
* Store processed email metadata in Firestore
* Integrate Gmail push notifications (Pub/Sub)
* Add retry logic for transient Gmail API failures
* Support multi-account processing

---

## License

MIT License — feel free to fork and modify for your own automation workflows.

---

## Author

Built with by engineers who prefer:

* Infrastructure as Code 
* Serverless simplicity 
* Secure automation 
