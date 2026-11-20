/**
 * Fixed wording for the website and both PDF editions (English / Hindi).
 * Personal values (names, places, free text) live in biodata.ts.
 */

export type Lang = "en" | "hi";

const en = {
  kicker: "Marriage Bio-data",
  years: "years",
  photo: "Photo",
  footerPage: (page: number, total: number) => `Page ${page} of ${total}`,
  months: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],

  // Sections
  about: "About Me",
  personal: "Personal Details",
  horoscope: "Horoscope Details",
  education: "Education & Career",
  family: "Family Details",
  partner: "Partner Preferences",
  photos: "Photographs",
  contact: "Contact Details",

  // Personal
  fullName: "Full Name",
  dateOfBirth: "Date of Birth",
  timeOfBirth: "Time of Birth",
  placeOfBirth: "Place of Birth",
  height: "Height",
  weight: "Weight",
  complexion: "Complexion",
  bloodGroup: "Blood Group",
  maritalStatus: "Marital Status",
  religion: "Religion",
  caste: "Caste",
  motherTongue: "Mother Tongue",
  languages: "Languages Known",
  diet: "Diet",
  hobbies: "Hobbies & Interests",

  // Horoscope
  subCaste: "Sub-caste",
  gotra: "Gotra",
  rashi: "Rashi (Moon Sign)",
  nakshatra: "Nakshatra",
  manglik: "Manglik",
  charan: "Charan",
  nadi: "Nadi",
  gan: "Gan",

  // Education & career
  highestQualification: "Highest Qualification",
  schooling: "Schooling",
  college: "College",
  yearOfCompletion: "Year of Completion",
  otherQualifications: "Other Qualifications",
  occupation: "Occupation",
  company: "Company / Organisation",
  designation: "Designation",
  workLocation: "Work Location",
  annualIncome: "Annual Income",

  // Family
  father: "Father",
  mother: "Mother",
  familyType: "Family Type",
  familyValues: "Family Values",
  nativePlace: "Native Place",
  residence: "Current Residence",

  // Contact
  whatsapp: "WhatsApp",
  email: "Email",
  address: "Address",
};

export type Labels = typeof en;

const hi: Labels = {
  kicker: "वैवाहिक परिचय पत्र",
  years: "वर्ष",
  photo: "फ़ोटो",
  footerPage: (page, total) => `पृष्ठ ${page} / ${total}`,
  months: [
    "जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून",
    "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर",
  ],

  about: "मेरे बारे में",
  personal: "व्यक्तिगत विवरण",
  horoscope: "जन्म कुंडली विवरण",
  education: "शिक्षा एवं व्यवसाय",
  family: "पारिवारिक विवरण",
  partner: "जीवनसाथी की अपेक्षाएँ",
  photos: "छायाचित्र",
  contact: "संपर्क विवरण",

  fullName: "पूरा नाम",
  dateOfBirth: "जन्म तिथि",
  timeOfBirth: "जन्म समय",
  placeOfBirth: "जन्म स्थान",
  height: "ऊँचाई",
  weight: "वज़न",
  complexion: "रंग",
  bloodGroup: "रक्त समूह",
  maritalStatus: "वैवाहिक स्थिति",
  religion: "धर्म",
  caste: "जाति",
  motherTongue: "मातृभाषा",
  languages: "ज्ञात भाषाएँ",
  diet: "आहार",
  hobbies: "शौक एवं रुचियाँ",

  subCaste: "उपजाति",
  gotra: "गोत्र",
  rashi: "राशि",
  nakshatra: "नक्षत्र",
  manglik: "मांगलिक",
  charan: "चरण",
  nadi: "नाड़ी",
  gan: "गण",

  highestQualification: "उच्चतम शिक्षा",
  schooling: "विद्यालय शिक्षा",
  college: "महाविद्यालय",
  yearOfCompletion: "उत्तीर्ण वर्ष",
  otherQualifications: "अन्य योग्यताएँ",
  occupation: "व्यवसाय",
  company: "कंपनी / संस्था",
  designation: "पद",
  workLocation: "कार्य स्थान",
  annualIncome: "वार्षिक आय",

  father: "पिता",
  mother: "माता",
  familyType: "परिवार का प्रकार",
  familyValues: "पारिवारिक मूल्य",
  nativePlace: "मूल निवास",
  residence: "वर्तमान निवास",

  whatsapp: "व्हाट्सऐप",
  email: "ईमेल",
  address: "पता",
};

export const LABELS: Record<Lang, Labels> = { en, hi };

/**
 * Hindi for common values that appear in most bio-datas. Anything specific
 * to this profile (names, places, companies) goes in `biodata.hindi.values`.
 */
export const COMMON_VALUES_HI: Record<string, string> = {
  Hindu: "हिन्दू",
  Unmarried: "अविवाहित",
  "Never Married": "अविवाहित",
  Married: "विवाहित",
  Vegetarian: "शाकाहारी",
  "Non-Vegetarian": "मांसाहारी",
  Eggetarian: "अंडाहारी",
  Fair: "गोरा",
  Wheatish: "गेहुँआ",
  "Nuclear Family": "एकल परिवार",
  "Joint Family": "संयुक्त परिवार",
  Homemaker: "गृहिणी",
  Father: "पिता",
  Mother: "माता",
  Self: "स्वयं",
  Brother: "भाई",
  Sister: "बहन",
  "Elder Brother": "बड़ा भाई",
  "Younger Brother": "छोटा भाई",
  "Elder Sister": "बड़ी बहन",
  "Younger Sister": "छोटी बहन",
  Yes: "हाँ",
  No: "नहीं",
  Hindi: "हिन्दी",
  English: "अंग्रेज़ी",
  Gujarati: "गुजराती",
  Marathi: "मराठी",
  Bhojpuri: "भोजपुरी",
  Punjabi: "पंजाबी",
  Bengali: "बंगाली",
  "Uttar Pradesh": "उत्तर प्रदेश",
  Gujarat: "गुजरात",
  Surat: "सूरत",
  Vapi: "वापी",
  Mumbai: "मुंबई",
  Delhi: "दिल्ली",
};
