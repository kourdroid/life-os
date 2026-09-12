alter table life.profiles
  add column if not exists income_goal numeric(12,2) not null default 300 check (income_goal >= 0),
  add column if not exists prayer_city text check (prayer_city is null or char_length(prayer_city) <= 120),
  add column if not exists prayer_country text check (prayer_country is null or char_length(prayer_country) <= 120),
  add column if not exists prayer_latitude numeric(9,6) check (prayer_latitude is null or prayer_latitude between -90 and 90),
  add column if not exists prayer_longitude numeric(9,6) check (prayer_longitude is null or prayer_longitude between -180 and 180),
  add column if not exists prayer_method smallint not null default 21 check (prayer_method between 0 and 99),
  add column if not exists prayer_school smallint not null default 0 check (prayer_school in (0, 1));

grant usage on schema life to authenticated, service_role;
grant select, insert, update, delete on all tables in schema life to authenticated, service_role;

alter role authenticator set pgrst.db_schemas = 'public,graphql_public,pod,jobs,audit,api,coach,core,hunt,life';
notify pgrst, 'reload config';
