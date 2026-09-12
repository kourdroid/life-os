create index if not exists commitment_events_commitment_id_idx
  on life.commitment_events (commitment_id);

create index if not exists commitments_weekly_plan_id_idx
  on life.commitments (weekly_plan_id);

create index if not exists experiments_user_id_idx
  on life.experiments (user_id);

create index if not exists job_events_opportunity_id_idx
  on life.job_events (opportunity_id);
