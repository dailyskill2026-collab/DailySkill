// src/data/dailyReleaseFeed.ts
import { LearningContent, QuizQuestion } from '@/types/learning';

export interface DailyReleaseItem {
  id: string;
  releaseTag: string; // e.g., "Winter '27 Release", "Summer '26 Release", "Spring '26 Release"
  topicCategory: 'Apex' | 'LWC' | 'Agentforce' | 'Data Cloud' | 'Flow & Automation' | 'Security';
  update: LearningContent & {
    codeSnippet?: string;
    keyTakeaways?: string[];
  };
  practice: QuizQuestion;
  practiceContent: LearningContent;
  revision: LearningContent & {
    recallQuestion: string;
    keyPoints: string[];
  };
}

export const dailyReleaseFeed: DailyReleaseItem[] = [
  // =========================================================================
  // 1. WINTER '27 RELEASE: Agentforce Multi-Agent Orchestration & Apex Actions
  // =========================================================================
  {
    id: 'release-winter27-agentforce-apex',
    releaseTag: "Winter '27 Release",
    topicCategory: 'Agentforce',
    update: {
      id: 'sf-rel-winter27-agentforce-apex',
      technology: 'salesforce',
      category: 'update',
      title: "Agentforce: Multi-Agent Autonomous Orchestration & Invocable Apex Actions",
      summary: "Empower autonomous Agentforce agents with typed Apex @InvocableMethod actions, contextual grounding evaluation, and seamless multi-agent handoffs.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_dev', 'salesforce_arch', 'salesforce_consult', 'salesforce_lead'],
      estimatedMinutes: 2,
      learningObjectives: [
        'Expose type-safe business services to Agentforce via @InvocableMethod',
        'Configure semantic descriptions for the Atlas reasoning engine planner',
        'Implement contextual guardrails and multi-agent topic delegation',
      ],
      explanation:
        "In the Salesforce Winter '27 Release, Agentforce introduces advanced multi-agent orchestration. Autonomous agents leverage reasoning engines to inspect natural language intent and dynamically trigger custom Apex actions. Clear parameter descriptions on @InvocableVariable instruct the LLM reasoning planner exactly how to extract input data from conversational context and pass it to Apex.",
      realWorldExample:
        "A customer chats with an airline Agentforce agent asking to rebook a missed flight. The front-line agent delegates to a specialized 'FlightOperationsAgent', which executes the 'RescheduleFlightApexAction' to re-issue boarding passes and send SMS notifications in real time.",
      codeSnippet: `// Winter '27 Agentforce Autonomous Action
public with sharing class FlightBookingAgentActions {
  @InvocableMethod(
    label='Reschedule Passenger Flight'
    description='Rebooks a passenger on the next available flight and issues a revised boarding pass.'
    category='Agentforce Aviation'
  )
  public static List<RebookResult> rescheduleFlight(List<RebookRequest> requests) {
    List<RebookResult> results = new List<RebookResult>();
    for (RebookRequest req : requests) {
      results.add(AirlineService.rebookPassenger(req.pnrCode, req.preferredTime));
    }
    return results;
  }
}`,
      keyTakeaways: [
        'Descriptive labels and descriptions are essential for the Agentforce Atlas reasoning engine to select actions.',
        '@InvocableMethod must accept List<Request> and return List<Response> to satisfy platform bulkification.',
        'Enforce "with sharing" and user-mode security to safeguard sensitive ERP operations.',
      ],
      sourceName: 'Salesforce Developer Docs – Agentforce Invocable Actions',
      sourceUrl: 'https://developer.salesforce.com/docs/agentforce/overview/guide/agent-action-apex.html',
      sourcePublishedAt: '2026-10-15',
      lastVerifiedAt: '2026-11-01',
      releaseVersion: "Winter '27",
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practiceContent: {
      id: 'sf-practice-winter27-agentforce',
      technology: 'salesforce',
      category: 'practice',
      title: "Agentforce Action Design: Parameter Signatures and Autonomy",
      summary: "Design invocable actions that autonomous agents can reliably select and execute.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_dev', 'salesforce_arch'],
      estimatedMinutes: 2,
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practice: {
      id: 'quiz-winter27-agentforce',
      contentId: 'sf-practice-winter27-agentforce',
      questionType: 'scenario_mcq',
      scenario:
        "You are building an Invocable Apex action for an Agentforce Service Agent to verify warranty claims. During conversational testing, the agent frequently hallucinates input parameters or calls an unrelated action.",
      question:
        "What is the recommended best practice in Winter '27 to ensure the Agentforce reasoning engine accurately matches and invokes your Apex action?",
      options: [
        {
          id: 'A',
          label: 'Provide unambiguous, intent-focused descriptions on both @InvocableMethod and each @InvocableVariable parameter',
        },
        {
          id: 'B',
          label: 'Hardcode user prompt keywords inside the class constructor',
        },
        {
          id: 'C',
          label: 'Declare all input parameters as untyped Object references',
        },
        {
          id: 'D',
          label: 'Wrap the Invocable action in a legacy Workflow Rule',
        },
      ],
      correctAnswerId: 'A',
      explanation:
        "Agentforce's reasoning engine evaluates semantic descriptions to determine tool availability and schema. Providing precise, intent-focused descriptions on @InvocableMethod and @InvocableVariable ensures the LLM planner accurately binds conversational context to Apex inputs.",
      difficulty: 'medium',
    },
    revision: {
      id: 'sf-rev-invocable-limits',
      technology: 'salesforce',
      category: 'revision',
      title: "Apex @InvocableMethod Bulkification Rules",
      summary: "Review how Flow and Agent engines invoke Apex methods in bulk batches.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_dev', 'salesforce_fresher'],
      estimatedMinutes: 1,
      recallQuestion: "Why must @InvocableMethod always accept List<Input> and return List<Output>?",
      keyPoints: [
        'Flow and Agentforce engines invoke actions in bulk batches across concurrent user turns.',
        'The output list count and order must match the input list count exactly.',
        'Only one @InvocableMethod is allowed per Apex class.',
      ],
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
  },

  // =========================================================================
  // 2. WINTER '27 RELEASE: Apex Cursors Stateful Pagination & Large Scale SOQL
  // =========================================================================
  {
    id: 'release-winter27-apex-cursors',
    releaseTag: "Winter '27 Release",
    topicCategory: 'Apex',
    update: {
      id: 'sf-rel-winter27-apex-cursors',
      technology: 'salesforce',
      category: 'update',
      title: "Apex Cursors: High-Volume SOQL Processing Without Heap Size Limits",
      summary: "Process up to 50 million records efficiently in forward and backward chunks without hitting the 12MB synchronous heap limit or relying on heavy Batch Apex.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_dev', 'salesforce_arch', 'salesforce_lead'],
      estimatedMinutes: 2,
      learningObjectives: [
        'Use Database.getCursor() to navigate massive query result sets in memory-safe slices',
        'Fetch forward and backward record chunks using cursor.fetch(offset, count)',
        'Compare Apex Cursors vs Batch Apex and SOQL for-loops',
      ],
      explanation:
        "Apex Cursors in the Winter '27 Release provide a lightweight, cursor-based mechanism to navigate large query result sets in manageable chunks. Instead of loading thousands of records into heap memory at once (which triggers System.LimitException: Apex heap size too large), cursors maintain a server-side pointer and fetch only the requested batch into memory.",
      realWorldExample:
        "A financial claims engine processes 250,000 policy payouts in a Queueable worker. Instead of a 4-hour Batch Apex job, it uses Database.getCursor() to fetch 500-record slices and enqueues successor jobs with the cursor offset token.",
      codeSnippet: `// Winter '27 Apex Cursor Pattern
Database.Cursor cursor = Database.getCursor(
  'SELECT Id, Amount, StageName FROM Opportunity WHERE IsClosed = false'
);

// Fetch only 200 records at a time into heap
List<Opportunity> batch = cursor.fetch(0, 200);
for (Opportunity opp : batch) {
  opp.Needs_Review__c = true;
}
update batch;`,
      keyTakeaways: [
        'Cursors chunk queries without exhausting the 12MB/6MB heap limit.',
        'Usable in synchronous and asynchronous Apex transactions.',
        'Slices can be fetched by index offset using cursor.fetch(startIndex, count).',
      ],
      sourceName: 'Salesforce Official Docs – Apex Cursors',
      sourceUrl: 'https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_cursors.htm',
      sourcePublishedAt: '2026-10-10',
      lastVerifiedAt: '2026-11-01',
      releaseVersion: "Winter '27",
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practiceContent: {
      id: 'sf-practice-winter27-cursors',
      technology: 'salesforce',
      category: 'practice',
      title: "Apex Cursors: High-Volume Queueable Job Processing",
      summary: "Solve heap limits in Queueable Apex when processing 100,000+ records.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_dev', 'salesforce_arch'],
      estimatedMinutes: 2,
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practice: {
      id: 'quiz-winter27-cursors',
      contentId: 'sf-practice-winter27-cursors',
      questionType: 'scenario_mcq',
      scenario:
        "An enterprise Salesforce org runs a Queueable Apex worker nightly to process 180,000 Order Line Items. The existing SOQL for-loop intermittently crashes with 'System.LimitException: Apex heap size too large' when line items carry long JSON descriptions.",
      question:
        "Which modern Winter '27 architecture solves this heap exhaustion while keeping the processing inside Queueable Apex?",
      options: [
        {
          id: 'A',
          label: 'Use Database.getCursor() to maintain a server-side query pointer and fetch chunks of 200 records at a time',
        },
        {
          id: 'B',
          label: 'Increase the synchronous heap limit to 36MB using System.Limits.setHeapLimit()',
        },
        {
          id: 'C',
          label: 'Replace the Queueable job with an @future(heap=maximum) method',
        },
        {
          id: 'D',
          label: 'Encase the SOQL query in a try-catch block and catch the LimitException',
        },
      ],
      correctAnswerId: 'A',
      explanation:
        "Database.getCursor() maintains a server-side pointer and retrieves records in small, memory-safe chunks (e.g. 200 items), preventing heap exhaustion. Governor limits cannot be modified dynamically in Apex code, and LimitExceptions cannot be caught.",
      difficulty: 'medium',
    },
    revision: {
      id: 'sf-rev-soql-bulk',
      technology: 'salesforce',
      category: 'revision',
      title: "SOQL 101 Governor Limit & Bulk Collection Patterns",
      summary: "Prevent System.LimitException (SOQL 101) by aggregating IDs and querying outside loops.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_dev', 'salesforce_fresher'],
      estimatedMinutes: 1,
      recallQuestion: "What is the single most critical rule to prevent SOQL 101 limit exceptions in Apex triggers?",
      keyPoints: [
        'Never place SOQL queries or DML statements inside for-loops or iteration blocks.',
        'Collect related parent/child IDs in a Set<Id> and execute one bulk query outside the loop.',
        'Store results in a Map<Id, sObject> for O(1) in-memory lookups when processing records.',
      ],
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
  },

  // =========================================================================
  // 3. WINTER '27 RELEASE: Data Cloud Zero-Copy Federation in Apex
  // =========================================================================
  {
    id: 'release-winter27-data-cloud-federation',
    releaseTag: "Winter '27 Release",
    topicCategory: 'Data Cloud',
    update: {
      id: 'sf-rel-winter27-data-cloud-federation',
      technology: 'salesforce',
      category: 'update',
      title: "Data Cloud Zero-Copy Federation: Querying Snowflake & BigQuery from Apex",
      summary: "Access multi-terabyte external lakehouses directly in Apex and Flow with Zero-Copy data federation without costly ETL pipelines or local storage consumption.",
      contentType: 'article',
      difficulty: 'hard',
      applicableRoles: ['salesforce_arch', 'salesforce_dev', 'salesforce_lead'],
      estimatedMinutes: 2,
      learningObjectives: [
        'Query federated Data Model Objects (DMOs) natively in Apex using ConnectApi.CdpQuery',
        'Eliminate legacy ETL copy pipelines from external cloud data warehouses',
        'Enforce security permissions on external lakehouse tables within Salesforce',
      ],
      explanation:
        "In the Winter '27 Release, Data Cloud Zero-Copy data federation allows Salesforce applications to query live tables in Snowflake, Google BigQuery, and AWS Redshift directly. Rather than synchronizing gigabytes of data into Salesforce database tables, queries execute in place at the remote lakehouse, returning live answers directly to Apex and LWC.",
      realWorldExample:
        "A customer support agent views 5 years of historical billing transactions stored in a 40TB Snowflake database. The LWC widget queries the federated DMO via ConnectApi.CdpQuery with sub-second response time and zero local storage cost.",
      codeSnippet: `// Winter '27 Zero-Copy Federated Lakehouse Query
ConnectApi.QuerySqlInput input = new ConnectApi.QuerySqlInput();
input.sql = 'SELECT TransactionId__c, Amount__c, Timestamp__c ' +
            'FROM Snowflake_Billing_DMO__dlm ' +
            'WHERE CustomerId__c = \\'' + customerId + '\\' ' +
            'ORDER BY Timestamp__c DESC LIMIT 10';

ConnectApi.QuerySqlOutput output = ConnectApi.CdpQuery.querySql(input, 'default');
for (Map<String, Object> row : output.data) {
  System.debug('Transaction: ' + row.get('TransactionId__c') + ' Amount: $' + row.get('Amount__c'));
}`,
      keyTakeaways: [
        'Zero-Copy federation eliminates batch ETL pipelines and double-storage costs.',
        'Data remains securely in Snowflake/BigQuery and is queried on demand.',
        'Apex interacts through standard ConnectApi.CdpQuery and federated DMO schemas.',
      ],
      sourceName: 'Salesforce Developer Docs – ConnectApi Data Cloud Query',
      sourceUrl: 'https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CdpQuery_static_methods.htm',
      sourcePublishedAt: '2026-10-18',
      lastVerifiedAt: '2026-11-02',
      releaseVersion: "Winter '27",
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practiceContent: {
      id: 'sf-practice-winter27-federation',
      technology: 'salesforce',
      category: 'practice',
      title: "Data Architecture: Zero-Copy Federation vs Batch ETL Synchronization",
      summary: "Architect real-time visibility into 50M external customer transactions.",
      contentType: 'article',
      difficulty: 'hard',
      applicableRoles: ['salesforce_arch', 'salesforce_dev'],
      estimatedMinutes: 2,
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practice: {
      id: 'quiz-winter27-federation',
      contentId: 'sf-practice-winter27-federation',
      questionType: 'scenario_mcq',
      scenario:
        "An enterprise bank has 40 million customer transaction records stored in an external Snowflake data warehouse. Support agents need real-time read access to these transactions on the Contact page, but the Salesforce database storage quota is limited.",
      question:
        "What is the recommended Winter '27 architecture to display this external data with zero local data replication?",
      options: [
        {
          id: 'A',
          label: 'Use Data Cloud Zero-Copy Federation to query Snowflake directly via ConnectApi.CdpQuery and federated DMOs',
        },
        {
          id: 'B',
          label: 'Run a nightly Batch Apex ETL job to copy 40 million records into a custom Salesforce object',
        },
        {
          id: 'C',
          label: 'Implement an unindexed SOQL query with external IDs in a synchronous trigger',
        },
        {
          id: 'D',
          label: 'Store transaction records in browser localStorage on the agent machine',
        },
      ],
      correctAnswerId: 'A',
      explanation:
        "Data Cloud Zero-Copy Federation queries external Snowflake tables live via ConnectApi.CdpQuery without copying or storing the data in Salesforce core storage, completely avoiding storage quota exhaustion and batch sync delays.",
      difficulty: 'hard',
    },
    revision: {
      id: 'sf-rev-connect-api',
      technology: 'salesforce',
      category: 'revision',
      title: "ConnectApi in Apex & Governor Limits",
      summary: "Review how ConnectApi methods execute outside of standard SOQL query limit pools.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_dev', 'salesforce_arch'],
      estimatedMinutes: 1,
      recallQuestion: "Do ConnectApi method invocations count against the synchronous 100 SOQL query limit?",
      keyPoints: [
        'ConnectApi methods do NOT count against the synchronous 100 SOQL query limit; they have distinct rate and callout quotas.',
        'Most ConnectApi methods require Test.isRunningTest() mocks or SeeAllData=true in test classes.',
        'ConnectApi methods execute in the context of the running user and respect object/field permissions.',
      ],
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
  },

  // =========================================================================
  // 4. WINTER '27 RELEASE: LWC Workspace API Multi-Monitor & Tab Control
  // =========================================================================
  {
    id: 'release-winter27-lwc-workspace-api',
    releaseTag: "Winter '27 Release",
    topicCategory: 'LWC',
    update: {
      id: 'sf-rel-winter27-lwc-workspace-api',
      technology: 'salesforce',
      category: 'update',
      title: "LWC Workspace API: Native Console Tab Navigation & Multi-Monitor Subtabs",
      summary: "Directly open, focus, close, and refresh Lightning Console workspace tabs and pop-out subtabs directly from Lightning Web Components without Aura wrappers.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_dev', 'salesforce_lead'],
      estimatedMinutes: 2,
      learningObjectives: [
        'Import workspace adapters from lightning/platformWorkspaceApi',
        'Open records in focused primary tabs or contextual subtabs',
        'Eliminate legacy Aura wrapper components from Service Cloud implementations',
      ],
      explanation:
        "In Winter '27, the LWC Workspace API gives Lightning Web Components full native control over Lightning Console navigation. Developers can open, focus, close, and dynamically refresh workspace tabs and subtabs directly using `lightning/platformWorkspaceApi` methods and wire adapters without needing legacy Aura wrapper components.",
      realWorldExample:
        "A Service Cloud agent viewing a Case clicks 'Open Customer 360'. The LWC directly calls openSubtab() passing the Contact ID and sets the subtab title to the customer's full name without page reloads.",
      codeSnippet: `import { LightningElement, wire } from 'lwc';
import { EnclosingTabId, openSubtab, focusTab } from 'lightning/platformWorkspaceApi';

export default class CaseActionConsole extends LightningElement {
  @wire(EnclosingTabId) tabId;

  async openContactSubtab(contactId) {
    if (!this.tabId) return;
    
    await openSubtab(this.tabId, {
      recordId: contactId,
      focus: true
    });
  }
}`,
      keyTakeaways: [
        'Native LWC workspace API completely eliminates the need for legacy Aura wrappers.',
        'Use @wire(EnclosingTabId) to retrieve the active tab and subtab context.',
        'Works seamlessly in Lightning Service Console and Sales Console applications.',
      ],
      sourceName: 'Salesforce Component Reference – Platform Workspace API',
      sourceUrl: 'https://developer.salesforce.com/docs/component-library/bundle/lightning-platform-workspace-api/documentation',
      sourcePublishedAt: '2026-10-12',
      lastVerifiedAt: '2026-11-01',
      releaseVersion: "Winter '27",
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practiceContent: {
      id: 'sf-practice-winter27-workspace-api',
      technology: 'salesforce',
      category: 'practice',
      title: "LWC Console Navigation: Opening Subtabs in Service Console",
      summary: "Implement native console subtab opening for support agent workflows.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_dev'],
      estimatedMinutes: 2,
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practice: {
      id: 'quiz-winter27-workspace-api',
      contentId: 'sf-practice-winter27-workspace-api',
      questionType: 'scenario_mcq',
      scenario:
        "A Service Console project requires an LWC on the Account page that allows support reps to click a button to open an associated Order in a new subtab under the current Account tab.",
      question:
        "What is the modern, recommended approach in Winter '27 to implement this requirement?",
      options: [
        {
          id: 'A',
          label: 'Import openSubtab from lightning/platformWorkspaceApi and call it with the focused parent tab ID',
        },
        {
          id: 'B',
          label: 'Wrap the LWC in an Aura component and use lightning:workspaceAPI',
        },
        {
          id: 'C',
          label: 'Use window.open() with target="_blank" to launch a new browser window',
        },
        {
          id: 'D',
          label: 'Use standard NavigationMixin.Navigate to navigate with target="_self"',
        },
      ],
      correctAnswerId: 'A',
      explanation:
        "The native LWC Workspace API ('lightning/platformWorkspaceApi') allows calling openSubtab() directly from JavaScript without requiring legacy Aura components or disruptive window popups.",
      difficulty: 'medium',
    },
    revision: {
      id: 'sf-rev-lwc-lifecycle',
      technology: 'salesforce',
      category: 'revision',
      title: "LWC Component Lifecycle Hooks",
      summary: "Master the sequence of constructor, connectedCallback, renderedCallback, and disconnectedCallback.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_dev', 'salesforce_fresher'],
      estimatedMinutes: 1,
      recallQuestion: "Which LWC lifecycle hook is best suited to perform DOM manipulation or attach third-party UI libraries?",
      keyPoints: [
        'connectedCallback() fires when the component is inserted into the DOM (ideal for fetching initial data).',
        'renderedCallback() fires after every render cycle; guard DOM manipulation with a boolean flag to avoid infinite loops.',
        'disconnectedCallback() cleans up event listeners, timers, and message channel subscriptions.',
      ],
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
  },

  // =========================================================================
  // 5. SUMMER '26 RELEASE: Data Cloud Vector Search & Hybrid Search in Apex
  // =========================================================================
  {
    id: 'release-summer26-vector-search',
    releaseTag: "Summer '26 Release",
    topicCategory: 'Data Cloud',
    update: {
      id: 'sf-rel-summer26-vector-search',
      technology: 'salesforce',
      category: 'update',
      title: "Data Cloud Vector Search: Semantic & Hybrid Search in Apex",
      summary: "Query unstructured PDF manuals, knowledge articles, and customer transcripts using semantic vector embeddings and BM25 lexical ranking directly in Apex.",
      contentType: 'article',
      difficulty: 'hard',
      applicableRoles: ['salesforce_dev', 'salesforce_arch'],
      estimatedMinutes: 2,
      learningObjectives: [
        'Understand semantic similarity vs exact keyword SOSL matching',
        'Execute vector search queries via ConnectApi.CdpQuery using hybrid_search()',
        'Combine structured metadata filters with semantic cosine similarity',
      ],
      explanation:
        "In the Summer '26 Release, Data Cloud Vector Search enables semantic search directly from Apex using the hybrid_search() function in ConnectApi.CdpQuery. Unlike traditional SOSL which requires exact lexical keywords, semantic search converts text into multi-dimensional embeddings to match the underlying conceptual intent of user inquiries.",
      realWorldExample:
        "A technician queries: 'AC compressor vibrating with buzzing sound'. Semantic vector search matches a technical PDF manual titled 'Refrigerant Pump Resonance & Harmonic Damping' despite having zero keyword overlap.",
      codeSnippet: `// Summer '26 Data Cloud Hybrid Search
String sql = 'SELECT v.RecordId__c, v.hybrid_score__c, c.ChunkText__c ' +
             'FROM hybrid_search(TABLE(Equipment_Index__dlm), \\'compressor buzzing\\', \\'\\', 5) v ' +
             'INNER JOIN Equipment_Index_chunk__dlm c ON c.RecordId__c = v.RecordId__c';

ConnectApi.QuerySqlInput input = new ConnectApi.QuerySqlInput();
input.sql = sql;
ConnectApi.QuerySqlOutput output = ConnectApi.CdpQuery.querySql(input, 'default');`,
      keyTakeaways: [
        'Vector search allows semantic meaning retrieval rather than rigid keyword matching.',
        'Powered by Data Cloud vector database and embedding models.',
        'Enables enterprise RAG (Retrieval-Augmented Generation) architectures within Salesforce.',
      ],
      sourceName: 'Salesforce Developer Docs – ConnectApi Data Cloud Query',
      sourceUrl: 'https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CdpQuery_static_methods.htm',
      sourcePublishedAt: '2026-06-15',
      lastVerifiedAt: '2026-07-01',
      releaseVersion: "Summer '26",
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practiceContent: {
      id: 'sf-practice-summer26-vector-search',
      technology: 'salesforce',
      category: 'practice',
      title: "Semantic Search: Matching Customer Intent vs Keyword Searches",
      summary: "Select the optimal search architecture for complex customer service knowledge retrieval.",
      contentType: 'article',
      difficulty: 'hard',
      applicableRoles: ['salesforce_dev', 'salesforce_arch'],
      estimatedMinutes: 2,
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practice: {
      id: 'quiz-summer26-vector-search',
      contentId: 'sf-practice-summer26-vector-search',
      questionType: 'scenario_mcq',
      scenario:
        "A global telecommunications provider has 50,000 troubleshooting articles written in varying technical jargon. Customers describe issues using colloquial terms (e.g., 'my net is freezing'), while the articles use technical terms ('packet drop rate high'). SOSL queries frequently return zero matches.",
      question:
        "Which Salesforce capability bridges the gap between colloquial queries and technical terminology using semantic vector embeddings?",
      options: [
        {
          id: 'A',
          label: 'Data Cloud Vector Search with semantic embeddings and hybrid search',
        },
        {
          id: 'B',
          label: 'Standard SOQL query with LIKE %net%',
        },
        {
          id: 'C',
          label: 'Enabling Salesforce Classic search indexing on Article body fields',
        },
        {
          id: 'D',
          label: 'Writing a trigger to copy all article text into a custom formula field',
        },
      ],
      correctAnswerId: 'A',
      explanation:
        "Data Cloud Vector Search converts both the unstructured articles and the user query into semantic vector embeddings. It calculates distance (cosine similarity) in concept space, successfully matching 'net is freezing' to 'packet drop' without requiring explicit keyword overlap.",
      difficulty: 'hard',
    },
    revision: {
      id: 'sf-rev-soql-vs-sosl',
      technology: 'salesforce',
      category: 'revision',
      title: "SOQL vs SOSL: Search Architecture Comparison",
      summary: "Review when to use SOQL queries vs multi-object text search (SOSL).",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_dev', 'salesforce_admin'],
      estimatedMinutes: 1,
      recallQuestion: "When should an architect choose SOSL over SOQL?",
      keyPoints: [
        'Use SOSL when searching for text strings across multiple disparate objects simultaneously.',
        'SOSL searches indexed text fields (Name, Phone, text fields) much faster than non-indexed SOQL LIKE wildcards.',
        'Use SOQL when querying a single object or relationship tree with precise relational criteria.',
      ],
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
  },

  // =========================================================================
  // 6. SUMMER '26 RELEASE: User Access Policies (UAP) GA
  // =========================================================================
  {
    id: 'release-summer26-user-access-policies',
    releaseTag: "Summer '26 Release",
    topicCategory: 'Security',
    update: {
      id: 'sf-rel-summer26-user-access-policies',
      technology: 'salesforce',
      category: 'update',
      title: "User Access Policies: Automated Declarative Entitlement Provisioning",
      summary: "Automatically grant and revoke Permission Sets, Permission Set Groups, and Managed Package licenses based on user criteria without custom trigger code.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_admin', 'salesforce_consult', 'salesforce_dev'],
      estimatedMinutes: 2,
      learningObjectives: [
        'Configure criteria-based User Access Policies (UAP) in Setup',
        'Automate Permission Set Group and package license assignments on user create/update',
        'Deprecate brittle custom User triggers for access provisioning',
      ],
      explanation:
        "In Summer '26, User Access Policies provide a native, declarative engine to automate access entitlement provisioning. When a user record is created or updated, Salesforce evaluates policy criteria (e.g., Department = 'Finance' AND Country = 'UK') and automatically grants or revokes specified Permission Set Groups, Public Groups, and Package Licenses, completely avoiding MIXED_DML_OPERATION errors.",
      realWorldExample:
        "An enterprise with 10,000 employees onboarded 200 sales reps. Rather than a custom User trigger that frequently threw mixed DML errors, User Access Policies automatically assign the Sales Cloud PSG and Tableau CRM license seamlessly.",
      codeSnippet: `// Declarative Criteria Example (Configured in Setup > User Access Policies)
Trigger Criteria:
  User.Profile.Name EQUALS 'Standard Platform User'
  AND User.Department EQUALS 'Customer Support'

Actions to Apply:
  GRANT Permission Set Group: 'Support_Tier_2_PSG'
  GRANT Package License: 'OmniChannel_CTI_Toolkit'
  REVOKE Permission Set Group: 'Trainee_Temporary_Access'`,
      keyTakeaways: [
        'Replaces legacy Apex User triggers that often suffered from MIXED_DML_OPERATION errors.',
        'Can run in Automate mode (on user create/update) or Manual run mode (one-time bulk provisioning).',
        'Aligns with the Salesforce roadmap retiring permissions on Profiles in favor of Permission Sets.',
      ],
      sourceName: 'Salesforce Help – User Access Policies',
      sourceUrl: 'https://help.salesforce.com/s/articleView?id=sf.perm_user_access_policies.htm&type=5',
      sourcePublishedAt: '2026-06-05',
      lastVerifiedAt: '2026-06-25',
      releaseVersion: "Summer '26",
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practiceContent: {
      id: 'sf-practice-summer26-uap',
      technology: 'salesforce',
      category: 'practice',
      title: "User Access Provisioning: Mixed DML Elimination",
      summary: "Design clean permission provisioning architecture that avoids setup/non-setup mixed DML.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_admin', 'salesforce_dev'],
      estimatedMinutes: 2,
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practice: {
      id: 'quiz-summer26-uap',
      contentId: 'sf-practice-summer26-uap',
      questionType: 'scenario_mcq',
      scenario:
        "A Salesforce admin reports that an Apex trigger on the User object assigning PermissionSetAssignment records throws 'MIXED_DML_OPERATION' whenever a user update also touches an Account or Contact in the same transaction.",
      question:
        "What is the recommended declarative solution in Summer '26 to eliminate this error and automate permission assignment?",
      options: [
        {
          id: 'A',
          label: 'Implement User Access Policies (UAP) to handle permission grants declaratively',
        },
        {
          id: 'B',
          label: 'Wrap the trigger DML inside an infinite while loop until the database clears lock contention',
        },
        {
          id: 'C',
          label: 'Grant the Modify All Data permission directly on the User Profile',
        },
        {
          id: 'D',
          label: 'Convert all Permission Sets into individual Profiles for every job title',
        },
      ],
      correctAnswerId: 'A',
      explanation:
        "User Access Policies (UAP) are designed natively to automate permission set, group, and license assignments without writing code or triggering MIXED_DML_OPERATION errors between setup and non-setup objects.",
      difficulty: 'medium',
    },
    revision: {
      id: 'sf-rev-mixed-dml',
      technology: 'salesforce',
      category: 'revision',
      title: "Mixed DML Operations & Setup Objects",
      summary: "Understand transaction boundaries between Setup objects and non-Setup objects.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_dev'],
      estimatedMinutes: 1,
      recallQuestion: "Which Apex asynchronous construct is traditionally used to separate DML on Setup objects from non-Setup objects?",
      keyPoints: [
        'Setup objects (User, PermissionSet, Group) cannot be updated in the same transaction as non-Setup objects (Account, Contact).',
        'Separating operations into an @future method or Queueable Apex creates a fresh transaction and avoids MIXED_DML.',
        'System.runAs() in test methods can also isolate setup and non-setup DML operations.',
      ],
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
  },

  // =========================================================================
  // 7. SUMMER '26 RELEASE: Apex Null Coalescing (??) & Safe Navigation (?.)
  // =========================================================================
  {
    id: 'release-summer26-null-coalescing',
    releaseTag: "Summer '26 Release",
    topicCategory: 'Apex',
    update: {
      id: 'sf-rel-summer26-null-coalescing',
      technology: 'salesforce',
      category: 'update',
      title: "Apex Null Coalescing (`??`) and Safe Navigation (`?.`) Mastery",
      summary: "Eliminate verbose ternary checks and defensive null guards with clean, modern syntax in Apex.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_dev', 'salesforce_fresher'],
      estimatedMinutes: 2,
      learningObjectives: [
        'Utilize the null coalescing operator (??) to supply fallback default values',
        'Chain safe navigation (?.) with null coalescing for bulletproof expressions',
        'Refactor legacy defensive code to reduce cyclomatic complexity',
      ],
      explanation:
        "The Null Coalescing operator (??) returns the left-hand operand if it isn't null; otherwise, it evaluates and returns the right-hand operand. Paired with the Safe Navigation operator (?.), it transforms multi-line nested null checks into a single readable statement.",
      realWorldExample:
        "Extracting billing country codes from a Contact's Account. Rather than checking if Contact != null, Contact.Account != null, Contact.Account.BillingCountry != null, developers write a clean one-liner with graceful fallback.",
      codeSnippet: `// Modern Apex Null-Safe Pattern
String country = con?.Account?.BillingCountry ?? 'USA';

Integer batchSize = customSetting?.Batch_Size__c?.intValue() ?? 200;

List<Account> accounts = accountMap?.get(targetId) ?? new List<Account>();`,
      keyTakeaways: [
        'Left-hand operand is evaluated only once; right-hand operand is evaluated only if the left is null.',
        'Replaces clumsy ternary: (val != null ? val : defaultVal) with (val ?? defaultVal).',
        'Significantly reduces cyclomatic complexity and unit test branching requirements.',
      ],
      sourceName: 'Salesforce Apex Developer Guide – Expressions and Operators',
      sourceUrl: 'https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/langCon_apex_expressions_operators.htm',
      sourcePublishedAt: '2026-06-01',
      lastVerifiedAt: '2026-06-20',
      releaseVersion: "Summer '26",
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practiceContent: {
      id: 'sf-practice-summer26-null-coalescing',
      technology: 'salesforce',
      category: 'practice',
      title: "Null-Safety Refactoring: Eliminating System.NullPointerException",
      summary: "Apply null coalescing and safe navigation operators in trigger handler logic.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_dev', 'salesforce_fresher'],
      estimatedMinutes: 2,
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practice: {
      id: 'quiz-summer26-null-coalescing',
      contentId: 'sf-practice-summer26-null-coalescing',
      questionType: 'scenario_mcq',
      scenario:
        "In a high-volume Account trigger, an existing utility method reads discount percentages: \n`Decimal discount = (acc.Tier__r != null && acc.Tier__r.Discount__c != null) ? acc.Tier__r.Discount__c : 0.05;`",
      question:
        "What is the cleanest and most idiomatic Apex syntax to achieve the exact same logic?",
      options: [
        {
          id: 'A',
          label: 'Decimal discount = acc?.Tier__r?.Discount__c ?? 0.05;',
        },
        {
          id: 'B',
          label: 'Decimal discount = acc.Tier__r.Discount__c != null ?? 0.05;',
        },
        {
          id: 'C',
          label: 'Decimal discount = acc?.Tier__r ?? 0.05;',
        },
        {
          id: 'D',
          label: 'Decimal discount = System.coalesce(acc.Tier__r.Discount__c, 0.05);',
        },
      ],
      correctAnswerId: 'A',
      explanation:
        "`acc?.Tier__r?.Discount__c ?? 0.05;` safely short-circuits to null if either acc or Tier__r is null, and then the `??` operator replaces null with the default value of 0.05.",
      difficulty: 'easy',
    },
    revision: {
      id: 'sf-rev-npe-prevention',
      technology: 'salesforce',
      category: 'revision',
      title: "Defensive Coding & NullPointerException Avoidance",
      summary: "Review core best practices for initializing collections and safe map lookups.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_dev', 'salesforce_fresher'],
      estimatedMinutes: 1,
      recallQuestion: "Why should methods returning lists or sets always return empty collections instead of null?",
      keyPoints: [
        'Returning empty collections (new List<sObject>()) allows calling code to loop directly without null checks.',
        'Iterating over a null collection throws System.NullPointerException.',
        'Map.get(key) returns null if the key does not exist; verify with Map.containsKey() or use ?? fallback.',
      ],
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
  },

  // =========================================================================
  // 8. SUMMER '26 RELEASE: AsyncOptions.DuplicateSignature Idempotency
  // =========================================================================
  {
    id: 'release-summer26-queueable-signatures',
    releaseTag: "Summer '26 Release",
    topicCategory: 'Apex',
    update: {
      id: 'sf-rel-summer26-queueable-signatures',
      technology: 'salesforce',
      category: 'update',
      title: "AsyncOptions & DuplicateSignature: Idempotent Queueable Apex",
      summary: "Prevent duplicate asynchronous job execution during high-frequency trigger storms with built-in cryptographic idempotency keys.",
      contentType: 'article',
      difficulty: 'hard',
      applicableRoles: ['salesforce_dev', 'salesforce_lead', 'salesforce_arch'],
      estimatedMinutes: 2,
      learningObjectives: [
        'Utilize System.AsyncOptions to configure asynchronous job execution parameters',
        'Compute duplicate signatures for payload idempotency',
        'Prevent race conditions and duplicate ERP callouts during flash-sale bursts',
      ],
      explanation:
        "When rapid DML operations or external webhooks trigger Queueable jobs, identical jobs often get enqueued multiple times before the first job finishes. In the Summer '26 Release, developers pass an AsyncOptions instance with a DuplicateSignature string into System.enqueueJob(). Salesforce automatically rejects duplicate enqueue requests if an identical job is already queued or running.",
      realWorldExample:
        "A payment webhook fires 3 times in 200ms for the same Order ID. By supplying a DuplicateSignature based on Order ID, only the first Queueable job is enqueued, completely avoiding duplicate credit card settlement charges.",
      codeSnippet: `// Summer '26 Idempotent Queueable Job
AsyncOptions options = new AsyncOptions();
// Generate unique hash for order payload
options.DuplicateSignature = AsyncOptions.computeSignature(orderRecord);

try {
  Id jobId = System.enqueueJob(new OrderFulfillmentJob(orderRecord), options);
} catch (DuplicateMessageException ex) {
  System.debug('Job already in queue or running: ' + ex.getMessage());
}`,
      keyTakeaways: [
        'DuplicateSignature provides native database-level idempotency for asynchronous jobs.',
        'Eliminates the need for custom checkbox locking flags on database records.',
        'Throws DuplicateMessageException or silently suppresses duplicate enqueues based on configuration.',
      ],
      sourceName: 'Salesforce Apex Developer Guide – Queueable Apex Jobs',
      sourceUrl: 'https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_queueing_jobs.htm',
      sourcePublishedAt: '2026-06-12',
      lastVerifiedAt: '2026-06-30',
      releaseVersion: "Summer '26",
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practiceContent: {
      id: 'sf-practice-summer26-signatures',
      technology: 'salesforce',
      category: 'practice',
      title: "Asynchronous Idempotency: Eliminating Duplicate Queueable Executions",
      summary: "Implement idempotent asynchronous processing under high-concurrency conditions.",
      contentType: 'article',
      difficulty: 'hard',
      applicableRoles: ['salesforce_dev', 'salesforce_arch'],
      estimatedMinutes: 2,
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practice: {
      id: 'quiz-summer26-signatures',
      contentId: 'sf-practice-summer26-signatures',
      questionType: 'scenario_mcq',
      scenario:
        "An IoT fleet monitoring platform sends telemetry updates to Salesforce every 5 seconds. Each update enqueues an Apex Queueable job to compute vehicle route efficiency. During peak hours, 10 identical Queueable jobs pile up in the FlexQueue for the same vehicle.",
      question:
        "Which modern Summer '26 Apex feature prevents enqueueing duplicate asynchronous jobs while a matching job is already queued?",
      options: [
        {
          id: 'A',
          label: 'Pass an AsyncOptions object with DuplicateSignature set to the vehicle telemetry signature into System.enqueueJob()',
        },
        {
          id: 'B',
          label: 'Query the AsyncApexJob table before every enqueue using a FOR UPDATE database lock',
        },
        {
          id: 'C',
          label: 'Convert the Queueable class into a synchronous trigger handler',
        },
        {
          id: 'D',
          label: 'Add Thread.sleep(5000) inside the Queueable execute() method',
        },
      ],
      correctAnswerId: 'A',
      explanation:
        "Setting AsyncOptions.DuplicateSignature instructs Salesforce to enforce server-side idempotency. If an enqueued job with the identical signature is already pending or executing in the queue, subsequent enqueue attempts are rejected, preventing duplicate queue saturation.",
      difficulty: 'hard',
    },
    revision: {
      id: 'sf-rev-queueable-chaining',
      technology: 'salesforce',
      category: 'revision',
      title: "Queueable Apex Chaining & Transaction Depth Limits",
      summary: "Review how Queueable jobs chain execution and the maximum stack depth rules.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_dev', 'salesforce_arch'],
      estimatedMinutes: 1,
      recallQuestion: "How many Queueable jobs can you chain consecutively in a single transaction sequence?",
      keyPoints: [
        'You can chain only ONE successor Queueable job from within an execute() method.',
        'In Developer Edition and Trial orgs, maximum stack depth is restricted (5 depth); in Production orgs chaining has no strict depth cap.',
        'System.enqueueJob() cannot be called from an @future method.',
      ],
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
  },

  // =========================================================================
  // 9. SPRING '26 RELEASE: Flow Trigger Explorer & Deterministic Save Order
  // =========================================================================
  {
    id: 'release-spring26-flow-trigger-explorer',
    releaseTag: "Spring '26 Release",
    topicCategory: 'Flow & Automation',
    update: {
      id: 'sf-rel-spring26-flow-trigger-explorer',
      technology: 'salesforce',
      category: 'update',
      title: "Flow Trigger Explorer: Deterministic Execution Order & Zero-DML Updates",
      summary: "Visually sequence record-triggered flows to run before or after Apex triggers while maximizing performance with Fast Field Updates.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_admin', 'salesforce_consult', 'salesforce_dev', 'salesforce_fresher'],
      estimatedMinutes: 2,
      learningObjectives: [
        'Sequence multiple record-triggered flows using visual priority numbering',
        'Differentiate Fast Field Updates (before-save) from Actions and Related Records (after-save)',
        'Optimize save order to avoid recursion and CPU timeouts',
      ],
      explanation:
        "Flow Trigger Explorer provides visual command over all record-triggered flows per object. Before-save flows (Fast Field Updates) execute up to 10x faster because updates modify fields in memory before database commit without consuming synchronous DML limits.",
      realWorldExample:
        "An insurance carrier triggers 5 different flows on Opportunity creation. Using Flow Trigger Explorer, the admin sequences Discount Calculation first, followed by Tax Assessment, preventing uncoordinated recursion.",
      codeSnippet: `// Flow Save Order Architecture:
// 1. System Validation Rules
// 2. Before-Save Flows (Fast Field Updates - Zero DML)
// 3. Before Apex Triggers
// 4. Custom Validation Rules
// 5. After Apex Triggers
// 6. After-Save Flows (Actions & Related Records)`,
      keyTakeaways: [
        'Before-save flows do not consume synchronous DML statements (150 limit).',
        'Flow Trigger Explorer allows drag-and-drop or explicit integer priority order (1 to 2000).',
        'Use Fast Field Updates whenever updating fields on the record that triggered the flow.',
      ],
      sourceName: 'Salesforce Help – Flow Trigger Explorer',
      sourceUrl: 'https://help.salesforce.com/s/articleView?id=sf.flow_concepts_trigger_explorer.htm&type=5',
      sourcePublishedAt: '2026-02-10',
      lastVerifiedAt: '2026-03-01',
      releaseVersion: "Spring '26",
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practiceContent: {
      id: 'sf-practice-spring26-flow',
      technology: 'salesforce',
      category: 'practice',
      title: "Flow Architecture: Fast Field Updates vs DML Limits",
      summary: "Choose the optimal flow execution path to eliminate governor limit exceptions.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_admin', 'salesforce_consult', 'salesforce_dev', 'salesforce_fresher'],
      estimatedMinutes: 2,
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practice: {
      id: 'quiz-spring26-flow',
      contentId: 'sf-practice-spring26-flow',
      questionType: 'scenario_mcq',
      scenario:
        "A sales rep saves an Opportunity with 50 line items. A custom flow updates a status field on the same Opportunity. During high-volume imports, users intermittently receive 'System.LimitException: Too many DML statements: 151'.",
      question:
        "How should the administrator refactor this flow to eliminate the DML limit exception?",
      options: [
        {
          id: 'A',
          label: 'Change the flow trigger to Fast Field Updates (Before-Save) so changes apply before committing to the database',
        },
        {
          id: 'B',
          label: 'Convert the flow into a Scheduled Path running 1 minute after save',
        },
        {
          id: 'C',
          label: 'Add an explicit Update Records element at the end of the after-save flow',
        },
        {
          id: 'D',
          label: 'Create a Workflow Rule to overwrite the flow value',
        },
      ],
      correctAnswerId: 'A',
      explanation:
        "Fast Field Updates (Before-Save flows) apply field changes directly in memory prior to the database commit. Because no additional DML statement is fired, it consumes zero synchronous DML limits and executes up to 10x faster.",
      difficulty: 'easy',
    },
    revision: {
      id: 'sf-rev-trigger-order',
      technology: 'salesforce',
      category: 'revision',
      title: "Salesforce Save Order of Execution",
      summary: "Review the critical lifecycle sequence: Validation -> Before Triggers -> After Triggers -> Flows.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_admin', 'salesforce_dev', 'salesforce_fresher'],
      estimatedMinutes: 1,
      recallQuestion: "Do Before-Save Flows run before or after custom Apex Before Triggers?",
      keyPoints: [
        'Before-Save Flows (Fast Field Updates) execute BEFORE custom Apex Before Triggers.',
        'System validation rules run before Before-Save flows, but custom validation rules run after Before Triggers.',
        'After-Save Flows execute after custom Apex After Triggers and Assignment Rules.',
      ],
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
  },

  // =========================================================================
  // 10. SPRING '26 RELEASE: LWC Light DOM & Scoped Styling
  // =========================================================================
  {
    id: 'release-spring26-lwc-light-dom',
    releaseTag: "Spring '26 Release",
    topicCategory: 'LWC',
    update: {
      id: 'sf-rel-spring26-lwc-light-dom',
      technology: 'salesforce',
      category: 'update',
      title: "LWC Light DOM: High-Performance Enterprise UI & Global Styling",
      summary: "Bypass Shadow DOM encapsulation when required for third-party CSS frameworks, global document queries, and high-density data tables.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_dev', 'salesforce_lead', 'salesforce_arch'],
      estimatedMinutes: 2,
      learningObjectives: [
        'Declare static renderMode = "light" on Lightning Web Components',
        'Enable global CSS framework integration (Tailwind / Bootstrap) without synthetic shadow workarounds',
        'Evaluate security boundaries and DOM query implications',
      ],
      explanation:
        "By default, LWC attaches components to a Shadow Root (Shadow DOM) to encapsulate CSS and DOM trees. Light DOM renders component markup directly inside the host element instead. This enables third-party analytics libraries, global CSS stylesheets, and accessibility scanners to interact directly with internal component elements.",
      realWorldExample:
        "An enterprise customer portal incorporates a corporate design system with global utility classes. With Light DOM, table cells inherit branding styles seamlessly without complex CSS custom properties (:host).",
      codeSnippet: `// Spring '26 LWC Light DOM Component
import { LightningElement } from 'lwc';

export default class EnterpriseDataTable extends LightningElement {
  static renderMode = 'light'; // Enables Light DOM

  handleRowClick(event) {
    // Queries work directly against the standard document DOM
    console.log('Clicked row element:', event.target);
  }
}`,
      keyTakeaways: [
        'Enabling Light DOM requires "static renderMode = \'light\'" in JS and <template lwc:render-mode="light"> in HTML.',
        'Child components are still encapsulated unless they also declare renderMode = light.',
        'Useful for third-party scripts, corporate stylesheets, and advanced accessibility requirements.',
      ],
      sourceName: 'Salesforce LWC Developer Guide – Light DOM',
      sourceUrl: 'https://developer.salesforce.com/docs/platform/lwc/guide/create-light-dom.html',
      sourcePublishedAt: '2026-02-15',
      lastVerifiedAt: '2026-03-05',
      releaseVersion: "Spring '26",
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practiceContent: {
      id: 'sf-practice-spring26-light-dom',
      technology: 'salesforce',
      category: 'practice',
      title: "LWC DOM Architecture: Shadow DOM vs Light DOM Selection",
      summary: "Select the appropriate DOM encapsulation model for enterprise portal integration.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_dev', 'salesforce_lead'],
      estimatedMinutes: 2,
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practice: {
      id: 'quiz-spring26-light-dom',
      contentId: 'sf-practice-spring26-light-dom',
      questionType: 'scenario_mcq',
      scenario:
        "A team is migrating an external React portal into Salesforce Experience Cloud using LWC. The team’s third-party accessibility auditor reports that screen-reader scripts cannot inspect elements encapsulated inside the Shadow Root.",
      question:
        "What is the recommended architectural solution in LWC to allow external accessibility tools to inspect component DOM elements?",
      options: [
        {
          id: 'A',
          label: 'Configure the LWC with static renderMode = "light" to render markup directly in the host DOM',
        },
        {
          id: 'B',
          label: 'Wrap the entire component in an iframe with sandbox="allow-scripts"',
        },
        {
          id: 'C',
          label: 'Inject jQuery into renderedCallback() to penetrate the shadow boundary',
        },
        {
          id: 'D',
          label: 'Set lightningStylesheets="false" in the component meta xml file',
        },
      ],
      correctAnswerId: 'A',
      explanation:
        "Declaring static renderMode = 'light' causes LWC to render its markup into the host element's light DOM rather than an encapsulated shadow root. This allows third-party tools, accessibility scanners, and corporate CSS to inspect and style elements directly.",
      difficulty: 'medium',
    },
    revision: {
      id: 'sf-rev-shadow-dom',
      technology: 'salesforce',
      category: 'revision',
      title: "Shadow DOM Encapsulation & this.template.querySelector",
      summary: "Review how standard LWC encapsulates markup and why this.template is used.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_dev', 'salesforce_fresher'],
      estimatedMinutes: 1,
      recallQuestion: "Why should developers use this.template.querySelector() instead of document.querySelector() in standard LWC?",
      keyPoints: [
        'this.template.querySelector() queries only inside the component’s encapsulated shadow tree.',
        'document.querySelector() cannot penetrate standard shadow roots and violates component isolation.',
        'Never query DOM elements before renderedCallback() runs.',
      ],
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
  },

  // =========================================================================
  // 11. SPRING '26 RELEASE: External Credentials with OAuth 2.0
  // =========================================================================
  {
    id: 'release-spring26-external-credentials',
    releaseTag: "Spring '26 Release",
    topicCategory: 'Security',
    update: {
      id: 'sf-rel-spring26-external-credentials',
      technology: 'salesforce',
      category: 'update',
      title: "External Credentials: Secure Server-to-Server OAuth 2.0 Integrations",
      summary: "Connect Salesforce Apex callouts to AWS, GCP, and Azure APIs using Named Credentials with zero hardcoded API secrets.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_dev', 'salesforce_admin', 'salesforce_arch'],
      estimatedMinutes: 2,
      learningObjectives: [
        'Configure External Credentials with OAuth 2.0 Client Credentials flow',
        'Map Principal access to Permission Sets for least-privilege security',
        'Execute authenticated HTTP callouts using callout:Named_Credential syntax',
      ],
      explanation:
        "Legacy Named Credentials often required custom authentication plugins or hardcoded tokens for machine-to-machine integrations. Modern External Credentials decouple the endpoint definition from authentication parameters and principals. Permission Sets grant granular access to principals without exposing client secrets to Apex developers or logs.",
      realWorldExample:
        "A financial billing engine sends invoice PDFs to an AWS S3 bucket. Using External Credentials with AWS Signature Version 4, Apex issues signed HTTP requests without ever exposing AWS IAM Access Keys in code.",
      codeSnippet: `// Modern Apex Callout using Named Credential
HttpRequest req = new HttpRequest();
req.setEndpoint('callout:AWS_Invoice_Storage/v1/invoices');
req.setMethod('POST');
req.setHeader('Content-Type', 'application/json');
req.setBody(JSON.serialize(invoicePayload));

Http http = new Http();
HttpResponse res = http.send(req);`,
      keyTakeaways: [
        'Endpoints are configured as "callout:Named_Credential_Name".',
        'Salesforce automatically injects OAuth Bearer tokens or AWS SigV4 headers at runtime.',
        'Users must be assigned a Permission Set granting access to the External Credential Principal.',
      ],
      sourceName: 'Salesforce Security Guide – External Credentials',
      sourceUrl: 'https://help.salesforce.com/s/articleView?id=sf.nc_external_credentials.htm&type=5',
      sourcePublishedAt: '2026-02-18',
      lastVerifiedAt: '2026-03-05',
      releaseVersion: "Spring '26",
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practiceContent: {
      id: 'sf-practice-spring26-external-creds',
      technology: 'salesforce',
      category: 'practice',
      title: "Integration Security: OAuth 2.0 Client Credentials Architecture",
      summary: "Design secure API callouts adhering to enterprise zero-trust security.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_dev', 'salesforce_admin', 'salesforce_arch'],
      estimatedMinutes: 2,
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practice: {
      id: 'quiz-spring26-external-creds',
      contentId: 'sf-practice-spring26-external-creds',
      questionType: 'scenario_mcq',
      scenario:
        "A Salesforce developer writes an HTTP callout to an enterprise ERP system. During security code review, the lead architect flags that client_id and client_secret are stored inside a protected Custom Metadata record in Apex.",
      question:
        "What is the recommended Salesforce security pattern in Spring '26 to eliminate secrets from custom metadata?",
      options: [
        {
          id: 'A',
          label: 'Create an External Credential with OAuth 2.0 Client Credentials flow and reference it via a Named Credential in the callout URL',
        },
        {
          id: 'B',
          label: 'Encrypt the client_secret in an encrypted text field on the User record',
        },
        {
          id: 'C',
          label: 'Pass the client secret as an unencrypted URL query parameter',
        },
        {
          id: 'D',
          label: 'Store the secret in an Apex class with the "private static final" modifier',
        },
      ],
      correctAnswerId: 'A',
      explanation:
        "External Credentials natively manage OAuth 2.0 Client Credentials flows. Salesforce securely stores client IDs and secrets in its encrypted infrastructure and injects valid tokens at runtime, eliminating secrets from Apex code, metadata, or logs.",
      difficulty: 'medium',
    },
    revision: {
      id: 'sf-rev-remote-site-settings',
      technology: 'salesforce',
      category: 'revision',
      title: "Named Credentials vs Remote Site Settings",
      summary: "Understand when Remote Site Settings are needed versus Named Credentials.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_dev', 'salesforce_admin'],
      estimatedMinutes: 1,
      recallQuestion: "Do you need to configure a Remote Site Setting if you are using a Named Credential for an endpoint?",
      keyPoints: [
        'No! Named Credentials automatically bypass the requirement for Remote Site Settings.',
        'Remote Site Settings only authorize network connectivity; they do not handle authentication headers.',
        'Named Credentials handle both network authorization and secure credential injection.',
      ],
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
  },

  // =========================================================================
  // 12. SPRING '26 RELEASE: Real-Time Event Monitoring & Pub/Sub API
  // =========================================================================
  {
    id: 'release-spring26-pubsub-api',
    releaseTag: "Spring '26 Release",
    topicCategory: 'Data Cloud',
    update: {
      id: 'sf-rel-spring26-pubsub-api',
      technology: 'salesforce',
      category: 'update',
      title: "Salesforce Pub/Sub API: High-Throughput Bidirectional Event Ingestion",
      summary: "Stream millions of Change Data Capture and Platform Events into data lakes with gRPC-based binary flow control and subscription replay.",
      contentType: 'article',
      difficulty: 'hard',
      applicableRoles: ['salesforce_arch', 'salesforce_lead', 'salesforce_dev'],
      estimatedMinutes: 2,
      learningObjectives: [
        'Implement gRPC-based event streaming with binary Apache Avro serialization',
        'Manage event replay with exact ReplayId subscription pointers',
        'Compare Pub/Sub API performance against legacy CometD Streaming API',
      ],
      explanation:
        "The Pub/Sub API replaces legacy CometD / Bayeux protocols with modern gRPC HTTP/2 bidirectional streaming. By utilizing Apache Avro binary serialization, it delivers up to 4x higher throughput and significantly reduced network serialization overhead, ideal for real-time Kafka and Snowflake synchronization.",
      realWorldExample:
        "A fintech banking platform synchronizes 2,000,000 transaction events per hour from Salesforce to an AWS Kafka cluster. Using Pub/Sub API with REPLAY_ID presets, the streaming client guarantees exactly-once delivery across cluster failovers.",
      codeSnippet: `// Pub/Sub API Architecture (gRPC Protobuf)
// rpc Subscribe (stream FetchRequest) returns (stream FetchResponse);

FetchRequest request = FetchRequest.newBuilder()
  .setTopicName('/data/AccountChangeEvent')
  .setReplayPreset(ReplayPreset.LATEST)
  .setNumRequested(1000)
  .build();`,
      keyTakeaways: [
        'Built on gRPC and HTTP/2 for high-throughput, bidirectional event streaming.',
        'Replaces legacy CometD Streaming API with binary Apache Avro payloads.',
        'Supports exact ReplayId offsets to recover missed events after network disconnection.',
      ],
      sourceName: 'Salesforce Pub/Sub API Developer Documentation',
      sourceUrl: 'https://developer.salesforce.com/docs/platform/pub-sub-api/overview',
      sourcePublishedAt: '2026-02-20',
      lastVerifiedAt: '2026-03-05',
      releaseVersion: "Spring '26",
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practiceContent: {
      id: 'sf-practice-spring26-pubsub-api',
      technology: 'salesforce',
      category: 'practice',
      title: "Event-Driven Architecture: Pub/Sub API Replay & Ingestion",
      summary: "Select event ingestion patterns for real-time external data lake pipelines.",
      contentType: 'article',
      difficulty: 'hard',
      applicableRoles: ['salesforce_arch', 'salesforce_lead', 'salesforce_dev'],
      estimatedMinutes: 2,
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practice: {
      id: 'quiz-spring26-pubsub-api',
      contentId: 'sf-practice-spring26-pubsub-api',
      questionType: 'scenario_mcq',
      scenario:
        "An enterprise data engineering team needs to ingest 5 million Change Data Capture (CDC) events per day from Salesforce into an external Apache Kafka pipeline. Their legacy CometD client frequently drops connections and suffers high JSON parsing CPU overhead.",
      question:
        "What Salesforce API is recommended for high-volume, binary-serialized event streaming with automatic replay offset support?",
      options: [
        {
          id: 'A',
          label: 'Salesforce Pub/Sub API utilizing gRPC and Apache Avro binary serialization',
        },
        {
          id: 'B',
          label: 'Bulk API 2.0 with hourly scheduled queries',
        },
        {
          id: 'C',
          label: 'REST API polling every 500 milliseconds',
        },
        {
          id: 'D',
          label: 'SOAP API retrieve() requests over XML',
        },
      ],
      correctAnswerId: 'A',
      explanation:
        "The Salesforce Pub/Sub API uses gRPC over HTTP/2 with Apache Avro binary serialization. It delivers substantially higher throughput with minimal serialization overhead and built-in ReplayId offset management for zero message loss.",
      difficulty: 'hard',
    },
    revision: {
      id: 'sf-rev-platform-events',
      technology: 'salesforce',
      category: 'revision',
      title: "Platform Events vs Change Data Capture (CDC)",
      summary: "Review the differences between custom platform event schemas and automated object CDC.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_arch', 'salesforce_dev'],
      estimatedMinutes: 1,
      recallQuestion: "What is the primary difference between a Platform Event and a Change Data Capture event?",
      keyPoints: [
        'Platform Events have custom defined fields (__e) and are published explicitly via code or flow.',
        'Change Data Capture (CDC) events are automatically generated by Salesforce when records are created, updated, or deleted.',
        'Both events are retained in Salesforce for 72 hours for subscriber replay.',
      ],
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
  },
];

export function getTailoredReleaseFeed(profile?: any): DailyReleaseItem[] {
  if (!profile) return dailyReleaseFeed;
  const role = profile.role || 'salesforce_dev';
  const exp = profile.experience || '0-2';

  // Score each item based on role match and experience match
  const scored = dailyReleaseFeed.map((item) => {
    let score = 0;
    const applicableRoles = item.update.applicableRoles || [];

    // Role matching
    if (applicableRoles.includes(role)) {
      score += 20;
    } else if (applicableRoles.some((r) => r.includes(role.split('_')[1] || ''))) {
      score += 10;
    }

    // Experience matching
    const difficulty = item.update.difficulty || 'medium';
    if (exp === 'fresher' || exp === '0-2') {
      if (difficulty === 'easy') score += 15;
      else if (difficulty === 'medium') score += 8;
      else score += 1;
    } else if (exp === '2-5') {
      if (difficulty === 'medium') score += 15;
      else if (difficulty === 'hard') score += 10;
      else score += 6;
    } else { // 5-8 or 8+
      if (difficulty === 'hard') score += 18;
      else if (difficulty === 'medium') score += 10;
      else score += 2;
    }

    return { item, score };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.item.id.localeCompare(b.item.id);
  });

  return scored.map((s) => s.item);
}

export function getDailyReleaseByDate(date: Date = new Date(), offset: number = 0, profile?: any): DailyReleaseItem {
  const tailoredFeed = getTailoredReleaseFeed(profile);
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const total = tailoredFeed.length;
  const index = Math.abs((dayOfYear + offset) % total);
  return tailoredFeed[index];
}

export function getAllDailyReleaseContents(): LearningContent[] {
  const contents: LearningContent[] = [];
  for (const item of dailyReleaseFeed) {
    contents.push(item.update);
    contents.push(item.practiceContent);
    contents.push(item.revision);
  }
  return contents;
}

export function getQuizByContentId(contentId: string): QuizQuestion | undefined {
  const item = dailyReleaseFeed.find(
    (d) => d.practice.contentId === contentId || d.practice.id === contentId || d.update.id === contentId
  );
  return item ? item.practice : undefined;
}

export function getDailyReleaseInfo(offset: number = 0, profile?: any) {
  const tailoredFeed = getTailoredReleaseFeed(profile);
  const item = getDailyReleaseByDate(new Date(), offset, profile);
  const total = tailoredFeed.length;
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const dayOfYear = Math.floor((new Date().getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const currentIndex = Math.abs((dayOfYear + offset) % total);
  return {
    item,
    currentIndex: currentIndex + 1,
    totalTopics: total,
  };
}
