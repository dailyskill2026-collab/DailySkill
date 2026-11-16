// src/data/dailyReleaseFeed.ts
import { LearningContent, QuizQuestion } from '@/types/learning';

export interface DailyReleaseItem {
  id: string;
  releaseTag: string; // e.g., "Winter '25 GA", "Spring '25 Preview"
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
  // 1. Apex Cursors (Winter '25)
  {
    id: 'release-winter25-apex-cursors',
    releaseTag: "Winter '25 Release",
    topicCategory: 'Apex',
    update: {
      id: 'sf-rel-winter25-apex-cursors',
      technology: 'salesforce',
      category: 'update',
      title: "Apex Cursors: High-Volume SOQL Processing Without Heap Limits",
      summary: "Process up to 50 million records efficiently in chunks without hitting the 12MB synchronous heap limit or relying solely on heavy Batch Apex jobs.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_dev', 'salesforce_admin'],
      estimatedMinutes: 2,
      learningObjectives: [
        'Understand how Database.getCursor avoids heap memory consumption',
        'Fetch forward and backward chunks within transaction boundaries',
        'Compare Apex Cursors vs Batch Apex and SOQL for-loops',
      ],
      explanation:
        "Apex Cursors provide a lightweight, cursor-based mechanism to navigate large query result sets in manageable chunks. Instead of loading thousands of records into memory at once (which triggers System.LimitException: Apex heap size too large), cursors maintain a server-side pointer and fetch only the requested batch into memory.",
      realWorldExample:
        "An insurance claim payout engine processes 250,000 policy records in a Queueable worker. Instead of breaking down into a 4-hour Batch Apex job, it uses Database.getCursor() to process 500-record slices and enqueues successor jobs with the cursor offset.",
      codeSnippet: `// Winter '25 Apex Cursor Pattern
Database.Cursor cursor = Database.getCursor(
  'SELECT Id, Amount, StageName FROM Opportunity WHERE IsClosed = false'
);

// Fetch only the first 200 records into heap
List<Opportunity> batch = cursor.fetch(0, 200);
for (Opportunity opp : batch) {
  opp.Needs_Review__c = true;
}
update batch;`,
      keyTakeaways: [
        'Cursors allow chunking queries without exhausting the 12MB/6MB heap limit.',
        'Available in synchronous and asynchronous Apex transactions.',
        'Slices can be fetched by index offset using cursor.fetch(startIndex, count).',
      ],
      sourceName: 'Salesforce Winter ’25 Release Notes – Apex Cursors',
      sourceUrl: 'https://help.salesforce.com/s/articleView?id=release-notes.rn_apex_cursors.htm',
      sourcePublishedAt: '2024-10-15',
      lastVerifiedAt: '2024-10-20',
      releaseVersion: "Winter '25",
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practiceContent: {
      id: 'sf-practice-winter25-apex-cursors',
      technology: 'salesforce',
      category: 'practice',
      title: "Apex Cursors: Processing High-Volume Opportunity Records",
      summary: "Solve heap limits in Queueable Apex when processing 100,000+ records.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_dev'],
      estimatedMinutes: 2,
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practice: {
      id: 'quiz-winter25-apex-cursors',
      contentId: 'sf-practice-winter25-apex-cursors',
      questionType: 'scenario_mcq',
      scenario:
        "Your enterprise Salesforce org runs a Queueable Apex job nightly to reconcile 180,000 Order Line Items. The existing SOQL for-loop intermittently crashes with 'System.LimitException: Apex heap size too large' when line items carry multi-line text descriptions.",
      question:
        "Which modern Winter '25 architecture solves this heap exhaustion while keeping the job inside Queueable Apex?",
      options: [
        {
          id: 'A',
          label: 'Use Database.getCursor() to query records and fetch chunks of 200 records at a time per transaction',
        },
        {
          id: 'B',
          label: 'Increase the synchronous heap limit to 36MB using System.Limits.setHeapLimit()',
        },
        {
          id: 'C',
          label: 'Replace the Queueable job with a synchronous future method annotated with @future(heap=maximum)',
        },
        {
          id: 'D',
          label: 'Encase the SOQL query in a try-catch block and ignore the LimitException',
        },
      ],
      correctAnswerId: 'A',
      explanation:
        "Database.getCursor() maintains a server-side query pointer and lets you fetch records in controlled chunks (e.g. 200 items). This keeps heap consumption well under the governor limit. Salesforce governor limits cannot be increased dynamically via code (options B and C are fictitious), and LimitExceptions cannot be caught (option D).",
      difficulty: 'medium',
    },
    revision: {
      id: 'sf-rev-soql-bulkification',
      technology: 'salesforce',
      category: 'revision',
      title: "SOQL 101 Governor Limit & Bulk Collection Patterns",
      summary: "Prevent System.LimitException (SOQL 101) by aggregating IDs and querying outside loops.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_dev', 'salesforce_admin'],
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

  // 2. Agentforce Actions & Apex Invocable Methods (Winter '25)
  {
    id: 'release-winter25-agentforce-apex',
    releaseTag: "Winter '25 GA",
    topicCategory: 'Agentforce',
    update: {
      id: 'sf-rel-winter25-agentforce-apex',
      technology: 'salesforce',
      category: 'update',
      title: "Agentforce: Powering Autonomous AI Agents with Apex Invocable Actions",
      summary: "Equip Salesforce Agentforce autonomous agents with custom business logic and ERP integrations using type-safe @InvocableMethod actions.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_dev', 'salesforce_admin'],
      estimatedMinutes: 2,
      learningObjectives: [
        'Annotate Apex classes for Agentforce Prompt Builder and Agent Studio discovery',
        'Supply precise natural language descriptions so the LLM planner accurately selects the action',
        'Handle bulk request and response payloads safely',
      ],
      explanation:
        "Agentforce replaces traditional static chatbots with autonomous agents powered by reasoning engines. To let agents take action (e.g. check order status, issue refund, or reschedule appointment), developers publish Apex classes using the @InvocableMethod annotation. The agent’s reasoning engine inspects the action's description and parameter labels to decide when and how to invoke it.",
      realWorldExample:
        "A customer chats with an e-commerce Agentforce agent asking: 'Can you reroute my package to my office address?'. The agent inspects available actions, matches 'ReroutePackageApexAction', validates user security tokens, and calls the shipping courier API.",
      codeSnippet: `public with sharing class OrderSupportAgentActions {
  @InvocableMethod(
    label='Reroute Package Shipment'
    description='Reroutes an active package shipment to a new delivery address.'
    category='Agentforce Logistics'
  )
  public static List<RerouteResult> rerouteShipment(List<RerouteRequest> requests) {
    List<RerouteResult> results = new List<RerouteResult>();
    for (RerouteRequest req : requests) {
      // Execute verified address verification & shipping callout
      results.add(ShippingService.updateDestination(req.trackingNumber, req.newAddress));
    }
    return results;
  }
}`,
      keyTakeaways: [
        'Clear, descriptive labels and descriptions are essential for the Agentforce reasoning engine.',
        '@InvocableMethod must accept a List<Request> and return a List<Response> to satisfy bulkification.',
        'Ensure proper sharing rules (with sharing) to respect data security during autonomous agent calls.',
      ],
      sourceName: 'Salesforce Developer Docs – Agentforce Apex Invocable Actions',
      sourceUrl: 'https://developer.salesforce.com/docs/agentforce',
      sourcePublishedAt: '2024-10-01',
      lastVerifiedAt: '2024-10-25',
      releaseVersion: "Winter '25",
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practiceContent: {
      id: 'sf-practice-agentforce-actions',
      technology: 'salesforce',
      category: 'practice',
      title: "Agentforce Action Design: Parameter Signatures and Autonomy",
      summary: "Design invocable actions that autonomous agents can reliably execute.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_dev'],
      estimatedMinutes: 2,
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practice: {
      id: 'quiz-agentforce-actions',
      contentId: 'sf-practice-agentforce-actions',
      questionType: 'scenario_mcq',
      scenario:
        "You are building a custom Apex action for an Agentforce Service Agent to check warranty coverage on industrial machinery. During testing, the agent frequently selects the wrong action or fails to pass the serial number.",
      question:
        "What is the recommended best practice to ensure the Agentforce reasoning engine reliably selects and correctly populates your Invocable Apex action?",
      options: [
        {
          id: 'A',
          label: 'Provide unambiguous, intent-focused descriptions on both the @InvocableMethod and each @InvocableVariable parameter',
        },
        {
          id: 'B',
          label: 'Hardcode the user prompt keywords inside the Apex class constructor',
        },
        {
          id: 'C',
          label: 'Make all input variables untyped Object references to allow arbitrary inputs',
        },
        {
          id: 'D',
          label: 'Wrap the Invocable action in a legacy Process Builder automation',
        },
      ],
      correctAnswerId: 'A',
      explanation:
        "Agentforce uses LLM reasoning to evaluate action metadata. Providing clear, precise descriptions on @InvocableMethod and @InvocableVariable informs the agent exactly what the tool does and what input formats (e.g. '10-digit serial number') are required.",
      difficulty: 'medium',
    },
    revision: {
      id: 'sf-rev-invocable-apex-limits',
      technology: 'salesforce',
      category: 'revision',
      title: "Apex @InvocableMethod Bulkification Requirements",
      summary: "Review how Flow and Agent engines invoke Apex methods in bulk batches.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_dev'],
      estimatedMinutes: 1,
      recallQuestion: "Why must @InvocableMethod always accept List<Input> and return List<Output>?",
      keyPoints: [
        'Flow and Agent engines execute actions in bulk batches across multiple records or user requests.',
        'The output list count and order must match the input list count exactly.',
        'Only one @InvocableMethod is permitted per Apex class.',
      ],
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
  },

  // 3. LWC Workspace API (Winter '25)
  {
    id: 'release-winter25-lwc-workspace-api',
    releaseTag: "Winter '25 GA",
    topicCategory: 'LWC',
    update: {
      id: 'sf-rel-winter25-lwc-workspace-api',
      technology: 'salesforce',
      category: 'update',
      title: "LWC Workspace API: Native Console Tab Navigation Without Aura",
      summary: "Directly open, focus, close, and refresh Lightning Console workspace tabs and subtabs directly from Lightning Web Components.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_dev'],
      estimatedMinutes: 2,
      learningObjectives: [
        'Import workspace adapters from lightning/platformWorkspaceApi',
        'Open records in focused primary tabs or contextual subtabs',
        'Eliminate legacy Aura wrapper components from Service Cloud implementations',
      ],
      explanation:
        "Previously, interacting with Lightning Console tabs required wrapping modern LWCs inside an Aura component to leverage lightning:workspaceAPI. With the native LWC Workspace API, developers can directly import wire adapters and methods (openTab, openSubtab, focusTab, closeTab) from lightning/platformWorkspaceApi.",
      realWorldExample:
        "A Service Cloud agent viewing a Case clicks 'Open Customer 360'. The LWC directly calls openSubtab() passing the Contact ID and sets the subtab title to the customer's full name without page reloads.",
      codeSnippet: `import { LightningElement, wire } from 'lwc';
import { WorkspaceContext, openSubtab, focusTab } from 'lightning/platformWorkspaceApi';

export default class CaseActionConsole extends LightningElement {
  @wire(WorkspaceContext) workspaceContext;

  async openContactSubtab(contactId) {
    if (!this.workspaceContext.focusedTabId) return;
    
    await openSubtab(this.workspaceContext.focusedTabId, {
      recordId: contactId,
      focus: true
    });
  }
}`,
      keyTakeaways: [
        'Native LWC workspace API completely eliminates the need for legacy Aura wrappers.',
        'Use @wire(WorkspaceContext) to retrieve the active tab and subtab context.',
        'Works seamlessly in Lightning Service Console and Sales Console applications.',
      ],
      sourceName: 'Salesforce Developer Docs – LWC Platform Workspace API',
      sourceUrl: 'https://developer.salesforce.com/docs/platform/lwc/guide/workspace-api.html',
      sourcePublishedAt: '2024-09-20',
      lastVerifiedAt: '2024-10-18',
      releaseVersion: "Winter '25",
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practiceContent: {
      id: 'sf-practice-lwc-workspace-api',
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
      id: 'quiz-lwc-workspace-api',
      contentId: 'sf-practice-lwc-workspace-api',
      questionType: 'scenario_mcq',
      scenario:
        "A Service Console project requires an LWC on the Account page that allows support reps to click a button to open an associated Order in a new subtab under the current Account tab.",
      question:
        "What is the modern, recommended approach in Winter '25 to implement this requirement?",
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
        "Winter '25 provides native LWC Workspace API support via 'lightning/platformWorkspaceApi'. Developers can call openSubtab() directly without needing legacy Aura wrappers or non-console window popups.",
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
      applicableRoles: ['salesforce_dev'],
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

  // 4. Data Cloud Vector Search in Apex (Spring '25)
  {
    id: 'release-spring25-vector-search',
    releaseTag: "Spring '25 Preview",
    topicCategory: 'Data Cloud',
    update: {
      id: 'sf-rel-spring25-vector-search',
      technology: 'salesforce',
      category: 'update',
      title: "Data Cloud Vector Search: Semantic & Hybrid Search in Apex",
      summary: "Query unstructured knowledge, PDF manuals, and customer transcripts using vector embeddings and semantic search directly inside Apex.",
      contentType: 'article',
      difficulty: 'hard',
      applicableRoles: ['salesforce_dev'],
      estimatedMinutes: 2,
      learningObjectives: [
        'Understand semantic similarity vs exact keyword SOSL matching',
        'Execute vector search queries via ConnectApi.DataCloudVectorSearch',
        'Combine structured metadata filters with semantic cosine similarity',
      ],
      explanation:
        "Traditional SOSL and SOQL rely on lexical matching (exact keywords or wildcards). Data Cloud Vector Search indexes unstructured text into high-dimensional vector embeddings. In Spring '25, Apex developers can execute semantic searches directly via ConnectApi to find knowledge articles or cases that match the conceptual meaning of a customer doubt, even when terminology differs completely.",
      realWorldExample:
        "A technician queries: 'AC compressor vibrating with buzzing sound'. Semantic vector search matches a technical PDF manual titled 'Refrigerant Pump Resonance & Harmonic Damping' despite having zero keyword overlap.",
      codeSnippet: `// Spring '25 Data Cloud Semantic Vector Search
ConnectApi.VectorSearchInput searchInput = new ConnectApi.VectorSearchInput();
searchInput.searchQuery = 'compressor buzzing and shaking violently';
searchInput.numResults = 5;
searchInput.indexDeveloperName = 'Equipment_Manuals_Vector_Index';

ConnectApi.VectorSearchResult result = ConnectApi.DataCloud.search(searchInput);
for (ConnectApi.VectorSearchResultItem item : result.results) {
  System.debug('Matched Document: ' + item.documentTitle + ' Score: ' + item.similarityScore);
}`,
      keyTakeaways: [
        'Vector search allows semantic meaning retrieval rather than rigid keyword matching.',
        'Powered by Data Cloud vector database and embedding models.',
        'Enables enterprise RAG (Retrieval-Augmented Generation) architectures within Salesforce.',
      ],
      sourceName: 'Salesforce Spring ’25 Release Notes – Data Cloud Vector Search',
      sourceUrl: 'https://developer.salesforce.com/docs/data-cloud',
      sourcePublishedAt: '2024-11-01',
      lastVerifiedAt: '2024-11-12',
      releaseVersion: "Spring '25",
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practiceContent: {
      id: 'sf-practice-vector-search',
      technology: 'salesforce',
      category: 'practice',
      title: "Semantic Search: Matching Customer Intent vs Keyword Searches",
      summary: "Select the optimal search architecture for complex customer service knowledge retrieval.",
      contentType: 'article',
      difficulty: 'hard',
      applicableRoles: ['salesforce_dev'],
      estimatedMinutes: 2,
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practice: {
      id: 'quiz-vector-search',
      contentId: 'sf-practice-vector-search',
      questionType: 'scenario_mcq',
      scenario:
        "A global telecommunications provider has 50,000 troubleshooting articles written in varying technical jargon. Customers describe issues using colloquial terms (e.g., 'my net is freezing'), while the articles use technical terms ('packet drop rate high'). SOSL queries frequently return zero matches.",
      question:
        "Which Salesforce capability bridges the gap between colloquial queries and technical terminology using semantic vector embeddings?",
      options: [
        {
          id: 'A',
          label: 'Data Cloud Vector Search with semantic embeddings',
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
        "Data Cloud Vector Search converts both the unstructured articles and the user query into semantic vector embeddings. It calculates distance (cosine similarity) in semantic concept space, successfully matching 'net is freezing' to 'packet drop' without requiring explicit keyword overlap.",
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

  // 5. Null Coalescing Operator in Apex (Winter '25)
  {
    id: 'release-winter25-null-coalescing',
    releaseTag: "Winter '25 GA",
    topicCategory: 'Apex',
    update: {
      id: 'sf-rel-winter25-null-coalescing',
      technology: 'salesforce',
      category: 'update',
      title: "Apex Null Coalescing (`??`) and Safe Navigation (`?.`) Operators",
      summary: "Eliminate verbose ternary checks and defensive null guards with clean, modern syntax in Apex.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_dev'],
      estimatedMinutes: 2,
      learningObjectives: [
        'Utilize the null coalescing operator (??) to supply fallback default values',
        'Chain safe navigation (?.) with null coalescing for bulletproof expressions',
        'Refactor legacy defensive code to reduce cyclomatic complexity',
      ],
      explanation:
        "The Null Coalescing operator (??) returns the left-hand operand if it isn't null; otherwise, it evaluates and returns the right-hand operand. Paired with the Safe Navigation operator (?.), it transforms multi-line nested null checks into a single readable statement.",
      realWorldExample:
        "Extracting billing country codes from a Contact's Account. Rather than checking if Contact != null, Contact.Account != null, Contact.Account.BillingCountry != null, developers write a one-liner with graceful fallback.",
      codeSnippet: `// Modern Apex Null-Safe Pattern
String country = con?.Account?.BillingCountry ?? 'USA';

Integer batchSize = customSetting?.Batch_Size__c?.intValue() ?? 200;

List<Account> accounts = accountMap?.get(targetId) ?? new List<Account>();`,
      keyTakeaways: [
        'Left-hand operand is evaluated only once; right-hand operand is evaluated only if the left is null.',
        'Replaces clumsy ternary: (val != null ? val : defaultVal) with (val ?? defaultVal).',
        'Significantly reduces cyclomatic complexity and unit test branching requirements.',
      ],
      sourceName: 'Salesforce Apex Developer Guide – Null Coalescing Operator',
      sourceUrl: 'https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/langCon_apex_expressions_operators.htm',
      sourcePublishedAt: '2024-09-15',
      lastVerifiedAt: '2024-10-10',
      releaseVersion: "Winter '25",
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practiceContent: {
      id: 'sf-practice-null-coalescing',
      technology: 'salesforce',
      category: 'practice',
      title: "Null-Safety Refactoring: Eliminating System.NullPointerException",
      summary: "Apply null coalescing and safe navigation operators in trigger handler logic.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_dev'],
      estimatedMinutes: 2,
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practice: {
      id: 'quiz-null-coalescing',
      contentId: 'sf-practice-null-coalescing',
      questionType: 'scenario_mcq',
      scenario:
        "In a high-volume Account trigger, an existing utility method reads discount percentages: \n`Decimal discount = (acc.Tier__r != null && acc.Tier__r.Discount__c != null) ? acc.Tier__r.Discount__c : 0.05;`",
      question:
        "What is the cleanest and most idiomatic Winter '25 Apex syntax to achieve the exact same logic?",
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
      applicableRoles: ['salesforce_dev'],
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

  // 6. User Access Policies (Spring '25)
  {
    id: 'release-spring25-user-access-policies',
    releaseTag: "Spring '25 GA",
    topicCategory: 'Security',
    update: {
      id: 'sf-rel-spring25-user-access-policies',
      technology: 'salesforce',
      category: 'update',
      title: "User Access Policies: Automated Declarative Entitlement Provisioning",
      summary: "Automatically grant and revoke Permission Sets, Permission Set Groups, and Managed Package licenses based on user criteria without custom trigger code.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_admin', 'salesforce_dev'],
      estimatedMinutes: 2,
      learningObjectives: [
        'Configure criteria-based User Access Policies (UAP) in Setup',
        'Automate Permission Set Group and package license assignments on user create/update',
        'Deprecate brittle custom User triggers for access provisioning',
      ],
      explanation:
        "User Access Policies provide a native, declarative engine to automate the assignment of access entitlements. When a user record is created or updated, Salesforce evaluates the policy criteria (e.g., Department = 'Finance' AND Country = 'UK') and automatically grants or revokes specified Permission Set Groups, Public Groups, and Managed Package Licenses.",
      realWorldExample:
        "An enterprise with 10,000 employees onboarded 200 sales reps. Rather than running a custom User before-insert trigger that frequently threw mixed DML errors, User Access Policies automatically assign the Sales Cloud PSG and Tableau CRM license seamlessly.",
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
      sourceName: 'Salesforce Setup Guide – User Access Policies',
      sourceUrl: 'https://help.salesforce.com/s/articleView?id=sf.perm_user_access_policies.htm',
      sourcePublishedAt: '2024-11-05',
      lastVerifiedAt: '2024-11-15',
      releaseVersion: "Spring '25",
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practiceContent: {
      id: 'sf-practice-uap',
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
      id: 'quiz-uap',
      contentId: 'sf-practice-uap',
      questionType: 'scenario_mcq',
      scenario:
        "A Salesforce admin reports that an Apex trigger on the User object assigning PermissionSetAssignment records throws 'MIXED_DML_OPERATION' whenever a user update also touches an Account or custom object in the same transaction.",
      question:
        "What is the recommended declarative solution in Spring '25 to eliminate this error and automate permission assignment?",
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
];

export function getDailyReleaseByDate(date: Date = new Date(), offset: number = 0): DailyReleaseItem {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const total = dailyReleaseFeed.length;
  const index = Math.abs((dayOfYear + offset) % total);
  return dailyReleaseFeed[index];
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

export function getDailyReleaseInfo(offset: number = 0) {
  const item = getDailyReleaseByDate(new Date(), offset);
  const total = dailyReleaseFeed.length;
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const dayOfYear = Math.floor((new Date().getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const currentIndex = Math.abs((dayOfYear + offset) % total);
  return {
    item,
    currentIndex: currentIndex + 1,
    totalTopics: total,
  };
}

