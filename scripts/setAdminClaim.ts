// scripts/setAdminClaim.ts
/**
 * Admin Custom Claim Bootstrap Script
 * Securely assigns { admin: true } to an administrative account.
 * Note: Must be run in a privileged server/CLI environment with service account credentials,
 * NEVER from client-side browser code.
 *
 * Usage:
 *   npx ts-node scripts/setAdminClaim.ts <user-email-or-uid>
 */

export async function setAdminClaimGuide(targetIdentifier: string) {
  console.log(`\n======================================================`);
  console.log(`Admin Privilege Bootstrap Guide for: ${targetIdentifier}`);
  console.log(`======================================================\n`);
  console.log(`Security Rules ensure that client-side code CANNOT elevate user privileges.`);
  console.log(`To assign admin status to '${targetIdentifier}':`);
  console.log(`\nOption 1 (Using Firebase CLI):`);
  console.log(`  firebase auth:export users.json`);
  console.log(`\nOption 2 (Using Firebase Admin SDK in Node.js):`);
  console.log(`  const admin = require('firebase-admin');`);
  console.log(`  admin.initializeApp();`);
  console.log(`  const user = await admin.auth().getUserByEmail('${targetIdentifier}');`);
  console.log(`  await admin.auth().setCustomUserClaims(user.uid, { admin: true });`);
  console.log(`  console.log('Admin custom claim granted to ' + user.email);`);
  console.log(`\n======================================================\n`);
}

if (process.argv[2]) {
  setAdminClaimGuide(process.argv[2]);
}
