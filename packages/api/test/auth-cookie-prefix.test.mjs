import assert from 'node:assert/strict';
import test from 'node:test';

test('uses a FinLens-specific cookie namespace', async () => {
  const { auth } = await import('../dist/lib/auth.js');
  const context = await auth.$context;

  assert.equal(context.authCookies.sessionToken.name, 'finlens.session_token');
  assert.equal(context.createAuthCookie('oauth_state').name, 'finlens.oauth_state');
});
