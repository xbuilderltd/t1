import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
const { createChangesetFile } = require('../createChangesetFile');
const fs = require('fs');

describe('createChangesetFile', () => {
  let writeFileSyncSpy;
  let existsSyncSpy;
  let mkdirSyncSpy;

  beforeEach(() => {
    writeFileSyncSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    existsSyncSpy = vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    mkdirSyncSpy = vi.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
  });

  afterEach(() => {
    writeFileSyncSpy.mockRestore();
    existsSyncSpy.mockRestore();
    mkdirSyncSpy.mockRestore();
  });

  it('writes correct changeset file', () => {
    const filePath = createChangesetFile('test-pkg', 'minor', 'desc');
    expect(writeFileSyncSpy).toHaveBeenCalled();
    const content = writeFileSyncSpy.mock.calls[0][1];
    expect(content).toContain("'test-pkg': minor");
    expect(content).toContain('desc');
    expect(content).toMatchInlineSnapshot(`"---\n'test-pkg': minor\n---\ndesc\n"`);
  });
});
