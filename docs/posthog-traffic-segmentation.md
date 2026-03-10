
# PostHog Traffic Segmentation Guide

This document explains how to filter internal, stakeholder, and test traffic from real user data in PostHog dashboards.

---

## How Segmentation Works

Every analytics event carries 6 segmentation fields:

| Field | Values | Description |
|---|---|---|
| `environment` | `local`, `staging`, `production` | Auto-detected from deploy context |
| `traffic_source` | `app`, `admin`, `qa`, `stakeholder_test`, `internal_demo` | Where the event originated |
| `user_cohort` | `internal`, `stakeholder`, `pilot`, `real_user` | Who generated the event |
| `release_channel` | `dev`, `preview`, `prod` | Deployment channel |
| `is_internal` | `true`, `false` | Is this a team member? |
| `is_test_user` | `true`, `false` | Is this internal or stakeholder? |

These fields are attached to **every event** at both the event level and as PostHog person properties.

---

## Filtering Dashboards

### Exclude All Test Traffic

Add this filter to any PostHog insight:

```
is_test_user != true
```

This removes both internal team members and stakeholder test accounts.

### Exclude Internal Only

```
is_internal != true
```

This keeps stakeholder and pilot data but removes team traffic.

### Show Only Real Users

```
user_cohort = real_user
```

### Show Only Stakeholder Feedback Sessions

```
user_cohort = stakeholder
```

### Filter by Environment

```
environment = production
```

Use this to exclude local development and staging traffic.

---

## Marking Accounts

### Internal Team Members

Add user IDs or emails at app startup:

```typescript
import { registerInternalEmails, registerInternalUserIds } from "@cocs/analytics";

// From environment variable or config
const internalEmails = (process.env.INTERNAL_EMAILS || "").split(",").filter(Boolean);
const internalUserIds = (process.env.INTERNAL_USER_IDS || "").split(",").filter(Boolean);

registerInternalEmails(internalEmails);
registerInternalUserIds(internalUserIds);
```

### Stakeholder Test Users

```typescript
import { registerStakeholderUserIds } from "@cocs/analytics";

const stakeholderIds = (process.env.STAKEHOLDER_USER_IDS || "").split(",").filter(Boolean);
registerStakeholderUserIds(stakeholderIds);
```

### Admin Pages

Set traffic source on admin pages:

```typescript
import { setTrafficSource } from "@cocs/analytics";

// In admin layout or page component
setTrafficSource("admin");

// Reset when leaving admin
setTrafficSource(undefined);
```

---

## Environment Variables

| Variable | Example | Description |
|---|---|---|
| `INTERNAL_EMAILS` | `adam@company.com,dev@company.com` | Comma-separated internal emails |
| `INTERNAL_USER_IDS` | `uuid1,uuid2` | Comma-separated internal user IDs |
| `STAKEHOLDER_USER_IDS` | `uuid3,uuid4` | Comma-separated stakeholder IDs |
| `APP_ENV` or `NEXT_PUBLIC_APP_ENV` | `production` | Override environment detection |
| `RELEASE_CHANNEL` | `prod` | Override release channel detection |

---

## Default Funnel Exclusions

The following funnels should **exclude internal/test traffic by default**:

| Funnel | Filter |
|---|---|
| Registration → Qualification → Dashboard | `is_test_user != true` |
| CTA Click → Registration | `is_test_user != true` |
| Email Verification Rate | `is_test_user != true` |
| Qualification Completion Rate | `is_test_user != true` |
| Feature Adoption | `is_internal != true` |
| Feedback Analysis | No filter (stakeholder feedback is valuable) |

---

## Person Properties

When a user is identified via `identify()`, these person properties are set:

- `user_cohort` — `internal`, `stakeholder`, `pilot`, or `real_user`
- `is_internal` — boolean
- `is_stakeholder` — boolean

These can be used for PostHog cohort definitions and person-level filtering.
