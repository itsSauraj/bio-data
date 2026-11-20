/**
 * ─────────────────────────────────────────────────────────────────────────
 *  BIO-DATA CONTENT
 *
 *  This is the ONLY file you need to edit. Both the website and the
 *  downloadable PDF are generated from it.
 *
 *  ⚠  SAMPLE DATA: apart from the name, every value below is placeholder
 *     text. Replace each one with real details, then set
 *     `sampleData: false` to remove the notice bar from the site.
 *
 *  • Leave any value as ""  (empty string) to hide that row entirely.
 *  • Photos go in  public/photos/  — keep the same file names or update
 *    the paths below. Portrait (4:5) photos look best.
 * ─────────────────────────────────────────────────────────────────────────
 */

export type Photo = { src: string; alt: string };
/** Main portrait: `focus` = where the face is (% from left / top), `zoom` = how close to frame it (1 = full width). */
export type ProfilePhoto = Photo & { focus?: { x: number; y: number }; zoom?: number };
export type Parent = { name: string; occupation: string };
export type Sibling = { relation: string; name: string; details: string };
export type ContactPerson = { name: string; relation: string; phone: string };

export const biodata = {
  /** Set to false once you have replaced the sample content. */
  sampleData: false,

  /** "groom" or "bride" — used for wording only. */
  profileFor: "groom" as "groom" | "bride",

  invocation: {
    devanagari: "॥ श्री गणेशाय नमः ॥",
    roman: "Shree Ganeshaya Namah",
  },

  name: "Saurabh Yadav",
  tagline: "Software Engineer · Surat",

  /**
   * Main portrait (website arch + PDF). `focus` is where the face is, as a
   * percentage from the left and top of the photo; `zoom` is how close to
   * frame it — 1 shows the photo's full width, 2 is twice as close. The
   * values below give a head-and-shoulders crop of the current photo.
   */
  photo: { src: "/photos/profile.jpg", alt: "Saurabh Yadav", focus: { x: 47, y: 44 }, zoom: 1.9 } as ProfilePhoto,

  /** Photographs grid on the website — add or remove entries (up to 10 works well). */
  gallery: [
    { src: "/photos/photo-1.jpg", alt: "Saurabh Yadav – photo 1" },
    { src: "/photos/photo-2.jpg", alt: "Saurabh Yadav – photo 2" },
    { src: "/photos/photo-3.jpg", alt: "Saurabh Yadav – photo 3" },
    { src: "/photos/photo-4.jpg", alt: "Saurabh Yadav – photo 4" },
    { src: "/photos/photo-5.jpg", alt: "Saurabh Yadav – photo 5" },
    { src: "/photos/photo-6.jpg", alt: "Saurabh Yadav – photo 6" },
    { src: "/photos/photo-7.jpg", alt: "Saurabh Yadav – photo 7" },
    { src: "/photos/photo-8.jpg", alt: "Saurabh Yadav – photo 8" },
    { src: "/photos/photo-9.jpg", alt: "Saurabh Yadav – photo 9" },
    { src: "/photos/photo-10.jpg", alt: "Saurabh Yadav – photo 10" },
  ] as Photo[],

  /** How many gallery photos (from the top) are printed in the PDFs; 3 fit one row. 0 hides the PDF photo section. */
  pdfPhotoCount: 3,

  about:
    "I am a calm, family-oriented person who values honesty, respect and simplicity. " +
    "I work as a software engineer in Surat and enjoy travelling, photography and spending " +
    "weekends with my family. I believe in balancing our traditions with a modern outlook, " +
    "and I am looking for a life partner who shares these values.",

  personal: {
    /** Use YYYY-MM-DD. Age is calculated automatically. */
    dateOfBirth: "2002-08-07",
    timeOfBirth: "",
    placeOfBirth: "Saidpur, Uttar Pradesh",
    height: "5' 10\" (178 cm)",
    weight: "68 kg",
    complexion: "",
    bloodGroup: "O+",
    maritalStatus: "Unmarried",
    religion: "Hindu",
    caste: "Yadav (Ahir)",
    motherTongue: "Hindi",
    languages: ["Hindi", "English", "Gujarati", "Bhojpuri"],
    diet: "",
    hobbies: ["Travelling", "Photography", "Gaming"],
  },

  /**
   * Horoscope / Kundli section. All values are empty, so the section is
   * hidden on the website and in the PDF. Fill any value to show it again.
   */
  horoscope: {
    subCaste: "",
    gotra: "",
    rashi: "",
    nakshatra: "",
    manglik: "",
    charan: "",
    nadi: "",
    gan: "",
  },

  education: {
    highestQualification: "B.Tech in Computer Science & Engineering",
    schooling: "",
    college: "",
    yearOfCompletion: "2025",
    otherQualifications: "",
  },

  career: {
    occupation: "Software Engineer",
    company: "Lanet Ltd",
    designation: "",
    location: "Surat, Gujarat",
    annualIncome: "",
  },

  family: {
    father: { name: "Shri Rajesh Yadav", occupation: "" } as Parent,
    mother: { name: "Smt. Saroj Yadav", occupation: "" } as Parent,
    siblings: [{ relation: "Younger Brother", name: "Shubham Yadav", details: "" }] as Sibling[],
    familyType: "Nuclear Family",
    familyValues: "Traditional values with a modern outlook",
    nativePlace: "Saidpur, Uttar Pradesh",
    residence: "Vapi, Gujarat",
  },

  /** One expectation per line. Leave the array empty to hide the section. */
  partnerPreferences: [
    "Age between 21 and 24 years",
    "Height 5' 2\" or above",
    "Graduate or post-graduate, working or willing to work",
    "Hindu, with similar family values",
    "Caring, well-mannered and family-oriented",
  ],

  /**
   * Hindi edition of the PDF (/biodata-hindi.pdf).
   * Section titles and field labels are translated automatically. Put Hindi
   * for your own text here; anything left empty or missing is shown exactly
   * as written in English above.
   */
  hindi: {
    name: "सौरभ यादव",
    tagline: "सॉफ़्टवेयर इंजीनियर · सूरत",
    about:
      "मैं एक शांत, परिवार-प्रेमी व्यक्ति हूँ जो ईमानदारी, सम्मान और सादगी को महत्व देता हूँ। " +
      "मैं सूरत में सॉफ़्टवेयर इंजीनियर के रूप में कार्यरत हूँ और यात्रा, फ़ोटोग्राफ़ी तथा परिवार के साथ " +
      "समय बिताना पसंद करता हूँ। मैं अपनी परंपराओं और आधुनिक सोच के बीच संतुलन में विश्वास रखता हूँ, " +
      "और ऐसे जीवनसाथी की तलाश में हूँ जो इन मूल्यों को साझा करे।",
    partnerPreferences: [
      "आयु 21 से 24 वर्ष के बीच",
      "ऊँचाई 5 फ़ुट 2 इंच या अधिक",
      "स्नातक या स्नातकोत्तर, कार्यरत या कार्य करने की इच्छुक",
      "हिन्दू, समान पारिवारिक मूल्यों वाली",
      "स्नेही, सुसंस्कृत एवं परिवार-प्रेमी",
    ] as string[],
    /** English value (exactly as written above) → Hindi. */
    values: {
      "Saidpur, Uttar Pradesh": "सैदपुर, उत्तर प्रदेश",
      "5' 10\" (178 cm)": "5 फ़ुट 10 इंच (178 सेमी)",
      "68 kg": "68 किलो",
      "Yadav (Ahir)": "यादव (अहीर)",
      Travelling: "यात्रा",
      Photography: "फ़ोटोग्राफ़ी",
      Gaming: "गेमिंग",
      "B.Tech in Computer Science & Engineering": "बी.टेक (कंप्यूटर साइंस एवं इंजीनियरिंग)",
      "Software Engineer": "सॉफ़्टवेयर इंजीनियर",
      "Lanet Ltd": "लैनेट लिमिटेड",
      "Shri Rajesh Yadav": "श्री राजेश यादव",
      "Smt. Saroj Yadav": "श्रीमती सरोज यादव",
      "Shubham Yadav": "शुभम यादव",
      "Saurabh Yadav": "सौरभ यादव",
      "Traditional values with a modern outlook": "आधुनिक दृष्टिकोण के साथ पारंपरिक मूल्य",
    } as Record<string, string>,
  },

  contact: {
    persons: [
      { name: "Shri Rajesh Yadav", relation: "Father", phone: "+91 98244 27610" },
      { name: "Saurabh Yadav", relation: "Self", phone: "+91 74860 52584" },
    ] as ContactPerson[],
    whatsapp: "",
    email: "",
    address: "",
  },
};

export type Biodata = typeof biodata;
