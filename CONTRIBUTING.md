# Contributing to Rising Force Offline

Thank you for your interest in contributing to Rising Force Offline! This document provides guidelines for contributing to the project, with a special focus on agentic AI development.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Contributing Agentic AI Modules](#contributing-agentic-ai-modules)
- [Code Style and Standards](#code-style-and-standards)
- [Submitting Changes](#submitting-changes)
- [Community Guidelines](#community-guidelines)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/rising-force-offline.git
   cd rising-force-offline
   ```
3. Install dependencies:
   ```bash
   cd project-bellato-idle
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Development Workflow

1. Create a new branch for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes following the code style guidelines
3. Run linting and tests:
   ```bash
   npm run lint
   npm run build
   ```
4. Commit your changes with clear, descriptive messages
5. Push to your fork and create a pull request

## Contributing Agentic AI Modules

### Directory Structure

The project follows a modular architecture for agentic AI:

```
/agents        - Agent implementations
/tasks         - Task definitions and specifications
/environments  - Environment configurations
```

### Creating an Agent

1. **Define the Purpose**: Clearly document what your agent does
2. **Implement the Interface**: Follow the base agent interface
3. **Add Documentation**: Include README and inline comments
4. **Write Tests**: Add corresponding tests in `/tasks`

#### Agent Requirements

- Agents must be stateless or clearly document their state management
- Implement proper error handling and fallback behaviors
- Follow the single-responsibility principle
- Document all inputs, outputs, and side effects

### Creating a Task

1. Use the task template in `/tasks/templates/`
2. Define clear, measurable objectives
3. Specify inputs, outputs, and constraints
4. Add success criteria and validation logic

### Creating an Environment

1. Define state, action, and observation spaces
2. Implement standard environment interface (reset, step, render)
3. Document all environment dynamics
4. Add tests for environment behavior

### Best Practices for Agentic AI

- **Transparency**: Document agent decision-making processes
- **Safety**: Implement safeguards against unintended behaviors
- **Testability**: Ensure all agent behaviors can be tested
- **Modularity**: Keep agents focused and composable
- **Reproducibility**: Make agent behaviors deterministic where possible

## Code Style and Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### General Guidelines

- Keep functions small and focused
- Write self-documenting code
- Add comments for complex logic
- Follow existing patterns in the codebase

### Commit Messages

Use clear, descriptive commit messages:

```
feat: add battle environment for agent testing
fix: correct agent state management in combat loop
docs: update agent contribution guidelines
test: add unit tests for NPC agent
```

## Submitting Changes

### Pull Request Process

1. Ensure your code passes all linting and tests
2. Update documentation if needed
3. Fill out the pull request template completely
4. Request review from maintainers
5. Address any feedback promptly

### Pull Request Guidelines

- Keep PRs focused and reasonably sized
- Link related issues in the description
- Include screenshots for UI changes
- Add tests for new functionality

## Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Report inappropriate behavior to maintainers

### Getting Help

- Open an issue for bugs or feature requests
- Use discussions for questions and ideas
- Check existing issues before creating new ones

## References

### Agentic AI Best Practices

- [OpenAI Practices for Governing Agentic AI Systems](https://openai.com/index/practices-for-governing-agentic-ai-systems/)
- [GitHub Actions Best Practices](https://docs.github.com/en/actions/using-workflows/best-practices-for-workflow-configuration)
- [GitHub Copilot Coding Agent](https://docs.github.com/en/copilot/using-github-copilot/using-the-github-copilot-coding-agent-in-your-ide)

### Project Documentation

- [Project README](./README.md)
- [Agents Documentation](./agents/README.md)
- [Tasks Documentation](./tasks/README.md)
- [Environments Documentation](./environments/README.md)

---

Thank you for contributing to Rising Force Offline! Your contributions help make this project better for everyone.
