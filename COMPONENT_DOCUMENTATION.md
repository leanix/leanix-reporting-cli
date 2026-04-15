# [Component Name]

> **Component Type**: What type is this component? (e.g. Backend Service, Micro-frontend SPA, Component Library, Data Pipeline, CLI Tool)
> **Owner Team**: Which team owns and is responsible for this component?
> **Primary Contact**: Who is the primary point of contact? (name + Slack handle)
> **Criticality**: How critical is this component to the business? (Mission Critical / Business Critical / Business Operational / Administrative)

---

## 1. Component Overview

**Purpose**
What does this component do? What problem does it solve? Who consumes it?

- For **backend**: What user-facing or system workflows depend on it? What teams call this service?
- For **frontend**: Which shell app or page does this MFE mount into? What URL path(s) does it own? What user-facing functionality does it deliver?

**Tech Stack**

List each layer of your stack that is relevant. Only include rows that apply to your component.

| Layer            | Technology                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------ |
| Language         | What language and version? (e.g. TypeScript 5, Python 3.12)                                |
| Framework        | What framework? (e.g. Fastify, React 18, Django)                                           |
| Bundler          | Frontend only: what bundler? (e.g. Vite, Webpack, Rollup)                                  |
| MFE Integration  | Frontend only: how is the MFE loaded? (e.g. Module Federation, single-spa, Web Components) |
| State Management | Frontend only: how is state managed? (e.g. Redux, Zustand, React Query, none)              |
| Design System    | Frontend only: which component library or design system is used?                           |
| Queue            | Backend only: does it use a message queue? Which one? (e.g. AWS SQS, Azure Service Bus)    |
| Database         | Backend only: what database(s) does it rely on?                                            |
| Cache            | Backend only: does it use a cache layer? Which one? (e.g. Redis, Memcached)                |
| CDN              | Frontend only: which CDN and endpoint? (e.g. Azure CDN profile/endpoint name)              |

> Remove rows that do not apply. Add rows for anything not listed (e.g. Object Storage, Search Engine, Feature Flag Service).

**Repository**: Where is the source code hosted? Provide a link.

---

## 2. Architecture

![Architecture Diagram](./architecture-diagram.png)

> Replace the image above with the current architecture diagram for this component. Store the file next to this document and update the path accordingly. If no diagram exists yet, is there a ticket to create one?

### Upstream Dependencies

| Name                                                            | Type                                                                                                       | Criticality                                                         |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| What services or systems does this component call or depend on? | Is each dependency an Internal API, External API, Managed Service, Database, Auth Provider, or CDN Origin? | How critical is each dependency? What happens if it is unavailable? |

### Downstream Consumers

| Name                                                                     | Team                           |
| ------------------------------------------------------------------------ | ------------------------------ |
| What other services, MFEs, or shell apps consume or load this component? | Which team owns each consumer? |

---

## 3. Infrastructure & Hosting

| Property         | Value                                                                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hosting Type     | How is this component hosted? (e.g. Kubernetes/EKS, Azure CDN, Azure App Service, AWS Lambda, Azure Blob Storage + CDN)                            |
| Cloud Provider   | Which cloud provider? (AWS, Azure, GCP, on-prem, etc.)                                                                                             |
| Region(s)        | Which primary region is used? Is there a failover or multi-region setup?                                                                           |
| Scaling          | How does this component scale? (e.g. HPA with min/max replicas, CDN edge scaling, serverless, fixed instances)                                     |
| Key Resources    | What are the key infrastructure resources? (e.g. SQS queues, RDS, ElastiCache, Azure CDN endpoint, Blob Storage container, App Insights workspace) |
| Environment URLs | What are the URLs per environment? (dev, staging, prod)                                                                                            |

---

## 4. Operational Access

| Type           | Link                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Dashboard      | Where can on-call engineers find the primary monitoring dashboard? (e.g. Grafana, Azure Monitor, Application Insights)    |
| Alerts         | Where are alerts configured and routed? (e.g. PagerDuty, Opsgenie, Azure Alerts)                                          |
| Logs           | Where can logs be searched? (e.g. Kibana, Datadog, CloudWatch, Azure Log Analytics)                                       |
| Tracing / RUM  | Where can traces or real-user monitoring data be explored? (e.g. Jaeger, Datadog RUM, Azure Application Insights, Sentry) |
| Error Tracking | Where are client-side or server-side errors captured? (e.g. Sentry, Datadog, Application Insights)                        |
| Runbooks       | Where are the runbooks stored? (e.g. Confluence, Notion, GitHub)                                                          |
| Repository     | Link to the source code repository.                                                                                       |

---

## 5. SLOs & Health Baseline

### SLOs

Define the SLOs that matter for this component. Only include metrics that are actively measured and alerted on.

| Metric                             | Target                                                                  | Alert Threshold                               |
| ---------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------- |
| Availability                       | What is the uptime target? (e.g. 99.9%)                                 | At what level should an alert fire?           |
| [Backend: p99 API Latency]         | What is the acceptable p99 response time? (e.g. < 500ms)                | At what latency should an alert fire?         |
| [Backend: Error Rate]              | What client or server error rate is acceptable on the primary endpoint? | At what rate should an alert fire?            |
| [Backend: Queue Depth / Lag]       | If applicable, what is the acceptable queue depth or processing lag?    | At what depth or lag should an alert fire?    |
| [Frontend: First Contentful Paint] | What is the acceptable FCP? (e.g. < 1.5s)                               | At what value should an alert fire?           |
| [Frontend: Load Time]              | What is the acceptable full page load time? (e.g. < 3s)                 | At what value should an alert fire?           |
| [Frontend: JS Error Rate]          | What client-side error rate is acceptable?                              | At what rate should an alert fire?            |
| [Frontend: Bundle Size]            | Is there a size budget for the main bundle?                             | At what size should CI fail or an alert fire? |

> Remove rows that do not apply. Add rows for any additional metrics specific to this component.

### What Does Healthy Look Like?

- **Backend**: What is the expected number of healthy pods or instances, and what states indicate a problem? What does normal queue or job processing behaviour look like? What error rate on the primary endpoint is acceptable? If there is a cache layer, what hit rate indicates healthy operation?
- **Frontend**: What does a passing build and successful CDN deployment look like? What CDN cache hit rate is expected? What does normal RUM data (FCP, load time, error rate) look like on a calm day?
- Are there specific third-party API or service error rates that should be near zero?
- What does a normal latency or performance trend look like on the dashboard?
- Are there any known benign warnings or expected console errors that on-call engineers should ignore?

---

## 6. Known Failure Modes

| Symptom                                                | Likely Cause                        | Runbook                                    | Escalation                              |
| ------------------------------------------------------ | ----------------------------------- | ------------------------------------------ | --------------------------------------- |
| What observable symptom does the on-call engineer see? | What is the most likely root cause? | Link to the runbook for this failure mode. | Which escalation level should be paged? |

> Add a row for each known failure mode. Draw from past post-mortems and on-call experience.
>
> **Backend examples**: crash loops, queue backlog, DB connection pool exhaustion, upstream API outage, cache miss storm.
>
> **Frontend examples**: blank page or white screen (hydration failure, Module Federation load error), CDN serving stale or broken build, auth token not propagating across MFEs, cross-MFE event communication breakdown, third-party script blocking render, CSP violation blocking assets.

---

## 7. Deployment & Rollback

**Release Cadence**: How often is this component deployed? Is it continuous delivery, scheduled releases, or manual? What triggers a deployment?

**CI/CD Pipeline**: Where can the CI/CD pipeline be monitored? Provide a link.

### Rollback Procedure

1. How do you identify the last known good version? (e.g. image tag in registry, previous artifact in blob storage, pipeline run ID)
2. How is the rollback initiated? (e.g. ArgoCD history rollback, rerun a previous pipeline, swap a CDN origin pointer or manifest file)
3. Are there cache or CDN purge steps required after rollback? If so, what is the purge scope and command?
4. How is the rollback confirmed to be complete and healthy? (e.g. pod health, RUM data recovering, CDN serving correct bundle hash)
5. How is the team or stakeholders notified of a rollback? (e.g. Slack channel, incident ticket)
6. Are there any additional post-rollback manual steps? (e.g. cache flush, queue drain, feature flag revert)

**Estimated Rollback Time**: How long does a typical rollback take end-to-end?

---

## 8. Incident History

### Post-Mortems

- [YYYY-MM-DD — Severity: Brief description of what happened and the impact](link-to-post-mortem)

> List the most significant past incidents. Each entry should link to a post-mortem. What patterns emerge across incidents?