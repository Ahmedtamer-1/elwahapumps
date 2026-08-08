export interface ProductVariant {
  id: string;
  name: string;
}

export interface ProductVariantGroup {
  labelEn: string;
  labelAr: string;
  options: ProductVariant[];
}

export interface ProductModelRow {
  model: string;
  flow: string;
  head: string;
  motor: string;
  outlet: string;
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
  category: "motors" | "pumps" | "electrical" | "pipes" | "spare-parts" | "cables";
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
    modelNo: "KP - KPS",
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
      "NEMA-standard motor coupling",
      "Wear-resistant, water-lubricated bearings",
      "Suitable for both horizontal and vertical installation",
    ],
    featuresAr: [
      "أداء طويل الأمد وموثوق",
      "كفاءة هيدروليكية عالية",
      "سهولة الصيانة وتركيب عملي",
      "وصلة موتور متوافقة مع معايير NEMA",
      "محامل مقاومة للتآكل ومزلقة بالماء",
      "تصميم مناسب للتركيب الأفقي والرأسي",
    ],
    modelGroups: [
      {
        diameter: "4\"",
        flowRange: "5-25 m³/h",
        rows: [
          { model: "KP 405/10", flow: "8", head: "65", motor: "1.5", outlet: "2\"" },
          { model: "KP 405/14", flow: "8", head: "92", motor: "2.2", outlet: "2\"" },
          { model: "KP 405/20", flow: "8", head: "130", motor: "3", outlet: "2\"" },
          { model: "KP 410/08", flow: "15", head: "52", motor: "2.2", outlet: "2\"" },
          { model: "KP 410/12", flow: "15", head: "78", motor: "3", outlet: "2\"" },
          { model: "KP 410/16", flow: "15", head: "104", motor: "4", outlet: "2\"" },
        ]
      },
      {
        diameter: "6\"",
        flowRange: "20-80 m³/h",
        rows: [
          { model: "KP 625/05", flow: "25", head: "60", motor: "5.5", outlet: "3\"" },
          { model: "KP 625/08", flow: "25", head: "96", motor: "7.5", outlet: "3\"" },
          { model: "KP 625/12", flow: "25", head: "144", motor: "11", outlet: "3\"" },
          { model: "KP 640/04", flow: "40", head: "52", motor: "7.5", outlet: "3\"" },
          { model: "KP 640/07", flow: "40", head: "91", motor: "11", outlet: "3\"" },
          { model: "KP 660/03", flow: "60", head: "42", motor: "9.2", outlet: "4\"" },
          { model: "KP 660/05", flow: "60", head: "70", motor: "15", outlet: "4\"" },
        ]
      },
      {
        diameter: "8\"",
        flowRange: "80-180 m³/h",
        rows: [
          { model: "KP 8100/02", flow: "100", head: "45", motor: "18.5", outlet: "5\"" },
          { model: "KP 8100/04", flow: "100", head: "90", motor: "37", outlet: "5\"" },
          { model: "KP 8125/03", flow: "125", head: "75", motor: "37", outlet: "5\"" },
          { model: "KP 8160/02", flow: "160", head: "55", motor: "37", outlet: "5\"" },
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
      "NEMA-standard motor coupling",
      "Wear-resistant, water-lubricated bearings",
      "Suitable for both horizontal and vertical installation",
    ],
    featuresAr: [
      "أداء طويل الأمد",
      "كفاءة هيدروليكية عالية",
      "وصلة موتور متوافقة مع معايير NEMA",
      "محامل مقاومة للتآكل ومزلقة بالماء",
      "تصميم مناسب للتركيب الأفقي والرأسي",
    ],
    modelGroups: [
      {
        diameter: "6\"",
        flowRange: "20-60 m³/h",
        rows: [
          { model: "KSX 620/05", flow: "20", head: "65", motor: "5.5", outlet: "3\"" },
          { model: "KSX 620/10", flow: "20", head: "130", motor: "11", outlet: "3\"" },
          { model: "KSX 640/04", flow: "40", head: "55", motor: "7.5", outlet: "3\"" },
          { model: "KSX 640/08", flow: "40", head: "110", motor: "15", outlet: "3\"" },
          { model: "KSX 660/03", flow: "60", head: "45", motor: "9.2", outlet: "4\"" },
          { model: "KSX 660/06", flow: "60", head: "90", motor: "18.5", outlet: "4\"" },
        ]
      },
      {
        diameter: "8\"",
        flowRange: "60-150 m³/h",
        rows: [
          { model: "KSX 8080/03", flow: "80", head: "55", motor: "18.5", outlet: "5\"" },
          { model: "KSX 8080/06", flow: "80", head: "110", motor: "37", outlet: "5\"" },
          { model: "KSX 8120/02", flow: "120", head: "40", motor: "18.5", outlet: "5\"" },
          { model: "KSX 8120/04", flow: "120", head: "80", motor: "37", outlet: "5\"" },
          { model: "KSX 8150/02", flow: "150", head: "35", motor: "22", outlet: "5\"" },
          { model: "KSX 8150/04", flow: "150", head: "70", motor: "45", outlet: "5\"" },
        ]
      },
      {
        diameter: "10\"",
        flowRange: "150-300 m³/h",
        rows: [
          { model: "KSX 10200/02", flow: "200", head: "45", motor: "37", outlet: "6\"" },
          { model: "KSX 10200/04", flow: "200", head: "90", motor: "75", outlet: "6\"" },
          { model: "KSX 10300/02", flow: "300", head: "38", motor: "45", outlet: "6\"" },
          { model: "KSX 10300/03", flow: "300", head: "57", motor: "55", outlet: "6\"" },
        ]
      },
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
    id: "motor-hitemp",
    category: "motors",
    gallery: [
      "/images/products/motor-kurlar.png"
    ],
    specs: ["HI-TEMP 90°C", "IP68", "Water-Cooled"],
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
      "Max Operating Temperature": "90°C",
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
      "أقصى درجة حرارة تشغيل": "90°م",
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
      "Traceability": "Lead-free certified compound, batch-coded couplers",
    },
    tableSpecsAr: {
      "المادة": "يو بي في سي خالٍ من الرصاص (خليط خالٍ من المعادن الثقيلة)",
      "نطاق المقاسات": "من 1 بوصة (25 مم) إلى 6 بوصة (165 مم)",
      "فئات الضغط": "V4 ECO، متوسط، قياسي، فائق التحمل",
      "نظام التوصيل": "وصلة ذات سن مربع مع حلقة إحكام EPDM",
      "نظام القفل": "مسامير استانلس ستيل مزدوجة + حلقة مطاطية ماصة للصدمات",
      "اختبارات الجودة": "اختبار مقياس السن بالتحكم الرقمي CNC، واختبار حمل الكسر النهائي (UBL)، واختبار تسريب الوصلات تحت الضغط العالي",
      "إمكانية التتبع": "خليط معتمد خالٍ من الرصاص، وصلات مرمزة بالدفعة للتتبع الكامل",
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
    id: "cable-submersible",
    category: "cables",
    gallery: [
      "/images/products/cable-untel.png",
      "/images/products/pmc-winding-wire.png"
    ],
    specs: ["PVC Insulated", "Water Resistant", "Copper Conductor"],
    variants: [
      {
        labelEn: "Cross Section",
        labelAr: "المقطع",
        options: [
          { id: "4mm", name: "4 mm²" },
          { id: "6mm", name: "6 mm²" },
          { id: "10mm", name: "10 mm²" },
        ]
      }
    ],
    tableSpecsEn: {
      "Conductor": "Stranded Copper",
      "Insulation": "Water-resistant PVC",
      "Application": "Submersible motor power feed",
    },
    tableSpecsAr: {
      "الموصل": "نحاس مجدول",
      "العزل": "بي في سي مقاوم للماء",
      "التطبيقات": "تغذية كهربائية للمواتير الغاطسة",
    }
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
