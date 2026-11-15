export interface SyllabusLesson {
  id: string;
  moduleIndex: number;
  title: string;
  duration: string;
  description: string;
  keyConcepts: string[];
  codeSnippet?: string;
  scenarioQuiz: {
    question: string;
    options: { id: string; text: string }[];
    correctOptionId: string;
    explanation: string;
  };
}

export interface PathCurriculum {
  pathId: string;
  title: string;
  totalLessons: number;
  lessons: SyllabusLesson[];
}

export const LEARNING_PATH_CURRICULUM: Record<string, PathCurriculum> = {
  'path-001': {
    pathId: 'path-001',
    title: 'Salesforce Administration',
    totalLessons: 24,
    lessons: [
      {
        id: 'path-001-m1',
        moduleIndex: 1,
        title: 'User Management, Profiles & Permission Sets Architecture',
        duration: '4 mins',
        description: 'Understand the principle of least privilege, why Profiles should only define core access, and how Permission Sets + Permission Set Groups scale enterprise authorization.',
        keyConcepts: [
          'Profiles grant baseline object permissions, login IP ranges, and page layout assignments.',
          'Permission Sets grant additive privileges (FLS, app access, custom permissions).',
          'Use Permission Set Groups with Muting Permission Sets to handle complex role exceptions.',
          'Field-Level Security (FLS) overrides page layout field visibility and prevents unauthorized API access.'
        ],
        codeSnippet: `// Query active permission sets assigned to a user
SELECT PermissionSet.Name, PermissionSet.Label 
FROM PermissionSetAssignment 
WHERE AssigneeId = :UserInfo.getUserId()`,
        scenarioQuiz: {
          question: 'A support user needs edit access to a custom "Escalation Notes" field on Case records for one week during an on-call rotation. What is the Salesforce recommended practice?',
          options: [
            { id: 'a', text: 'Edit the user\'s Profile to grant Edit access on Escalation Notes.' },
            { id: 'b', text: 'Assign a custom Permission Set with an expiration date set to 7 days.' },
            { id: 'c', text: 'Create a new profile called Support On-Call and switch their profile.' },
            { id: 'd', text: 'Temporarily assign the user the System Administrator profile.' }
          ],
          correctOptionId: 'b',
          explanation: 'Permission Set with Expiration Date is the native, auditable, and secure Salesforce best practice for temporary elevated access without profile bloat.'
        }
      },
      {
        id: 'path-001-m2',
        moduleIndex: 2,
        title: 'Organization-Wide Defaults (OWD) & Record Sharing Hierarchy',
        duration: '5 mins',
        description: 'Master the baseline data access model: Public Read/Write vs Public Read Only vs Private, Role Hierarchies, and Criteria-Based Sharing Rules.',
        keyConcepts: [
          'OWD defines the most restrictive baseline access for records an owner does not own.',
          'Role Hierarchy automatically rolls up record access vertically unless Grant Access Using Hierarchies is unchecked (only possible on Custom Objects).',
          'Sharing Rules can open up access horizontally (by Role, Public Group, or Criteria), but cannot restrict access below OWD.',
          'Manual Sharing allows record owners to grant read/edit access to individual users or groups.'
        ],
        scenarioQuiz: {
          question: 'The OWD for Opportunities is Private. The Sales VP wants European Sales Reps to view—but not edit—US Deals closed with ARR over $100k. How should this be implemented?',
          options: [
            { id: 'a', text: 'Change OWD on Opportunity to Public Read Only.' },
            { id: 'b', text: 'Create a Criteria-Based Sharing Rule on Opportunity sharing with the European Reps group with Read Only access.' },
            { id: 'c', text: 'Assign View All Data to all European Sales Reps.' },
            { id: 'd', text: 'Add European Reps above US Reps in the Role Hierarchy.' }
          ],
          correctOptionId: 'b',
          explanation: 'A criteria-based sharing rule grants targeted Read-Only visibility to records matching specified criteria without altering org-wide defaults.'
        }
      },
      {
        id: 'path-001-m3',
        moduleIndex: 3,
        title: 'Data Modeling: Master-Detail vs Lookup & Roll-Up Summaries',
        duration: '4 mins',
        description: 'Architect scalable data models, understand cascade delete, security inheritance, and roll-up summary evaluation.',
        keyConcepts: [
          'In Master-Detail relationships, detail record security is strictly inherited from the master record owner.',
          'Deleting the master record automatically cascade-deletes all detail records.',
          'Roll-Up Summary fields are natively available only on the Master side of a Master-Detail relationship.',
          'Lookups are loosely coupled and allow independent owners and optional parent associations.'
        ],
        scenarioQuiz: {
          question: 'A company needs to calculate total Invoice amounts on an Account, but Invoices must be owned by Finance specialists independently of the Account owner. What relationship should be built?',
          options: [
            { id: 'a', text: 'Master-Detail relationship with standard Roll-Up Summary.' },
            { id: 'b', text: 'Lookup relationship, with rollup calculated via Record-Triggered Flow or Apex.' },
            { id: 'c', text: 'Hierarchical relationship.' },
            { id: 'd', text: 'External Object with OData link.' }
          ],
          correctOptionId: 'b',
          explanation: 'Master-Detail does not support independent record owners on detail records. A Lookup relationship preserves independent ownership, while Flows or Apex handle the aggregation.'
        }
      },
      {
        id: 'path-001-m4',
        moduleIndex: 4,
        title: 'Record-Triggered Automation: Flow Best Practices & Migration',
        duration: '5 mins',
        description: 'Design clean declarative automation using Fast Field Updates (Before-Save) and Actions & Related Records (After-Save).',
        keyConcepts: [
          'Before-Save (Fast Field Updates) execute before commits and are 10x faster because they do not trigger extra DML or recursion.',
          'After-Save flows should be used when creating or updating related records or sending outbound notifications.',
          'Always avoid querying (Get Records) or updating (Update Records) inside Flow Loops.',
          'Consolidate flows using Entry Criteria and Flow Trigger Explorer.'
        ],
        scenarioQuiz: {
          question: 'You need to set the Lead Rating to "Hot" whenever the Annual Revenue field on the same Lead is updated to exceed $1,000,000. Which flow trigger type is most efficient?',
          options: [
            { id: 'a', text: 'Fast Field Updates (Before-Save Record-Triggered Flow).' },
            { id: 'b', text: 'Actions and Related Records (After-Save Record-Triggered Flow).' },
            { id: 'c', text: 'Autolaunched Flow scheduled hourly.' },
            { id: 'd', text: 'Screen Flow with manual confirmation.' }
          ],
          correctOptionId: 'a',
          explanation: 'Fast Field Updates update fields on the triggering record before database write without generating recursive save cycles, providing peak transaction performance.'
        }
      },
      {
        id: 'path-001-m5',
        moduleIndex: 5,
        title: 'Enterprise Data Management: Import Wizard, Data Loader & Bulk API',
        duration: '4 mins',
        description: 'Select the optimal data loading utility, handle external IDs for upserts, and manage large data volumes (LDV).',
        keyConcepts: [
          'Data Import Wizard supports up to 50,000 records and natively prevents duplicate accounts/contacts.',
          'Data Loader supports up to 5,000,000 records via SOAP API or Bulk API 2.0.',
          'Upserts require an External ID field with unique constraint or Salesforce record ID.',
          'Use Bulk API serial mode when encountering record locking errors on parent account lookups.'
        ],
        scenarioQuiz: {
          question: 'You must load 350,000 order records into Salesforce nightly from an external ERP. Each order has a unique ERP_Order_Number__c. Which tool and operation should you choose?',
          options: [
            { id: 'a', text: 'Data Import Wizard with Insert.' },
            { id: 'b', text: 'Data Loader using Bulk API 2.0 and Upsert operation matching on ERP_Order_Number__c.' },
            { id: 'c', text: 'Manual CSV upload in Setup.' },
            { id: 'd', text: 'Execute Anonymous Apex script in batches of 200.' }
          ],
          correctOptionId: 'b',
          explanation: 'Data Loader with Bulk API 2.0 easily scales to hundreds of thousands of records, and Upsert prevents duplicates using the External ID.'
        }
      }
    ]
  },
  'path-002': {
    pathId: 'path-002',
    title: 'Apex Development',
    totalLessons: 32,
    lessons: [
      {
        id: 'path-002-m1',
        moduleIndex: 1,
        title: 'Collections Mastery: Lists, Sets & Maps for Bulkification',
        duration: '5 mins',
        description: 'Build robust in-memory data structures to process lists of records in bulk without nested loop performance degradation.',
        keyConcepts: [
          'Lists preserve ordered elements with index access: List<Account>.',
          'Sets store unique elements and provide O(1) contains() checks: Set<Id>.',
          'Maps store key-value associations (e.g., Map<Id, Account>) for instant O(1) record lookups by ID.',
          'Never execute SOQL queries inside a for loop. Query once into a Map or List outside the loop.'
        ],
        codeSnippet: `// Bulk pattern: collect IDs, query once into Map
Set<Id> accountIds = new Set<Id>();
for (Contact c : trigger.new) {
    if (c.AccountId != null) accountIds.add(c.AccountId);
}
Map<Id, Account> acctMap = new Map<Id, Account>(
    [SELECT Id, Tier__c FROM Account WHERE Id IN :accountIds]
);`,
        scenarioQuiz: {
          question: 'Why is it critical to use a Map<Id, Account> when correlating parent Accounts to 200 child Contacts in an Apex trigger?',
          options: [
            { id: 'a', text: 'Because Lists cannot hold more than 50 records in Apex.' },
            { id: 'b', text: 'To retrieve the parent Account in O(1) constant time without nested loops or queries inside loops.' },
            { id: 'c', text: 'Because SOQL only returns data as a Map.' },
            { id: 'd', text: 'Maps automatically bypass Apex CPU time limits.' }
          ],
          correctOptionId: 'b',
          explanation: 'Mapping by ID allows instant O(1) lookup per child record, keeping algorithm complexity linear (O(N)) instead of quadratic (O(N^2)).'
        }
      },
      {
        id: 'path-002-m2',
        moduleIndex: 2,
        title: 'Enterprise Trigger Framework Architecture',
        duration: '5 mins',
        description: 'Implement the One-Trigger-Per-Object pattern with dedicated Trigger Handlers to enforce separation of concerns and prevent recursion.',
        keyConcepts: [
          'One Trigger Per Object guarantees predictable order of execution across trigger contexts.',
          'Trigger Handlers delegate business logic into service and domain classes.',
          'Use static Boolean flags or Set<Id> processed sets to manage re-entrant trigger execution.',
          'Trigger.new vs Trigger.oldMap allows precise change detection: if (c.Status != oldMap.get(c.Id).Status).'
        ],
        codeSnippet: `trigger OpportunityTrigger on Opportunity (before insert, before update, after insert, after update) {
    OpportunityTriggerHandler.run();
}`,
        scenarioQuiz: {
          question: 'What is the primary risk of having multiple triggers on the same SObject (e.g., AccountTrigger1 and AccountTrigger2)?',
          options: [
            { id: 'a', text: 'Salesforce does not allow deploying multiple triggers on one object.' },
            { id: 'b', text: 'The execution order between the triggers is non-deterministic and can produce race conditions.' },
            { id: 'c', text: 'DML operations will be counted twice against the 150 limit.' },
            { id: 'd', text: 'The second trigger will always fail test coverage.' }
          ],
          correctOptionId: 'b',
          explanation: 'Salesforce does not guarantee the execution sequence of multiple triggers on the same object. One trigger delegating to a handler guarantees predictable execution.'
        }
      },
      {
        id: 'path-002-m3',
        moduleIndex: 3,
        title: 'Governor Limits: SOQL 100, DML 150 & Heap Size Prevention',
        duration: '5 mins',
        description: 'Understand synchronous vs asynchronous governor limits and how to optimize CPU time and memory consumption.',
        keyConcepts: [
          'Synchronous transactions are limited to 100 SOQL queries and 150 DML statements.',
          'Asynchronous transactions (Queueable, Batch) receive elevated limits: 200 SOQL queries.',
          'Heap size limit is 6 MB synchronously and 12 MB asynchronously.',
          'Use SOQL for-loops: for (List<Account> chunk : [SELECT Id FROM Account]) to process large recordsets without heap exhaustion.'
        ],
        scenarioQuiz: {
          question: 'An Apex batch job needs to process 50,000 Opportunity records to generate quarterly metrics. How should the query be defined in the start() method to avoid heap size limits?',
          options: [
            { id: 'a', text: 'Return Database.getQueryLocator([SELECT Id, Amount FROM Opportunity]).' },
            { id: 'b', text: 'Return a List<Opportunity> populated with all 50,000 records.' },
            { id: 'c', text: 'Execute individual queries in the execute() method for each record.' },
            { id: 'd', text: 'Use a Static Resource to store records.' }
          ],
          correctOptionId: 'a',
          explanation: 'Database.getQueryLocator supports up to 50 million records by streaming records into manageable chunks (default 200) without holding all in heap memory.'
        }
      },
      {
        id: 'path-002-m4',
        moduleIndex: 4,
        title: 'Exception Handling & Partial Success with Database Methods',
        duration: '4 mins',
        description: 'Master try-catch-finally, custom exception types, and Database.insert(records, false) partial processing.',
        keyConcepts: [
          'Standard DML (insert list) rolls back all records if a single record encounters a validation error.',
          'Database.insert(list, false) allows valid records to save while recording errors in Database.SaveResult[].',
          'Inspect Database.Error array on failed results to log field-level issues.',
          'Never leave catch blocks empty; always log to a persistent Error_Log__c or publish an error event.'
        ],
        codeSnippet: `Database.SaveResult[] results = Database.insert(accounts, false);
for (Database.SaveResult sr : results) {
    if (!sr.isSuccess()) {
        for (Database.Error err : sr.getErrors()) {
            System.debug('Error: ' + err.getMessage());
        }
    }
}`,
        scenarioQuiz: {
          question: 'You are syncing 500 contacts from a partner portal. If 3 contacts have invalid email formats, the other 497 must still be inserted. Which approach should you use?',
          options: [
            { id: 'a', text: 'insert contacts;' },
            { id: 'b', text: 'Database.insert(contacts, false); and inspect SaveResult[]' },
            { id: 'c', text: 'Wrap standard insert in a try-catch block.' },
            { id: 'd', text: 'Loop through contacts and run insert on each one inside a try-catch.' }
          ],
          correctOptionId: 'b',
          explanation: 'Database.insert(contacts, false) provides allOrNone=false partial success in a single bulkified DML statement.'
        }
      },
      {
        id: 'path-002-m5',
        moduleIndex: 5,
        title: 'Enterprise Unit Testing & TestDataFactory Architecture',
        duration: '5 mins',
        description: 'Write deterministic, isolated test classes that achieve 85%+ coverage and assert meaningful business logic.',
        keyConcepts: [
          '@isTest classes run in isolated memory without access to org data (unless @isTest(SeeAllData=true) is used, which is anti-pattern).',
          'Test.startTest() and Test.stopTest() provide a fresh set of governor limits and force pending asynchronous jobs to complete synchronously.',
          'Always verify outcomes using System.assertEquals() or Assert.areEqual(). Coverage without asserts is useless.',
          'Use a centralized TestDataFactory to build test fixtures and prevent validation rule drift across test suites.'
        ],
        scenarioQuiz: {
          question: 'What is the specific architectural behavior of Test.stopTest() during an Apex unit test execution?',
          options: [
            { id: 'a', text: 'It rolls back all database modifications made during the test.' },
            { id: 'b', text: 'It executes any pending asynchronous jobs (Queueable, Future, Batch) synchronously and resets governor limits.' },
            { id: 'c', text: 'It prevents further asserts from throwing exceptions.' },
            { id: 'd', text: 'It commits test records permanently into production database.' }
          ],
          correctOptionId: 'b',
          explanation: 'Test.stopTest() flushes and collects all asynchronous execution threads synchronously so you can assert their side effects immediately.'
        }
      }
    ]
  },
  'path-003': {
    pathId: 'path-003',
    title: 'Lightning Web Components',
    totalLessons: 28,
    lessons: [
      {
        id: 'path-003-m1',
        moduleIndex: 1,
        title: 'LWC Architecture, Shadow DOM & Component Lifecycle',
        duration: '5 mins',
        description: 'Understand the Web Components standard, template rendering, constructor, connectedCallback, renderedCallback, and disconnectedCallback.',
        keyConcepts: [
          'LWC is built on native modern web standards (Custom Elements, Shadow DOM, ECMAScript 6+).',
          'connectedCallback() fires when the component is inserted into the DOM (ideal for initializing wire listeners and URL parameters).',
          'renderedCallback() fires after every template render. Guard with an isRendered boolean flag to prevent infinite loops when modifying DOM.',
          'disconnectedCallback() cleans up event listeners, timers, and message channels.'
        ],
        codeSnippet: `import { LightningElement } from 'lwc';

export default class AccountCard extends LightningElement {
    connectedCallback() {
        console.log('Component mounted');
    }
}`,
        scenarioQuiz: {
          question: 'Where should you subscribe to a Lightning Message Service (LMS) channel inside an LWC to ensure clean lifecycle management?',
          options: [
            { id: 'a', text: 'In constructor() and unsubscribe in renderedCallback().' },
            { id: 'b', text: 'In connectedCallback() and unsubscribe in disconnectedCallback().' },
            { id: 'c', text: 'In renderedCallback() and never unsubscribe.' },
            { id: 'd', text: 'In the HTML template binding.' }
          ],
          correctOptionId: 'b',
          explanation: 'Subscribing in connectedCallback and unsubscribing in disconnectedCallback guarantees the component listens only while attached and prevents memory leaks.'
        }
      },
      {
        id: 'path-003-m2',
        moduleIndex: 2,
        title: 'Reactivity, Properties (@api, @track) & Getters',
        duration: '4 mins',
        description: 'Master modern LWC reactivity rules, public component APIs with @api, and computed properties with getters.',
        keyConcepts: [
          '@api exposes public reactive properties and methods that parent components or Lightning App Builder can configure.',
          'Primitive field updates in modern LWC are automatically reactive without needing @track.',
          '@track is required only when mutating properties of an object (e.g., this.obj.name = "X") or modifying array elements directly.',
          'Getters compute reactive values dynamically: get isButtonDisabled() { return !this.isValid; }.'
        ],
        scenarioQuiz: {
          question: 'A parent LWC needs to pass a recordId into a child LWC. How must the child component declare this property?',
          options: [
            { id: 'a', text: '@track recordId;' },
            { id: 'b', text: '@api recordId;' },
            { id: 'c', text: 'public String recordId;' },
            { id: 'd', text: 'export recordId;' }
          ],
          correctOptionId: 'b',
          explanation: '@api marks a property as public, allowing external containers and parent components to pass data into it.'
        }
      },
      {
        id: 'path-003-m3',
        moduleIndex: 3,
        title: 'Lightning Data Service (LDS) vs Imperative Apex',
        duration: '5 mins',
        description: 'Choose between cached declarative @wire adapters and imperative Apex calls based on caching and transactional requirements.',
        keyConcepts: [
          '@wire(getRecord) utilizes Lightning Data Service client-side cache and automatically updates when records change in other components.',
          'Apex methods called with @wire must be annotated with @AuraEnabled(cacheable=true).',
          'Cacheable Apex cannot execute DML operations.',
          'Imperative Apex (myMethod().then().catch()) is required for performing DML or executing operations on button clicks.'
        ],
        scenarioQuiz: {
          question: 'A developer needs to create a new Task record in Salesforce when a user clicks a "Submit Follow-Up" button in an LWC. How should the Apex method be invoked?',
          options: [
            { id: 'a', text: '@wire(createTask)' },
            { id: 'b', text: 'Imperatively: createTask({ taskData }).then(...).catch(...)' },
            { id: 'c', text: 'Using a getter in the HTML template' },
            { id: 'd', text: 'By binding the Apex method directly in the component constructor' }
          ],
          correctOptionId: 'b',
          explanation: 'DML operations cannot run in cacheable wire functions. They must be invoked imperatively in response to user actions.'
        }
      },
      {
        id: 'path-003-m4',
        moduleIndex: 4,
        title: 'Component Communication: Custom Events & Lightning Message Service',
        duration: '5 mins',
        description: 'Communicate across child-to-parent hierarchies with CustomEvent, and broadcast across unrelated components with LMS.',
        keyConcepts: [
          'Child to parent: this.dispatchEvent(new CustomEvent(\'select\', { detail: payload })).',
          'Parent handles child event via onselect={handleSelect} in template.',
          'Unrelated components (or Aura / Visualforce / LWC hybrids) communicate across the DOM using Lightning Message Service (LMS).',
          'Create a message channel metadata XML file: MyMessageChannel.messageChannel-meta.xml.'
        ],
        scenarioQuiz: {
          question: 'An LWC on the left utility bar needs to communicate with an LWC placed inside a standard record detail page on the right. What is the Salesforce recommended mechanism?',
          options: [
            { id: 'a', text: 'Window.postMessage()' },
            { id: 'b', text: 'Lightning Message Service (LMS)' },
            { id: 'c', text: 'Standard CustomEvent with bubbles:true, composed:true' },
            { id: 'd', text: 'Local browser storage polling' }
          ],
          correctOptionId: 'b',
          explanation: 'Lightning Message Service (LMS) is the platform standard for seamless publish-subscribe communication across decoupled components anywhere on a Lightning page.'
        }
      },
      {
        id: 'path-003-m5',
        moduleIndex: 5,
        title: 'SLDS Responsive Styling & Accessibility (a11y)',
        duration: '4 mins',
        description: 'Leverage Salesforce Lightning Design System (SLDS) utility classes, grid systems, and accessibility guidelines.',
        keyConcepts: [
          'Use slds-grid and slds-col slds-size_1-of-1 slds-medium-size_1-of-2 for responsive mobile/desktop layouts.',
          'Always supply aria-label and aria-describedby for assistive technology support.',
          'Do not hardcode hex color values; use SLDS styling hooks (--slds-c-button-brand-color-background).',
          'Leverage lightning-layout and lightning-layout-item for declarative mobile alignment.'
        ],
        scenarioQuiz: {
          question: 'How should you style an LWC button to dynamically adopt the customer\'s active Experience Cloud branding without breaking upgrades?',
          options: [
            { id: 'a', text: 'Hardcode company hex codes in component CSS file.' },
            { id: 'b', text: 'Use SLDS Design Tokens and CSS custom properties (Styling Hooks).' },
            { id: 'c', text: 'Inject inline style tags via JavaScript DOM manipulation.' },
            { id: 'd', text: 'Override standard .slds-button class with !important.' }
          ],
          correctOptionId: 'b',
          explanation: 'SLDS Styling Hooks (--slds-c-button-...) allow custom components to cleanly inherit enterprise theme tokens.'
        }
      }
    ]
  },
  'path-004': {
    pathId: 'path-004',
    title: 'Salesforce Integrations',
    totalLessons: 20,
    lessons: [
      {
        id: 'path-004-m1',
        moduleIndex: 1,
        title: 'Named Credentials & External Credentials Architecture',
        duration: '4 mins',
        description: 'Eliminate hardcoded endpoints and credentials by configuring modern OAuth Named Credentials and External Credentials.',
        keyConcepts: [
          'Named Credentials specify the URL endpoint and required authentication in Setup.',
          'External Credentials handle OAuth 2.0 Client Credentials, JWT Bearer, or Per-User authorization.',
          'In Apex callouts, reference the Named Credential directly: req.setEndpoint(\'callout:Stripe_API/v1/charges\').',
          'Credentials automatically inject bearer tokens and handle token refresh without custom Apex logic.'
        ],
        codeSnippet: `HttpRequest req = new HttpRequest();
req.setEndpoint('callout:Billing_Service/api/v2/invoices');
req.setMethod('GET');
Http http = new Http();
HttpResponse res = http.send(req);`,
        scenarioQuiz: {
          question: 'Why should developers use Named Credentials instead of Remote Site Settings with hardcoded authorization headers?',
          options: [
            { id: 'a', text: 'Remote Site Settings do not support HTTPS.' },
            { id: 'b', text: 'Named Credentials securely manage authentication tokens, prevent hardcoding secrets in code, and simplify multi-environment deployment.' },
            { id: 'c', text: 'Named Credentials bypass the 100 callout governor limit.' },
            { id: 'd', text: 'Named Credentials eliminate the need for JSON parsing.' }
          ],
          correctOptionId: 'b',
          explanation: 'Named Credentials provide enterprise security compliance by decoupling credentials from code and delegating token management to the platform.'
        }
      },
      {
        id: 'path-004-m2',
        moduleIndex: 2,
        title: 'Exposing Inbound Custom Apex REST APIs (@RestResource)',
        duration: '5 mins',
        description: 'Design secure, bulk-capable REST web services exposed directly from Salesforce using @RestResource, @HttpGet, and @HttpPost.',
        keyConcepts: [
          'Decorate classes with @RestResource(urlMapping=\'/v1/Accounts/*\').',
          'Class and methods must be declared as global.',
          'Access incoming URL parameters and request body using RestContext.request.',
          'Set custom HTTP response status codes via RestContext.response.statusCode.',
          'Always enforce object and field-level permissions explicitly inside custom REST handlers.'
        ],
        codeSnippet: `@RestResource(urlMapping='/v1/cases/*')
global with sharing class CaseWebService {
    @HttpPost
    global static Id createCase(String subject, String priority) {
        Case c = new Case(Subject = subject, Priority = priority);
        insert c;
        return c.Id;
    }
}`,
        scenarioQuiz: {
          question: 'An external partner posts webhook JSON payloads to an Apex REST endpoint. How does the Apex method access the raw JSON string?',
          options: [
            { id: 'a', text: 'System.getPayload()' },
            { id: 'b', text: 'RestContext.request.requestBody.toString()' },
            { id: 'c', text: 'Apex cannot read raw JSON payloads.' },
            { id: 'd', text: 'By passing an HttpRequest object into the method parameter.' }
          ],
          correctOptionId: 'b',
          explanation: 'RestContext.request.requestBody returns a Blob of the incoming HTTP request payload, converted to text via .toString().'
        }
      }
    ]
  },
  'path-005': {
    pathId: 'path-005',
    title: 'Security and Sharing',
    totalLessons: 18,
    lessons: [
      {
        id: 'path-005-m1',
        moduleIndex: 1,
        title: 'Enforcing Object & Field Security with Security.stripInaccessible()',
        duration: '5 mins',
        description: 'Enforce CRUD and FLS in Apex queries and DML operations gracefully without throwing runtime access exceptions.',
        keyConcepts: [
          'Apex runs in system context by default, ignoring object and field-level permissions.',
          'Security.stripInaccessible(AccessType.READABLE, records) strips inaccessible fields from query results.',
          'Security.stripInaccessible(AccessType.CREATABLE, records) removes fields the user cannot insert before DML.',
          'WITH USER_MODE clause in SOQL (e.g. [SELECT Id, Name FROM Account WITH USER_MODE]) natively enforces FLS and sharing.'
        ],
        codeSnippet: `SObjectAccessDecision decision = Security.stripInaccessible(
    AccessType.CREATABLE, 
    newOpportunities
);
insert decision.getRecords();`,
        scenarioQuiz: {
          question: 'What is the advantage of using Security.stripInaccessible() compared to manually checking isAccessible() on every field?',
          options: [
            { id: 'a', text: 'It automatically sanitizes against SOQL injection.' },
            { id: 'b', text: 'It strips restricted fields across entire SObject lists gracefully in a single line, preventing Schema describe CPU overhead.' },
            { id: 'c', text: 'It bypasses sharing rules.' },
            { id: 'd', text: 'It allows inserting read-only formula fields.' }
          ],
          correctOptionId: 'b',
          explanation: 'stripInaccessible provides a centralized, performant platform method to enforce FLS without repetitive Schema describe calls.'
        }
      }
    ]
  },
  'path-006': {
    pathId: 'path-006',
    title: 'Flows and Automation',
    totalLessons: 22,
    lessons: [
      {
        id: 'path-006-m1',
        moduleIndex: 1,
        title: 'Flow Bulkification: Preventing Queries and DML Inside Loops',
        duration: '5 mins',
        description: 'Architect high-volume flows that process collections in memory and execute batch DML operations outside loops.',
        keyConcepts: [
          'Never place Get Records (SOQL) or Create/Update Records (DML) inside a Flow Loop element.',
          'Use Assignment elements inside the loop to add updated record variables to a Record Collection Variable.',
          'Execute a single Update Records element passing the collection outside the loop.',
          'Governor limits apply equally to Flows: 100 queries and 150 DML statements per transaction.'
        ],
        scenarioQuiz: {
          question: 'A Flow iterates over 250 Contact records to update their status. If an Update Records element is placed inside the Loop, what will happen in production?',
          options: [
            { id: 'a', text: 'Salesforce will batch the updates automatically into 1 DML.' },
            { id: 'b', text: 'The flow will fail with System.LimitException: Too many DML statements: 151.' },
            { id: 'c', text: 'The flow will run slowly but succeed.' },
            { id: 'd', text: 'Contacts beyond the 150th record will be skipped.' }
          ],
          correctOptionId: 'b',
          explanation: 'Placing DML inside a loop consumes 1 DML per iteration, immediately crashing the transaction once 150 records are reached.'
        }
      }
    ]
  },
  'path-007': {
    pathId: 'path-007',
    title: 'Agentforce',
    totalLessons: 15,
    lessons: [
      {
        id: 'path-007-m1',
        moduleIndex: 1,
        title: 'Agentforce Architecture: Autonomous Agents & Einstein Trust Layer',
        duration: '5 mins',
        description: 'Understand how Agentforce combines LLM reasoning with CRM data grounding and strict enterprise safety guardrails.',
        keyConcepts: [
          'Agentforce agents reason dynamically over tasks using an Atlas reasoning engine instead of hardcoded if-then bot trees.',
          'Data Cloud grounds prompts with zero data retention, ensuring proprietary company data is never used to train third-party foundation models.',
          'Agent Actions (Flows, Apex @InvocableMethod, Prompt Templates, API callouts) provide tools the agent can invoke autonomously.',
          'Guardrails enforce topic boundaries and block harmful or off-topic queries.'
        ],
        scenarioQuiz: {
          question: 'How do you enable an Agentforce autonomous agent to look up an order status and calculate estimated delivery times in an external system?',
          options: [
            { id: 'a', text: 'Give the agent System Administrator credentials to production.' },
            { id: 'b', text: 'Create an Invocable Action (via Flow or Apex) and add it to the Agent\'s Topic actions.' },
            { id: 'c', text: 'Write a custom trigger on the Case object.' },
            { id: 'd', text: 'Export CRM data nightly to a public LLM.' }
          ],
          correctOptionId: 'b',
          explanation: 'Agent Actions created via Flows or Invocable Apex define the executable capabilities the autonomous agent calls when executing plans.'
        }
      }
    ]
  },
  'path-008': {
    pathId: 'path-008',
    title: 'Interview Preparation',
    totalLessons: 30,
    lessons: [
      {
        id: 'path-008-m1',
        moduleIndex: 1,
        title: 'Top Scenario Interview: Order of Execution & Reentrancy',
        duration: '5 mins',
        description: 'Master the 20-step Salesforce Order of Execution to confidently answer technical architect and senior developer interview questions.',
        keyConcepts: [
          '1. Old record loaded -> 2. System validation -> 3. Before Triggers -> 4. Custom Validation Rules.',
          '5. After Triggers -> 6. Assignment Rules -> 7. Auto-Response Rules -> 8. Workflow Rules.',
          '9. Escalation Rules -> 10. Record-Triggered Flows -> 11. Entitlement Rules -> 12. Roll-Up Summaries on Parents.',
          '13. Commit to database -> 14. Post-commit logic (emails, outbound messages).'
        ],
        scenarioQuiz: {
          question: 'In an interview, you are asked: "Does a Before Insert trigger run before or after custom Validation Rules?" What is the correct answer?',
          options: [
            { id: 'a', text: 'Validation Rules run before the Before Insert trigger.' },
            { id: 'b', text: 'Before Insert triggers run BEFORE custom Validation Rules.' },
            { id: 'c', text: 'They run concurrently in separate threads.' },
            { id: 'd', text: 'It depends on the API version of the trigger.' }
          ],
          correctOptionId: 'b',
          explanation: 'System validations run first, then Before Triggers execute, and then custom Validation Rules evaluate. This allows Before Triggers to set or clean field values before validation checks run.'
        }
      }
    ]
  }
};
