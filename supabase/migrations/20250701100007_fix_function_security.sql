/*
  # [Security Fix] Set Function Search Path
  This migration enhances security by explicitly setting the `search_path` for the `get_campaigns_with_lead_count` function. This prevents potential hijacking attacks by ensuring the function only looks for tables and other objects in the `public` schema, mitigating the risk highlighted in the "Function Search Path Mutable" security advisory.

  ## Query Description:
  - This operation modifies the metadata of an existing database function.
  - It does not alter the function's logic or impact any existing data.
  - The change is safe and reversible.

  ## Metadata:
  - Schema-Category: "Safe"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true
  
  ## Structure Details:
  - Function being affected: `public.get_campaigns_with_lead_count(uuid)`
  
  ## Security Implications:
  - RLS Status: Not changed.
  - Policy Changes: No.
  - Auth Requirements: None.
  - This change directly hardens the function against search path manipulation attacks.
  
  ## Performance Impact:
  - Indexes: None.
  - Triggers: None.
  - Estimated Impact: Negligible. This is a metadata change with no performance overhead.
*/
ALTER FUNCTION public.get_campaigns_with_lead_count(p_user_id uuid) SET search_path = public;
