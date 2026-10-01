/**
 * Source of truth for the whole curriculum. Generates two artefacts:
 *
 *   supabase/migrations/0008_subject_expansion.sql
 *       Only the subjects added after the 0005 baseline, plus the sort_order
 *       renumbering for the full catalogue. Every statement is idempotent.
 *
 *   lib/curriculum.generated.ts
 *       Subject/topic/skill-count catalogue for the marketing pages, so the
 *       public site can describe the curriculum without a database round trip.
 *
 * Why generate instead of hand-writing SQL: the seed is large (~50 subjects,
 * ~300 topics, ~2000 skills) and needs a subject-scoped join. Keying skills by
 * `slug` alone (as 0002 did) silently attaches the wrong skills to any new
 * subject that reuses a slug like `fractions` or `writing`. Joining on
 * `(subject_id, slug)` makes that impossible.
 *
 * Run: npm run curriculum
 *
 * 0005 stays as the historical baseline — this script no longer rewrites it, so
 * databases that already applied it keep a stable history. The 0008 migration
 * re-declares the whole catalogue idempotently, which is also how the existing
 * subjects get their new sort_order values.
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { EXPANSION } from './curriculum/expansion.mjs';

const BASELINE = [
    {
        id: 'math', name: 'Mathematics', emoji: '🔢', order: 10,
        description: 'Arithmetic, fractions, ratios, algebra and geometry',
        topics: [
            { slug: 'arithmetic', name: 'Arithmetic', skills: ['Place value', 'Addition and subtraction', 'Multiplication and division', 'Order of operations', 'Rounding and estimation', 'Word problems', 'Units of measurement', 'Negative numbers'] },
            { slug: 'fractions', name: 'Fractions', skills: ['Identify equivalent fractions', 'Add fractions with like denominators', 'Add fractions with unlike denominators', 'Subtract fractions', 'Multiply fractions', 'Divide fractions', 'Compare and order fractions', 'Mixed numbers and improper fractions'] },
            { slug: 'decimals', name: 'Decimals', skills: ['Place value', 'Add and subtract decimals', 'Multiply decimals', 'Divide decimals', 'Convert decimal to fraction', 'Convert fraction to decimal', 'Rounding decimals', 'Order and compare decimals'] },
            { slug: 'percentages', name: 'Percentages', skills: ['Percent of a number', 'Percent increase and decrease', 'Percent change', 'Discounts and sale prices', 'Percent increase', 'Reverse percentage', 'Successive percentage changes', 'Percentage points versus percent'] },
            { slug: 'ratios', name: 'Ratios and Proportions', skills: ['Simplify ratios', 'Write equivalent ratios', 'Unit rates', 'Solve proportions', 'Scale drawings and maps', 'Ratio word problems', 'Part to whole ratios', 'Converting between ratio forms'] },
            { slug: 'algebra', name: 'Algebra', skills: ['Variables and expressions', 'Evaluate expressions', 'Simplify like terms', 'Distributive property', 'Solve one-step equations', 'Solve two-step equations', 'Translate words to equations', 'Inequalities', 'Order of operations with variables', 'Solve systems by substitution', 'Quadratic factoring', 'Quadratic formula'] },
            { slug: 'geometry', name: 'Geometry', skills: ['Points, lines and planes', 'Angles', 'Angle relationships', 'Triangles and congruence', 'Polygons', 'Perimeter', 'Area of rectangles', 'Area of triangles', 'Area of circles', 'Volume and surface area', 'Pythagorean theorem', 'Volume of prisms and cylinders', 'Transformations', 'Congruent and similar figures'] },
            { slug: 'trigonometry', name: 'Trigonometry', skills: ['Sine, cosine and tangent', 'SOH-CAH-TOA', 'Inverse trigonometric functions', 'Special right triangles', 'Law of sines', 'Law of cosines', 'Angles of elevation and depression', 'Trigonometric identities', 'Graphing trigonometric functions', 'Polar coordinates'] },
            { slug: 'statistics', name: 'Statistics and Probability', skills: ['Mean, median and mode', 'Range and variance', 'Standard deviation', 'Data distributions', 'Probability basics', 'Probability of compound events', 'Conditional probability', 'Combinations and permutations', 'Reading box plots', 'Scatter plots and correlation', 'Normal distribution', 'Sampling methods'] },
            { slug: 'number-theory', name: 'Number Theory', skills: ['Prime numbers', 'Factors and multiples', 'Greatest common factor', 'Least common multiple', 'Divisibility rules', 'Prime factorization', 'Exponents and scientific notation', 'Square roots and simplifying radicals', 'Irrational numbers', 'Fibonacci sequence'] },
            { slug: 'sets-and-logic', name: 'Sets, Logic and Proof', skills: ['Sets and set notation', 'Venn diagrams', 'Union and intersection', 'Complements', 'Logic statements and truth tables', 'Negations', 'Logical connectives', 'Direct proof', 'Proof by contradiction', 'Mathematical induction'] },
            { slug: 'calculus', name: 'Calculus', skills: ['Limits', 'Derivative as a rate of change', 'Differentiation rules', 'Chain rule', 'Product and quotient rule', 'Applications of differentiation', 'Stationary points', 'Integration as the reverse process', 'Definite integrals', 'Area under a curve', 'Introductory modelling'] },
            { slug: 'sequences-series', name: 'Sequences and Series', skills: ['Patterns in sequences', 'Arithmetic sequences', 'Geometric sequences', 'Arithmetic series', 'Geometric series', 'Binomial theorem', 'Convergence and divergence', 'Sigma notation'] },
            { slug: 'vectors-and-matrices', name: 'Vectors and Matrices', skills: ['Scalars and vectors', 'Vector notation', 'Vector addition', 'Dot product', 'Magnitude and direction', 'Matrices as tables', 'Matrix addition and multiplication', 'Determinants', 'Solving simultaneous equations with matrices', 'Transformations with matrices'] },
            { slug: 'probability-intro', name: 'Probability Foundations', skills: ['Sample space', 'Events and outcomes', 'Addition rule', 'Multiplication rule', 'Complementary events', 'Tree diagrams', 'Venn diagrams for probability', 'Expected value'] },
        ],
    },
    {
        id: 'english', name: 'English', emoji: '📚', order: 20,
        description: 'Grammar, vocabulary, reading comprehension and writing',
        topics: [
            { slug: 'grammar', name: 'Grammar', skills: ['Parts of speech', 'Subject-verb agreement', 'Nouns and pronouns', 'Verb tenses', 'Articles and determiners', 'Adjectives and adverbs', 'Prepositions', 'Conjunctions', 'Sentence types', 'Punctuation', 'Plurals and possessives', 'Common usage errors'] },
            { slug: 'vocabulary', name: 'Vocabulary', skills: ['Context clues', 'Synonyms and antonyms', 'Prefixes and suffixes', 'Greek and Latin roots', 'Figurative language', 'Connotation and denotation', 'Idioms and idiomatic phrases', 'Word forms and morphology', 'Academic word list', 'Collocation'] },
            { slug: 'reading', name: 'Reading Comprehension', skills: ['Main idea and central theme', 'Supporting details', 'Inference', 'Making predictions', 'Sequence and organization', 'Point of view', 'Comparing texts', 'Understanding tone', 'Reading charts and graphs', 'Summarizing', 'Analyzing argument', 'Author purpose'] },
            { slug: 'writing', name: 'Writing', skills: ['Sentence structure', 'Paragraph structure', 'Thesis statements', 'Topic sentences', 'Transitions', 'Descriptive writing', 'Narrative writing', 'Expository writing', 'Persuasive writing', 'Introductory paragraph', 'Conclusion writing', 'Peer review and revision'] },
            { slug: 'literature', name: 'Literature', skills: ['Literary devices', 'Poetry forms', 'Prose analysis', 'Drama and dialogue', 'Characterization', 'Setting and atmosphere', 'Conflict and climax', 'Theme analysis', 'Symbolism and allegory', 'Citing textual evidence'] },
            { slug: 'media-literacy', name: 'Media Literacy', skills: ['Identifying bias', 'Evaluating sources', 'Recognizing propaganda techniques', 'Understanding algorithms and filters', 'Source credibility', 'Misinformation versus disinformation', 'Digital citizenship'] },
        ],
    },
    {
        id: 'biology', name: 'Biology', emoji: '🧬', order: 30,
        description: 'Cells, genetics, evolution, human systems and ecology',
        topics: [
            { slug: 'cells', name: 'Cells', skills: ['Cell theory', 'Prokaryotic versus eukaryotic cells', 'Cell organelles', 'Cell membrane and transport', 'Passive transport', 'Active transport', 'Osmosis and diffusion', 'Plant versus animal cells'] },
            { slug: 'genetics', name: 'Genetics', skills: ['DNA structure', 'DNA replication', 'RNA and transcription', 'Translation and the genetic code', 'Genes and alleles', 'Mendelian inheritance', 'Punnett squares', 'Sex-linked inheritance', 'Mutations', 'Non-Mendelian inheritance', 'Genetics technology and ethics'] },
            { slug: 'human-body', name: 'Human Body Systems', skills: ['Levels of organization', 'Skeletal system', 'Muscular system', 'Nervous system', 'Circulatory system', 'Respiratory system', 'Digestive system', 'Excretory system', 'Endocrine system', 'Immune system', 'Reproductive system', 'Homeostasis'] },
            { slug: 'ecology', name: 'Ecology', skills: ['Ecosystem structure', 'Food chains and webs', 'Energy flow', 'Population dynamics', 'Carrying capacity', 'Biomes', 'Symbiosis', 'Human impact on ecosystems'] },
            { slug: 'evolution', name: 'Evolution', skills: ['Evidence for evolution', 'Natural selection', 'Adaptation', 'Speciation', 'Fossils and the fossil record', 'Homologous and analogous structures', 'Antibiotic resistance'] },
            { slug: 'photosynthesis', name: 'Photosynthesis and Plant Biology', skills: ['Plant structures', 'Photosynthesis equation and inputs', 'Light-dependent reactions', 'Calvin cycle', 'Cellular respiration', 'Plant transport', 'Plant reproduction', 'Plant adaptations'] },
            { slug: 'microbiology', name: 'Microbiology', skills: ['Bacteria', 'Viruses', 'Fungi', 'Protists', 'Archaea', 'Pathogens and disease', 'Antibiotic resistance', 'Microbial food cycles', 'Microscopy techniques', 'Culturing microbes safely'] },
            { slug: 'biotechnology', name: 'Biotechnology', skills: ['Genetic engineering', 'Recombinant DNA', 'Gel electrophoresis', 'PCR', 'Cloning and transgenic organisms', 'GM crops debate', 'Gene therapy', 'CRISPR', 'Forensic DNA profiling', 'Bioprocesses and fermentation'] },
        ],
    },
    {
        id: 'chemistry', name: 'Chemistry', emoji: '⚗️', order: 40,
        description: 'Atomic structure, bonding, reactions, acids and stoichiometry',
        topics: [
            { slug: 'atomic-structure', name: 'Atomic Structure', skills: ['Atomic theory', 'Subatomic particles', 'Electron configuration', 'Periodic trends', 'Isotopes and average atomic mass', 'Valence electrons', 'Ion formation'] },
            { slug: 'bonding', name: 'Chemical Bonding', skills: ['Ionic bonding', 'Covalent bonding', 'Metallic bonding', 'Lewis structures', 'VSEPR and molecular shape', 'Intermolecular forces', 'Hydrogen bonding', 'Bond energy and length'] },
            { slug: 'reactions', name: 'Chemical Reactions', skills: ['Balancing equations', 'Synthesis reactions', 'Decomposition reactions', 'Single and double displacement', 'Combustion reactions', 'Precipitation reactions', 'Redox reactions', 'Reaction energy', 'Rate of reaction', 'Catalysts'] },
            { slug: 'stoichiometry', name: 'Stoichiometry', skills: ['Mole concept', 'Molar mass', 'Stoichiometric calculations', 'Limiting reagent', 'Theoretical yield', 'Percent yield', 'Percent composition', 'Empirical and molecular formulas', 'Solutions and concentration', 'Dilution'] },
            { slug: 'acids-bases', name: 'Acids and Bases', skills: ['pH and pOH', 'Strong versus weak acids', 'Brønsted-Lowry theory', 'Neutralization reactions', 'Titration', 'Buffers', 'pH of everyday substances'] },
            { slug: 'organic', name: 'Organic Chemistry', skills: ['Carbon bonding', 'Functional groups', 'Alkanes', 'Alkenes and alkynes', 'Alcohols', 'Carboxylic acids', 'Polymers', 'Isomers'] },
            { slug: 'thermodynamics', name: 'Thermochemistry', skills: ['Energy in chemical systems', 'Endothermic and exothermic', 'Specific heat capacity', 'Latent heat', 'Hess law', 'Enthalpy', 'Entropy and spontaneity'] },
            { slug: 'periodic-table', name: 'Periodic Table', skills: ['Groups and periods', 'Metals, nonmetals and metalloids', 'Alkali and alkaline earth metals', 'Halogens', 'Transition metals', 'Lanthanides and actinides', 'Naming elements'] },
            { slug: 'electrochemistry', name: 'Electrochemistry', skills: ['Oxidation and reduction', 'Half equations', 'Electrolysis', 'Electroplating', 'Galvanic cells', 'Electrochemical series', 'Cells and batteries', 'Fuel cells'] },
            { slug: 'lab-techniques', name: 'Laboratory Techniques', skills: ['Laboratory safety', 'Measuring volume', 'Measuring mass', 'Heating solids and liquids', 'Filtration and separation', 'Distillation', 'Chromatography', 'Recording results correctly', 'Error analysis'] },
            { slug: 'kinetics', name: 'Chemical Kinetics', skills: ['Rate of reaction', 'Collision theory', 'Activation energy', 'Catalysts', 'Rate laws', 'Effect of concentration', 'Effect of temperature', 'Pressure effects on rates'] },
        ],
    },
    {
        id: 'physics', name: 'Physics', emoji: '⚛️', order: 50,
        description: 'Motion, forces, energy, waves, electricity and modern physics',
        topics: [
            { slug: 'motion', name: 'Motion', skills: ['Distance and displacement', 'Speed and velocity', 'Acceleration', 'Equations of motion', 'Graphing motion', 'Circular motion', 'Projectile motion', 'Free-body diagrams'] },
            { slug: 'forces', name: 'Forces', skills: ['Newton three laws', 'Friction', 'Net force and equilibrium', 'Weight and normal force', 'Tension', "Newton's second law", "Newton's third law", 'Air resistance', 'Static equilibrium'] },
            { slug: 'energy', name: 'Energy and Work', skills: ['Kinetic energy', 'Potential energy', 'Conservation of energy', 'Work and power', 'Energy transfers', 'Efficiency', 'Simple machines', 'Momentum and impulse', 'Collisions'] },
            { slug: 'waves', name: 'Waves and Sound', skills: ['Wave properties', 'Amplitude, wavelength and frequency', 'Wave speed', 'Transverse and longitudinal waves', 'Superposition and interference', 'Doppler effect', 'Resonance', 'Pitch and loudness'] },
            { slug: 'light', name: 'Light and Optics', skills: ['Reflection', 'Refraction', 'Index of refraction', 'Total internal reflection', 'Lenses', 'Mirrors', 'Lenses and ray diagrams', 'Interference and diffraction', 'Polarization'] },
            { slug: 'electricity', name: 'Electricity and Magnetism', skills: ['Static electricity', 'Electric current', 'Voltage and potential difference', 'Resistance', "Ohm's law", 'Series and parallel circuits', 'Electrical power', 'Magnetic fields', 'Electromagnetic induction', 'Motors and generators'] },
            { slug: 'thermodynamics', name: 'Thermodynamics', skills: ['Temperature and heat', 'Thermal expansion', 'Specific heat', 'Phase changes', 'Ideal gas law', 'Kinetic theory of gases'] },
            { slug: 'modern-physics', name: 'Modern Physics', skills: ['Atomic models', 'Radioactivity', 'Nuclear equations', 'Nuclear fission and fusion', 'Quantum ideas', 'Photoelectric effect', 'Special relativity'] },
            { slug: 'measurement', name: 'Measurement and Units', skills: ['SI base units', 'Scientific notation', 'Significant figures', 'Dimensional analysis', 'Precision versus accuracy', 'Graphing and slope', 'Unit conversions'] },
            { slug: 'fluids', name: 'Fluids', skills: ['Density and pressure', 'Pressure in fluids', 'Upthrust and buoyancy', 'Floating and sinking', 'Flow rate and continuity', 'Bernoulli principle', 'Viscosity', 'Surface tension'] },
            { slug: 'rotational-motion', name: 'Rotational Motion', skills: ['Angular velocity and acceleration', 'Torque', 'Moment of inertia', 'Rotational kinetic energy', 'Rolling without slipping', 'Gears', 'Centripetal force in circles', 'Balancing and stability'] },
        ],
    },
    {
        id: 'general-science', name: 'General Science', emoji: '🔬', order: 60,
        description: 'Foundational science skills, scientific method and earth science',
        topics: [
            { slug: 'scientific-method', name: 'Scientific Method', skills: ['Observation and questions', 'Hypothesis', 'Experiment design', 'Variables and controls', 'Data collection', 'Analyzing results', 'Drawing conclusions', 'Communicating findings', 'Peer review'] },
            { slug: 'matter', name: 'Matter', skills: ['States of matter', 'Particle model', 'Physical versus chemical change', 'Mixtures and compounds', 'Elements and atoms', 'Density', 'Solids, liquids and gases'] },
            { slug: 'energy-use', name: 'Energy in Everyday Life', skills: ['Forms of energy', 'Energy transformations', 'Conservation of energy', 'Renewable energy', 'Non-renewable energy', 'Energy efficiency'] },
            { slug: 'earth-science', name: 'Earth Science', skills: ['Earth structure', 'Plate tectonics', 'Rock cycle', 'Soil formation', 'Weather versus climate', 'Water cycle', 'Natural hazards', 'Soil and rock resources'] },
            { slug: 'environment', name: 'Environment', skills: ['Pollution', 'Climate change', 'Biodiversity', 'Conservation', 'Resource use', 'Sustainability'] },
        ],
    },
    {
        id: 'history', name: 'History', emoji: '🏛️', order: 70,
        description: 'World history, ancient civilizations and historical thinking',
        topics: [
            { slug: 'ancient-civilizations', name: 'Ancient Civilizations', skills: ['Mesopotamia', 'Ancient Egypt', 'Ancient India', 'Ancient China', 'Ancient Greece', 'Ancient Rome', 'Mesopotamian writing', 'Comparative civilizations'] },
            { slug: 'prehistory', name: 'Prehistory', skills: ['Early humans', 'Stone tools', 'Agriculture revolution', 'Human migration', 'Cave art', 'Prehistoric trade'] },
            { slug: 'early-modern', name: 'Early Modern History', skills: ['Age of Exploration', 'Age of Revolution', 'Renaissance', 'Reformation', 'Early modern empires', 'Printing press'] },
            { slug: 'industrial-revolution', name: 'Industrial Revolution', skills: ['Causes of industrialization', 'Factory system', 'Technological innovation', 'Urbanization', 'Labor conditions', 'Economic inequality', 'Economic inequality and reform'] },
            { slug: 'world-wars', name: 'World Wars', skills: ['Causes of World War I', 'Trench warfare', 'Treaty of Versailles', 'Causes of World War II', 'Holocaust', 'D-Day and liberation', 'Post-war rebuilding', 'United Nations', 'Cold War', 'Decolonization'] },
            { slug: 'modern-era', name: 'Modern and Contemporary History', skills: ['Civil rights movements', 'Women\'s suffrage', 'Apartheid and its end', 'Globalization', 'Digital revolution', '21st century challenges'] },
            { slug: 'historical-thinking', name: 'Historical Thinking', skills: ['Primary sources', 'Secondary sources', 'Bias in sources', 'Causation', 'Correlation versus causation', 'Continuity and change', 'Perspective', 'Historians\' debates', 'Using evidence'] },
        ],
    },
    {
        id: 'geography', name: 'Geography', emoji: '🌍', order: 80,
        description: 'Physical geography, human geography and map skills',
        topics: [
            { slug: 'maps', name: 'Maps and Cartography', skills: ['Map projections', 'Scale and legend', 'Latitude and longitude', 'Reading a topographic map', 'Contour lines', 'Grid references', 'Types of maps'] },
            { slug: 'physical-geography', name: 'Physical Geography', skills: ['Landforms', 'Rivers and drainage', 'Plate tectonics and mountains', 'Oceans and currents', 'Climate zones', 'Weather patterns', 'Biomes', 'Soils'] },
            { slug: 'human-geography', name: 'Human Geography', skills: ['Population distribution', 'Population density', 'Migration', 'Urbanization', 'Settlement patterns', 'Agriculture and land use', 'Economic activity', 'Trade and blocs'] },
            { slug: 'environment-geography', name: 'Environmental Geography', skills: ['Deforestation', 'Desertification', 'Water scarcity', 'Climate change impacts', 'Natural hazards and risk'] },
            { slug: 'fieldwork', name: 'Fieldwork and Data', skills: ['Designing a fieldwork question', 'Sampling techniques', 'Questionnaires', 'Interviews', 'Data presentation', 'Evaluating fieldwork'] },
        ],
    },
    {
        id: 'civics', name: 'Civics and Government', emoji: '⚖️', order: 90,
        description: 'Government systems, rights, law and civic participation',
        topics: [
            { slug: 'government-basics', name: 'Foundations of Government', skills: ['What is a government', 'Authority and legitimacy', 'Social contract', 'Levels of government', 'State versus nation', 'Political ideology'] },
            { slug: 'democracy', name: 'Democracy', skills: ['Direct and representative democracy', 'Voting systems', 'Elections', 'Political parties', 'Interest groups', 'Free and fair elections'] },
            { slug: 'branches', name: 'Branches of Government', skills: ['Executive', 'Legislative', 'Judicial', 'Checks and balances', 'Separation of powers', 'Constitutional monarchy and republics'] },
            { slug: 'rights', name: 'Rights and Responsibilities', skills: ['Human rights', 'Civil rights', 'Universal Declaration of Human Rights', 'Constitutional rights', 'Responsibilities of citizens', 'Rule of law'] },
            { slug: 'law', name: 'Law', skills: ['Rule of law', 'Types of law', 'Legal systems', 'Courts and procedures', 'Rights of the accused', 'Constitutional law', 'Civil law versus criminal law'] },
            { slug: 'participation', name: 'Civic Participation', skills: ['Voting', 'Community organizing', 'Public consultations', 'Petitions', 'Civic education', 'Media literacy for citizens'] },
            { slug: 'international', name: 'International Relations', skills: ['United Nations', 'International law', 'Diplomacy', 'International organizations', 'Global organizations', 'Sovereignty'] },
        ],
    },
    {
        id: 'economics', name: 'Economics', emoji: '📈', order: 100,
        description: 'Microeconomics, macroeconomics and financial literacy',
        topics: [
            { slug: 'basics', name: 'Economic Basics', skills: ['Needs and wants', 'Scarcity and choice', 'Opportunity cost', 'Factors of production', 'Economic systems', 'Supply and demand', 'Market equilibrium', 'Elasticity'] },
            { slug: 'microeconomics', name: 'Microeconomics', skills: ['Consumers and producers', 'Competition and monopoly', 'Public goods and externalities', 'Taxes and subsidies', 'Price controls', 'Labour markets'] },
            { slug: 'macroeconomics', name: 'Macroeconomics', skills: ['GDP', 'Inflation', 'Unemployment', 'Economic growth', 'Business cycle', 'Monetary policy', 'Fiscal policy', 'Recession'] },
            { slug: 'money-banking', name: 'Money and Banking', skills: ['What money is', 'Central banking', 'Commercial banks', 'Interest rates', 'Inflation and purchasing power', 'Financial institutions'] },
            { slug: 'personal-finance', name: 'Personal Finance', skills: ['Budgeting', 'Saving', 'Compound interest', 'Banking services', 'Credit and debt', 'Consumer rights', 'Financial planning'] },
            { slug: 'trade-development', name: 'Trade and Development', skills: ['Comparative advantage', 'International trade', 'Tariffs', 'Development indicators', 'Sustainable development'] },
        ],
    },
    {
        id: 'accounting', name: 'Accounting', emoji: '🧾', order: 110,
        description: 'Double-entry bookkeeping, financial statements and analysis',
        topics: [
            { slug: 'principles', name: 'Accounting Principles', skills: ['Accounting equation', 'Double-entry bookkeeping', 'Debits and credits', 'Chart of accounts', 'Accrual versus cash basis', 'Accounting period'] },
            { slug: 'statements', name: 'Financial Statements', skills: ['Income statement', 'Balance sheet', 'Statement of cash flows', 'Preparing statements', 'Interpreting statements', 'Comparative statements'] },
            { slug: 'adjusting-entries', name: 'Adjusting Entries', skills: ['Accruals', 'Deferrals', 'Depreciation', 'Prepaid expenses', 'Accrued liabilities', 'Trial balance'] },
            { slug: 'ratios', name: 'Ratio Analysis', skills: ['Liquidity ratios', 'Solvency ratios', 'Profitability ratios', 'Efficiency ratios', 'Comparing across periods', 'Interpreting ratios'] },
        ],
    },
    {
        id: 'computer-science', name: 'Computer Science', emoji: '💻', order: 120,
        description: 'Programming fundamentals, algorithms, data and computing systems',
        topics: [
            { slug: 'computing-basics', name: 'Computing Basics', skills: ['Hardware and software', 'Operating systems', 'Files and file systems', 'Number systems', 'Boolean logic', 'Encoding and binary', 'Input/output devices'] },
            { slug: 'programming', name: 'Programming Fundamentals', skills: ['Variables and data types', 'Conditionals', 'Loops', 'Functions', 'Arrays and lists', 'Dictionaries', 'Strings', 'Errors and debugging', 'Reading code', 'Algorithms and pseudocode', 'Object-oriented concepts', 'Recursion'] },
            { slug: 'web', name: 'Web Technologies', skills: ['How the web works', 'HTML structure', 'CSS styling', 'CSS layout', 'Responsive design', 'JavaScript in the browser', 'Version control basics', 'APIs and JSON'] },
            { slug: 'algorithms', name: 'Algorithms and Data Structures', skills: ['Searching and sorting', 'Big-O notation', 'Big-O notation and complexity', 'Arrays versus linked lists', 'Stacks and queues', 'Hash tables', 'Trees', 'Graph basics', 'Recursion and dynamic programming', 'Greedy algorithms'] },
            { slug: 'databases', name: 'Databases', skills: ['Relational model', 'Tables, rows and columns', 'Primary and foreign keys', 'SQL SELECT', 'SQL INSERT UPDATE DELETE', 'SQL joins', 'Normalisation', 'Indexing'] },
            { slug: 'networks', name: 'Computer Networks', skills: ['Local versus wide area networks', 'IP addressing', 'DNS', 'HTTP and HTTPS', 'Firewalls and security', 'Network topologies', 'The cloud'] },
            { slug: 'cybersecurity', name: 'Cybersecurity', skills: ['Threats and vulnerabilities', 'Passwords and authentication', 'Encryption basics', 'Social engineering', 'Safe browsing', 'Data privacy'] },
        ],
    },
    {
        id: 'spanish', name: 'Spanish', emoji: '🇪🇸', order: 130,
        description: 'Spanish vocabulary, grammar, reading and conversation',
        topics: [
            { slug: 'greetings', name: 'Greetings and Basics', skills: ['Alphabet and pronunciation', 'Greetings and farewells', 'Numbers 1-20', 'Days of the week', 'Months of the year', 'Basic introductions'] },
            { slug: 'numbers', name: 'Numbers and Time', skills: ['Numbers 21-100', 'Telling time', 'Dates', 'Ordinal numbers', 'Prices', 'Simple arithmetic in Spanish'] },
            { slug: 'grammar', name: 'Spanish Grammar', skills: ['Nouns and gender', 'Articles', 'Subject pronouns', 'Ser versus estar', 'Present tense conjugation', 'Preterite tense', 'Imperfect tense', 'Future tense', 'Reflexive verbs', 'Adjective agreement', 'Direct and indirect objects', 'Por versus para'] },
            { slug: 'vocabulary', name: 'Vocabulary', skills: ['Family and people', 'Food and drink', 'Home', 'Clothing', 'Body parts', 'Colors', 'Animals', 'School subjects', 'Weather', 'Travel and directions', 'Jobs', 'Daily routine'] },
            { slug: 'conversation', name: 'Conversation Skills', skills: ['Greeting and small talk', 'Asking questions', 'Listening comprehension', 'Reading comprehension', 'Ordering food', 'Shopping', 'Making appointments', 'Telling stories', 'Writing emails'] },
            { slug: 'culture', name: 'Culture', skills: ['Spanish-speaking countries', 'Customs and traditions', 'Cuisine', 'Music and festivals', 'Influences on English'] },
        ],
    },
    {
        id: 'french', name: 'French', emoji: '🇫🇷', order: 140,
        description: 'French vocabulary, grammar, pronunciation and conversation',
        topics: [
            { slug: 'basics', name: 'French Basics', skills: ['Alphabet and pronunciation', 'French vowel sounds', 'Greetings', 'Numbers 1-100', 'Days and months', 'Basic introductions'] },
            { slug: 'grammar', name: 'French Grammar', skills: ['Nouns and gender', 'Articles', 'Subject pronouns', 'Regular present tense verbs', 'Irregular present verbs', 'Passé composé', 'Imparfait', 'Future tense', 'Adjective agreement', 'Pronoun placement', 'Negation'] },
            { slug: 'vocabulary', name: 'Vocabulary', skills: ['Family', 'Food and drink', 'Home', 'Clothing', 'Colors', 'Daily routine', 'Weather', 'Travel', 'Hobbies'] },
            { slug: 'conversation', name: 'Conversation', skills: ['Small talk', 'Ordering in a cafe', 'Shopping', 'Listening comprehension', 'Reading comprehension', 'Writing a short message'] },
        ],
    },
    {
        id: 'mandarin', name: 'Mandarin Chinese', emoji: '🇨🇳', order: 150,
        description: 'Mandarin tones, pinyin, characters and everyday conversation',
        topics: [
            { slug: 'basics', name: 'Mandarin Basics', skills: ['Pinyin system', 'Four tones', 'Tone rules', 'Greetings', 'Numbers', 'Family terms', 'Classifiers', 'Measure words'] },
            { slug: 'characters', name: 'Characters', skills: ['Stroke order', 'Radicals', 'Number of characters used', 'Character radicals', 'Writing practice'] },
            { slug: 'grammar', name: 'Mandarin Grammar', skills: ['Word order', 'Topic and comment', 'Measure word structure', 'Serial verbs', 'Aspect markers', 'Time expressions', 'Negation'] },
            { slug: 'vocabulary', name: 'Vocabulary', skills: ['Numbers and money', 'Food', 'Colors', 'School', 'Family', 'Time and date', 'Daily life', 'Travel'] },
            { slug: 'conversation', name: 'Conversation', skills: ['Listening comprehension', 'Reading pinyin', 'Speaking practice', 'Ordering food', 'Introductions'] },
        ],
    },
    {
        id: 'arabic', name: 'Arabic', emoji: '🇸🇦', order: 160,
        description: 'Arabic script, phonology, grammar and vocabulary',
        topics: [
            { slug: 'script', name: 'Arabic Script', skills: ['Writing right to left', 'Letter forms', 'Letters in isolation and connection', 'Diacritics', 'Letters as shapes'] },
            { slug: 'phonology', name: 'Pronunciation', skills: ['Phonemes', 'Sun and moon letters', 'Sukun and shadda', 'Long vowels', 'Doubling'] },
            { slug: 'grammar', name: 'Arabic Grammar', skills: ['Gender and number', 'Noun cases', 'Definite article', 'Verbal patterns', 'Present tense', 'Past tense', 'Prepositions'] },
            { slug: 'vocabulary', name: 'Vocabulary', skills: ['Greetings', 'Numbers', 'Family', 'Food', 'Colors', 'Home', 'Daily life'] },
        ],
    },
    {
        id: 'esl', name: 'English as a Second Language', emoji: '🗣️', order: 170,
        description: 'Academic English, writing, speaking and test preparation',
        topics: [
            { slug: 'academic-english', name: 'Academic English', skills: ['Academic vocabulary', 'Formal register', 'Hedging', 'Nominalization', 'Passive voice', 'Signposting', 'Citations and referencing', 'Paragraphing in academic writing'] },
            { slug: 'grammar-refresher', name: 'Grammar Refresher', skills: ['Articles in context', 'Tenses overview', 'Conditional sentences', 'Relative clauses', 'Reported speech', 'Question forms', 'Word order', 'Common learner errors'] },
            { slug: 'writing-skills', name: 'Writing Skills', skills: ['Writing an essay', 'Writing a report', 'Email etiquette', 'Summarizing', 'Describing a process', 'Opinion essays', 'Editing and proofreading'] },
            { slug: 'speaking-skills', name: 'Speaking Skills', skills: ['Fluency techniques', 'Pronunciation clarity', 'Intonation', 'Group discussion', 'Presenting a talk', 'Listening for detail', 'Telephone and video calls'] },
            { slug: 'exam-prep', name: 'Exam Preparation', skills: ['IELTS formats', 'TOEFL formats', 'Test strategies', 'Reading under time pressure', 'Listening under time pressure', 'Writing to a rubric', 'Speaking under time pressure'] },
        ],
    },
    {
        id: 'philosophy', name: 'Philosophy', emoji: '🤔', order: 180,
        description: 'Logic, ethics, epistemology and political philosophy',
        topics: [
            { slug: 'logic', name: 'Logic and Argument', skills: ['Arguments and premises', 'Validity and soundness', 'Deductive reasoning', 'Inductive reasoning', 'Validating arguments', 'Identifying fallacies', 'Symbolic notation'] },
            { slug: 'ethics', name: 'Ethics', skills: ['Consequentialism', 'Deontology', 'Virtue ethics', 'Rights-based ethics', 'Care ethics', 'Applied ethics', 'Moral dilemmas'] },
            { slug: 'epistemology', name: 'Epistemology', skills: ['What is knowledge', 'Justified belief', 'Skepticism', 'External and internal justification', 'Truth and objectivity', 'Sources of knowledge'] },
            { slug: 'political-philosophy', name: 'Political Philosophy', skills: ['Social contract theory', 'Natural rights', 'Liberty versus equality', 'Justice', 'Authority and legitimacy'] },
            { slug: 'metaphysics', name: 'Metaphysics', skills: ['Universals and particulars', 'Existence', 'Free will and determinism', 'Identity over time', 'Causation'] },
        ],
    },
    {
        id: 'art', name: 'Art and Design', emoji: '🎨', order: 190,
        description: 'Visual art, design principles, art history and critique',
        topics: [
            { slug: 'elements', name: 'Elements of Art', skills: ['Line', 'Shape', 'Form', 'Color', 'Value', 'Texture', 'Space'] },
            { slug: 'principles', name: 'Principles of Design', skills: ['Balance', 'Contrast', 'Emphasis', 'Pattern', 'Rhythm', 'Movement', 'Unity and harmony', 'Proportion', 'Negative space'] },
            { slug: 'drawing', name: 'Drawing and Composition', skills: ['Observation drawing', 'Contour drawing', 'Value and shading', 'Perspective', 'Still life', 'Figure drawing', 'Composition', 'Sketching ideas'] },
            { slug: 'color-theory', name: 'Colour Theory', skills: ['Colour wheel', 'Primary, secondary and tertiary colours', 'Warm and cool colours', 'Hue, saturation and value', 'Colour schemes', 'Colour psychology'] },
            { slug: 'art-history', name: 'Art History', skills: ['Prehistoric art', 'Classical art', 'Medieval art', 'Renaissance', 'Impressionism', 'Modern art', 'Contemporary art', 'African and Islamic art'] },
            { slug: 'critique', name: 'Art Criticism', skills: ['Describing art', 'Analyzing art', 'Interpretation', 'Judging art', 'Writing about art', 'Presenting work'] },
            { slug: 'digital-design', name: 'Digital Design', skills: ['Design software basics', 'Raster versus vector', 'Typography', 'Layout for screens', 'User interface design', 'Branding basics'] },
        ],
    },
    {
        id: 'music', name: 'Music Theory', emoji: '🎵', order: 200,
        description: 'Notation, rhythm, harmony and music history',
        topics: [
            { slug: 'notation', name: 'Music Notation', skills: ['Staff and clef', 'Note names', 'Note duration', 'Pitch and octave', 'Ledger lines', 'Sharps and flats', 'Key signatures'] },
            { slug: 'rhythm', name: 'Rhythm', skills: ['Beat and tempo', 'Time signatures', 'Note and rest values', 'Dotted notes', 'Ties', 'Syncopation', 'Counting rhythms'] },
            { slug: 'intervals', name: 'Intervals and Scales', skills: ['Intervals', 'Major and minor seconds', 'Perfect intervals', 'Augmented and diminished intervals', 'Major scale', 'Natural minor scale', 'Harmonic and melodic minor', 'Other scales'] },
            { slug: 'harmony', name: 'Harmony', skills: ['Triads', 'Major and minor chords', 'Chord symbols', 'Chord progressions', 'Diatonic harmony', 'Dominant seventh chords', 'Cadences', 'Four-part writing'] },
            { slug: 'history', name: 'Music History', skills: ['Medieval music', 'Renaissance music', 'Baroque music', 'Classical music', 'Romantic music', '20th century music', 'World music traditions'] },
        ],
    },
    {
        id: 'environmental-science', name: 'Environmental Science', emoji: '🌱', order: 210,
        description: 'Ecosystems, climate, sustainability and human impact',
        topics: [
            { slug: 'ecosystems', name: 'Ecosystems', skills: ['Ecosystem components', 'Energy flow', 'Nutrient cycling', 'Species interaction', 'Biodiversity', 'Succession', 'Ecological footprints'] },
            { slug: 'climate', name: 'Climate Science', skills: ['Greenhouse effect', 'Global warming', 'Carbon cycle', 'Climate data', 'Climate projections', 'Climate justice', 'Emissions', 'International climate agreements'] },
            { slug: 'human-impact', name: 'Human Impact', skills: ['Pollution types', 'Water quality', 'Air quality', 'Soil degradation', 'Deforestation', 'Waste management', 'Plastic pollution', 'Habitat loss'] },
            { slug: 'sustainability', name: 'Sustainability', skills: ['Sustainable development', 'Renewable energy', 'Water conservation', 'Sustainable agriculture', 'Circular economy', 'Environmental law', 'Individual action', 'Activism and policy'] },
        ],
    },
    {
        id: 'health', name: 'Health and Physical Education', emoji: '🏃', order: 220,
        description: 'Human health, fitness, nutrition and first aid',
        topics: [
            { slug: 'nutrition', name: 'Nutrition', skills: ['Nutrients and their functions', 'Balanced diet', 'Reading nutrition labels', 'Hydration', 'Deficiency diseases', 'Healthy portion sizes', 'Food safety'] },
            { slug: 'fitness', name: 'Fitness and Exercise', skills: ['Components of fitness', 'Cardiovascular exercise', 'Strength training', 'Flexibility', 'FITT principle', 'Exercise safety', 'Warming up and cooling down', 'Setting fitness goals'] },
            { slug: 'body-systems', name: 'Health and the Body', skills: ['Balanced diet and the body', 'Sleep and rest', 'Stress and the body', 'Immune defence', 'Infectious diseases', 'Non-communicable diseases', 'Mental health basics'] },
            { slug: 'first-aid', name: 'First Aid and Safety', skills: ['Scene safety', 'Assessing a casualty', 'CPR basics', 'Choking first aid', 'Bleeding and wounds', 'Burns', 'Fractures and sprains', 'Emergency contacts'] },
            { slug: 'substances', name: 'Substances and Choices', skills: ['Effects of smoking', 'Alcohol and the body', 'Drugs and the brain', 'Peer pressure', 'Refusal skills', 'Media literacy'] },
        ],
    },
];

/** Baseline (0005) plus the expansion module, in catalogue order. */
const CURRICULUM = [...BASELINE, ...EXPANSION].sort((a, b) => a.order - b.order);

// Guard rails: a duplicate subject id would silently collapse two subjects into
// one on insert, and a duplicate slug inside a subject would attach the wrong
// skills. Fail the build instead of shipping a subtly broken curriculum.
function assertUnique(label, keyOf) {
    const seen = new Map();
    for (const subject of CURRICULUM) {
        for (const [scope, key] of keyOf(subject)) {
            const id = `${scope}::${key}`;
            if (seen.has(id)) {
                throw new Error(
                    `Duplicate ${label} "${key}" in ${subject.id} and ${seen.get(id)}. ` +
                    `Ids and slugs must be unique (slugs unique per subject).`
                );
            }
            seen.set(id, subject.id);
        }
    }
}
assertUnique('subject id', (s) => [[s.id, s.id]]);
assertUnique('topic slug', (s) => s.topics.map((t) => [s.id, t.slug]));
assertUnique('skill name', (s) =>
    s.topics.flatMap((t) => t.skills.map((n) => [`${s.id}/${t.slug}`, n]))
);

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;

/**
 * Renders the catalogue as a typed TS module. Marketing pages use this instead
 * of querying the database: the curriculum is public, immutable per deploy, and
 * describing it should not depend on Supabase being reachable at build time.
 */
function renderCatalogue(curriculum) {
    const tq = (s) => JSON.stringify(s);
    const topics = (s) =>
        s.topics
            .map(
                (t) =>
                    `      { name: ${tq(t.name)}, slug: ${tq(t.slug)}, skills: ${t.skills.length} },`
            )
            .join('\n');
    const subjects = curriculum
        .map(
            (s) =>
                `  {\n` +
                `    id: ${tq(s.id)},\n` +
                `    name: ${tq(s.name)},\n` +
                `    emoji: ${tq(s.emoji)},\n` +
                `    description: ${tq(s.description)},\n` +
                `    order: ${s.order},\n` +
                `    topics: [\n${topics(s)}\n    ],\n` +
                `  },`
        )
        .join('\n');

    return `/**
 * GENERATED FILE — do not edit. Source of truth: scripts/generate-curriculum.mjs
 * Regenerate with: npm run curriculum
 *
 * The public subject catalogue. Names, descriptions and counts are used by the
 * marketing pages so the advertised curriculum cannot drift from what the tutor
 * actually serves.
 */

export interface CatalogueTopic {
    name: string;
    slug: string;
    /** Number of skills the tutor can generate questions from. */
    skills: number;
}

export interface CatalogueSubject {
    id: string;
    name: string;
    emoji: string;
    description: string;
    order: number;
    topics: CatalogueTopic[];
}

export const CURRICULUM: CatalogueSubject[] = [
${subjects}
];

export const CURRICULUM_STATS = {
    subjects: CURRICULUM.length,
    topics: CURRICULUM.reduce((n, s) => n + s.topics.length, 0),
    skills: CURRICULUM.reduce(
        (n, s) => n + s.topics.reduce((m, t) => m + t.skills, 0),
        0
    ),
};
`;
}

const counts = {
    subjects: CURRICULUM.length,
    topics: CURRICULUM.reduce((a, s) => a + s.topics.length, 0),
    skills: CURRICULUM.reduce((a, s) => a + s.topics.reduce((b, t) => b + t.skills.length, 0), 0),
};

const lines = [];
lines.push('-- ============================================================');
lines.push('-- AI Personal Tutor — subject expansion');
lines.push('--');
lines.push('-- GENERATED FILE. Source of truth: scripts/generate-curriculum.mjs');
lines.push('-- Re-generate with: npm run curriculum');
lines.push('--');
lines.push(`-- ${counts.subjects} subjects, ${counts.topics} topics, ${counts.skills} skills`);
lines.push('--');
lines.push('-- This re-declares the full catalogue, not just the new rows, so existing');
lines.push('-- subjects also pick up the new sort_order values used by the grouped');
lines.push('-- ordering. Every statement is idempotent, so re-running is safe.');
lines.push('-- ============================================================');
lines.push('');
lines.push('-- ---------- subjects ----------');
lines.push('insert into subjects (id, name, description, emoji, sort_order) values');
lines.push(
    CURRICULUM.map(
        (s, i) =>
            `  (${q(s.id)}, ${q(s.name)}, ${q(s.description)}, ${q(s.emoji)}, ${s.order})` +
            (i === CURRICULUM.length - 1 ? '' : ',')
    ).join('\n')
);
lines.push('on conflict (id) do update set');
lines.push('  name = excluded.name,');
lines.push('  description = excluded.description,');
lines.push('  emoji = excluded.emoji,');
lines.push('  sort_order = excluded.sort_order;');
lines.push('');

lines.push('-- ---------- topics (one row set per subject, slug-scoped) ----------');
for (const s of CURRICULUM) {
    lines.push(`-- ${s.name}`);
    lines.push('insert into topics (subject_id, name, slug, is_published) values');
    lines.push(
        s.topics
            .map(
                (t, i) =>
                    `  (${q(s.id)}, ${q(t.name)}, ${q(t.slug)}, true)` +
                    (i === s.topics.length - 1 ? '' : ',')
            )
            .join('\n')
    );
    lines.push('on conflict (subject_id, slug) do update set');
    lines.push('  name = excluded.name,');
    lines.push('  is_published = excluded.is_published;');
    lines.push('');
}

lines.push('-- ---------- skills ----------');
lines.push('-- Joined on (subject_id, slug) — NOT slug alone. Reusing a slug such as');
lines.push('-- \'fractions\' or \'writing\' across subjects is safe.');
lines.push('insert into skills (topic_id, name, order_index)');
lines.push('select t.id, s.name, s.idx');
lines.push('from topics t');
lines.push('join (values');
const rows = [];
for (const s of CURRICULUM) {
    for (const t of s.topics) {
        t.skills.forEach((name, i) => {
            rows.push(`  (${q(s.id)}, ${q(t.slug)}, ${q(name)}, ${i + 1})`);
        });
    }
}
lines.push(rows.join(',\n'));
lines.push(') as s(subject_id, slug, name, idx)');
lines.push('  on s.subject_id = t.subject_id and s.slug = t.slug');
lines.push('where not exists (');
lines.push('  select 1 from skills k');
lines.push('  where k.topic_id = t.id and k.name = s.name');
lines.push(');');
lines.push('');

// ---------------------------------------------------------------- artefacts
const outDir = join(dirname(fileURLToPath(import.meta.url)), '..');

writeFileSync(
    join(outDir, 'supabase/migrations/0008_subject_expansion.sql'),
    lines.join('\n') + '\n'
);

writeFileSync(join(outDir, 'lib/curriculum.generated.ts'), renderCatalogue(CURRICULUM));

// ---------------------------------------------------------------- reporting
const slugs = new Map();
for (const s of CURRICULUM) for (const t of s.topics) {
    slugs.set(t.slug, (slugs.get(t.slug) ?? 0) + 1);
}
const shared = [...slugs.entries()].filter(([, n]) => n > 1);

console.error(`\nsubjects=${counts.subjects} topics=${counts.topics} skills=${counts.skills}`);
console.error(`baseline=${BASELINE.length} expansion=${EXPANSION.length}`);
console.error(
    `slugs reused across subjects: ${shared.length} ` +
        `(${shared.slice(0, 8).map(([s, n]) => `${s}x${n}`).join(', ')}${shared.length > 8 ? ', ...' : ''})`
);
console.error('wrote supabase/migrations/0008_subject_expansion.sql');
console.error('wrote lib/curriculum.generated.ts');