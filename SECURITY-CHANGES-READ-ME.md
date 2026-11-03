# Security patch (review before deployment)

- Server Actions that administer users, courses, enrollments and full feedback now verify Firebase ID token and Firestore admin role.
- Admin pages pass their current Firebase ID token.
- Public `getAllFeedback` now returns only public review fields; admin dashboard calls `getAdminFeedback`.
- `firestore.rules.PROPOSED` is **not automatically deployed**. Review and test before publishing.

## IMPORTANT remaining risks
- Existing public feedback documents contain `userEmail`; the proposed rules block direct client reads and the public Server Action returns only sanitized review fields. Verify no other UI depends on direct feedback reads.
- `confirmEnrollment` marks `paymentStatus: paid` without verifying payment. Demo-only; never use for real payments.
- Enrollment count updates are not transactional; concurrent requests can cause overbooking.
- Firebase Storage rules and other routes have not been fully audited.
- Firebase Admin service-account key must be rotated if previously shared in a ZIP. Do not commit `.env.local`.
- Public Firebase browser API key is not a service account secret; restrict APIs appropriately.
- Test login, registration, admin users, courses, enrollments, feedback, and unauthorized requests before deployment.
