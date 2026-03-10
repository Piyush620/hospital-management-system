# Resend Email Setup Guide 🚀

Switch from SendGrid to **Resend** for faster OTP delivery (⚡ ~1 second vs 🐌 ~2 hours).

---

## 📝 Why Resend?

| Feature | Resend | SendGrid |
|---------|--------|----------|
| **Speed** | ⚡ ~1 second | 🐌 2+ hours |
| **Free Tier** | 100 emails/day | 100 emails/day |
| **Forever Free** | ✅ Yes | ❌ Trial only |
| **Setup** | ✅ 2 minutes | ✅ 2 minutes |
| **Reliability** | ✅ Modern | ✅ Established |

---

## 🔧 Setup Steps (5 minutes)

### Step 1: Create Resend Account
1. Go to https://resend.com
2. Sign up with your email (free)
3. Verify your email

---

### Step 2: Get API Key
1. Go to Dashboard → **API Keys**
2. Click **"Create API Key"**
3. Name it: `hospital-management-system`
4. Copy the API key (starts with `re_`)

**Example:** `re_abc123def456ghi789`

---

### Step 3: Verify Sender Email
1. Go to **Domains** in Resend dashboard
2. You'll see: `onboarding@resend.dev` (already verified)
3. OR add your own email:
   - Click **"Add Domain"**
   - Verify via email

**For Testing:** Use `onboarding@resend.dev` (pre-verified)

---

### Step 4: Update `.env`
```env
RESEND_API_KEY=re_abc123def456ghi789
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**Or use your verified domain:**
```env
RESEND_API_KEY=re_abc123def456ghi789
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

---

### Step 5: Update Docker `.env` (Optional)
If using Docker, also update `docker-compose.yml` environment variables:
```yaml
RESEND_API_KEY: re_abc123def456ghi789
RESEND_FROM_EMAIL: onboarding@resend.dev
```

---

## ✅ Test It

### Start Docker
```powershell
docker-compose up --build
```

### Signup (OTP will arrive in ~1 second!)
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "yourtest@gmail.com",
    "password": "TestPass123!",
    "name": "Test User",
    "phone": "9876543210",
    "role": "SUPER_ADMIN"
  }'
```

### Check Email
✅ OTP arrives in **~1 second** to your inbox

### Get OTP from Logs (if needed)
```powershell
docker-compose logs backend | Select-String "OTP"
```

---

## 🎯 Expected vs Actual

**Before (SendGrid):**
```
[OTP] Sent at 2:00 PM
📧 Email arrives at 4:30 PM (2.5 hours later)
```

**After (Resend):**
```
[OTP] Sent at 2:00 PM
📧 Email arrives at 2:00:01 PM (1 second later) ⚡
```

---

## 📊 Pricing

| Plan | Emails/Day | Cost | Forever? |
|------|-----------|------|----------|
| **Test** | 100 | Free | ✅ Yes |
| **Hobby** | Unlimited | $20/mo | ✅ Yes (after trial) |
| **Pro** | Unlimited | Pay as you go | ✅ Yes |

---

## 🔍 Monitor Deliverability

### Check Dashboard
1. Go to https://resend.com/emails
2. See all sent emails
3. Check delivery status
4. View bounce/spam rates

---

## 🚨 Troubleshooting

### Issue: "Invalid API key"
**Fix:** Make sure API key starts with `re_` and is correct

### Issue: "Invalid sender email"
**Fix:** Use `onboarding@resend.dev` OR verify your own domain

### Issue: Email not arriving
**Check:**
1. Spam folder
2. Resend dashboard (failed deliveries)
3. Sender email is verified

### Issue: Rate limits
**Resend:** 100 emails/day on free tier
**Fix:** Upgrade plan if needed

---

## 🔄 Switch Back to SendGrid (if needed)

```env
# Remove Resend
# RESEND_API_KEY=...
# RESEND_FROM_EMAIL=...

# Add SendGrid
SENDGRID_API_KEY=SG.your_key_here
SENDGRID_FROM_EMAIL=your_email@gmail.com
```

Then update `otp.service.js` back to SendGrid code.

---

## 📚 Documentation

- **Resend Docs:** https://resend.com/docs
- **API Reference:** https://resend.com/docs/api-reference/emails/send
- **Status Page:** https://status.resend.com

---

## ✨ You're All Set! 🎉

OTP emails will now arrive in **~1 second** instead of 2+ hours.

Start testing Phase 1 of integration tests! 🧪

---

**Questions?** Check Resend dashboard or status page for any issues.
