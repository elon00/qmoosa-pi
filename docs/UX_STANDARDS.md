# Qmoosa Pi UX & Interface Standards

This document defines the interface quality bar for Qmoosa Pi. It is intentionally practical: every principle should map to a visible behavior in the application or an automated engineering gate.

## Product principles

1. **Trust before spectacle** — financial and identity states must be explicit. Experimental features must never visually imply production settlement, approval, or cryptographic guarantees.
2. **One primary action per context** — connect, pay, simulate, or ask. Secondary actions use lower visual emphasis.
3. **Progressive disclosure** — Pioneer-facing tasks appear before engineering diagnostics and experimental modules.
4. **Mobile first** — Pi Browser is a primary runtime, so core tasks must remain usable on narrow touch screens.
5. **Recoverable interactions** — errors explain the next action, payment states do not silently succeed, and local session clearing is distinguished from Pi account permission revocation.
6. **Source-of-truth status** — backend health, payment verification, x402 status, AI mode, and PQC status are rendered from actual configuration or clearly labeled static readiness states.

## Accessibility baseline

Target: WCAG 2.2 AA for core flows.

- Interactive controls use at least a 44px practical touch height.
- Keyboard focus uses a visible 2px high-contrast outline.
- Semantic headings preserve document hierarchy.
- A skip link bypasses repetitive navigation.
- Form controls have programmatic labels and helper text.
- Errors use `role="alert"`; non-error feedback uses a polite status region.
- Motion is reduced when `prefers-reduced-motion` is enabled.
- Color is not the only status indicator: status text accompanies color.
- Text and controls avoid low-contrast decorative-only states.

## Pi payment UX rules

- Real settlement uses the official Pi SDK `Pi.createPayment()` flow.
- Backend approval and completion remain mandatory before the UI calls a payment complete.
- Payment amount and memo are reviewed before opening the Pi flow.
- QR codes encode a **Qmoosa Pi payment-intent URL**, not an undocumented wallet payment protocol.
- Scanning a QR pre-fills the app; the user still confirms through the official Pi SDK.
- A cancelled or failed payment must never unlock a feature.

## Identity UX rules

- The UI requests only scopes it uses: username, payments, and wallet address.
- The access token is never rendered.
- A connected state is shown only after backend verification.
- “Clear app session” means local Qmoosa state is cleared; it does not claim to revoke Pi permissions.

## Visual system

- Base: deep slate background with restrained violet/fuchsia accent.
- Success: emerald.
- Pending/experimental: amber.
- Error: rose.
- Panels use subtle borders and low-opacity layers rather than heavy glass effects.
- Typography favors system fonts for reliability, speed, and cross-platform rendering.
- Cards use consistent radius, spacing, and hierarchy.
- Marketing copy avoids ROI, guarantee, certification, and unsupported “production-ready” claims.

## Performance strategy

- No hero images or video are required for the primary interface.
- System fonts avoid font-loading layout shifts.
- QR generation runs client-side after input changes.
- Heavy experimental modules remain API-driven instead of shipping unnecessary frontend frameworks.
- The dependency surface should remain small and audited.

## Developer-community quality bar

Every UI change should pass:

1. TypeScript.
2. Production static export.
3. Backend regression tests.
4. Frontend and backend high-severity dependency audits.
5. Repository secret/claim hygiene gates.
6. Responsive review at phone, tablet, and desktop widths.
7. Keyboard-only review for connect, pay, labs, and project-draft flows.
8. Truthfulness review: no feature status exceeds what code/runtime evidence supports.

## Current information architecture

- **Overview** — product purpose and system status.
- **Pioneer connection** — Pi authentication and verified identity.
- **Payment studio** — amount, memo, official Pi SDK payment, shareable QR intent.
- **Labs** — Conway engine and rules-based advisor.
- **Launchpad** — local project draft until persistence/moderation exists.
- **Capability map** — explicit implemented vs pending integrations.

## Future improvements

Before calling the product fully production-grade, add automated browser accessibility checks, Core Web Vitals telemetry, persistent payment/order storage, production monitoring, and real Pi Sandbox/Testnet transaction evidence.


## Release verification

The global UI/UX baseline was merged on 2026-09-29. Release verification requires a fresh main-branch CI run, GitHub Pages deployment, and backend deployment after the merge commit.
