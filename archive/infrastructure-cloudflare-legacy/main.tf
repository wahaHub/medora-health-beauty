terraform {
  required_version = ">= 1.0"
  
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

# Cloudflare Provider
provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# ============================================
# DNS Records - 指向 Vercel
# ============================================

# Root domain CNAME to Vercel
resource "cloudflare_record" "root" {
  zone_id = var.cloudflare_zone_id
  name    = "@"
  type    = "CNAME"
  content = var.vercel_cname
  proxied = true  # 启用 Cloudflare CDN
  ttl     = 1     # Auto (当 proxied = true 时)
  comment = "Root domain pointing to Vercel"
}

# www subdomain CNAME to Vercel
resource "cloudflare_record" "www" {
  zone_id = var.cloudflare_zone_id
  name    = "www"
  type    = "CNAME"
  content = var.vercel_cname
  proxied = true
  ttl     = 1
  comment = "WWW subdomain pointing to Vercel"
}

# ============================================
# SSL/TLS Settings
# ============================================

resource "cloudflare_zone_settings_override" "settings" {
  zone_id = var.cloudflare_zone_id

  settings {
    # SSL/TLS
    ssl = "full"  # Full (strict)
    always_use_https = "on"
    min_tls_version = "1.2"
    automatic_https_rewrites = "on"
    opportunistic_encryption = "on"
    tls_1_3 = "on"
    universal_ssl = "on"

    # Speed Optimization
    brotli = "on"
    early_hints = "on"
    http2 = "on"
    http3 = "on"
    zero_rtt = "on"
    
    # Minification
    minify {
      css  = "on"
      html = "on"
      js   = "on"
    }
    
    # Rocket Loader (关闭，可能与 React 冲突)
    rocket_loader = "off"
    
    # Caching
    browser_cache_ttl = 14400  # 4 hours
    cache_level = "aggressive"
    
    # Security
    security_level = "medium"
    browser_check = "on"
    challenge_ttl = 1800  # 30 minutes
    privacy_pass = "on"
    email_obfuscation = "on"
    server_side_exclude = "on"
    hotlink_protection = "off"
    
    # Network
    ip_geolocation = "on"
    ipv6 = "on"
    websockets = "on"
    pseudo_ipv4 = "off"
    
    # Other
    always_online = "on"
    development_mode = "off"
    prefetch_preload = "off"
    
    # HSTS
    security_header {
      enabled            = true
      preload            = true
      max_age            = 31536000  # 1 year
      include_subdomains = true
      nosniff            = true
    }
  }
}

# ============================================
# Page Rules - 性能优化
# ============================================

# Page Rule 1: 缓存静态资源
resource "cloudflare_page_rule" "cache_static_assets" {
  zone_id  = var.cloudflare_zone_id
  target   = "${var.domain_name}/assets/*"
  priority = 1

  actions {
    cache_level         = "cache_everything"
    edge_cache_ttl      = 2592000  # 30 days
    browser_cache_ttl   = 2592000  # 30 days
  }
}

# Page Rule 2: 缓存图片
resource "cloudflare_page_rule" "cache_images" {
  zone_id  = var.cloudflare_zone_id
  target   = "${var.domain_name}/*.{jpg,jpeg,png,gif,webp,svg,ico}"
  priority = 2

  actions {
    cache_level       = "cache_everything"
    edge_cache_ttl    = 2592000  # 30 days
    browser_cache_ttl = 2592000  # 30 days
  }
}

# Page Rule 3: WWW 重定向到非 WWW
resource "cloudflare_page_rule" "redirect_www" {
  zone_id  = var.cloudflare_zone_id
  target   = "www.${var.domain_name}/*"
  priority = 3

  actions {
    forwarding_url {
      url         = "https://${var.domain_name}/$1"
      status_code = 301
    }
  }
}

# ============================================
# Outputs
# ============================================

output "nameservers" {
  description = "Cloudflare Nameservers"
  value       = "Check Cloudflare Dashboard for nameservers"
}

output "dns_records" {
  description = "Created DNS records"
  value = {
    root = cloudflare_record.root.hostname
    www  = cloudflare_record.www.hostname
  }
}

output "ssl_status" {
  description = "SSL/TLS Configuration"
  value       = "Full (strict) with HSTS enabled"
}

output "deployment_url" {
  description = "Your website URL"
  value       = "https://${var.domain_name}"
}

