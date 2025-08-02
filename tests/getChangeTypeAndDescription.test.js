import { describe, it, expect } from 'vitest';
const { getChangeTypeAndDescription } = require('../getChangeTypeAndDescription');

describe('getChangeTypeAndDescription', () => {
  it('detects major change', () => {
    const msg = 'BREAKING CHANGE: something big';
    const result = getChangeTypeAndDescription(msg);
    expect(result.changeType).toBe('major');
    expect(result.description).toBe('something big');
  });

  it('detects minor change', () => {
    const msg = 'feat(core): add new feature';
    const result = getChangeTypeAndDescription(msg);
    expect(result.changeType).toBe('minor');
    expect(result.scope).toBe('core');
    expect(result.description).toBe('add new feature');
  });

  it('detects patch change', () => {
    const msg = 'fix(web-component): bug fix';
    const result = getChangeTypeAndDescription(msg);
    expect(result.changeType).toBe('patch');
    expect(result.scope).toBe('web-component');
    expect(result.description).toBe('bug fix');
  });

  it('falls back to patch for unknown message', () => {
    const msg = 'docs: update readme';
    const result = getChangeTypeAndDescription(msg);
    expect(result.changeType).toBe('patch');
    expect(result.scope).toBe(null);
    expect(result.description).toBe(msg);
  });
});
