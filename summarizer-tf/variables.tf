variable "project_id" {
  description = "The GCP project ID"
  type        = string
  default     = "gcp-tform-demo"
}

variable "region" {
  description = "The GCP region for resources"
  type        = string
  default     = "us-central1"
}

variable "function_name" {
  description = "Name of the Cloud Function"
  type        = string
  default     = "email-summarizer"
}

variable "function_runtime" {
  description = "Runtime for the Cloud Function"
  type        = string
  default     = "nodejs20"
}

variable "function_entry_point" {
  description = "Entry point function name"
  type        = string
  default     = "summarizeEmail"
}

