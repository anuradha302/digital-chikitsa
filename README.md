# Digital Chikitsa

Build a complete, modern Android application for a digital Ayurveda patient case-record and clinic management system.

IMPORTANT:

This is a NEW Android Studio project. Work only inside this current project.

Do not assume or modify any other project.

Use a clean, scalable architecture and production-quality code.

Before implementing major features, inspect the current project structure and then create/modify the necessary files.

The app should be designed so that it can eventually be used by multiple different Ayurveda clinics, not only one specific clinic.

1. APP CONCEPT

The application is a digital replacement for a physical Ayurveda patient case paper / case-record notebook.

The main purpose is to allow an Ayurveda doctor/clinic to:

Create and manage patient records.

Organize patients month-wise.

Open the complete case paper of any patient.

Edit patient information at any time.

Add notes and observations over time.

Draw/write freehand on a digital blank paper/canvas when required.

Keep patient records safely stored without filling the phone's internal storage.

Search and retrieve old patient records easily.

Eventually support cloud backup/synchronization.

The experience should feel simple enough for a doctor to use quickly during a consultation.

2. FIRST-OPEN / CLINIC SETUP

The app should start with a beautiful, creative and attractive welcome screen.

The initial example clinic name is:

॥श्रीकर॥
आयुर्वेद एवं पंचकर्म चिकित्सालय

IMPORTANT:
This clinic name MUST NOT be hard-coded permanently.

The application should have a first-time setup screen where the clinic owner can enter:

Clinic name

Doctor/Vaidya name

Optional clinic logo

Optional clinic contact information

Optional clinic address

The user should be able to edit the clinic name later from Settings.

For example, one person may configure:

॥श्रीकर॥
आयुर्वेद एवं पंचकर्म चिकित्सालय

while another person may configure:

XYZ आयुर्वेद चिकित्सालय

The entire application should automatically use the configured clinic name.

The welcome screen should look premium, calm, elegant and appropriate for an Ayurveda/Panchakarma clinic.

Avoid cartoonish or childish UI.

Use an aesthetic inspired by Ayurveda, natural healing and a professional medical record system.

3. MAIN DASHBOARD

After setup, create a clean dashboard.

Main section:

आतुर निदान पत्रक

This should be the primary patient-record section.

Other useful dashboard actions can include:

Add New Patient

Search Patient

Recent Patients

Settings

Backup/Sync status

Notes / Freehand Records if appropriate

Keep the dashboard simple and doctor-friendly.

4. आतुर निदान पत्रक — MONTH-WISE RECORDS

When the user opens:

आतुर निदान पत्रक

show patient records organized month-wise.

Example:

2026

August
September
October
November
December

When a month is opened, show the patients added during that month.

Example:

August 2026

Add Patient

001 — Patient Name
002 — Patient Name
003 — Patient Name

Each patient should be displayed as a clean card/list item.

Show useful quick information such as:

Patient name

Registration number

Date

Age

Gender

Last updated date

The records should behave somewhat like a phone Notes application where the doctor can continuously add new records one after another.

Do NOT load every patient's complete case paper and every image/drawing at once.

Load records efficiently and progressively.

5. ADD NEW PATIENT

Create an easy-to-use "Add Patient" flow.

The patient case record should follow the structure of the provided Ayurveda case-paper PDF.

The first patient-information section should include fields such as:

रुग्णनाम
नोंदणी क्रमांक
दिनांक
लिंग
वय
वजन
उंची
शिक्षण
व्यवसाय
जन्मस्थान
जन्मतारीख व वेळ
E-mail Address
पत्ता
WhatsApp No.
Mobile No.
संदर्भ

The provided case paper contains these patient details. Use its organization as the reference instead of creating a generic medical form.

The PDF also contains sections for consent, major complaints, symptom analysis, modern investigations/medicines, previous illnesses, family history, surgical history, diet/lifestyle, examinations, diagnosis and treatment.

Preserve the terminology and overall organization of the provided case paper wherever practical.

6. COMPLETE DIGITAL CASE PAPER

After opening a patient, display their complete digital case paper.

Organize the long form into logical sections so it does not become one overwhelming screen.

Suggested sections based on the provided case paper:

Patient Information

संमतीपत्रक

प्रमुख वेदना

लक्षण विश्लेषण

आधुनिक तपासण्या व औषधे

पूर्वीचे आजार

कुटुंबाचे आजार

कुलवृत्त

शल्यकर्म

आहारविशेष व विहारविशेष

मानसिक / मन परीक्षण

अष्टविध परीक्षण

दशविध परीक्षण

आहार / सात्म्य related observations

स्रोतस परीक्षण

दोष / दूष्य observations

व्याधीविनिश्चय

चिकित्सा

Additional Notes

Freehand Drawing / Blank Paper

The provided PDF should be treated as the source of truth for the case-paper fields and terminology.

Do not remove important sections simply to make the form shorter.

Where the PDF contains checkbox-style or multiple-choice options, implement appropriate UI such as:

Checkboxes

Radio buttons

Dropdowns

Multi-select chips

Numeric fields

Text fields

Where a doctor needs to write a custom observation, provide a large text field.

7. FREEHAND DIGITAL PAPER / DRAWING

Add a dedicated feature inside every patient's case record called something like:

"Freehand Notes"
or
"चित्र / हस्तलिखित नोंद"

The doctor should be able to open a blank digital canvas that behaves like writing/drawing on paper.

The canvas should support:

Finger drawing

Stylus drawing if available

Eraser

Undo

Redo

Clear

Save

Multiple drawings/pages if practical

The saved drawing must belong to the specific patient.

Allow the doctor to return to the drawing later and continue editing it.

Do not make the drawing feature merely a static image viewer.

8. NOTES SYSTEM

Create a notes system inspired by the Notes application on a phone.

A doctor should be able to continuously add notes to a patient's record.

Example:

Patient
→ Notes
→ + Add Note

Each note should have:

Date/time

Note text

Optional drawing

Edit

Delete

Keep the newest notes easily accessible while preserving the old history.

9. EDITING

Every patient record must be editable.

The doctor should be able to:

Edit patient details

Edit case-paper fields

Add new information later

Edit existing notes

Add new notes

Edit drawings

Delete records only after confirmation

Do not make patient records read-only after creation.

10. SEARCH

Add a patient search function.

Search by:

Patient name

Registration number

Mobile number

Date/month

Search results should be fast even when the database contains many patients.

11. STORAGE / DATABASE / PHONE STORAGE

This is VERY IMPORTANT.

Do not design the app so that every patient case is stored as a large PDF/image file permanently inside the phone.

The application should be designed with scalable data storage.

Use a proper database for structured patient information.

Prefer a cloud-backed architecture so that large amounts of patient data can eventually be stored safely without filling the device's internal storage.

The architecture should support:

Android App
↓
Database
↓
Cloud Storage for drawings/files when required

Patient records should be fetched as needed.

Month-wise records should be queried efficiently.

Do not load thousands of records into memory at once.

Cache only what is necessary.

If offline support is implemented, use local storage as a cache/database and synchronize with the cloud when connectivity is available.

12. CLOUD ARCHITECTURE

Design the application so cloud synchronization can be added cleanly.

Use a scalable architecture with clear separation between:

UI

Data layer

Database

Repository

Cloud storage

Authentication if added later

Do not tightly couple every screen directly to database code.

Create reusable data models and repositories.

13. DATA SAFETY

Patient records are sensitive.

The application should be designed with privacy and security in mind.

Do not expose patient information publicly.

Use appropriate authentication and authorization architecture if cloud storage is implemented.

Do not hard-code passwords, API keys, service-role keys or secrets inside the Android application.

Keep sensitive configuration out of source code.

14. UI / DESIGN

Create a premium and professional Ayurveda-clinic interface.

Design characteristics:

Elegant

Minimal

Calm

Professional

Clean

Easy for a doctor to use

Good readability

Comfortable spacing

Clear typography

Beautiful cards

Smooth navigation

Subtle Ayurveda-inspired visual elements

The Devanagari text must render correctly.

Do not use placeholder Latin text where actual Devanagari labels are required.

The UI should support both:

Devanagari labels

English technical/system text where appropriate

Make the app responsive to different Android screen sizes.

15. NAVIGATION

Use proper Android navigation.

Suggested structure:

Welcome / Clinic Setup
↓
Dashboard
↓
आतुर निदान पत्रक
↓
Year
↓
Month
↓
Patient List
↓
Patient Case Paper
├── Patient Information
├── Case Details
├── Examination
├── Diagnosis
├── Treatment
├── Notes
└── Freehand Drawing

Also provide Settings.

16. SETTINGS

Create a Settings screen where the clinic can modify:

Clinic name

Doctor name

Clinic logo

Contact information

Address

App preferences

Backup/synchronization

Data management

The clinic name shown throughout the app must update automatically when changed.

17. PDF / PRINT SUPPORT

Design the case record architecture so that a complete patient case can eventually be exported as a properly formatted PDF.

The exported PDF should contain the clinic's configured name and the patient's complete case record.

If implementing PDF export now is practical, implement it.

Otherwise, structure the code so PDF export can be added later without rewriting the entire patient-record system.

18. PERFORMANCE

The app must remain usable when there are:

Hundreds of patients

Thousands of patients

Years of records

Many notes

Multiple drawings per patient

Use pagination/lazy loading where appropriate.

Do not retrieve all patient records and all detailed case information at application startup.

Use database indexes for commonly searched fields.

19. CODE QUALITY

Use modern Android development practices.

Prefer:

Kotlin

Jetpack Compose

Material 3

ViewModel

Repository pattern

Coroutines

StateFlow/appropriate state management

Navigation

Proper data models

Clean separation of concerns

Avoid putting the entire application inside one Activity or one massive Kotlin file.

Create reusable composables/components.

Use meaningful class and variable names.

Handle loading, empty, error and success states properly.

20. IMPORTANT DEVELOPMENT APPROACH

Do not just create a visual prototype.

Build the foundation for a genuinely functional application.

Start by:

Inspecting the current Android Studio project.

Setting up the application architecture.

Creating the clinic setup flow.

Creating the dashboard.

Creating month-wise patient records.

Creating the patient data model/database.

Creating the digital case-paper form based on the provided PDF.

Adding editing and notes.

Adding the freehand canvas.

Adding search.

Preparing scalable storage/cloud architecture.

Adding PDF export if feasible.

Testing navigation and data persistence.

After implementing each major part, check for compilation errors and fix them before moving to the next major feature.

The final result should be a real, functional Android application rather than a collection of static screens.

IMPORTANT:
The provided PDF "Dr Pankaj Case Paper.pdf" is the reference for the patient's case-paper structure and terminology. Reproduce its important sections and fields in digital form while making the interface much easier to fill out and edit. Do not invent unrelated medical sections that are not present in the reference unless they are clearly necessary for the app's technical functionality.

First build the core working application and then improve the UI/UX.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/36472373-085b-4fe7-9f6a-0ad4eb2a2703).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
