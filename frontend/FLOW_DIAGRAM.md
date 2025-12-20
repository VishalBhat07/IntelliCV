# IntelliCV - New User Flow

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          START: Login/Register                           │
│                                                                          │
│  • Modern gradient background                                           │
│  • Clean form design                                                    │
│  • Email + Password authentication                                      │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      STEP 1: Education Details                           │
│                                                                          │
│  • Add multiple education entries                                       │
│  • Fields: Institution, Degree, Field, Grade, Year, Highlights         │
│  • Dynamic add/remove entries                                           │
│  • [Back] [Save & Continue] →                                           │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     STEP 2: Upload Documents                             │
│                                                                          │
│  • Select document type (Certificates/Projects/Education/Misc)          │
│  • Drag & drop or browse files                                          │
│  • Upload progress indicator                                            │
│  • View uploaded documents list                                         │
│  • [← Back] [Continue →]                                                │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    STEP 3: Job Description                               │
│                                                                          │
│  • Large text area for JD                                               │
│  • OR upload JD file                                                    │
│  • File upload progress                                                 │
│  • [← Back] [Continue →]                                                │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     STEP 4: Generate Resume                              │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                  🎯 Generating Your Resume                        │ │
│  │                                                                   │ │
│  │               ⭐ (Animated pulsing icon)                          │ │
│  │                                                                   │ │
│  │         Status: "Analyzing your education history..."            │ │
│  │                                                                   │ │
│  │         ████████████████░░░░░░░░░░░░░░  75%                     │ │
│  │                                                                   │ │
│  │                   • • • •  (Bouncing dots)                        │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  Backend Process:                                                       │
│  1. Extract text from documents                                         │
│  2. Generate Sequelize queries via LLM                                  │
│  3. Populate SQL database                                               │
│  4. Fetch user data with relations                                      │
│  5. Send to Gemini for resume generation                                │
│  6. Return formatted resume                                             │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    STEP 5: Preview & Download                            │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  🎉 Your Resume is Ready!                                       │   │
│  │                                                                  │   │
│  │  [📥 Download PDF]  [🔄 Create New]                             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     RESUME PREVIEW                               │   │
│  │                                                                  │   │
│  │  JOHN DOE                                                        │   │
│  │  john.doe@email.com | +1-234-567-8900                          │   │
│  │                                                                  │   │
│  │  EDUCATION                                                       │   │
│  │  • Bachelor of Science in Computer Science                      │   │
│  │    XYZ University | 2024 | GPA: 3.8/4.0                        │   │
│  │                                                                  │   │
│  │  PROJECTS                                                        │   │
│  │  • E-commerce Platform (React, Node.js, MongoDB)                │   │
│  │  • Machine Learning Model for...                                │   │
│  │                                                                  │   │
│  │  CERTIFICATES                                                    │   │
│  │  • AWS Certified Developer                                       │   │
│  │  • Full Stack Web Development                                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  • Professional formatting                                              │
│  • One-click PDF download                                               │
│  • [← Back to Generation]                                               │
└─────────────────────────────────────────────────────────────────────────┘
```

## Key Features at Each Step

### Progress Indicator (Visible Steps 1-4)

```
┌──────────────────────────────────────────────────────────────────────┐
│  ① ─────── ② ─────── ③ ─────── ④                                   │
│ ✅        🔵       ⚪        ⚪                                      │
│Education Documents   Job     Generate                               │
└──────────────────────────────────────────────────────────────────────┘

Legend:
✅ = Completed step (green)
🔵 = Current step (indigo)
⚪ = Not started (gray)
```

## Data Structure Flow

```javascript
// App State
{
  user: {
    user_id: 1,
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com"
  },

  currentStep: 0, // 0-4

  educationData: [
    {
      institution_name: "Harvard University",
      degree: "Bachelor of Science",
      field_of_study: "Computer Science",
      grade: "3.8/4.0",
      completion_year: "2024",
      highlights: ["Dean's List", "CS Society President"]
    }
  ],

  documents: [
    { name: "certificate.pdf", type: "Certificates", uploadDate: "12/20/2024" },
    { name: "project.pdf", type: "Project", uploadDate: "12/20/2024" }
  ],

  jobDescription: "Software Engineer position requiring...",

  generatedResume: {
    text: "JOHN DOE\n\nEducation:...",
    htmlContent: "<h1>JOHN DOE</h1>..."
  }
}
```

## Component Hierarchy

```
App
├── Header (Logo, User Info, Logout)
├── Progress Stepper (Steps 1-4 only)
└── Step Content
    ├── Step 0: EducationForm
    ├── Step 1: UploadDocuments
    ├── Step 2: JobDescriptionPage
    ├── Step 3: GenerateResume
    └── Step 4: GeneratedResumePage
```

## Color Coding

- **Indigo (#4F46E5)**: Primary actions, current step
- **Green (#10B981)**: Completed steps, success states
- **Gray**: Inactive/pending steps
- **Red**: Error states
- **Purple (#9333EA)**: Accent, secondary actions

## Responsive Breakpoints

- **Mobile**: < 640px (Stack vertically, hide some text)
- **Tablet**: 640px - 1024px (Adjust spacing)
- **Desktop**: > 1024px (Full layout)

---

**Navigation Pattern**: Linear progression with back buttons
**Save Strategy**: Data persists in memory during session
**Error Handling**: Inline validation + toast notifications
