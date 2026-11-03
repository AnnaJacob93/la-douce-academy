# La Douce Academy

La Douce Academy is a web-based e-learning platform developed for the QH0640 Contemporary Web Applications AE2 assessment.

The application allows learners to browse courses, view course details, enrol on a course, complete a checkout step, access enrolled course content, and submit feedback. Administrators can manage courses, users, and enrolments.

---

# Technologies Used

- Next.js
- React
- Firebase Authentication
- Firebase Firestore
- Firebase Storage
- Leaflet with OpenStreetMap
- CSS Modules / custom CSS

---

# Main Features

## Learner Features

- Register and log in
- Browse available courses
- Search and filter courses
- View course details
- Enrol on a course
- Complete checkout
- View pending, confirmed, completed, and removed enrolments
- Access course content after enrolment
- Submit feedback for completed/confirmed courses

## Admin Features

- Admin dashboard
- Add new courses
- Edit existing courses
- Delete courses
- View and manage enrolments
- Remove learners from courses with a reason
- Manage user roles
- View feedback information

---

# Test Accounts

Use the following accounts to test the application.

# Test Accounts

The application supports two user roles:

- Admin: manages courses, users, and enrolments.
- Learner: browses courses, enrols, and accesses learning materials.

Demo credentials are not publicly provided for security reasons.

---

# How to Run the Project

## 1. Extract the ZIP File

Unzip the submitted project folder.

## 2. Open the Project

Open the project folder using Visual Studio Code.

## 3. Open the Terminal

Open a terminal inside the project folder.

## 4. Install Dependencies

Run the following command:

```bash
npm install
```

## 5. Start the Development Server

Run:

```bash
npm run dev
```

## 6. Open the Application

Open the following link in your browser:

```text
http://localhost:3000
```

---

# Firebase Configuration

The Firebase configuration is included in the submitted files as required by the assessment brief.

The application uses:

- Firebase Authentication for login and registration
- Firestore Database for users, courses, enrolments, and feedback
- Firebase Storage for course images

---

# Important Notes

- The `node_modules` folder is not included in the ZIP file.
- Dependencies must be installed using `npm install`.
- The .next build folder is not included due to file size limitations. It will be generated automatically when running 'npm run dev'.
- The application should be tested using the provided learner and admin accounts.
- Some features depend on existing Firestore data such as courses, users, and enrolments.
- The admin area should only be accessed using an admin account.

---

# Suggested Testing Flow

## Learner Testing

1. Log in using the learner account.
2. Browse available courses.
3. Open a course details page.
4. Click enrol.
5. Complete the checkout process.
6. Check the enrolment status.
7. Access enrolled course content.
8. Submit feedback where available.

## Admin Testing

1. Log in using the admin account.
2. Open the admin dashboard.
3. Add a new course.
4. Edit an existing course.
5. Delete a course if needed.
6. View enrolments.
7. Remove a learner from a course.
8. Manage user roles.

---

# Project Structure

```text
app/
  actions/
    courseActions.js
  admin/
    courses/
    enrollments/
    users/
  courses/
  checkout/
  enrollments/
  profile/

components/
lib/
public/
```

---

# Submitted By

Anamaria Iacob

QH0640 Contemporary Web Applications

AE2 - E-Learning App Implementation and Report