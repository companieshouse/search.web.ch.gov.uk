# ------------------------------------------------------------------------------
# Environment
# ------------------------------------------------------------------------------
variable "environment" {
  type        = string
  description = "The environment name, defined in envrionments vars."
}
variable "aws_region" {
  default     = "eu-west-2"
  type        = string
  description = "The AWS region for deployment."
}
variable "aws_profile" {
  default     = "development-eu-west-2"
  type        = string
  description = "The AWS profile to use for deployment."
}
variable "kms_alias" {
  type = string
}

# ------------------------------------------------------------------------------
# Docker Container
# ------------------------------------------------------------------------------
variable "docker_registry" {
  type        = string
  description = "The FQDN of the Docker registry."
}

# ------------------------------------------------------------------------------
# Service performance and scaling configs
# ------------------------------------------------------------------------------
variable "desired_task_count" {
  type        = number
  description = "The desired ECS task count for this service"
  default     = 1 # defaulted low for dev environments, override for production
}
variable "required_cpus" {
  type        = number
  description = "The required cpu resource for this service. 1024 here is 1 vCPU"
  default     = 128 # defaulted low for dev environments, override for production
}
variable "required_memory" {
  type        = number
  description = "The required memory for this service"
  default     = 256 # defaulted low for node service in dev environments, override for production
}

# ------------------------------------------------------------------------------
# Service environment variable configs
# ------------------------------------------------------------------------------

variable "advanced_search_number_of_results_to_download" {
  type = number
}

variable "container_port" {
  type        = string
  description = "The port the container exposes. This must match the port used by the service in its environment variables."
}

variable "default_session_expiration" {
  type = number
}

variable "dissolved_search_number_of_results" {
  type = number
}

variable "human_log" {
  type = number
}

variable "last_updated_message" {
  type = string
}

variable "log_level" {
  type = string
}

variable "roe_feature_flag" {
  type = number
}

variable "search_web_cookie_name" {
  type = string
}

variable "search_web_version" {
  type        = string
  description = "The version of the certificates orders web container to run."
}

variable "tz" {
  type = string
}
