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
│   └── hermod.ts           # CDK app entry point
├── lib/
│   ├── infra/
│   │   ├── hermod-stack.ts # Main CDK stack
│   │   └── module/         # Resource creators
│   │       └── create-resource.ts
│   └── ui/                 # React frontend
│       └── src/
├── package.json
├── tsconfig.json
└── cdk.json
```

## Data Sources

- **Transit**: CFL GTFS-RT, NeTEx, SNCF, Deutsche Bahn, iRail
- **Weather**: Luxembourg Geoportail APIs
- **Mobility**: JCDecaux Vel'OH, FLEX Carsharing

## Getting Started

```bash
# Install CDK dependencies
npm install

# Install UI dependencies
npm run ui:install

# Synthesize CDK stack
npm run synth

# Run UI development server
npm run ui:dev
```

## Acknowledgments

- Bicycle data: JCDecaux
