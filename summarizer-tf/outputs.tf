output "function_url" {
  description = "URL of the deployed Cloud Function"
  value       = google_cloudfunctions2_function.email_summarizer.service_config[0].uri
}

output "function_name" {
  description = "Name of the Cloud Function"
  value       = google_cloudfunctions2_function.email_summarizer.name
}

output "function_location" {
  description = "Location of the Cloud Function"
  value       = google_cloudfunctions2_function.email_summarizer.location
}
