-- Roll With It Database Schema
-- PostgreSQL + Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE SYSTEM TABLES
-- =====================================================

-- Rulesets (D&D 5e, 4e, Pathfinder, etc.)
CREATE TABLE rulesets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  short_name TEXT NOT NULL UNIQUE,
  description TEXT,
  version TEXT,
  is_official BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sources (PHB, Xanathar's, etc.)
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ruleset_id UUID REFERENCES rulesets(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  description TEXT,
  publication_year INTEGER,
  is_official BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(ruleset_id, abbreviation)
);

-- =====================================================
-- CONTENT TABLES
-- =====================================================

-- Races
CREATE TABLE races (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  size TEXT,
  speed INTEGER,
  ability_score_increases JSONB,
  traits JSONB,
  languages JSONB,
  subraces JSONB,
  is_homebrew BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Classes
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  hit_die INTEGER,
  primary_ability TEXT,
  saving_throw_proficiencies JSONB,
  armor_proficiencies JSONB,
  weapon_proficiencies JSONB,
  tool_proficiencies JSONB,
  skill_choices JSONB,
  starting_equipment JSONB,
  spellcasting JSONB,
  class_features JSONB,
  is_homebrew BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Subclasses
CREATE TABLE subclasses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  level_available INTEGER,
  features JSONB,
  is_homebrew BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Spells
CREATE TABLE spells (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  level INTEGER CHECK (level >= 0 AND level <= 9),
  school TEXT,
  casting_time TEXT,
  range TEXT,
  components JSONB,
  duration TEXT,
  concentration BOOLEAN DEFAULT false,
  ritual BOOLEAN DEFAULT false,
  description TEXT,
  higher_levels TEXT,
  classes JSONB,
  is_homebrew BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Items
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT,
  subtype TEXT,
  rarity TEXT,
  requires_attunement BOOLEAN DEFAULT false,
  description TEXT,
  properties JSONB,
  damage JSONB,
  armor_class INTEGER,
  weight DECIMAL,
  cost JSONB,
  magical BOOLEAN DEFAULT false,
  is_homebrew BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Abilities (Feats, Features, Traits)
CREATE TABLE abilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT,
  description TEXT,
  prerequisites JSONB,
  benefits JSONB,
  is_homebrew BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Backgrounds
CREATE TABLE backgrounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  skill_proficiencies JSONB,
  tool_proficiencies JSONB,
  languages INTEGER,
  equipment JSONB,
  feature JSONB,
  suggested_characteristics JSONB,
  is_homebrew BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- CHARACTER & CAMPAIGN TABLES
-- =====================================================

-- Characters
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ruleset_id UUID REFERENCES rulesets(id) NOT NULL,
  name TEXT NOT NULL,
  race_id UUID REFERENCES races(id),
  class_id UUID REFERENCES classes(id),
  subclass_id UUID REFERENCES subclasses(id),
  background_id UUID REFERENCES backgrounds(id),
  level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 20),
  experience_points INTEGER DEFAULT 0,

  -- Ability Scores
  ability_scores JSONB NOT NULL DEFAULT '{"str": 10, "dex": 10, "con": 10, "int": 10, "wis": 10, "cha": 10}',

  -- Core Stats
  hit_points_max INTEGER,
  hit_points_current INTEGER,
  temporary_hit_points INTEGER DEFAULT 0,
  armor_class INTEGER,
  initiative_bonus INTEGER,
  speed INTEGER,

  -- Proficiencies
  proficiency_bonus INTEGER,
  saving_throws JSONB,
  skills JSONB,

  -- Combat
  attacks JSONB,

  -- Spellcasting
  spell_slots JSONB,
  spells_known JSONB,
  spells_prepared JSONB,

  -- Inventory
  inventory JSONB,
  currency JSONB DEFAULT '{"cp": 0, "sp": 0, "gp": 0, "pp": 0}',

  -- Features
  features JSONB,

  -- Personality
  personality_traits TEXT,
  ideals TEXT,
  bonds TEXT,
  flaws TEXT,

  -- Background
  appearance TEXT,
  backstory TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ruleset_id UUID REFERENCES rulesets(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  setting TEXT,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed')),
  session_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Campaign Characters (Many-to-Many)
CREATE TABLE campaign_characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'player' CHECK (role IN ('player', 'dm_pc', 'npc')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(campaign_id, character_id)
);

-- Campaign Members (Access Control)
CREATE TABLE campaign_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'player' CHECK (role IN ('dm', 'player')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(campaign_id, user_id)
);

-- Sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  session_number INTEGER,
  session_date DATE,
  title TEXT,
  summary TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- System tables
CREATE INDEX idx_sources_ruleset ON sources(ruleset_id);

-- Content tables
CREATE INDEX idx_races_source ON races(source_id);
CREATE INDEX idx_classes_source ON classes(source_id);
CREATE INDEX idx_subclasses_source ON subclasses(source_id);
CREATE INDEX idx_subclasses_class ON subclasses(class_id);
CREATE INDEX idx_spells_source ON spells(source_id);
CREATE INDEX idx_spells_level ON spells(level);
CREATE INDEX idx_spells_school ON spells(school);
CREATE INDEX idx_items_source ON items(source_id);
CREATE INDEX idx_items_type ON items(type);
CREATE INDEX idx_items_rarity ON items(rarity);
CREATE INDEX idx_abilities_source ON abilities(source_id);
CREATE INDEX idx_backgrounds_source ON backgrounds(source_id);

-- Character & Campaign tables
CREATE INDEX idx_characters_user ON characters(user_id);
CREATE INDEX idx_characters_ruleset ON characters(ruleset_id);
CREATE INDEX idx_campaigns_user ON campaigns(user_id);
CREATE INDEX idx_campaigns_ruleset ON campaigns(ruleset_id);
CREATE INDEX idx_campaign_characters_campaign ON campaign_characters(campaign_id);
CREATE INDEX idx_campaign_characters_character ON campaign_characters(character_id);
CREATE INDEX idx_campaign_members_campaign ON campaign_members(campaign_id);
CREATE INDEX idx_campaign_members_user ON campaign_members(user_id);
CREATE INDEX idx_sessions_campaign ON sessions(campaign_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE rulesets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE races ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subclasses ENABLE ROW LEVEL SECURITY;
ALTER TABLE spells ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE abilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE backgrounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Rulesets: Everyone can read official, only creators can modify custom
CREATE POLICY "Rulesets are viewable by everyone"
  ON rulesets FOR SELECT
  USING (true);

CREATE POLICY "Users can create custom rulesets"
  ON rulesets FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own rulesets"
  ON rulesets FOR UPDATE
  USING (auth.uid() = created_by);

-- Sources: Everyone can read official, only creators can modify custom
CREATE POLICY "Sources are viewable by everyone"
  ON sources FOR SELECT
  USING (true);

CREATE POLICY "Users can create custom sources"
  ON sources FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own sources"
  ON sources FOR UPDATE
  USING (auth.uid() = created_by);

-- Content tables: Everyone can read official, only creators can manage homebrew
-- Races
CREATE POLICY "Races are viewable by everyone"
  ON races FOR SELECT
  USING (NOT is_homebrew OR auth.uid() = created_by);

CREATE POLICY "Users can create homebrew races"
  ON races FOR INSERT
  WITH CHECK (auth.uid() = created_by AND is_homebrew = true);

CREATE POLICY "Users can update their own homebrew races"
  ON races FOR UPDATE
  USING (auth.uid() = created_by AND is_homebrew = true);

-- Classes (similar policies)
CREATE POLICY "Classes are viewable by everyone"
  ON classes FOR SELECT
  USING (NOT is_homebrew OR auth.uid() = created_by);

CREATE POLICY "Users can create homebrew classes"
  ON classes FOR INSERT
  WITH CHECK (auth.uid() = created_by AND is_homebrew = true);

CREATE POLICY "Users can update their own homebrew classes"
  ON classes FOR UPDATE
  USING (auth.uid() = created_by AND is_homebrew = true);

-- Subclasses
CREATE POLICY "Subclasses are viewable by everyone"
  ON subclasses FOR SELECT
  USING (NOT is_homebrew OR auth.uid() = created_by);

CREATE POLICY "Users can create homebrew subclasses"
  ON subclasses FOR INSERT
  WITH CHECK (auth.uid() = created_by AND is_homebrew = true);

CREATE POLICY "Users can update their own homebrew subclasses"
  ON subclasses FOR UPDATE
  USING (auth.uid() = created_by AND is_homebrew = true);

-- Spells
CREATE POLICY "Spells are viewable by everyone"
  ON spells FOR SELECT
  USING (NOT is_homebrew OR auth.uid() = created_by);

CREATE POLICY "Users can create homebrew spells"
  ON spells FOR INSERT
  WITH CHECK (auth.uid() = created_by AND is_homebrew = true);

CREATE POLICY "Users can update their own homebrew spells"
  ON spells FOR UPDATE
  USING (auth.uid() = created_by AND is_homebrew = true);

-- Items
CREATE POLICY "Items are viewable by everyone"
  ON items FOR SELECT
  USING (NOT is_homebrew OR auth.uid() = created_by);

CREATE POLICY "Users can create homebrew items"
  ON items FOR INSERT
  WITH CHECK (auth.uid() = created_by AND is_homebrew = true);

CREATE POLICY "Users can update their own homebrew items"
  ON items FOR UPDATE
  USING (auth.uid() = created_by AND is_homebrew = true);

-- Abilities
CREATE POLICY "Abilities are viewable by everyone"
  ON abilities FOR SELECT
  USING (NOT is_homebrew OR auth.uid() = created_by);

CREATE POLICY "Users can create homebrew abilities"
  ON abilities FOR INSERT
  WITH CHECK (auth.uid() = created_by AND is_homebrew = true);

CREATE POLICY "Users can update their own homebrew abilities"
  ON abilities FOR UPDATE
  USING (auth.uid() = created_by AND is_homebrew = true);

-- Backgrounds
CREATE POLICY "Backgrounds are viewable by everyone"
  ON backgrounds FOR SELECT
  USING (NOT is_homebrew OR auth.uid() = created_by);

CREATE POLICY "Users can create homebrew backgrounds"
  ON backgrounds FOR INSERT
  WITH CHECK (auth.uid() = created_by AND is_homebrew = true);

CREATE POLICY "Users can update their own homebrew backgrounds"
  ON backgrounds FOR UPDATE
  USING (auth.uid() = created_by AND is_homebrew = true);

-- Characters: Users can only access their own characters
CREATE POLICY "Users can view their own characters"
  ON characters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own characters"
  ON characters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own characters"
  ON characters FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own characters"
  ON characters FOR DELETE
  USING (auth.uid() = user_id);

-- Campaigns: Users can view campaigns they're members of
CREATE POLICY "Users can view their own campaigns"
  ON campaigns FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM campaign_members
      WHERE campaign_members.campaign_id = campaigns.id
      AND campaign_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Campaign owners can update their campaigns"
  ON campaigns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Campaign owners can delete their campaigns"
  ON campaigns FOR DELETE
  USING (auth.uid() = user_id);

-- Campaign Members
CREATE POLICY "Users can view campaign members for their campaigns"
  ON campaign_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_members.campaign_id
      AND (campaigns.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM campaign_members cm
        WHERE cm.campaign_id = campaigns.id
        AND cm.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Campaign DMs can add members"
  ON campaign_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_members.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Campaign DMs can remove members"
  ON campaign_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_members.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Campaign Characters
CREATE POLICY "Users can view campaign characters for their campaigns"
  ON campaign_characters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_characters.campaign_id
      AND (campaigns.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM campaign_members cm
        WHERE cm.campaign_id = campaigns.id
        AND cm.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Campaign members can add their characters"
  ON campaign_characters FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM characters
      WHERE characters.id = campaign_characters.character_id
      AND characters.user_id = auth.uid()
    )
  );

CREATE POLICY "Character owners and DMs can remove characters"
  ON campaign_characters FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM characters
      WHERE characters.id = campaign_characters.character_id
      AND characters.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_characters.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Sessions
CREATE POLICY "Campaign members can view sessions"
  ON sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = sessions.campaign_id
      AND (campaigns.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM campaign_members cm
        WHERE cm.campaign_id = campaigns.id
        AND cm.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Campaign members can create sessions"
  ON sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = sessions.campaign_id
      AND (campaigns.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM campaign_members cm
        WHERE cm.campaign_id = campaigns.id
        AND cm.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Session creators and DMs can update sessions"
  ON sessions FOR UPDATE
  USING (
    auth.uid() = created_by
    OR
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = sessions.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to all relevant tables
CREATE TRIGGER update_rulesets_updated_at BEFORE UPDATE ON rulesets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sources_updated_at BEFORE UPDATE ON sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_races_updated_at BEFORE UPDATE ON races
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subclasses_updated_at BEFORE UPDATE ON subclasses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spells_updated_at BEFORE UPDATE ON spells
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_abilities_updated_at BEFORE UPDATE ON abilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_backgrounds_updated_at BEFORE UPDATE ON backgrounds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON characters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
