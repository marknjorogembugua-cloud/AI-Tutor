/**
 * Subjects added after the 0005 baseline in scripts/generate-curriculum.mjs.
 *
 * Split into its own module so the baseline file stays readable and the
 * expansion can be reviewed on its own. Same shape as the baseline entries:
 * { id, name, emoji, order, description, topics: [{ slug, name, skills }] }.
 *
 * `order` is the catalogue sort order for the app's subject pickers. Numbers are
 * grouped in tens so new subjects slot into a band without renumbering: 100s
 * science, 200s humanities, 300s business, 400s creative and practical, 500s
 * languages, 600s skills and support.
 *
 * Slugs only have to be unique within a subject — the generator joins skills on
 * (subject_id, slug), so reusing 'grammar' or 'basics' across subjects is safe.
 */

export const EXPANSION = [
    // ---------------------------------------------------------------- 100s: science
    {
        id: 'astronomy', name: 'Astronomy', emoji: '🔭', order: 101,
        description: 'Stars, planets, galaxies and how we observe the universe',
        topics: [
            { slug: 'solar-system', name: 'The Solar System', skills: ['Structure of the solar system', 'Planets and dwarf planets', 'Moons and satellites', 'Asteroids, comets and meteors', 'Planetary orbits', 'Small bodies'] },
            { slug: 'stars', name: 'Stars', skills: ['Stellar life cycles', 'Nuclear fusion in stars', 'Classification by spectral type', 'Measuring stellar distance', 'Stellar brightness and luminosity', 'Binary stars', 'Neutron stars and black holes', 'Supernovae'] },
            { slug: 'galaxies-and-universe', name: 'Galaxies and the Universe', skills: ['Types of galaxy', 'The Milky Way', 'Galaxy formation', 'The expanding universe', 'Big Bang evidence', 'Cosmic microwave background', 'Dark matter and dark energy', 'The cosmic distance ladder'] },
            { slug: 'observation', name: 'Observation and Space', skills: ['Telescopes and what they collect', 'Reflecting versus refracting', 'Light curves', 'Spectroscopy', 'Meteor showers and eclipses', 'Spacecraft and probes', 'Satellites and orbits', 'Astronomical time and calendars'] },
        ],
    },
    {
        id: 'geology', name: 'Geology', emoji: '🪨', order: 102,
        description: 'Rocks, minerals, plate tectonics and the Earth’s deep history',
        topics: [
            { slug: 'minerals', name: 'Minerals', skills: ['What a mineral is', 'Crystal structure', 'Hardness and luster', 'Cleavage and fracture', 'Common rock-forming minerals', 'Identifying minerals in the field', 'Mineral properties'] },
            { slug: 'rocks', name: 'Rocks', skills: ['The rock cycle', 'Igneous rocks', 'Sedimentary rocks', 'Metamorphic rocks', 'Rock identification', 'Fossils in rock', 'Resources from rocks'] },
            { slug: 'plate-tectonics', name: 'Plate Tectonics', skills: ['Earth’s internal structure', 'Evidence for continental drift', 'Types of plate boundary', 'Subduction zones', 'Sea floor spreading', 'Hotspots and volcanism', 'Earthquakes and the Richter scale', 'Mountain building'] },
            { slug: 'earth-history', name: 'Earth History', skills: ['Geological time scale', 'Dating rocks', 'Absolute versus relative dating', 'Mass extinctions', 'Climate change in the rock record', 'Stratigraphy', 'Interpreting rock sequences'] },
        ],
    },
    {
        id: 'meteorology', name: 'Meteorology', emoji: '⛅', order: 103,
        description: 'Weather, the atmosphere and forecasting',
        topics: [
            { slug: 'atmosphere', name: 'The Atmosphere', skills: ['Layers of the atmosphere', 'Composition of air', 'Pressure and altitude', 'Temperature structure', 'Water vapour in the air', 'Humidity and dew point', 'Air density'] },
            { slug: 'weather-systems', name: 'Weather Systems', skills: ['Air masses', 'Fronts', 'Highs and lows', 'Pressure systems', 'Jet streams', 'Cyclones and anticyclones', 'Local winds', 'Weather versus climate'] },
            { slug: 'clouds-and-precipitation', name: 'Clouds and Precipitation', skills: ['Cloud formation', 'Cloud types', 'Lifting mechanisms', 'Rain, snow and hail', 'Measuring rainfall', 'Fog and dew', 'Thunderstorms'] },
            { slug: 'forecasting', name: 'Forecasting', skills: ['Reading a synoptic chart', 'Forecast symbols', 'Predicting from trends', 'Forecast models', 'Forecast uncertainty', 'Severe weather warnings', 'Microclimates'] },
        ],
    },
    {
        id: 'sports-science', name: 'Sports Science', emoji: '⚽', order: 104,
        description: 'Physics and biology of movement, performance and recovery',
        topics: [
            { slug: 'sports-physics', name: 'Sports Physics', skills: ['Projectile motion in sport', 'Forces in sport', 'Friction and grip', 'Momentum and impulse in collisions', 'Energy transfer', 'Centre of mass and balance', 'Pressure and buoyancy in water', 'Biomechanics levers'] },
            { slug: 'exercise-physiology', name: 'Exercise Physiology', skills: ['Heart rate and cardiac output', 'Aerobic and anaerobic systems', 'VO2 max', 'Energy pathways', 'Muscle contraction', 'Respiratory response to exercise', 'Blood pressure during exercise', 'Endurance and fatigue'] },
            { slug: 'sports-psychology', name: 'Sports Psychology', skills: ['Motivation in sport', 'Arousal and performance', 'Confidence and self-efficacy', 'Goal setting', 'Handling pressure', 'Team roles', 'Mental skills training'] },
            { slug: 'nutrition-and-recovery', name: 'Nutrition and Recovery', skills: ['Fueling exercise', 'Hydration strategy', 'Carbohydrate and protein in training', 'Warm-up and cool-down', 'Sleep and recovery', 'Injury prevention', 'Load management'] },
        ],
    },
    {
        id: 'forensic-science', name: 'Forensic Science', emoji: '🔍', order: 105,
        description: 'Evidence collection, analysis and scientific method in law',
        topics: [
            { slug: 'crime-scene', name: 'The Crime Scene', skills: ['Scene preservation', 'Chain of custody', 'Photographing a scene', 'Search patterns', 'Trace evidence and transfer', 'Biological samples', 'Documenting findings'] },
            { slug: 'analysis-techniques', name: 'Analysis Techniques', skills: ['Fingerprint comparison', 'DNA profiling basics', 'Chemical analysis', 'Microscopy of fibres', 'Ballistics basics', 'Document examination', 'Digital forensics', 'Interpreting uncertainty in results'] },
            { slug: 'evidence-and-ethics', name: 'Evidence and Ethics', skills: ['Types of evidence', 'Proving a link', 'Contamination and false results', 'Expert witness testimony', 'Bias in forensic science', 'Ethical standards', 'Limits of scientific evidence'] },
        ],
    },

    // ------------------------------------------------------------- 200s: humanities
    {
        id: 'psychology', name: 'Psychology', emoji: '🧠', order: 201,
        description: 'Mind, behaviour, development and mental health',
        topics: [
            { slug: 'foundations', name: 'Foundations of Psychology', skills: ['What psychology studies', 'The scientific method in psychology', 'Nature versus nurture', 'Ethics in psychological research', 'Classical behaviourism', 'Cognitive approaches', 'The role of the brain', 'Ways of knowing'] },
            { slug: 'development', name: 'Development', skills: ['Stages of development', 'Piaget’s cognitive development', 'Attachment', 'Kohlberg and moral development', 'Adolescence', 'Adulthood and ageing', 'Language development', 'Nature versus nurture in development'] },
            { slug: 'cognition', name: 'Cognition', skills: ['Attention', 'Perception', 'Memory encoding and retrieval', 'Forgetting', 'Problem solving', 'Language and thought', 'Reasoning', 'Decision making'] },
            { slug: 'emotions-and-behaviour', name: 'Emotions and Behaviour', skills: ['What emotions are', 'Motivation', 'Personality approaches', 'Stress and the body', 'Social influence', 'Prosocial behaviour', 'Aggression', 'Conformity'] },
            { slug: 'health-psychology', name: 'Health and Clinical Psychology', skills: ['Stress and coping', 'Mental health conditions', 'Approaches to therapy', 'Social media and wellbeing', 'Sleep and mental health', 'Addiction and reward', 'Eating behaviour', 'Seeking help and stigma'] },
        ],
    },
    {
        id: 'sociology', name: 'Sociology', emoji: '🏘️', order: 202,
        description: 'Society, inequality, institutions and social change',
        topics: [
            { slug: 'foundations', name: 'Foundations of Sociology', skills: ['What sociology studies', 'Sociological perspectives', 'Social structures', 'Culture', 'Socialisation', 'Social norms', 'Research methods', 'Positivist versus interpretivist approaches'] },
            { slug: 'inequality', name: 'Inequality', skills: ['Social class', 'Stratification', 'Gender inequality', 'Race and ethnicity', 'Disability and society', 'Ageism', 'Measuring inequality', 'Social mobility'] },
            { slug: 'institutions', name: 'Social Institutions', skills: ['Family and kinship', 'Education as an institution', 'Religion and society', 'The economy and work', 'Healthcare systems', 'Mass media', 'Crime and justice as institutions', 'Community and neighbourhood'] },
            { slug: 'change', name: 'Social Change', skills: ['Agents of change', 'Social movements', 'Globalisation', 'Technology and society', 'Urbanisation', 'Population change', 'Environmental movements', 'Studying change over time'] },
        ],
    },
    {
        id: 'psychology-of-learning', name: 'Learning Science', emoji: '🧩', order: 203,
        description: 'How memory, motivation and study methods actually work',
        topics: [
            { slug: 'memory', name: 'Memory Systems', skills: ['Sensory, short-term and long-term memory', 'Encoding', 'Storage and retrieval', 'The forgetting curve', 'Spacing effect', 'Chunking', 'Interference', 'Memory and digital devices'] },
            { slug: 'study-methods', name: 'Evidence-Based Study Methods', skills: ['Active recall', 'Retrieval practice', 'Spaced repetition', 'Interleaving', 'Elaboration', 'Dual coding', 'Note-taking methods', 'Why rereading does not work'] },
            { slug: 'motivation-and-metacognition', name: 'Motivation and Metacognition', skills: ['Intrinsic versus extrinsic motivation', 'Goal setting', 'Self-efficacy', 'Metacognition', 'Self-monitoring', 'Procrastination', 'Attention and focus', 'Asking for help'] },
        ],
    },
    {
        id: 'religion-studies', name: 'Religious and Ethical Studies', emoji: '🕊️', order: 204,
        description: 'World religions, ethics and comparative belief',
        topics: [
            { slug: 'world-religions', name: 'World Religions', skills: ['Major world religions overview', 'Abrahamic traditions', 'Hinduism and Buddhism', 'Eastern traditions', 'Indigenous and African belief systems', 'Beliefs about the divine', 'Practices and festivals', 'Sacred texts'] },
            { slug: 'ethics', name: 'Ethics', skills: ['Moral theories', 'Absolute and relative duties', 'Consequential reasoning', 'Rights and duties', 'Virtue ethics', 'Euthanasia and end of life', 'Animal ethics', 'Environmental ethics'] },
            { slug: 'comparison', name: 'Belief and Comparison', skills: ['Religious experience', 'Arguments for and against belief', 'Faith and reason', 'Religious language', 'Pluralism', 'Interfaith dialogue', 'Secularisation', 'Studying religion without judgement'] },
        ],
    },
    {
        id: 'law', name: 'Law', emoji: '⚖️', order: 205,
        description: 'Legal systems, rights, contracts and how courts work',
        topics: [
            { slug: 'legal-systems', name: 'Legal Systems', skills: ['What law is', 'Sources of law', 'Legal systems of the world', 'Common law and statute law', 'Civil law systems', 'Codification', 'Jurisdiction', 'International law'] },
            { slug: 'rights', name: 'Rights and Freedoms', skills: ['Human rights', 'Constitutional rights', 'Freedom of speech', 'Rights and responsibilities', 'Equality law', 'Discrimination in law', 'Data protection rights', 'Children’s rights'] },
            { slug: 'courts', name: 'Courts and Justice', skills: ['Court hierarchy', 'Criminal versus civil cases', 'Juries and judges', 'Court procedure', 'Evidence', 'Sentencing', 'Appeals', 'Restorative justice'] },
            { slug: 'contracts-and-crime', name: 'Contracts and Crime', skills: ['Elements of a contract', 'Breach of contract', 'Types of crime', 'Criminal liability', 'Defences', 'Prosecution', 'Fraud', 'Consumer law'] },
        ],
    },
    {
        id: 'literature', name: 'World Literature', emoji: '📖', order: 206,
        description: 'Novels, poetry, drama and how to read literature closely',
        topics: [
            { slug: 'fiction', name: 'Fiction', skills: ['Narrative structure', 'Unreliable narrators', 'Characterisation', 'Setting and atmosphere', 'Dialogue and interiority', 'Prose style', 'Reading a first person narrator', 'Form and structure'] },
            { slug: 'poetry', name: 'Poetry', skills: ['Verse and stanza', 'Meter and rhythm', 'Rhyme schemes', 'Imagery and figurative language', 'Free verse', 'Reading poetry aloud', 'Form and tone', 'Poetic devices'] },
            { slug: 'drama', name: 'Drama', skills: ['Tragedy and comedy', 'Dramatic irony', 'Soliloquy and aside', 'Stage directions', 'Dramatic tension', 'Reading a script', 'Adaptation into film', 'Performance interpretation'] },
            { slug: 'nonfiction', name: 'Non-fiction', skills: ['Essays', 'Memoir', 'Biography', 'Travel writing', 'Reading critically', 'Ethos and pathos', 'Evidence and argument', 'Writing about literature'] },
        ],
    },

    // ------------------------------------------------------------- 300s: business
    {
        id: 'business-studies', name: 'Business Studies', emoji: '💼', order: 301,
        description: 'How businesses are formed, run, financed and managed',
        topics: [
            { slug: 'enterprise', name: 'Enterprise', skills: ['What is a business', 'Business objectives', 'Business plans', 'Stakeholders', 'Sectors of the economy', 'Sole traders and partnerships', 'Limited companies', 'Co-operatives'] },
            { slug: 'marketing', name: 'Marketing', skills: ['Market research', 'Segmentation and targeting', 'The marketing mix', 'Branding', 'Product life cycle', 'Pricing strategies', 'Promotion and advertising', 'Digital marketing', 'Customer service'] },
            { slug: 'operations', name: 'Operations Management', skills: ['Production processes', 'Supply chains', 'Inventory management', 'Quality control', 'Lean and waste reduction', 'Location of operations', 'Technology in operations', 'Sustainability in operations'] },
            { slug: 'people', name: 'People and HR', skills: ['Organisational structure', 'Recruitment and selection', 'Training and development', 'Motivation at work', 'Teamwork', 'Performance management', 'Industrial relations', 'Workplace health and safety'] },
            { slug: 'finance', name: 'Business Finance', skills: ['Sources of finance', 'Costs and break-even', 'Budgeting', 'Cash flow', 'Financial statements analysis', 'Profit and loss', 'Investment appraisal', 'Risk and insurance'] },
            { slug: 'ethics', name: 'Business Ethics', skills: ['Corporate social responsibility', 'Ethical decision making', 'Environmental impact', 'Fair work', 'Consumer protection', 'Corporate governance', 'Ethics in advertising', 'Global supply chain ethics'] },
        ],
    },
    {
        id: 'human-resources', name: 'Work and Careers', emoji: '🧑‍💼', order: 302,
        description: 'CVs, interviews, workplace skills and career planning',
        topics: [
            { slug: 'job-search', name: 'Job Search', skills: ['Understanding job adverts', 'CV writing', 'Cover letters', 'Application forms', 'Online job searches', 'Networking', 'References', 'Follow-up'] },
            { slug: 'interviewing', name: 'Interviewing', skills: ['Interview research', 'Common interview questions', 'Competency questions', 'Answering questions under pressure', 'Non-verbal communication', 'Questions to ask', 'Virtual interviews', 'Salary negotiation'] },
            { slug: 'workplace-skills', name: 'Workplace Skills', skills: ['Professional email', 'Meetings', 'Time management', 'Working in a team', 'Conflict resolution', 'Presentation skills', 'Feedback and critique', 'Remote work'] },
            { slug: 'career-planning', name: 'Career Planning', skills: ['Self-assessment', 'Setting career goals', 'Transferable skills', 'Qualifications and pathways', 'Work experience', 'Changing direction', 'Professional networks', 'Lifelong learning'] },
        ],
    },
    {
        id: 'entrepreneurship', name: 'Entrepreneurship', emoji: '🚀', order: 303,
        description: 'Starting a business, testing ideas and finding funding',
        topics: [
            { slug: 'idea', name: 'Finding an Idea', skills: ['Identifying problems worth solving', 'Idea generation techniques', 'Market opportunity', 'Customer discovery', 'Feasibility studies', 'Business models', 'Value proposition', 'Competitive advantage'] },
            { slug: 'validation', name: 'Testing the Idea', skills: ['Minimum viable product', 'Prototyping', 'Customer testing', 'Feedback loops', 'Iterating a design', 'Failing fast', 'Assessing results', 'Deciding to pivot'] },
            { slug: 'funding', name: 'Funding', skills: ['Bootstrapping', 'Friends and family', 'Bank loans', 'Grants', 'Angel investment', 'Venture capital', 'Crowdfunding', 'Pitching to investors'] },
            { slug: 'growth', name: 'Growth and Scale', skills: ['Business modelling', 'Unit economics', 'Scaling operations', 'Hiring and team building', 'Managing finances', 'Growth metrics', 'Marketing a new venture', 'Exit strategies'] },
        ],
    },
    {
        id: 'statistics', name: 'Statistics and Data Analysis', emoji: '📊', order: 304,
        description: 'Collecting, summarising and interpreting data honestly',
        topics: [
            { slug: 'describing-data', name: 'Describing Data', skills: ['Frequency tables', 'Histograms', 'Stem-and-leaf diagrams', 'Measures of centre', 'Measures of spread', 'Outliers', 'Box plots', 'Summarising two variables'] },
            { slug: 'probability', name: 'Probability', skills: ['Basic probability', 'Sample space', 'Independent events', 'Conditional probability', 'Tree diagrams', 'Venn diagrams', 'Expected value', 'Common mistakes'] },
            { slug: 'distributions', name: 'Distributions', skills: ['Normal distribution', 'Standardisation', 'Binomial distribution', 'Skewness', 'Correlation', 'Sampling distributions', 'Interpreting a distribution', 'Choosing the right summary'] },
            { slug: 'inference', name: 'Statistical Inference', skills: ['Population and sample', 'Sampling methods', 'Sampling bias', 'Confidence intervals', 'Hypothesis testing', 'Significance', 'p-values', 'Correlation versus causation'] },
            { slug: 'spreadsheets', name: 'Spreadsheets and Tools', skills: ['Sorting and filtering data', 'Formulas in data', 'Charts from data', 'Pivot tables', 'Data cleaning', 'Spreadsheet functions', 'Data validation', 'Checking calculations'] },
        ],
    },

    // ------------------------------------------------- 400s: creative and practical
    {
        id: 'film-and-tv', name: 'Film and Television', emoji: '🎬', order: 401,
        description: 'Filmmaking, screenwriting and analysing what is on screen',
        topics: [
            { slug: 'storytelling', name: 'Screenwriting', skills: ['Three-act structure', 'Character arcs', 'Writing dialogue', 'Exposition in film', 'Loglines and treatments', 'Writing a scene', 'Subtext', 'Formatting a screenplay'] },
            { slug: 'production', name: 'Production', skills: ['Development and pre-production', 'Casting', 'Location and studio work', 'Cinematography', 'Lighting on set', 'Sound recording', 'Directing actors', 'Budgets and scheduling'] },
            { slug: 'post', name: 'Post-production', skills: ['Editing and assembly', 'Continuity editing', 'Colour grading', 'Sound design and mix', 'Visual effects basics', 'Titles and graphics', 'Delivering and mastering', 'Subtitling and accessibility'] },
            { slug: 'analysis', name: 'Screen Analysis', skills: ['Visual language', 'Camera angles and movement', 'Mise-en-scène', 'Montage', 'Sound and silence', 'Performance', 'Genres and conventions', 'Writing a film essay'] },
        ],
    },
    {
        id: 'photography', name: 'Photography', emoji: '📷', order: 402,
        description: 'Taking, editing and understanding photographs',
        topics: [
            { slug: 'camera', name: 'The Camera', skills: ['How a camera works', 'Lenses', 'Aperture', 'Shutter speed', 'ISO sensitivity', 'Exposure triangle', 'Focus and depth of field', 'Camera settings in practice'] },
            { slug: 'composition', name: 'Composition', skills: ['Rule of thirds', 'Leading lines', 'Balance', 'Negative space', 'Framing', 'Symmetry and pattern', 'Perspective', 'Working with natural light'] },
            { slug: 'genres', name: 'Genres', skills: ['Portraiture', 'Landscape photography', 'Documentary', 'Street photography', 'Still life', 'Aerial photography', 'Macro photography', 'Astrophotography'] },
            { slug: 'editing', name: 'Editing and Practice', skills: ['Editing workflow', 'Adjusting exposure', 'Contrast and colour', 'Cropping', 'Retouching ethics', 'Photo editing software', 'Presenting a portfolio', 'Copyright and attribution'] },
        ],
    },
    {
        id: 'drama', name: 'Drama and Performance', emoji: '🎭', order: 403,
        description: 'Acting, stagecraft and performance skills',
        topics: [
            { slug: 'acting', name: 'Acting', skills: ['Stage presence', 'Voice and projection', 'Body and gesture', 'Improvisation', 'Listening and response', 'Building a character', 'Rehearsal techniques', 'Working with a director'] },
            { slug: 'stagecraft', name: 'Stagecraft', skills: ['Stage terminology', 'Blocking', 'Props', 'Set and scenery', 'Lighting and sound', 'Costume and character', 'Stage combat basics', 'Technical rehearsals'] },
            { slug: 'production', name: 'Producing a Show', skills: ['Choosing a script', 'Casting', 'Rehearsal schedule', 'Set design', 'Running a production', 'Auditions', 'Opening night', 'Reviewing a performance'] },
        ],
    },
    {
        id: 'creative-writing', name: 'Creative Writing', emoji: '🖋️', order: 404,
        description: 'Fiction, poetry and the craft of making things up',
        topics: [
            { slug: 'craft', name: 'Craft Basics', skills: ['Show don’t tell', 'Voice and tone', 'Scene and summary', 'Detail and specificity', 'Sensory writing', 'Editing your own work', 'Reading widely', 'Writing habit'] },
            { slug: 'fiction', name: 'Fiction', skills: ['Story premise', 'Character development', 'Plot structure', 'Opening a story', 'Dialogue', 'Conflict and stakes', 'Point of view', 'Short story structure'] },
            { slug: 'poetry', name: 'Poetry', skills: ['Form and free verse', 'Sound and rhythm', 'Line breaks', 'Imagery', 'Working with constraints', 'Revising a poem', 'Poetry performance', 'Reading widely'] },
            { slug: 'process', name: 'The Writing Process', skills: ['Brainstorming', 'Outlining', 'Drafting', 'Workshopping', 'Revising', 'Copyediting', 'Submitting work', 'Dealing with rejection'] },
        ],
    },
    {
        id: 'design', name: 'Design and Technology', emoji: '🧰', order: 405,
        description: 'Designing and making products, from sketch to prototype',
        topics: [
            { slug: 'design-process', name: 'Design Process', skills: ['Identifying a need', 'User research', 'Brainstorming and sketching', 'Developing a concept', 'Iterating a design', 'Presenting a design', 'Working to a brief', 'Sustainable design'] },
            { slug: 'materials', name: 'Materials and Manufacturing', skills: ['Material properties', 'Choosing materials', 'Timbers', 'Metals and alloys', 'Polymers and plastics', 'Glass and ceramics', 'Composites', 'Recycling and disposal'] },
            { slug: 'making', name: 'Making and Tools', skills: ['Measuring and marking', 'Hand tools', 'Machine tools', 'Cutting and shaping', 'Joining techniques', 'Finishing and sanding', 'Safety in the workshop', 'Machine safety'] },
            { slug: 'electronics', name: 'Electronics and Control', skills: ['Simple circuits', 'Series and parallel', 'Sensors', 'Actuators', 'Microcontrollers', 'Soldering', 'Reading circuit diagrams', 'Testing and debugging'] },
        ],
    },
    {
        id: 'cooking', name: 'Cooking and Nutrition', emoji: '🍳', order: 406,
        description: 'Cooking technique, food safety and eating well',
        topics: [
            { slug: 'techniques', name: 'Cooking Techniques', skills: ['Knife skills and safety', 'Heat and temperature', 'Searing and browning', 'Boiling and simmering', 'Steaming and poaching', 'Roasting and baking', 'Emulsification', 'Seasoning'] },
            { slug: 'ingredients', name: 'Ingredients', skills: ['Types of food', 'Reading labels', 'Storing food safely', 'Fresh versus processed', 'Herbs and spices', 'Staple ingredients', 'Substitutions', 'Allergens'] },
            { slug: 'nutrition', name: 'Nutrition', skills: ['Macronutrients', 'Micronutrients', 'Energy needs', 'Balanced plate', 'Portion control', 'Reading nutrition claims', 'Dietary requirements', 'Eating disorders awareness'] },
            { slug: 'meal-planning', name: 'Meal Planning', skills: ['Planning a week of meals', 'Shopping lists', 'Batch cooking', 'Reducing food waste', 'Cooking on a budget', 'Feeding a family', 'Quick meals', 'Leftovers safely'] },
        ],
    },
    {
        id: 'financial-literacy', name: 'Financial Literacy', emoji: '💰', order: 407,
        description: 'Money, saving, credit and everyday financial decisions',
        topics: [
            { slug: 'money-basics', name: 'Money Basics', skills: ['Needs and wants', 'Income and expenses', 'Tracking spending', 'Payday budgeting', 'Cash versus digital payments', 'Understanding payslips', 'Tax basics', 'Planning ahead'] },
            { slug: 'saving', name: 'Saving and Investing', skills: ['Why save', 'Compound interest', 'Savings accounts', 'Emergency funds', 'Risk and return', 'Shares and funds explained', 'Retirement accounts', 'Investing as a beginner'] },
            { slug: 'credit', name: 'Credit and Borrowing', skills: ['What credit is', 'Interest rates', 'APR and cost of borrowing', 'Credit scores', 'Overdrafts and loans', 'Payday loans', 'Responsible borrowing', 'Debt management'] },
            { slug: 'planning', name: 'Planning and Protection', skills: ['Setting financial goals', 'Planning for a car', 'Planning for university', 'Insurance basics', 'Scams and fraud', 'Paying safely online', 'Reading the small print', 'Where to get help'] },
        ],
    },

    // -------------------------------------------------------------- 500s: languages
    {
        id: 'german', name: 'German', emoji: '🇩🇪', order: 501,
        description: 'German vocabulary, grammar, pronunciation and conversation',
        topics: [
            { slug: 'basics', name: 'German Basics', skills: ['Alphabet and pronunciation', 'German sounds', 'Greetings', 'Numbers 1-100', 'Days and months', 'Basic introductions'] },
            { slug: 'grammar', name: 'German Grammar', skills: ['Nouns and gender', 'Articles and cases', 'Subject pronouns', 'Present tense conjugation', 'Accusative case', 'Dative case', 'Modal verbs', 'Perfect tense', 'Word order'] },
            { slug: 'vocabulary', name: 'Vocabulary', skills: ['Family', 'Food and drink', 'Home', 'Clothing', 'Colours', 'Daily routine', 'Weather', 'Travel', 'Jobs'] },
            { slug: 'conversation', name: 'Conversation', skills: ['Small talk', 'Asking questions', 'Listening comprehension', 'Reading comprehension', 'Writing a short message', 'Ordering food', 'Making appointments'] },
        ],
    },
    {
        id: 'japanese', name: 'Japanese', emoji: '🇯🇵', order: 502,
        description: 'Japanese scripts, grammar and everyday conversation',
        topics: [
            { slug: 'basics', name: 'Japanese Basics', skills: ['Hiragana and katakana', 'Kanji basics', 'Japanese pronunciation', 'Greetings', 'Numbers', 'Family terms', 'Polite forms', 'Counters'] },
            { slug: 'grammar', name: 'Japanese Grammar', skills: ['Particles', 'Word order', 'Verb conjugation', 'Adjectives', 'Existential verbs', 'Past tense', 'Plain form versus polite form', 'Keigo basics'] },
            { slug: 'vocabulary', name: 'Vocabulary', skills: ['Food', 'Colours', 'School', 'Time and date', 'Travel', 'Shopping', 'Daily life', 'Weather'] },
            { slug: 'conversation', name: 'Conversation', skills: ['Introducing yourself', 'Asking questions', 'Listening comprehension', 'Reading simple text', 'Ordering food', 'Writing a short message', 'Phone calls', 'Tone and politeness'] },
        ],
    },
    {
        id: 'italian', name: 'Italian', emoji: '🇮🇹', order: 503,
        description: 'Italian vocabulary, grammar and conversation',
        topics: [
            { slug: 'basics', name: 'Italian Basics', skills: ['Alphabet and pronunciation', 'Italian sounds', 'Greetings', 'Numbers', 'Days and months', 'Basic introductions'] },
            { slug: 'grammar', name: 'Italian Grammar', skills: ['Nouns and gender', 'Articles', 'Subject pronouns', 'Present tense conjugation', 'Passato prossimo', 'Imperfetto', 'Future tense', 'Adjective agreement', 'Prepositions'] },
            { slug: 'vocabulary', name: 'Vocabulary', skills: ['Family', 'Food and drink', 'Home', 'Clothing', 'Colours', 'Daily routine', 'Weather', 'Travel', 'Hobbies'] },
            { slug: 'conversation', name: 'Conversation', skills: ['Small talk', 'Ordering in a restaurant', 'Shopping', 'Listening comprehension', 'Reading comprehension', 'Writing a short message'] },
        ],
    },
    {
        id: 'portuguese', name: 'Portuguese', emoji: '🇵🇹', order: 504,
        description: 'Portuguese vocabulary, grammar and conversation',
        topics: [
            { slug: 'basics', name: 'Portuguese Basics', skills: ['Alphabet and pronunciation', 'Portuguese sounds', 'Greetings', 'Numbers', 'Days and months', 'Basic introductions'] },
            { slug: 'grammar', name: 'Portuguese Grammar', skills: ['Nouns and gender', 'Articles', 'Subject pronouns', 'Ser versus estar', 'Present tense conjugation', 'Pretérito perfeito', 'Imperfect tense', 'Future tense', 'Reflexive verbs'] },
            { slug: 'vocabulary', name: 'Vocabulary', skills: ['Family', 'Food and drink', 'Home', 'Clothing', 'Colours', 'Daily routine', 'Weather', 'Travel', 'Jobs'] },
            { slug: 'conversation', name: 'Conversation', skills: ['Small talk', 'Asking questions', 'Listening comprehension', 'Reading comprehension', 'Writing a short message', 'Shopping'] },
        ],
    },
    {
        id: 'korean', name: 'Korean', emoji: '🇰🇷', order: 505,
        description: 'Korean writing, grammar and everyday conversation',
        topics: [
            { slug: 'basics', name: 'Korean Basics', skills: ['Hangul consonants', 'Hangul vowels', 'Pronunciation', 'Greetings', 'Numbers', 'Family terms', 'Age and honorifics', 'Dates'] },
            { slug: 'grammar', name: 'Korean Grammar', skills: ['Word order', 'Particles', 'Present tense', 'Past tense', 'Future tense', 'Adjectives', 'Noun endings', 'Honorific levels', 'Counters'] },
            { slug: 'vocabulary', name: 'Vocabulary', skills: ['Food', 'Colours', 'School', 'Time', 'Travel', 'Shopping', 'Daily life', 'Weather'] },
            { slug: 'conversation', name: 'Conversation', skills: ['Introducing yourself', 'Asking questions', 'Listening comprehension', 'Reading simple text', 'Writing a short message', 'Ordering food'] },
        ],
    },
    {
        id: 'russian', name: 'Russian', emoji: '🇷🇺', order: 506,
        description: 'Cyrillic, Russian grammar and conversation',
        topics: [
            { slug: 'basics', name: 'Russian Basics', skills: ['The Cyrillic alphabet', 'Russian pronunciation', 'Greetings', 'Numbers 1-100', 'Days and months', 'Basic introductions'] },
            { slug: 'grammar', name: 'Russian Grammar', skills: ['Nouns and gender', 'Cases', 'Subject pronouns', 'Present tense conjugation', 'Past tense', 'Future tense', 'Adjective agreement', 'Verbs of motion'] },
            { slug: 'vocabulary', name: 'Vocabulary', skills: ['Family', 'Food and drink', 'Home', 'Clothing', 'Colours', 'Daily routine', 'Weather', 'Travel', 'Jobs'] },
            { slug: 'conversation', name: 'Conversation', skills: ['Small talk', 'Asking questions', 'Listening comprehension', 'Reading comprehension', 'Writing a short message'] },
        ],
    },
    {
        id: 'turkish', name: 'Turkish', emoji: '🇹🇷', order: 507,
        description: 'Turkish vocabulary, grammar and conversation',
        topics: [
            { slug: 'basics', name: 'Turkish Basics', skills: ['The Turkish alphabet', 'Turkish sounds', 'Greetings', 'Numbers', 'Days and months', 'Basic introductions'] },
            { slug: 'grammar', name: 'Turkish Grammar', skills: ['Nouns and suffixes', 'Vowel harmony', 'Subject pronouns', 'Present tense', 'Past tense', 'Question particles', 'Case suffixes', 'Adjective agreement'] },
            { slug: 'vocabulary', name: 'Vocabulary', skills: ['Family', 'Food and drink', 'Home', 'Clothing', 'Colours', 'Daily routine', 'Weather', 'Travel'] },
            { slug: 'conversation', name: 'Conversation', skills: ['Small talk', 'Asking questions', 'Listening comprehension', 'Reading comprehension', 'Writing a short message'] },
        ],
    },
    {
        id: 'swahili', name: 'Swahili', emoji: '🇰🇪', order: 508,
        description: 'Swahili vocabulary, grammar and conversation',
        topics: [
            { slug: 'basics', name: 'Swahili Basics', skills: ['Alphabet and pronunciation', 'Swahili sounds', 'Greetings', 'Numbers 1-100', 'Days of the week', 'Basic introductions'] },
            { slug: 'grammar', name: 'Swahili Grammar', skills: ['Noun classes', 'Noun agreement', 'Subject pronouns', 'Verb tenses', 'Present tense', 'Past tense', 'Future tense', 'Adjectives', 'Prepositions', 'Questions and negation'] },
            { slug: 'vocabulary', name: 'Vocabulary', skills: ['Family', 'Food and drink', 'Home', 'Clothing', 'Colours', 'Daily routine', 'Weather', 'Travel', 'Jobs', 'Market and shopping'] },
            { slug: 'conversation', name: 'Conversation', skills: ['Greetings and small talk', 'Asking questions', 'Listening comprehension', 'Reading comprehension', 'Writing a short message', 'Telling directions'] },
        ],
    },
    {
        id: 'welsh', name: 'Welsh', emoji: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', order: 509,
        description: 'Welsh vocabulary, mutation and conversation',
        topics: [
            { slug: 'basics', name: 'Welsh Basics', skills: ['The Welsh alphabet', 'Pronunciation', 'Greetings', 'Numbers', 'Days and months', 'Basic introductions'] },
            { slug: 'grammar', name: 'Welsh Grammar', skills: ['Word order', 'Initial mutations', 'Noun gender', 'Verbs and tenses', 'Present tense', 'Past tense', 'Questions', 'Negation'] },
            { slug: 'vocabulary', name: 'Vocabulary', skills: ['Family', 'Food and drink', 'Home', 'Clothing', 'Colours', 'Daily routine', 'Weather', 'Travel', 'Nature'] },
            { slug: 'conversation', name: 'Conversation', skills: ['Small talk', 'Asking questions', 'Listening comprehension', 'Reading comprehension', 'Writing a short message'] },
        ],
    },
    {
        id: 'irish', name: 'Irish (Gaelic)', emoji: '🇮🇪', order: 510,
        description: 'Irish vocabulary, grammar and pronunciation',
        topics: [
            { slug: 'basics', name: 'Irish Basics', skills: ['The Irish alphabet', 'Pronunciation and initial mutations', 'Greetings', 'Numbers', 'Days and months', 'Basic introductions'] },
            { slug: 'grammar', name: 'Irish Grammar', skills: ['Initial mutations', 'Word order', 'Nouns and gender', 'Verbs in the present tense', 'Past tense', 'Questions', 'Negation', 'Counting'] },
            { slug: 'vocabulary', name: 'Vocabulary', skills: ['Family', 'Food and drink', 'Home', 'Clothing', 'Colours', 'Daily routine', 'Weather', 'Travel', 'Landscape and nature'] },
            { slug: 'conversation', name: 'Conversation', skills: ['Small talk', 'Asking questions', 'Listening comprehension', 'Reading comprehension', 'Writing a short message'] },
        ],
    },
    {
        id: 'hindi', name: 'Hindi', emoji: '🇮🇳', order: 511,
        description: 'Hindi vocabulary, grammar and conversation',
        topics: [
            { slug: 'basics', name: 'Hindi Basics', skills: ['Devanagari script', 'Hindi sounds', 'Greetings', 'Numbers', 'Days and months', 'Basic introductions'] },
            { slug: 'grammar', name: 'Hindi Grammar', skills: ['Noun gender', 'Subject pronouns', 'Present tense', 'Past tense', 'Future tense', 'Adjectives', 'Postpositions', 'Question words', 'Negation'] },
            { slug: 'vocabulary', name: 'Vocabulary', skills: ['Family', 'Food and drink', 'Home', 'Clothing', 'Colours', 'Daily routine', 'Weather', 'Travel', 'School and work'] },
            { slug: 'conversation', name: 'Conversation', skills: ['Small talk', 'Asking questions', 'Listening comprehension', 'Reading comprehension', 'Writing a short message'] },
        ],
    },
    {
        id: 'latin', name: 'Latin', emoji: '🏛️', order: 512,
        description: 'Classical Latin reading, grammar and translation',
        topics: [
            { slug: 'grammar', name: 'Latin Grammar', skills: ['Nouns and cases', 'Adjectives', 'Verbs and conjugation', 'Present active', 'Perfect and imperfect', 'Subjunctive basics', 'Adverbs and prepositions', 'Word order'] },
            { slug: 'reading', name: 'Reading Latin', skills: ['Reading word by word', 'Finding the main verb', 'Translating accurately', 'Latin word order', 'Common phrases', 'Simple sentences', 'Story passages', 'Translating whole passages'] },
            { slug: 'culture', name: 'Latin Culture', skills: ['The Roman world', 'Roman mythology', 'Latin in science', 'Latin in law', 'Latin in medicine', 'Modern English borrowings', 'Inscriptions', 'Roman authors'] },
        ],
    },
    {
        id: 'ancient-greek', name: 'Ancient Greek', emoji: '🏺', order: 513,
        description: 'Ancient Greek alphabets, grammar and reading',
        topics: [
            { slug: 'basics', name: 'Alphabet and Sounds', skills: ['Greek alphabet', 'Pronunciation', 'Vowels and diphthongs', 'Breathing marks', 'Accents', 'Transliteration'] },
            { slug: 'grammar', name: 'Greek Grammar', skills: ['Nouns and cases', 'Articles', 'Adjectives', 'Verbs and conjugations', 'Present and aorist tense', 'Participles', 'Prepositions', 'Word order'] },
            { slug: 'reading', name: 'Reading Greek', skills: ['Reading word by word', 'Translating sentences', 'Passage reading', 'Common vocabulary', 'Philosophy texts', 'History texts', 'Transliteration practice', 'Using a lexicon'] },
        ],
    },

    // --------------------------------------------------- 600s: skills and support
    {
        id: 'study-skills', name: 'Study Skills', emoji: '🎯', order: 601,
        description: 'Planning, revising and taking exams with less stress',
        topics: [
            { slug: 'planning', name: 'Planning Study', skills: ['Setting realistic goals', 'Timetabling revision', 'Breaking work into tasks', 'Prioritising', 'Tracking progress', 'Adjusting the plan', 'Balancing study with rest', 'Managing energy'] },
            { slug: 'revision', name: 'Revising Well', skills: ['Active recall', 'Self-testing', 'Past papers', 'Condensed notes', 'Flashcards done well', 'Explaining to someone else', 'Spaced sessions', 'When to stop revising'] },
            { slug: 'exam-skills', name: 'Exam Skills', skills: ['Reading the paper', 'Timing', 'Answering question types', 'Essay structure', 'Checking answers', 'Managing panic', 'Practical and oral exams', 'What markers look for'] },
            { slug: 'writing-at-school', name: 'School Writing', skills: ['Essay structure', 'Paragraphs and topic sentences', 'Citations and referencing', 'Plagiarism and academic honesty', 'Proofreading', 'Reading feedback', 'Drafting', 'Voice and register'] },
        ],
    },
    {
        id: 'life-skills', name: 'Life Skills', emoji: '🌱', order: 602,
        description: 'Independence, wellbeing and everyday adulting',
        topics: [
            { slug: 'wellbeing', name: 'Wellbeing', skills: ['Understanding stress', 'Coping strategies', 'Sleep hygiene', 'Healthy routines', 'Self-esteem', 'Asking for help', 'Digital wellbeing', 'Work-life balance'] },
            { slug: 'independence', name: 'Independence', skills: ['Laundry and clothing care', 'Cooking basics', 'Cleaning and tidying', 'Shopping and budgeting', 'Telling time and planning', 'Household safety', 'Using appliances safely', 'Basic home maintenance'] },
            { slug: 'emotional', name: 'Emotional Skills', skills: ['Understanding emotions', 'Naming feelings', 'Self-compassion', 'Handling disappointment', 'Setting boundaries', 'Resolving conflict', 'Supporting a friend', 'When to seek professional help'] },
            { slug: 'digital', name: 'Digital Life', skills: ['Passwords and accounts', 'Two-factor authentication', 'Spotting scams', 'Safe sharing', 'Online privacy settings', 'Backing up data', 'Staying safe on social media', 'Digital footprints'] },
        ],
    },
    {
        id: 'test-preparation', name: 'Exam Preparation', emoji: '📝', order: 603,
        description: 'Structured preparation for high-stakes exams',
        topics: [
            { slug: 'strategy', name: 'Exam Strategy', skills: ['Knowing the format', 'Marking schemes', 'Question types', 'Choosing what to answer', 'Time per mark', 'Command words', 'Working backwards from marks', 'Choosing subjects and papers'] },
            { slug: 'revision-plan', name: 'Revision Planning', skills: ['Diagnostic revision', 'Spaced revision schedule', 'Topic order by strength', 'Resources that help', 'Revision groups', 'Revision retreats', 'Tracking readiness', 'Final week plan'] },
            { slug: 'performance', name: 'Exam Performance', skills: ['Calm techniques', 'Reading questions fully', 'Skipping and returning', 'Legible answers', 'Answering short questions', 'Extending answers for marks', 'Working with a faulty question', 'Post-exam reflection'] },
            { slug: 'subject-strategies', name: 'Subject Strategies', skills: ['Maths exam technique', 'Essay exams', 'Science practicals', 'Multiple choice strategies', 'Language tests', 'Case study questions', 'Data questions', 'Open-ended problems'] },
        ],
    },
    {
        id: 'public-speaking', name: 'Public Speaking', emoji: '🎙️', order: 604,
        description: 'Speaking clearly and confidently in front of others',
        topics: [
            { slug: 'preparing', name: 'Preparing', skills: ['Knowing your audience', 'Choosing a message', 'Structure of a talk', 'Rehearsing', 'Notes versus memorising', 'Anticipating questions', 'Timing a talk', 'Preparing visual aids'] },
            { slug: 'delivery', name: 'Delivery', skills: ['Voice projection', 'Pace and pauses', 'Eye contact', 'Body language', 'Handling nerves', 'Reading the room', 'Using notes well', 'Ending strongly'] },
            { slug: 'formats', name: 'Talk Formats', skills: ['Impromptu speaking', 'Presentations', 'Debates', 'Interviews', 'Panel discussions', 'Pitching', 'Toast and tribute speeches', 'Giving a eulogy'] },
        ],
    },
    {
        id: 'coding-projects', name: 'Coding Projects', emoji: '💡', order: 605,
        description: 'Building real programs from idea to finished project',
        topics: [
            { slug: 'planning', name: 'Planning a Project', skills: ['Defining requirements', 'Breaking into tasks', 'Choosing a language', 'File organisation', 'Version control basics', 'Writing a README', 'Milestones', 'Estimating work'] },
            { slug: 'building', name: 'Building', skills: ['Writing readable code', 'Input validation', 'Error handling', 'Working with files', 'Using libraries', 'Testing as you go', 'Refactoring', 'Commenting and documentation'] },
            { slug: 'quality', name: 'Quality', skills: ['Unit tests', 'Debugging tools', 'Code review', 'Naming things well', 'Refactoring duplicated code', 'Performance basics', 'Security basics', 'Automated testing'] },
            { slug: 'shipping', name: 'Shipping a Project', skills: ['Build and deploy', 'Environments and configuration', 'Continuous deployment', 'Monitoring for errors', 'User documentation', 'Getting feedback', 'Iterating after release', 'Presenting your work'] },
        ],
    },
];