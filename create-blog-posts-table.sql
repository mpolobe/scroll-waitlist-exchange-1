
-- Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  category TEXT,
  author TEXT,
  date TEXT,
  image TEXT,
  read_time TEXT,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DROP POLICY IF EXISTS "Public can view blog posts" ON public.blog_posts;
CREATE POLICY "Public can view blog posts" ON public.blog_posts FOR SELECT USING (true);

-- Insert initial data
INSERT INTO public.blog_posts (id, title, excerpt, content, category, author, date, image, read_time, featured)
VALUES
  (
    'tazara-railway-50-years',
    'The TAZARA Turns 50: Riding the Railway That Bridges Tanzania and Zambia',
    'A journey through 50 years of history on the Tanzania-Zambia Railway Authority line, exploring its challenges, significance, and future prospects with major Chinese investment.',
    'In Dar es Salaam''s train station, hundreds of passengers sat amid piles of luggage as a listless breeze blew through the open windows. Shortly before their scheduled 3:50pm departure on the Tanzania-Zambia Railway Authority''s (TAZARA) Mukuba Express train, an update crackled over the tannoy: the train would be leaving two hours late.\n\nA collective groan rippled through the crowd, and under the soaring roof of the station, pigeons darted back and forth, disappearing into holes left from rotted-out ceiling tiles. But nobody was really surprised. Given the train''s reputation for unreliable service, the passengers knew a two-hour delay for the TAZARA was practically on time.\n\nThe railway runs from Tanzania''s largest city through the country''s southern highlands and across the border into Zambia''s copper provinces, finally pulling into the town of Kapiri Mposhi some 1,860 kilometres (1,156 miles) away. It''s a journey that, according to official timetables, should take about 40 hours.\n\nFor regular passengers, it''s a cheap way to reach parts of the country that are not located near main highways. For foreign tourists, it''s a unique way to see Tanzania''s landscapes far from the bustling cities and overcrowded safari parks, provided they are not in a hurry. A first-class sleeper car all the way to Mbeya, a travel hub and border town just to the east of Zambia, surrounded by lush mountains and coffee farms, is just over $20.\n\nThis year, the railroad celebrated its 50th anniversary, but it has struggled for most of its existence, requiring foreign investment for basic upkeep and failing to haul the amount of freight it was built to carry. Inconsistent maintenance and limited investment have seen its infrastructure and cars deteriorate from decades of use.\n\nIt''s hard to determine exactly where a trip on the TAZARA will be at any given time, due to the myriad delays and breakdowns that randomise each journey. Simple derailments from poorly loaded cars and deteriorating tracks are common, and then there''s the occasional unfortunate brush with nature — in August, service was cancelled after a passenger train struck an African buffalo while passing through Tanzania''s Mwalimu Julius Nyerere National Park.\n\nBut since the beginning of 2025, the TAZARA has been plagued by more serious incidents — and fatalities — that reveal the desperate need for an overhaul of both ageing infrastructure and poor safety management. In April, two locomotives being moved from Zambia to a workshop in Mbeya for repairs derailed at a bridge in southern Tanzania, killing both drivers.\n\nTwo months later, in June, a train derailed in Zambia and was then struck by the "rescue train" dispatched to assist it. The collision killed one TAZARA employee and injured 10 staff and 19 passengers, according to a media release from the railway.\n\nCiting "unexpected operational challenges," passenger service was briefly suspended in early September. As it turned out, the few operational locomotives the TAZARA could field were stuck in Tanzania, after a fire damaged one of the hundreds of bridges along the track.\n\nBut big improvements for TAZARA are on the horizon, thanks to a major investment by the China Civil Engineering Construction Corporation (CCECC), which has pledged $1.4bn to refurbish the ageing rail line over the next three years. Though the continuation of passenger service is mentioned in the agreement, construction work will necessitate some pauses to regular service as the project is completed.\n\nMost of the money will be spent on rehabilitating the tracks, but $400m will go toward 32 new locomotives and 762 wagons, "significantly increasing freight and passenger transport capacity," according to a TAZARA statement. In return, the Chinese state-owned corporation will receive a 30-year concession to run the TAZARA railway and recoup its investment before turning day-to-day management back over to Tanzanian and Zambian authorities.\n\n---\n\n*Article by Paul Stremple with photos by Kang-Chun Cheng. Originally published by Al Jazeera. [Read the full story on Al Jazeera](https://www.aljazeera.com/features/longform/2025/12/28/the-tazara-turns-50-riding-the-railway-that-bridges-tanzania-and-zambia)*',
    'Infrastructure',
    'Paul Stremple',
    'Dec 28, 2024',
    'https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764285109834_4d14e31e.webp',
    '8 min read',
    TRUE
  ),
  (
    'africoin-launch-2024',
    'Africoin Officially Launches Across 15 African Countries',
    'We are thrilled to announce the official launch of Africoin, bringing seamless cryptocurrency payments to millions across Africa.',
    'Full article content here...',
    'Company News',
    'Sarah Okonkwo',
    'Nov 20, 2024',
    'https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764285109834_4d14e31e.webp',
    '5 min read',
    TRUE
  ),
  (
    'mobile-money-integration',
    'How Mobile Money is Revolutionizing African Finance',
    'Exploring the explosive growth of mobile money platforms and their impact on financial inclusion across the continent.',
    'Full article content...',
    'Fintech Trends',
    'James Mwangi',
    'Nov 18, 2024',
    'https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764285110803_c14d926f.webp',
    '7 min read',
    TRUE
  ),
  (
    'crypto-basics-beginners',
    'Cryptocurrency 101: A Beginner''s Guide for Africans',
    'Everything you need to know about cryptocurrency, blockchain, and how to get started with digital currencies.',
    'Full article content...',
    'Education',
    'Amara Diop',
    'Nov 15, 2024',
    'https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764285111680_3d3e2615.webp',
    '10 min read',
    FALSE
  ),
  (
    'digital-payments-markets',
    'Digital Payments Transform Traditional African Markets',
    'How vendors and small businesses are adopting digital payment solutions to reach more customers.',
    'Full article content...',
    'Case Studies',
    'Kofi Mensah',
    'Nov 12, 2024',
    'https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764285112788_f2d50abf.webp',
    '6 min read',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;
