import type { ProductCategory } from "./categories";

export interface ProductVariant {
  id: string;
  name: string;
}

export interface ProductVariantGroup {
  labelEn: string;
  labelAr: string;
  options: ProductVariant[];
}

/**
 * A row in a pump/motor selection table. Every field past `model` is optional:
 * each catalogue quotes a different set of columns, so a group renders only the
 * ones its own rows actually carry (see ProductDetailView's MODEL_COLUMNS).
 */
export interface ProductModelRow {
  model: string;
  flow?: string;
  head?: string;
  motor?: string;
  hp?: string;
  weight?: string;
  outlet?: string;
}

export interface ProductModelGroup {
  diameter: string;
  flowRange: string;
  rows: ProductModelRow[];
}

/** Generic multi-column spec table row, e.g. for motor size/weight charts */
export interface ProductSpecRow {
  type: string;
  values: string[];
}

export interface ProductSpecGroup {
  title: string;
  subtitle?: string;
  columnsEn: string[];
  columnsAr: string[];
  rows: ProductSpecRow[];
}

export interface ProductData {
  id: string;
  category: ProductCategory;
  gallery: string[];
  specs: string[];
  variants: ProductVariantGroup[];
  tableSpecsEn: Record<string, string>;
  tableSpecsAr: Record<string, string>;
  /** Optional richer documentation block (currently used for the Kurlar KP/KPS/KSX/KM series) */
  modelNo?: string;
  featuresEn?: string[];
  featuresAr?: string[];
  modelGroups?: ProductModelGroup[];
  specGroups?: ProductSpecGroup[];
}

export const products: ProductData[] = [
  {
    id: "pump-submersible",
    category: "pumps",
    gallery: [
      "/images/products/pump-kurlar.png"
    ],
    specs: ["High Efficiency", "Stainless Steel", "Deep Well"],
    modelNo: "KP",
    variants: [
      {
        labelEn: "Power",
        labelAr: "القدرة",
        options: [
          { id: "10hp", name: "10 HP" },
          { id: "20hp", name: "20 HP" },
          { id: "50hp", name: "50 HP" },
        ]
      },
      {
        labelEn: "Material",
        labelAr: "المادة",
        options: [
          { id: "ss304", name: "SS304" },
          { id: "ss316", name: "SS316" }
        ]
      }
    ],
    tableSpecsEn: {
      "Max Capacity": "290 m³/h",
      "Max Head": "700 m",
      "Max Sand Content": "50 g/m³",
      "Max Water Temperature": "60°C",
      "Max Immersion Depth": "300 m",
      "Protection Class": "IP68",
      "Outlet Connection": "BSP & NPT",
    },
    tableSpecsAr: {
      "أقصى معدل تدفق": "290 متر مكعب/ساعة",
      "أقصى ارتفاع ضخ": "700 متر",
      "أقصى نسبة رمل": "50 جم/متر مكعب",
      "أقصى درجة حرارة للمياه": "60°م",
      "أقصى عمق غاطس": "300 متر",
      "فئة الحماية": "IP68",
      "وصلة الخروج": "BSP و NPT",
    },
    featuresEn: [
      "Long-lasting, reliable operation",
      "High-performance hydraulics",
      "Easy maintenance and practical installation",
      "Wear-resistant, water-lubricated bearings",
      "Suitable for both horizontal and vertical installation",
    ],
    featuresAr: [
      "أداء طويل الأمد وموثوق",
      "كفاءة هيدروليكية عالية",
      "سهولة الصيانة وتركيب عملي",
      "مقاومة للصدأ والتآكل",
      "تصميم مناسب للتركيب الأفقي والرأسي",
    ],
    modelGroups: [
      // Duty points read off the Kurlar 2025 catalogue curves (50 Hz, 2900 rpm)
      // at each pump's rated flow — the number carried in its type code, so
      // KP-646 is quoted at 46 m³/h. Heads the catalogue tabulates at that exact
      // flow are verbatim; where the rated flow falls between two tabulated
      // columns the head is interpolated between them. Weights are shipping
      // weights for the bare pump end, motor not included.
      {
        diameter: "6\"",
        flowRange: "30-60 m³/h",
        rows: [
          { model: "KP-630/12", flow: "30", head: "89", hp: "15", weight: "27" },
          { model: "KP-646/05", flow: "46", head: "41", hp: "10", weight: "18" },
          { model: "KP-646/10", flow: "46", head: "84", hp: "20", weight: "29" },
          { model: "KP-660/10", flow: "60", head: "78", hp: "25", weight: "28" },
          { model: "KP-660/13", flow: "60", head: "102", hp: "35", weight: "34" },
        ]
      },
      {
        diameter: "8\"",
        flowRange: "77-98 m³/h",
        rows: [
          { model: "KP-877/05", flow: "77", head: "60", hp: "25", weight: "43" },
          { model: "KP-877/09", flow: "77", head: "107", hp: "40", weight: "59" },
          { model: "KP-898/07", flow: "98", head: "103", hp: "50", weight: "51" },
          { model: "KP-898/11", flow: "98", head: "162", hp: "75", weight: "67" },
          { model: "KP-898/14", flow: "98", head: "205", hp: "100", weight: "79" },
        ]
      },
      {
        diameter: "10\"",
        flowRange: "110-215 m³/h",
        rows: [
          { model: "KP-10110/6", flow: "110", head: "110", hp: "60", weight: "62" },
          { model: "KP-10125/08", flow: "125", head: "165", hp: "110", weight: "74" },
          { model: "KP-10160/07", flow: "160", head: "143", hp: "110", weight: "69" },
          { model: "KP-10160/09", flow: "160", head: "184", hp: "150", weight: "82" },
          { model: "KP-10215/08", flow: "215", head: "204", hp: "200", weight: "129" },
        ]
      },
    ]
  },
  {
    id: "pump-cast-stainless",
    category: "pumps",
    gallery: [
      "/images/products/pump-ksx-cast.png"
    ],
    specs: ["Cast Stainless Steel", "Corrosion Resistant", "6\"-10\""],
    modelNo: "KSX",
    variants: [
      {
        labelEn: "Diameter",
        labelAr: "القطر",
        options: [
          { id: "6in", name: "6\"" },
          { id: "8in", name: "8\"" },
          { id: "10in", name: "10\"" },
        ]
      }
    ],
    tableSpecsEn: {
      "Max Capacity": "290 m³/h",
      "Max Head": "700 m",
      "Max Sand Content": "50 g/m³",
      "Max Water Temperature": "60°C",
      "Max Immersion Depth": "300 m",
      "Protection Class": "IP68",
      "Outlet Connection": "BSP & NPT & Flange DN",
    },
    tableSpecsAr: {
      "أقصى معدل تدفق": "290 متر مكعب/ساعة",
      "أقصى ارتفاع ضخ": "700 متر",
      "أقصى نسبة رمل": "50 جم/متر مكعب",
      "أقصى درجة حرارة للمياه": "60°م",
      "أقصى عمق غاطس": "300 متر",
      "فئة الحماية": "IP68",
      "وصلة الخروج": "BSP و NPT وفلانشة DN",
    },
    featuresEn: [
      "Long-lasting operation",
      "High-performance hydraulics",
      "Wear-resistant, water-lubricated bearings",
      "Suitable for both horizontal and vertical installation",
    ],
    featuresAr: [
      "أداء طويل الأمد",
      "كفاءة هيدروليكية عالية",
      "مقاومة من التآكل والصدأ",
      "تصميم مناسب للتركيب الأفقي والرأسي",
    ],
    modelGroups: [
      // Duty points read off the Kurlar KSX catalogue curves at each pump's rated
      // flow — the number in its type code, so K6SX-48 is quoted at 48 m³/h. The
      // KSX tables tabulate a head at exactly that flow for every series here, so
      // all figures are verbatim, none interpolated. The 10" pumps ship in three
      // impeller trims (base / A / B); these are the full-diameter base trim.
      // Weights are for the bare pump end, motor not included.
      {
        diameter: "6\"",
        flowRange: "36-72 m³/h",
        rows: [
          { model: "K6SX-36/9", flow: "36", head: "87", hp: "17.5", weight: "33" },
          { model: "K6SX-48/6", flow: "48", head: "52", hp: "12.5", weight: "24" },
          { model: "K6SX-60/5", flow: "60", head: "37", hp: "12.5", weight: "22" },
          { model: "K6SX-72/7", flow: "72", head: "57", hp: "20", weight: "27" },
        ]
      },
      {
        diameter: "8\"",
        flowRange: "80-144 m³/h",
        rows: [
          { model: "K8SX-80/7", flow: "80", head: "131", hp: "60", weight: "52" },
          { model: "K8SX-96/5", flow: "96", head: "94", hp: "50", weight: "41" },
          { model: "K8SX-112/8", flow: "112", head: "153", hp: "80", weight: "58" },
          { model: "K8SX-128/6", flow: "128", head: "113", hp: "70", weight: "46" },
          { model: "K8SX-144/5", flow: "144", head: "84", hp: "60", weight: "43" },
        ]
      },
      {
        diameter: "10\"",
        flowRange: "200-275 m³/h",
        rows: [
          { model: "K10SX-200/5", flow: "200", head: "138", hp: "125", weight: "94" },
          { model: "K10SX-225/4", flow: "225", head: "112", hp: "125", weight: "81" },
          { model: "K10SX-225/6", flow: "225", head: "168", hp: "180", weight: "107" },
          { model: "K10SX-250/5", flow: "250", head: "145", hp: "175", weight: "92" },
          { model: "K10SX-275/4", flow: "275", head: "129", hp: "180", weight: "79" },
        ]
      },
    ]
  },
  {
    // Rovatti A. & Figli Pompe (Fabbrico, Reggio Emilia, Italy). Like the
    // Panelli pages, no variant selector — the buyer sends a general enquiry
    // and El Waha sizes the pump.
    id: "pump-rovatti",
    category: "pumps",
    gallery: [
      "/images/products/rovatti-pump.jpeg"
    ],
    specs: ["Cast Iron & Cast Steel", "8\" to 10\"", "Made in Italy"],
    modelNo: "8E - 8ER - 10E - 10ER",
    variants: [],
    tableSpecsEn: {
      "Diameters": "8\" and 10\"",
      "8\" Series": "10-150 HP",
      "10\" Series": "25-350 HP",
      "Construction": "Cast iron and cast steel, with AISI 316 stainless available",
      "Check Valve": "Incorporated in the delivery bowl",
      "Frequency": "50 Hz",
      "Origin": "Made in Italy — Fabbrico, Reggio Emilia",
    },
    tableSpecsAr: {
      "الأقطار": "8 و10 بوصة",
      "سلسلة 8 بوصة": "10-150 حصان",
      "سلسلة 10 بوصة": "25-350 حصان",
      "التصنيع": "زهر وصلب مصبوب، ويتوفر استانلس AISI 316",
      "محبس عدم الرجوع": "مدمج في جسم الطرد",
      "التردد": "50 هرتز",
      "بلد المنشأ": "صناعة إيطاليا — فابريكو، ريجيو إميليا",
    },
    featuresEn: [
      "Cast iron and cast steel construction, with AISI 316 stainless available",
      "Radial and mixed-flow hydraulics — high head or high flow from the same bore",
      "Check valve built into the delivery bowl, so no separate valve to fit",
      "8\" reaches 675 m of head; 10\" reaches 420 m³/h",
      "Suits irrigation, water utilities and industrial supply",
      "Made in Italy by Rovatti Pompe, ISO certified",
    ],
    featuresAr: [
      "تصنيع بالزهر والصلب المصبوب، مع توفر الاستانلس AISI 316",
      "هيدروليكا شعاعية ونصف محورية — ارتفاع ضخ عالٍ أو تصرف عالٍ من نفس البئر",
      "محبس عدم رجوع مدمج في جسم الطرد، فلا حاجة لتركيب محبس منفصل",
      "مقاس 8 بوصة يصل إلى 675 متر رفع، ومقاس 10 بوصة يصل إلى 420 م³/ساعة",
      "تناسب الري ومرافق المياه والإمداد الصناعي",
      "صناعة إيطاليا من Rovatti Pompe، حاصلة على شهادة ISO",
    ]
  },
  {
    // Panelli (San Bonifacio, Italy — Pedrollo Group). Deliberately has no
    // variant selector: the buyer is meant to send a general enquiry and let
    // El Waha size the pump, rather than pick an exact model themselves the
    // way the Kurlar pages allow.
    id: "pump-panelli-sx",
    category: "pumps",
    gallery: [
      "/images/products/panelli-pump.jpeg"
    ],
    specs: ["Cast Iron & Cast Steel", "8\" & 10\"", "Made in Italy"],
    modelNo: "140-270 SX",
    variants: [],
    tableSpecsEn: {
      "Diameters": "8\" and 10\" (range spans 6\" to 12\")",
      "8\" Series": "180 SX — 78, 90, 102, 124 and 140 m³/h nominal, 10-150 HP",
      "10\" Series": "230 SX — 200, 220, 240 and 280 m³/h nominal, 25-340 HP",
      "Construction": "Cast iron, cast steel, and micro-cast stainless steel",
      "Stainless Grades": "AISI 304, AISI 316, Duplex",
      "Max Capacity": "543 m³/h",
      "Max Head": "470 m",
      "Max Power": "350 kW",
      "Max Sand Content": "50 g/m³",
      "Max Immersion Depth": "350 m",
      "Origin": "Made in Italy",
    },
    tableSpecsAr: {
      "الأقطار": "8 و10 بوصة (المدى من 6 إلى 12 بوصة)",
      "سلسلة 8 بوصة": "180 SX — تصرف اسمي 78 و90 و102 و124 و140 م³/ساعة، 10-150 حصان",
      "سلسلة 10 بوصة": "230 SX — تصرف اسمي 200 و220 و240 و280 م³/ساعة، 25-340 حصان",
      "التصنيع": "زهر، صلب مصبوب، واستانلس ستيل مصبوب دقيق",
      "درجات الاستانلس": "AISI 304، AISI 316، دوبلكس",
      "أقصى معدل تدفق": "543 م³/ساعة",
      "أقصى ارتفاع ضخ": "470 متر",
      "أقصى قدرة": "350 كيلوواط",
      "أقصى نسبة رمل": "50 جم/م³",
      "أقصى عمق غاطس": "350 متر",
      "بلد المنشأ": "صناعة إيطاليا",
    },
    featuresEn: [
      "Available in cast iron and cast steel, and in micro-cast AISI 304 stainless",
      "Semiaxial impellers and diffusers suited to mid-to-high flows at moderate head",
      "Micro-casting gives a smoother waterway and higher efficiency than fabricated parts",
      "Easy assembly and disassembly keeps maintenance time and cost down",
      "Suits irrigation, water networks and pressure boosting",
      "Made in Italy by Panelli, manufacturing submersibles since 1906",
    ],
    featuresAr: [
      "متوفرة بالزهر والصلب المصبوب، وكذلك بالاستانلس AISI 304 المصبوب الدقيق",
      "مراوح وموزعات نصف محورية تناسب التصرفات المتوسطة والعالية عند ارتفاعات معتدلة",
      "الصب الدقيق يعطي مجرى مياه أنعم وكفاءة أعلى من الأجزاء المشكّلة",
      "سهولة الفك والتركيب تقلل زمن الصيانة وتكلفتها",
      "تناسب الري وشبكات المياه ورفع الضغط",
      "صناعة إيطاليا من Panelli، المتخصصة في الطلمبات الغاطسة منذ 1906",
    ]
  },
  {
    // Rovatti's surface range, listed as one page rather than per series.
    // El Waha carries the whole range and sizes it per duty, so the page
    // states what the range covers and leaves the model choice to the
    // enquiry — hence no variant selector and no model tables.
    id: "pump-rovatti-surface",
    category: "surface-pumps",
    gallery: [
      "/images/products/rovatti-surface.png"
    ],
    specs: ["Surface & Waste Water", "Single & Multistage", "Made in Italy"],
    variants: [],
    tableSpecsEn: {
      "Range": "Surface electric pumps, surface (bare-shaft) pumps, and waste water electric submersible pumps",
      "Hydraulics": "Single-stage and multistage centrifugal",
      "Execution": "Horizontal and vertical",
      "Waste Water Impellers": "Single-channel, double-channel and vortex",
      "Typical Duties": "Irrigation, water supply and boosting, industrial service water, drainage",
      "Origin": "Made in Italy",
    },
    tableSpecsAr: {
      "المجموعة": "طلمبات سطحية كهربائية، وطلمبات سطحية بعمود حر، وطلمبات غاطسة لمياه الصرف",
      "الهيدروليكا": "طاردة مركزية أحادية ومتعددة المراحل",
      "التركيب": "أفقي ورأسي",
      "مراوح مياه الصرف": "أحادية القناة، ثنائية القناة، وفورتكس",
      "أوجه الاستخدام": "الري، وإمداد المياه ورفع الضغط، ومياه خدمة المصانع، والصرف",
      "بلد المنشأ": "صناعة إيطاليا",
    },
    featuresEn: [
      "The full Rovatti surface range from one supplier",
      "Single-stage and multistage centrifugal hydraulics, horizontal or vertical",
      "Electric or bare-shaft builds to suit the drive on site",
      "Waste water submersibles for liquids carrying solids and fibres",
      "Made in Italy by Rovatti Pompe, over 70 years in pump manufacturing",
    ],
    featuresAr: [
      "المجموعة السطحية الكاملة من Rovatti من مصدر واحد",
      "هيدروليكا طاردة مركزية أحادية ومتعددة المراحل، بتركيب أفقي أو رأسي",
      "تنفيذ كهربائي أو بعمود حر حسب طريقة التشغيل في الموقع",
      "طلمبات غاطسة لمياه الصرف تتحمل السوائل الحاملة للمواد الصلبة والألياف",
      "صناعة إيطاليا من Rovatti Pompe، بخبرة تتجاوز 70 عامًا في تصنيع الطلمبات",
    ]
  },
  {
    // Tormac's surface range. Same treatment as the Rovatti surface page:
    // the range is stated series by series, and the model choice happens in
    // the enquiry rather than through a variant selector.
    id: "pump-tormac-surface",
    category: "surface-pumps",
    gallery: [
      "/images/products/tormac-surface.jpeg"
    ],
    specs: ["Close Coupled to Split Case", "50 Hz", "Motors Included"],
    variants: [],
    tableSpecsEn: {
      "Series": "TCCH, TEH, TEC, THSC and TV, with matching induction motors",
      "TCCH — Close Coupled": "Pump and motor on one shaft, compact footprint",
      "TEH / TEC — End Suction": "Horizontal end-suction centrifugal pumps",
      "THSC — Split Case": "Horizontal split case for high-flow duties",
      "TV — Vertical Multistage": "High head from a small floor area",
      "Induction Motors": "Matched motors supplied with the pump",
      "Typical Duties": "Irrigation, water supply and pressure boosting, industrial and building services",
      "Frequency": "50 Hz",
    },
    tableSpecsAr: {
      "السلاسل": "TCCH وTEH وTEC وTHSC وTV، مع مواتير حث مناسبة",
      "TCCH — مباشر على الموتور": "الطلمبة والموتور على عمود واحد بحيز صغير",
      "TEH / TEC — سحب أمامي": "طلمبات طاردة مركزية أفقية بسحب أمامي",
      "THSC — جسم منشطر": "جسم أفقي منشطر للتصرفات العالية",
      "TV — رأسية متعددة المراحل": "ارتفاع ضخ عالٍ بمساحة أرضية صغيرة",
      "مواتير الحث": "مواتير مناسبة تورد مع الطلمبة",
      "أوجه الاستخدام": "الري، وإمداد المياه ورفع الضغط، وخدمات المصانع والمباني",
      "التردد": "50 هرتز",
    },
    featuresEn: [
      "All types of Tormac surface pumps from one supplier",
      "Horizontal and vertical builds, close coupled or split case",
      "Supplied complete with the right motor",
      "For irrigation, water supply, and pressure boosting in factories and buildings",
    ],
    featuresAr: [
      "جميع أنواع الطلمبات السطحية من Tormac من مصدر واحد",
      "متوفرة أفقية ورأسية، ومباشرة على الموتور أو بجسم منشطر",
      "تورد كاملة مع الموتور المناسب",
      "تناسب الري وإمداد المياه ورفع الضغط في المصانع والمباني",
    ]
  },
  {
    // Franklin Electric submersible motors. Like the Panelli and Rovatti
    // pages, no variant selector — the enquiry names the duty, not a model.
    // Figures below are the 50 Hz ones, since that is the Egyptian supply;
    // the catalogue also carries 60 Hz ratings that do not apply here.
    id: "motor-franklin",
    category: "motors",
    gallery: [
      "/images/products/franklin-motors.png"
    ],
    specs: ["8\" & 10\"", "40-250 HP", "Class F"],
    variants: [],
    tableSpecsEn: {
      "Diameters": "8\" and 10\" (catalogue spans 4\" to 12\")",
      "8\" Standard (50 Hz)": "40-200 HP (30-150 kW), 2900 rpm, 30°C ambient",
      "8\" Hi-Temp 75 (50 Hz)": "40-150 HP (30-110 kW), rated to 75°C ambient",
      "10\"": "175-250 HP (130-185 kW), 380-415 V / 50 Hz",
      "Phase & Poles": "Three-phase, 2-pole",
      "Insulation": "UL Class F",
      "Protection": "IP68 (10\")",
      "Seal System": "Sand Fighter — SiC seal standard on the 10\"",
      "Thrust Rating": "10,000 lb on the 8\" at 30°C",
      "Materials": "300 series stainless shell, or 316 SS / 904 L",
      "Certification": "Built in ISO 9001 facilities; 10\" is NSF/ANSI 61 certified",
    },
    tableSpecsAr: {
      "الأقطار": "8 و10 بوصة (الكتالوج يغطي من 4 إلى 12 بوصة)",
      "8 بوصة قياسي (50 هرتز)": "40-200 حصان (30-150 كيلوواط)، 2900 لفة/دقيقة، حرارة محيطة 30°م",
      "8 بوصة Hi-Temp 75 (50 هرتز)": "40-150 حصان (30-110 كيلوواط)، حتى 75°م حرارة محيطة",
      "10 بوصة": "175-250 حصان (130-185 كيلوواط)، 380-415 فولت / 50 هرتز",
      "الأوجه والأقطاب": "ثلاثي الأوجه، قطبان",
      "العزل": "فئة F حسب UL",
      "الحماية": "IP68 (مقاس 10 بوصة)",
      "نظام الإحكام": "Sand Fighter — سيل SiC قياسي في مقاس 10 بوصة",
      "تحمل الدفع المحوري": "10,000 رطل لمقاس 8 بوصة عند 30°م",
      "الخامات": "جسم استانلس سلسلة 300، أو 316 SS / 904 L",
      "الشهادات": "مصنعة في منشآت حاصلة على ISO 9001، ومقاس 10 بوصة حاصل على NSF/ANSI 61",
    },
    featuresEn: [
      "Sand Fighter seal system — built to keep running in sandy water",
      "Hi-Temp 75 build rated to 75°C ambient for hot or slow-flowing wells",
      "Full 316 stainless and 904 L options for aggressive or saline water",
      "Water-filled with a non-toxic solution, and NSF/ANSI 61 certified on the 10\"",
    ],
    featuresAr: [
      "نظام إحكام Sand Fighter — مصمم لمواصلة العمل في المياه الرملية",
      "نسخة Hi-Temp 75 تتحمل حرارة محيطة حتى 75°م للآبار الساخنة أو بطيئة التدفق",
      "خيارات الاستانلس 316 الكامل و904 L للمياه العدوانية أو المالحة",
      "معبأ بسائل مائي غير سام، ومقاس 10 بوصة حاصل على شهادة NSF/ANSI 61",
    ]
  },
  {
    // Panelli's water-filled rewindable submersible motors. Like the pump
    // above, no variant selector — the enquiry names the duty, not a model.
    id: "motor-panelli",
    category: "motors",
    gallery: [
      "/images/products/panelli-motor.jpeg"
    ],
    specs: ["Rewindable", "8\" & 10\"", "Made in Italy"],
    variants: [],
    tableSpecsEn: {
      "Diameters": "8\" and 10\" (range spans 6\" to 12\")",
      "Type": "Water-filled, rewindable submersible motor",
      "Power Range": "0.37 kW (0.5 HP) to 300 kW (400 HP) across the range",
      "Frequency": "50 Hz",
      "Coupling": "NEMA-standard, matched to the SX pump ends",
      "Construction": "Cast iron and stainless steel bodies",
      "Cooling": "Water-filled and water-cooled in the well",
      "Servicing": "Rewindable — repairable rather than replaced",
      "Origin": "Made in Italy",
    },
    tableSpecsAr: {
      "الأقطار": "8 و10 بوصة (المدى من 6 إلى 12 بوصة)",
      "النوع": "موتور غاطس ممتلئ بالماء وقابل لإعادة اللف",
      "مدى القدرة": "من 0.37 كيلوواط (0.5 حصان) حتى 300 كيلوواط (400 حصان) عبر المدى",
      "التردد": "50 هرتز",
      "الوصلة": "قياسي NEMA، متوافق مع طلمبات SX",
      "التصنيع": "أجسام من الزهر والاستانلس ستيل",
      "التبريد": "ممتلئ بالماء ومبرد بالماء داخل البئر",
      "الصيانة": "قابل لإعادة اللف — يُصلح بدلاً من استبداله",
      "بلد المنشأ": "صناعة إيطاليا",
    },
    featuresEn: [
      "Rewindable design — a burnt-out motor is rewound, not written off",
      "Water-filled and water-cooled for steady running in deep settings",
      "Cast iron and stainless steel bodies to suit the water it sits in",
      "8\" and 10\" sizes matched to the Panelli SX pump ends",
      "Made in Italy by Panelli, manufacturing submersibles since 1906",
    ],
    featuresAr: [
      "تصميم قابل لإعادة اللف — الموتور المحروق يُعاد لفه بدلاً من استبداله",
      "ممتلئ بالماء ومبرد بالماء لتشغيل مستقر في التركيبات العميقة",
      "أجسام من الزهر والاستانلس ستيل تناسب طبيعة مياه البئر",
      "مقاسات 8 و10 بوصة متوافقة مع طلمبات Panelli SX",
      "صناعة إيطاليا من Panelli، المتخصصة في الطلمبات الغاطسة منذ 1906",
    ]
  },
  {
    id: "elec-inverter",
    category: "electrical",
    gallery: [
      "/images/products/electrical-inverter-novo.png"
    ],
    specs: ["Dynamic MPPT", "Solar + Grid Hybrid", "0.37-400 kW"],
    variants: [
      {
        labelEn: "Capacity",
        labelAr: "السعة",
        options: [
          { id: "5kw", name: "5 kW" },
          { id: "10kw", name: "10 kW" },
          { id: "50kw", name: "50 kW" }
        ]
      }
    ],
    tableSpecsEn: {
      "DC Solar Input Voltage": "150V - 900V (model-dependent)",
      "AC Input (Hybrid Mode)": "220V single-phase / 220V or 380V three-phase, auto solar-grid switching",
      "Output Voltage": "220V (1-phase) / 220V or 380V (3-phase)",
      "Output Frequency": "0-400 Hz adjustable",
      "Rated Output Power": "0.37 kW - 400 kW",
      "Compatible Pumps": "Submersible, surface, centrifugal & deep well pumps",
      "Compatible Motors": "Asynchronous & synchronous",
      "Operating Temperature": "-10°C to +40°C",
      "Protection Rating": "IP20 / IP65 (model options)",
      "Weight Range": "1 kg - 232 kg depending on power rating",
    },
    tableSpecsAr: {
      "جهد إدخال الطاقة الشمسية": "150 - 900 فولت (حسب الموديل)",
      "إدخال التيار المتردد (وضع الهجين)": "أحادي الطور 220 فولت / ثلاثي الطور 220 أو 380 فولت، تبديل تلقائي بين الطاقة الشمسية والشبكة",
      "جهد الخرج": "220 فولت (أحادي الطور) / 220 أو 380 فولت (ثلاثي الطور)",
      "تردد الخرج": "0-400 هرتز قابل للتعديل",
      "القدرة المقننة للخرج": "0.37 - 400 كيلوواط",
      "الطلمبات المتوافقة": "غاطسة، سطحية، طرد مركزي، وآبار عميقة",
      "المواتير المتوافقة": "لا متزامن ومتزامن",
      "درجة حرارة التشغيل": "-10 إلى +40 درجة مئوية",
      "فئة الحماية": "IP20 / IP65 (حسب الموديل)",
      "نطاق الوزن": "1 - 232 كجم حسب القدرة",
    },
    featuresEn: [
      "Dynamic MPPT technology — maximizes solar power extraction and auto-adjusts to sunlight conditions",
      "Comprehensive protection: overload, over/undervoltage, overcurrent, dry-run, overheat & phase-loss",
      "Smart Soft Start — reduces inrush current and extends pump lifespan",
      "Solar-only or Solar + Grid hybrid operation with auto-restart in low sunlight",
      "Real-time monitoring of power, voltage, current, pump status & fault history",
      "Supports float switch & pressure sensors with multi-language interface",
    ],
    featuresAr: [
      "تقنية MPPT الديناميكية — تُعظّم استخلاص الطاقة الشمسية وتتكيف تلقائيًا مع ظروف الإضاءة",
      "حماية شاملة: حمل زائد، ارتفاع/انخفاض الجهد، تيار زائد، جفاف الطلمبة، ارتفاع الحرارة، وفقدان الطور",
      "بدء تشغيل ناعم ذكي — يقلل تيار الاندفاع ويطيل عمر الطلمبة",
      "تشغيل بالطاقة الشمسية فقط أو هجين مع الشبكة مع إعادة تشغيل تلقائية عند ضعف الإضاءة",
      "مراقبة لحظية للقدرة والجهد والتيار وحالة الطلمبة وسجل الأعطال",
      "يدعم مفتاح العوامة وأجهزة استشعار الضغط بواجهة متعددة اللغات",
    ]
  },
  {
    // El Waha's own product: the panels are built up in the company's workshop
    // from bought-in switchgear, then sized against the motor they will run.
    // There is no manufacturer catalogue behind this one, so the spec table
    // stays with what the build actually is and leaves ratings to the enquiry.
    id: "elec-control-panel",
    category: "electrical",
    gallery: [
      "/images/products/panel-inverter.png",
      "/images/products/panel-star-delta.png"
    ],
    specs: ["Built In-House", "Inverter · Soft Start · Star-Delta", "Motor Protection"],
    variants: [],
    tableSpecsEn: {
      "Built By": "Assembled in El Waha's own workshop",
      "Starting Methods": "Inverter (VFD), soft starter, star-delta",
      "Application": "Submersible and surface pump motors",
      "Supply": "Three-phase 380 V, 50 Hz",
      "Enclosure": "Floor-standing sheet steel, lockable doors",
      "Incoming Protection": "MCCB with copper busbar distribution",
      "Control Gear": "DIN-rail contactors, relays and control MCBs",
      "Door Furniture": "Run and trip indicator lamps, selector switches",
      "Cooling": "Ventilation louvres with forced-air fan",
      "Sizing": "Specified per well against the motor's own rating",
    },
    tableSpecsAr: {
      "جهة التصنيع": "تجميع داخل مركز صيانة الواحة",
      "طرق بدء التشغيل": "إنفرتر (VFD)، سوفت ستارت، ستار دلتا",
      "الاستخدام": "مواتير الطلمبات الغاطسة والسطحية",
      "التغذية": "ثلاثي الأوجه 380 فولت، 50 هرتز",
      "الحاوية": "صاج قائم على الأرض بأبواب قابلة للقفل",
      "حماية الدخول": "قاطع MCCB مع توزيع ببارات نحاس",
      "أجهزة التحكم": "كونتاكتورات وريلايات وقواطع تحكم على قضيب DIN",
      "تجهيزات الباب": "لمبات بيان التشغيل والفصل ومفاتيح الاختيار",
      "التبريد": "فتحات تهوية مع مروحة تبريد",
      "التحديد": "يُحدد لكل بئر حسب قدرة الموتور",
    },
    featuresEn: [
      "Assembled in El Waha's own workshop and sized to the motor it will run",
      "Three starting methods: inverter (VFD) speed control, soft starter, or star-delta",
      "Soft and stepped starting cuts inrush current and mechanical shock on the pump",
      "Motor protection against overload, phase failure and voltage swings",
      "Longer motor and pump service life, and a lower monthly electricity bill",
      "Labelled, serviceable layout so a fault can be traced on site",
    ],
    featuresAr: [
      "تجميع داخل مركز صيانة الواحة وتحديد المقاسات حسب الموتور المستخدم",
      "ثلاث طرق لبدء التشغيل: إنفرتر (VFD) للتحكم في السرعة، أو سوفت ستارت، أو ستار دلتا",
      "البدء الناعم والمتدرج يقلل تيار الاندفاع والصدمة الميكانيكية على الطلمبة",
      "حماية الموتور من الحمل الزائد وفقد الوجه وتذبذب الجهد",
      "عمر تشغيلي أطول للموتور والطلمبة وفاتورة كهرباء أقل شهريًا",
      "توزيع منظم ومعلّم يسهّل تتبع الأعطال في الموقع",
    ]
  },
  {
    id: "motor-hitemp",
    category: "motors",
    gallery: [
      "/images/products/motor-kurlar.png"
    ],
    specs: ["HI-TEMP 60°C", "IP68", "Water-Cooled"],
    modelNo: "KM",
    variants: [
      {
        labelEn: "Diameter",
        labelAr: "القطر",
        options: [
          { id: "6in", name: "6\"" },
          { id: "7in", name: "7\"" },
          { id: "8in", name: "8\"" },
          { id: "10in", name: "10\"" },
        ]
      }
    ],
    tableSpecsEn: {
      "Protection Class": "IP68",
      "Max Operating Temperature": "60°C",
      "Standard Voltage": "380/415V, 50Hz",
      "Voltage Tolerance": "±10%",
      "Installation Position": "Vertical & Horizontal",
      "Rotation Direction": "Clockwise & Counter-clockwise",
      "Motor Cable Length": "4 m",
      "Winding Wire": "High-temperature PBN insulated",
      "Cooling": "Water-cooled",
      "Internal Fill": "Pure water & glycerin mix (protects to -15°C)",
    },
    tableSpecsAr: {
      "فئة الحماية": "IP68",
      "أقصى درجة حرارة تشغيل": "60°م",
      "الجهد القياسي": "380/415 فولت، 50 هرتز",
      "تفاوت الجهد": "±10%",
      "وضع التركيب": "أفقي ورأسي",
      "اتجاه الدوران": "مع عقارب الساعة وعكسها",
      "طول كابل الموتور": "4 متر",
      "سلك الملف": "عازل PBN خاص بالحرارة العالية",
      "التبريد": "تبريد مائي",
      "سائل الملء الداخلي": "خليط ماء نقي وجليسرين (يحمي حتى -15°م)",
    },
    featuresEn: [
      "High efficiency, low operating cost",
      "High-temperature specific PBN winding wire",
      "Longer service life than standard motors",
      "Water-cooled submersible motor construction",
      "High resistance to voltage fluctuations",
      "Stainless steel motor shaft & NBR sand guard",
    ],
    featuresAr: [
      "كفاءة عالية وتكلفة تشغيل منخفضة",
      "سلك ملف PBN مخصص لدرجات الحرارة العالية",
      "عمر تشغيلي أطول مقارنة بالموتورات القياسية",
      "تصميم موتور غاطس مبرد بالماء",
      "مقاومة عالية لتذبذبات الجهد الكهربائي",
      "عمود موتور من الاستانلس ستيل وواقي رمل NBR",
    ],
    specGroups: [
      {
        title: "6\" Series",
        subtitle: "4-45 kW (5.5-60 HP) · 6\" NEMA flange, M12 studs · Max 20 starts/hour",
        columnsEn: ["Type", "Power (HP)", "Power (kW)", "Length (mm)", "Weight (kg)", "Crate W (cm)", "Crate L (cm)", "Crate H (cm)", "Gross Weight (kg)"],
        columnsAr: ["النوع", "القدرة (حصان)", "القدرة (ك.و)", "الطول (مم)", "الوزن (كجم)", "عرض الصندوق (سم)", "طول الصندوق (سم)", "ارتفاع الصندوق (سم)", "الوزن الإجمالي (كجم)"],
        rows: [
          { type: "KM6-5.5", values: ["5.5", "4", "721", "39", "17.4", "92.4", "27.4", "46"] },
          { type: "KM6-7.5", values: ["7.5", "5.5", "750", "43", "17.4", "92.4", "27.4", "50"] },
          { type: "KM6-10", values: ["10", "7.5", "830", "50", "17.4", "92.4", "27.4", "57"] },
          { type: "KM6-12.5", values: ["12.5", "9.3", "870", "54", "17.4", "92.4", "27.4", "61"] },
          { type: "KM6-15", values: ["15", "11", "923", "59", "17.4", "102.4", "27.4", "68"] },
          { type: "KM6-17.5", values: ["17.5", "13", "983", "65", "17.4", "102.4", "27.4", "74"] },
          { type: "KM6-20", values: ["20", "15", "1045", "71", "17.4", "122.4", "27.4", "81"] },
          { type: "KM6-25", values: ["25", "18.5", "1078", "75", "17.4", "122.4", "27.4", "85"] },
          { type: "KM6-30", values: ["30", "22", "1178", "86", "17.4", "122.4", "27.4", "96"] },
          { type: "KM6-35", values: ["35", "26.5", "1289", "98", "17.4", "137.4", "27.4", "109"] },
          { type: "KM6-40", values: ["40", "30", "1319", "103", "17.4", "137.4", "27.4", "114"] },
          { type: "KM6-50", values: ["50", "37", "1419", "112", "17.4", "152.4", "27.4", "124"] },
          { type: "KM6-60", values: ["60", "45", "1480", "124", "17.4", "152.4", "27.4", "136"] },
        ]
      },
      {
        title: "7\" Series",
        subtitle: "22-75 kW (30-100 HP) · 6\" NEMA flange · Max 16 starts/hour",
        columnsEn: ["Type", "Power (HP)", "Power (kW)", "Length (mm)", "Weight (kg)", "Crate W (cm)", "Crate L (cm)", "Crate H (cm)", "Gross Weight (kg)"],
        columnsAr: ["النوع", "القدرة (حصان)", "القدرة (ك.و)", "الطول (مم)", "الوزن (كجم)", "عرض الصندوق (سم)", "طول الصندوق (سم)", "ارتفاع الصندوق (سم)", "الوزن الإجمالي (كجم)"],
        rows: [
          { type: "KM7-30", values: ["30", "22", "937", "98", "21.6", "113.6", "31.6", "113"] },
          { type: "KM7-35", values: ["35", "26.5", "977", "104", "21.6", "113.6", "31.6", "119"] },
          { type: "KM7-40", values: ["40", "30", "1017", "110", "21.6", "123.6", "31.6", "126"] },
          { type: "KM7-50", values: ["50", "37", "1096", "124", "21.6", "123.6", "31.6", "140"] },
          { type: "KM7-60", values: ["60", "45", "1176", "136", "21.6", "138.6", "31.6", "154"] },
          { type: "KM7-70", values: ["70", "52", "1255", "154", "21.6", "138.6", "31.6", "172"] },
          { type: "KM7-75", values: ["75", "55", "1255", "154", "21.6", "138.6", "31.6", "172"] },
          { type: "KM7-80", values: ["80", "60", "1336", "157", "21.6", "153.6", "31.6", "177"] },
          { type: "KM7-90", values: ["90", "67", "1416", "174", "21.6", "153.6", "31.6", "194"] },
          { type: "KM7-100", values: ["100", "75", "1416", "182", "21.6", "153.6", "31.6", "202"] },
        ]
      },
      {
        title: "8\" Series",
        subtitle: "22-110 kW (30-150 HP) · 8\" NEMA flange · Max 15 starts/hour",
        columnsEn: ["Type", "Power (HP)", "Power (kW)", "Length (mm)", "Weight (kg)", "Crate W (cm)", "Crate L (cm)", "Crate H (cm)", "Gross Weight (kg)"],
        columnsAr: ["النوع", "القدرة (حصان)", "القدرة (ك.و)", "الطول (مم)", "الوزن (كجم)", "عرض الصندوق (سم)", "طول الصندوق (سم)", "ارتفاع الصندوق (سم)", "الوزن الإجمالي (كجم)"],
        rows: [
          { type: "KM8-35", values: ["35", "26.5", "1122", "123", "23.6", "128.6", "33.6", "141"] },
          { type: "KM8-40", values: ["40", "30", "1147", "128", "23.6", "128.6", "33.6", "146"] },
          { type: "KM8-50", values: ["50", "37", "1207", "139", "23.6", "128.6", "33.6", "157"] },
          { type: "KM8-60", values: ["60", "45", "1292", "154", "23.6", "128.6", "33.6", "174"] },
          { type: "KM8-70", values: ["70", "52", "1377", "171", "23.6", "128.6", "33.6", "191"] },
          { type: "KM8-75", values: ["75", "55", "1377", "171", "23.6", "128.6", "33.6", "191"] },
          { type: "KM8-80", values: ["80", "60", "1432", "181", "23.6", "158.6", "33.6", "203"] },
          { type: "KM8-90", values: ["90", "67", "1457", "188", "23.6", "158.6", "33.6", "210"] },
          { type: "KM8-100", values: ["100", "75", "1482", "193", "23.6", "158.6", "33.6", "215"] },
          { type: "KM8-110", values: ["110", "81", "1562", "211", "23.6", "168.6", "33.6", "235"] },
          { type: "KM8-125", values: ["125", "92", "1627", "225", "23.6", "168.6", "33.6", "249"] },
          { type: "KM8-135", values: ["135", "100", "1669", "233", "23.6", "183.6", "33.6", "257"] },
          { type: "KM8-150", values: ["150", "110", "1732", "244", "23.6", "183.6", "33.6", "269"] },
        ]
      },
      {
        title: "10\" Series",
        subtitle: "75-260 kW (100-350 HP) · 8\" NEMA flange · Max 10 starts/hour",
        columnsEn: ["Type", "Power (HP)", "Power (kW)", "Length (mm)", "Weight (kg)", "Crate W (cm)", "Crate L (cm)", "Crate H (cm)", "Gross Weight (kg)"],
        columnsAr: ["النوع", "القدرة (حصان)", "القدرة (ك.و)", "الطول (مم)", "الوزن (كجم)", "عرض الصندوق (سم)", "طول الصندوق (سم)", "ارتفاع الصندوق (سم)", "الوزن الإجمالي (كجم)"],
        rows: [
          { type: "KM10-100", values: ["100", "75", "1432", "246", "28.6", "163.6", "38.6", "274"] },
          { type: "KM10-110", values: ["110", "81", "1472", "255", "28.6", "163.6", "38.6", "283"] },
          { type: "KM10-125", values: ["125", "92", "1532", "274", "28.6", "163.6", "38.6", "302"] },
          { type: "KM10-135", values: ["135", "100", "1564", "285", "28.6", "178.6", "38.6", "316"] },
          { type: "KM10-150", values: ["150", "110", "1612", "301", "28.6", "178.6", "38.6", "332"] },
          { type: "KM10-175", values: ["175", "129", "1712", "327", "28.6", "178.6", "38.6", "358"] },
          { type: "KM10-200", values: ["200", "147", "1842", "360", "28.6", "203.6", "38.6", "395"] },
          { type: "KM10-225", values: ["225", "166", "1863", "374", "28.6", "203.6", "38.6", "409"] },
          { type: "KM10-250", values: ["250", "185", "1922", "386", "28.6", "203.6", "38.6", "421"] },
          { type: "KM10-275", values: ["275", "205", "1955", "401", "28.6", "203.6", "38.6", "436"] },
          { type: "KM10-300", values: ["300", "225", "2040", "417", "28.6", "213.6", "38.6", "454"] },
          { type: "KM10-325", values: ["325", "242", "2040", "420", "28.6", "213.6", "38.6", "457"] },
          { type: "KM10-350", values: ["350", "260", "2040", "420", "28.6", "213.6", "38.6", "457"] },
        ]
      },
    ]
  },
  {
    id: "pipe-upvc-column",
    category: "pipes",
    gallery: [
      "/images/products/astral-pipes.png"
    ],
    specs: ["Lead-Free uPVC", "EPDM Sealed", "1\"-6\""],
    modelNo: "Bore-Well",
    variants: [
      {
        labelEn: "Diameter",
        labelAr: "القطر",
        options: [
          { id: "4in", name: "4 Inch" },
          { id: "5in", name: "5 Inch" },
          { id: "6in", name: "6 Inch" },
        ]
      }
    ],
    tableSpecsEn: {
      "Material": "Lead-free uPVC (heavy-metal-free compound)",
      "Size Range": "1\" (25 mm) to 6\" (165 mm)",
      "Pressure Classes": "V4 ECO, Medium, Standard, Super Heavy",
      "Jointing": "Square-thread coupler with EPDM 'O' Ring seal",
      "Locking System": "Double SS stud pin + shock-absorbing rubber ring",
      "Quality Testing": "CNC thread gauge testing, Ultimate Breaking Load (UBL) & high-pressure joint leakage tests",
    },
    tableSpecsAr: {
      "المادة": "يو بي في سي خالٍ من الرصاص (خليط خالٍ من المعادن الثقيلة)",
      "نطاق المقاسات": "من 1 بوصة (25 مم) إلى 6 بوصة (165 مم)",
      "فئات الضغط": "V4 ECO، متوسط، قياسي، فائق التحمل",
      "نظام التوصيل": "وصلة ذات سن مربع مع حلقة إحكام EPDM",
      "نظام القفل": "مسامير استانلس ستيل مزدوجة + حلقة مطاطية ماصة للصدمات",
      "اختبارات الجودة": "اختبار مقياس السن بالتحكم الرقمي CNC، واختبار حمل الكسر النهائي (UBL)، واختبار تسريب الوصلات تحت الضغط العالي",
    },
    featuresEn: [
      "Lead-free & heavy-metal-free compound — 100% safe for drinking water",
      "EPDM 'O' Ring leak-proof jointing at every coupler",
      "Double SS stud pin locking system with shock-absorbing rubber ring",
      "UV-stabilised, chemical-resistant & non-conductive construction",
      "High strength and long service life with better flow for optimum yields",
      "Easy handling, transportation & installation",
    ],
    featuresAr: [
      "مادة خالية من الرصاص والمعادن الثقيلة — آمنة 100% لمياه الشرب",
      "حلقات إحكام EPDM لمنع التسريب عند كل وصلة",
      "نظام قفل مزدوج بمسامير استانلس ستيل مع حلقة مطاطية ماصة للصدمات",
      "مقاومة للأشعة فوق البنفسجية والمواد الكيميائية وغير موصلة للكهرباء",
      "متانة عالية وعمر تشغيلي طويل مع تدفق أفضل لأعلى إنتاجية",
      "سهولة المناولة والنقل والتركيب",
    ]
  },
  {
    id: "thrust-bearing-heavy",
    category: "spare-parts",
    gallery: [
      "/images/products/thrust-bearing-alka.png"
    ],
    specs: ["Silicon Carbide", "1100°C Rated", "Sand Resistant"],
    modelNo: "AP+ Series",
    variants: [
      {
        labelEn: "Load Capacity",
        labelAr: "سعة التحميل",
        options: [
          { id: "medium", name: "Medium Load" },
          { id: "heavy", name: "Heavy Load" },
        ]
      }
    ],
    tableSpecsEn: {
      "Material": "Silicon Carbide (SiC) ceramic",
      "Max Operating Temperature": "1100°C (2012°F)",
      "Mating Surface": "Same material (SiC-on-SiC) required for reliable operation",
      "Application": "Deep-set submersible pumps in sandy/contaminated water & high thrust load conditions",
      "Validation": "In-house testing followed by field trials",
      "Load Carrying Capacity vs Stainless/Carbon": "Excellent vs Good",
      "Reliability & Lift vs Stainless/Carbon": "Excellent vs Fair",
      "Sandy-Water Running (Seal Failure) vs Stainless/Carbon": "Excellent vs Poor",
      "Corrosion Resistance vs Stainless/Carbon": "Superior vs Fair",
      "Thermal Management vs Stainless/Carbon": "Excellent vs Good",
    },
    tableSpecsAr: {
      "المادة": "سيراميك كربيد السيليكون (SiC)",
      "أقصى درجة حرارة تشغيل": "1100°م (2012°ف)",
      "سطح التلامس": "نفس المادة (SiC مقابل SiC) مطلوب للتشغيل الموثوق",
      "التطبيقات": "الطلمبات الغاطسة عميقة التركيب في المياه الرملية أو الملوثة وظروف الأحمال المحورية العالية",
      "التحقق من الجودة": "اختبار داخلي متبوع بتجارب ميدانية",
      "سعة تحمل الحمل مقابل الاستانلس/الكربون": "ممتازة مقابل جيدة",
      "الموثوقية والرفع مقابل الاستانلس/الكربون": "ممتازة مقابل مقبولة",
      "التشغيل في المياه الرملية عند فشل السيل مقابل الاستانلس/الكربون": "ممتازة مقابل ضعيفة",
      "مقاومة التآكل مقابل الاستانلس/الكربون": "فائقة مقابل مقبولة",
      "إدارة الحرارة مقابل الاستانلس/الكربون": "ممتازة مقابل جيدة",
    },
    featuresEn: [
      "Freedom from wear and tear",
      "High durability in aggressive media — sand, salt, and high temperatures",
      "Reliable performance at low voltages and high current",
      "Low friction increases speed and reduces power consumption",
      "Long life in all operating conditions",
    ],
    featuresAr: [
      "مقاومة كاملة للتآكل والاهتراء",
      "متانة عالية في البيئات القاسية كالرمال والملوحة ودرجات الحرارة العالية",
      "أداء موثوق عند الجهد المنخفض والتيار العالي",
      "احتكاك منخفض يزيد السرعة ويقلل استهلاك الطاقة",
      "عمر تشغيلي طويل في جميع الظروف",
    ]
  },
  {
    id: "winding-wire-voltson",
    category: "spare-parts",
    gallery: [
      "/images/products/VOLTSON.jpeg",
      "/images/products/voltson-wire.png"
    ],
    specs: ["ETP Copper 99.95%", "120°C Rated", "IS 8783"],
    modelNo: "EXCELGRIP",
    variants: [],
    tableSpecsEn: {
      "Conductor": "EC grade ETP copper, 99.95% minimum purity",
      "Insulation": "Bi-axially oriented polypropylene wrap",
      "Tested To": "IS 8783",
      "Max Working Temperature": "120°C",
      "High-Voltage Test": "3.5 kV rms, every coil",
      "Size Range": "0.40 - 2.40 mm² (smaller and larger on demand)",
      "Packing": "500 m and 1000 m coils",
      "Manufacturer": "Voltson India, ISO 9001:2015 certified",
      "Application": "Domestic and industrial submersible pump motors",
    },
    tableSpecsAr: {
      "الموصل": "نحاس ETP درجة EC بنقاء 99.95% كحد أدنى",
      "العزل": "لف بولي بروبيلين ثنائي الاتجاه",
      "مطابق لمواصفة": "IS 8783",
      "أقصى درجة حرارة تشغيل": "120°م",
      "اختبار الجهد العالي": "3.5 كيلو فولت لكل لفة",
      "نطاق المقاسات": "0.40 - 2.40 مم² (مقاسات أصغر وأكبر عند الطلب)",
      "التعبئة": "لفات 500 متر و1000 متر",
      "جهة التصنيع": "Voltson India، حاصلة على ISO 9001:2015",
      "الاستخدام": "مواتير الطلمبات الغاطسة المنزلية والصناعية",
    },
    featuresEn: [
      "EC grade ETP copper, 99.95% minimum purity",
      "High dielectric strength and insulation resistance",
      "Low dielectric losses (tan δ)",
      "Good thermal and chemical resistance",
      "High tear resistance from bi-axially oriented polypropylene",
      "Heavily annealed for easy working during motor winding",
    ],
    featuresAr: [
      "نحاس ETP درجة EC بنقاء لا يقل عن 99.95%",
      "قوة عزل كهربائي ومقاومة عزل عالية",
      "فقد عزل كهربائي منخفض (tan δ)",
      "مقاومة جيدة للحرارة والمواد الكيميائية",
      "مقاومة تمزق عالية بفضل البولي بروبيلين ثنائي الاتجاه",
      "معالجة تلدين عالية تسهّل اللف داخل مجاري الاستاتور",
    ],
    specGroups: [
      {
        // Transcribed from the EXCELGRIP catalogue's gauge table (tested per
        // IS 8783). Resistance is the maximum at 20°C; weight is approximate
        // and covers conductor plus poly wrap.
        title: "Poly Wrapped Winding Wires",
        subtitle: "Tested as per IS 8783 · 0.40 - 2.40 mm² · lesser and higher OD available on demand",
        columnsEn: ["Conductor (mm²)", "Overall Dia. (mm)", "Cross-Sectional Area (mm²)", "Resistance at 20°C (Ω/km, max)", "Elongation (min %)", "Approx. Weight (kg/km)"],
        columnsAr: ["الموصل (مم²)", "القطر الكلي (مم)", "مساحة المقطع (مم²)", "المقاومة عند 20°م (أوم/كم، أقصى)", "الاستطالة (% كحد أدنى)", "الوزن التقريبي (كجم/كم)"],
        rows: [
          { type: "0.40", values: ["0.80", "0.126", "140.00", "25", "1.47"] },
          { type: "0.50", values: ["0.90", "0.196", "87.80", "26", "2.15"] },
          { type: "0.60", values: ["1.00", "0.283", "60.98", "28", "2.98"] },
          { type: "0.70", values: ["1.10", "0.385", "44.78", "28", "3.95"] },
          { type: "0.80", values: ["1.20", "0.503", "34.30", "29", "5.05"] },
          { type: "0.90", values: ["1.35", "0.636", "27.10", "30", "6.30"] },
          { type: "1.00", values: ["1.45", "0.786", "21.95", "30", "7.80"] },
          { type: "1.10", values: ["1.55", "0.951", "17.50", "31", "9.20"] },
          { type: "1.20", values: ["1.65", "1.131", "15.26", "32", "10.90"] },
          { type: "1.30", values: ["1.75", "1.328", "12.58", "32", "12.70"] },
          { type: "1.40", values: ["1.85", "1.540", "11.20", "32", "14.90"] },
          { type: "1.50", values: ["2.00", "1.768", "9.75", "32", "17.00"] },
          { type: "1.60", values: ["2.10", "2.011", "8.57", "32", "19.20"] },
          { type: "1.70", values: ["2.20", "2.271", "7.59", "32", "21.60"] },
          { type: "1.80", values: ["2.30", "2.546", "6.77", "33", "24.20"] },
          { type: "1.90", values: ["2.40", "2.836", "6.08", "33", "26.80"] },
          { type: "2.00", values: ["2.50", "3.143", "5.49", "33", "29.60"] },
          { type: "2.10", values: ["2.60", "3.465", "4.98", "33", "32.55"] },
          { type: "2.20", values: ["2.70", "3.803", "4.53", "33", "35.60"] },
          { type: "2.30", values: ["2.80", "4.156", "4.15", "33", "38.85"] },
          { type: "2.40", values: ["2.90", "4.526", "3.81", "33", "42.20"] },
        ]
      },
    ]
  },
  {
    id: "cable-submersible",
    category: "cables",
    gallery: [
      "/images/products/aristoncavi-cable.png"
    ],
    specs: ["H07RN8-F", "EPR / Rubber", "100 m Immersion"],
    modelNo: "H07RN8-F",
    variants: [
      {
        labelEn: "Cross Section",
        labelAr: "المقطع",
        options: [
          { id: "1x10", name: "1x10 mm²" },
          { id: "1x16", name: "1x16 mm²" },
          { id: "1x25", name: "1x25 mm²" },
          { id: "1x35", name: "1x35 mm²" },
          { id: "1x50", name: "1x50 mm²" },
          { id: "1x70", name: "1x70 mm²" },
          { id: "1x90", name: "1x90 mm²" },
          { id: "1x120", name: "1x120 mm²" },
        ]
      }
    ],
    /* Transcribed from the manufacturer's own page for SUBMERSIBLE 07:
       https://www.aristoncavi.com/cable/submersible-07-h07rn8-f
       Only what Aristoncavi actually publish there is quoted. The page does
       not state an operating-temperature range or a minimum bending radius,
       so neither is listed — a figure invented here would end up on a
       quotation. The rated voltage is not a guess: 450/750 V is what the
       "07" in the harmonised designation H07RN8-F means. */
    tableSpecsEn: {
      "Designation": "H07RN8-F",
      "Standards": "EN 50525-2-21 · IEMMEQU <HAR> approved",
      "Conductor": "Bare copper, class 5 to IEC 60228",
      "Insulation": "EPR compound, EI4 quality to EN 50363-1",
      "Core Identification": "HD 308",
      "Sheath": "Water-resistant rubber compound, EM2 quality to EN 50363-2-1, black",
      "Rated Voltage": "450/750 V (U0/U)",
      "Immersion Depth": "Up to 100 m in fresh and salt water",
      "Weather Resistance": "Ozone, UV, sunlight and weather resistant",
      "Application": "Submersible motors and pumps — dry, damp, wet and hazardous environments",
    },
    tableSpecsAr: {
      "التصنيف": "H07RN8-F",
      "المعايير": "EN 50525-2-21 · معتمد IEMMEQU <HAR>",
      "الموصل": "نحاس عارٍ، فئة 5 حسب IEC 60228",
      "العزل": "خليط EPR بجودة EI4 حسب EN 50363-1",
      "تمييز الأوردة": "HD 308",
      "الغلاف الخارجي": "خليط مطاطي مقاوم للماء بجودة EM2 حسب EN 50363-2-1، أسود",
      "الجهد المقنن": "450/750 فولت (U0/U)",
      "عمق الغمر": "حتى 100 متر في المياه العذبة والمالحة",
      "مقاومة العوامل الجوية": "مقاوم للأوزون والأشعة فوق البنفسجية وأشعة الشمس والعوامل الجوية",
      "التطبيقات": "المواتير والطلمبات الغاطسة — البيئات الجافة والرطبة والمبتلة والخطرة",
    },
    featuresEn: [
      "H07RN8-F to EN 50525-2-21, IEMMEQU <HAR> approved",
      "Bare copper conductor, class 5 to IEC 60228 for flexibility down the borehole",
      "EPR insulation (EI4) with a water-resistant EM2 rubber sheath",
      "Permanently submersible to 100 m in both fresh and salt water",
      "Ozone, UV, sunlight and weather resistant for the above-ground run",
      "Suitable for dry, damp, wet and hazardous environments, subject to local regulations",
    ],
    featuresAr: [
      "مطابق لمواصفة H07RN8-F حسب EN 50525-2-21 ومعتمد IEMMEQU <HAR>",
      "موصل نحاسي عارٍ من الفئة 5 حسب IEC 60228 لمرونة أعلى داخل البئر",
      "عزل EPR بجودة EI4 مع غلاف مطاطي EM2 مقاوم للماء",
      "قابل للغمر الدائم حتى 100 متر في المياه العذبة والمالحة",
      "مقاوم للأوزون والأشعة فوق البنفسجية وأشعة الشمس والعوامل الجوية للجزء الظاهر فوق سطح الأرض",
      "مناسب للبيئات الجافة والرطبة والمبتلة والخطرة، وفقاً للوائح المحلية",
    ]
  },
  {
    id: "cable-flat-untel",
    category: "cables",
    gallery: [
      "/images/products/cable-flat-untel.png"
    ],
    specs: ["IPX8 Submersible", "450/750V", "3x10-3x120 mm²"],
    modelNo: "H07VVH6-F",
    variants: [
      {
        labelEn: "Cross Section",
        labelAr: "المقطع",
        options: [
          { id: "3x10", name: "3x10 mm²" },
          { id: "3x16", name: "3x16 mm²" },
          { id: "3x25", name: "3x25 mm²" },
          { id: "3x35", name: "3x35 mm²" },
          { id: "3x50", name: "3x50 mm²" },
          { id: "3x70", name: "3x70 mm²" },
          { id: "3x95", name: "3x95 mm²" },
          { id: "3x120", name: "3x120 mm²" },
        ]
      }
    ],
    tableSpecsEn: {
      "Conductor": "Electrolytic annealed, class 5 stranded plain copper (tinned on request)",
      "Insulation": "PVC compound, TI2 type (EN 50363-3)",
      "Sheath": "PVC compound, TM2 type (EN 50363-4-1)",
      "Rated Voltage": "450/750 V (U0/U)",
      "AC Test Voltage": "2 kV",
      "Operating Temperature (Flexing)": "-5°C to +70°C",
      "Operating Temperature (Fixed)": "-30°C to +70°C",
      "Short-Circuit Temperature": "150°C (max. 5 sec)",
      "Water/Submersion Rating": "IPX8 tested by TÜV — submersible up to 10 bar (100 m)",
      "Standards": "EN 50214, IEC 60227-6, VDE 0283-2, EN 50525-1",
    },
    tableSpecsAr: {
      "الموصل": "نحاس مصمت مجدول من الفئة 5 بالتلدين الكهربائي (بطلاء قصدير عند الطلب)",
      "العزل": "خليط PVC نوع TI2 (EN 50363-3)",
      "الغلاف الخارجي": "خليط PVC نوع TM2 (EN 50363-4-1)",
      "الجهد المقنن": "450/750 فولت (U0/U)",
      "جهد اختبار التيار المتردد": "2 كيلوفولت",
      "درجة حرارة التشغيل (مرن)": "-5°م إلى +70°م",
      "درجة حرارة التشغيل (ثابت)": "-30°م إلى +70°م",
      "درجة حرارة القصر الكهربائي": "150°م (5 ثواني كحد أقصى)",
      "مقاومة الغمر بالماء": "معتمد IPX8 من TÜV — يتحمل الغمر حتى 10 بار (100 متر)",
      "المعايير": "EN 50214، IEC 60227-6، VDE 0283-2، EN 50525-1",
    },
    featuresEn: [
      "Flat, space-saving profile for organized routing inside pump control panels and cable trays",
      "IPX8 tested — permanently submersible up to 10 bar (100 m), ideal for wet wells and pump station environments",
      "UV resistant and flame retardant (IEC 60332-1-2)",
      "Rated 450/750V with 2 kV AC test voltage for reliable power and control circuits",
      "Wide operating range: -30°C to +70°C in fixed installation",
      "TÜV Rheinland, TSE, EAC, UKCA & CPR certified",
    ],
    featuresAr: [
      "تصميم مسطح موفر للمساحة لتوصيلات منظمة داخل لوحات تحكم الطلمبات ومجاري الكابلات",
      "معتمد IPX8 — يتحمل الغمر الدائم في الماء حتى 10 بار (100 متر)، مثالي لبيئات الآبار ومحطات الطلمبات الرطبة",
      "مقاوم للأشعة فوق البنفسجية ومثبط للهب (IEC 60332-1-2)",
      "جهد مقنن 450/750 فولت وجهد اختبار 2 كيلوفولت لدوائر طاقة وتحكم موثوقة",
      "نطاق تشغيل واسع: من -30°م إلى +70°م في التركيب الثابت",
      "معتمد من TÜV Rheinland وTSE وEAC وUKCA وCPR",
    ],
    specGroups: [
      {
        title: "3-Core Sizes (3x10 to 3x120)",
        subtitle: "Rated 450/750V · PVC insulated & sheathed · IPX8 submersible",
        columnsEn: ["Cross Section (mm²)", "Overall Diameter (mm)", "Weight (kg/km)", "Min. Bending Radius (mm)", "Max. Conductor Resistance (Ω/km)"],
        columnsAr: ["المقطع (مم²)", "القطر الكلي (مم)", "الوزن (كجم/كم)", "أقصى نصف قطر انحناء (مم)", "أقصى مقاومة للموصل (أوم/كم)"],
        rows: [
          { type: "3x10", values: ["9.50 x 22.50", "507", "48", "1.91"] },
          { type: "3x16", values: ["10.70 x 25.20", "706", "54", "1.21"] },
          { type: "3x25", values: ["13.40 x 32.20", "1084", "80", "0.78"] },
          { type: "3x35", values: ["14.50 x 35.10", "1380", "87", "0.55"] },
          { type: "3x50", values: ["16.90 x 42.20", "1947", "101", "0.554"] },
          { type: "3x70", values: ["18.00 x 46.00", "2532", "108", "0.386"] },
          { type: "3x95", values: ["20.70 x 53.30", "3319", "124", "0.272"] },
          { type: "3x120", values: ["24.40 x 64.50", "4511", "146", "0.206"] },
        ]
      },
    ]
  }
];
