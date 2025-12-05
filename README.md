# Hermod

**Predictive Multi-Modal Congestion Avoider** for Luxembourg cross-border commuters.

## Problem

Daily cross-border commuters in Luxembourg face unpredictable delays and congestion on public transport and roads, with 400,000+ daily inflows overwhelming infrastructure.

## Solution

ML-powered predictive routing using real-time transit, weather, and mobility data to suggest optimal multi-modal routes (train + bike, bus + FLEX, etc.).

## Project Structure

```
hermod/
├── bin/
│   └── hermod.ts              # CDK app entry point (dev/pipeline mode)
├── lib/
│   ├── infra/
│   │   ├── client/            # CloudFront + S3 static hosting
│   │   ├── config/            # Stage & pipeline configuration
│   │   ├── pipeline/          # CDK Pipelines (CI/CD)
│   │   ├── utils/             # CDK helpers
│   │   └── hermod-stack.ts    # Main application stack
│   └── ui/                    # React frontend (Vite)
│       └── src/
├── scripts/
│   ├── bootstrap-ssm.sh       # Creates SSM parameters from .env
│   └── deploy.sh              # AWS auth + CDK deploy
└── cdk.json
```

## Data Sources

- **Transit**: CFL GTFS-RT, NeTEx, SNCF, Deutsche Bahn, iRail
- **Weather**: Luxembourg Geoportail APIs
- **Mobility**: JCDecaux Vel'OH, FLEX Carsharing

## Getting Started

### Prerequisites

- Node.js 20+
- AWS CLI configured with credentials
- [CodeStar Connection](https://docs.aws.amazon.com/codepipeline/latest/userguide/connections-github.html) to GitHub

### Installation

```bash
npm install
npm run ui:install
```

### Configuration

Create a `.env` file (gitignored) with your settings:

```bash
AWS_ACCOUNT_ID=your-account-id
AWS_REGION=eu-central-1
GITHUB_CONNECTION_ARN=arn:aws:codestar-connections:region:account:connection/id
GITHUB_REPO=your-username/hermod
GITHUB_BRANCH=main
```

## Development Flow

The project supports two deployment modes, controlled by the `GITHUB_CONNECTION_ARN` environment variable:

### Dev Mode (Local Development)

When `GITHUB_CONNECTION_ARN` is **not set**, the CDK app creates a `dev-hermod` stack for direct deployment to your AWS account.

```
Developer → cdk deploy → AWS Account (dev-hermod stack)
```

**Use for**: Testing infrastructure changes locally before committing.

### Pipeline Mode (CI/CD)

When `GITHUB_CONNECTION_ARN` is **set**, the CDK app creates a `HermodPipeline` stack that:
1. Watches your GitHub repository for changes
2. Automatically builds, tests, and deploys on every push
3. Self-mutates when pipeline configuration changes

```
GitHub Push → CodePipeline → Build/Test → Deploy (prod-hermod stack)
```

**Use for**: Production deployments with automated CI/CD.

### How It Works

```
bin/hermod.ts
    │
    ├─ GITHUB_CONNECTION_ARN set? ──Yes──→ Create PipelineStack
    │                                        └─ Contains HermodStage (prod)
    │
    └─ No ──→ Create HermodStack (dev)
```

The pipeline synth step fetches configuration from AWS SSM Parameter Store at runtime, ensuring no sensitive values are stored in code.

## Deployment

### Option 1: CI/CD Pipeline (Recommended)

Deploy once, then all changes auto-deploy on GitHub push:

```bash
# 1. Bootstrap SSM parameters from .env
./scripts/bootstrap-ssm.sh

# 2. Deploy the pipeline (one-time)
./scripts/deploy.sh HermodPipeline

# 3. Push changes to GitHub - pipeline handles the rest
git push origin main
```

### Option 2: Direct Development Deploy

For local development without the pipeline:

```bash
# Comment out GITHUB_CONNECTION_ARN in .env, then:
./scripts/deploy.sh
```

## Local Development

```bash
# Run UI development server
npm run ui:dev

# Lint
npm run lint

# Build
npm run build
```

## Design Decisions

### Why SSM Parameter Store for Configuration?

| Approach | Pros | Cons |
|----------|------|------|
| **Hardcoded values** | Simple | Security risk, inflexible |
| **Environment variables baked in** | Works offline | Chicken-and-egg with self-mutation |
| **SSM Parameter Store** ✓ | Secure, centralized, no secrets in code | Requires AWS access at synth time |

We chose SSM because:
- **No secrets in code**: Account IDs, connection ARNs never committed to git
- **Avoids bootstrap problem**: Pipeline can self-mutate without losing config
- **Single source of truth**: `.env` → SSM → Pipeline (one-way flow)

### Why Region is Passed via `env` Block?

Region is the only value passed directly to CodeBuild because it's needed to bootstrap SSM calls. It's not sensitive (just `eu-central-1`), and storing it in SSM would create a circular dependency.

### Why Separate Dev and Pipeline Modes?

- **Dev mode**: Fast iteration without pipeline overhead
- **Pipeline mode**: Production-grade CI/CD with self-mutation

Single entry point (`bin/hermod.ts`) with mode switching keeps the codebase simple while supporting both workflows.

### Why Fail-Fast Validation?

The pipeline validates SSM parameters immediately after fetching:

```bash
[ -n "$AWS_ACCOUNT_ID" ] || { echo "ERROR: ..."; exit 1; }
```

Without this, empty variables would cause the synth to silently create the wrong stack (dev instead of pipeline), leading to confusing failures.

## Acknowledgments

- Bicycle data: JCDecaux
