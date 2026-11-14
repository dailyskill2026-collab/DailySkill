// Sample Explore Content for Sprint 4
// This file provides a list of learning cards that will be displayed in the Explore feed.
// Each entry must have verificationStatus "published" (or "sample") to be shown.

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
  version?: string;
  verificationStatus: "published" | "sample";
  sourceUrl?: string; // Must be a valid URL when provided
  sourceName?: string;
  lastVerified?: string; // ISO date
}

export const exploreContent: LearningContent[] = [
  {
    id: "c1",
    technology: "Salesforce",
    topic: "Apex",
    title: "New Apex Language Features in Spring ’24",
    summary: "Explore the latest enhancements to Apex, including pattern matching and improved error handling.",
    whyItMatters: "These features reduce boilerplate code and improve runtime performance.",
    projectExample: "Refactor a trigger to use pattern matching for record type discrimination.",
    readingTimeMinutes: 5,
    difficulty: "Intermediate",
    version: "Spring ’24",
    verificationStatus: "published",
    sourceUrl: "https://releasenotes.salesforce.com/en-us/spring24/release-notes/apex",
    sourceName: "Salesforce Release Notes",
    lastVerified: "2024-09-10",
  },
  {
    id: "c2",
    technology: "Salesforce",
    topic: "LWC",
    title: "LWC Performance Tips for Mobile",
    summary: "Best practices to keep Lightning Web Components snappy on low‑end devices.",
    whyItMatters: "Improves user experience and reduces bounce rates on mobile.",
    projectExample: "Implement lazy loading of heavy data tables in a custom LWC.",
    readingTimeMinutes: 4,
    difficulty: "Beginner",
    verificationStatus: "published",
    sourceUrl: "https://developer.salesforce.com/docs/component-library/documentation/en/lwc",
    sourceName: "Salesforce LWC Docs",
    lastVerified: "2024-08-01",
  },
  {
    id: "c3",
    technology: "Salesforce",
    topic: "Integration",
    title: "Connecting to External APIs with Named Credentials",
    summary: "Simplify secure API integration using Named Credentials.",
    whyItMatters: "Reduces code complexity and centralises authentication.",
    projectExample: "Build an integration that pulls employee data from an HR system.",
    readingTimeMinutes: 6,
    difficulty: "Advanced",
    verificationStatus: "sample",
    sourceUrl: "https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_defining_named_credentials.htm",
    sourceName: "Salesforce Docs",
    lastVerified: "2024-07-15",
  },
  {
    id: "c4",
    technology: "AWS",
    topic: "Security",
    title: "IAM Best Practices for Least‑Privilege Access",
    summary: "Guidelines to design IAM roles that follow the principle of least privilege.",
    whyItMatters: "Helps prevent privilege escalation attacks.",
    projectExample: "Create a role that allows Lambda functions to read from a specific S3 bucket only.",
    readingTimeMinutes: 5,
    difficulty: "Intermediate",
    verificationStatus: "published",
    sourceUrl: "https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html",
    sourceName: "AWS IAM Docs",
    lastVerified: "2024-06-30",
  },
  {
    id: "c5",
    technology: "Docker",
    topic: "Containers",
    title: "Multi‑Stage Builds for Smaller Images",
    summary: "Learn how to use multi‑stage Dockerfiles to reduce final image size.",
    whyItMatters: "Smaller images lead to faster deployments and lower storage costs.",
    projectExample: "Create a multi‑stage Dockerfile for a Node.js app that compiles TypeScript in the first stage.",
    readingTimeMinutes: 3,
    difficulty: "Beginner",
    verificationStatus: "published",
    sourceUrl: "https://docs.docker.com/develop/develop-images/multistage-build/",
    sourceName: "Docker Docs",
    lastVerified: "2024-05-20",
  },
];
