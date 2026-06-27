import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  canViewAuditLog,
  isBackOfficeRole,
} from '../src/lib/authz';

test('back-office roles exclude non-admin/non-staff if any', () => {
  assert.equal(isBackOfficeRole('ADMIN'), true);
  assert.equal(isBackOfficeRole('VIEWER'), true);
});

test('audit log is visible to ADMIN only', () => {
  assert.equal(canViewAuditLog('ADMIN'), true);
  assert.equal(canViewAuditLog('VIEWER'), false);
});

