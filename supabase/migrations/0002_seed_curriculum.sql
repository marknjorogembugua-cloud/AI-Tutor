insert into subjects (id, name) values
  ('math','Mathematics'),
  ('english','English')
on conflict (id) do nothing;

-- Math topics
insert into topics (subject_id, name, slug) values
  ('math','Arithmetic','arithmetic'),
  ('math','Fractions','fractions'),
  ('math','Decimals','decimals'),
  ('math','Percentages','percentages'),
  ('math','Ratios','ratios'),
  ('math','Algebra','algebra'),
  ('math','Geometry','geometry')
on conflict (subject_id, slug) do nothing;

-- English topics
insert into topics (subject_id, name, slug) values
  ('english','Grammar','grammar'),
  ('english','Vocabulary','vocabulary'),
  ('english','Reading Comprehension','reading'),
  ('english','Writing','writing')
on conflict (subject_id, slug) do nothing;

-- Skills per topic. Joined on (subject_id, slug), NOT slug alone: later subjects
-- reuse slugs such as 'writing' and 'grammar', so a slug-only join would
-- attach these skills to the wrong subject.
insert into skills (topic_id, name, order_index)
select t.id, s.name, s.idx
from topics t
join (values
  ('math', 'fractions', 'Identify equivalent fractions',1,
  ('math', 'fractions', 'Add fractions with like denominators',2,
  ('math', 'fractions', 'Add fractions with unlike denominators',3,
  ('math', 'fractions', 'Subtract fractions',4,
  ('math', 'fractions', 'Multiply fractions',5,
  ('math', 'fractions', 'Divide fractions',6,
  ('math', 'decimals', 'Place value',1,
  ('math', 'decimals', 'Add & subtract decimals',2,
  ('math', 'decimals', 'Multiply decimals',3,
  ('math', 'decimals', 'Convert decimal↔fraction',4,
  ('math', 'algebra', 'Evaluate expressions',1,
  ('math', 'algebra', 'Solve one-step equations',2,
  ('math', 'algebra', 'Solve two-step equations',3,
  ('math', 'algebra', 'Simplify like terms',4,
  ('math', 'percentages', 'Percent of a number',1,
  ('math', 'percentages', 'Percent increase/decrease',2,
  ('math', 'ratios', 'Simplify ratios',1,
  ('math', 'ratios', 'Unit rates',2,
  ('math', 'ratios', 'Proportions',3,
  ('math', 'geometry', 'Perimeter',1,
  ('math', 'geometry', 'Area of rectangles',2,
  ('math', 'geometry', 'Area of triangles',3,
  ('math', 'geometry', 'Angles',4,
  ('english', 'grammar', 'Parts of speech',1,
  ('english', 'grammar', 'Subject-verb agreement',2,
  ('english', 'grammar', 'Tenses',3,
  ('english', 'vocabulary', 'Context clues',1,
  ('english', 'vocabulary', 'Synonyms & antonyms',2,
  ('english', 'reading', 'Main idea',1,
  ('english', 'reading', 'Inference',2,
  ('english', 'writing', 'Sentence structure',1,
  ('english', 'writing', 'Paragraph structure',2
) as s(subject_id, slug, name, idx)
  on s.subject_id = t.subject_id and s.slug = t.slug
  and not exists (
    select 1 from skills k
    where k.topic_id = t.id and k.name = s.name
  );