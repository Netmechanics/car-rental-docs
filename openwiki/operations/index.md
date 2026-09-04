# Files

- [Local Build & Preview Operations](build-and-preview.md) - Runbook for building and previewing the Antora docs site and running the MCP server locally — commands, prerequisites, env setup, output locations, and common pitfalls.
- [CI/CD Pipelines](cicd.md) - Documents the three GitHub Actions workflows that publish the docs site, build and push the MCP Docker image, and refresh the OpenWiki documentation on a schedule.
- [MCP Server Deployment (Docker & Kubernetes)](mcp-deployment.md) - How the nmecar docs MCP server is packaged into a multi-stage Docker image and deployed to Kubernetes, with baked read-only content, a /data vector cache volume, health probes, and pinned image digests.
