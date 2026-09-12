


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "life";


ALTER SCHEMA "life" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "life"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "life"."set_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "life"."commitment_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "commitment_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "event_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "reason" "text",
    "note" "text",
    "from_scheduled_for" timestamp with time zone,
    "to_scheduled_for" timestamp with time zone,
    CONSTRAINT "commitment_events_event_type_check" CHECK (("event_type" = ANY (ARRAY['completed'::"text", 'reduced'::"text", 'skipped'::"text", 'rescheduled'::"text", 'reopened'::"text"]))),
    CONSTRAINT "commitment_events_note_check" CHECK ((("note" IS NULL) OR ("char_length"("note") <= 1000))),
    CONSTRAINT "commitment_events_reason_check" CHECK ((("reason" IS NULL) OR ("char_length"("reason") <= 500)))
);


ALTER TABLE "life"."commitment_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "life"."commitments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "weekly_plan_id" "uuid",
    "area" "text" NOT NULL,
    "title" "text" NOT NULL,
    "detail" "text",
    "importance" "text" NOT NULL,
    "scheduled_for" timestamp with time zone,
    "duration_minutes" smallint,
    "minimum_title" "text",
    "status" "text" DEFAULT 'planned'::"text" NOT NULL,
    "recurrence" "text" DEFAULT 'once'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "commitments_area_check" CHECK (("area" = ANY (ARRAY['deen'::"text", 'licence'::"text", 'job'::"text", 'health'::"text", 'youtube'::"text", 'experiment'::"text"]))),
    CONSTRAINT "commitments_detail_check" CHECK ((("detail" IS NULL) OR ("char_length"("detail") <= 1000))),
    CONSTRAINT "commitments_duration_minutes_check" CHECK ((("duration_minutes" IS NULL) OR (("duration_minutes" >= 5) AND ("duration_minutes" <= 480)))),
    CONSTRAINT "commitments_importance_check" CHECK (("importance" = ANY (ARRAY['core'::"text", 'committed'::"text", 'flexible'::"text"]))),
    CONSTRAINT "commitments_minimum_title_check" CHECK ((("minimum_title" IS NULL) OR ("char_length"("minimum_title") <= 140))),
    CONSTRAINT "commitments_recurrence_check" CHECK (("recurrence" = ANY (ARRAY['once'::"text", 'daily'::"text", 'weekly'::"text"]))),
    CONSTRAINT "commitments_status_check" CHECK (("status" = ANY (ARRAY['planned'::"text", 'completed'::"text", 'reduced'::"text", 'skipped'::"text", 'rescheduled'::"text", 'archived'::"text"]))),
    CONSTRAINT "commitments_title_check" CHECK ((("char_length"("title") >= 1) AND ("char_length"("title") <= 140)))
);


ALTER TABLE "life"."commitments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "life"."content_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "title" "text" NOT NULL,
    "stage" "text" DEFAULT 'idea'::"text" NOT NULL,
    "next_action" "text",
    "published_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "content_items_next_action_check" CHECK ((("next_action" IS NULL) OR ("char_length"("next_action") <= 280))),
    CONSTRAINT "content_items_published_url_check" CHECK ((("published_url" IS NULL) OR ("char_length"("published_url") <= 2000))),
    CONSTRAINT "content_items_stage_check" CHECK (("stage" = ANY (ARRAY['idea'::"text", 'selected'::"text", 'script'::"text", 'recorded'::"text", 'editing'::"text", 'packaged'::"text", 'published'::"text", 'paused'::"text"]))),
    CONSTRAINT "content_items_title_check" CHECK ((("char_length"("title") >= 1) AND ("char_length"("title") <= 200)))
);


ALTER TABLE "life"."content_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "life"."daily_checkins" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "day" "date" NOT NULL,
    "capacity" "text" DEFAULT 'normal'::"text" NOT NULL,
    "mood" smallint,
    "closeout" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "daily_checkins_capacity_check" CHECK (("capacity" = ANY (ARRAY['low'::"text", 'normal'::"text", 'high'::"text"]))),
    CONSTRAINT "daily_checkins_closeout_check" CHECK ((("closeout" IS NULL) OR ("char_length"("closeout") <= 1000))),
    CONSTRAINT "daily_checkins_mood_check" CHECK ((("mood" IS NULL) OR (("mood" >= 1) AND ("mood" <= 5))))
);


ALTER TABLE "life"."daily_checkins" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "life"."driving_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "scheduled_for" timestamp with time zone NOT NULL,
    "duration_minutes" smallint NOT NULL,
    "kind" "text" DEFAULT 'practical'::"text" NOT NULL,
    "attendance" "text" DEFAULT 'scheduled'::"text" NOT NULL,
    "note" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "driving_sessions_attendance_check" CHECK (("attendance" = ANY (ARRAY['scheduled'::"text", 'attended'::"text", 'cancelled_by_school'::"text", 'rescheduled'::"text", 'missed'::"text"]))),
    CONSTRAINT "driving_sessions_duration_minutes_check" CHECK ((("duration_minutes" >= 30) AND ("duration_minutes" <= 300))),
    CONSTRAINT "driving_sessions_kind_check" CHECK (("kind" = ANY (ARRAY['practical'::"text", 'theory'::"text", 'exam'::"text"]))),
    CONSTRAINT "driving_sessions_note_check" CHECK ((("note" IS NULL) OR ("char_length"("note") <= 1000)))
);


ALTER TABLE "life"."driving_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "life"."experiments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "title" "text" NOT NULL,
    "hypothesis" "text" NOT NULL,
    "time_budget_minutes" smallint DEFAULT 120 NOT NULL,
    "money_budget" numeric(12,2) DEFAULT 0 NOT NULL,
    "review_on" "date",
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "evidence_note" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "experiments_evidence_note_check" CHECK ((("evidence_note" IS NULL) OR ("char_length"("evidence_note") <= 2000))),
    CONSTRAINT "experiments_hypothesis_check" CHECK ((("char_length"("hypothesis") >= 1) AND ("char_length"("hypothesis") <= 1000))),
    CONSTRAINT "experiments_money_budget_check" CHECK (("money_budget" >= (0)::numeric)),
    CONSTRAINT "experiments_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'paused'::"text", 'completed'::"text", 'stopped'::"text"]))),
    CONSTRAINT "experiments_time_budget_minutes_check" CHECK ((("time_budget_minutes" >= 15) AND ("time_budget_minutes" <= 10080))),
    CONSTRAINT "experiments_title_check" CHECK ((("char_length"("title") >= 1) AND ("char_length"("title") <= 160)))
);


ALTER TABLE "life"."experiments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "life"."income_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "source" "text" NOT NULL,
    "amount" numeric(12,2) NOT NULL,
    "currency" character(3) DEFAULT 'USD'::"bpchar" NOT NULL,
    "received_on" "date" NOT NULL,
    "status" "text" DEFAULT 'confirmed'::"text" NOT NULL,
    "note" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "income_entries_amount_check" CHECK (("amount" >= (0)::numeric)),
    CONSTRAINT "income_entries_currency_check" CHECK (("currency" ~ '^[A-Z]{3}$'::"text")),
    CONSTRAINT "income_entries_note_check" CHECK ((("note" IS NULL) OR ("char_length"("note") <= 1000))),
    CONSTRAINT "income_entries_source_check" CHECK ((("char_length"("source") >= 1) AND ("char_length"("source") <= 140))),
    CONSTRAINT "income_entries_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'confirmed'::"text", 'failed'::"text"])))
);


ALTER TABLE "life"."income_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "life"."job_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "opportunity_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "occurred_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "note" "text",
    CONSTRAINT "job_events_event_type_check" CHECK (("event_type" = ANY (ARRAY['saved'::"text", 'prepared'::"text", 'applied'::"text", 'replied'::"text", 'interview'::"text", 'offer'::"text", 'rejected'::"text", 'follow_up'::"text", 'closed'::"text"]))),
    CONSTRAINT "job_events_note_check" CHECK ((("note" IS NULL) OR ("char_length"("note") <= 2000)))
);


ALTER TABLE "life"."job_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "life"."job_opportunities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "company" "text" NOT NULL,
    "role" "text" NOT NULL,
    "url" "text",
    "stage" "text" DEFAULT 'saved'::"text" NOT NULL,
    "next_action" "text",
    "next_action_at" timestamp with time zone,
    "applied_at" timestamp with time zone,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "job_opportunities_company_check" CHECK ((("char_length"("company") >= 1) AND ("char_length"("company") <= 160))),
    CONSTRAINT "job_opportunities_next_action_check" CHECK ((("next_action" IS NULL) OR ("char_length"("next_action") <= 280))),
    CONSTRAINT "job_opportunities_notes_check" CHECK ((("notes" IS NULL) OR ("char_length"("notes") <= 2000))),
    CONSTRAINT "job_opportunities_role_check" CHECK ((("char_length"("role") >= 1) AND ("char_length"("role") <= 160))),
    CONSTRAINT "job_opportunities_stage_check" CHECK (("stage" = ANY (ARRAY['saved'::"text", 'preparing'::"text", 'applied'::"text", 'replied'::"text", 'interview'::"text", 'offer'::"text", 'rejected'::"text", 'closed'::"text"]))),
    CONSTRAINT "job_opportunities_url_check" CHECK ((("url" IS NULL) OR ("char_length"("url") <= 2000)))
);


ALTER TABLE "life"."job_opportunities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "life"."profiles" (
    "user_id" "uuid" NOT NULL,
    "display_name" "text" DEFAULT 'Mehdi'::"text" NOT NULL,
    "timezone" "text" DEFAULT 'Africa/Casablanca'::"text" NOT NULL,
    "week_starts_on" smallint DEFAULT 1 NOT NULL,
    "quran_daily_target" numeric(6,2) DEFAULT 1 NOT NULL,
    "quran_target_unit" "text" DEFAULT 'hizb'::"text" NOT NULL,
    "reduced_motion" boolean DEFAULT false NOT NULL,
    "income_goal" numeric(12,2) DEFAULT 300 NOT NULL,
    "prayer_city" "text",
    "prayer_country" "text",
    "prayer_latitude" numeric(9,6),
    "prayer_longitude" numeric(9,6),
    "prayer_method" smallint DEFAULT 21 NOT NULL,
    "prayer_school" smallint DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "profiles_display_name_check" CHECK ((("char_length"("display_name") >= 1) AND ("char_length"("display_name") <= 80))),
    CONSTRAINT "profiles_income_goal_check" CHECK (("income_goal" >= (0)::numeric)),
    CONSTRAINT "profiles_prayer_city_check" CHECK ((("prayer_city" IS NULL) OR ("char_length"("prayer_city") <= 120))),
    CONSTRAINT "profiles_prayer_country_check" CHECK ((("prayer_country" IS NULL) OR ("char_length"("prayer_country") <= 120))),
    CONSTRAINT "profiles_prayer_latitude_check" CHECK ((("prayer_latitude" IS NULL) OR (("prayer_latitude" >= '-90'::numeric) AND ("prayer_latitude" <= '90'::numeric)))),
    CONSTRAINT "profiles_prayer_longitude_check" CHECK ((("prayer_longitude" IS NULL) OR (("prayer_longitude" >= '-180'::numeric) AND ("prayer_longitude" <= '180'::numeric)))),
    CONSTRAINT "profiles_prayer_method_check" CHECK ((("prayer_method" >= 0) AND ("prayer_method" <= 99))),
    CONSTRAINT "profiles_prayer_school_check" CHECK (("prayer_school" = ANY (ARRAY[0, 1]))),
    CONSTRAINT "profiles_quran_daily_target_check" CHECK ((("quran_daily_target" > (0)::numeric) AND ("quran_daily_target" <= (60)::numeric))),
    CONSTRAINT "profiles_quran_target_unit_check" CHECK (("quran_target_unit" = ANY (ARRAY['hizb'::"text", 'page'::"text", 'juz'::"text"]))),
    CONSTRAINT "profiles_week_starts_on_check" CHECK ((("week_starts_on" >= 0) AND ("week_starts_on" <= 6)))
);


ALTER TABLE "life"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "life"."quran_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "day" "date" NOT NULL,
    "completed_amount" numeric(6,2) DEFAULT 0 NOT NULL,
    "unit" "text" DEFAULT 'hizb'::"text" NOT NULL,
    "note" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "quran_entries_completed_amount_check" CHECK ((("completed_amount" >= (0)::numeric) AND ("completed_amount" <= (60)::numeric))),
    CONSTRAINT "quran_entries_note_check" CHECK ((("note" IS NULL) OR ("char_length"("note") <= 500))),
    CONSTRAINT "quran_entries_unit_check" CHECK (("unit" = ANY (ARRAY['hizb'::"text", 'page'::"text", 'juz'::"text"])))
);


ALTER TABLE "life"."quran_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "life"."salah_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "day" "date" NOT NULL,
    "prayer" "text" NOT NULL,
    "status" "text" NOT NULL,
    "recorded_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "salah_entries_prayer_check" CHECK (("prayer" = ANY (ARRAY['fajr'::"text", 'dhuhr'::"text", 'asr'::"text", 'maghrib'::"text", 'isha'::"text"]))),
    CONSTRAINT "salah_entries_status_check" CHECK (("status" = ANY (ARRAY['on_time'::"text", 'late'::"text", 'missed'::"text", 'unrecorded'::"text"])))
);


ALTER TABLE "life"."salah_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "life"."training_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "scheduled_for" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "title" "text" DEFAULT 'Training'::"text" NOT NULL,
    "duration_minutes" smallint,
    "status" "text" DEFAULT 'planned'::"text" NOT NULL,
    "note" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "training_sessions_duration_minutes_check" CHECK ((("duration_minutes" IS NULL) OR (("duration_minutes" >= 5) AND ("duration_minutes" <= 300)))),
    CONSTRAINT "training_sessions_note_check" CHECK ((("note" IS NULL) OR ("char_length"("note") <= 1000))),
    CONSTRAINT "training_sessions_status_check" CHECK (("status" = ANY (ARRAY['planned'::"text", 'completed'::"text", 'minimum'::"text", 'skipped'::"text"]))),
    CONSTRAINT "training_sessions_title_check" CHECK ((("char_length"("title") >= 1) AND ("char_length"("title") <= 140)))
);


ALTER TABLE "life"."training_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "life"."weekly_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "week_start" "date" NOT NULL,
    "capacity" "jsonb" DEFAULT '{"0": "normal", "1": "normal", "2": "normal", "3": "normal", "4": "normal", "5": "normal", "6": "normal"}'::"jsonb" NOT NULL,
    "reflection" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "weekly_plans_reflection_check" CHECK ((("reflection" IS NULL) OR ("char_length"("reflection") <= 1000)))
);


ALTER TABLE "life"."weekly_plans" OWNER TO "postgres";


ALTER TABLE ONLY "life"."commitment_events"
    ADD CONSTRAINT "commitment_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "life"."commitments"
    ADD CONSTRAINT "commitments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "life"."content_items"
    ADD CONSTRAINT "content_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "life"."daily_checkins"
    ADD CONSTRAINT "daily_checkins_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "life"."daily_checkins"
    ADD CONSTRAINT "daily_checkins_user_id_day_key" UNIQUE ("user_id", "day");



ALTER TABLE ONLY "life"."driving_sessions"
    ADD CONSTRAINT "driving_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "life"."experiments"
    ADD CONSTRAINT "experiments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "life"."income_entries"
    ADD CONSTRAINT "income_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "life"."job_events"
    ADD CONSTRAINT "job_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "life"."job_opportunities"
    ADD CONSTRAINT "job_opportunities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "life"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "life"."quran_entries"
    ADD CONSTRAINT "quran_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "life"."quran_entries"
    ADD CONSTRAINT "quran_entries_user_id_day_unit_key" UNIQUE ("user_id", "day", "unit");



ALTER TABLE ONLY "life"."salah_entries"
    ADD CONSTRAINT "salah_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "life"."salah_entries"
    ADD CONSTRAINT "salah_entries_user_id_day_prayer_key" UNIQUE ("user_id", "day", "prayer");



ALTER TABLE ONLY "life"."training_sessions"
    ADD CONSTRAINT "training_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "life"."weekly_plans"
    ADD CONSTRAINT "weekly_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "life"."weekly_plans"
    ADD CONSTRAINT "weekly_plans_user_id_week_start_key" UNIQUE ("user_id", "week_start");



CREATE INDEX "commitment_events_user_event_idx" ON "life"."commitment_events" USING "btree" ("user_id", "event_at");

CREATE INDEX "commitment_events_commitment_id_idx" ON "life"."commitment_events" USING "btree" ("commitment_id");

CREATE INDEX "commitments_weekly_plan_id_idx" ON "life"."commitments" USING "btree" ("weekly_plan_id");

CREATE INDEX "experiments_user_id_idx" ON "life"."experiments" USING "btree" ("user_id");

CREATE INDEX "job_events_opportunity_id_idx" ON "life"."job_events" USING "btree" ("opportunity_id");



CREATE INDEX "commitments_user_schedule_idx" ON "life"."commitments" USING "btree" ("user_id", "scheduled_for");



CREATE INDEX "content_items_user_stage_idx" ON "life"."content_items" USING "btree" ("user_id", "stage");



CREATE INDEX "daily_checkins_user_day_idx" ON "life"."daily_checkins" USING "btree" ("user_id", "day");



CREATE INDEX "driving_sessions_user_schedule_idx" ON "life"."driving_sessions" USING "btree" ("user_id", "scheduled_for");



CREATE INDEX "income_entries_user_date_idx" ON "life"."income_entries" USING "btree" ("user_id", "received_on");



CREATE INDEX "job_events_user_occurred_idx" ON "life"."job_events" USING "btree" ("user_id", "occurred_at");



CREATE INDEX "job_opportunities_user_stage_idx" ON "life"."job_opportunities" USING "btree" ("user_id", "stage");



CREATE INDEX "quran_entries_user_day_idx" ON "life"."quran_entries" USING "btree" ("user_id", "day");



CREATE INDEX "salah_entries_user_day_idx" ON "life"."salah_entries" USING "btree" ("user_id", "day");



CREATE INDEX "training_sessions_user_scheduled_idx" ON "life"."training_sessions" USING "btree" ("user_id", "scheduled_for");



CREATE OR REPLACE TRIGGER "commitments_set_updated_at" BEFORE UPDATE ON "life"."commitments" FOR EACH ROW EXECUTE FUNCTION "life"."set_updated_at"();



CREATE OR REPLACE TRIGGER "content_items_set_updated_at" BEFORE UPDATE ON "life"."content_items" FOR EACH ROW EXECUTE FUNCTION "life"."set_updated_at"();



CREATE OR REPLACE TRIGGER "daily_checkins_set_updated_at" BEFORE UPDATE ON "life"."daily_checkins" FOR EACH ROW EXECUTE FUNCTION "life"."set_updated_at"();



CREATE OR REPLACE TRIGGER "driving_sessions_set_updated_at" BEFORE UPDATE ON "life"."driving_sessions" FOR EACH ROW EXECUTE FUNCTION "life"."set_updated_at"();



CREATE OR REPLACE TRIGGER "experiments_set_updated_at" BEFORE UPDATE ON "life"."experiments" FOR EACH ROW EXECUTE FUNCTION "life"."set_updated_at"();



CREATE OR REPLACE TRIGGER "income_entries_set_updated_at" BEFORE UPDATE ON "life"."income_entries" FOR EACH ROW EXECUTE FUNCTION "life"."set_updated_at"();



CREATE OR REPLACE TRIGGER "job_opportunities_set_updated_at" BEFORE UPDATE ON "life"."job_opportunities" FOR EACH ROW EXECUTE FUNCTION "life"."set_updated_at"();



CREATE OR REPLACE TRIGGER "profiles_set_updated_at" BEFORE UPDATE ON "life"."profiles" FOR EACH ROW EXECUTE FUNCTION "life"."set_updated_at"();



CREATE OR REPLACE TRIGGER "quran_entries_set_updated_at" BEFORE UPDATE ON "life"."quran_entries" FOR EACH ROW EXECUTE FUNCTION "life"."set_updated_at"();



CREATE OR REPLACE TRIGGER "training_sessions_set_updated_at" BEFORE UPDATE ON "life"."training_sessions" FOR EACH ROW EXECUTE FUNCTION "life"."set_updated_at"();



CREATE OR REPLACE TRIGGER "weekly_plans_set_updated_at" BEFORE UPDATE ON "life"."weekly_plans" FOR EACH ROW EXECUTE FUNCTION "life"."set_updated_at"();



ALTER TABLE ONLY "life"."commitment_events"
    ADD CONSTRAINT "commitment_events_commitment_id_fkey" FOREIGN KEY ("commitment_id") REFERENCES "life"."commitments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "life"."commitment_events"
    ADD CONSTRAINT "commitment_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "life"."commitments"
    ADD CONSTRAINT "commitments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "life"."commitments"
    ADD CONSTRAINT "commitments_weekly_plan_id_fkey" FOREIGN KEY ("weekly_plan_id") REFERENCES "life"."weekly_plans"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "life"."content_items"
    ADD CONSTRAINT "content_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "life"."daily_checkins"
    ADD CONSTRAINT "daily_checkins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "life"."driving_sessions"
    ADD CONSTRAINT "driving_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "life"."experiments"
    ADD CONSTRAINT "experiments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "life"."income_entries"
    ADD CONSTRAINT "income_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "life"."job_events"
    ADD CONSTRAINT "job_events_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "life"."job_opportunities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "life"."job_events"
    ADD CONSTRAINT "job_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "life"."job_opportunities"
    ADD CONSTRAINT "job_opportunities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "life"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "life"."quran_entries"
    ADD CONSTRAINT "quran_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "life"."salah_entries"
    ADD CONSTRAINT "salah_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "life"."training_sessions"
    ADD CONSTRAINT "training_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "life"."weekly_plans"
    ADD CONSTRAINT "weekly_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE "life"."commitment_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "life"."commitments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "life"."content_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "life"."daily_checkins" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "life"."driving_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "life"."experiments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "life"."income_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "life"."job_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "life"."job_opportunities" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "life_delete_own" ON "life"."commitment_events" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_delete_own" ON "life"."commitments" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_delete_own" ON "life"."content_items" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_delete_own" ON "life"."daily_checkins" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_delete_own" ON "life"."driving_sessions" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_delete_own" ON "life"."experiments" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_delete_own" ON "life"."income_entries" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_delete_own" ON "life"."job_events" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_delete_own" ON "life"."job_opportunities" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_delete_own" ON "life"."profiles" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_delete_own" ON "life"."quran_entries" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_delete_own" ON "life"."salah_entries" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_delete_own" ON "life"."training_sessions" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_delete_own" ON "life"."weekly_plans" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_insert_own" ON "life"."commitment_events" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_insert_own" ON "life"."commitments" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_insert_own" ON "life"."content_items" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_insert_own" ON "life"."daily_checkins" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_insert_own" ON "life"."driving_sessions" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_insert_own" ON "life"."experiments" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_insert_own" ON "life"."income_entries" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_insert_own" ON "life"."job_events" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_insert_own" ON "life"."job_opportunities" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_insert_own" ON "life"."profiles" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_insert_own" ON "life"."quran_entries" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_insert_own" ON "life"."salah_entries" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_insert_own" ON "life"."training_sessions" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_insert_own" ON "life"."weekly_plans" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_select_own" ON "life"."commitment_events" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_select_own" ON "life"."commitments" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_select_own" ON "life"."content_items" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_select_own" ON "life"."daily_checkins" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_select_own" ON "life"."driving_sessions" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_select_own" ON "life"."experiments" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_select_own" ON "life"."income_entries" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_select_own" ON "life"."job_events" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_select_own" ON "life"."job_opportunities" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_select_own" ON "life"."profiles" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_select_own" ON "life"."quran_entries" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_select_own" ON "life"."salah_entries" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_select_own" ON "life"."training_sessions" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_select_own" ON "life"."weekly_plans" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_update_own" ON "life"."commitment_events" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_update_own" ON "life"."commitments" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_update_own" ON "life"."content_items" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_update_own" ON "life"."daily_checkins" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_update_own" ON "life"."driving_sessions" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_update_own" ON "life"."experiments" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_update_own" ON "life"."income_entries" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_update_own" ON "life"."job_events" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_update_own" ON "life"."job_opportunities" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_update_own" ON "life"."profiles" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_update_own" ON "life"."quran_entries" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_update_own" ON "life"."salah_entries" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_update_own" ON "life"."training_sessions" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "life_update_own" ON "life"."weekly_plans" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "life"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "life"."quran_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "life"."salah_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "life"."training_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "life"."weekly_plans" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "life" TO "authenticated";



REVOKE ALL ON FUNCTION "life"."set_updated_at"() FROM PUBLIC;



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "life"."commitment_events" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "life"."commitments" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "life"."content_items" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "life"."daily_checkins" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "life"."driving_sessions" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "life"."experiments" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "life"."income_entries" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "life"."job_events" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "life"."job_opportunities" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "life"."profiles" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "life"."quran_entries" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "life"."salah_entries" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "life"."training_sessions" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "life"."weekly_plans" TO "authenticated";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "life" GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO "authenticated";


