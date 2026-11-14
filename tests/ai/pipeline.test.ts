// tests/ai/pipeline.test.ts
import { runGeneration } from '../../src/ai/pipeline';
import fixture from '../../src/ai/fixtures/mock/draftFixture.json';
import path from 'path';
import { promises as fs } from 'fs';

describe('AI Generation Pipeline', () => {
  const draftPath = path.resolve(process.cwd(), 'dev', 'drafts', `${fixture.documentId}.json`);

  afterAll(async () => {
    try { await fs.unlink(draftPath); } catch (_) {}
  });

  test('runGeneration saves draft using mock LLM client', async () => {
    const result = await runGeneration(fixture as any);
    expect(result.draft).toBeDefined();
    expect(result.draft.documentId).toBe(fixture.documentId);
    const stat = await fs.stat(draftPath);
    expect(stat.isFile()).toBe(true);
    const saved = JSON.parse(await fs.readFile(draftPath, 'utf-8'));
    expect(saved.documentId).toBe(fixture.documentId);
  });
});
