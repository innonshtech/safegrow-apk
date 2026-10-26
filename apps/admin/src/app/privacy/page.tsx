import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | SafeGrow Field Sales Platform',
  description: 'Official Privacy Policy and Data Safety Disclosures for SafeGrow Mobile Application and Services.',
};

export default function PrivacyPolicyPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', color: '#111827', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', padding: '2rem 1rem' }}>
      <main style={{ maxWidth: '860px', margin: '0 auto', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', padding: '2.5rem' }}>
        
        {/* Header */}
        <header style={{ borderBottom: '2px solid #E5E7EB', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ display: 'inline-block', backgroundColor: '#E8F5E9', color: '#2E7D32', fontWeight: 600, fontSize: '0.875rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', marginBottom: '0.5rem' }}>
                SafeGrow Platform
              </span>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                Privacy Policy &amp; Data Safety
              </h1>
            </div>
            <Link href="/" style={{ color: '#2E7D32', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', border: '1px solid #C8E6C9', padding: '0.5rem 1rem', borderRadius: '6px' }}>
              &larr; Back to Portal
            </Link>
          </div>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '0.75rem' }}>
            <strong>Effective Date:</strong> October 16, 2026 &nbsp;|&nbsp; <strong>Last Updated:</strong> October 16, 2026<br />
            <strong>Application:</strong> SafeGrow Mobile App (Android &amp; iOS) &bull; <strong>ID:</strong> <code>com.safegrow.app</code> / <code>com.safegrowmobile</code>
          </p>
        </header>

        {/* Prominent Disclosure Alert (Google Play & App Store Compliance) */}
        <section style={{ backgroundColor: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '8px', padding: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>📍</span>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#92400E', margin: '0 0 0.5rem 0' }}>
                Prominent Disclosure: Background Location Tracking (Google Play &amp; Apple Compliance)
              </h2>
              <p style={{ color: '#78350F', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                <strong>SafeGrow collects precise and approximate location data, including in the background (when the app is closed or not in use), exclusively to enable field sales route tracking, travel distance calculation, and attendance verification during your active work shift.</strong>
              </p>
              <ul style={{ color: '#78350F', fontSize: '0.875rem', marginTop: '0.5rem', paddingLeft: '1.25rem', lineHeight: 1.5 }}>
                <li>Location tracking is <strong>only active</strong> after you tap <strong>&ldquo;Check-In&rdquo;</strong> and completely stops the moment you tap <strong>&ldquo;Check-Out&rdquo;</strong>.</li>
                <li>SafeGrow <strong>never tracks your location off-duty</strong>, during personal hours, weekends, or approved leaves.</li>
                <li>Location data is <strong>never sold, rented, or shared with third-party advertisers or data brokers</strong>.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 1 */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#111827', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            1. Overview &amp; Scope
          </h2>
          <p style={{ color: '#374151', lineHeight: 1.6, fontSize: '0.95rem' }}>
            SafeGrow (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is an enterprise field workforce management solution provided to corporate employers (&ldquo;Organizations&rdquo;) and their authorized sales representatives and field employees (&ldquo;Users&rdquo;). This Privacy Policy details the policies governing the collection, utilization, storage, and protection of data processed through the SafeGrow Mobile Application and the SafeGrow Administration Portal.
          </p>
        </section>

        {/* Section 2 */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#111827', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            2. Categories of Information Collected
          </h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1B5E20', marginBottom: '0.25rem' }}>
                A. Personal &amp; Organization Data
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#4B5563', margin: 0 }}>
                Full Name, Employee ID, assigned sales territory, phone number, email address, reporting manager, and organizational role (<code>ADMIN</code>, <code>MANAGER</code>, <code>REP</code>). Passwords are cryptographically hashed using salted bcrypt.
              </p>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1B5E20', marginBottom: '0.25rem' }}>
                B. Geolocation Data (Foreground &amp; Background)
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#4B5563', margin: 0 }}>
                GPS coordinates (latitude, longitude, speed, horizontal accuracy, timestamp) captured during check-in, check-out, client visits, and periodic background tracking pings during active work shifts to substantiate travel allowances and work coverage.
              </p>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1B5E20', marginBottom: '0.25rem' }}>
                C. Camera &amp; Live Verification Photos
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#4B5563', margin: 0 }}>
                Live selfies captured at check-in/out to verify employee physical attendance, and on-site photos of vendor/dealer facilities to document visits. The app does not access or browse your device photo gallery.
              </p>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1B5E20', marginBottom: '0.25rem' }}>
                D. Device Information &amp; Anti-Fraud Telemetry
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#4B5563', margin: 0 }}>
                Device model, operating system version, unique device installation ID, and Firebase Cloud Messaging (FCM) tokens for shift notifications. Anti-fraud telemetry detects mock location / fake GPS apps to safeguard operational accuracy.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#111827', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            3. How We Use the Data
          </h2>
          <ul style={{ color: '#374151', fontSize: '0.925rem', lineHeight: 1.6, paddingLeft: '1.25rem' }}>
            <li><strong>Workforce Operations:</strong> Recording verified employee attendance and calculating working hours.</li>
            <li><strong>Travel Expense Validation:</strong> Calculating accurate distance covered during duty hours for reimbursement and fuel allowance calculation.</li>
            <li><strong>Field Sales Validation:</strong> Verifying client and dealer visit records, order statuses, and meeting outcomes.</li>
            <li><strong>Safety &amp; Compliance:</strong> Ensuring employee safety during transit and preventing proxy attendance.</li>
            <li><strong>Transactional Notifications:</strong> Sending shift start reminders, sync alerts, and manager announcements via push notifications.</li>
          </ul>
        </section>

        {/* Section 4: Permissions Table */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#111827', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            4. Device Permissions Requested
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F3F4F6', color: '#374151', borderBottom: '2px solid #E5E7EB' }}>
                  <th style={{ padding: '0.75rem' }}>Permission</th>
                  <th style={{ padding: '0.75rem' }}>Platform</th>
                  <th style={{ padding: '0.75rem' }}>Operational Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>ACCESS_FINE_LOCATION</td>
                  <td style={{ padding: '0.75rem' }}>Android</td>
                  <td style={{ padding: '0.75rem' }}>Captures precise GPS coordinates during check-in, check-out, and dealer visits.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>ACCESS_BACKGROUND_LOCATION</td>
                  <td style={{ padding: '0.75rem' }}>Android</td>
                  <td style={{ padding: '0.75rem' }}>Calculates duty travel distance and logs sales route while app is closed during shifts.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>FOREGROUND_SERVICE_LOCATION</td>
                  <td style={{ padding: '0.75rem' }}>Android</td>
                  <td style={{ padding: '0.75rem' }}>Displays persistent status indicator while location tracking is active for user transparency.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>CAMERA</td>
                  <td style={{ padding: '0.75rem' }}>Android / iOS</td>
                  <td style={{ padding: '0.75rem' }}>Captures live verification selfies for attendance and on-site photos of dealer meetings.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>NSLocationAlwaysAndWhenInUse</td>
                  <td style={{ padding: '0.75rem' }}>iOS</td>
                  <td style={{ padding: '0.75rem' }}>Enables continuous route and distance tracking during active sales duty hours on iOS.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 5: Third-Party Service Providers */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#111827', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            5. Third-Party Service Providers &amp; Data Transfers
          </h2>
          <p style={{ color: '#374151', lineHeight: 1.6, fontSize: '0.925rem' }}>
            We share data with third-party sub-processors solely to maintain cloud infrastructure and fulfill core functions under binding confidentiality agreements:
          </p>
          <ul style={{ color: '#374151', fontSize: '0.9rem', lineHeight: 1.6, paddingLeft: '1.25rem' }}>
            <li><strong>Amazon Web Services (AWS S3):</strong> Encrypted cloud storage for attendance selfies and visit documentation photos.</li>
            <li><strong>Google Maps Platform:</strong> Map rendering, route calculation, and reverse geocoding services.</li>
            <li><strong>Google Firebase Cloud Messaging (FCM):</strong> Push notification delivery.</li>
          </ul>
          <p style={{ color: '#374151', lineHeight: 1.6, fontSize: '0.925rem', marginTop: '0.5rem' }}>
            <strong>Zero Advertising Policy:</strong> SafeGrow contains no third-party advertising SDKs and does not monetize, sell, or trade any user telemetry or personal data.
          </p>
        </section>

        {/* Section 6: Account & Data Deletion */}
        <section style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '1.25rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#166534', margin: '0 0 0.5rem 0' }}>
            6. Account Deletion &amp; Data Retention (Google Play &amp; Apple Guideline 5.1.1(v) Compliant)
          </h2>
          <p style={{ color: '#14532D', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 0.75rem 0' }}>
            Users and client organizations have the right to request deletion of their SafeGrow account and associated data at any time:
          </p>
          <ol style={{ color: '#14532D', fontSize: '0.875rem', lineHeight: 1.6, paddingLeft: '1.25rem', margin: '0 0 0.75rem 0' }}>
            <li><strong>Through the Mobile App:</strong> Go to <strong>Profile &rarr; Settings &rarr; Account &rarr; Request Account Deletion</strong>.</li>
            <li><strong>Via Direct Email:</strong> Send an email to <a href="mailto:info@safegrow.in" style={{ color: '#166534', fontWeight: 600 }}>info@safegrow.in</a> with your registered Employee ID and Organization name.</li>
            <li><strong>Through your Organization Administrator:</strong> Administrators can deactivate and purge employee accounts directly via the SafeGrow Admin Portal.</li>
          </ol>
          <p style={{ color: '#14532D', fontSize: '0.85rem', margin: 0 }}>
            <em>Upon verified request, your personal login credentials, selfie photos, and telemetry trails are permanently purged within 30 business days, subject to statutory labor regulations governing employment records.</em>
          </p>
        </section>

        {/* Section 7: Security & Children */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#111827', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            7. Data Security &amp; Children&apos;s Privacy
          </h2>
          <p style={{ color: '#374151', lineHeight: 1.6, fontSize: '0.95rem' }}>
            <strong>Security:</strong> All network communication is encrypted using industry-standard TLS 1.2/1.3 encryption. Passwords and credentials are cryptographically protected. Media files are secured using presigned, expiring access URLs.
          </p>
          <p style={{ color: '#374151', lineHeight: 1.6, fontSize: '0.925rem', marginTop: '0.5rem' }}>
            <strong>Children&apos;s Privacy:</strong> SafeGrow is exclusively a business enterprise tool intended for authorized adults aged 18 and older. We do not knowingly collect or solicit personal information from children under 13 (or under 16 in relevant jurisdictions).
          </p>
        </section>

        {/* Section 8: Contact Information */}
        <footer style={{ borderTop: '2px solid #E5E7EB', paddingTop: '1.5rem', marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
            8. Contact Us &amp; Support
          </h2>
          <p style={{ color: '#4B5563', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
            If you have questions, feedback, or data privacy requests, contact us at:<br />
            <strong>Email:</strong> <a href="mailto:info@safegrow.in" style={{ color: '#2E7D32', textDecoration: 'underline' }}>info@safegrow.in</a><br />
            <strong>Phone:</strong> <a href="tel:+919834792644" style={{ color: '#2E7D32' }}>+91 98347 92644</a><br />
            <strong>Official Website:</strong> <a href="https://www.safegrow.in/" target="_blank" rel="noopener noreferrer" style={{ color: '#2E7D32' }}>https://www.safegrow.in/</a><br />
            <strong>Policy Hosted At:</strong> <a href="https://safegrow.innonsh.com/privacy" style={{ color: '#2E7D32' }}>https://safegrow.innonsh.com/privacy</a><br />
            <strong>Company:</strong> SafeGrow (Innonsh Technologies)
          </p>
        </footer>

      </main>
    </div>
  );
}
