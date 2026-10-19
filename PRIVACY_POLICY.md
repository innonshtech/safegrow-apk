# Privacy Policy for SafeGrow

**Effective Date:** October 16, 2026  
**Last Updated:** October 16, 2026  
**Applicable Applications:** SafeGrow Mobile Application (Android & iOS) and SafeGrow Admin Portal  
**Package Name / Bundle Identifier:** `com.safegrow.app` / `com.safegrowmobile`  

---

## 1. Introduction

SafeGrow ("we", "our", or "us") provides the SafeGrow Field Sales & Workforce Management Platform, encompassing the SafeGrow mobile application ("the App") and the SafeGrow web administration dashboard ("the Portal"). SafeGrow is an enterprise-grade business-to-business (B2B) solution designed to facilitate attendance verification, field sales route management, dealer visit verification, and operational workflow tracking between employers ("Organizations") and their authorized field personnel ("Users" or "Employees").

This Privacy Policy explains how we collect, use, process, disclose, and safeguard personal and operational information when you use our mobile application and related services. This document has been constructed in strict compliance with the **Google Play Developer Program Policies** (including the Prominent Background Location Disclosure and Data Safety standards), the **Apple App Store Review Guidelines** (including Guideline 5.1 on Privacy and Data Collection), and applicable data protection regulations (including GDPR and CCPA where applicable).

By using the SafeGrow application, you acknowledge the collection and handling of your data in accordance with this Privacy Policy.

---

## 2. Prominent Disclosure: Background Location Tracking

> ### 📍 IMPORTANT PROMINENT DISCLOSURE (Google Play & Apple App Store Compliance)
>
> **SafeGrow collects precise and approximate location data, including background location data (when the App is closed or not in active use on your screen), exclusively to enable core operational workforce management features:**
>
> 1. **Continuous Shift Route Tracking:** Verifying travel routes, calculating accurate travel distances, and validating daily travel allowances during active working hours.
> 2. **Attendance Verification & Geofencing:** Verifying that employee clock-in and clock-out actions occur at designated work territories or approved client facilities.
> 3. **Client & Dealer Visit Validation:** Verifying physical presence when recording dealer visits, orders, and customer meetings.
>
> #### When is Background Location Active?
> - **Active Shift Only:** Background location collection **ONLY** operates between the moment you explicitly complete a "Check-In" action and when you complete a "Check-Out" action.
> - **Automatic Cessation:** Once you tap "Check-Out" (or your shift reaches its configured automatic end time), **all location tracking is completely halted**. SafeGrow does NOT monitor your location during off-duty hours, weekends, or approved leaves.
> - **No Advertising / No Sale of Data:** SafeGrow **NEVER** sells, trades, or rents your location data. Location data is **NEVER** shared with third-party advertising networks, data brokers, or marketing platforms.

---

## 3. Information We Collect

### A. Personal & Account Information
- **Identity Data:** Full name, Employee ID, assigned sales territory, reporting manager, and organizational role (`ADMIN`, `MANAGER`, `REP`).
- **Contact Data:** Email address and mobile phone number (used for authentication, credentials delivery, and one-time password/OTP password recovery).
- **Authentication Data:** User ID, securely salted and hashed passwords (bcrypt).

### B. Geolocation Data
- **Foreground Location:** Latitude, longitude, altitude, bearing, and accuracy captured when you perform actions such as Check-In, Check-Out, and creating Visit Records.
- **Background Location (`ACCESS_BACKGROUND_LOCATION` / `Location Always`):** Periodic location pings (`LocationPing` records containing timestamp, coordinates, speed, and horizontal accuracy) collected in the background while your shift status is active to track duty travel.
- **Anti-Fraud Telemetry:** Detection of mock location providers, fake GPS spoofing software, and device clock alterations to preserve operational integrity.

### C. Camera & Photo Data
- **Attendance Verification Photos:** Camera selfies captured at the moment of Check-In and Check-Out to verify physical identity and attendance.
- **Field Visit Documentation Photos:** Photos captured on-site during client, vendor, or dealer visits to verify orders and operational meetings.
- *Notice on Photo Library:* SafeGrow requires camera hardware access (`android.permission.CAMERA` / `NSCameraUsageDescription`) strictly to capture live verification photos. The App does not access, browse, or upload your private photo gallery or camera roll.

### D. Operational & Workflow Data
- **Attendance Logs:** Timestamps of check-in, check-out, working hours, and shift duration.
- **Attendance Regularization Requests:** Employee-submitted requests for missed check-ins/check-outs, including user-provided explanations.
- **Leave Records:** Leave applications (casual, privilege, medical), requested date ranges, justification notes, and approval statuses.
- **Visit Records:** Target dealer/vendor name, area, meeting outcome (`MET`, `ORDER_PLACED`, `NOT_AVAILABLE`), order notes, and visit duration.

### E. Device & Technical Information
- **Device Identifiers:** Device manufacturer, model, operating system version, and unique installation identifiers (`react-native-device-info`).
- **Push Notification Tokens:** Firebase Cloud Messaging (FCM) device tokens utilized to deliver shift reminders, manager notifications, sync alerts, and system announcements.
- **Diagnostics & Performance:** Crash logs, application error diagnostics, and network status data required to troubleshoot sync issues.

---

## 4. How We Use Your Information

We process collected information solely for legitimate enterprise and business operational purposes:
- **Core Platform Functionality:** Authenticating authorized personnel, recording daily attendance, verifying shift duration, and logging client visits.
- **Duty Travel & Expense Reimbursement:** Calculating distance traveled during shifts to assist your Organization in processing accurate travel and fuel allowances.
- **Fraud Prevention & Security:** Preventing location spoofing and unauthorized proxy attendance through geofencing and camera selfies.
- **Communication & Notifications:** Sending real-time operational notifications, shift alerts, manager broadcasts, and security OTP codes.
- **Enterprise Reporting:** Generating aggregated team activity summaries, territory coverage reports, and visit logs for authorized organizational managers and administrators.

---

## 5. Sharing & Disclosure of Information

SafeGrow is designed for internal organizational operations. We do **not** sell, monetize, or publicly distribute your personal information. Data is disclosed only under the following limited circumstances:

1. **Within Your Organization:** Your attendance records, location logs, visit logs, and leave requests are accessible strictly to authorized managers and administrators within your employer organization based on role-based access control (RBAC).
2. **Third-Party Service Providers:** We partner with trusted enterprise infrastructure providers who assist in operating the platform under strict confidentiality agreements:
   - **Amazon Web Services (AWS S3):** Secure, encrypted cloud storage for attendance selfies and visit documentation photos.
   - **Google Cloud Platform / Google Maps API:** Geocoding services and map visualization of sales routes.
   - **Google Firebase (FCM):** Infrastructure for delivering transactional push notifications.
3. **Legal & Compliance Obligations:** We may disclose information if required to do so by applicable laws, valid court orders, or lawful requests by public authorities.

---

## 6. Data Storage, Security & Encryption

We employ robust industry-standard technical and organizational security measures:
- **Encryption in Transit:** All network communication between the mobile application, web portal, and backend APIs is encrypted using **Transport Layer Security (TLS 1.2/1.3 / HTTPS)**.
- **Encryption at Rest:** Sensitive records, including passwords, are hashed with salted **bcrypt** algorithms. Telemetry, databases, and AWS S3 media buckets enforce server-side AES-256 encryption.
- **Local Device Security:** Authentication tokens and offline sync queues are encrypted locally using Android Keystore and iOS Keychain backed storage (`react-native-encrypted-storage` and encrypted MMKV).
- **Access Restrictions:** Internal database access is restricted by firewalls, VPC peering, and least-privilege administrative access policies.

---

## 7. Data Retention & Deletion Policy

### A. Retention Period
Personal and operational records (attendance logs, location pings, and visit entries) are retained for as long as your account remains active within your employer's organization and for a reasonable statutory period thereafter to comply with labor laws, payroll audit requirements, and corporate governance standards.

### B. User-Initiated Account & Data Deletion (Google Play & Apple Compliance)
Both Google Play and Apple App Store policies mandate that users have the right to request deletion of their account and associated personal data.

- **Requesting Deletion via the Mobile App:**
  1. Open the SafeGrow Mobile App.
  2. Navigate to **Profile** > **Settings** > **Account** > **Request Account Deletion**.
  3. Submit your deletion request.
- **Requesting Deletion via Email / Web Form:**
  You or your organization's authorized representative may submit an account deletion request at any time by emailing **info@safegrow.in** or your organization's SafeGrow system administrator with your Employee ID and registered mobile number.
- **Processing of Request:**
  Upon receiving a verified deletion request:
  1. Authentication credentials and biometric/selfie photos are permanently expunged or anonymized from active databases within **30 business days**.
  2. Location telemetry points are decoupled from personal identifiers.
  3. Certain historical attendance and payroll-related records may be retained in encrypted archives strictly where required by applicable statutory labor regulations.

---

## 8. Permissions Requested by the SafeGrow App

| Permission | Platform | Purpose |
| :--- | :--- | :--- |
| `ACCESS_FINE_LOCATION` | Android | Captures precise GPS coordinates during check-in, check-out, and client visits. |
| `ACCESS_COARSE_LOCATION` | Android | Provides approximate network-based location fallback when GPS signal is low. |
| `ACCESS_BACKGROUND_LOCATION` | Android | Enables shift route tracking and distance measurement while the app is in the background. |
| `FOREGROUND_SERVICE_LOCATION` | Android | Displays persistent status notification during active tracking to ensure transparency. |
| `CAMERA` | Android & iOS | Used solely to capture verification selfies for attendance and on-site visit proof. |
| `POST_NOTIFICATIONS` | Android & iOS | Delivers shift alerts, manager notices, and sync failure notifications. |
| `NSLocationWhenInUseUsageDescription` | iOS | Accesses device location to verify check-in and client visits while using the app. |
| `NSLocationAlwaysAndWhenInUseUsageDescription` | iOS | Accesses device location during active work shifts to map duty travel routes. |

---

## 9. Children's Privacy

SafeGrow is an enterprise workplace tool strictly intended for commercial use by authorized employees, sales representatives, and business personnel aged **18 years or older**. The application is **not** directed to children under 13 (or under 16 in applicable jurisdictions). We do not knowingly collect, solicit, or maintain personal information from minors. If we discover that a minor has submitted personal information, we will immediately delete such data.

---

## 10. Your Privacy Rights & Choices

Depending on your jurisdiction, you possess the following rights regarding your personal information:
- **Right to Access:** You can view your attendance records, visit logs, and profile details directly within the mobile app.
- **Right to Rectification:** You can request corrections to erroneous attendance records via the "Attendance Regularization Request" feature.
- **Right to Withdraw Location Consent:** You may revoke location permissions at any time via your device's operating system settings (`Settings > Apps > SafeGrow > Permissions > Location`). Please note that revoking location permissions may prevent you from completing mandatory duty check-ins and client visits as required by your employer.

---

## 11. Changes to This Privacy Policy

We may periodically update this Privacy Policy to reflect enhancements to our service, operational requirements, or changes in legal regulations. When updates are published:
- The "Last Updated" date at the top of this policy will be revised.
- For material changes that affect data collection or background tracking, an in-app notice or push notification will be issued prior to the changes taking effect.
- We encourage users to review this policy periodically.

---

## 12. Contact Information

If you have questions, concerns, complaints, or wish to exercise your data privacy rights, please contact our Data Protection Officer (DPO) and support team at:

- **Email:** info@safegrow.in
- **Phone / Hotline:** +91 98347 92644
- **Official Website:** https://www.safegrow.in/
- **Policy Hosted At:** https://safegrow-apk-admin.vercel.app/privacy-policy
- **Organization:** SafeGrow (Innonsh Technologies)
- **Mailing Address:**  
  SafeGrow / Innonsh Technologies Legal & Compliance Department  
  Attn: Data Privacy Officer  

---
*This privacy policy meets all compliance standards for Google Play Store Data Safety Declarations and Apple App Store Review Guideline 5.1.*
