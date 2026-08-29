/**
 * Declarative schema of the Ayurveda case paper (आतुर निदान पत्रक).
 *
 * This single source of truth drives:
 *  - the case-paper editing forms
 *  - the read-only case summary
 *  - the printable / PDF export
 *
 * Adding or renaming a field here changes every surface at once. Field values
 * are stored per-section as JSON in `case_sections.data`, keyed by field id, so
 * schema evolution never requires a database migration.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "radio"
  | "multi"
  | "check";

export interface FieldDef {
  id: string;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
  /** Layout hint: full-width instead of the two-column grid. */
  wide?: boolean;
}

export interface SectionDef {
  key: string;
  title: string;
  subtitle?: string;
  fields: FieldDef[];
}

/** Patient identity fields live on the `patients` table, not in case_sections. */
export const PATIENT_FIELDS: FieldDef[] = [
  { id: "name", label: "रुग्णनाम", type: "text" },
  { id: "reg_no", label: "नोंदणी क्रमांक", type: "text" },
  { id: "visit_date", label: "दिनांक", type: "date" },
  { id: "gender", label: "लिंग", type: "radio", options: ["पुरुष", "स्त्री", "इतर"] },
  { id: "age", label: "वय", type: "text" },
  { id: "weight", label: "वजन (kg)", type: "text" },
  { id: "height", label: "उंची (cm)", type: "text" },
  { id: "education", label: "शिक्षण", type: "text" },
  { id: "occupation", label: "व्यवसाय", type: "text" },
  { id: "birth_place", label: "जन्मस्थान", type: "text" },
  { id: "birth_datetime", label: "जन्मतारीख व वेळ", type: "text" },
  { id: "email", label: "E-mail Address", type: "text" },
  { id: "mobile", label: "Mobile No.", type: "text" },
  { id: "whatsapp", label: "WhatsApp No.", type: "text" },
  { id: "address", label: "पत्ता", type: "textarea", wide: true },
  { id: "reference", label: "संदर्भ", type: "text", wide: true },
];

const YES_NO = ["होय", "नाही"];

export const CASE_SECTIONS: SectionDef[] = [
  {
    key: "consent",
    title: "संमतीपत्रक",
    subtitle: "रुग्णाची संमती व नोंद",
    fields: [
      { id: "consent_given", label: "रुग्णाने चिकित्सेस संमती दिली", type: "check" },
      { id: "consent_by", label: "संमती देणाऱ्याचे नाव", type: "text" },
      { id: "relation", label: "रुग्णाशी नाते", type: "text" },
      { id: "consent_date", label: "संमती दिनांक", type: "date" },
      { id: "consent_note", label: "अतिरिक्त नोंद", type: "textarea", wide: true },
    ],
  },
  {
    key: "chief_complaints",
    title: "प्रमुख वेदना",
    subtitle: "मुख्य तक्रारी व कालावधी",
    fields: [
      { id: "complaints", label: "प्रमुख वेदना", type: "textarea", wide: true },
      { id: "duration", label: "कालावधी", type: "text" },
      { id: "onset", label: "प्रारंभ", type: "select", options: ["अकस्मात", "क्रमशः"] },
      { id: "progress", label: "वाढ / घट", type: "select", options: ["वाढत आहे", "स्थिर", "कमी होत आहे"] },
      { id: "assoc", label: "सहवेदना", type: "textarea", wide: true },
    ],
  },
  {
    key: "symptom_analysis",
    title: "लक्षण विश्लेषण",
    subtitle: "वेदनेचे सविस्तर विश्लेषण",
    fields: [
      { id: "sthana", label: "स्थान", type: "text" },
      { id: "swaroopa", label: "स्वरूप", type: "text" },
      { id: "kala", label: "काल (वाढण्याची वेळ)", type: "text" },
      { id: "vruddhi", label: "वृद्धिकर कारणे", type: "textarea" },
      { id: "kshaya", label: "शमनकर कारणे", type: "textarea" },
      { id: "note", label: "अन्य विश्लेषण", type: "textarea", wide: true },
    ],
  },
  {
    key: "modern_investigations",
    title: "आधुनिक तपासण्या व औषधे",
    fields: [
      { id: "investigations", label: "तपासण्या व निष्कर्ष", type: "textarea", wide: true },
      { id: "bp", label: "B.P.", type: "text" },
      { id: "pulse", label: "Pulse", type: "text" },
      { id: "sugar", label: "Blood Sugar", type: "text" },
      { id: "hb", label: "Hb", type: "text" },
      { id: "current_meds", label: "चालू आधुनिक औषधे", type: "textarea", wide: true },
    ],
  },
  {
    key: "past_illness",
    title: "पूर्वीचे आजार",
    fields: [
      {
        id: "list",
        label: "पूर्वीचे आजार",
        type: "multi",
        options: [
          "मधुमेह",
          "उच्च रक्तदाब",
          "क्षय (T.B.)",
          "हृदयविकार",
          "दमा",
          "आमवात",
          "कावीळ",
          "थायरॉइड",
          "अपस्मार",
          "त्वचाविकार",
        ],
        wide: true,
      },
      { id: "details", label: "सविस्तर नोंद", type: "textarea", wide: true },
    ],
  },
  {
    key: "family_illness",
    title: "कुटुंबाचे आजार",
    fields: [
      {
        id: "list",
        label: "कुटुंबातील आजार",
        type: "multi",
        options: ["मधुमेह", "उच्च रक्तदाब", "हृदयविकार", "क्षय", "कर्करोग", "दमा", "मानसिक विकार"],
        wide: true,
      },
      { id: "details", label: "सविस्तर नोंद", type: "textarea", wide: true },
    ],
  },
  {
    key: "kulavrutta",
    title: "कुलवृत्त",
    fields: [
      { id: "father", label: "पिता", type: "text" },
      { id: "mother", label: "माता", type: "text" },
      { id: "siblings", label: "भाऊ / बहीण", type: "text" },
      { id: "children", label: "अपत्ये", type: "text" },
      { id: "note", label: "नोंद", type: "textarea", wide: true },
    ],
  },
  {
    key: "surgical",
    title: "शल्यकर्म",
    fields: [
      { id: "done", label: "पूर्वी शल्यकर्म झाले आहे", type: "radio", options: YES_NO },
      { id: "which", label: "कोणते शल्यकर्म", type: "text" },
      { id: "year", label: "वर्ष", type: "text" },
      { id: "note", label: "नोंद", type: "textarea", wide: true },
    ],
  },
  {
    key: "aahar_vihar",
    title: "आहारविशेष व विहारविशेष",
    fields: [
      { id: "aahar", label: "आहार", type: "radio", options: ["शाकाहारी", "मिश्राहारी"] },
      { id: "ruchi", label: "रुचि", type: "multi", options: ["मधुर", "आम्ल", "लवण", "कटु", "तिक्त", "कषाय"] },
      { id: "kshudha", label: "क्षुधा", type: "select", options: ["उत्तम", "मध्यम", "अल्प"] },
      { id: "trushna", label: "तृष्णा", type: "select", options: ["अधिक", "सामान्य", "अल्प"] },
      { id: "vyayam", label: "व्यायाम", type: "select", options: ["नियमित", "अनियमित", "नाही"] },
      { id: "vyasan", label: "व्यसन", type: "multi", options: ["तंबाखू", "धूम्रपान", "मद्य", "मिश्री", "सुपारी"] },
      { id: "nidra", label: "निद्रा", type: "select", options: ["उत्तम", "अल्प", "खंडित", "अतिनिद्रा"] },
      { id: "note", label: "विहारविशेष नोंद", type: "textarea", wide: true },
    ],
  },
  {
    key: "manas",
    title: "मानसिक / मन परीक्षण",
    fields: [
      { id: "prakriti", label: "मानस प्रकृति", type: "select", options: ["सात्त्विक", "राजस", "तामस"] },
      { id: "buddhi", label: "बुद्धि", type: "select", options: ["उत्तम", "मध्यम", "अल्प"] },
      { id: "smruti", label: "स्मृति", type: "select", options: ["उत्तम", "मध्यम", "अल्प"] },
      { id: "bhaya_krodha", label: "भय / क्रोध / शोक", type: "textarea", wide: true },
      { id: "note", label: "नोंद", type: "textarea", wide: true },
    ],
  },
  {
    key: "ashtavidha",
    title: "अष्टविध परीक्षण",
    fields: [
      { id: "nadi", label: "नाडी", type: "text" },
      { id: "mutra", label: "मूत्र", type: "text" },
      { id: "mala", label: "मल", type: "text" },
      { id: "jivha", label: "जिव्हा", type: "text" },
      { id: "shabda", label: "शब्द", type: "text" },
      { id: "sparsha", label: "स्पर्श", type: "text" },
      { id: "drik", label: "दृक्", type: "text" },
      { id: "akruti", label: "आकृति", type: "text" },
    ],
  },
  {
    key: "dashavidha",
    title: "दशविध परीक्षण",
    fields: [
      { id: "prakriti", label: "प्रकृति", type: "multi", options: ["वात", "पित्त", "कफ"] },
      { id: "vikruti", label: "विकृति", type: "text" },
      { id: "sara", label: "सार", type: "text" },
      { id: "samhanan", label: "संहनन", type: "select", options: ["उत्तम", "मध्यम", "हीन"] },
      { id: "pramana", label: "प्रमाण", type: "text" },
      { id: "satmya", label: "सात्म्य", type: "text" },
      { id: "satva", label: "सत्त्व", type: "select", options: ["प्रवर", "मध्यम", "अवर"] },
      { id: "aharashakti", label: "आहारशक्ति", type: "text" },
      { id: "vyayamashakti", label: "व्यायामशक्ति", type: "select", options: ["प्रवर", "मध्यम", "अवर"] },
      { id: "vaya", label: "वय", type: "select", options: ["बाल", "मध्यम", "वृद्ध"] },
    ],
  },
  {
    key: "srotas",
    title: "स्रोतस परीक्षण",
    fields: [
      {
        id: "dushta",
        label: "दुष्ट स्रोतस",
        type: "multi",
        options: [
          "प्राणवह",
          "उदकवह",
          "अन्नवह",
          "रसवह",
          "रक्तवह",
          "मांसवह",
          "मेदोवह",
          "अस्थिवह",
          "मज्जावह",
          "शुक्रवह",
          "आर्तववह",
          "मूत्रवह",
          "पुरीषवह",
          "स्वेदवह",
          "मनोवह",
        ],
        wide: true,
      },
      { id: "note", label: "स्रोतोदुष्टि लक्षणे", type: "textarea", wide: true },
    ],
  },
  {
    key: "dosha_dushya",
    title: "दोष / दूष्य",
    fields: [
      { id: "dosha", label: "दोष", type: "multi", options: ["वात", "पित्त", "कफ"] },
      { id: "dushya", label: "दूष्य", type: "text" },
      { id: "agni", label: "अग्नि", type: "select", options: ["सम", "विषम", "तीक्ष्ण", "मंद"] },
      { id: "ama", label: "आम / निराम", type: "select", options: ["साम", "निराम"] },
      { id: "bala", label: "बल", type: "select", options: ["प्रवर", "मध्यम", "अवर"] },
      { id: "kala", label: "काल", type: "text" },
      { id: "note", label: "नोंद", type: "textarea", wide: true },
    ],
  },
  {
    key: "vyadhi_vinishchaya",
    title: "व्याधीविनिश्चय",
    fields: [
      { id: "diagnosis", label: "व्याधीविनिश्चय", type: "textarea", wide: true },
      { id: "samprapti", label: "संप्राप्ति", type: "textarea", wide: true },
      { id: "sadhyasadhyata", label: "साध्यासाध्यता", type: "select", options: ["सुखसाध्य", "कृच्छ्रसाध्य", "याप्य", "असाध्य"] },
      { id: "modern_dx", label: "Modern Diagnosis", type: "text", wide: true },
    ],
  },
  {
    key: "chikitsa",
    title: "चिकित्सा",
    fields: [
      { id: "aushadhi", label: "औषधी योजना", type: "textarea", wide: true },
      {
        id: "panchakarma",
        label: "पंचकर्म",
        type: "multi",
        options: ["स्नेहन", "स्वेदन", "वमन", "विरेचन", "बस्ति", "नस्य", "रक्तमोक्षण", "शिरोधारा", "अभ्यंग"],
        wide: true,
      },
      { id: "pathya", label: "पथ्य", type: "textarea" },
      { id: "apathya", label: "अपथ्य", type: "textarea" },
      { id: "follow_up", label: "पुढील भेट", type: "date" },
      { id: "advice", label: "सल्ला", type: "textarea", wide: true },
    ],
  },
  {
    key: "additional",
    title: "Additional Notes",
    subtitle: "अतिरिक्त नोंदी",
    fields: [{ id: "notes", label: "नोंदी", type: "textarea", wide: true }],
  },
];

/** Grouping used by the case-paper tab navigation. */
export const SECTION_GROUPS: { label: string; keys: string[] }[] = [
  { label: "प्रकरण", keys: ["consent", "chief_complaints", "symptom_analysis", "modern_investigations"] },
  { label: "इतिहास", keys: ["past_illness", "family_illness", "kulavrutta", "surgical", "aahar_vihar"] },
  { label: "परीक्षण", keys: ["manas", "ashtavidha", "dashavidha", "srotas", "dosha_dushya"] },
  { label: "निदान व चिकित्सा", keys: ["vyadhi_vinishchaya", "chikitsa", "additional"] },
];

export function sectionByKey(key: string): SectionDef | undefined {
  return CASE_SECTIONS.find((s) => s.key === key);
}

export type SectionData = Record<string, unknown>;

/** Human-readable rendering of one stored field value (used by summary + PDF). */
export function formatValue(field: FieldDef, value: unknown): string {
  if (value === undefined || value === null || value === "") return "";
  if (field.type === "check") return value ? "होय" : "नाही";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

export function sectionHasData(section: SectionDef, data: SectionData | undefined): boolean {
  if (!data) return false;
  return section.fields.some((f) => formatValue(f, data[f.id]) !== "");
}
