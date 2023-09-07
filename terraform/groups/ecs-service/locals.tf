# Define all hardcoded local variable and local variables looked up from data resources
locals {
  stack_name                = "search-service"  # this must match the stack name the service deploys into
  name_prefix               = "${local.stack_name}-${var.environment}"
  service_name              = "search-web"      # testing service name
  container_port            = "3000"            # default node port required here until prod docker container is built allowing port change via env var
  docker_repo               = "search.web.ch.gov.uk"
  lb_listener_rule_priority = 68

  lb_listener_paths         = [
    "/*-search",
    "/search-*",
    "/search-web/health"
  ]
  
  healthcheck_path          = "/search-web/health" # healthcheck path for search web
  healthcheck_matcher       = "200"

  service_secrets = jsondecode(data.vault_generic_secret.service_secrets.data_json)

  vpc_name = local.service_secrets["vpc_name"]

  parameter_store_secrets = {
    "account_url"               = local.service_secrets["account_url"]
    "alphabetical_search_url"   = local.service_secrets["alphabetical_search_url"]
    "api_url"                   = local.service_secrets["api_url"]
    "cache_server"              = local.service_secrets["cache_server"]
    "cdn_host"                  = local.service_secrets["cdn_host"]
    "chs_api_key"               = local.service_secrets["chs_api_key"]
    "chs_monitor_gui_url"       = local.service_secrets["chs_monitor_gui_url"]
    "chs_url"                   = local.service_secrets["chs_url"]
    "cookie_domain"             = local.service_secrets["cookie_domain"]
    "cookie_secret"             = local.service_secrets["cookie_secret"]
    "piwik_site_id"             = local.service_secrets["piwik_site_id"]
    "piwik_url"                 = local.service_secrets["piwik_url"]
    "vpc_name"                  = local.service_secrets["vpc_name"]
  }

  # create a map of secret name => secret arn to pass into ecs service module
  # using the trimprefix function to remove the prefixed path from the secret name
  secrets_arn_map = {
    for sec in data.aws_ssm_parameter.secret :
    trimprefix(sec.name, "/${local.name_prefix}/") => sec.arn
  }

  service_secrets_arn_map = {
    for sec in module.secrets.secrets :
    trimprefix(sec.name, "/${local.service_name}-${var.environment}/") => sec.arn
  }

  task_secrets = [
    { "name" : "ACCOUNT_URL", "valueFrom"               : "${local.service_secrets_arn_map.account_url}" },
    { "name" : "ALPHABETICAL_SEARCH_URL", "valueFrom"   : "${local.service_secrets_arn_map.alphabetical_search_url}" },
    { "name" : "API_URL", "valueFrom"                   : "${local.service_secrets_arn_map.api_url}" },
    { "name" : "CACHE_SERVER", "valueFrom"              : "${local.service_secrets_arn_map.cache_server}" },
    { "name" : "CDN_HOST", "valueFrom"                  : "${local.service_secrets_arn_map.cdn_host}" },
    { "name" : "CHS_API_KEY", "valueFrom"               : "${local.service_secrets_arn_map.chs_api_key}" },
    { "name" : "CHS_MONITOR_GUI_URL", "valueFrom"       : "${local.service_secrets_arn_map.chs_monitor_gui_url}" },
    { "name" : "CHS_URL", "valueFrom"                   : "${local.service_secrets_arn_map.chs_url}" },
    { "name" : "COOKIE_DOMAIN", "valueFrom"             : "${local.service_secrets_arn_map.cookie_domain}" },
    { "name" : "COOKIE_SECRET", "valueFrom"             : "${local.service_secrets_arn_map.cookie_secret}" },
    { "name" : "PIWIK_SITE_ID", "valueFrom"             : "${local.service_secrets_arn_map.piwik_site_id}" },
    { "name" : "PIWIK_URL", "valueFrom"                 : "${local.service_secrets_arn_map.piwik_url}" }
  ]

  task_environment = [
    { "name" : "ADVANCED_SEARCH_NUMBER_OF_RESULTS_TO_DOWNLOAD", "value"   : "${var.advanced_search_number_of_results_to_download}" },
    { "name" : "DEFAULT_SESSION_EXPIRATION", "value"                      : "${var.default_session_expiration}" },
    { "name" : "DISSOLVED_SEARCH_NUMBER_OF_RESULTS", "value"              : "${var.dissolved_search_number_of_results}" },
    { "name" : "HUMAN_LOG", "value"                                       : "${var.human_log}" },
    { "name" : "LAST_UPDATED_MESSAGE", "value"                            : "${var.last_updated_message}" },
    { "name" : "LOG_LEVEL", "value"                                       : "${var.log_level}" },
    { "name" : "NODE_PORT", "value"                                       : "${local.container_port}" },
    { "name" : "ROE_FEATURE_FLAG", "value"                                : "${var.roe_feature_flag}" },
    { "name" : "SEARCH_WEB_COOKIE_NAME", "value"                          : "${var.search_web_cookie_name}" },
    { "name" : "TZ", "value"                                              : "${var.tz}" }
  ]
}
