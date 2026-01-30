# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Project Overview

This is a Microsoft Dynamics 365 Business Central extension project using AL (Application Language). The project appears to be for Google API integration for Fintutto.

## Technology Stack

- **Language**: AL (Application Language)
- **Platform**: Microsoft Dynamics 365 Business Central
- **IDE**: Visual Studio Code with AL Language extension

## Project Structure

```
├── .alpackages/     # Symbol packages (gitignored)
├── .vscode/         # VS Code settings and launch config (gitignored)
├── src/             # Source code (tables, pages, codeunits, etc.)
├── app.json         # App manifest file
└── CLAUDE.md        # This file
```

## Common AL Development Commands

- **Build**: `Ctrl+Shift+B` in VS Code or use AL: Build command
- **Publish**: `Ctrl+F5` to publish without debugging
- **Debug**: `F5` to publish with debugging
- **Download Symbols**: `Ctrl+Shift+P` → "AL: Download Symbols"

## AL Code Conventions

- Use PascalCase for all identifiers (tables, fields, procedures, variables)
- Prefix objects with a project-specific prefix to avoid conflicts
- Place business logic in Codeunits, not in Pages or Tables
- Use events and subscribers for extensibility
- Document public procedures with XML documentation comments

## API Integration Guidelines

When working with Google API integration:
- Store API credentials securely using Isolated Storage or Azure Key Vault
- Never hardcode API keys or secrets in source code
- Use HttpClient for REST API calls
- Implement proper error handling for API responses
- Consider rate limiting and retry logic for API calls

## Testing

- Create test codeunits in a separate test app
- Use the Test Runner to execute tests
- Follow the AAA pattern (Arrange, Act, Assert)
