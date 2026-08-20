# 🛡️ Security & Responsible Disclosure Policy

The security of citizen data and Digital Public Infrastructure integrity is our utmost priority in **JanSetu AI**.

---

## 🔒 Supported Versions

We release security updates and patches for the current release stream:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability, please follow responsible disclosure:

1. **Do NOT open a public GitHub issue**.
2. Email your findings directly to `r.p.singh7439@gmail.com` with:
   - Type of vulnerability (e.g. prompt injection, PII leakage, XSS, token exposure)
   - Detailed proof-of-concept steps
   - Potential impact on citizen data or sovereign backend integrations
3. We will acknowledge receipt within 48 hours and work on a fix promptly.

---

## 🔐 Zero-Secret Integrity Policy

- JanSetu AI repository must never contain live production credentials or secrets.
- Environment variables (`.env`, `*.local`) are ignored by default.
- Client-side storage uses strict scoped keys and encrypted local records.
