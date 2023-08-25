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
variable "search_web_version" {
  type        = string
  description = "The version of the certificates orders web container to run."
}

variable "basket_item_limit" {
  type = number
}

variable "search_piwik_start_goal_id" {
  type = number
}

variable "certified_copies_piwik_start_goal_id" {
  type = number
}

variable "cookie_name" {
  type = string
}

variable "default_session_expiration" {
  type = number
}

variable "dispatch_days" {
  type = number
}

variable "dissolved_search_piwik_start_goal_id" {
  type = number
}

variable "human_log" {
  type = number
}

variable "log_level" {
  type = string
}

variable "missing_image_delivery_piwik_start_goal_id" {
  type = number
}

variable "tz" {
  type = string
}

variable "dynamic_lp_search_enabled" {
  type = bool
}

variable "dynamic_llp_search_enabled" {
  type = bool
}

variable "lp_search_piwik_start_goal_id" {
  type = number
}

variable "llp_search_piwik_start_goal_id" {
  type = number
}

variable "liquidated_company_certificates_enabled" {
  type = bool
}

variable "administrator_company_certificates_enabled" {
  type = bool
}
