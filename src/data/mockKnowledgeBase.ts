// src/data/mockKnowledgeBase.ts
import type { KnowledgeEntry } from '@/types/assistant';

export const mockKnowledgeBase: KnowledgeEntry[] = [
  {
    knowledgeId: 'kb-queueable-apex',
    topicId: 'queueable_apex',
    topicTitle: 'Queueable Apex',
    canonicalQuestion: 'What is Queueable Apex and when should I use it?',
    keywords: ['queueable', 'async', 'asynchronous', 'chaining', 'job', 'limits', 'background'],
    synonyms: ['queueable jobs', 'chaining jobs', 'async apex', 'background apex processing'],
    simpleExplanation:
      'Queueable Apex runs a job in the background asynchronously. Unlike future methods, it allows you to chain jobs, pass complex objects (like sObjects or Apex types), and returns a job ID to monitor progress.',
    realWorldScenario: {
      domain: 'Insurance',
      title: 'Policy Underwriting External Sync',
      businessRequirement:
        'When a new insurance policy is approved in Salesforce, its full payload must be synced to an external underwriting system without freezing the agent UI.',
      featureUsed: 'Queueable Apex implementing Database.AllowsCallouts',
      implementationApproach:
        'The trigger enqueues a Queueable job. The execute() method invokes an external REST service and chains a second job to update policy payment ledger records.',
      expectedResult:
        'The UI returns instantaneously (< 200ms) for the agent, while the policy sync runs reliably in the background.',
    },
    interviewAnswer:
      'Queueable Apex is an asynchronous Apex framework introduced to overcome the limitations of @future methods. It implements the Queueable interface with an execute(QueueableContext) method. Key benefits include: support for non-primitive types, job chaining (one queueable can enqueue another), return of an AsyncApexJob ID for tracking via System.enqueueJob(), and optional callout support via Database.AllowsCallouts.',
    relatedLessonIds: ['sf-update-2024-07-queueable', 'sf-practice-queueable', 'c1'],
    sourceReference: {
      sourceName: 'Salesforce Apex Developer Guide – Queueable Apex',
      sourceUrl: 'https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_queueing_jobs.htm',
      section: 'Asynchronous Apex / Queueable Interface',
      evidenceStatus: 'verified',
    },
    version: 'Summer ’24',
  },
  {
    knowledgeId: 'kb-future-methods',
    topicId: 'future_methods',
    topicTitle: 'Future Methods',
    canonicalQuestion: 'What is a future method and how does it compare to Queueable Apex?',
    keywords: ['future', 'async', 'callout', 'primitive', 'mixed dml', 'annotation'],
    synonyms: ['@future', 'future annotation', 'future vs queueable', 'mixed dml error fix'],
    simpleExplanation:
      'A future method runs in the background when system resources become available. You declare it using the @future annotation on a static void method, and it only accepts primitive data types or collections of primitives.',
    realWorldScenario: {
      domain: 'Banking',
      title: 'Preventing Mixed DML Errors on Account Setup',
      businessRequirement:
        'Creating a new banking customer requires creating a Contact (standard object) and a User (setup object) in the same transaction.',
      featureUsed: '@future method for User record creation',
      implementationApproach:
        'The main trigger creates the Contact and Account records, then passes user IDs to a static @future method that creates the Portal User, avoiding Mixed DML errors.',
      expectedResult:
        'Customer onboarding succeeds in one seamless flow without runtime Mixed DML exceptions.',
    },
    interviewAnswer:
      'Future methods run asynchronously using the @future annotation. Unlike Queueable Apex, future methods cannot be chained, cannot pass complex objects or sObjects, and do not return a job ID. They are primarily used for quick asynchronous operations like callouts (@future(callout=true)) and resolving Mixed DML errors between setup and non-setup objects.',
    relatedLessonIds: ['sf-update-2024-07-queueable', 'c1'],
    sourceReference: {
      sourceName: 'Salesforce Apex Developer Guide – Future Methods',
      sourceUrl: 'https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_invoking_future_methods.htm',
      section: 'Asynchronous Apex / Future Methods',
      evidenceStatus: 'verified',
    },
    version: 'Spring ’24',
  },
  {
    knowledgeId: 'kb-batch-apex',
    topicId: 'batch_apex',
    topicTitle: 'Batch Apex',
    canonicalQuestion: 'When should I use Batch Apex instead of Queueable Apex?',
    keywords: ['batch', 'database.batchable', 'large data volumes', 'governor limits', 'scope', 'millions'],
    synonyms: ['batchable', 'batch processing', 'ldv batch', 'nightly jobs'],
    simpleExplanation:
      'Batch Apex is designed to process large data volumes (up to 50 million records) by dividing records into manageable chunks (batches of 1 to 2,000) with independent governor limits for each batch.',
    realWorldScenario: {
      domain: 'Healthcare',
      title: 'Nightly Health Insurance Claims Archiving',
      businessRequirement:
        'Every night, over 500,000 processed healthcare claims older than 90 days must be flagged, summarized, and moved to archive status.',
      featureUsed: 'Database.Batchable with Database.Stateful',
      implementationApproach:
        'A Batch Apex class implements start(), execute(), and finish(). The start() method uses a Database.getQueryLocator to stream records, execute() processes batches of 200 records, and finish() emails an execution summary to compliance.',
      expectedResult:
        'All 500,000 claim records are processed within limits without CPU timeout or heap limit errors.',
    },
    interviewAnswer:
      'Batch Apex implements Database.Batchable<sObject> across three methods: start(), execute(), and finish(). Use Batch Apex when processing Large Data Volumes (up to 50M records) that exceed synchronous limits. Use Queueable Apex for smaller background jobs (< 50,000 records) requiring chaining or callouts. Adding Database.Stateful allows state retention across batches.',
    relatedLessonIds: ['c1'],
    sourceReference: {
      sourceName: 'Salesforce Apex Developer Guide – Batch Apex',
      sourceUrl: 'https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_batch_interface.htm',
      section: 'Asynchronous Apex / Using Batch Apex',
      evidenceStatus: 'verified',
    },
    version: 'Spring ’24',
  },
  {
    knowledgeId: 'kb-scheduled-apex',
    topicId: 'scheduled_apex',
    topicTitle: 'Scheduled Apex',
    canonicalQuestion: 'How do I schedule recurring Apex jobs in Salesforce?',
    keywords: ['scheduled', 'cron', 'schedulable', 'system.schedule', 'recurring'],
    synonyms: ['cron expression', 'scheduled jobs', 'scheduling apex', 'nightly scheduled job'],
    simpleExplanation:
      'Scheduled Apex allows you to run an Apex class at specified times or intervals using the Schedulable interface and standard Cron expressions.',
    realWorldScenario: {
      domain: 'Customer Service',
      title: 'Daily High-Priority SLA Escalation',
      businessRequirement:
        'Every morning at 6:00 AM, the system must inspect unresolved VIP customer support tickets and escalate tickets nearing SLA breach.',
      featureUsed: 'Schedulable interface invoking Batch Apex',
      implementationApproach:
        'A Schedulable class is registered with System.schedule(\'Daily VIP SLA Check\', \'0 0 6 * * ?\', new CaseSLAEscalator());. In its execute() method, it launches a batch job to evaluate cases.',
      expectedResult:
        'VIP tickets are automatically flagged for managerial review before business hours start.',
    },
    interviewAnswer:
      'Scheduled Apex implements the Schedulable interface with an execute(SchedulableContext) method. It can be scheduled through the Salesforce UI or programmatically via System.schedule(jobName, cronExp, schedulableClass). A best practice is to have the scheduled class enqueue a Batch or Queueable job rather than doing heavy DML directly inside the execute method.',
    relatedLessonIds: ['c1'],
    sourceReference: {
      sourceName: 'Salesforce Apex Developer Guide – Scheduling Apex',
      sourceUrl: 'https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_scheduler.htm',
      section: 'Asynchronous Apex / Schedulable Interface',
      evidenceStatus: 'sample',
    },
    version: 'Summer ’24',
  },
  {
    knowledgeId: 'kb-apex-triggers',
    topicId: 'apex_triggers',
    topicTitle: 'Apex Triggers',
    canonicalQuestion: 'What are Apex Trigger best practices and recursion guards?',
    keywords: ['triggers', 'one trigger per object', 'handler pattern', 'recursion', 'bulkification'],
    synonyms: ['trigger best practices', 'trigger handler', 'prevent recursive trigger', 'bulk trigger'],
    simpleExplanation:
      'An Apex trigger executes before or after records are inserted, updated, deleted, or undeleted. Best practices require one trigger per object, delegating logic to a handler class, bulkifying with sets and maps, and guarding against recursive loops.',
    realWorldScenario: {
      domain: 'Sales Automation',
      title: 'Order Line Item Rollup and Discount Validation',
      businessRequirement:
        'When line items are added to an enterprise quote, the total quote amount must recalculate and prevent recurring trigger fires from secondary updates.',
      featureUsed: 'Trigger Handler with static Set<Id> recursion guard',
      implementationApproach:
        'The QuoteLineItem trigger delegates to QuoteLineItemTriggerHandler. A static Set<Id> processedQuoteIds ensures each quote calculation executes only once per transaction.',
      expectedResult:
        'Clean, bulkified calculation for 200 items in a single DML without hitting the 16-level trigger recursion limit.',
    },
    interviewAnswer:
      'Core Apex trigger best practices are: 1) One trigger per object to control execution order; 2) Logic-less triggers that delegate to handler classes; 3) Bulkification handling 200 records per chunk without queries/DML inside loops; 4) Proper context usage (before for validation/field setting, after for related record DML); 5) Static recursion guards to avoid infinite loop limits.',
    relatedLessonIds: ['c1'],
    sourceReference: {
      sourceName: 'Salesforce Apex Developer Guide – Triggers',
      sourceUrl: 'https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_triggers.htm',
      section: 'Apex Language Reference / Triggers',
      evidenceStatus: 'verified',
    },
    version: 'Spring ’24',
  },
  {
    knowledgeId: 'kb-lwc-decorators',
    topicId: 'lwc_decorators',
    topicTitle: 'LWC Decorators',
    canonicalQuestion: 'What is the difference between @api, @track, and @wire in LWC?',
    keywords: ['lwc', '@api', '@track', '@wire', 'reactive', 'decorator', 'properties'],
    synonyms: ['lwc decorators', 'api decorator', 'track decorator', 'wire service'],
    simpleExplanation:
      '@api makes a property or method public so parents can access it. @wire connects the component to Salesforce data reactively. @track is used for deep reactivity in nested objects and arrays.',
    realWorldScenario: {
      domain: 'Customer Service',
      title: 'Customer 360 Case Detail Widget',
      businessRequirement:
        'A component placed on a Case page must receive the record ID from the parent record page, fetch account data, and track inline status edits.',
      featureUsed: '@api recordId, @wire(getRecord), and @track for draft edits',
      implementationApproach:
        'The component declares @api recordId to automatically capture context, wires getRecord to read account fields, and uses @track on a draftObject array for table edits.',
      expectedResult:
        'Instant reactive updates as the user edits fields without requiring manual SOQL queries or apex controllers.',
    },
    interviewAnswer:
      '@api exposes a property or method publicly, turning properties into reactive public attributes accessible by parent components or Lightning App Builder. @wire provisions data and metadata reactively via Lightning Data Service (LDS) or Apex, managing client-side caching. Since Spring ’20, all primitive properties are reactive by default; @track is only required to observe deep mutations in nested objects or arrays.',
    relatedLessonIds: ['c2'],
    sourceReference: {
      sourceName: 'Lightning Web Components Developer Guide',
      sourceUrl: 'https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.js_decorators',
      section: 'LWC Architecture / JavaScript Decorators',
      evidenceStatus: 'verified',
    },
    version: 'Spring ’24',
  },
  {
    knowledgeId: 'kb-lwc-lifecycle-hooks',
    topicId: 'lwc_lifecycle_hooks',
    topicTitle: 'LWC Lifecycle Hooks',
    canonicalQuestion: 'When should I use connectedCallback vs renderedCallback in LWC?',
    keywords: ['lifecycle', 'connectedcallback', 'renderedcallback', 'constructor', 'disconnectedcallback'],
    synonyms: ['lwc lifecycle', 'when does connectedcallback run', 'renderedcallback infinite loop'],
    simpleExplanation:
      'connectedCallback() fires once when the component is inserted into the DOM (ideal for initializing data and subscribing to events). renderedCallback() fires after every render (use cautiously to interact with rendered elements).',
    realWorldScenario: {
      domain: 'Banking',
      title: 'Real-Time Foreign Exchange Rates Ticker',
      businessRequirement:
        'A banking teller screen displays live currency conversion rates that initialize upon opening and unsubscribe upon closing.',
      featureUsed: 'connectedCallback() and disconnectedCallback()',
      implementationApproach:
        'connectedCallback subscribes to a currency update channel via Lightning Message Service. disconnectedCallback unsubscribes when the teller navigates away to prevent memory leaks.',
      expectedResult:
        'Clean lifecycle management with zero memory leaks or ghost event listeners.',
    },
    interviewAnswer:
      'LWC lifecycle order is: constructor() -> connectedCallback() -> render() -> renderedCallback(). connectedCallback() runs once when inserted into the DOM; use it for initialization, subscribing to LMS, and reading @api properties. renderedCallback() runs after EVERY render cycle; guard it with an isRendered flag to avoid infinite loops when updating reactive properties.',
    relatedLessonIds: ['c2'],
    sourceReference: {
      sourceName: 'LWC Developer Guide – Component Lifecycle',
      sourceUrl: 'https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.create_lifecycle_hooks',
      section: 'Component Lifecycle Hooks',
      evidenceStatus: 'verified',
    },
    version: 'Spring ’24',
  },
  {
    knowledgeId: 'kb-parent-child-lwc',
    topicId: 'parent_child_lwc',
    topicTitle: 'Parent-to-Child Communication',
    canonicalQuestion: 'How do parent components pass data and invoke methods in child LWCs?',
    keywords: ['parent', 'child', 'communication', '@api', 'property binding', 'method'],
    synonyms: ['parent to child lwc', 'pass data to child component', 'call child method in lwc'],
    simpleExplanation:
      'A parent component passes data to a child by setting its public @api properties in HTML (<c-child my-prop={value}></c-child>) or invokes a child @api method using this.template.querySelector(\'c-child\').myMethod().',
    realWorldScenario: {
      domain: 'Insurance',
      title: 'Multi-Step Policy Quoting Wizard',
      businessRequirement:
        'A parent quote wizard controls step progression and triggers child step validation before navigating.',
      featureUsed: '@api property binding and @api validate() method in child',
      implementationApproach:
        'The parent binds activePolicyId to child sub-components. When the "Next" button is clicked, the parent calls childComp.validate() to verify input before moving to the next tab.',
      expectedResult:
        'Robust modular wizard where each step is an encapsulated reusable child component.',
    },
    interviewAnswer:
      'Parent-to-child communication is down-flowing: 1) Declarative Property Binding: Pass values via kebab-case attributes in template matching camelCase @api properties in the child; 2) Programmatic Method Invocation: The child defines an @api method, and the parent calls it via this.template.querySelector(\'c-child\').methodName().',
    relatedLessonIds: ['c2'],
    sourceReference: {
      sourceName: 'LWC Developer Guide – Component Communication',
      sourceUrl: 'https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.events_parent_to_child',
      section: 'Events and Communication',
      evidenceStatus: 'sample',
    },
    version: 'Spring ’24',
  },
  {
    knowledgeId: 'kb-child-parent-lwc',
    topicId: 'child_parent_lwc',
    topicTitle: 'Child-to-Parent Communication',
    canonicalQuestion: 'How do child components communicate events to parent LWCs?',
    keywords: ['customevent', 'dispatch', 'bubbles', 'composed', 'event handling'],
    synonyms: ['child to parent lwc', 'customevent lwc', 'dispatch event', 'bubbles composed'],
    simpleExplanation:
      'Child components communicate upward by creating and dispatching a CustomEvent: this.dispatchEvent(new CustomEvent(\'select\', { detail: payload })). The parent listens via onselect={handleSelect} in its template.',
    realWorldScenario: {
      domain: 'Sales Automation',
      title: 'Custom Product Catalog Selector',
      businessRequirement:
        'When an agent selects a product card from a visual catalog grid, the parent opportunity manager must update the quote line items.',
      featureUsed: 'CustomEvent with detail payload',
      implementationApproach:
        'The child product card dispatches this.dispatchEvent(new CustomEvent(\'productselected\', { detail: { productId: this.prod.id } }));. The parent template attaches onproductselected={handleProductSelected}.',
      expectedResult:
        'Loose coupling: product cards know nothing about the parent opportunity, maximizing reusability.',
    },
    interviewAnswer:
      'Child-to-parent communication follows the DOM event standard using CustomEvent. The child calls this.dispatchEvent(new CustomEvent(\'eventname\', { detail: data, bubbles: false, composed: false })). The parent handles it declaratively with oneventname={handler}. Set bubbles: true to let the event bubble up the DOM, and composed: true to cross shadow DOM boundaries.',
    relatedLessonIds: ['c2'],
    sourceReference: {
      sourceName: 'LWC Developer Guide – Create and Dispatch Events',
      sourceUrl: 'https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.events_create_dispatch',
      section: 'Events and Communication',
      evidenceStatus: 'verified',
    },
    version: 'Spring ’24',
  },
  {
    knowledgeId: 'kb-lms',
    topicId: 'lightning_message_service',
    topicTitle: 'Lightning Message Service (LMS)',
    canonicalQuestion: 'How do unrelated components communicate via Lightning Message Service?',
    keywords: ['lms', 'messagechannel', 'publish', 'subscribe', 'aura', 'visualforce'],
    synonyms: ['lightning message service', 'publish subscribe lwc', 'unrelated component communication'],
    simpleExplanation:
      'Lightning Message Service (LMS) lets unrelated components anywhere on a Lightning page communicate over a shared LightningMessageChannel, whether they are LWC, Aura, or Visualforce.',
    realWorldScenario: {
      domain: 'Healthcare',
      title: 'Patient Record Header Patient-Context Broadcast',
      businessRequirement:
        'A Patient Header widget at the top of the console must broadcast patient ID changes to unrelated EHR diagnosis and prescription widgets on different page tabs.',
      featureUsed: 'LightningMessageChannel (PatientContext__c)',
      implementationApproach:
        'The header publishes patient IDs using publish(this.messageContext, PATIENT_CHANNEL, { patientId }). Unrelated prescription and history components subscribe in their connectedCallback.',
      expectedResult:
        'Instant cross-component coordination across tabs without complex DOM nesting or window events.',
    },
    interviewAnswer:
      'LMS uses a metadata-defined LightningMessageChannel XML file. In LWC, you import publish, subscribe, unsubscribe, and MessageContext from \'lightning/messageService\'. LMS operates across the entire page hierarchy and bridges LWC, Aura components, and Visualforce pages. Always unsubscribe in disconnectedCallback to avoid memory leaks.',
    relatedLessonIds: ['c2'],
    sourceReference: {
      sourceName: 'Salesforce LMS Documentation',
      sourceUrl: 'https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.use_message_channel',
      section: 'Lightning Message Service',
      evidenceStatus: 'verified',
    },
    version: 'Spring ’24',
  },
  {
    knowledgeId: 'kb-rest-integration',
    topicId: 'rest_integration',
    topicTitle: 'REST API Integration',
    canonicalQuestion: 'How do I consume external REST APIs securely from Salesforce?',
    keywords: ['rest', 'http', 'httprequest', 'callout', 'json', 'api', 'endpoint'],
    synonyms: ['rest api callout', 'http callout apex', 'consume web service', 'external api'],
    simpleExplanation:
      'In Apex, you create an HttpRequest object, set the endpoint and method (GET, POST, etc.), configure headers, and send it via the Http class to receive an HttpResponse containing JSON or XML data.',
    realWorldScenario: {
      domain: 'Insurance',
      title: 'Instant Credit Score Check During Loan Origination',
      businessRequirement:
        'When an applicant submits an auto loan request, Salesforce must call an external credit bureau API and store the credit score.',
      featureUsed: 'Apex HTTP Callout with Named Credential',
      implementationApproach:
        'HttpRequest req = new HttpRequest(); req.setEndpoint(\'callout:CreditBureau_NC/v1/score\'); req.setMethod(\'POST\'); req.setBody(JSON.serialize(payload)); HttpResponse res = new Http().send(req);',
      expectedResult:
        'Applicant credit rating is retrieved securely in under 2 seconds and stored on the Opportunity.',
    },
    interviewAnswer:
      'To make an HTTP callout in Apex: 1) Define an HttpRequest with setEndpoint(), setMethod(), and setHeader(); 2) Send using new Http().send(request); 3) Parse the HttpResponse with JSON.deserializeUntyped() or typed wrapper classes. Best practices: Always use Named Credentials to eliminate hardcoded endpoints/credentials, handle status codes (200 vs 4xx/5xx), and mock callouts in unit tests using HttpCalloutMock.',
    relatedLessonIds: ['c3'],
    sourceReference: {
      sourceName: 'Salesforce Apex Developer Guide – Invoking HTTP Callouts',
      sourceUrl: 'https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_callouts_http.htm',
      section: 'Integration and Web Services',
      evidenceStatus: 'verified',
    },
    version: 'Spring ’24',
  },
  {
    knowledgeId: 'kb-named-credentials',
    topicId: 'named_credentials',
    topicTitle: 'Named Credentials',
    canonicalQuestion: 'Why should I use Named Credentials instead of hardcoded endpoints in callouts?',
    keywords: ['named credentials', 'endpoint', 'callout:', 'security', 'auth', 'credentials'],
    synonyms: ['callout url', 'named credential benefit', 'secure callout', 'external credentials'],
    simpleExplanation:
      'Named Credentials specify the URL of a callout endpoint and its required authentication parameters in one definition, removing secrets and hardcoded URLs from your Apex code.',
    realWorldScenario: {
      domain: 'Banking',
      title: 'Core Banking Gateway Seamless Sandbox-to-Prod Deployment',
      businessRequirement:
        'Apex code must connect to a banking core ledger API across dev, staging, and production orgs without modifying code or storing API keys in Apex.',
      featureUsed: 'Named Credential with External Credential',
      implementationApproach:
        'Code references callout:CoreBanking_NC/accounts. The dev org points to the sandbox sandbox-api.bank.com, while production org config points to prod-api.bank.com with separate encrypted credentials.',
      expectedResult:
        'Zero code changes between sandbox and production deployments; API tokens are safely encrypted by Salesforce.',
    },
    interviewAnswer:
      'Named Credentials provide two major advantages: 1) Security: Authentication details (API keys, Basic Auth, OAuth tokens) are stored in secure Salesforce infrastructure, never in code; 2) Maintainability: Apex uses the callout:NamedCredentialName format, eliminating hardcoded URLs and Remote Site Settings. Salesforce seamlessly handles token refresh for OAuth protocols.',
    relatedLessonIds: ['c3'],
    sourceReference: {
      sourceName: 'Salesforce Security Guide – Named Credentials',
      sourceUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_defining_named_credentials.htm',
      section: 'External Client Apps and Named Credentials',
      evidenceStatus: 'verified',
    },
    version: 'Summer ’24',
  },
  {
    knowledgeId: 'kb-external-credentials',
    topicId: 'external_credentials',
    topicTitle: 'External Credentials',
    canonicalQuestion: 'How do External Credentials handle OAuth 2.0 authentication and token management?',
    keywords: ['external credentials', 'principals', 'oauth', 'token', 'named credentials'],
    synonyms: ['modern named credentials', 'external credential principals', 'oauth token refresh'],
    simpleExplanation:
      'External Credentials represent the authentication protocol (like OAuth 2.0, AWS Signature, or Custom API Keys) and its Principals, pairing with Named Credentials which define the target endpoint.',
    realWorldScenario: {
      domain: 'Sales Automation',
      title: 'ERP Logistics System OAuth 2.0 Integration',
      businessRequirement:
        'Sales operations must fetch real-time carrier shipment tracking from an SAP ERP that requires OAuth 2.0 Client Credentials Grant.',
      featureUsed: 'External Credential with Client Credentials Grant Principal',
      implementationApproach:
        'An External Credential defines the OAuth token endpoint, client ID, and secret. A Named Credential references this External Credential. When Apex calls callout:ERP_Shipping_NC, Salesforce automatically requests and caches the bearer token.',
      expectedResult:
        'Zero manual token refresh boilerplate code in Apex; automated OAuth handling.',
    },
    interviewAnswer:
      'In Salesforce\'s modern Named Credential architecture, External Credentials decouple authentication from the endpoint URL. An External Credential defines the authentication protocol (OAuth 2.0, API Key, AWS Sig v4) and Principals (Named Principal or Per-User Principal). Access is granted to users via Permission Sets, ensuring fine-grained access control.',
    relatedLessonIds: ['c3'],
    sourceReference: {
      sourceName: 'Salesforce Named Credentials Architectural Guide',
      sourceUrl: 'https://developer.salesforce.com/docs/atlas.en-us.248.0.api_rest.meta/api_rest/named_credentials_external_credentials.htm',
      section: 'Integration Architecture',
      evidenceStatus: 'sample',
    },
    version: 'Summer ’24',
  },
  {
    knowledgeId: 'kb-oauth-web-flow',
    topicId: 'oauth_2_web_flow',
    topicTitle: 'OAuth 2.0 Web Server Flow',
    canonicalQuestion: 'How does the OAuth 2.0 Web Server Flow authenticate users in Salesforce?',
    keywords: ['oauth', 'web server flow', 'authorization code', 'client secret', 'token', 'callback'],
    synonyms: ['salesforce oauth flow', 'auth code flow', 'connected app oauth', 'sso flow'],
    simpleExplanation:
      'The OAuth 2.0 Web Server Flow uses an authorization code grant: the user logs into Salesforce in the browser, Salesforce redirects to the client application with an authorization code, and the client application server exchanges this code for access and refresh tokens.',
    realWorldScenario: {
      domain: 'Customer Service',
      title: 'Customer Self-Service Portal Single Sign-On',
      businessRequirement:
        'An external web portal allows customers to log in using their Salesforce Community credentials securely.',
      featureUsed: 'Connected App with OAuth 2.0 Web Server Flow',
      implementationApproach:
        'The portal redirects users to /services/oauth2/authorize. After successful login, Salesforce redirects to the portal callback with code=XYZ. The portal backend makes a POST to /services/oauth2/token to get an access token.',
      expectedResult:
        'Customer credentials are never exposed to the portal app; secure token-based session established.',
    },
    interviewAnswer:
      'The OAuth 2.0 Web Server Flow is designed for web applications with a secure backend server capable of keeping a client_secret confidential. Steps: 1) Client redirects user to /services/oauth2/authorize; 2) User authenticates and authorizes access; 3) Salesforce redirects to callback URL with an authorization code; 4) Client backend exchanges code and client_secret for an access_token and refresh_token at /services/oauth2/token.',
    relatedLessonIds: ['c3'],
    sourceReference: {
      sourceName: 'Salesforce Identity Implementation Guide',
      sourceUrl: 'https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_web_server_flow.htm&type=5',
      section: 'Identity and Access Management / Connected Apps',
      evidenceStatus: 'verified',
    },
    version: 'Spring ’24',
  },
  {
    knowledgeId: 'kb-sharing-rules',
    topicId: 'sharing_rules',
    topicTitle: 'Salesforce Sharing Rules',
    canonicalQuestion: 'What is the difference between criteria-based and ownership-based sharing rules?',
    keywords: ['sharing rules', 'owd', 'criteria', 'ownership', 'public group', 'record access'],
    synonyms: ['criteria vs ownership sharing', 'salesforce record sharing', 'extend owd'],
    simpleExplanation:
      'Sharing Rules open up record access beyond Organization-Wide Defaults (OWD). Ownership-based rules share records based on who owns the record, whereas criteria-based rules share records based on field values regardless of ownership.',
    realWorldScenario: {
      domain: 'Banking',
      title: 'Branch-Specific High-Value Loan Record Sharing',
      businessRequirement:
        'When a Loan Application exceeds $1,000,000, compliance officers across the national risk team must have read/write access regardless of which branch loan officer owns it.',
      featureUsed: 'Criteria-Based Sharing Rule on Loan_Application__c',
      implementationApproach:
        'A sharing rule evaluates Loan_Amount__c >= 1000000 and shares Read/Write access with the "National Risk Committee" Public Group.',
      expectedResult:
        'High-value loans automatically become accessible to compliance risk officers immediately upon record creation or update.',
    },
    interviewAnswer:
      'Organization-Wide Defaults (OWD) set the baseline security (Private, Read Only, Read/Write). Sharing Rules can only GRANT additional access, never restrict it. Ownership-based rules grant access based on record ownership (roles, territories, public groups). Criteria-based rules grant access based on field values (e.g., Country = \'USA\') to specified groups, up to 50 criteria rules per object.',
    relatedLessonIds: ['c4'],
    sourceReference: {
      sourceName: 'Salesforce Security Guide – Sharing Rules',
      sourceUrl: 'https://help.salesforce.com/s/articleView?id=sf.security_about_sharing_rules.htm&type=5',
      section: 'Data Security / Record Sharing',
      evidenceStatus: 'verified',
    },
    version: 'Spring ’24',
  },
  {
    knowledgeId: 'kb-permission-sets',
    topicId: 'permission_sets',
    topicTitle: 'Permission Sets',
    canonicalQuestion: 'How do Permission Sets extend the profile security model in modern Salesforce?',
    keywords: ['permission sets', 'profile', 'permission set groups', 'muting', 'least privilege'],
    synonyms: ['permission sets vs profiles', 'modern salesforce security', 'least privilege access'],
    simpleExplanation:
      'In modern Salesforce architecture, Profiles define baseline settings (like login IP ranges and default record types), while Permission Sets and Permission Set Groups grant functional permissions to specific users on demand.',
    realWorldScenario: {
      domain: 'Healthcare',
      title: 'Temporary Clinical Trial Audit Access',
      businessRequirement:
        'During an FDA audit week, three specific hospital coordinators need read/write access to clinical trial records without creating a whole new profile.',
      featureUsed: 'Permission Set assigned with an expiration date',
      implementationApproach:
        'An "FDA Trial Auditor" permission set is assigned to the three coordinators with an automatic 7-day expiration date.',
      expectedResult:
        'Coordinators receive necessary access immediately, which expires automatically when the audit concludes, preserving compliance.',
    },
    interviewAnswer:
      'Salesforce recommends a "Least Privilege" security model: Keep profiles minimal (standard user) and layer functional permissions using Permission Sets and Permission Set Groups. Key advantages include: modularity, avoiding profile explosion, Permission Set Groups with Muting Permission Sets for tailoring access, and time-based assignment expiration.',
    relatedLessonIds: ['c4'],
    sourceReference: {
      sourceName: 'Salesforce Security Guide – Permission Sets',
      sourceUrl: 'https://help.salesforce.com/s/articleView?id=sf.perm_sets_overview.htm&type=5',
      section: 'Data Security / Permissions',
      evidenceStatus: 'verified',
    },
    version: 'Spring ’24',
  },
  {
    knowledgeId: 'kb-record-triggered-flows',
    topicId: 'record_triggered_flows',
    topicTitle: 'Record-Triggered Flows',
    canonicalQuestion: 'When should I choose Record-Triggered Flows over Apex Triggers?',
    keywords: ['flows', 'record-triggered', 'declarative', 'fast field updates', 'triggers vs flows'],
    synonyms: ['flow vs trigger', 'when to use flows', 'fast field updates flow'],
    simpleExplanation:
      'Record-Triggered Flows are declarative automations configured with point-and-click. Use "Fast Field Updates" (Before-Save) for field calculations on the same record, and use Apex Triggers when logic requires complex integrations, maps, or heavy batching.',
    realWorldScenario: {
      domain: 'Sales Automation',
      title: 'Lead Score and Routing Assignment',
      businessRequirement:
        'When a lead is submitted, calculate an initial lead score based on industry and revenue, and set the lead status before committing to the database.',
      featureUsed: 'Record-Triggered Flow (Fast Field Updates / Before-Save)',
      implementationApproach:
        'A Fast Field Updates flow evaluates Lead attributes and updates Lead_Score__c and Status without generating extra DML or executing full trigger cycles.',
      expectedResult:
        'Executes 10x faster than traditional Process Builder or workflow rules, with zero code maintenance.',
    },
    interviewAnswer:
      'Choose Before-Save (Fast Field Updates) Flows for same-record updates; they execute before database commit, avoid recursive save cycles, and run significantly faster than Apex After-Save triggers. Choose Apex Triggers when: 1) Complex business logic involves multi-level maps or collections; 2) Integration callouts or platform events require transaction control; 3) The team enforces strict source-driven CI/CD with unit testing thresholds.',
    relatedLessonIds: ['c1'],
    sourceReference: {
      sourceName: 'Salesforce Flow Guide – Record-Triggered Automation',
      sourceUrl: 'https://help.salesforce.com/s/articleView?id=sf.flow_concepts_trigger.htm&type=5',
      section: 'Automate Business Processes / Salesforce Flow',
      evidenceStatus: 'verified',
    },
    version: 'Spring ’24',
  },
  {
    knowledgeId: 'kb-platform-events',
    topicId: 'platform_events',
    topicTitle: 'Platform Events',
    canonicalQuestion: 'How do Platform Events enable event-driven architectures in Salesforce?',
    keywords: ['platform events', 'event-driven', 'publish', 'subscribe', 'bus', 'emp api'],
    synonyms: ['platform events architecture', 'pub sub salesforce', 'event bus', 'real time events'],
    simpleExplanation:
      'Platform Events provide an enterprise messaging architecture inside and outside Salesforce using a Publish/Subscribe model. Publishers send events to an event bus, and subscribers (Apex, Flows, external apps) react in real time.',
    realWorldScenario: {
      domain: 'Customer Service',
      title: 'ATM Card Fraud Real-Time Push Notification',
      businessRequirement:
        'When an external core fraud detection system identifies suspicious card transactions, customer service reps currently viewing the customer account in Salesforce must see an instant alert.',
      featureUsed: 'Platform Event (Fraud_Alert__e) with empApi in LWC',
      implementationApproach:
        'The external fraud system publishes a Fraud_Alert__e event via REST. An LWC on the agent console uses lightning/empApi to subscribe and trigger an immediate high-priority toast notification.',
      expectedResult:
        'Agents are alerted within 500 milliseconds of fraudulent activity without page reloads or polling.',
    },
    interviewAnswer:
      'Platform Events use the CometD protocol and Pub/Sub model on the Salesforce Event Bus. You define custom events with the __e suffix. Publishers can be Apex (EventBus.publish()), Flows, or external REST API calls. Subscribers can be Apex triggers (after insert), Flows, or LWC components using lightning/empApi. Events are replayable for up to 72 hours via ReplayId.',
    relatedLessonIds: ['c1'],
    sourceReference: {
      sourceName: 'Platform Events Developer Guide',
      sourceUrl: 'https://developer.salesforce.com/docs/atlas.en-us.platform_events.meta/platform_events/platform_events_intro.htm',
      section: 'Event-Driven Architecture',
      evidenceStatus: 'verified',
    },
    version: 'Spring ’24',
  },
];
