# Tasks Directory

This directory contains task definitions and specifications for agentic AI operations.

## Overview

Tasks define the objectives, constraints, and success criteria for agents. They serve as the bridge between high-level goals and agent actions.

## Structure

```
tasks/
├── README.md           # This file
├── definitions/        # Task definition files
├── templates/          # Task templates for common patterns
└── examples/           # Example task implementations
```

## Task Components

A well-defined task includes:

1. **Objective**: Clear description of what the task aims to achieve
2. **Inputs**: Required data or context for the task
3. **Outputs**: Expected results or artifacts
4. **Constraints**: Limitations or rules the agent must follow
5. **Success Criteria**: Measurable conditions for task completion

## Creating a New Task

1. Use the task template in `templates/`
2. Define clear, measurable objectives
3. Specify all inputs and expected outputs
4. Document any constraints or edge cases
5. Add validation logic for success criteria

## Best Practices

- Keep tasks focused and single-purpose
- Make success criteria measurable and testable
- Document dependencies between tasks
- Version task definitions for reproducibility

## References

- [Agentic AI Task Design](https://openai.com/index/practices-for-governing-agentic-ai-systems/)
