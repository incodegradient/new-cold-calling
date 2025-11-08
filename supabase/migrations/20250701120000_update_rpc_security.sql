/*
# [Function Security Update]
This migration updates the `get_campaigns_with_lead_count` function to address a security warning by setting a fixed `search_path`.

## Query Description:
This operation modifies an existing database function to improve security. It sets the `search_path` to `public`, preventing potential hijacking attacks where a malicious user could create objects in other schemas that the function might execute unintentionally. This change has no impact on existing data and is considered safe.

## Metadata:
- Schema-Category: ["Safe", "Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Modifies function: `public.get_campaigns_with_lead_count(uuid)`

## Security Implications:
- RLS Status: Not changed.
- Policy Changes: No.
- Auth Requirements: No.
- Mitigates: "Function Search Path Mutable" security warning.

## Performance Impact:
- Indexes: None.
- Triggers: None.
- Estimated Impact: Negligible.
*/

ALTER FUNCTION public.get_campaigns_with_lead_count(uuid) SET search_path = public;
