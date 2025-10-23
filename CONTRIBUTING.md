# Contributing to GitWork

Thank you for your interest in contributing to GitWork! This document provides guidelines and instructions for contributing to the project.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Claiming Bounties](#claiming-bounties)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Code Style](#code-style)
- [Testing](#testing)
- [Documentation](#documentation)

---

## 🤝 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

---

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/gitwork.git
cd gitwork
```

### 2. Install Dependencies

```bash
# Install all dependencies (backend + frontend)
npm run install:all
```

### 3. Set Up Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# You'll need:
# - GitHub App credentials
# - Privy credentials
# - Solana RPC URL
# - Fee payer private key (for testing only)
```

### 4. Run Database Migrations

```bash
npm run db:migrate
```

### 5. Start Development Server

```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd gitwork-front
npm run dev
```

---

## 💻 Development Workflow

### Creating a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### Making Changes

1. Make your changes in your feature branch
2. Test your changes locally
3. Commit your changes with clear messages
4. Push to your fork

```bash
git add .
git commit -m "feat: add new feature description"
git push origin feature/your-feature-name
```

### Commit Message Format

We follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

---

## 💰 Claiming Bounties

### How to Find Bounties

1. Visit https://gitwork.io
2. Search for active bounties
3. Or look for issues labeled with bounty amounts (e.g., `gitwork:usdc:10`)

### How to Claim

1. **Pick an issue** with a bounty label
2. **Comment on the issue** to let others know you're working on it
3. **Create a PR** that references the issue (use `#issue_number` in PR description)
4. **Wait for review** and merge
5. **Claim your bounty** via the claim link posted on the issue

### Important Notes

- Only work on **active bounties** (status: `deposit_confirmed` or `ready_to_claim`)
- **One contributor per bounty** - first merged PR wins
- PR must be **approved and merged** to claim
- Reference the issue number (#XX) in your PR description

---

## 📝 Pull Request Guidelines

### Before Submitting

- ✅ Code follows project style guidelines
- ✅ All tests pass
- ✅ No linter errors
- ✅ Documentation updated if needed
- ✅ Tested on both desktop and mobile (for frontend changes)

### PR Description Template

```markdown
## Description
Brief description of changes

## Related Issue
Fixes #XX (or Closes #XX)

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring

## Testing
How did you test these changes?

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Commented complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
```

### Review Process

1. Submit your PR
2. Automated checks run
3. Code review by maintainers
4. Address feedback if needed
5. PR merged
6. Bounty claim link posted (if applicable)

---

## 🎨 Code Style

### Backend (Node.js)

- **ES Modules** - Use `import/export` syntax
- **Async/Await** - Prefer over promises
- **Error Handling** - Always use try/catch
- **Logging** - Use emoji prefixes (✅ ❌ 🔍 💰)
- **Comments** - Explain "why", not "what"

```javascript
// Good
try {
  const result = await someAsyncFunction();
  console.log('✅ Operation successful:', result);
} catch (error) {
  console.error('❌ Error:', error.message);
}
```

### Frontend (React)

- **Functional Components** - Use hooks
- **Tailwind CSS** - For styling
- **Responsive Design** - Mobile-first approach
- **Component Structure** - One component per file

```jsx
// Good
const MyComponent = () => {
  const [state, setState] = useState(null);
  
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-xl sm:text-2xl">Title</h1>
    </div>
  );
};
```

---

## 🧪 Testing

### Running Tests

```bash
# Backend tests
npm test

# Frontend tests
cd gitwork-front
npm test
```

### Writing Tests

- Test all new features
- Test edge cases
- Test error handling
- Use descriptive test names

---

## 📚 Documentation

### When to Update Docs

- Adding new features
- Changing APIs
- Updating configuration
- Fixing bugs that affect usage

### Documentation Files

- `README.md` - Main project overview
- `docs/` - Detailed documentation
- `CONTRIBUTING.md` - This file
- Code comments - For complex logic

---

## 🐛 Reporting Bugs

### Before Reporting

1. Search existing issues
2. Check documentation
3. Try latest version
4. Collect error logs

### Bug Report Template

```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Step one
2. Step two
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g. macOS 13.0]
- Node version: [e.g. 18.0.0]
- Browser: [e.g. Chrome 120]

**Logs/Screenshots**
Add relevant logs or screenshots
```

---

## 💡 Feature Requests

We welcome feature requests! Please:

1. Check existing feature requests
2. Describe the feature clearly
3. Explain the use case
4. Provide examples if possible

---

## 🆘 Getting Help

- **Email**: support@gitwork.io
- **GitHub Discussions**: Ask questions
- **GitHub Issues**: Report bugs
- **Documentation**: Check docs/ folder

---

## 🙏 Thank You!

Your contributions make GitWork better for everyone. We appreciate your time and effort!

---

*Happy coding! 🚀*

