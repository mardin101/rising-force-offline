# Feature Development Workflow

This document describes the recommended workflow for developing new features in Rising Force Offline.

## Overview

Before implementing any feature, use the Socratic brainstorm process to think through the problem, solution, and technical implications. This helps avoid common pitfalls like circular dependencies, improper constant usage, and architectural issues.

---

## Phase 1: Brainstorm (REQUIRED)

All new features must go through brainstorming before implementation.

### Step 1: Start the Conversation

In GitHub Copilot Chat or in a GitHub Issue, invoke the brainstorm agent:

```
@feature-brainstorm I want to add [your feature description]
```

**Example:**
```
@feature-brainstorm I want to add a skill tree system where players can unlock new combat abilities using PT points
```

### Step 2: Engage with Questions

The agent will guide you through 4 phases with 10-15 questions total:

1. **Problem Understanding** - Clarify what problem you're solving
2. **Solution Exploration** - Explore alternatives and constraints  
3. **Impact Analysis** - Identify risks and system impacts
4. **Success Definition** - Define what success looks like

**Guidelines:**
- Answer each question thoughtfully
- Provide context from gameplay experience
- Challenge your own assumptions
- Reference existing systems (combat, PT, economy)
- Think about edge cases

### Step 3: Review the Summary

After all phases, the agent provides a structured summary including:

- ✅ Refined problem statement
- ✅ Refined solution approach
- ✅ Key insights discovered
- ✅ Technical considerations (constants, modules, circular dependency risks)
- ✅ Impact on PT/combat/economy systems
- ✅ Recommended next steps

**Review this carefully before proceeding to implementation!**

---

## Phase 2: Create Issue (Recommended)

Document the brainstorm for future reference.

### Step 1: Create Feature Brainstorm Issue

1. Go to Issues → New Issue
2. Select "Feature Brainstorm" template
3. Fill in the feature idea
4. Submit the issue

### Step 2: Run Brainstorm Session

Comment on the issue with:
```
@feature-brainstorm Let's explore this feature
```

Work through all the questions in the issue comments.

### Step 3: Update Issue with Summary

Copy the final brainstorm summary into the issue description. This serves as a design document.

---

## Phase 3: Implementation

Now you're ready to implement with clear direction!

### Step 1: Create PR with Context

Use GitHub Copilot to create a pull request:

```
@copilot create a pull request to [implement refined feature] in mardin101/rising-force-offline

Context from brainstorm (issue #XX):
- Problem: [problem statement]
- Solution: [refined solution]
- Constants to use: [list from technical considerations]
- Modules affected: [list from technical considerations]
- Circular dependency considerations: [notes from technical considerations]
```

### Step 2: Reference Brainstorm Issue

In the PR description, add:
```markdown
## Brainstorm Reference

This PR implements the feature discussed in #[issue number].

See the brainstorm summary for full context on problem statement, alternatives considered, and technical decisions.
```

### Step 3: Implementation Checklist

As you implement, verify:

- [ ] Using constants instead of string/number literals
- [ ] No circular dependencies introduced
- [ ] Following state hierarchy (/state → /utils → /hooks → /components → /pages)
- [ ] Type safety maintained (no `any` types)
- [ ] Proper imports from `gameStateSlice.ts`
- [ ] PT/combat/economy systems properly integrated
- [ ] Edge cases handled
- [ ] Performance considerations addressed

---

## Why This Workflow?

### Benefits

1. **Better Architecture**
   - Identifies circular dependency risks early
   - Ensures proper module organization
   - Clarifies state management approach

2. **Proper Standards**
   - Determines which constants to use upfront
   - Ensures TypeScript type safety
   - Maintains project coding guidelines

3. **Faster Implementation**
   - Clear direction reduces iterations
   - Technical considerations mapped out
   - Edge cases identified before coding

4. **Better PRs**
   - Context-rich descriptions
   - Clear rationale for decisions
   - Easier to review
   - Better documentation trail

5. **Avoids Scope Creep**
   - Clear problem definition
   - Identified MVP vs. nice-to-have
   - Success criteria defined

6. **System Integration**
   - PT progression impact considered
   - Combat mechanics properly integrated
   - Economy balance maintained

---

## Examples

### Example 1: Skill Tree Feature

**Brainstorm Issue:** #42
**Implementation PR:** #45

The brainstorm revealed:
- Need to add new PT type constants
- Skill tree should integrate with existing PT progression
- Circular dependency risk between skill module and character state
- Solution: Extract skill definitions to /data, skill logic to /utils

**Result:** Clean implementation, no refactoring needed, merged in 1 review cycle.

### Example 2: Guild System Feature (Future)

**Brainstorm Issue:** #TBD
**Status:** Brainstorm phase revealed that guild system requires:
- Multiplayer infrastructure (not in scope)
- Server-side state management (not available)
- **Decision:** Postponed until multiplayer support is added

**Result:** Avoided wasting time on impossible feature, pivoted to achievable alternatives.

---

## Quick Reference

### Starting a Brainstorm

```
@feature-brainstorm I want to add [feature]
```

### Creating Implementation PR

```
@copilot create a pull request to [implement feature] in mardin101/rising-force-offline
```

### Key Project Constraints

- ✅ Always use constants from `gameStateSlice.ts`
- ✅ Never create circular dependencies
- ✅ Follow state hierarchy
- ✅ Maintain TypeScript strict mode
- ✅ Consider PT, combat, and economy impacts

---

## Need Help?

- **Agent not responding?** Ensure you're using `@feature-brainstorm` mention
- **Questions unclear?** Ask the agent to rephrase or provide examples
- **Technical details?** Reference `.github/copilot-instructions.md`
- **Constant reference?** Check `project-bellato-idle/src/state/gameStateSlice.ts`

---

## Contributing

This workflow is designed to improve code quality and make collaboration easier. If you have suggestions for improving it, please open an issue!
