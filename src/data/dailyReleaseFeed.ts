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
  // 1. WINTER '27 RELEASE: Agentforce Invocable Actions
  // =========================================================================
  {
    id: 'release-winter27-agentforce-apex',
    releaseTag: "Winter '27 Release",
    topicCategory: 'Agentforce',
    update: {
      id: 'sf-rel-winter27-agentforce-apex',
      technology: 'salesforce',
      category: 'update',
      title: "Agentforce: Connect AI Chatbots to Custom Code",
      summary: "Help your Salesforce AI assistant take real actions—like updating records or booking flights—by connecting it directly to your custom code.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_dev', 'salesforce_arch', 'salesforce_consult', 'salesforce_lead'],
      estimatedMinutes: 2,
      learningObjectives: [
        'Learn how to let AI run your custom code using simple annotations',
        'Write clear descriptions so the AI knows when to trigger your action',
        'Save hours of manual support time with automated actions',
      ],
      explanation:
        "In the Winter '27 Release, Salesforce lets your AI chatbot call your custom code directly. When a customer types a message in plain English, the AI reads it, figures out what they need, and runs your code right away. All you need to do is give your code a clear label and description so the AI knows what it does.",
      realWorldExample:
        "A customer chats with your support bot asking to change their flight. The AI understands the request, calls your custom booking code, updates the ticket, and sends a confirmation text in seconds—without needing a human agent.",
      codeSnippet: `// Simple action that AI can run for users
public class BookingActions {
  @InvocableMethod(
    label='Rebook Customer Flight'
    description='Changes a customer booking to a new time and sends a confirmation email'
  )
  public static List<String> changeFlight(List<String> ticketNumbers) {
    // Code updates the booking in Salesforce
    return new List<String>{ 'Flight successfully updated!' };
  }
}`,
      keyTakeaways: [
        'Give your code simple, clear descriptions so the AI knows when to use it.',
        'The AI reads the user message and picks the right action automatically.',
        'Saves time by letting AI solve customer requests 24/7 without manual effort.',
      ],
      sourceName: 'Salesforce Official Docs – Agentforce Actions',
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
        "You built a custom action for an AI assistant to check customer warranty claims. However, when users chat with the bot, it gets confused and picks the wrong action.",
      question:
        "What is the best way to help the AI assistant pick the correct action every time?",
      options: [
        {
          id: 'A',
          label: 'Write clear, simple descriptions on the method explaining exactly what it does and when to use it',
        },
        {
          id: 'B',
          label: 'Hardcode exact question phrases inside the class code',
        },
        {
          id: 'C',
          label: 'Make all inputs plain untyped objects without names',
        },
        {
          id: 'D',
          label: 'Wrap the code inside an old Workflow Rule',
        },
      ],
      correctAnswerId: 'A',
      explanation:
        "The AI decides which code to run by reading your descriptions. Writing clear, plain-English descriptions helps the AI match customer questions to the right code every time.",
      difficulty: 'medium',
    },
    revision: {
      id: 'sf-rev-invocable-limits',
      technology: 'salesforce',
      category: 'revision',
      title: "Apex Invocable Action Rules",
      summary: "Quick refresher on how actions work with AI and Flows.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_dev', 'salesforce_fresher'],
      estimatedMinutes: 1,
      recallQuestion: "Why should Invocable actions always accept and return Lists in Salesforce?",
      keyPoints: [
        'Salesforce processes records in batches to handle many users at once.',
        'Using Lists allows the code to run safely for 1 or 200 records at the same time.',
        'Keep your method descriptions simple and descriptive for the AI.',
      ],
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
  },

  // =========================================================================
  // 2. WINTER '27 RELEASE: Apex Cursors
  // =========================================================================
  {
    id: 'release-winter27-apex-cursors',
    releaseTag: "Winter '27 Release",
    topicCategory: 'Apex',
    update: {
      id: 'sf-rel-winter27-apex-cursors',
      technology: 'salesforce',
      category: 'update',
      title: "Apex Cursors: Read Large Lists of Data Without Errors",
      summary: "Work with huge amounts of data safely without running into memory limit crashes.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_dev', 'salesforce_arch', 'salesforce_lead'],
      estimatedMinutes: 2,
      learningObjectives: [
        'Read huge query results in small, safe chunks',
        'Prevent the dreaded "Apex heap size too large" error',
        'Build fast background jobs without complicated code',
      ],
      explanation:
        "Earlier in Salesforce, trying to load thousands of records all at once would crash your code because of strict memory limits. Apex Cursors fix this problem. Instead of holding all records in memory at once, a cursor acts like a bookmark that reads records in small, clean batches of 200 at a time.",
      realWorldExample:
        "An insurance company needs to review 50,000 policy claims every night. Using Apex Cursors, the system checks 200 claims at a time smoothly without crashing or freezing the app.",
      codeSnippet: `// Create a bookmark on your query
Database.Cursor myCursor = Database.getCursor(
  'SELECT Id, Amount FROM Opportunity WHERE IsClosed = false'
);

// Fetch only 200 records at a time into memory
List<Opportunity> batch = myCursor.fetch(0, 200);
for (Opportunity opp : batch) {
  // Review records safely
}
update batch;`,
      keyTakeaways: [
        'Fetches records in small chunks so your code never runs out of memory.',
        'Works smoothly in both quick screen actions and background jobs.',
        'Much easier to set up and maintain than older heavy batch tools.',
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
        "Your nightly job needs to update 100,000 order records. Currently, the job crashes with a 'Memory / Heap limit too large' error because it tries to read too many records at once.",
      question:
        "What is the recommended modern solution in Winter '27 to fix this memory crash?",
      options: [
        {
          id: 'A',
          label: 'Use Database.getCursor() to fetch small batches of 200 records at a time',
        },
        {
          id: 'B',
          label: 'Increase memory limits in code using a secret command',
        },
        {
          id: 'C',
          label: 'Put the query inside a try-catch block to ignore the crash',
        },
        {
          id: 'D',
          label: 'Delete half the records before running the job',
        },
      ],
      correctAnswerId: 'A',
      explanation:
        "Database.getCursor() acts like a smart bookmark, reading small chunks of 200 records at a time so memory never fills up.",
      difficulty: 'medium',
    },
    revision: {
      id: 'sf-rev-soql-bulk',
      technology: 'salesforce',
      category: 'revision',
      title: "SOQL 101 Query Limits & Clean Code",
      summary: "Prevent query errors by querying outside of loops.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_dev', 'salesforce_fresher'],
      estimatedMinutes: 1,
      recallQuestion: "What is the single most important rule to prevent query limit crashes in Apex?",
      keyPoints: [
        'Never put a database query (SOQL) inside a for-loop.',
        'Collect all IDs first, then run a single query outside the loop.',
        'Use Maps to quickly look up related data in memory.',
      ],
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
  },

  // =========================================================================
  // 3. WINTER '27 RELEASE: Data Cloud Zero-Copy Federation
  // =========================================================================
  {
    id: 'release-winter27-data-cloud-federation',
    releaseTag: "Winter '27 Release",
    topicCategory: 'Data Cloud',
    update: {
      id: 'sf-rel-winter27-data-cloud-federation',
      technology: 'salesforce',
      category: 'update',
      title: "Data Cloud: View Outside Data Without Copying It",
      summary: "Connect directly to outside databases like Snowflake or Google BigQuery and see live data in Salesforce without duplicating it.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_arch', 'salesforce_dev', 'salesforce_consult'],
      estimatedMinutes: 2,
      learningObjectives: [
        'See live company data from outside warehouses inside Salesforce',
        'Avoid paying extra money for duplicate storage',
        'Keep customer profile information up to date automatically',
      ],
      explanation:
        "Instead of paying to copy millions of data rows into Salesforce, you can now connect directly to your company's existing data warehouses (like Snowflake or BigQuery). Salesforce reads the data live whenever you view a page or run a report, without storing a duplicate copy.",
      realWorldExample:
        "A sales rep opens a customer page. Salesforce instantly displays the customer's total spending and past 5 years of purchase history directly from the warehouse—without anyone having to run nightly sync jobs.",
      codeSnippet: `// Query live warehouse data without storing it in Salesforce
List<DataLakeObject__dl> livePurchases = [
  SELECT OrderTotal__c, PurchaseDate__c, CustomerID__c
  FROM CustomerPurchases_Live__dl
  WHERE CustomerID__c = :currentAccount.External_ID__c
  LIMIT 10
];`,
      keyTakeaways: [
        'Zero duplicate storage—data stays safely in your main warehouse.',
        'Sales reps see live, accurate numbers on screen instantly.',
        'Saves money and removes the headache of fixing broken data syncs.',
      ],
      sourceName: 'Salesforce Help – Data Cloud Federation',
      sourceUrl: 'https://help.salesforce.com/s/articleView?id=sf.c360_a_zero_copy_partner_network.htm',
      sourcePublishedAt: '2026-10-18',
      lastVerifiedAt: '2026-11-01',
      releaseVersion: "Winter '27",
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practiceContent: {
      id: 'sf-practice-winter27-datacloud',
      technology: 'salesforce',
      category: 'practice',
      title: "Data Cloud: Zero-Copy Architecture Design",
      summary: "Evaluate zero-copy vs ETL replication for enterprise data warehouses.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_arch', 'salesforce_dev'],
      estimatedMinutes: 2,
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practice: {
      id: 'quiz-winter27-datacloud',
      contentId: 'sf-practice-winter27-datacloud',
      questionType: 'scenario_mcq',
      scenario:
        "Your company has 40 million past order records stored in Snowflake. The sales team wants to see these orders on account pages, but your Salesforce storage budget is already full.",
      question:
        "What is the best way to let users see this data without buying expensive Salesforce storage?",
      options: [
        {
          id: 'A',
          label: 'Use Data Cloud Zero-Copy Federation to view the Snowflake data live without copying it',
        },
        {
          id: 'B',
          label: 'Export CSV files every night and manually upload them into Custom Objects',
        },
        {
          id: 'C',
          label: 'Paste all 40 million records into a Long Text field on the Account',
        },
        {
          id: 'D',
          label: 'Ask customers to email their past orders whenever they call support',
        },
      ],
      correctAnswerId: 'A',
      explanation:
        "Zero-Copy Federation lets Salesforce read and show outside data on demand, so you don't have to duplicate records or pay for extra storage.",
      difficulty: 'medium',
    },
    revision: {
      id: 'sf-rev-connectapi',
      technology: 'salesforce',
      category: 'revision',
      title: "Salesforce External Data Basics",
      summary: "Understand how Salesforce connects to outside systems safely.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_dev', 'salesforce_arch'],
      estimatedMinutes: 1,
      recallQuestion: "What is the biggest benefit of connecting to outside data live instead of copying it?",
      keyPoints: [
        'You never have to deal with outdated copies of data.',
        'You avoid paying for duplicate database storage.',
        'Changes in the outside system show up immediately in Salesforce.',
      ],
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
  },

  // =========================================================================
  // 4. WINTER '27 RELEASE: LWC Workspace API
  // =========================================================================
  {
    id: 'release-winter27-lwc-workspace-api',
    releaseTag: "Winter '27 Release",
    topicCategory: 'LWC',
    update: {
      id: 'sf-rel-winter27-lwc-workspace-api',
      technology: 'salesforce',
      category: 'update',
      title: "LWC Workspace API: Control Console Tabs with Code",
      summary: "Open, close, rename, and refresh browser tabs directly from modern Lightning Web Components.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_dev', 'salesforce_lead'],
      estimatedMinutes: 2,
      learningObjectives: [
        'Open new sub-tabs with one click inside service console apps',
        'Rename tab labels dynamically when a customer record changes',
        'Close completed case tabs automatically to keep screens tidy',
      ],
      explanation:
        "If your team uses Salesforce Console with multiple tabs open, you can now easily control those tabs with modern Lightning Web Components. You can open a new sub-tab, rename a tab with a customer's name, or close a tab once an issue is resolved—all with a single line of JavaScript.",
      realWorldExample:
        "When a support agent finishes resolving a customer's complaint, clicking 'Complete Case' automatically closes the case tab and brings the agent right back to their active queue.",
      codeSnippet: `import { LightningElement, wire } from 'lwc';
import { openSubtab, getFocusedTabInfo } from 'lightning/platformWorkspaceApi';

export default class QuickCaseOpener extends LightningElement {
  async openCustomerDetails(recordId) {
    const parent = await getFocusedTabInfo();
    // Open a new sub-tab next to the active customer tab
    await openSubtab(parent.tabId, {
      recordId: recordId,
      focus: true
    });
  }
}`,
      keyTakeaways: [
        'Easily open, focus, or close tabs right from Lightning Web Components.',
        'Keeps support agents organized and saves them dozens of clicks a day.',
        'Faster and cleaner than older Aura components.',
      ],
      sourceName: 'Salesforce Developer Docs – LWC Workspace API',
      sourceUrl: 'https://developer.salesforce.com/docs/component-library/bundle/lightning-platform-workspace-api',
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
      title: "LWC Workspace API: Subtab Navigation Patterns",
      summary: "Programmatically open and manage workspace tabs in Lightning Console.",
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
        "Your support agents want a button inside their Lightning component that automatically closes the current case tab after they click 'Resolve Ticket'.",
      question:
        "What is the modern Salesforce tool to control console tabs directly in LWC?",
      options: [
        {
          id: 'A',
          label: 'lightning/platformWorkspaceApi methods like closeTab() and getFocusedTabInfo()',
        },
        {
          id: 'B',
          label: 'Using window.close() inside regular JavaScript',
        },
        {
          id: 'C',
          label: 'Asking users to press Ctrl + W on their keyboard',
        },
        {
          id: 'D',
          label: 'Reloading the whole browser page with window.location.reload()',
        },
      ],
      correctAnswerId: 'A',
      explanation:
        "The lightning/platformWorkspaceApi module gives you built-in functions like closeTab() and openSubtab() to manage tabs smoothly inside Console apps.",
      difficulty: 'medium',
    },
    revision: {
      id: 'sf-rev-lwc-lifecycle',
      technology: 'salesforce',
      category: 'revision',
      title: "LWC Component Lifecycle",
      summary: "Understand when components load and render on screen.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_dev', 'salesforce_fresher'],
      estimatedMinutes: 1,
      recallQuestion: "Which lifecycle hook runs automatically as soon as an LWC is added to the page?",
      keyPoints: [
        'connectedCallback() fires when the component is placed on the screen.',
        'Use it to load initial data, subscribe to messages, or check tab info.',
        'disconnectedCallback() runs when the component is removed to clean up listeners.',
      ],
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
  },

  // =========================================================================
  // 5. SUMMER '26 RELEASE: Vector Search in Data Cloud
  // =========================================================================
  {
    id: 'release-summer26-vector-search',
    releaseTag: "Summer '26 Release",
    topicCategory: 'Data Cloud',
    update: {
      id: 'sf-rel-summer26-vector-search',
      technology: 'salesforce',
      category: 'update',
      title: "Vector Search: Search by Meaning Instead of Exact Words",
      summary: "Find the right documents, products, and answers even if the user makes typos or uses completely different words.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_dev', 'salesforce_arch', 'salesforce_consult'],
      estimatedMinutes: 2,
      learningObjectives: [
        'Understand how search can find articles without exact word matches',
        'Help customers find help articles even when they misspell terms',
        'Feed accurate company knowledge to your AI assistants',
      ],
      explanation:
        "Standard search only looks for exact words. If a customer types 'broken screen', old search wouldn't find an article titled 'Cracked Glass Display'. Vector Search understands what words actually mean, so it easily connects 'broken screen' to 'cracked display' and shows the right solution right away.",
      realWorldExample:
        "A user types 'How do I stop receiving promotional emails?' into your help portal. Vector Search instantly returns your article 'Managing Newsletter Subscription Preferences' even though the words are completely different.",
      codeSnippet: `// Search knowledge articles by meaning rather than exact words
List<KnowledgeArticleVersion> matches = Search.findSimilarArticles(
  'My mobile phone screen has cracked glass',
  'KnowledgeArticle__ka',
  5 // top 5 most relevant answers
);`,
      keyTakeaways: [
        'Understands meaning and intent rather than just exact keywords.',
        'Finds the right answer even when users make typos or use different words.',
        'Gives your AI assistants the exact context they need to answer customer questions.',
      ],
      sourceName: 'Salesforce Official Docs – Vector Search',
      sourceUrl: 'https://help.salesforce.com/s/articleView?id=sf.c360_a_vector_database_search.htm',
      sourcePublishedAt: '2026-06-15',
      lastVerifiedAt: '2026-11-01',
      releaseVersion: "Summer '26",
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practiceContent: {
      id: 'sf-practice-summer26-vector',
      technology: 'salesforce',
      category: 'practice',
      title: "Vector Search: Semantic Search vs Keyword Indexing",
      summary: "Compare semantic vector queries with traditional text search.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_dev', 'salesforce_arch'],
      estimatedMinutes: 2,
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practice: {
      id: 'quiz-summer26-vector-search',
      contentId: 'sf-practice-summer26-vector',
      questionType: 'scenario_mcq',
      scenario:
        "Customers searching your help portal often complain they cannot find articles because they don't know the official technical terminology.",
      question:
        "Why does Vector Search solve this problem better than traditional keyword search?",
      options: [
        {
          id: 'A',
          label: 'It matches questions based on meaning and context, not just exact word spelling',
        },
        {
          id: 'B',
          label: 'It deletes all articles that contain typos',
        },
        {
          id: 'C',
          label: 'It forces customers to pass a vocabulary test before searching',
        },
        {
          id: 'D',
          label: 'It only returns articles written in the past 24 hours',
        },
      ],
      correctAnswerId: 'A',
      explanation:
        "Vector Search understands the meaning behind phrases, allowing it to connect everyday customer wording with official technical documentation.",
      difficulty: 'medium',
    },
    revision: {
      id: 'sf-rev-sosl',
      technology: 'salesforce',
      category: 'revision',
      title: "Salesforce Search Basics (SOSL)",
      summary: "Quick review of text search across multiple objects.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_dev', 'salesforce_fresher'],
      estimatedMinutes: 1,
      recallQuestion: "When should you use SOSL text search instead of SOQL database queries?",
      keyPoints: [
        'Use SOSL when you need to search for text across multiple objects (like Leads and Contacts) at once.',
        'Use SOQL when you know the exact object and fields you want to query.',
        'Both tools help you find the right data quickly without slowing down Salesforce.',
      ],
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
  },

  // =========================================================================
  // 6. SUMMER '26 RELEASE: User Access Policies
  // =========================================================================
  {
    id: 'release-summer26-user-access-policies',
    releaseTag: "Summer '26 Release",
    topicCategory: 'Security',
    update: {
      id: 'sf-rel-summer26-user-access-policies',
      technology: 'salesforce',
      category: 'update',
      title: "User Access Policies: Give Permissions Automatically",
      summary: "Automatically assign permission sets, licenses, and groups to employees based on their job role or department.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_admin', 'salesforce_lead', 'salesforce_consult'],
      estimatedMinutes: 2,
      learningObjectives: [
        'Automate employee onboarding without manual clicking',
        'Assign licenses and permission sets based on department rules',
        'Remove permissions automatically when an employee changes roles',
      ],
      explanation:
        "Instead of manually clicking around to assign permission sets whenever a new employee joins the company, Salesforce can now do it automatically. You create a simple rule (like 'Anyone with Role = Sales Rep gets the Sales License'), and Salesforce assigns everything on day one.",
      realWorldExample:
        "When an employee transfers from Sales to Support, updating their department in Salesforce automatically removes their Sales permissions and grants them Support permissions in seconds.",
      codeSnippet: `// User Access Policy Rule:
// Criteria: User.Department EQUALS 'Customer Support'
// Action 1: Grant Permission Set 'Service_Cloud_Agent'
// Action 2: Assign Package License 'Service Console'
// Result: Zero manual admin clicks required!`,
      keyTakeaways: [
        'Assigns permission sets and licenses automatically based on user fields.',
        'Prevents human mistakes and ensures new hires have access on their first day.',
        'Saves hours of repetitive setup work for Salesforce administrators.',
      ],
      sourceName: 'Salesforce Help – User Access Policies',
      sourceUrl: 'https://help.salesforce.com/s/articleView?id=sf.perm_user_access_policies.htm',
      sourcePublishedAt: '2026-06-20',
      lastVerifiedAt: '2026-11-01',
      releaseVersion: "Summer '26",
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practiceContent: {
      id: 'sf-practice-summer26-policies',
      technology: 'salesforce',
      category: 'practice',
      title: "Automated User Provisioning with Access Policies",
      summary: "Set up automatic permission set assignments based on department rules.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_admin', 'salesforce_consult'],
      estimatedMinutes: 2,
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practice: {
      id: 'quiz-summer26-access-policies',
      contentId: 'sf-practice-summer26-policies',
      questionType: 'scenario_mcq',
      scenario:
        "Your company hires 50 new sales representatives every month. The IT admin spends hours every Monday manually assigning 6 different permission sets to each new user.",
      question:
        "What is the recommended declarative way to automate these permission assignments?",
      options: [
        {
          id: 'A',
          label: 'Create a User Access Policy that automatically grants the 6 permission sets when Department = Sales',
        },
        {
          id: 'B',
          label: 'Give all new hires the System Administrator profile',
        },
        {
          id: 'C',
          label: 'Ask employees to share their login passwords with colleagues',
        },
        {
          id: 'D',
          label: 'Disable all security checks in the Salesforce org',
        },
      ],
      correctAnswerId: 'A',
      explanation:
        "User Access Policies automatically grant or revoke permission sets and licenses whenever user records match your criteria.",
      difficulty: 'easy',
    },
    revision: {
      id: 'sf-rev-permission-sets',
      technology: 'salesforce',
      category: 'revision',
      title: "Profiles vs Permission Sets",
      summary: "Understand the modern way Salesforce manages security access.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_admin', 'salesforce_fresher'],
      estimatedMinutes: 1,
      recallQuestion: "Why does Salesforce recommend using Permission Sets instead of creating dozens of Profiles?",
      keyPoints: [
        'Permission Sets let you grant extra access modularly without creating duplicate profiles.',
        'You can easily give or take away a single feature without affecting other users.',
        'Keeps your security configuration clean, organized, and easy to audit.',
      ],
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
  },

  // =========================================================================
  // 7. SUMMER '26 RELEASE: Null Coalescing Operator
  // =========================================================================
  {
    id: 'release-summer26-null-coalescing',
    releaseTag: "Summer '26 Release",
    topicCategory: 'Apex',
    update: {
      id: 'sf-rel-summer26-null-coalescing',
      technology: 'salesforce',
      category: 'update',
      title: "Apex Null Check Shortcut: Write Cleaner Code with '??'",
      summary: "Use the simple '??' shortcut to give your variables a default value instead of writing long if-else blocks.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_dev', 'salesforce_fresher'],
      estimatedMinutes: 2,
      learningObjectives: [
        'Use the ?? shortcut to write shorter, cleaner Apex code',
        'Provide friendly fallback values when data fields are blank',
        'Avoid common NullPointerException crashes',
      ],
      explanation:
        "Instead of writing 5 lines of code to check whether a field is blank or null, you can now write it in one single line using the '??' operator. If the first value is empty, your code automatically falls back to the default value you choose.",
      realWorldExample:
        "When sending an email to a customer whose first name is missing in Salesforce, your code can say: String name = customer.FirstName ?? 'Valued Customer'; and it works smoothly.",
      codeSnippet: `// Old way: 5 lines of if-else checks
String title;
if (contact.Title != null) {
  title = contact.Title;
} else {
  title = 'Team Member';
}

// Modern way with ??: 1 clean line!
String cleanTitle = contact.Title ?? 'Team Member';`,
      keyTakeaways: [
        'Replaces messy if-else checks with a simple ?? symbol.',
        'Prevents unexpected crashes when database fields are empty.',
        'Makes your Apex code much shorter and easier for anyone to read.',
      ],
      sourceName: 'Salesforce Apex Developer Guide – Operators',
      sourceUrl: 'https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/langCon_apex_expressions_operators_understanding.htm',
      sourcePublishedAt: '2026-06-10',
      lastVerifiedAt: '2026-11-01',
      releaseVersion: "Summer '26",
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practiceContent: {
      id: 'sf-practice-summer26-null',
      technology: 'salesforce',
      category: 'practice',
      title: "Null-Safe Programming with the Null Coalescing Operator",
      summary: "Write concise, null-safe assignments with the ?? operator.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_dev'],
      estimatedMinutes: 2,
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practice: {
      id: 'quiz-summer26-null-coalescing',
      contentId: 'sf-practice-summer26-null',
      questionType: 'scenario_mcq',
      scenario:
        "You want to set a discount percentage on an order. If the customer's special discount field is blank or null, the code should default to 5% without throwing an error.",
      question:
        "What is the cleanest Apex syntax to achieve this in a single line?",
      options: [
        {
          id: 'A',
          label: 'Decimal discount = customer.SpecialDiscount__c ?? 5.0;',
        },
        {
          id: 'B',
          label: 'Decimal discount = customer.SpecialDiscount__c && 5.0;',
        },
        {
          id: 'C',
          label: 'Decimal discount = customer.SpecialDiscount__c || 5.0;',
        },
        {
          id: 'D',
          label: 'Decimal discount = !customer.SpecialDiscount__c;',
        },
      ],
      correctAnswerId: 'A',
      explanation:
        "The ?? operator returns the left value if it is not null, otherwise it returns the right fallback value.",
      difficulty: 'easy',
    },
    revision: {
      id: 'sf-rev-safe-navigation',
      technology: 'salesforce',
      category: 'revision',
      title: "Safe Navigation Operator (?.)",
      summary: "Prevent null crashes when accessing parent relationships.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_dev', 'salesforce_fresher'],
      estimatedMinutes: 1,
      recallQuestion: "What does the safe navigation operator (?.) do when a parent record is null?",
      keyPoints: [
        'It safely returns null instead of throwing a NullPointerException crash.',
        'Example: String city = account.BillingAddress?.getCity();',
        'Combine ?. and ?? together to write completely crash-proof code.',
      ],
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
  },

  // =========================================================================
  // 8. SUMMER '26 RELEASE: Queueable Signatures
  // =========================================================================
  {
    id: 'release-summer26-queueable-signatures',
    releaseTag: "Summer '26 Release",
    topicCategory: 'Apex',
    update: {
      id: 'sf-rel-summer26-queueable-signatures',
      technology: 'salesforce',
      category: 'update',
      title: "Queueable Apex: Run Background Jobs with Easy Delays",
      summary: "Run heavy tasks in the background without freezing the user's screen, with built-in delay timers.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_dev', 'salesforce_arch'],
      estimatedMinutes: 2,
      learningObjectives: [
        'Run heavy jobs in the background so the user screen stays fast',
        'Add a delay timer (e.g. wait 5 minutes) with a single number',
        'Chain background jobs in a predictable, safe order',
      ],
      explanation:
        "When an action takes a few seconds (like generating a PDF or calling an external service), running it synchronously makes the user's screen freeze. Queueable Apex lets you run that task in the background. You can even set a built-in delay—like 'wait 10 minutes before checking payment status'—without writing complex scheduling code.",
      realWorldExample:
        "When an online order is placed, the user sees an instant confirmation screen while a Queueable background job generates the shipping label and updates warehouse inventory behind the scenes.",
      codeSnippet: `// Run a background job with a 5-minute delay
System.enqueueJob(
  new InvoicePdfGenerator(orderId),
  5 // Built-in delay: wait 5 minutes before executing
);`,
      keyTakeaways: [
        'Runs heavy work quietly in the background so user screens stay snappy.',
        'Add delay timers easily without needing complicated cron schedules.',
        'Much easier to track, test, and maintain than older background methods.',
      ],
      sourceName: 'Salesforce Apex Developer Guide – Queueable Apex',
      sourceUrl: 'https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_queueing_jobs.htm',
      sourcePublishedAt: '2026-06-05',
      lastVerifiedAt: '2026-11-01',
      releaseVersion: "Summer '26",
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practiceContent: {
      id: 'sf-practice-summer26-queueable',
      technology: 'salesforce',
      category: 'practice',
      title: "Queueable Apex: Delays and Job Chaining",
      summary: "Use System.enqueueJob with delays and callout chaining.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_dev'],
      estimatedMinutes: 2,
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practice: {
      id: 'quiz-summer26-queueable',
      contentId: 'sf-practice-summer26-queueable',
      questionType: 'scenario_mcq',
      scenario:
        "After a new invoice is created, you need to call a payment gateway to verify the transaction, but the gateway requires a 2-minute delay before checking status.",
      question:
        "What is the simplest way to run this background task with a 2-minute delay in modern Apex?",
      options: [
        {
          id: 'A',
          label: 'Use System.enqueueJob(new PaymentCheckJob(), 2); with a built-in delay parameter',
        },
        {
          id: 'B',
          label: 'Run an infinite while-loop that freezes the CPU for 120 seconds',
        },
        {
          id: 'C',
          label: 'Ask the sales rep to sit and wait 2 minutes before clicking save',
        },
        {
          id: 'D',
          label: 'Create an old Workflow Rule with a time trigger',
        },
      ],
      correctAnswerId: 'A',
      explanation:
        "System.enqueueJob supports a delay parameter in minutes, letting you schedule background execution cleanly without hacky loops.",
      difficulty: 'medium',
    },
    revision: {
      id: 'sf-rev-future-methods',
      technology: 'salesforce',
      category: 'revision',
      title: "Queueable Apex vs @future Methods",
      summary: "Why modern code prefers Queueable over older future methods.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_dev', 'salesforce_fresher'],
      estimatedMinutes: 1,
      recallQuestion: "Why is Queueable Apex better than older @future methods?",
      keyPoints: [
        'Queueable gives you a Job ID so you can track progress and monitor errors.',
        'Queueable allows you to pass complex objects, not just primitive types.',
        'Queueable allows chaining one job after another safely.',
      ],
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
  },

  // =========================================================================
  // 9. SPRING '26 RELEASE: Flow Trigger Explorer
  // =========================================================================
  {
    id: 'release-spring26-flow-trigger-explorer',
    releaseTag: "Spring '26 Release",
    topicCategory: 'Flow & Automation',
    update: {
      id: 'sf-rel-spring26-flow-trigger-explorer',
      technology: 'salesforce',
      category: 'update',
      title: "Flow Trigger Explorer: Pick Which Automation Runs First",
      summary: "A simple visual screen that lets you decide the exact order your Salesforce automations should run.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_admin', 'salesforce_dev', 'salesforce_consult'],
      estimatedMinutes: 2,
      learningObjectives: [
        'See all automations for any object in one clean screen',
        'Easily drag and drop to choose which Flow runs 1st, 2nd, or 3rd',
        'Prevent different flows from clashing or overwriting each other',
      ],
      explanation:
        "Salesforce gives you a clean visual tool where you can see all your Record-Triggered Flows on one screen. Instead of guessing which automation will run first, you can drag and drop them or set priority numbers (1, 2, 3) so your business rules always execute in the exact order you want.",
      realWorldExample:
        "When an Opportunity is won, you want the Discount Approval Flow to finish first before the Commission Calculation Flow runs. Flow Trigger Explorer lets you arrange them in that exact order in seconds.",
      codeSnippet: `// Flow Trigger Explorer Execution Order:
// Object: Opportunity (When Created or Updated)
// 1. [Priority 10] Fast Field Update: Set Default Region
// 2. [Priority 20] Business Rule: Validate VIP Discounts
// 3. [Priority 30] Notification: Alert Account Executive
// Result: Predictable execution with zero clashing!`,
      keyTakeaways: [
        'See every flow for any object (like Leads or Accounts) in one single view.',
        'Drag and drop to easily choose the order automations should run.',
        'Keeps your Salesforce org organized, reliable, and easy to debug.',
      ],
      sourceName: 'Salesforce Help – Flow Trigger Explorer',
      sourceUrl: 'https://help.salesforce.com/s/articleView?id=sf.flow_trigger_explorer.htm',
      sourcePublishedAt: '2026-02-15',
      lastVerifiedAt: '2026-11-01',
      releaseVersion: "Spring '26",
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practiceContent: {
      id: 'sf-practice-spring26-flow',
      technology: 'salesforce',
      category: 'practice',
      title: "Flow Trigger Explorer: Managing Execution Order",
      summary: "Order record-triggered flows to prevent race conditions and duplicate updates.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_admin', 'salesforce_dev'],
      estimatedMinutes: 2,
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practice: {
      id: 'quiz-spring26-flow-explorer',
      contentId: 'sf-practice-spring26-flow',
      questionType: 'scenario_mcq',
      scenario:
        "You have three different record-triggered flows on the Case object. Sometimes they overwrite each other's status updates because there is no clear execution order.",
      question:
        "What is the simplest way for an administrator to set the exact order these flows should run?",
      options: [
        {
          id: 'A',
          label: 'Open Flow Trigger Explorer and set the trigger order numbers or drag them into sequence',
        },
        {
          id: 'B',
          label: 'Delete all three flows and write a 1,000-line Apex trigger from scratch',
        },
        {
          id: 'C',
          label: 'Rename the flows in alphabetical order',
        },
        {
          id: 'D',
          label: 'Turn off flow automation completely',
        },
      ],
      correctAnswerId: 'A',
      explanation:
        "Flow Trigger Explorer gives you a visual drag-and-drop tool to set the execution order of all record-triggered flows on any object.",
      difficulty: 'easy',
    },
    revision: {
      id: 'sf-rev-fast-field-updates',
      technology: 'salesforce',
      category: 'revision',
      title: "Before-Save vs After-Save Flows",
      summary: "Pick the fastest flow type to improve system performance.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_admin', 'salesforce_fresher'],
      estimatedMinutes: 1,
      recallQuestion: "Why do 'Fast Field Updates' (Before-Save Flows) run up to 10 times faster?",
      keyPoints: [
        'They modify the record in memory before it is written to the database.',
        'They do not use up synchronous database limit quotas.',
        'Always use Fast Field Updates when you only need to update fields on the same record.',
      ],
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
  },

  // =========================================================================
  // 10. SPRING '26 RELEASE: LWC Light DOM
  // =========================================================================
  {
    id: 'release-spring26-lwc-light-dom',
    releaseTag: "Spring '26 Release",
    topicCategory: 'LWC',
    update: {
      id: 'sf-rel-spring26-lwc-light-dom',
      technology: 'salesforce',
      category: 'update',
      title: "LWC Light DOM: Style Components Easily with Global CSS",
      summary: "Build web components that can easily share brand styles, company themes, and third-party styling tools.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_dev', 'salesforce_lead'],
      estimatedMinutes: 2,
      learningObjectives: [
        'Style components easily without fighting CSS encapsulation',
        'Use company brand stylesheets across all your custom components',
        'Work smoothly with popular design tools like Tailwind and Bootstrap',
      ],
      explanation:
        "Standard web components hide their internal HTML, which made styling them with company themes tricky. Light DOM lets your component share normal styles with the rest of the page. This makes it simple to apply your company's colors and fonts without complex workarounds.",
      realWorldExample:
        "You are building a custom customer portal. With Light DOM enabled, all buttons, headers, and cards automatically pick up the corporate styling from your master stylesheet.",
      codeSnippet: `import { LightningElement } from 'lwc';

export default class BrandedCard extends LightningElement {
  // Enables Light DOM so your component uses normal company styles
  static renderMode = 'light';
}`,
      keyTakeaways: [
        'Add "static renderMode = light" to let components share normal page styles.',
        'Makes it fast and simple to build branded customer portals.',
        'Saves time by removing the need for custom CSS workarounds.',
      ],
      sourceName: 'Salesforce Developer Docs – LWC Light DOM',
      sourceUrl: 'https://developer.salesforce.com/docs/platform/lwc/guide/create-light-dom.html',
      sourcePublishedAt: '2026-02-10',
      lastVerifiedAt: '2026-11-01',
      releaseVersion: "Spring '26",
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practiceContent: {
      id: 'sf-practice-spring26-lightdom',
      technology: 'salesforce',
      category: 'practice',
      title: "LWC Light DOM: Styling and DOM Traversal",
      summary: "Enable Light DOM to allow global CSS application and third-party styling.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_dev'],
      estimatedMinutes: 2,
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practice: {
      id: 'quiz-spring26-light-dom',
      contentId: 'sf-practice-spring26-lightdom',
      questionType: 'scenario_mcq',
      scenario:
        "A developer is creating a public Experience Cloud customer portal. The marketing team requires all custom components to use the company's global brand stylesheet.",
      question:
        "What simple setting in an LWC class enables global CSS styles to apply directly inside the component?",
      options: [
        {
          id: 'A',
          label: 'static renderMode = "light";',
        },
        {
          id: 'B',
          label: 'static shadowMode = "off";',
        },
        {
          id: 'C',
          label: 'import globalCss from "@salesforce/css";',
        },
        {
          id: 'D',
          label: 'Add !important to every CSS rule in every component',
        },
      ],
      correctAnswerId: 'A',
      explanation:
        "Setting 'static renderMode = light;' in your LWC tells Salesforce to render the component in Light DOM, allowing global styles to apply naturally.",
      difficulty: 'medium',
    },
    revision: {
      id: 'sf-rev-shadow-dom',
      technology: 'salesforce',
      category: 'revision',
      title: "Shadow DOM vs Light DOM",
      summary: "Understand when to keep components isolated vs open.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_dev', 'salesforce_fresher'],
      estimatedMinutes: 1,
      recallQuestion: "When should you stick with default Shadow DOM instead of Light DOM?",
      keyPoints: [
        'Use default Shadow DOM when you want complete style isolation so outside CSS cannot change your component.',
        'Use Light DOM when you need global brand themes or third-party CSS libraries to style elements.',
        'Both modes work reliably across all modern web browsers.',
      ],
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
  },

  // =========================================================================
  // 11. SPRING '26 RELEASE: External Credentials & Named Credentials
  // =========================================================================
  {
    id: 'release-spring26-external-credentials',
    releaseTag: "Spring '26 Release",
    topicCategory: 'Security',
    update: {
      id: 'sf-rel-spring26-external-credentials',
      technology: 'salesforce',
      category: 'update',
      title: "Named Credentials: Connect to Outside APIs Securely",
      summary: "Connect Salesforce to outside websites and web services without writing passwords or tokens in code.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_dev', 'salesforce_arch', 'salesforce_lead'],
      estimatedMinutes: 2,
      learningObjectives: [
        'Keep passwords and secret API keys completely safe',
        'Connect to outside services using a clean endpoint name',
        'Pass enterprise security audits automatically',
      ],
      explanation:
        "Salesforce Named Credentials let you store logins and API keys safely in setup screens. Your code simply calls the friendly credential name (like 'callout:PaymentGateway'), and Salesforce automatically adds the secure login token in the background. You never have to write a password in your code.",
      realWorldExample:
        "Your company connects to a shipping API. When the API key changes next year, an administrator updates the key in the setup screen—no code changes or deployments are needed at all.",
      codeSnippet: `HttpRequest req = new HttpRequest();
// Clean and secure: no passwords or secret keys in code!
req.setEndpoint('callout:SecurePaymentService/v1/charge');
req.setMethod('POST');
req.setBody('{"amount": 100.00}');

Http http = new Http();
HttpResponse res = http.send(req);`,
      keyTakeaways: [
        'Never hardcode passwords or secret tokens in Apex code.',
        'Changing passwords or endpoints requires zero code deployments.',
        'Meets the highest enterprise security standards automatically.',
      ],
      sourceName: 'Salesforce Help – Named Credentials',
      sourceUrl: 'https://help.salesforce.com/s/articleView?id=sf.nc_named_creds_about.htm',
      sourcePublishedAt: '2026-02-05',
      lastVerifiedAt: '2026-11-01',
      releaseVersion: "Spring '26",
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practiceContent: {
      id: 'sf-practice-spring26-creds',
      technology: 'salesforce',
      category: 'practice',
      title: "Securing External Callouts with Named Credentials",
      summary: "Configure modern external credentials to eliminate hardcoded authorization headers.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_dev', 'salesforce_arch'],
      estimatedMinutes: 2,
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practice: {
      id: 'quiz-spring26-named-credentials',
      contentId: 'sf-practice-spring26-creds',
      questionType: 'scenario_mcq',
      scenario:
        "A security audit flags an Apex class because it contains an API secret key written directly in code for an external payment service.",
      question:
        "What is the recommended Salesforce best practice to fix this security violation?",
      options: [
        {
          id: 'A',
          label: 'Move the endpoint and authentication into a Named Credential and use the callout: URL syntax',
        },
        {
          id: 'B',
          label: 'Encrypt the password using an inverted string variable in the same class',
        },
        {
          id: 'C',
          label: 'Store the password in a public custom label accessible to everyone',
        },
        {
          id: 'D',
          label: 'Comment out the audit rule so it stops reporting the warning',
        },
      ],
      correctAnswerId: 'A',
      explanation:
        "Named Credentials store sensitive authentication safely in Salesforce setup, keeping your Apex code completely free of hardcoded passwords.",
      difficulty: 'medium',
    },
    revision: {
      id: 'sf-rev-crypto-security',
      technology: 'salesforce',
      category: 'revision',
      title: "Salesforce Callout Security Essentials",
      summary: "Key rules for building safe integrations with external systems.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_dev', 'salesforce_fresher'],
      estimatedMinutes: 1,
      recallQuestion: "Why should you never write API tokens or passwords in Apex code?",
      keyPoints: [
        'Anyone with view access to classes or source code can steal the password.',
        'Passwords cannot be changed without deploying new code to production.',
        'Using Named Credentials solves both issues securely.',
      ],
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
  },

  // =========================================================================
  // 12. SPRING '26 RELEASE: Pub/Sub API
  // =========================================================================
  {
    id: 'release-spring26-pubsub-api',
    releaseTag: "Spring '26 Release",
    topicCategory: 'Flow & Automation',
    update: {
      id: 'sf-rel-spring26-pubsub-api',
      technology: 'salesforce',
      category: 'update',
      title: "Pub/Sub API: Send Live Events Between Apps in Real Time",
      summary: "Send and receive instant live notifications between Salesforce and other systems using a modern, fast connection.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_dev', 'salesforce_arch'],
      estimatedMinutes: 2,
      learningObjectives: [
        'Send live notifications between Salesforce and external applications',
        'Replace slow hourly sync jobs with instant real-time alerts',
        'Handle millions of events with very low server overhead',
      ],
      explanation:
        "When something happens in Salesforce (like a new customer order created), the Pub/Sub API alerts your outside systems in a fraction of a second. Instead of having systems repeatedly check every hour to see if new data arrived, Salesforce pushes the update instantly.",
      realWorldExample:
        "A warehouse packing system receives an instant notification the exact second a customer finishes checkout, allowing workers to prepare the package immediately.",
      codeSnippet: `// Publish an instant event to outside apps
OrderCompletedEvent__e event = new OrderCompletedEvent__e(
  OrderNumber__c = 'ORD-2026-091',
  TotalAmount__c = 250.00
);
// Sends live event in under a second
EventBus.publish(event);`,
      keyTakeaways: [
        'Delivers live data updates in a fraction of a second.',
        'Replaces slow hourly sync jobs with instant event alerts.',
        'Connects smoothly to modern cloud tools like AWS, Azure, and Kafka.',
      ],
      sourceName: 'Salesforce Official Docs – Pub/Sub API',
      sourceUrl: 'https://developer.salesforce.com/docs/platform/pub-sub-api/overview',
      sourcePublishedAt: '2026-02-01',
      lastVerifiedAt: '2026-11-01',
      releaseVersion: "Spring '26",
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practiceContent: {
      id: 'sf-practice-spring26-pubsub',
      technology: 'salesforce',
      category: 'practice',
      title: "Pub/Sub API: Real-Time Event Architecture",
      summary: "Publish and subscribe to platform events with high performance.",
      contentType: 'article',
      difficulty: 'medium',
      applicableRoles: ['salesforce_dev', 'salesforce_arch'],
      estimatedMinutes: 2,
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
    practice: {
      id: 'quiz-spring26-pubsub',
      contentId: 'sf-practice-spring26-pubsub',
      questionType: 'scenario_mcq',
      scenario:
        "An enterprise needs to notify its shipping warehouse system immediately whenever a high-priority order is approved in Salesforce, without running slow polling queries every 5 minutes.",
      question:
        "What is the recommended modern real-time integration pattern in Salesforce?",
      options: [
        {
          id: 'A',
          label: 'Publish Platform Events and subscribe via the Pub/Sub API for instant real-time streaming',
        },
        {
          id: 'B',
          label: 'Have the warehouse system run a query every 10 seconds to check for new records',
        },
        {
          id: 'C',
          label: 'Send an email to a distribution list and have a human manually re-enter the order',
        },
        {
          id: 'D',
          label: 'Export weekly CSV backups to an FTP server',
        },
      ],
      correctAnswerId: 'A',
      explanation:
        "The Pub/Sub API streams Platform Events in real time as soon as they are published, avoiding the need for slow, repetitive polling.",
      difficulty: 'medium',
    },
    revision: {
      id: 'sf-rev-platform-events',
      technology: 'salesforce',
      category: 'revision',
      title: "Platform Events Essentials",
      summary: "How message-based architecture keeps systems decoupled.",
      contentType: 'article',
      difficulty: 'easy',
      applicableRoles: ['salesforce_dev', 'salesforce_fresher'],
      estimatedMinutes: 1,
      recallQuestion: "What is the key benefit of event-driven architecture?",
      keyPoints: [
        'Sender and receiver apps do not need to know about each other.',
        'If the outside system is temporarily down, it can catch up on missed events when it comes back online.',
        'High-speed, scalable, and responsive.',
      ],
      verificationStatus: 'verified',
      contentStatus: 'active',
    },
  },
];

// Helper functions for topic matching and daily rotation
export function getTailoredReleaseFeed(profile?: any): DailyReleaseItem[] {
  const role = profile?.role || 'salesforce_dev';
  const roleLower = role.toLowerCase();

  const scored = dailyReleaseFeed.map((item) => {
    let score = 0;
    const applicable = item.update.applicableRoles || [];
    if (applicable.includes(role)) score += 10;
    if (roleLower.includes('admin') && (item.topicCategory === 'Flow & Automation' || item.topicCategory === 'Security')) score += 5;
    if (roleLower.includes('dev') && (item.topicCategory === 'Apex' || item.topicCategory === 'LWC')) score += 5;
    if (roleLower.includes('arch') && (item.topicCategory === 'Data Cloud' || item.topicCategory === 'Agentforce')) score += 5;
    if (profile?.experience) {
      if (profile.experience === 'fresher' && item.update.difficulty === 'easy') score += 4;
      else if (profile.experience === '8+' && item.update.difficulty === 'medium') score += 4;
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
