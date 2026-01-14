# WordPress Integration Guide - MemoriQR Hybrid Architecture

## Overview

This guide explains how to set up the WordPress + Next.js hybrid architecture for MemoriQR. WordPress handles marketing pages while Next.js handles the complex application features.

---

## Part 1: LocalWP Setup (DEV Environment)

### Step 1: Install LocalWP

1. Download LocalWP from: https://localwp.com/
2. Install on your host machine (Mac/Windows/Linux)
3. Launch LocalWP

### Step 2: Create New WordPress Site

1. Click **"Create a new site"**
2. Choose **"Create a new site"** (not from Blueprint)
3. Site name: `memoriqr-dev`
4. Choose **"Preferred"** environment (PHP 8.x, nginx)
5. Set admin credentials:
   - Username: `admin`
   - Password: (choose a secure password)
   - Email: `your@email.com`
6. Click **"Add Site"**

### Step 3: Note Your LocalWP URLs

After creation, LocalWP will show:
- **Site URL:** `http://memoriqr-dev.local` (or similar)
- **Admin URL:** `http://memoriqr-dev.local/wp-admin`
- **Port:** Usually around 10003 (check LocalWP)

### Step 4: Install Elementor Pro

1. Log into WordPress admin
2. Go to **Plugins → Add New → Upload Plugin**
3. Upload your Elementor Pro zip file
4. Activate the plugin
5. Enter your license key when prompted

### Step 5: Install Recommended Plugins

| Plugin | Purpose |
|--------|---------|
| **Elementor Pro** | Page building (required) |
| **Hello Elementor** | Lightweight theme |
| **RankMath SEO** | SEO optimization |
| **WP Mail SMTP** | Email delivery |

---

## Part 2: Embedding Next.js in WordPress

### Method 1: Direct Links (Recommended for Most Pages)

Simply link to the Next.js app from WordPress menu items or buttons:

```html
.
```

### Method 2: Iframe Embedding (For Seamless Experience)

Use Elementor's **HTML Widget** to embed Next.js pages.

**Important:** Add `?embed=true` to hide the Next.js header/footer:

```html
<!-- Order Form Embed (no header/footer) -->
<iframe 
  src="http://localhost:3000/order?embed=true" 
  width="100%" 
  height="900" 
  frameborder="0"
  style="border: none; border-radius: 8px;"
></iframe>

<!-- Activation Form Embed -->
<iframe 
  src="http://localhost:3000/activate?embed=true" 
  width="100%" 
  height="1200" 
  frameborder="0"
  style="border: none;"
></iframe>
```

### Method 3: Dynamic Iframe with URL Parameters

For pages that need dynamic content:

```html
<!-- Dynamic Memorial Viewer (using WordPress shortcode or custom JS) -->
<div id="memorial-container">
  <iframe 
    id="memorial-frame"
    src="" 
    width="100%" 
    height="800" 
    frameborder="0"
  ></iframe>
</div>

<script>
  // Get slug from URL parameter: ?memorial=buddy-2024
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('memorial');
  if (slug) {
    document.getElementById('memorial-frame').src = 
      `http://localhost:3000/memorial/${slug}`;
  }
</script>
```

---

## Part 3: WordPress Page Structure

### Pages to Create in WordPress (Elementor)

| Page | WordPress Path | Content |
|------|---------------|---------|
| Home | `/` | Hero, Features, Pricing, FAQ, CTA |
| About | `/about` | Company story, mission |
| How It Works | `/how-it-works` | 3-step process explanation |
| Contact | `/contact` | Elementor form |
| Pricing | `/pricing` | Detailed pricing table |
| FAQ | `/faq` | Accordion with questions |
| Terms | `/terms` | Legal text |
| Privacy | `/privacy` | Privacy policy |
| Testimonials | `/testimonials` | Customer stories |

### Pages Handled by Next.js (Link or Embed)

| Page | Next.js Path | How to Access |
|------|-------------|---------------|
| Order/Checkout | `/order` | Link from WordPress button |
| Activate Memorial | `/activate` | Link from email or direct URL |
| Activate with Code | `/activate/[code]` | Direct URL from retail product |
| View Memorial | `/memorial/[slug]` | QR code scans, direct links |
| Edit Memorial | `/memorial/edit` | Email link with edit token |

---

## Part 4: URL Strategy

### DEV Environment

| Purpose | WordPress URL | Next.js URL |
|---------|--------------|-------------|
| Home | `http://memoriqr-dev.local` | N/A |
| About | `http://memoriqr-dev.local/about` | N/A |
| Order | `http://memoriqr-dev.local/order` → | `http://localhost:3000/order` |
| Memorial | N/A | `http://localhost:3000/memorial/buddy-2024` |
| QR Scan | N/A | `http://localhost:3000/memorial/[slug]` |

### PROD Environment

| Purpose | WordPress URL | Next.js URL |
|---------|--------------|-------------|
| Home | `https://memoriqr.com` | N/A |
| About | `https://memoriqr.com/about` | N/A |
| Order | `https://memoriqr.com/order` → | `https://app.memoriqr.com/order` |
| Memorial | N/A | `https://app.memoriqr.com/memorial/buddy-2024` |
| QR Scan | N/A | `https://app.memoriqr.com/memorial/[slug]` |

### QR Code URL Strategy

QR codes should point directly to Next.js (Vercel) for fastest loading:
- **Short URL:** `https://app.memoriqr.com/m/buddy-2024` (redirects to full path)
- **Full URL:** `https://app.memoriqr.com/memorial/buddy-2024`

---

## Part 5: Environment Configuration

### Next.js `.env.local` Updates for Hybrid Mode

```env
# Base URL changes between DEV and PROD
# DEV: Points to Next.js directly (for API calls)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# PROD: Points to Next.js on Vercel
# NEXT_PUBLIC_BASE_URL=https://app.memoriqr.com

# WordPress URL (for redirects after actions)
NEXT_PUBLIC_WORDPRESS_URL=http://memoriqr-dev.local

# PROD:
# NEXT_PUBLIC_WORDPRESS_URL=https://memoriqr.com
```

### WordPress Theme Functions (Optional)

If you need to pass data from WordPress to Next.js iframes:

```php
// In your theme's functions.php or a custom plugin

// Add Next.js app URL as a JavaScript variable
function memoriqr_add_nextjs_config() {
    ?>
    <script>
        window.MEMORIQR_CONFIG = {
            nextjsUrl: '<?php echo esc_js(get_option('memoriqr_nextjs_url', 'http://localhost:3000')); ?>',
            wordpressUrl: '<?php echo esc_js(home_url()); ?>'
        };
    </script>
    <?php
}
add_action('wp_head', 'memoriqr_add_nextjs_config');
```

---

## Part 6: Testing the Integration

### Checklist

- [ ] LocalWP site is running
- [ ] Next.js dev server is running (`npm run dev` on port 3000)
- [ ] WordPress home page loads
- [ ] Link from WordPress to Next.js order page works
- [ ] Iframe embedding works (no X-Frame-Options errors)
- [ ] Stripe CLI is forwarding webhooks to Next.js
- [ ] Form submissions in Next.js work correctly
- [ ] Memorial pages display with themes and frames

### Common Issues

**Issue: Iframe shows blank or "refused to connect"**
- Check that Next.js is running on port 3000
- Verify `next.config.js` has the headers configured
- Check browser console for CSP errors

**Issue: CORS errors on API calls**
- The `next.config.js` includes CORS headers
- If still failing, check the specific endpoint

**Issue: LocalWP site not accessible**
- Make sure LocalWP is running
- Check the site URL in LocalWP dashboard
- Try accessing via `localhost:PORT` instead of `.local` domain

---

## Part 7: Deployment to Production

### WordPress on Hostinger

1. Set up WordPress on Hostinger (managed hosting)
2. Install same plugins (Elementor Pro, etc.)
3. Export/Import pages from LocalWP using Elementor's export feature
4. Update URLs from `localhost:3000` to `app.memoriqr.com`

### Next.js on Vercel

1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Set environment variables in Vercel dashboard
4. Update `NEXT_PUBLIC_BASE_URL` to production URL
5. Configure custom domain: `app.memoriqr.com`

### DNS Configuration

```
memoriqr.com        → Hostinger (WordPress)
www.memoriqr.com    → Hostinger (WordPress)
app.memoriqr.com    → Vercel (Next.js)
```

---

## Quick Reference

### Running DEV Environment

Terminal 1 (VS Code):
```bash
npm run dev
# Next.js running on http://localhost:3000
```

Terminal 2 (VS Code):
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Stripe webhook forwarding
```

Host Machine:
- Open LocalWP
- Start `memoriqr-dev` site
- Access WordPress at shown URL
