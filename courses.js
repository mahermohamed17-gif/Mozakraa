// مواد الترم الأول. الـ id بالإنجليزي وممنوع يتغير بعد ما ترفع ملفات.
// الفرق والترمات. year = رقم الفرقة (1 إلى 4)، term = رقم الترم (1 أو 2).
self.YEARS = [
  {n:1, name:"الفرقة الأولى",  icon:"🌱", a:"#0c9a52", b:"#073d24"},
  {n:2, name:"الفرقة الثانية", icon:"🌿", a:"#2f7bd9", b:"#0b1727"},
  {n:3, name:"الفرقة الثالثة", icon:"🌳", a:"#e8590c", b:"#3a1a0a"},
  {n:4, name:"الفرقة الرابعة", icon:"🎓", a:"#7c5cff", b:"#1d1440"}
];
self.TERMS = [
  {n:1, name:"الترم الأول",  icon:"📘"},
  {n:2, name:"الترم الثاني", icon:"📗"}
];
// المواد: انسخ سطر وغيّر الاسم والـ id (بالإنجليزي، وما يتغيرش بعد ما ترفع ملفات عليه).
self.COURSES = [
  {year:1, term:1, id:"general-botany", name:"نبات زراعي عام", icon:"🌱", a:"#0c9a52", b:"#075a30"},
  {year:1, term:1, id:"mathematics", name:"رياضيات", icon:"➗", a:"#e8590c", b:"#3a1a0a"},
  {year:1, term:1, id:"agri-animal", name:"حيوان زراعي", icon:"🐄", a:"#d99a1f", b:"#3b2c0b"},
  {year:1, term:1, id:"rural-sociology", name:"أساسيات الاجتماع والمجتمع الريفي", icon:"🏘️", a:"#7c5cff", b:"#1d1440"},
  {year:1, term:1, id:"physics-meteorology", name:"فيزياء وأرصاد جوية", icon:"🌦️", a:"#e0457b", b:"#3a0f2c"},
  {year:1, term:1, id:"inorganic-analytical-chem", name:"كيمياء غير عضوية وتحليلية", icon:"⚗️", a:"#2f7bd9", b:"#0b1727"},
  {year:1, term:2, id:"general-economics", name:"مبادئ اقتصاد عام", icon:"📈", a:"#0c9a52", b:"#075a30"},
  {year:1, term:2, id:"animal-poultry-basics", name:"أساسيات الإنتاج الحيواني والداجني", icon:"🐔", a:"#e8590c", b:"#3a1a0a"},
  {year:1, term:2, id:"entomology", name:"حشرات", icon:"🐛", a:"#d99a1f", b:"#3b2c0b"},
  {year:1, term:2, id:"organic-chem", name:"كيمياء عضوية", icon:"🧪", a:"#7c5cff", b:"#1d1440"},
  {year:1, term:2, id:"surveying", name:"مساحة", icon:"📐", a:"#e0457b", b:"#3a0f2c"},
  {year:1, term:2, id:"agri-statistics", name:"مبادئ الإحصاء الزراعي", icon:"📊", a:"#2f7bd9", b:"#0b1727"},
  {year:1, term:2, id:"english", name:"لغة إنجليزية", icon:"🔤", a:"#a9c23b", b:"#26300b"},
  {year:2, term:1, id:"agri-biochemistry", name:"كيمياء حيوية زراعية", icon:"🧫", a:"#0c9a52", b:"#075a30"},
  {year:2, term:1, id:"horticulture-basics", name:"أساسيات بساتين", icon:"🍎", a:"#e8590c", b:"#3a1a0a"},
  {year:2, term:1, id:"animal-husbandry", name:"رعاية وتربية حيوان", icon:"🐑", a:"#d99a1f", b:"#3b2c0b"},
  {year:2, term:1, id:"crops-basics", name:"أساسيات محاصيل", icon:"🌾", a:"#7c5cff", b:"#1d1440"},
  {year:2, term:1, id:"general-microbiology", name:"ميكروبيولوجيا عامة", icon:"🦠", a:"#e0457b", b:"#3a0f2c"},
  {year:2, term:1, id:"agri-engineering-basics", name:"أساسيات الهندسة الزراعية (قوى وآلات وري وصرف)", icon:"🚜", a:"#2f7bd9", b:"#0b1727"},
  {year:2, term:2, id:"soil-science-basics", name:"أساسيات علم الأراضي", icon:"🪨", a:"#0c9a52", b:"#075a30"},
  {year:2, term:2, id:"animal-poultry-nutrition", name:"تغذية حيوان ودواجن", icon:"🥣", a:"#e8590c", b:"#3a1a0a"},
  {year:2, term:2, id:"plant-breeding-basics", name:"أساسيات تربية النبات", icon:"🧬", a:"#d99a1f", b:"#3b2c0b"},
  {year:2, term:2, id:"plant-physiology", name:"فسيولوجيا النبات", icon:"🍃", a:"#7c5cff", b:"#1d1440"},
  {year:2, term:2, id:"genetics-basics", name:"أساسيات علم الوراثة", icon:"🧬", a:"#e0457b", b:"#3a0f2c"},
  {year:2, term:2, id:"dairy-technology", name:"أساسيات علوم وتكنولوجيا الألبان", icon:"🥛", a:"#2f7bd9", b:"#0b1727"},
  {year:2, term:2, id:"computer-1", name:"حاسب آلي 1", icon:"💻", a:"#a9c23b", b:"#26300b"},
  {year:3, term:1, id:"plant-nutrition", name:"تغذية نبات", icon:"🌱", a:"#0c9a52", b:"#075a30"},
  {year:3, term:1, id:"vegetable-production", name:"إنتاج خضر", icon:"🥕", a:"#e8590c", b:"#3a1a0a"},
  {year:3, term:1, id:"field-crops", name:"إنتاج المحاصيل الحقلية", icon:"🌾", a:"#d99a1f", b:"#3b2c0b"},
  {year:3, term:1, id:"biotechnology", name:"تكنولوجيا حيوية", icon:"🧬", a:"#7c5cff", b:"#1d1440"},
  {year:3, term:1, id:"cell-biology", name:"بيولوجيا الخلية", icon:"🔬", a:"#e0457b", b:"#3a0f2c"},
  {year:3, term:1, id:"irrigation-drainage", name:"هندسة الري والصرف", icon:"💧", a:"#2f7bd9", b:"#0b1727"},
  {year:3, term:1, id:"crop-intensification", name:"تكثيف وتحميل المحاصيل", icon:"🌽", a:"#a9c23b", b:"#26300b"},
  {year:3, term:1, id:"economic-plants", name:"النبات الاقتصادي", icon:"🌿", a:"#2ee6d6", b:"#0a2a2a"},
  {year:3, term:1, id:"egypt-soils", name:"أراضي جمهورية مصر العربية", icon:"🏜️", a:"#a9673b", b:"#3b2a20"},
  {year:3, term:2, id:"ornamental-plants", name:"نباتات الزينة وتنسيق الحدائق", icon:"🌷", a:"#0c9a52", b:"#075a30"},
  {year:3, term:2, id:"plant-pathology", name:"أمراض نبات عام", icon:"🍂", a:"#e8590c", b:"#3a1a0a"},
  {year:3, term:2, id:"food-industries-tech", name:"تكنولوجيا الصناعات الغذائية", icon:"🏭", a:"#d99a1f", b:"#3b2c0b"},
  {year:3, term:2, id:"pesticides", name:"مبيدات الآفات", icon:"🧴", a:"#7c5cff", b:"#1d1440"},
  {year:4, term:1, id:"food-quality-control", name:"مراقبة جودة علوم الأغذية", icon:"✅", a:"#0c9a52", b:"#075a30"},
  {year:4, term:1, id:"poultry-production", name:"إنتاج دواجن", icon:"🐓", a:"#e8590c", b:"#3a1a0a"},
  {year:4, term:1, id:"agri-marketing", name:"تسويق زراعي", icon:"🛒", a:"#d99a1f", b:"#3b2c0b"},
  {year:4, term:2, id:"land-reclamation", name:"استصلاح أراضي", icon:"🏜️", a:"#0c9a52", b:"#075a30"},
  {year:4, term:2, id:"agri-extension", name:"إرشاد زراعي", icon:"📣", a:"#e8590c", b:"#3a1a0a"},
  {year:4, term:2, id:"fruit-production", name:"إنتاج فاكهة", icon:"🍇", a:"#d99a1f", b:"#3b2c0b"},
  {year:4, term:2, id:"nano-agriculture", name:"استخدام النانو تكنولوجي في المجال الزراعي", icon:"🔬", a:"#7c5cff", b:"#1d1440"}
];
self.KINDS = {
  section: {one:"سكشن",  many:"سكاشن",  icon:"🧪"},
  lecture: {one:"محاضرة", many:"محاضرات", icon:"🎓"}
};
