-- Create a function to get the total user count
-- This function runs with SECURITY DEFINER privileges to access auth.users
-- but only returns the count, not sensitive data.

create or replace function get_user_count()
returns integer
language plpgsql
security definer
as $$
begin
  return (select count(*) from auth.users);
end;
$$;

-- Grant execute permission to authenticated users (so the admin dashboard can call it)
grant execute on function get_user_count to authenticated;
