// src/data/exploreContent.ts
/**
 * Explore Content with Conversational Microlearning
 * Topics covering Salesforce Winter '27, Summer '26, and Spring '26.
 * Formatted as friendly, relaxing dialogues between a curious learner (Leo)
 * and an experienced mentor (Maya).
 */

export interface DialogueTurn {
  speaker: 'learner' | 'mentor';
  name: string;
  avatar: string;
  message: string;
  codeSnippet?: string;
}

export interface LearningContent {
  id: string;
  technology: string;
  topic: string;
  title: string;
  summary: string;
  whyItMatters: string;
  projectExample: string;
  readingTimeMinutes: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  version?: string; // e.g., "Winter '27", "Summer '26", "Spring '26"
  verificationStatus: "published" | "sample";
  sourceUrl?: string;
  sourceName?: string;
  lastVerified?: string;
  conversation?: DialogueTurn[];
  keyTakeaway?: string;
}

export const exploreContent: LearningContent[] = [
  // 1. Winter '27 - Apex Cursors (c1)
  {
    id: "c1",
    technology: "Salesforce",
    topic: "Apex",
    version: "Winter '27",
    title: "Apex Cursors: Fetch Millions of Records Without Crashing",
    summary: "Safe high-volume Apex record queries without running into memory limit errors.",
    whyItMatters: "Processes large data updates smoothly without complex Batch Apex setups.",
    projectExample: "Nightly calculation of 100,000 policy renewals.",
    readingTimeMinutes: 2,
    difficulty: "Intermediate",
    verificationStatus: "published",
    sourceName: "Salesforce Apex Developer Guide – Apex Cursors",
    sourceUrl: "https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_cursors.htm",
    lastVerified: "2026-11-01",
    conversation: [
      {
        speaker: 'learner',
        name: 'Leo',
        avatar: '👨‍💻',
        message: "Our nightly job crashed again with 'Apex heap size too large' while reading 80,000 records. Is there a simpler fix than building a heavy Batch class?",
      },
      {
        speaker: 'mentor',
        name: 'Maya',
        avatar: '👩‍💻',
        message: "Definitely! Winter '27 introduced Apex Cursors. Think of a cursor like a smart bookmark: instead of pulling all 80,000 records into memory at once, it fetches small batches of 200 at a time.",
      },
      {
        speaker: 'learner',
        name: 'Leo',
        avatar: '👨‍💻',
        message: "Does that keep our memory usage low?",
      },
      {
        speaker: 'mentor',
        name: 'Maya',
        avatar: '👩‍💻',
        message: "Exactly! Your memory usage stays tiny because only 200 records exist in memory at any moment. Your job finishes smoothly without crashes.",
        codeSnippet: `Database.Cursor cursor = Database.getCursor('SELECT Id, Amount FROM Opportunity');\nList<Opportunity> slice = cursor.fetch(0, 200); // Only 200 records in memory!\nupdate slice;`,
      },
    ],
    keyTakeaway: "Use Database.getCursor() to process large query results in safe, bite-sized chunks without memory crashes.",
  },

  // 2. Winter '27 - Agentforce (c2)
  {
    id: "c2",
    technology: "Salesforce",
    topic: "Agentforce",
    version: "Winter '27",
    title: "Agentforce: Connecting AI Chatbots to Custom Apex Code",
    summary: "How to let your Salesforce AI assistant run real custom Apex actions during conversations.",
    whyItMatters: "Allows AI assistants to resolve customer requests 24/7 rather than giving generic text answers.",
    projectExample: "Automated flight rebooking and warranty status checks.",
    readingTimeMinutes: 2,
    difficulty: "Beginner",
    verificationStatus: "published",
    sourceName: "Salesforce Official Docs – Agentforce Actions",
    sourceUrl: "https://developer.salesforce.com/docs/agentforce/overview/guide/agent-action-apex.html",
    lastVerified: "2026-11-01",
    conversation: [
      {
        speaker: 'learner',
        name: 'Leo',
        avatar: '👨‍💻',
        message: "Maya, our support chatbot can answer general questions, but customers want it to actually cancel orders or rebook tickets. Can it do that?",
      },
      {
        speaker: 'mentor',
        name: 'Maya',
        avatar: '👩‍💻',
        message: "Yes! In Winter '27, Agentforce lets the AI call your custom Apex code directly. When a customer asks to cancel an order, the AI reads the request and runs your custom action immediately.",
      },
      {
        speaker: 'learner',
        name: 'Leo',
        avatar: '👨‍💻',
        message: "How does the AI know which code to run?",
      },
      {
        speaker: 'mentor',
        name: 'Maya',
        avatar: '👩‍💻',
        message: "You just add an @InvocableMethod with a clear, plain-English description like 'Cancels an order and refunds customer'. The AI reads that description and calls it whenever the user asks!",
        codeSnippet: `@InvocableMethod(label='Cancel Order' description='Cancels an active customer order and issues a refund')\npublic static List<String> cancelOrder(List<String> orderNumbers) {\n  // Code updates order status to Cancelled\n  return new List<String>{ 'Order cancelled successfully!' };\n}`,
      },
    ],
    keyTakeaway: "Give your Apex methods clear, natural descriptions so the AI knows exactly when to run them for users.",
  },

  // 3. Winter '27 - Data Cloud Zero-Copy (c3)
  {
    id: "c3",
    technology: "Salesforce",
    topic: "Data Cloud",
    version: "Winter '27",
    title: "Data Cloud: View Outside Data Live Without Copying",
    summary: "Connect Salesforce directly to Snowflake or Google BigQuery without storing duplicate records.",
    whyItMatters: "Eliminates duplicate storage bills and removes the hassle of broken data sync pipelines.",
    projectExample: "Displaying 5 years of outside ERP purchase history on Account pages.",
    readingTimeMinutes: 2,
    difficulty: "Beginner",
    verificationStatus: "published",
    sourceName: "Salesforce Help – Zero-Copy Federation",
    sourceUrl: "https://help.salesforce.com/s/articleView?id=sf.c360_a_zero_copy_partner_network.htm",
    lastVerified: "2026-11-01",
    conversation: [
      {
        speaker: 'learner',
        name: 'Leo',
        avatar: '👨‍💻',
        message: "Our team has 30 million order rows sitting in Snowflake. Management wants to see them in Salesforce, but our storage budget is already maxed out!",
      },
      {
        speaker: 'mentor',
        name: 'Maya',
        avatar: '👩‍💻',
        message: "Don't copy them into Salesforce! Use Data Cloud Zero-Copy Federation. It lets Salesforce view and query your Snowflake warehouse live whenever a rep opens an Account page.",
      },
      {
        speaker: 'learner',
        name: 'Leo',
        avatar: '👨‍💻',
        message: "So we don't have to build any nightly data export scripts?",
      },
      {
        speaker: 'mentor',
        name: 'Maya',
        avatar: '👩‍💻',
        message: "Zero exports, zero duplicate storage fees. The data stays in Snowflake, and Salesforce displays it seamlessly on screen.",
      },
    ],
    keyTakeaway: "Zero-Copy Federation lets you view and report on warehouse data live without paying for duplicate storage.",
  },

  // 4. Winter '27 - LWC Workspace API
  {
    id: "exp-winter27-workspace-api",
    technology: "Salesforce",
    topic: "LWC",
    version: "Winter '27",
    title: "LWC Workspace API: Control Console Tabs with Code",
    summary: "Open, rename, and close browser tabs directly inside Lightning Console apps.",
    whyItMatters: "Saves support agents dozens of repetitive clicks every single day.",
    projectExample: "Automatically closing case tabs when an agent clicks 'Issue Resolved'.",
    readingTimeMinutes: 2,
    difficulty: "Intermediate",
    verificationStatus: "published",
    sourceName: "Salesforce Developer Docs – LWC Workspace API",
    sourceUrl: "https://developer.salesforce.com/docs/component-library/bundle/lightning-platform-workspace-api",
    lastVerified: "2026-11-01",
    conversation: [
      {
        speaker: 'learner',
        name: 'Leo',
        avatar: '👨‍💻',
        message: "Our call center agents complain that their Console screens get cluttered with 20 open tabs every day. Can our custom LWC close tabs for them?",
      },
      {
        speaker: 'mentor',
        name: 'Maya',
        avatar: '👩‍💻',
        message: "Yes! In Winter '27, the Workspace API is fully supported in LWC. You can import closeTab() or openSubtab() directly into your JavaScript.",
      },
      {
        speaker: 'learner',
        name: 'Leo',
        avatar: '👨‍💻',
        message: "So when they hit 'Resolve', we can close the tab automatically?",
      },
      {
        speaker: 'mentor',
        name: 'Maya',
        avatar: '👩‍💻',
        message: "Exactly! One click resolves the case, closes that tab, and focuses the next customer waiting in line.",
        codeSnippet: `import { closeTab, getFocusedTabInfo } from 'lightning/platformWorkspaceApi';\n\nasync handleResolve() {\n  const { tabId } = await getFocusedTabInfo();\n  await closeTab(tabId);\n}`,
      },
    ],
    keyTakeaway: "Use lightning/platformWorkspaceApi in LWC to automate tab opening, renaming, and closing inside Console apps.",
  },

  // 5. Summer '26 - Vector Search
  {
    id: "exp-summer26-vector-search",
    technology: "Salesforce",
    topic: "Data Cloud",
    version: "Summer '26",
    title: "Vector Search: Search by Meaning, Not Exact Words",
    summary: "Help users find knowledge articles even when they make typos or use different words.",
    whyItMatters: "Reduces customer frustration by providing accurate answers on the first search.",
    projectExample: "Searching 'broken display' finds 'Cracked Screen Replacement Guide'.",
    readingTimeMinutes: 2,
    difficulty: "Beginner",
    verificationStatus: "published",
    sourceName: "Salesforce Help – Vector Database Search",
    sourceUrl: "https://help.salesforce.com/s/articleView?id=sf.c360_a_vector_database_search.htm",
    lastVerified: "2026-11-01",
    conversation: [
      {
        speaker: 'learner',
        name: 'Leo',
        avatar: '👨‍💻',
        message: "Customers keep calling support saying they can't find articles on our website, even though we wrote detailed guides for everything!",
      },
      {
        speaker: 'mentor',
        name: 'Maya',
        avatar: '👩‍💻',
        message: "Old search only checks for exact word matches. If an article is titled 'Cracked Glass' and the customer types 'smashed phone', old search returns zero results!",
      },
      {
        speaker: 'learner',
        name: 'Leo',
        avatar: '👨‍💻',
        message: "How does Summer '26 Vector Search solve that?",
      },
      {
        speaker: 'mentor',
        name: 'Maya',
        avatar: '👩‍💻',
        message: "Vector Search understands the meaning of words. It knows 'smashed phone' means the same thing as 'cracked glass', so it immediately shows the right guide.",
      },
    ],
    keyTakeaway: "Vector Search matches customer questions based on conceptual meaning, ensuring users always find the right answers.",
  },

  // 6. Summer '26 - User Access Policies
  {
    id: "exp-summer26-user-access-policies",
    technology: "Salesforce",
    topic: "Security",
    version: "Summer '26",
    title: "User Access Policies: Assign Permissions Automatically",
    summary: "Automatically grant or remove permission sets when an employee's department or role changes.",
    whyItMatters: "Eliminates repetitive manual admin clicks and ensures new employees have access on day one.",
    projectExample: "Auto-assigning Sales licenses to anyone whose department changes to Sales.",
    readingTimeMinutes: 2,
    difficulty: "Beginner",
    verificationStatus: "published",
    sourceName: "Salesforce Help – User Access Policies",
    sourceUrl: "https://help.salesforce.com/s/articleView?id=sf.perm_user_access_policies.htm",
    lastVerified: "2026-11-01",
    conversation: [
      {
        speaker: 'learner',
        name: 'Leo',
        avatar: '👨‍💻',
        message: "Every Monday, we onboard 20 new sales reps, and I spend 2 hours manually clicking to assign 5 permission sets to each person.",
      },
      {
        speaker: 'mentor',
        name: 'Maya',
        avatar: '👩‍💻',
        message: "You can automate that completely with User Access Policies in Summer '26! You set a single rule: 'When Department equals Sales, grant these 5 permission sets'.",
      },
      {
        speaker: 'learner',
        name: 'Leo',
        avatar: '👨‍💻',
        message: "What happens when an employee transfers to Marketing?",
      },
      {
        speaker: 'mentor',
        name: 'Maya',
        avatar: '👩‍💻',
        message: "Salesforce automatically removes their Sales permissions and grants the Marketing permissions instantly. Zero manual clicks needed!",
      },
    ],
    keyTakeaway: "Set User Access Policies once to automate employee permission set and license assignments forever.",
  },

  // 7. Summer '26 - Null Coalescing
  {
    id: "exp-summer26-null-coalescing",
    technology: "Salesforce",
    topic: "Apex",
    version: "Summer '26",
    title: "Apex Null Check Shortcut: Clean Code with '??'",
    summary: "A clean one-line shortcut to set default values when fields are empty.",
    whyItMatters: "Prevents ugly NullPointerException crashes while cutting 5 lines of code down to 1.",
    projectExample: "Defaulting customer greetings and order discount percentages.",
    readingTimeMinutes: 2,
    difficulty: "Beginner",
    verificationStatus: "published",
    sourceName: "Salesforce Apex Developer Guide – Null Coalescing",
    sourceUrl: "https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/langCon_apex_expressions_operators_understanding.htm",
    lastVerified: "2026-11-01",
    conversation: [
      {
        speaker: 'learner',
        name: 'Leo',
        avatar: '👨‍💻',
        message: "I feel like half of my Apex code is just repetitive if-else blocks checking if a field is null before setting a default value.",
      },
      {
        speaker: 'mentor',
        name: 'Maya',
        avatar: '👩‍💻',
        message: "You can replace all those if-else blocks with the '??' shortcut! If the value on the left is null, it automatically uses the backup value on the right.",
      },
      {
        speaker: 'learner',
        name: 'Leo',
        avatar: '👨‍💻',
        message: "Can you show me a quick example?",
      },
      {
        speaker: 'mentor',
        name: 'Maya',
        avatar: '👩‍💻',
        message: "Sure! Look how clean this is:",
        codeSnippet: `// If contact.Title is blank, title becomes 'Valued Member' in 1 line!\nString title = contact.Title ?? 'Valued Member';`,
      },
    ],
    keyTakeaway: "Use the ?? operator to assign default values in a single clean line and prevent null crashes.",
  },

  // 8. Summer '26 - Queueable Apex
  {
    id: "exp-summer26-queueable",
    technology: "Salesforce",
    topic: "Apex",
    version: "Summer '26",
    title: "Queueable Apex: Run Background Jobs with Easy Delays",
    summary: "Execute background tasks smoothly with built-in delay timers.",
    whyItMatters: "Keeps user screens fast and snappy while heavy processing runs quietly in the background.",
    projectExample: "Delaying a payment verification check by 2 minutes after order creation.",
    readingTimeMinutes: 2,
    difficulty: "Intermediate",
    verificationStatus: "published",
    sourceName: "Salesforce Apex Developer Guide – Queueable Apex",
    sourceUrl: "https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_queueing_jobs.htm",
    lastVerified: "2026-11-01",
    conversation: [
      {
        speaker: 'learner',
        name: 'Leo',
        avatar: '👨‍💻',
        message: "When users save an Opportunity, we need to call an outside tax API. But the tax system needs a 2-minute delay before checking. How do I do that without freezing the screen?",
      },
      {
        speaker: 'mentor',
        name: 'Maya',
        avatar: '👩‍💻',
        message: "Use Queueable Apex with the delay parameter! You just pass '2' to System.enqueueJob(), and Salesforce waits 2 minutes before running your background job.",
      },
      {
        speaker: 'learner',
        name: 'Leo',
        avatar: '👨‍💻',
        message: "And the user doesn't have to wait on screen?",
      },
      {
        speaker: 'mentor',
        name: 'Maya',
        avatar: '👩‍💻',
        message: "Not at all! The user's page saves in under a second, and the background worker takes care of the rest.",
        codeSnippet: `// Run job in the background after a 2-minute delay\nSystem.enqueueJob(new TaxCalculatorJob(oppId), 2);`,
      },
    ],
    keyTakeaway: "Pass a delay number in minutes to System.enqueueJob() to run background tasks safely without slowing down users.",
  },

  // 9. Spring '26 - Flow Trigger Explorer
  {
    id: "exp-spring26-flow-explorer",
    technology: "Salesforce",
    topic: "Flows",
    version: "Spring '26",
    title: "Flow Trigger Explorer: Pick Which Automation Runs First",
    summary: "Visual drag-and-drop tool to arrange the exact order your Salesforce flows execute.",
    whyItMatters: "Stops multiple automations from clashing or overwriting each other's changes.",
    projectExample: "Ensuring discount approval finishes before commission calculation runs.",
    readingTimeMinutes: 2,
    difficulty: "Beginner",
    verificationStatus: "published",
    sourceName: "Salesforce Help – Flow Trigger Explorer",
    sourceUrl: "https://help.salesforce.com/s/articleView?id=sf.flow_trigger_explorer.htm",
    lastVerified: "2026-11-01",
    conversation: [
      {
        speaker: 'learner',
        name: 'Leo',
        avatar: '👨‍💻',
        message: "Maya, we have 4 different Record-Triggered Flows on Opportunity, and yesterday they started overwriting each other's fields! How do I fix this?",
      },
      {
        speaker: 'mentor',
        name: 'Maya',
        avatar: '👩‍💻',
        message: "That happens when Salesforce doesn't know which flow should execute first. Just open Flow Trigger Explorer in Setup!",
      },
      {
        speaker: 'learner',
        name: 'Leo',
        avatar: '👨‍💻',
        message: "What does it look like?",
      },
      {
        speaker: 'mentor',
        name: 'Maya',
        avatar: '👩‍💻',
        message: "It shows all your flows on one clean screen. You can drag and drop them or give them priority numbers (10, 20, 30) so they always execute in the exact order you want.",
      },
    ],
    keyTakeaway: "Use Flow Trigger Explorer to arrange before-save and after-save flows in clear sequence so automations never clash.",
  },

  // 10. Spring '26 - LWC Light DOM
  {
    id: "exp-spring26-light-dom",
    technology: "Salesforce",
    topic: "LWC",
    version: "Spring '26",
    title: "LWC Light DOM: Style Components Easily with Global CSS",
    summary: "Build Lightning Web Components that easily inherit corporate brand styles and themes.",
    whyItMatters: "Build custom branded portals and forms without complex CSS hacks.",
    projectExample: "Applying company portal styles to custom customer support components.",
    readingTimeMinutes: 2,
    difficulty: "Intermediate",
    verificationStatus: "published",
    sourceName: "Salesforce Developer Docs – LWC Light DOM",
    sourceUrl: "https://developer.salesforce.com/docs/platform/lwc/guide/create-light-dom.html",
    lastVerified: "2026-11-01",
    conversation: [
      {
        speaker: 'learner',
        name: 'Leo',
        avatar: '👨‍💻',
        message: "Our marketing team gave us a global CSS stylesheet with company fonts and colors, but our LWC components block outside styles. How do we share styles?",
      },
      {
        speaker: 'mentor',
        name: 'Maya',
        avatar: '👩‍💻',
        message: "Set 'static renderMode = light;' in your component class! That switches the component to Light DOM, allowing it to naturally use your company's global styles.",
      },
      {
        speaker: 'learner',
        name: 'Leo',
        avatar: '👨‍💻',
        message: "Does it work with tools like Tailwind or Bootstrap?",
      },
      {
        speaker: 'mentor',
        name: 'Maya',
        avatar: '👩‍💻',
        message: "Yes! Any standard CSS framework or brand theme will style your Light DOM component effortlessly.",
        codeSnippet: `export default class BrandedButton extends LightningElement {\n  static renderMode = 'light'; // Enables global CSS styling!\n}`,
      },
    ],
    keyTakeaway: "Enable Light DOM when you want custom components to inherit company stylesheets or external CSS frameworks.",
  },

  // 11. Spring '26 - Named Credentials
  {
    id: "exp-spring26-named-credentials",
    technology: "Salesforce",
    topic: "Security",
    version: "Spring '26",
    title: "Named Credentials: Connect to Outside APIs Securely",
    summary: "Integrate with external websites and APIs without storing passwords or tokens in code.",
    whyItMatters: "Keeps secret API keys safe and eliminates security audit flags.",
    projectExample: "Connecting to a payment gateway with zero hardcoded API keys.",
    readingTimeMinutes: 2,
    difficulty: "Intermediate",
    verificationStatus: "published",
    sourceName: "Salesforce Help – Named Credentials",
    sourceUrl: "https://help.salesforce.com/s/articleView?id=sf.nc_named_creds_about.htm",
    lastVerified: "2026-11-01",
    conversation: [
      {
        speaker: 'learner',
        name: 'Leo',
        avatar: '👨‍💻',
        message: "Our security team failed our code review because an Apex class had an API password written directly in the code. What should I do?",
      },
      {
        speaker: 'mentor',
        name: 'Maya',
        avatar: '👩‍💻',
        message: "Never put passwords or API keys in code! Set up a Named Credential in Salesforce Setup. Salesforce stores the secret key in a secure vault.",
      },
      {
        speaker: 'learner',
        name: 'Leo',
        avatar: '👨‍💻',
        message: "How does my code call the API then?",
      },
      {
        speaker: 'mentor',
        name: 'Maya',
        avatar: '👩‍💻',
        message: "You just call 'callout:YourCredentialName'. Salesforce attaches the secret authorization token automatically behind the scenes!",
        codeSnippet: `HttpRequest req = new HttpRequest();\nreq.setEndpoint('callout:SecurePaymentService/charge');\n// Salesforce handles login headers automatically!`,
      },
    ],
    keyTakeaway: "Always use Named Credentials so you never write sensitive passwords or secret keys in your Apex code.",
  },

  // 12. Spring '26 - Pub/Sub API
  {
    id: "exp-spring26-pubsub",
    technology: "Salesforce",
    topic: "Integration",
    version: "Spring '26",
    title: "Pub/Sub API: Instant Live Alerts Between Apps",
    summary: "Stream real-time events between Salesforce and external applications in milliseconds.",
    whyItMatters: "Replaces slow hourly sync jobs with instant real-time data flow.",
    projectExample: "Notifying the warehouse shipping line the exact second an order is completed.",
    readingTimeMinutes: 2,
    difficulty: "Intermediate",
    verificationStatus: "published",
    sourceName: "Salesforce Developer Docs – Pub/Sub API",
    sourceUrl: "https://developer.salesforce.com/docs/platform/pub-sub-api/overview",
    lastVerified: "2026-11-01",
    conversation: [
      {
        speaker: 'learner',
        name: 'Leo',
        avatar: '👨‍💻',
        message: "Our warehouse system currently runs a database query every 5 minutes to check for new orders, and it's slowing down our server.",
      },
      {
        speaker: 'mentor',
        name: 'Maya',
        avatar: '👩‍💻',
        message: "Switch to the Pub/Sub API! Instead of asking every 5 minutes, Salesforce publishes an instant event the moment an order is approved.",
      },
      {
        speaker: 'learner',
        name: 'Leo',
        avatar: '👨‍💻',
        message: "How fast does the warehouse receive it?",
      },
      {
        speaker: 'mentor',
        name: 'Maya',
        avatar: '👩‍💻',
        message: "In less than one second! It uses high-speed streaming so your systems stay in sync in real time with very low server load.",
      },
    ],
    keyTakeaway: "Use the Pub/Sub API to stream live events to external cloud systems in real time instead of slow polling.",
  },
];
