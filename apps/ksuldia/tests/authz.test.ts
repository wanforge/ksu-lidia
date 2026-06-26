import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  canViewAuditLog,
  isBackOfficeRole,
} from '../src/lib/authz';

test('back-office roles exclude EMPLOYEE', () => {
  assert.equal(isBackOfficeRole('ADMIN'), true);
  assert.equal(isBackOfficeRole('OPERATOR'), true);
  assert.equal(isBackOfficeRole('VERIFIER'), true);
  assert.equal(isBackOfficeRole('VIEWER'), true);
  assert.equal(isBackOfficeRole('EMPLOYEE'), false);
});

test('audit log is visible to ADMIN, OPERATOR, VERIFIER only', () => {
  assert.equal(canViewAuditLog('ADMIN'), true);
  assert.equal(canViewAuditLog('OPERATOR'), true);
  assert.equal(canViewAuditLog('VERIFIER'), true);
  assert.equal(canViewAuditLog('VIEWER'), false);
  assert.equal(canViewAuditLog('EMPLOYEE'), false);
});
