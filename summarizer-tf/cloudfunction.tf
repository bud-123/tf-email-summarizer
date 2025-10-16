# Storage bucket for function source
resource "google_storage_bucket" "function_bucket" {
  name     = "${var.project_id}-function-source"
  location = var.region
  
  uniform_bucket_level_access = true
  
  depends_on = [google_project_service.cloud_functions]
}

# Upload function source to bucket
resource "google_storage_bucket_object" "function_archive" {
  name   = "function-${data.archive_file.function_zip.output_md5}.zip"
  bucket = google_storage_bucket.function_bucket.name
  source = data.archive_file.function_zip.output_path
  
  depends_on = [data.archive_file.function_zip]
}

# Deploy Cloud Function (2nd gen)
resource "google_cloudfunctions2_function" "email_summarizer" {
  name     = var.function_name
  location = var.region
  
  build_config {
    runtime     = var.function_runtime
    entry_point = var.function_entry_point
    
    source {
      storage_source {
        bucket = google_storage_bucket.function_bucket.name
        object = google_storage_bucket_object.function_archive.name
      }
    }
  }
  
  service_config {
    available_memory   = "256M"
    timeout_seconds    = 60
    min_instance_count = 0
    max_instance_count = 10
    
    environment_variables = {
      NODE_ENV = "production"
    }
    
    ingress_settings               = "ALLOW_ALL"
    all_traffic_on_latest_revision = true
  }
  
  depends_on = [
    google_project_service.cloud_functions,
    google_project_service.cloud_build,
    google_project_service.cloud_run,
  ]
}

# IAM entry to allow unauthenticated access (adjust as needed)
resource "google_cloud_run_service_iam_member" "invoker" {
  project  = var.project_id
  location = google_cloudfunctions2_function.email_summarizer.location
  service  = google_cloudfunctions2_function.email_summarizer.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
