# 🤝 Contributing to JanSetu AI

Thank you for your interest in contributing to **JanSetu AI** (जन सेतु)! We welcome contributions from developers, designers, data engineers, and governance enthusiasts passionate about building inclusive Digital Public Infrastructure (DPI) for India.

---

## 🧭 Code of Conduct

All contributors and maintainers are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please report unacceptable behavior to `r.p.singh7439@gmail.com`.

---

## 🛠️ How to Contribute

### 1. Reporting Bugs
- Check the [GitHub Issues](https://github.com/DevRudrax/JanSetu-AI/issues) page to see if your bug has already been reported.
- If not, create a new issue using our **Bug Report** template.
- Include clear steps to reproduce the issue, your browser environment, and screenshots if applicable.

### 2. Suggesting Enhancements
- Open a **Feature Request** issue describing the DPI module (e.g. Schemes, RTI, Grievances, Vault, Multi-Lingual Speech).
- Outline the user journey and problem statement for Indian citizens.

### 3. Pull Request Guidelines
1. **Fork the Repository** and create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Follow Coding Standards**:
   - Write clean, type-safe TypeScript (no `any` where avoidable).
   - Use TailwindCSS utility classes aligned with our glassmorphic theme tokens.
   - Maintain multi-lingual accessibility (add localization keys in `LanguageContext.tsx` if introducing user-facing text).
3. **Verify Locally**:
   ```bash
   npm run typecheck
   npm run build
   ```
4. **Commit with Conventional Commits**:
   - `feat(module): description`
   - `fix(module): description`
   - `docs: description`
   - `chore: description`
5. **Open a Pull Request** against `main` using our PR template.

---

## 🏛️ Digital Public Infrastructure (DPI) Principles

When contributing new features, align with the core DPI principles:
1. **Universal Accessibility**: Support low-end mobile devices and multi-lingual voice queries (Bhashini-inspired).
2. **Sovereign Privacy**: Zero hardcoded credentials; citizen PII must remain encrypted or locally cached.
3. **Resilience**: Offline-first design — applications must remain functional during intermittent network connectivity.

---

## 📜 License

By contributing to JanSetu AI, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
