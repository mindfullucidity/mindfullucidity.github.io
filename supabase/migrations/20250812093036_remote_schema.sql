

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


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."check_ai_usage"("p_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  -- The daily limit for requests. You can adjust this value.
  rate_limit int := 5;
  -- A variable to hold the user's current usage row.
  user_usage record;
begin
  -- First, check if a usage row exists for the user. If not, create one.
  -- The `on conflict` clause handles the case where the user already has a row.
  insert into public.user_ai_usage (user_id)
  values (p_user_id)
  on conflict (user_id)
  do update set user_id = p_user_id -- This is a no-op but ensures the row is selected.
  returning * into user_usage;

  -- Check if the last reset was not today.
  -- This handles the case where a user makes their first request on a new day.
  if user_usage.last_reset_date < current_date then
    -- If it's a new day, reset the count to 0 and set the reset date to today.
    update public.user_ai_usage
    set
      daily_requests = 0,
      last_reset_date = current_date
    where user_id = p_user_id;

    -- Fetch the updated row to use in the next check.
    select * into user_usage from public.user_ai_usage where user_id = p_user_id;
  end if;

  -- Now, check if the current number of requests has exceeded the rate limit.
  if user_usage.daily_requests >= rate_limit then
    -- If the limit is reached, raise an exception.
    -- This will cause the RPC call to fail, which the front end can catch.
    raise exception 'Rate limit exceeded. You have used your % daily requests.', rate_limit;
  else
    -- If the limit is not exceeded, increment the count by 1.
    update public.user_ai_usage
    set daily_requests = user_usage.daily_requests + 1
    where user_id = p_user_id;
  end if;
end;
$$;


ALTER FUNCTION "public"."check_ai_usage"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_dream_streak_info"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    dream_streak_value integer;
    last_entry_date_value date;
    days_since_last_entry_value integer;
    has_logged_today_value boolean;
BEGIN
    -- Get the last journal entry date for the current user
    SELECT MAX(date)
    INTO last_entry_date_value
    FROM public.journals
    WHERE user_id = auth.uid();

    -- Calculate days since last entry
    IF last_entry_date_value IS NOT NULL THEN
        days_since_last_entry_value := CURRENT_DATE - last_entry_date_value;
    ELSE
        days_since_last_entry_value := NULL; -- No entries yet
    END IF;

    -- Check if user has logged today
    has_logged_today_value := (last_entry_date_value = CURRENT_DATE);

    -- Calculate the streak length
    WITH DistinctUserJournals AS (
        SELECT DISTINCT
            date
        FROM
            public.journals
        WHERE
            user_id = auth.uid()
        ORDER BY date
    ),
    NumberedJournals AS (
        SELECT
            date,
            ROW_NUMBER() OVER (ORDER BY date) as rn
        FROM
            DistinctUserJournals
    ),
    StreakGroups AS (
        SELECT
            date,
            (date - (rn || ' days')::interval)::date as streak_group_id
        FROM
            NumberedJournals
    ),
    CalculatedStreaks AS (
        SELECT
            streak_group_id,
            COUNT(date) as streak_length,
            MAX(date) as last_streak_date
        FROM
            StreakGroups
        GROUP BY
            streak_group_id
    )
    SELECT
        COALESCE(
            CASE
                WHEN (CURRENT_DATE - cs.last_streak_date) <= 2 THEN cs.streak_length
                ELSE 0
            END,
            0
        )
    INTO dream_streak_value
    FROM
        CalculatedStreaks cs
    ORDER BY
        cs.last_streak_date DESC
    LIMIT 1;

    RETURN jsonb_build_object(
        'streak_length', COALESCE(dream_streak_value, 0),
        'last_entry_date', last_entry_date_value,
        'days_since_last_entry', days_since_last_entry_value,
        'has_logged_today', has_logged_today_value
    );
END;
$$;


ALTER FUNCTION "public"."get_dream_streak_info"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reset_ai_usage_counts"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
begin
  update public.user_ai_usage
  set
    daily_requests = 0,
    last_reset_date = current_date
  where daily_requests > 0;
end;
$$;


ALTER FUNCTION "public"."reset_ai_usage_counts"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."journal_analyses" (
    "journal_analysis_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "journal_id" bigint NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."journal_analyses" OWNER TO "postgres";


ALTER TABLE "public"."journal_analyses" ALTER COLUMN "journal_analysis_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."journal_analyses_journal_analysis_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."journals" (
    "journal_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "date" "date" NOT NULL,
    "title" "text",
    "content" "text" NOT NULL,
    "description" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "lucidity_level" integer,
    "lucidity_trigger" "text",
    "mood" integer,
    "characteristics" "text"[]
);


ALTER TABLE "public"."journals" OWNER TO "postgres";


ALTER TABLE "public"."journals" ALTER COLUMN "journal_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."journals_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_ai_usage" (
    "user_id" "uuid" NOT NULL,
    "daily_requests" integer DEFAULT 0 NOT NULL,
    "last_reset_date" "date" DEFAULT CURRENT_DATE NOT NULL
);


ALTER TABLE "public"."user_ai_usage" OWNER TO "postgres";


ALTER TABLE ONLY "public"."journal_analyses"
    ADD CONSTRAINT "journal_analyses_pkey" PRIMARY KEY ("journal_analysis_id");



ALTER TABLE ONLY "public"."journals"
    ADD CONSTRAINT "journals_pkey" PRIMARY KEY ("journal_id");



ALTER TABLE ONLY "public"."user_ai_usage"
    ADD CONSTRAINT "user_ai_usage_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."journal_analyses"
    ADD CONSTRAINT "journal_analyses_journal_id_fkey" FOREIGN KEY ("journal_id") REFERENCES "public"."journals"("journal_id");



ALTER TABLE ONLY "public"."journal_analyses"
    ADD CONSTRAINT "journal_analyses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."journals"
    ADD CONSTRAINT "journals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_ai_usage"
    ADD CONSTRAINT "user_ai_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



CREATE POLICY "Enable delete for users based on user_id" ON "public"."journal_analyses" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."journals" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."journal_analyses" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."journals" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable update for authenticated users only" ON "public"."journal_analyses" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK (true);



CREATE POLICY "Enable update for authenticated users only" ON "public"."journals" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK (true);



CREATE POLICY "Enable users to view their own data only" ON "public"."journal_analyses" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."journals" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view and update their own AI usage." ON "public"."user_ai_usage" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."journal_analyses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."journals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_ai_usage" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";














































































































































































GRANT ALL ON FUNCTION "public"."check_ai_usage"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_ai_usage"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_ai_usage"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_dream_streak_info"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_dream_streak_info"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dream_streak_info"() TO "service_role";



GRANT ALL ON FUNCTION "public"."reset_ai_usage_counts"() TO "anon";
GRANT ALL ON FUNCTION "public"."reset_ai_usage_counts"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."reset_ai_usage_counts"() TO "service_role";
























GRANT ALL ON TABLE "public"."journal_analyses" TO "anon";
GRANT ALL ON TABLE "public"."journal_analyses" TO "authenticated";
GRANT ALL ON TABLE "public"."journal_analyses" TO "service_role";



GRANT ALL ON SEQUENCE "public"."journal_analyses_journal_analysis_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."journal_analyses_journal_analysis_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."journal_analyses_journal_analysis_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."journals" TO "anon";
GRANT ALL ON TABLE "public"."journals" TO "authenticated";
GRANT ALL ON TABLE "public"."journals" TO "service_role";



GRANT ALL ON SEQUENCE "public"."journals_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."journals_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."journals_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_ai_usage" TO "anon";
GRANT ALL ON TABLE "public"."user_ai_usage" TO "authenticated";
GRANT ALL ON TABLE "public"."user_ai_usage" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
