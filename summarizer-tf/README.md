# Email Summarizer Terraform

Deploys a Google Cloud Function for email summarization.

## What it does

- Creates a Cloud Function (Gen 2) that summarizes emails
- Enables required Google Cloud APIs
- Bundles backend code automatically
- Configures public access to the function

## Quick Start

1. **Set your project ID** in `terraform.tfvars`:
   ```
   project_id = "your-gcp-project-id"
   ```

2. **Deploy**:
   ```bash
   terraform init
   terraform plan
   terraform apply
   ```

3. **Get the function URL**:
   ```bash
   terraform output function_url
   ```

## Files

- `main.tf` - APIs and code bundling
- `cloudfunction.tf` - Cloud Function deployment
- `variables.tf` - Configuration options
- `outputs.tf` - Function details
- `providers.tf` - Terraform providers

## Configuration

Edit `terraform.tfvars` to customize:
- `project_id` - Your GCP project ID
- `region` - GCP region (default: us-central1)
- `function_name` - Function name (default: email-summarizer)

## Requirements

- Terraform >= 1.0
- Google Cloud CLI authenticated
- Node.js backend code in `../summarizer-backend`

## Clean Up

```bash
terraform destroy
```
