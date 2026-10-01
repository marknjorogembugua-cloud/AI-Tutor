-- ============================================================
-- AI Personal Tutor — subject metadata + content visibility
--
-- Lets the curriculum hold many subjects without hardcoding anything
-- in the app: descriptions, emoji and ordering now live in the DB,
-- and topics can be hidden without deleting their study history.
-- ============================================================

alter table subjects
  add column if not exists description text,
  add column if not exists emoji text,
  add column if not exists sort_order int not null default 100;

alter table topics
  add column if not exists is_published boolean not null default true;

-- Ordering + filtering index for the catalogue reads.
create index if not exists subjects_sort_order_idx on subjects (sort_order, name);
create index if not exists topics_subject_published_idx on topics (subject_id, is_published, name);

-- Curriculum stays world-readable; writes remain service-role only.
drop policy if exists "subjects read" on subjects;
create policy "subjects read" on subjects for select using (true);

drop policy if exists "topics read" on topics;
create policy "topics read" on topics for select using (true);

-- Backfill metadata for the two original subjects.
update subjects set
  description = 'Arithmetic, fractions, ratios, algebra and geometry',
  emoji = '🔢',
  sort_order = 10
where id = 'math';

update subjects set
  description = 'Grammar, vocabulary, reading comprehension and writing',
  emoji = '📚',
  sort_order = 20
where id = 'english';