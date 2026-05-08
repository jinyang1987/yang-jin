# Security Specification - TAIJI Meta-Driven System

## Data Invariants
1. A resource instance cannot exist without a valid category ID.
2. Only authorized users can create categories (admins).
3. Users can only update resources they have permission for (based on role and department).
4. System fields like `createdAt` are immutable.

## The Dirty Dozen Payloads
1. **Identity Spoofing**: Attempt to create a resource with a different `createdBy` UID.
2. **Category Poisoning**: A staff user attempting to create/modify a `category`.
3. **Ghost Field Update**: Adding `isAdmin: true` to a user profile.
4. **Relational Sync Break**: Creating a resource for a non-existent category.
5. **Role Escalation**: A staff user attempting to approve a resource (changing status to `approved`).
6. **Immutable Hijack**: Attempting to change `createdAt` of a resource.
7. **Cross-Department Leak**: A user reading resources from a different department (if isolation is enabled).
8. **Invalid ID injection**: Creating a category with a 1MB string as ID.
9. **Schema Bypass**: Injecting a string into a field defined as `NUMBER` (enforced by `isValid[Entity]`).
10. **State Skipping**: Moving a resource from `draft` to `approved` without manager verification.
11. **Bulk Scrape**: Querying all resources without filtering by department/owner.
12. **PII Leak**: Accessing private user info (email/phone) of other staff members.

## Security Controls
- Use `isValidCategory` and `isValidInstance` helpers.
- Use `affectedKeys().hasOnly()` for state transitions.
- Enforce `department` matching in rules.
