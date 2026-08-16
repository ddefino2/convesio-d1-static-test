# Convesio D1 static-site test

A minimal Cloudflare Pages-compatible fixture for validating the Convesio Static Site Database add-on.

- `index.html` calls `/api/d1`.
- `functions/api/d1.js` expects the D1 binding at `context.env.DB`.
- The endpoint creates a `d1_test_markers` table when needed, writes a timestamped marker, and returns the latest marker count.

## Expected result

After provisioning the Convesio Database add-on with binding name `DB`, opening the deployed page should show a successful read/write response from `/api/d1`.
