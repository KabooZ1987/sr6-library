--
-- PostgreSQL database dump
--

-- Dumped from database version 16.2 (Debian 16.2-1.pgdg110+2)
-- Dumped by pg_dump version 16.2 (Debian 16.2-1.pgdg110+2)

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

--
-- Name: action_type; Type: TYPE; Schema: public; Owner: webuser
--

CREATE TYPE public.action_type AS ENUM (
    'minor',
    'major',
    'free',
    'whole_round'
);


ALTER TYPE public.action_type OWNER TO webuser;

--
-- Name: attribute; Type: TYPE; Schema: public; Owner: webuser
--

CREATE TYPE public.attribute AS ENUM (
    'body',
    'agility',
    'reflex',
    'strength',
    'willpower',
    'logic',
    'intuition',
    'charisma',
    'magic',
    'resonance',
    'edge',
    'essence'
);


ALTER TYPE public.attribute OWNER TO webuser;

--
-- Name: edge_action_restriction; Type: TYPE; Schema: public; Owner: webuser
--

CREATE TYPE public.edge_action_restriction AS ENUM (
    'melee_attack',
    'ranged_attack',
    'any_attack',
    'any',
    'specific',
    'block',
    'ranged_attack_from_cover',
    'use_skill',
    'multi_attack'
);


ALTER TYPE public.edge_action_restriction OWNER TO webuser;

--
-- Name: rule_category; Type: TYPE; Schema: public; Owner: webuser
--

CREATE TYPE public.rule_category AS ENUM (
    'edge',
    'magic',
    'combat',
    'decking',
    'rigging',
    'regeneration',
    'critter',
    'spirits',
    'other'
);


ALTER TYPE public.rule_category OWNER TO webuser;

--
-- Name: skill; Type: TYPE; Schema: public; Owner: webuser
--

CREATE TYPE public.skill AS ENUM (
    'astral',
    'athletics',
    'biotech',
    'close_combat',
    'con',
    'conjuring',
    'cracking',
    'electronics',
    'enchanting',
    'engineering',
    'firearms',
    'influence',
    'outdoors',
    'perception',
    'piloting',
    'sorcery',
    'stealth',
    'tasking',
    'exotic_weapons',
    'other'
);


ALTER TYPE public.skill OWNER TO webuser;

--
-- Name: source_book; Type: TYPE; Schema: public; Owner: webuser
--

CREATE TYPE public.source_book AS ENUM (
    'core',
    'wyrd',
    'wild_life',
    'firing_squad',
    'companion',
    'body_shop',
    'shifter',
    'homebrew'
);


ALTER TYPE public.source_book OWNER TO webuser;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Action; Type: TABLE; Schema: public; Owner: webuser
--

CREATE TABLE public."Action" (
    id text NOT NULL,
    name text NOT NULL,
    type public.action_type NOT NULL,
    homebrew boolean NOT NULL,
    attribute public.attribute,
    skill public.skill,
    description text NOT NULL,
    source public.source_book,
    page integer,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "imageId" integer
);


ALTER TABLE public."Action" OWNER TO webuser;

--
-- Name: EdgeAction; Type: TABLE; Schema: public; Owner: webuser
--

CREATE TABLE public."EdgeAction" (
    id text NOT NULL,
    name text NOT NULL,
    cost integer NOT NULL,
    restriction public.edge_action_restriction NOT NULL,
    description text NOT NULL,
    source public.source_book NOT NULL,
    page integer NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "imageId" integer
);


ALTER TABLE public."EdgeAction" OWNER TO webuser;

--
-- Name: EdgeBoost; Type: TABLE; Schema: public; Owner: webuser
--

CREATE TABLE public."EdgeBoost" (
    id text NOT NULL,
    name text NOT NULL,
    cost integer NOT NULL,
    description text NOT NULL,
    source public.source_book NOT NULL,
    page integer NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "imageId" integer
);


ALTER TABLE public."EdgeBoost" OWNER TO webuser;

--
-- Name: Homebrew; Type: TABLE; Schema: public; Owner: webuser
--

CREATE TABLE public."Homebrew" (
    id text NOT NULL,
    category public.rule_category NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "imageId" integer
);


ALTER TABLE public."Homebrew" OWNER TO webuser;

--
-- Name: Image; Type: TABLE; Schema: public; Owner: webuser
--

CREATE TABLE public."Image" (
    id integer NOT NULL,
    image bytea NOT NULL,
    hash text NOT NULL
);


ALTER TABLE public."Image" OWNER TO webuser;

--
-- Name: Image_id_seq; Type: SEQUENCE; Schema: public; Owner: webuser
--

CREATE SEQUENCE public."Image_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Image_id_seq" OWNER TO webuser;

--
-- Name: Image_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: webuser
--

ALTER SEQUENCE public."Image_id_seq" OWNED BY public."Image".id;


--
-- Name: Rule; Type: TABLE; Schema: public; Owner: webuser
--

CREATE TABLE public."Rule" (
    id text NOT NULL,
    category public.rule_category NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    homebrew boolean DEFAULT false NOT NULL,
    source public.source_book,
    page integer
);


ALTER TABLE public."Rule" OWNER TO webuser;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: webuser
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO webuser;

--
-- Name: Image id; Type: DEFAULT; Schema: public; Owner: webuser
--

ALTER TABLE ONLY public."Image" ALTER COLUMN id SET DEFAULT nextval('public."Image_id_seq"'::regclass);


--
-- Data for Name: Action; Type: TABLE DATA; Schema: public; Owner: webuser
--

COPY public."Action" (id, name, type, homebrew, attribute, skill, description, source, page, updated_at, "imageId") FROM stdin;
cm3xiyou000013osv8ihukc1p	Avoid Incoming	minor	f	reflex	athletics	 A character can use this action when it is not \ntheir player turn to get away from an incoming \nBlast or Gas attack. With this action, a character \nmakes a Reaction + Athletics – Dodge Penalty roll \n(see Dodge Penalty table, p. 311, for these values). \nHits on the test allow a character to move a num\nber of meters equal to their hits in a direction of \ntheir choosing, but they shouldn’t know the results \nof the scatter until after they decide which way \nthey’re headed. If they choose to move more than \n2 meters, they dive to the ground at the end of their \ndefense and gain the Prone status. This action can\nnot be used if the character has taken a previous \nAvoid Incoming, Move, or Sprint action this com\nbat round and prevents the use of another Avoid \nIncoming, Move, or Sprint action for the remainder \nof the combat round.	core	41	2024-11-25 21:13:12.432	\N
\.


--
-- Data for Name: EdgeAction; Type: TABLE DATA; Schema: public; Owner: webuser
--

COPY public."EdgeAction" (id, name, cost, restriction, description, source, page, updated_at, "imageId") FROM stdin;
cluywiva100011k3bv6om21yt	Anticipation	4	multi_attack	 For you combat is like a game of\nchess, and you’re several moves ahead of\nthe opposition. When performing this Mul-\ntiple Attack, double your full dice pool and\nthen split it as evenly as possible for each\ndifferent target. Cost: 4 Edge\n\nalso usable for ranged attacks	core	47	2024-04-14 02:22:59.366	\N
c5f18d73-e4cf-4941-890d-debddbe291f7	Big Speech	4	specific	(Use Skill [Influence]): A torrent\nof words flows from your mouth, reaching\nheights of eloquence and inspiration mor-\ntals rarely hit. Roll your Influence + Cha-\nrisma test twice; the first time it counts as a\nTeamwork test, meaning you can add your\nhits to the dice pool for the second roll. The\nsecond roll acts as your hits for the test.\nCost: 4 Edge	core	47	2024-04-14 02:23:31.448	\N
acde5e63-98f8-4cd2-818b-14c566ca3837	Bring the Drama	2	specific	(Use Skill [Con]): While\nspinning your con, you get to a part where\nextra drama would be appropriate, and\nyou bring it. Maybe it’s a dramatic speech,\nmaybe it’s some tears or sorrowful histri-\nonics, but whatever the case, you take ac-\ntion to tug at the heartstrings of the mark\nand bring them to your side. For a quick\ncon, this can bring in 200 nuyen from on-\nlookers. When used as part of a longer-term\ncon, you can increase your asking price by\ntwenty percent, and the mark will agree to\nit. Cost: 2 Edge	core	47	2024-04-14 02:23:50.393	\N
23931ad4-3e47-448a-9c44-a8655591ed02	Called Shot—Disarm	5	any_attack	 Successful hit does no damage to target, but their\nweapon is knocked from their hands. Cost:\n5 Edge.	core	47	2024-04-14 02:24:19.364	\N
f49156d4-ef43-41b4-83ee-965808a01d18	Called Shot—Vitals	5	any_attack	The attack\ngoes for the vitals, adding 3 extra damage if\nit hits (along with net hits, as usual). Cost:\n5 Edge	core	47	2024-04-14 02:24:36.243	\N
c7c5d1bc-6aab-4583-8424-e5c4a99d25cd	Fire from Cover	2	ranged_attack_from_cover	 (Ranged Attack, must be in\nCover IV): You sneak an attack out while\nmaintaining your cover. Attacks from cover\nmay be made without spending a Minor Ac-\ntion. Cost: 2 Edge	core	47	2024-04-14 02:25:03.495	\N
7236890a-2108-48d6-b7b1-c1a3066287bf	Knockout Blow	2	melee_attack	You use your advantage to truly bring the hurt on\nan opponent. If your inflicted damage of any\ntype is greater than the target’s Willpower,\nimmediately fill up the Stun Condition Monitor.\nThe target is unconscious. No damage overflows to the Physical Condition Monitor.\nCost: 2 Edge	core	47	2024-04-14 02:25:58.2	\N
d92789b9-5e2c-4d64-982d-9ca1d6874f3a	Shank	1	melee_attack	When attacking with a blade, your advantage turns into a targeted strike.\nReduce the Call a Shot penalty to –2.\nCost: 1 Edge	core	48	2024-04-14 02:26:27.075	\N
b8ae1668-0f70-4404-8e64-c5f342e0f42d	Sudden Insight	1	any	Perform an action in\nwhich you have no skill levels without pen-\nalty. This does not allow you to use skills\nthat cannot be performed untrained. Cost:\n1 Edge	core	48	2024-04-14 02:26:45.589	\N
9f97d077-6e08-44af-8aa4-e14796793065	Tactical Roll	1	specific	(Hit the Dirt): You drop to\navoid incoming fire, with an agile roll that\nhelps you make an attack as you roll. If you\nuse a melee Attack action on the same com-\nbat round, you do not get the dice pool pen-\nalty that comes with the Prone status (p. 53)\nor Hit the Dirt Action (p. 41). For the next\nround, you do not take the –2 dice pool pen-\nalty from Close or Near attacks that come\nwith the Prone status. Cost: 1 Edge	core	48	2024-04-14 02:27:09.992	\N
4385a9d2-688c-42a3-8a2d-f7921cfdea37	Tumble	1	melee_attack	Your advantages\ncombine to give you the chance to not just\nhurt your opponent but bring them to the\nground. If the damage being inflicted on a\ntarget is greater than the target’s Body, they\nare brought down, giving them the Prone\nstatus. Cost: 1 Edge	core	48	2024-04-14 02:27:27.189	\N
eb641540-8a22-4fbf-b7dd-0eb5c4abee52	Wrest	2	block	 When in melee combat, if you\nsuccessfully Block an attack, you can use\nthis action to wrest your opponent’s weapon\naway. Roll Close Combat + Agility, with the\nattacker’s Strength as the threshold. If you\nequal the threshold, you knock the weapon\nout of their hands, and it falls to the ground.\nIf you get more hits, you take the weapon\nfrom them. If you get fewer hits, the attacker\nretains the weapon. Cost: 2 Edge	core	48	2024-04-14 02:27:53.999	\N
043d1690-4e02-49e9-95ce-76444185c262	Through and Through	9	ranged_attack	(APDS, caseless, and\nstandard ammo): In ballistics, this phrase refers\nto a bullet passing completely through a target,\nleaving both entry and exit wounds. This results\nin the firearm’s DV, including ammo modifica-\ntions, being increased by half rounded up. Edge\ncost: Body of the target (APDS reduces this cost\nby 2, minimum cost of 1).	companion	144	2024-08-23 17:03:18.352	\N
8c7e84d3-5f67-489f-9b00-5fbbd9df98ce	Shotgun Choke	2	ranged_attack	shotgun flechette ammo:\nWhen using flechette ammo in a shotgun and fir-\ning at targets at Close or Near range, you may\nwiden the choke to perform a BF wide burst (p.\n109, SR6) that only consumes one shell, even if\nthe shotgun lacks the BF firing mode. Edge cost: 2\n(1 for smartguns)	companion	144	2024-08-23 17:04:07.915	\N
01de8ba4-627f-41ef-b11c-902eab93623b	Silent Takedown	1	melee_attack	(Melee attack): A staple of\ncovert action is the silent takedown where the\nprotagonist sneaks up behind a nameless sentry\nand eliminates them with a deft attack, typically\nby snapping their neck. To perform a Silent Take-\ndown, make a Simple test using the weapon’s rele-\nvant Skill + Agility with a threshold of 4. If success-\nful, the target’s condition monitor is completely\nfilled. This Edge action can only target grunts (p.\n203, SR6) who are within melee reach and are not\naware of the attacker’s presence at all; simply be-\ning invisible or hidden from view does not neces-\nsarily permit a Silent Takedown. Edge cost equals\nProfessional Rating, minimum of 1.	companion	144	2024-08-23 17:04:43.445	\N
080ee5c4-2af2-4b2f-a7c9-aa8334e5f29f	It’s A Dud!	5	specific	(blast attack): Whether via manu-\nfacturing defect, a mechanical malfunction, or the\nsupernatural intervention by unknown forces, a\nblast weapon such as a grenade or rocket simply\nfails to detonate after it is delivered. This Edge\nboost must be spent immediately after scatter is\nresolved. The blast effect is canceled. Edge cost: 5	companion	144	2024-08-23 17:05:10.282	\N
\.


--
-- Data for Name: EdgeBoost; Type: TABLE DATA; Schema: public; Owner: webuser
--

COPY public."EdgeBoost" (id, name, cost, description, source, page, updated_at, "imageId") FROM stdin;
8309b35f-264e-4d63-890c-4da545dd1e0f	Add 3 to your Initiative Score	1	 This one kicks\nin before combat even starts. You can choose\nto spend one point of Edge to increase your\nInitiative Score by 3. It can also be used\nduring the fight if you want to move up in\nthe order on the next Initiative Cycle.	core	44	2024-08-23 16:56:14.187	\N
27a78b06-b975-40d7-8d48-c9f28774956e	Use an Edge Action	1	You can choose to use\none of the 1-Edge Actions described in the\nEdge Action section.	core	44	2024-08-23 16:56:29.116	\N
6d6256c8-c362-4502-a87d-ab8737db4ee2	+1 to a single die roll	2	You get to add 1 to a\nsingle die. Maybe that’s making a 4 a 5 to get\nanother hit, or making 1 a 2 to avoid a glitch.	core	44	2024-08-23 16:56:49.795	\N
f3ede4f7-5eb7-4cee-9dc1-831d94c69e20	Give ally 1 Edge	2	You do something that\noffers an advantage for another member\nof your team. Take away two of your own\nEdge, and give one to a teammate.	core	44	2024-08-23 16:57:04.982	\N
074f1fd0-65f8-42c2-81b7-d028721ff399	Negate 1 Edge of a foe	2	No sense in letting the\nbad guys get the best of you if you don’t need\nto. You spend two of your own Edge, but one\nvanishes from the opponent of your choice.	core	46	2024-08-23 16:57:26.148	\N
c341b639-8de1-4922-8d7f-17112334a27c	Use an Edge Action	2	You can choose to use\none of the 2-Edge Actions described in the\nEdge Action section	core	46	2024-08-23 16:57:43.688	\N
c91299ce-1fbf-4159-8127-23ddc456e450	Buy one automatic hit	3	You get an automatic\nhit. This one adds on to the total hits you\nroll. This isn’t an automatic success at what-\never test you’re attempting, just another hit\nto add to your total.	core	47	2024-08-23 16:58:08.988	\N
cm06yduiw00003osvq8v1jru5	Reroll one die	1	Pick any die and reroll it. It\ncan be yours or your opponent’s, but the re-\nsult stands no matter what you roll. This is\ndone after all rolls have been made.	core	44	2024-08-23 16:55:56.413	\N
8ce0cf60-4ba1-4fdb-875c-f70546dbff60	Heal one box of Stun damage	3	You catch a\nsecond wind and clear a box from your Stun\nCondition Monitor.	core	47	2024-08-23 16:58:24.497	\N
64504708-e1ad-4a23-8eb0-85413e44eba5	Add Edge to your dice pool	4	Add your Edge\nas a dice pool bonus to your roll, and make\n6s explode. “Exploding” means that 6s count\nas a hit and can be rerolled in an attempt to\nget an additional hit. If another hit is scored,\ntack it on; if another 6 is rolled, tack on a hit\nand roll it again. Keep the hits coming! If a 1\nis rolled after a 6, it does not count toward\nyour total for calculating glitches.	core	47	2024-08-23 16:58:42.48	\N
d6e50661-2fde-4591-98a6-b30e87daf5f0	Heal 1 point of Physical damage	4	You take\noff a single box of damage from your Phys-\nical Condition Monitor—your advantage\nover your opponents means they didn’t hit\nyou quite as hard as they first thought.	core	47	2024-08-23 16:58:56.911	\N
254631df-7d63-43e9-beb5-75ed100c8401	Reroll all failed dice	4	Pretty much what it\nsays—after a roll is made, you can reroll all\nfailed dice. This Edge Boost cannot be used\nif a glitch or critical glitch is rolled.	core	47	2024-08-23 16:59:15.165	\N
cde1a7cd-1e2b-4c5c-89a0-376446db6268	Use an Edge Action	4	You can choose to use\none of the 4-Edge Actions described in the\nEdge Action section.	core	47	2024-08-23 16:59:40.937	\N
5f9af971-f703-4b09-a254-61f4e6959447	Count 2s as glitches for the target	5	Time to\nget counteroffensive! When an opponent\nrolls, both 1s and 2s count in their total to\ndetermine if they glitch or critical glitch.	core	47	2024-08-23 17:00:03.688	\N
d0201c9b-f4e8-43a3-94a1-4b6c52aaf9d0	Create special effect	5	Bring your creativity\nto the table! You spend this Edge and some-\nthing fortuitous happens. It’s up to you and\nyour gamemaster to determine what it is, but\nit should certainly turn the tides slightly in\nyour favor. Burst pipes, approaching sirens,\nincoming DocWagon, an angry spirit, some-\nthing that adds a little more oomph to your\nside or puts a little stress on the enemy.	core	47	2024-08-23 17:00:21.981	\N
fda71693-97a1-4dc0-b83b-be232f23de72	Use an Edge Action	5	You can choose to use\none of the 5-Edge Actions described in the\nEdge Action section.	core	47	2024-08-23 17:00:43.056	\N
\.


--
-- Data for Name: Homebrew; Type: TABLE DATA; Schema: public; Owner: webuser
--

COPY public."Homebrew" (id, category, name, description, updated_at, "imageId") FROM stdin;
clv787z1f0009oi4kh8tejbay	other	Knowledge improved	Knowledge also means you know about things\ne.g. : knowing about weapons means it's more likely you have heard about a manufacturer or even a specific model and it's way more likely you know where to buy something	2024-04-19 22:12:50.487	\N
7adc1bce-57bd-4b40-af6b-3100cb736d7e	magic	Searching Magic Formula	Own Tradition like in the book:\nFocus formula As focus Focus cost x 0.25\nRitual Spellcasting 3L 1,000¥\n\nSpell formula\nCombat 3L 2,000¥\nDetection 2L 500¥\nHealth 2L 500¥\nIllusion 3L 1,000¥\nManipulation 3L 1,500¥\n\nin other traditions +4	2024-05-14 20:53:15.734	\N
ff4bd9df-6d5e-428c-bb4c-8b28b9086093	edge	Attribute mastery	Positive Quality:\n\nGain 1 lasting Edge for selected attribute. (Select the attribute at gaining the quality)	2024-05-01 20:24:23.563	\N
f1e4c80b-31a9-4d8f-a9b7-3cd9e3f765b9	other	Selling Illegal	BuildCost * 3 (bei loyalty 5)	2024-06-23 08:57:32.431	\N
b4048532-06a0-4a28-b0b9-a1769a61fa72	other	Exotic Weapons	Can be a specialization on a normal weapon class if the exotic weapon is similar enough.	2024-11-05 22:05:23.342	\N
\.


--
-- Data for Name: Image; Type: TABLE DATA; Schema: public; Owner: webuser
--

COPY public."Image" (id, image, hash) FROM stdin;
\.


--
-- Data for Name: Rule; Type: TABLE DATA; Schema: public; Owner: webuser
--

COPY public."Rule" (id, category, name, description, updated_at, homebrew, source, page) FROM stdin;
cluyn5paz0001cw0lfn2l3lm8	other	Buy Hits	Dice pool / 4 rounded down, no edge possible	2024-04-13 22:00:48.874	f	core	36
c115e7f3-1c53-4222-b4d3-8e944992cf2f	other	Try again	Non Combat actions only\nTry again if possible, a malus of an additional -2 gets applied every try\nThe malus goes away after a "significant time"	2024-04-13 22:11:09.963	f	core	36
351866ae-146f-45c0-92ad-c63402201f83	combat	Number of Actions	Every Character has 1 Minor and 1 Major action\nand gets 1 additional Minor action per Initiative Die they have.\n\n1 Major action can be used as a Minor action\nand 4 Minor actions can be used as a Major action	2024-04-14 02:03:23.716	f	core	40
eaa62161-90c2-46d7-b18b-130586a1d641	edge	Gaining Edge	No Player may gain more than 2 Edge per Round.\nEdge can be gained in an Encounter.\nEdge can be gained on actions in comparison for example Attack rating vs Defense rating on the Attack action. \nSocial Encounters are gained based on Attitude, Bearing or social force.\nIn addition to mechanics good gameplay, funny insightful, awesome or brilliant moves should be rewarded with Edge.\n\nEdge limit is 7, out of Confrontations the character attribute\n\nEdge can not be an expected reward, and should never be given when asked.	2024-04-14 02:13:26.209	f	core	45
e874048b-3ba4-4af6-b772-8ece05a32e11	edge	Burn Edge	Sometimes you need to use Edge in an act of\ntotal desperation, a last-ditch measure to stay\nalive. These uses are so extreme that you perma-\nnently lose 1 point of Edge rank (even taking it\ndown to zero if you so choose). You also spend all\naccumulated Edge. Spent Edge can be re-earned,\nand burned Edge can eventually be bought back\nwith Karma (the currency for character advance-\nment). Edge can be burned even at times when\nEdge normally cannot be spent.\n\nHere are the uses of burning Edge:\n\nSmackdown: Sometimes you want—or desper-\nately need—the blow you’re taking to definitely\nhit, and hit hard. Smackdown counts as an auto-\nmatic success on whatever test you were about to\nmake, with four net hits to boot. This has to be\na test the character is capable of performing—it\ncannot, for example, be a spellcasting test for a\nnon-Awakened character, or a skill test involving\na skill that the character does not have and that\ncannot be used untrained.\n\nNot Dead Yet: Just when it looks like you’re\nabout to shuffle off this mortal coil, you make a\nmove that buys you a little bit more life. Maybe it’s\nthe oddly cushioned awning that saves you during\na free-fall, or the implanted cyberdeck in your head\nthat happens to deflect a bullet just enough to keep\nyou alive, but something that would be about to kill\nyou instead allows you to live. Use Not Dead Yet\nwhen death is imminent for the character; burning\nthe point of Edge allows you to survive the killing\nblow, though it does not necessarily remove you\nfrom the situation that put your life in danger in the\nfirst place (if, say, you were wearing cement shoes at\nthe bottom of the Puget Sound, burning Edge might\nallow you to find an old, discarded scuba tank, but\nit won’t automatically get you out from under wa-\nter). Used judiciously, Not Dead Yet can give you a\nchance to stay alive. Used unwisely, and it’s just one\nmore bit of flailing before your character goes to\nthat big dark alley in the sky.	2024-04-14 02:28:51.391	f	core	48
50c8ba11-7ee2-44b3-9eac-13f68992f46e	other	Wild Die	In the description of certain gear, spells, and\nqualities you’ll find a reference to the wild die. This\nlittle wonder can make or break a move. When a\nwild die is in play, use a different color or easily identifiable die to track the result. The die adds\ninto the pool directly and a hit with the wild die\n(5 or 6) counts as 3 hits instead of just 1. On the\ndownside, a 1 cancels all the 5s rolled. A 2, 3, or 4\non the wild die means nothing.\nIf Edge is being used and 6s explode, a 6 on the\nwild die counts as 3 hits and can then be rerolled.\nAny additional hits, rolled 1s, or re-rolls are count-\ned as a regular die, not a wild die.	2024-04-14 02:30:43.999	f	core	48
c0ae101a-d3ed-4f3b-8f85-dfc2d3b902ab	combat	Weapon Skill	Appropriate weapon skill is best suited for the attack they described, be it \n- punch, kick, knife, sword, axe, broken bottle,\nlead pipe, candlestick (Close Combat);\n- pistol, rifle, shotgun, sniper rifle, zip gun (Firearms);\n- blowgun, laser pistol, ray gun, grenade launcher,\n- missile launcher (Exotic Weapon); or a thrown\nknife, shuriken, or hand grenade (Athletics);\n- vehicle-mounted weapon (Engineering).\nThough that last one goes with Logic, not Agility (the better to calculate all the angles and geometry that comes from firing from a vehicle).	2024-05-04 18:15:47.665	f	core	\N
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: webuser
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
eb4adfc8-690d-4f9a-acd3-0096feacf6ce	229eee415f014b6825593af2c2dfe1c6ef27e556c8b91bbd391221ce2f75bacf	2024-03-14 19:34:22.388518+01	20240314183422_init	\N	\N	2024-03-14 19:34:22.281674+01	1
10272086-8cc9-47f8-9112-c1184e492ad5	43abc1fd44b2766afe0f113128998a003f0b59a05fb635ec44b1d31c96f6f0ef	2024-03-15 12:50:22.862978+01	20240315115022_minor_fix	\N	\N	2024-03-15 12:50:22.849785+01	1
2e3b28ce-c1bc-4fe6-bf82-9aa46fbf4d4e	07246e17eb4123e941cddbb3ec94e409251e031a38a50f9392f2ac538d90d965	2024-04-17 19:38:26.724915+02	20240417173826_actions	\N	\N	2024-04-17 19:38:26.592878+02	1
2ee1ca54-70f0-4b1f-a8ce-0e80fa2a653f	e7568f2d824ae2c1f8e07fc2ae6105c52a1539a5d80acd48cca6b21e50263eb7	2024-06-18 17:19:36.331721+02	20240618151936_adding_images	\N	\N	2024-06-18 17:19:36.160931+02	1
\.


--
-- Name: Image_id_seq; Type: SEQUENCE SET; Schema: public; Owner: webuser
--

SELECT pg_catalog.setval('public."Image_id_seq"', 1, false);


--
-- Name: Action Action_pkey; Type: CONSTRAINT; Schema: public; Owner: webuser
--

ALTER TABLE ONLY public."Action"
    ADD CONSTRAINT "Action_pkey" PRIMARY KEY (id);


--
-- Name: EdgeAction EdgeAction_pkey; Type: CONSTRAINT; Schema: public; Owner: webuser
--

ALTER TABLE ONLY public."EdgeAction"
    ADD CONSTRAINT "EdgeAction_pkey" PRIMARY KEY (id);


--
-- Name: EdgeBoost EdgeBoost_pkey; Type: CONSTRAINT; Schema: public; Owner: webuser
--

ALTER TABLE ONLY public."EdgeBoost"
    ADD CONSTRAINT "EdgeBoost_pkey" PRIMARY KEY (id);


--
-- Name: Homebrew Homebrew_pkey; Type: CONSTRAINT; Schema: public; Owner: webuser
--

ALTER TABLE ONLY public."Homebrew"
    ADD CONSTRAINT "Homebrew_pkey" PRIMARY KEY (id);


--
-- Name: Image Image_pkey; Type: CONSTRAINT; Schema: public; Owner: webuser
--

ALTER TABLE ONLY public."Image"
    ADD CONSTRAINT "Image_pkey" PRIMARY KEY (id);


--
-- Name: Rule Rule_pkey; Type: CONSTRAINT; Schema: public; Owner: webuser
--

ALTER TABLE ONLY public."Rule"
    ADD CONSTRAINT "Rule_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: webuser
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Action_id_key; Type: INDEX; Schema: public; Owner: webuser
--

CREATE UNIQUE INDEX "Action_id_key" ON public."Action" USING btree (id);


--
-- Name: EdgeAction_id_key; Type: INDEX; Schema: public; Owner: webuser
--

CREATE UNIQUE INDEX "EdgeAction_id_key" ON public."EdgeAction" USING btree (id);


--
-- Name: EdgeBoost_id_key; Type: INDEX; Schema: public; Owner: webuser
--

CREATE UNIQUE INDEX "EdgeBoost_id_key" ON public."EdgeBoost" USING btree (id);


--
-- Name: Homebrew_id_key; Type: INDEX; Schema: public; Owner: webuser
--

CREATE UNIQUE INDEX "Homebrew_id_key" ON public."Homebrew" USING btree (id);


--
-- Name: Image_id_key; Type: INDEX; Schema: public; Owner: webuser
--

CREATE UNIQUE INDEX "Image_id_key" ON public."Image" USING btree (id);


--
-- Name: Rule_id_key; Type: INDEX; Schema: public; Owner: webuser
--

CREATE UNIQUE INDEX "Rule_id_key" ON public."Rule" USING btree (id);


--
-- Name: Action Action_imageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: webuser
--

ALTER TABLE ONLY public."Action"
    ADD CONSTRAINT "Action_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES public."Image"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: EdgeAction EdgeAction_imageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: webuser
--

ALTER TABLE ONLY public."EdgeAction"
    ADD CONSTRAINT "EdgeAction_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES public."Image"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: EdgeBoost EdgeBoost_imageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: webuser
--

ALTER TABLE ONLY public."EdgeBoost"
    ADD CONSTRAINT "EdgeBoost_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES public."Image"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Homebrew Homebrew_imageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: webuser
--

ALTER TABLE ONLY public."Homebrew"
    ADD CONSTRAINT "Homebrew_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES public."Image"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO webuser;


--
-- PostgreSQL database dump complete
--

