
# HealthLink Application - Test Cases

This document outlines the test cases for the HealthLink application, covering authentication and role-specific functionalities.

---

## 1. Authentication

| Test Case ID | Feature | Test Scenario | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **AUTH-01** | Login | Successful login with valid credentials (Employee) | 1. Navigate to the login page. <br> 2. Enter a valid employee email and password. <br> 3. Click "Login". | User is successfully logged in and redirected to the `/dashboard` page. A "Login Successful" toast appears. |
| **AUTH-02** | Login | Successful login with valid credentials (Doctor) | 1. Navigate to the login page. <br> 2. Enter a valid doctor email and password. <br> 3. Click "Login". | User is successfully logged in and redirected to the `/doctor` page. |
| **AUTH-03** | Login | Successful login with valid credentials (IT Team) | 1. Navigate to the login page. <br> 2. Enter a valid IT Team email and password. <br> 3. Click "Login". | User is successfully logged in and redirected to the `/it-team` page. |
| **AUTH-04** | Login | Failed login with invalid password | 1. Navigate to the login page. <br> 2. Enter a valid email and an incorrect password. <br> 3. Click "Login". | User remains on the login page. A "Login Failed" toast appears with an error message. |
| **AUTH-05** | Login | Failed login with invalid email | 1. Navigate to the login page. <br> 2. Enter an invalid/non-existent email and any password. <br> 3. Click "Login". | User remains on the login page. A "Login Failed" toast appears with an error message. |
| **AUTH-06** | Logout | Successful logout | 1. Log in as any user. <br> 2. Click the user avatar in the top right. <br> 3. Click "Log out". | User is successfully logged out and redirected to the login page (`/`). |
| **AUTH-07** | Access Control | Prevent unauthorized access to employee dashboard | 1. Log out. <br> 2. Attempt to navigate directly to `/dashboard`. | User is redirected to the login page (`/`). |
| **AUTH-08** | Access Control | Prevent unauthorized access to doctor dashboard | 1. Log out. <br> 2. Attempt to navigate directly to `/doctor`. | User is redirected to the login page (`/`). |
| **AUTH-09** | Access Control | Prevent incorrect role access | 1. Log in as an Employee. <br> 2. Attempt to navigate directly to `/doctor` or `/it-team`. | User is automatically redirected back to their own dashboard (`/dashboard`). |

---

## 2. Employee Role (`/dashboard`)

| Test Case ID | Feature | Test Scenario | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **EMP-01** | Emergency | Send an emergency alert | 1. Log in as an Employee. <br> 2. On the dashboard, click the "EMERGENCY" button. <br> 3. In the confirmation dialog, click "Send Alert Now". | A "Emergency Alert Sent" toast appears. A new active emergency record is created in the `emergencies` collection in Firestore. |
| **EMP-02** | Profile | View profile information | 1. Log in as an Employee. <br> 2. Navigate to the `/dashboard/profile` page. | The form is pre-filled with the user's current name, email, and location details. |
| **EMP-03** | Profile | Update profile information | 1. Navigate to the profile page. <br> 2. Change the "Full Name" and "Seat Number". <br> 3. Click "Save Changes". | A "Profile Updated" toast appears. The user's document in the `users` collection is updated. The changes are reflected on the main dashboard. An activity log entry is created. |
| **EMP-04** | Wellness Profile | Add a new allergy | 1. Navigate to `/dashboard/wellness-profile`. <br> 2. Under Allergies, click "Add Allergy". <br> 3. Fill in the name and select a severity. <br> 4. Click "Save All Changes". | A "Wellness Profile Updated" toast appears. The new allergy is saved to the user's document and displayed on the main dashboard. An activity log entry is created. |
| **EMP-05** | Wellness Profile | Remove a medication | 1. Ensure the user has at least one medication. <br> 2. Navigate to `/dashboard/wellness-profile`. <br> 3. Click the trash icon next to a medication. <br> 4. Click "Save All Changes". | The medication is removed from the user's document in Firestore and no longer appears on the main dashboard. |
| **EMP-06** | Activity Log | View activity log | 1. Log in, update profile, and log out. <br> 2. Log back in and navigate to `/dashboard/activity-log`. | The log displays entries for "Login", "ProfileUpdate", and "Logout". |
| **EMP-07** | Activity Log | Filter activity log | 1. Navigate to `/dashboard/activity-log`. <br> 2. In the description filter, type "login". <br> 3. The table updates to show only log entries containing "login". |
| **EMP-08** | Digital Wellness | View wellness dashboard | 1. Navigate to `/dashboard/wellness`. | All charts and progress bars render correctly with the mock/default data from the user's profile. |
| **EMP-09** | Mock AI Signals | Manipulate wellness data | 1. Open two tabs: one for `/dashboard/wellness` and one for `/dashboard/mock-ai-signals`. <br> 2. On the mock signals page, adjust the "Screen Time Compliance" slider. | The "Daily Screen Time Goal" card and charts on the `/dashboard/wellness` page update in real-time to reflect the new value. |
| **EMP-10** | Mock AI Signals | Send a break notification | 1. Navigate to `/dashboard/mock-ai-signals`. <br> 2. Click "Send Manual Alert". | A "Break notification sent" toast appears. A system notification appears on the user's desktop (if permissions are granted). |

---

## 3. Doctor Role (`/doctor`)

| Test Case ID | Feature | Test Scenario | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **DOC-01** | Emergency Feed | Receive a new emergency alert in real-time | 1. Log in as a Doctor and stay on the `/doctor` page. <br> 2. In a separate browser, log in as an Employee and trigger an emergency. | The Doctor's "Active Emergencies" table updates automatically to show the new alert at the top. A browser notification is triggered for the doctor. |
| **DOC-02** | Emergency Feed | Resolve an active emergency | 1. Ensure there is an active emergency. <br> 2. As a Doctor, click the "Resolve" button next to an active emergency. | A "Emergency Resolved" toast appears. The emergency is removed from the "Active Emergencies" table and appears at the top of the "Resolved Emergencies" table. |
| **DOC-03** | Dashboard View | View empty state | 1. Ensure there are no active or resolved emergencies in Firestore. <br> 2. Log in as a Doctor. | Both tables display a message like "No active emergencies." |

---

## 4. IT Team Role (`/it-team`)

| Test Case ID | Feature | Test Scenario | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **IT-01** | User Creation | Open the Create User dialog | 1. Log in as an IT Team member. <br> 2. Click the "Create User Account" button. | A dialog box opens with a form to create a new user. |
| **IT-02** | User Creation | Successfully create a new Employee user | 1. In the "Create User" dialog, fill in all fields for a new user. <br> 2. Select the "Employee" role. The location fields should appear. <br> 3. Fill in Bay Name, Seat Number, and Wi-Fi Name. <br> 4. Click "Create User". | A "User Created Successfully" toast appears. The IT admin is logged out. A new user is created in Firebase Auth. A new document is created in the `users` collection with the correct details. |
| **IT-03** | User Creation | Successfully create a new Doctor user | 1. In the "Create User" dialog, fill in all fields for a new user. <br> 2. Select the "Doctor" role. <br> 3. Click "Create User". | A "User Created Successfully" toast appears. A new user is created in Firebase Auth. A new document is created in the `users` collection with the role set to 'doctor'. |
| **IT-04** | User Creation | Fail validation for employee | 1. In the "Create User" dialog, select the "Employee" role. <br> 2. Leave the "Bay Name" field empty. <br> 3. Click "Create User". | Form validation error appears under the "Bay Name" field. The user is not created. |
| **IT-5** | Emergency Feed | View and resolve an emergency | 1. Log in as an IT Team member. <br> 2. Have an Employee trigger an emergency. <br> 3. The alert appears in the active emergencies table. <br> 4. Click "Resolve". | The IT team can see and resolve emergencies, similar to the Doctor role. The alert moves to the resolved state. |
