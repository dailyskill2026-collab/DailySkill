// src/services/knowledgeCoverageService.ts
import { contentInventoryService } from './contentInventoryService';
import type {
  TopicCoverageItem,
  CategoryCoverageSummary,
  OverallCoverageReport,
  TopicCoverageStatus
} from '@/types/contentQuality';
import type { SkillCategory } from '@/types/assessment';

interface CanonicalTopicDefinition {
  topicId: string;
  title: string;
  category: SkillCategory;
  keywords: string[];
}

export const CANONICAL_SALESFORCE_TOPICS: CanonicalTopicDefinition[] = [
  // --- 1. Salesforce Administration (9 topics) ---
  { topicId: 'admin_objects_fields', title: 'Objects and Fields', category: 'admin', keywords: ['object', 'field', 'custom object', 'standard object'] },
  { topicId: 'admin_relationships', title: 'Relationships', category: 'admin', keywords: ['relationship', 'master-detail', 'lookup', 'hierarchical'] },
  { topicId: 'admin_validation_rules', title: 'Validation Rules', category: 'admin', keywords: ['validation rule', 'validation', 'error condition'] },
  { topicId: 'admin_record_types', title: 'Record Types', category: 'admin', keywords: ['record type', 'business process', 'picklist values'] },
  { topicId: 'admin_page_layouts', title: 'Page Layouts & Lightning Pages', category: 'admin', keywords: ['page layout', 'lightning app builder', 'dynamic forms'] },
  { topicId: 'admin_profiles', title: 'Profiles', category: 'admin', keywords: ['profile', 'standard profile', 'custom profile'] },
  { topicId: 'admin_permission_sets', title: 'Permission Sets', category: 'admin', keywords: ['permission set', 'permission set group'] },
  { topicId: 'admin_flows', title: 'Flows & Process Automation', category: 'admin', keywords: ['flow', 'flow builder', 'record-triggered flow', 'screen flow'] },
  { topicId: 'admin_reports_dashboards', title: 'Reports and Dashboards', category: 'admin', keywords: ['report', 'dashboard', 'report type', 'summary report'] },

  // --- 2. Apex Development (9 topics) ---
  { topicId: 'apex_classes', title: 'Apex Classes', category: 'apex', keywords: ['apex class', 'class', 'inheritance', 'interface', 'virtual'] },
  { topicId: 'apex_triggers', title: 'Triggers', category: 'apex', keywords: ['trigger', 'before insert', 'after update', 'trigger events'] },
  { topicId: 'apex_trigger_handlers', title: 'Trigger Handlers & Frameworks', category: 'apex', keywords: ['trigger handler', 'handler pattern', 'recursion'] },
  { topicId: 'apex_soql_sosl', title: 'SOQL and SOSL', category: 'apex', keywords: ['soql', 'sosl', 'query', 'aggregate', 'soql for loop'] },
  { topicId: 'apex_collections', title: 'Collections (List, Set, Map)', category: 'apex', keywords: ['collection', 'list', 'set', 'map'] },
  { topicId: 'apex_governor_limits', title: 'Governor Limits', category: 'apex', keywords: ['governor limits', 'cpu timeout', 'heap size', '101 soql'] },
  { topicId: 'apex_exception_handling', title: 'Exception Handling', category: 'apex', keywords: ['exception', 'try-catch', 'custom exception', 'dml exception'] },
  { topicId: 'apex_test_classes', title: 'Test Classes & Code Coverage', category: 'apex', keywords: ['test class', '@istest', 'test.starttest', 'system.assert'] },
  { topicId: 'apex_bulkification', title: 'Bulkification Best Practices', category: 'apex', keywords: ['bulkification', 'bulkify', '200 records', 'trigger bulk'] },

  // --- 3. Asynchronous Apex (5 topics) ---
  { topicId: 'async_future_methods', title: 'Future Methods', category: 'async_apex', keywords: ['future', '@future', 'mixed dml', 'primitive parameters'] },
  { topicId: 'async_queueable_apex', title: 'Queueable Apex', category: 'async_apex', keywords: ['queueable', 'queueablecontext', 'chaining', 'system.enqueuejob'] },
  { topicId: 'async_batch_apex', title: 'Batch Apex', category: 'async_apex', keywords: ['batch apex', 'database.batchable', 'database.stateful', 'start execute finish'] },
  { topicId: 'async_scheduled_apex', title: 'Scheduled Apex', category: 'async_apex', keywords: ['scheduled apex', 'schedulable', 'cron', 'system.schedule'] },
  { topicId: 'async_platform_events', title: 'Platform Events (Async Processing)', category: 'async_apex', keywords: ['platform event', 'eventbus', 'publish', 'after insert trigger'] },

  // --- 4. Lightning Web Components (9 topics) ---
  { topicId: 'lwc_structure', title: 'Component Structure (HTML, JS, CSS, XML)', category: 'lwc', keywords: ['component structure', 'lwc bundle', 'js-meta.xml'] },
  { topicId: 'lwc_decorators', title: 'Decorators (@api, @track, @wire)', category: 'lwc', keywords: ['@api', '@track', '@wire', 'reactive property'] },
  { topicId: 'lwc_lifecycle', title: 'Lifecycle Hooks', category: 'lwc', keywords: ['connectedcallback', 'renderedcallback', 'disconnectedcallback', 'lifecycle'] },
  { topicId: 'lwc_parent_to_child', title: 'Parent-to-Child Communication', category: 'lwc', keywords: ['parent to child', '@api property', 'public method'] },
  { topicId: 'lwc_child_to_parent', title: 'Child-to-Parent Communication', category: 'lwc', keywords: ['customevent', 'dispatch', 'bubbles', 'composed'] },
  { topicId: 'lwc_message_service', title: 'Lightning Message Service (LMS)', category: 'lwc', keywords: ['lightning message service', 'lms', 'message channel', 'publish subscribe'] },
  { topicId: 'lwc_data_service', title: 'Lightning Data Service (LDS)', category: 'lwc', keywords: ['lightning data service', 'lds', 'lightning-record-form', 'getrecord'] },
  { topicId: 'lwc_apex_integration', title: 'Apex Integration (Wire & Imperative)', category: 'lwc', keywords: ['imperative apex', '@wire apex', 'refreshapex', 'cacheable=true'] },
  { topicId: 'lwc_error_handling', title: 'Error Handling & Toast Notifications', category: 'lwc', keywords: ['showtoast', 'error handling', 'toast event', 'reduceerrors'] },

  // --- 5. Salesforce Integrations (13 topics) ---
  { topicId: 'integ_rest_apis', title: 'REST APIs (@RestResource)', category: 'integrations', keywords: ['rest api', '@restresource', 'httpget', 'httppost'] },
  { topicId: 'integ_soap_apis', title: 'SOAP APIs & WSDL', category: 'integrations', keywords: ['soap', 'wsdl', 'partner wsdl', 'enterprise wsdl'] },
  { topicId: 'integ_http_methods', title: 'HTTP Methods (GET, POST, PUT, PATCH, DELETE)', category: 'integrations', keywords: ['http method', 'httprequest', 'httpresponse', 'http.send'] },
  { topicId: 'integ_http_status', title: 'HTTP Status Codes & Headers', category: 'integrations', keywords: ['status code', '200 ok', '404', '500', 'headers'] },
  { topicId: 'integ_json_xml', title: 'JSON and XML Parsing', category: 'integrations', keywords: ['json.serialize', 'json.deserialize', 'dom.document', 'xmlstreamreader'] },
  { topicId: 'integ_oauth', title: 'OAuth 2.0 & Connected Apps', category: 'integrations', keywords: ['oauth', 'connected app', 'web server flow', 'jwt bearer'] },
  { topicId: 'integ_named_credentials', title: 'Named Credentials', category: 'integrations', keywords: ['named credential', 'callout:', 'authentication endpoint'] },
  { topicId: 'integ_external_credentials', title: 'External Credentials', category: 'integrations', keywords: ['external credential', 'principal', 'permission set mapping'] },
  { topicId: 'integ_external_client_apps', title: 'External Client Apps (ECA)', category: 'integrations', keywords: ['external client app', 'eca', 'packaging connected apps'] },
  { topicId: 'integ_patterns', title: 'Integration Patterns (Request-Reply, Fire-and-Forget)', category: 'integrations', keywords: ['integration pattern', 'request-reply', 'fire-and-forget', 'batch sync'] },
  { topicId: 'integ_callouts', title: 'Apex Callouts & Governor Limits', category: 'integrations', keywords: ['callout', 'allowsCallouts', 'callout limit', 'timeout 120s'] },
  { topicId: 'integ_webhooks', title: 'Webhooks & Inbound Integration', category: 'integrations', keywords: ['webhook', 'inbound rest', 'callback'] },
  { topicId: 'integ_platform_events', title: 'Platform Events Integration', category: 'integrations', keywords: ['cometd', 'emp connector', 'eventbus.publish', 'pub/sub'] },

  // --- 6. Salesforce Security (9 topics) ---
  { topicId: 'sec_profiles', title: 'Profiles (Administrative & User Permissions)', category: 'security', keywords: ['profile', 'administrative permissions', 'app permissions'] },
  { topicId: 'sec_permission_sets', title: 'Permission Sets (Granular Grants)', category: 'security', keywords: ['permission set', 'granular access', 'license assignment'] },
  { topicId: 'sec_permission_set_groups', title: 'Permission Set Groups & Muting', category: 'security', keywords: ['permission set group', 'muting permission set'] },
  { topicId: 'sec_object_security', title: 'Object-Level Security (CRED)', category: 'security', keywords: ['object security', 'cred', 'create read edit delete'] },
  { topicId: 'sec_field_security', title: 'Field-Level Security (FLS)', category: 'security', keywords: ['field-level security', 'fls', 'visible', 'read-only'] },
  { topicId: 'sec_record_sharing', title: 'Record-Level Sharing (OWD, Hierarchy)', category: 'security', keywords: ['record-level sharing', 'owd', 'role hierarchy', 'manual sharing'] },
  { topicId: 'sec_sharing_rules', title: 'Sharing Rules (Criteria & Owner-based)', category: 'security', keywords: ['sharing rule', 'criteria-based', 'owner-based', 'public groups'] },
  { topicId: 'sec_role_hierarchy', title: 'Role Hierarchy & Access Inheritance', category: 'security', keywords: ['role hierarchy', 'manager access', 'grant access using hierarchies'] },
  { topicId: 'sec_user_system_mode', title: 'User Mode vs System Mode (WITH USER_MODE)', category: 'security', keywords: ['with user_mode', 'with system_mode', 'with sharing', 'without sharing'] },

  // --- 7. Deployment & DevOps (9 topics) ---
  { topicId: 'devops_change_sets', title: 'Change Sets & Org Migrations', category: 'devops', keywords: ['change set', 'inbound change set', 'outbound change set', 'sandbox to prod'] },
  { topicId: 'devops_sf_cli', title: 'Salesforce CLI (sf / sfdx commands)', category: 'devops', keywords: ['salesforce cli', 'sfdx', 'sf project deploy', 'sf org display'] },
  { topicId: 'devops_git', title: 'Git & Branching Strategies', category: 'devops', keywords: ['git', 'branch', 'git flow', 'pull request', 'merge'] },
  { topicId: 'devops_vscode', title: 'VS Code & Salesforce Extension Pack', category: 'devops', keywords: ['vs code', 'salesforce extensions', 'apex language server', 'deploy on save'] },
  { topicId: 'devops_azure_pipelines', title: 'Azure DevOps & CI/CD Pipelines', category: 'devops', keywords: ['azure devops', 'github actions', 'pipeline', 'ci/cd', 'yaml'] },
  { topicId: 'devops_ci_cd', title: 'Automated CI/CD Workflows', category: 'devops', keywords: ['automated testing', 'scratch org pool', 'build pipeline'] },
  { topicId: 'devops_center', title: 'DevOps Center', category: 'devops', keywords: ['devops center', 'work items', 'pipeline environments'] },
  { topicId: 'devops_validation', title: 'Deployment Validation (Check Only)', category: 'devops', keywords: ['check-only', 'validation deployment', 'quick deploy'] },
  { topicId: 'devops_rollback', title: 'Rollback Planning & Destructive Changes', category: 'devops', keywords: ['destructive changes', 'destructivechanges.xml', 'rollback', 'version control'] }
];

export class KnowledgeCoverageService {
  /**
   * Generates a complete coverage report auditing all 63 canonical Salesforce topics
   * against actual items in the content inventory.
   */
  public generateCoverageReport(): OverallCoverageReport {
    const inventory = contentInventoryService.getInventory();

    const categoryLabels: Record<SkillCategory, string> = {
      admin: 'Salesforce Administration',
      apex: 'Apex Development',
      async_apex: 'Asynchronous Apex',
      lwc: 'Lightning Web Components',
      integrations: 'Salesforce Integrations',
      security: 'Salesforce Security',
      flows: 'Flows and Automation',
      devops: 'Deployment & DevOps'
    };

    const topicCoverageItems: TopicCoverageItem[] = CANONICAL_SALESFORCE_TOPICS.map((canonical) => {
      // Find matching items in inventory by topicId, topicTitle, category, or keywords
      const matchedItems = inventory.filter((item) => {
        const itemCategory = (item.category || '').toLowerCase();
        const canCategory = canonical.category.toLowerCase();

        const isCategoryRelated =
          itemCategory === canCategory ||
          (canCategory === 'admin' && (itemCategory === 'flows' || itemCategory === 'security')) ||
          (canCategory === 'apex' && itemCategory === 'async_apex') ||
          (canCategory === 'async_apex' && itemCategory === 'apex') ||
          (canCategory === 'security' && itemCategory === 'admin') ||
          (canCategory === 'integrations' && (itemCategory === 'async_apex' || itemCategory === 'apex'));

        if (!isCategoryRelated) return false;

        const hayStack = `${item.topicId} ${item.topicTitle} ${item.title}`.toLowerCase();
        return canonical.keywords.some((kw) => hayStack.includes(kw.toLowerCase()));
      });

      const lessonsCount = matchedItems.filter((i) => i.contentType === 'article' || i.contentType === 'update').length;
      const mcqsCount = matchedItems.filter((i) => i.contentType === 'scenario_mcq').length;
      const knowledgeEntriesCount = matchedItems.filter((i) => i.contentType === 'knowledge_qa').length;

      let coverageStatus: TopicCoverageStatus = 'missing';
      if ((lessonsCount >= 1 || knowledgeEntriesCount >= 1) && mcqsCount >= 1) {
        coverageStatus = 'available';
      } else if (lessonsCount >= 1 || mcqsCount >= 1 || knowledgeEntriesCount >= 1) {
        coverageStatus = 'partially_covered';
      } else {
        coverageStatus = 'missing';
      }

      return {
        topicId: canonical.topicId,
        title: canonical.title,
        category: canonical.category,
        coverageStatus,
        lessonsCount,
        mcqsCount,
        knowledgeEntriesCount,
        relatedContentIds: matchedItems.map((i) => i.contentId)
      };
    });

    // Group by category
    const categoriesMap = new Map<SkillCategory, TopicCoverageItem[]>();
    for (const t of topicCoverageItems) {
      if (!categoriesMap.has(t.category)) {
        categoriesMap.set(t.category, []);
      }
      categoriesMap.get(t.category)!.push(t);
    }

    const categories: CategoryCoverageSummary[] = [];
    categoriesMap.forEach((topics, category) => {
      const available = topics.filter((t) => t.coverageStatus === 'available').length;
      const partially = topics.filter((t) => t.coverageStatus === 'partially_covered').length;
      const missing = topics.filter((t) => t.coverageStatus === 'missing').length;
      const coveredCount = topics.filter((t) => t.coverageStatus !== 'missing').length;
      const coveragePercentage = topics.length > 0
        ? Math.round((coveredCount / topics.length) * 100)
        : 0;

      categories.push({
        category,
        categoryLabel: categoryLabels[category] || category.toUpperCase(),
        totalTopics: topics.length,
        availableTopics: available,
        partiallyCoveredTopics: partially,
        missingTopics: missing,
        coveragePercentage,
        topics
      });
    });

    const totalTopics = topicCoverageItems.length;
    const totalAvailable = topicCoverageItems.filter((t) => t.coverageStatus === 'available').length;
    const totalPartially = topicCoverageItems.filter((t) => t.coverageStatus === 'partially_covered').length;
    const totalMissing = topicCoverageItems.filter((t) => t.coverageStatus === 'missing').length;
    const totalNeedsReview = topicCoverageItems.filter((t) => t.coverageStatus === 'needs_review').length;
    const totalCovered = topicCoverageItems.filter((t) => t.coverageStatus !== 'missing').length;

    const overallCoveragePercentage = totalTopics > 0
      ? Math.round((totalCovered / totalTopics) * 100)
      : 0;

    return {
      totalTopics,
      availableTopics: totalAvailable,
      partiallyCoveredTopics: totalPartially,
      missingTopics: totalMissing,
      needsReviewTopics: totalNeedsReview,
      overallCoveragePercentage,
      categories,
      unmappedInventoryCount: 0
    };
  }

  /**
   * Filters topic coverage items by status, category, or search term.
   */
  public filterCoverageTopics(filters: {
    category?: string;
    coverageStatus?: TopicCoverageStatus | 'all';
    search?: string;
  }): TopicCoverageItem[] {
    const report = this.generateCoverageReport();
    let allTopics: TopicCoverageItem[] = [];
    for (const cat of report.categories) {
      allTopics.push(...cat.topics);
    }

    if (filters.category && filters.category !== 'all') {
      allTopics = allTopics.filter((t) => t.category.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters.coverageStatus && filters.coverageStatus !== 'all') {
      allTopics = allTopics.filter((t) => t.coverageStatus === filters.coverageStatus);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      allTopics = allTopics.filter((t) => t.title.toLowerCase().includes(q) || t.topicId.toLowerCase().includes(q));
    }

    return allTopics;
  }
}

export const knowledgeCoverageService = new KnowledgeCoverageService();
