# Formly Format Guide (v1)

Use this guide to generate valid plain-text form definitions that can be imported directly into **Formly**.

## 1. Syntax Rules

- The first line **must** be `formly: 1`.
- Lines starting with `#` or empty lines are ignored.
- Fields use `key: value` pairs.
- Indentation (2 spaces) defines child attributes (options, validation, logic).
- Each question **must** have a unique `key` matching `[a-z0-9_-]+`.

---

## 2. Header & Settings

```yaml
formly: 1
title: Product Feedback Survey
description: Tell us about your experience with our product.
```

---

## 3. Supported Question Types

| Type | Description | Example |
| :--- | :--- | :--- |
| `text` | Single line text | Name, Job title, Company |
| `textarea`| Multi-line text | Comments, detailed feedback |
| `choice` | Single selection (radio cards) | Satisfaction rating, Plan tier |
| `checkbox`| Multiple selection | Features used, Interests |
| `dropdown`| Select dropdown | Country, Department |
| `number` | Numeric value | Age, Team size, Quantity |
| `date` | Date picker (YYYY-MM-DD) | Date of incident, Birthday |
| `rating` | 1-5 or 1-10 visual star scale | Net Promoter Score, Rating |

---

## 4. Question Attributes

- `key`: Required unique identifier (e.g., `user_name`, `team_size`).
- `label`: The question text displayed to the respondent.
- `type`: One of the supported question types above.
- `description`: Optional helper text shown below the question.
- `required`: `true` or `false` (default: `false`).
- `placeholder`: Optional placeholder text.
- `options`: List of choices (required for `choice`, `checkbox`, `dropdown`).
- `validation`: Optional rules:
  - `min`: Minimum numeric value or string length.
  - `max`: Maximum numeric value or string length.
  - `pattern`: Regex pattern (e.g. `^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$`).
- `show_if`: Conditional logic rule (e.g. `show_if: plan == "Enterprise"`).

---

## 5. Complete Example

```yaml
formly: 1
title: Customer Onboarding
description: Help us tailor your workspace setup.

question:
  key: full_name
  type: text
  label: What is your full name?
  required: true
  placeholder: Jane Doe

question:
  key: company_size
  type: choice
  label: How large is your organization?
  required: true
  options:
    - 1-10 employees
    - 11-50 employees
    - 51-200 employees
    - 200+ employees

question:
  key: custom_needs
  type: textarea
  label: Please describe your enterprise compliance requirements.
  required: false
  show_if: company_size == "200+ employees"

question:
  key: satisfaction
  type: rating
  label: How likely are you to recommend us to a colleague?
  required: true
```
