locals {
  backend_dir = "${path.module}/../summarizer-backend"
}

# Enable required APIs
resource "google_project_service" "cloud_functions" {
  project = var.project_id
  service = "cloudfunctions.googleapis.com"
  
  disable_on_destroy = false
}

resource "google_project_service" "cloud_build" {
  project = var.project_id
  service = "cloudbuild.googleapis.com"
  
  disable_on_destroy = false
}

resource "google_project_service" "cloud_run" {
  project = var.project_id
  service = "run.googleapis.com"
  
  disable_on_destroy = false
}

resource "google_project_service" "secret_manager" {
  project = var.project_id
  service = "secretmanager.googleapis.com"
  
  disable_on_destroy = false
}

resource "google_project_service" "cloud_scheduler" {
  project = var.project_id
  service = "cloudscheduler.googleapis.com"
  
  disable_on_destroy = false
}

# Bundle local code
data "archive_file" "function_zip" {
  type        = "zip"
  source_dir  = local.backend_dir
  output_path = "${path.module}/../function.zip"
  excludes    = ["node_modules", ".git"]
}

# Reference existing secrets (do not recreate)
data "google_secret_manager_secret_version" "gmail_client_id" {
  secret  = "gmail_client_id"
  project = var.project_id
  
  depends_on = [google_project_service.secret_manager]
}

data "google_secret_manager_secret_version" "gmail_client_secret" {
  secret  = "gmail_client_secret"
  project = var.project_id
  
  depends_on = [google_project_service.secret_manager]
}

data "google_secret_manager_secret_version" "gmail_refresh_token" {
  secret  = "gmail_refresh_token"
  project = var.project_id
  
  depends_on = [google_project_service.secret_manager]
}

