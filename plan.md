# Ostly Implementation Plan

## Overview
This plan breaks down the Ostly product brief into iterative development phases, focusing on delivering value incrementally while building toward the full vision of a collaborative OST (Opportunity Solution Tree) editor.

## Core Product Understanding
**Ostly** is a web-native tool for product teams to build, evolve, and share Opportunity Solution Trees. The tool addresses key pain points:
- Teams using whiteboards/slides for OSTs (unwieldy at scale)
- Lack of version control and historical context
- Fractured collaboration across teams
- Manual stakeholder communication
- Difficulty iterating without losing structure

## Success Metrics & Goals
- **Time to value**: <10 minutes for initial tree creation
- **Adoption**: # of OSTs, active users, teams
- **Alignment**: Stakeholder satisfaction, # of views shared
- **Traceability**: Ratio of experiments linked to nodes
- **Integration**: Number of upstream/downstream integrations

---

## Phase 1: MVP Foundation (Weeks 1-8)

### 🎯 Core Objectives
- Deliver a functional OST editor that teams can use immediately
- Establish technical foundation for future features
- Validate core user flows and value proposition

### 📋 MVP Features
- [ ] **Basic Tree Editor**
  - [ ] Drag-and-drop node creation
  - [ ] Node types: Outcome → Opportunity → Solution → Experiment
  - [ ] Basic node metadata (title, description, status)
  - [ ] Expand/collapse functionality
  - [ ] Simple layout algorithms
  - [ ] Support up to 250 nodes
  - [ ] **Intentional use of color** for node types and status
  - [ ] **Dark and Light mode support**

- [ ] **Core Collaboration** *(Deferred to later phase)*
  - [ ] ~~Real-time multi-user editing~~ (Deferred)
  - [ ] ~~Live cursor presence~~ (Deferred)
  - [ ] ~~Basic conflict resolution~~ (Deferred)
  - [ ] ~~Comments on diagrams~~ (Deferred)
  - [ ] ~~Tagging users (@mentions)~~ (Deferred)

- [ ] **Sharing & Export (Priority Order)**
  - [ ] PNG export (highest priority)
  - [ ] PDF export (second priority)
  - [ ] Shareable view links (read-only)

- [ ] **Version Control**
  - [ ] Undo/redo functionality
  - [ ] Basic version history
  - [ ] Simple version control (no branching)

- [ ] **Templates & Onboarding**
  - [ ] **Retention template** (e.g., "Increase User Retention")
  - [ ] **Engagement template** (e.g., "Improve User Engagement") 
  - [ ] **Onboarding template** (e.g., "Optimize User Onboarding")
  - [ ] **Intro tour** with OST explanation
  - [ ] **Skip options** for OST-familiar users
  - [ ] **Optional product tour** for all users

### 🏗️ Technical Architecture (MVP)
- **Frontend**: Angular 20 + TypeScript
- **UI Framework**: Material + Tailwind CSS v4
- **Diagramming**: AntV X6 (SVG-based graph editing framework)
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Docker container) - tree structure with adjacency list
- **Authentication**: Not needed for MVP (deferred)
- **Real-time Collaboration**: Deferred to later phase
- **Deployment**: Separate services (frontend/backend) for better scaling
- **Testing**: Playwright for E2E tests, unit tests for business logic
- **Code Quality**: ESLint 9, code coverage reporting

### 📊 MVP Success Criteria
- [ ] User can create a basic OST in <10 minutes
- [ ] Export functionality works reliably (PNG, PDF)
- [ ] 3 template OSTs available (Retention, Engagement, Onboarding)
- [ ] Basic version history functional
- [ ] Dark and Light mode fully implemented
- [ ] Support up to 250 nodes with good performance
- [ ] Code coverage >80% for business logic
- [ ] Core user journeys covered by Playwright E2E tests
- [ ] All commits follow descriptive message conventions

---

## Phase 2: Enhanced Collaboration & Experiment Tracking (Weeks 9-16)

### 🎯 Core Objectives
- Deepen collaboration features
- Add experiment tracking capabilities
- Improve stakeholder experience

### 📋 Phase 2 Features
- [ ] **Advanced Collaboration**
  - [ ] Comments and annotations on nodes
  - [ ] @mentions and notifications
  - [ ] Node-level assignments and tasks
  - [ ] Activity feed

- [ ] **Experiment Tracking**
  - [ ] Link experiments to solution nodes
  - [ ] Experiment metadata (status, results, metrics)
  - [ ] Status propagation up/down tree
  - [ ] Experiment dashboard view

- [ ] **Permission & View Modes**
  - [ ] Role-based permissions (editor, viewer, admin)
  - [ ] **Permission & View Modes**
  - [ ] Stakeholder view mode (simplified, read-only)
  - [ ] Custom view filters
  - [ ] Presentation mode

- [ ] **Enhanced Export & Sharing**
  - [ ] Interactive embed links
  - [ ] Custom export templates
  - [ ] Presentation slideshow mode

### 🏗️ Technical Enhancements
- **Authentication**: Auth0 or similar
- **Permissions**: Role-based access control
- **Notifications**: Email + in-app notifications
- **File Storage**: AWS S3 for exports

### 📊 Phase 2 Success Criteria
- [ ] Teams can track experiments within OSTs
- [ ] Stakeholders can view simplified OSTs
- [ ] Collaboration features reduce communication friction
- [ ] Export options meet presentation needs

---

## Phase 3: Integrations & Advanced Features (Weeks 17-24)

### 🎯 Core Objectives
- Connect OSTs to existing product workflows
- Add intelligent features
- Scale for larger teams

### 📋 Phase 3 Features
- [ ] **Core Integrations**
  - [ ] Jira/GitHub integration (link tickets to solutions)
  - [ ] Notion/Airtable integration (research notes)
  - [ ] Slack notifications
  - [ ] Calendar integration (experiment scheduling)

- [ ] **Advanced Versioning**
  - [ ] Branching and forking
  - [ ] Merge conflict resolution UI
  - [ ] Change justification tracking
  - [ ] Experimental branches

- [ ] **Layout & UX Improvements**
  - [ ] Auto-arrangement algorithms
  - [ ] Multiple layout options (radial, horizontal, vertical)
  - [ ] Zoom and focus modes
  - [ ] Tree complexity management

- [ ] **Team Management**
  - [ ] Organization/workspace management
  - [ ] Team templates and libraries
  - [ ] Usage analytics dashboard

### 🏗️ Technical Enhancements
- **Integration Layer**: Microservices architecture
- **API**: RESTful API with webhook support
- **Analytics**: User behavior tracking
- **Performance**: Caching and optimization

### 📊 Phase 3 Success Criteria
- [ ] 3+ integrations working reliably
- [ ] Teams can manage complex OSTs effectively
- [ ] Advanced versioning supports experimentation
- [ ] Performance scales to 100+ node trees

---

## Phase 4: AI & Advanced Features (Weeks 25-32)

### 🎯 Core Objectives
- Add intelligent assistance
- Enable advanced analytics
- Support enterprise needs

### 📋 Phase 4 Features
- [ ] **AI/ML Features**
  - [ ] Smart node suggestions
  - [ ] Auto-grouping and clustering
  - [ ] Text-to-node conversion
  - [ ] Experiment recommendation engine

- [ ] **Advanced Analytics**
  - [ ] OST health metrics
  - [ ] Experiment success tracking
  - [ ] Team collaboration insights
  - [ ] Custom dashboards

- [ ] **Enterprise Features**
  - [ ] SSO integration
  - [ ] Advanced security controls
  - [ ] Audit logging
  - [ ] Custom branding

- [ ] **API & Ecosystem**
  - [ ] Public API for third-party integrations
  - [ ] Plugin architecture
  - [ ] Webhook system
  - [ ] Developer documentation

### 🏗️ Technical Enhancements
- **AI Services**: OpenAI API or similar
- **Analytics**: Custom analytics pipeline
- **Security**: Enterprise-grade security
- **API**: GraphQL API with real-time subscriptions

### 📊 Phase 4 Success Criteria
- [ ] AI features provide genuine value
- [ ] Analytics help teams improve their process
- [ ] Enterprise features meet security requirements
- [ ] API enables ecosystem development

---

## Open Questions Requiring Input

### ✅ Technical Decisions (RESOLVED)

#### **Frontend Stack**
- **Framework**: Angular 20 + TypeScript
- **UI Framework**: Material + Tailwind CSS v4
- **Canvas**: SVG (better for interactive diagrams, easier to style)
- **Linting**: ESLint 9
- **Design**: Dark and Light mode support with intentional use of color

#### **Backend Stack**
- **Runtime**: Node.js + Express
- **Database**: PostgreSQL (Docker container) with graph extensions
- **Real-time Collaboration**: Operational Transformation
- **Deployment**: Separate services (frontend/backend) for better scaling

#### **Testing & Quality**
- **Unit Tests**: Business logic coverage with code coverage reporting
- **E2E Tests**: Playwright for core user journeys
- **Development Pattern**: Red/Green/Refactor TDD
- **Version Control**: Git with frequent, descriptive commits

### ✅ Business Strategy (RESOLVED)
- **Pricing Model**: Monthly fee based on team size
- **Go-to-market**: To be decided later
- **Mobile Support**: Nice to have (not MVP priority)
- **Offline Capabilities**: Not necessary

### ✅ Product Priority Decisions (RESOLVED)

#### **Templates & Onboarding**
- **Templates to build first**: Retention, Engagement, and Onboarding templates
- **First-time user experience**: Intro tour showing key features + OST explanation, with options to skip OST portion and optionally watch product tour
- **Real company examples**: Not needed

#### **Core Features Priority**
- **Collaboration features (priority order)**: 
  1. Sharing via export to PNG
  2. Sharing via export to PDF  
  3. Comments on diagrams
  4. Tagging users
- **Version control**: Simple version control for MVP
- **Experiment tracking**: Phase 2 (not MVP)

#### **Integrations Priority**
- **Jira, GitHub, Notion**: Not important at this time
- **Focus**: Core OST functionality first

#### **AI Features Priority**
- **AI features**: Phase 4 (not MVP or early phases)
- **Focus**: Core functionality and user experience first

#### **User Experience & Performance**
- **Maximum tree size**: 250 nodes
- **Export formats**: PDF and PNG are most important
- **Tree complexity**: To be determined based on user feedback

#### **Competitive Differentiation**
- **Unique value**: Continuous discovery via OSTs - more than a drawing tool
- **Focus**: OST-specific features with process guidance
- **Target**: Provides guidance for novice users
- **Differentiation**: Process guidance and OST-specific workflows vs general diagramming

---

## Risk Mitigation Strategies

### 🚨 Technical Risks
- **Tree Complexity**: Implement progressive disclosure and focus modes
- **Performance**: Use virtualization for large trees
- **Collaboration Conflicts**: Robust conflict resolution UI
- **Data Loss**: Comprehensive backup and recovery

### 🚨 Product Risks
- **User Adoption**: Strong onboarding and template library
- **Feature Creep**: Strict MVP scope and user feedback loops
- **Integration Complexity**: Modular architecture and phased rollout
- **Competition**: Focus on unique OST-specific features

### 🚨 Business Risks
- **Market Fit**: Early user testing and feedback
- **Technical Debt**: Regular refactoring and code reviews
- **Team Scaling**: Clear documentation and processes
- **Funding**: Clear value demonstration and metrics

---

## Next Immediate Steps

### Week 1-2: Foundation Setup ✅ COMPLETE
- [x] Set up development environment (Node.js, Angular 20, PostgreSQL)
- [x] Create basic project structure (frontend + backend repos)
- [x] Configure Git repository with descriptive commit message templates
- [x] Set up PostgreSQL in Docker container
- [x] Configure ESLint 9 + Prettier for code quality
- [x] Set up unit testing framework with code coverage reporting
- [x] Configure Playwright for E2E testing
- [x] Set up automatic deployments (Vercel for frontend, Railway/Render for backend)
- [x] Create initial database schema
- [x] Configure environment variables
- [x] Set up Material + Tailwind CSS v3 (v4 not used due to compatibility)
- [x] Configure Dark/Light mode theming

**Development Covenants**:
- Follow Red/Green/Refactor TDD pattern for all business logic
- Write unit tests for business logic with code coverage measurement
- Use Playwright for E2E tests of core user journeys
- Commit frequently with descriptive commit messages

**Note on CI/CD**: For a single developer, use platform auto-deploy (Vercel/Railway) instead of complex CI/CD pipelines. This gives you automatic deployments on git push with zero configuration.

### Week 3-4: Core Editor ✅ COMPLETE
- [x] Implement basic node creation/editing
- [x] Add drag-and-drop functionality
- [x] Create simple layout algorithm
- [x] Add basic styling and theming
- [x] Implement parent-child connections
- [x] Fix node type visual updates
- [x] Use right-angle (Manhattan) connectors only
- [x] Implement node deletion
- [x] Enforce OST hierarchy rules (Outcome→Opportunity→Solution→Experiment)
- [x] Fix panning functionality

### Week 5-6: Collaboration
- [ ] Implement real-time editing
- [ ] Add user presence indicators
- [ ] Create conflict resolution
- [ ] Test with multiple users

### Week 7-8: Polish & Launch
- [ ] Add export functionality
- [ ] Create template library
- [ ] Implement version history
- [ ] User testing and feedback
- [ ] Deploy MVP

---

## Success Metrics Tracking

### 📈 Key Metrics to Track
- **Time to First OST**: Target <10 minutes
- **User Retention**: Weekly/Monthly active users
- **Collaboration**: Number of simultaneous users
- **Export Usage**: Frequency of PDF/PNG exports
- **Template Usage**: Most popular templates
- **Tree Complexity**: Average nodes per OST
- **Experiment Linking**: % of solutions with experiments

### 📊 Reporting Schedule
- **Daily**: User signups and basic usage
- **Weekly**: Feature adoption and user feedback
- **Monthly**: Retention, engagement, and business metrics
- **Quarterly**: Strategic review and roadmap updates

---

## 🚨 Areas Requiring Clarification (Risk Assessment)

### **HIGH PRIORITY - Clarify Before Starting**

#### **1. ~~Real-time Collaboration Scope~~** ✅ RESOLVED
- **Decision**: Deferred to later phase, not in MVP

#### **2. ~~Authentication & User Management~~** ✅ RESOLVED
- **Decision**: Not needed for MVP, deferred to later phase

#### **3. Data Model & Schema** ✅ RESOLVED (with clarification needed)
- **Decision**: PostgreSQL with adjacency list for tree structure
- **Node Storage**: 500 characters text per node
- **Tree Levels**: Outcome → Opportunity → Solution → Experiment (4 levels)

**Proposed Schema (for Week 0 review):**

```sql
-- OST Trees Table
CREATE TABLE ost_trees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Nodes Table (adjacency list pattern)
CREATE TABLE nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID REFERENCES ost_trees(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
  node_type VARCHAR(20) NOT NULL CHECK (node_type IN ('outcome', 'opportunity', 'solution', 'experiment')),
  title VARCHAR(255) NOT NULL,
  description TEXT CHECK (LENGTH(description) <= 500),
  status VARCHAR(50) DEFAULT 'draft',
  color VARCHAR(7), -- hex color code
  position_x DECIMAL(10,2),
  position_y DECIMAL(10,2),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP -- soft delete
);

-- Version History (snapshot approach for simplicity)
CREATE TABLE tree_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID REFERENCES ost_trees(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  snapshot JSONB NOT NULL, -- full tree snapshot
  change_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_nodes_tree_id ON nodes(tree_id);
CREATE INDEX idx_nodes_parent_id ON nodes(parent_id);
CREATE INDEX idx_nodes_type ON nodes(node_type);
CREATE INDEX idx_tree_versions_tree_id ON tree_versions(tree_id);
```

**Questions for Week 0**:
- [ ] Add user ownership when auth is implemented?
- [ ] Include node metadata (tags, links, attachments)?
- [ ] Version history: snapshots (simple) or deltas (efficient)?
- [ ] Soft delete (deleted_at) or hard delete?

#### **4. ~~SVG Diagramming Library Choice~~** ✅ RESOLVED
- **Decision**: AntV X6 (powerful graph editing framework, supports Angular)

#### **5. Export Implementation Details** (Technical Challenges & Solutions)

**Challenges with SVG-to-PNG/PDF Export:**
1. **Font rendering issues** - Custom fonts may not render correctly
2. **External resources** - Images, icons might not embed properly  
3. **Canvas size limits** - Browser limits on canvas dimensions
4. **Color accuracy** - Dark/light mode colors need to be preserved
5. **Quality/resolution** - Need high DPI for professional output

**Recommended Solutions:**

**Option A: Client-side Export (Simpler, good for MVP)**
- **PNG**: Use AntV X6's built-in `graph.exportPNG()` method
  - Pros: Simple, no server needed, works offline
  - Cons: Limited control over quality, browser limitations
- **PDF**: Use AntV X6 PNG export + jsPDF library
  - Convert PNG to PDF on client side
  - Pros: Works offline, simple implementation
  - Cons: Larger file sizes, quality limited by PNG

**Option B: Server-side Export (Better quality, Phase 2)**
- **Use Puppeteer or Playwright** (you already have Playwright!)
  - Render the OST in headless browser
  - Capture high-quality screenshot or PDF
  - Pros: Full control, high quality, consistent output
  - Cons: Requires server resources, more complex

**MVP Recommendation:**
- [ ] **Week 2: Use AntV X6 built-in export** (simplest path)
- [ ] **Week 3: Test with dark/light mode themes**
- [ ] **Week 4: Add quality/DPI options if needed**
- [ ] **Phase 2: Migrate to Playwright-based server export** (for better quality)

**Code Example (AntV X6):**
```typescript
// PNG Export
graph.exportPNG('my-ost', {
  quality: 1,
  backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff'
});

// PDF Export (via jsPDF)
const dataUrl = await graph.exportPNG();
const pdf = new jsPDF();
pdf.addImage(dataUrl, 'PNG', 0, 0);
pdf.save('my-ost.pdf');
```

### **MEDIUM PRIORITY - Clarify During Development**

#### **6. Color System & Theme Design**
- **Risk**: "Intentional use of color" is subjective
- **Questions**:
  - [ ] Specific color palette for node types?
  - [ ] Color coding rules (by type, status, priority)?
  - [ ] Accessibility compliance (WCAG AA/AAA)?
  - [ ] How colors translate between light/dark mode?
- **Recommendation**: Define color system in Week 1, create design tokens

#### **7. Comments & @Mentions Implementation**
- **Risk**: Requires notification system not specified
- **Questions**:
  - [ ] Where do comments live? (node-level, canvas-level, both?)
  - [ ] Notification delivery? (email, in-app, both?)
  - [ ] Reply threads or flat comments?
  - [ ] Edit/delete comment permissions?
- **Recommendation**: Define comment UX pattern in Week 5

#### **8. Template Content & Structure**
- **Risk**: Templates mentioned but content undefined
- **Questions**:
  - [ ] Exact structure of each template (nodes, relationships)?
  - [ ] Pre-filled content vs placeholder text?
  - [ ] Are templates editable or fixed?
  - [ ] Template versioning as product evolves?
- **Recommendation**: Create template content in Week 7

#### **9. Onboarding Tour Implementation**
- **Risk**: Tour mechanism not specified
- **Questions**:
  - [ ] Tour library? (Shepherd.js, Intro.js, Driver.js, custom?)
  - [ ] Interactive vs passive tour?
  - [ ] Progress tracking and skip functionality?
  - [ ] Mobile-responsive tour (for future)?
- **Recommendation**: Choose tour library in Week 7

#### **10. Performance & Optimization Strategy**
- **Risk**: 250 nodes could impact performance
- **Questions**:
  - [ ] Virtualization approach for large trees?
  - [ ] Lazy loading strategies?
  - [ ] Rendering optimization (canvas vs SVG performance)?
  - [ ] Acceptable load time targets?
- **Recommendation**: Set performance budgets, add monitoring

### **LOW PRIORITY - Can Evolve**

#### **11. Version History UI/UX**
- **Risk**: Version comparison can be complex
- **Questions**:
  - [ ] How to display version history? (timeline, list, visual diff?)
  - [ ] What granularity? (every change, snapshots, manual saves?)
  - [ ] Restore vs preview old versions?
- **Recommendation**: Simple version list for MVP, enhance later

#### **12. Conflict Resolution Approach**
- **Risk**: User experience for conflicts unclear
- **Questions**:
  - [ ] How to show conflicts to users?
  - [ ] Manual resolution vs automatic?
  - [ ] Prevention vs resolution focus?
- **Recommendation**: Start simple, refine based on user feedback

---

## 📋 Recommended Actions Before Starting Development

### **Week 0 (Planning Week)**
- [ ] ~~**Decision: Real-time collaboration approach**~~ ✅ Deferred to later phase
- [ ] ~~**Decision: Authentication strategy**~~ ✅ Deferred to later phase  
- [ ] ~~**Decision: SVG diagramming library**~~ ✅ Using AntV X6
- [ ] **Design: Data model & schema** (PostgreSQL schema with adjacency list)
  - [ ] Define node metadata fields (id, parent_id, node_type, text(500), status, color, position_x, position_y, created_at, updated_at)
  - [ ] Define OST tree table structure
  - [ ] Version history approach (snapshots vs deltas)
  - [ ] Soft delete strategy
- [ ] **Design: Color system & design tokens** (accessibility-compliant palette)
  - [ ] Define colors for each node type (Outcome, Opportunity, Solution, Experiment)
  - [ ] Define status colors (draft, validated, deprioritized, etc.)
  - [ ] Ensure WCAG AA compliance
  - [ ] Dark/light mode color mappings
- [ ] **Spike: Export mechanism** (validate AntV X6 export quality)
  - [ ] Test PNG export quality and file size
  - [ ] Test PDF conversion using jsPDF
  - [ ] Validate dark/light mode color preservation
- [ ] **Create: Template content** (draft all 3 template structures)
  - [ ] Retention template: define nodes and relationships
  - [ ] Engagement template: define nodes and relationships
  - [ ] Onboarding template: define nodes and relationships

### **Benefits of Week 0:**
- Reduces technical risk before coding starts
- Validates critical architectural decisions
- Prevents costly refactoring later
- Provides clarity for TDD approach
- Establishes clear success criteria

---

*This plan will be updated as we progress through development and gather user feedback. Each phase builds upon the previous one, ensuring we deliver value incrementally while working toward the full vision.*
