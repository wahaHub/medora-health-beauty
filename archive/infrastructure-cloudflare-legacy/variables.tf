# Cloudflare Variables
variable "cloudflare_api_token" {
  description = "Cloudflare API Token"
  type        = string
  default     = "MbTKc7SpcgnH4vb5I8DoBCbHSmoXTJNNdWYMKPuc"
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID (从 Cloudflare Dashboard 获取)"
  type        = string
  # 请在 terraform.tfvars 中设置
  # 位置: Cloudflare Dashboard → 你的域名 → Overview → Zone ID (右侧)
}

variable "cloudflare_account_id" {
  description = "Cloudflare Account ID (从 Cloudflare Dashboard 获取)"
  type        = string
  # 请在 terraform.tfvars 中设置
  # 位置: Cloudflare Dashboard → 右上角头像 → Account ID
}

variable "domain_name" {
  description = "你的域名 (例如: medorahealth.com)"
  type        = string
  # 请在 terraform.tfvars 中设置
}

variable "vercel_cname" {
  description = "Vercel CNAME target"
  type        = string
  default     = "cname.vercel-dns.com"
}

variable "vercel_domain" {
  description = "Vercel deployment domain"
  type        = string
  default     = "medora-health-beauty.vercel.app"
}

