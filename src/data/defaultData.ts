import { BackgroundImage, UploadedReport, GlossaryItem, AuthorProfile, ThoughtItem, TabKey, TabSizeConfig } from '../types';

export const ADMIN_TARGET_EMAIL = 'abhijaycbi@gmail.com';

export const DEFAULT_BACKGROUND_IMAGES: BackgroundImage[] = [
  {
    id: 'bg-1',
    url: 'https://images.unsplash.com/photo-1598890777032-bde835ba27c2?q=80&w=1920&auto=format&fit=crop',
    title: 'ऐतिहासिक गोलघर, पटना (Golghar Heritage, Patna)',
    caption: 'ऐतिहासिक धरोहर एवं सांस्कृतिक केंद्र, आंचलिक कार्यालय पटना परिक्षेत्र',
    addedBy: 'Admin (System)',
    addedAt: '2026-01-01',
    isDefault: true,
  },
  {
    id: 'bg-2',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1920&auto=format&fit=crop',
    title: 'राजभाषा एवं आधुनिक प्रशासनिक परिसर (Rajbhasha Administrative Office)',
    caption: 'संघ की राजभाषा हिंदी के प्रगामी प्रयोग का संकल्प',
    addedBy: 'Admin (System)',
    addedAt: '2026-01-02',
    isDefault: true,
  },
  {
    id: 'bg-3',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1920&auto=format&fit=crop',
    title: 'हिंदी साहित्य एवं भाषा संपदा (Hindi Literature & Heritage Library)',
    caption: 'राजभाषा पुस्तकालय एवं संदर्भ साहित्य संकलन',
    addedBy: 'Admin (System)',
    addedAt: '2026-01-03',
    isDefault: true,
  },
  {
    id: 'bg-4',
    url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1920&auto=format&fit=crop',
    title: 'भारतीय विरासत एवं गंगा तट, पटना (Ganga Ghat Heritage, Patna)',
    caption: 'पवित्र गंगा का विहंगम दृश्य, पाटलिपुत्र की पावन भूमि',
    addedBy: 'Admin (System)',
    addedAt: '2026-01-04',
    isDefault: true,
  },
  {
    id: 'bg-5',
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1920&auto=format&fit=crop',
    title: 'आधिकारिक पत्राचार एवं लेखन (Official Correspondence & Documentation)',
    caption: 'दैनिक कामकाज में सरल और सहज हिंदी का प्रयोग',
    addedBy: 'Admin (System)',
    addedAt: '2026-01-05',
    isDefault: true,
  },
];

export const INITIAL_REPORTS: UploadedReport[] = [];

export const ADMINISTRATIVE_GLOSSARY: GlossaryItem[] = [
  {
    id: 'adm-1',
    english: 'Acknowledgement',
    hindi: 'पावती / अभिस्वीकृति',
    category: 'administrative',
    meaning: 'किसी पत्र, वस्तु अथवा सूचना प्राप्ति का औपचारिक प्रमाण।',
    exampleSentence: 'कृपया इस पत्र की पावती शीघ्र भिजवाने का कष्ट करें।',
  },
  {
    id: 'adm-2',
    english: 'Approval',
    hindi: 'अनुमोदन',
    category: 'administrative',
    meaning: 'उच्चाधिकारी द्वारा किसी प्रस्ताव या कार्य की औपचारिक सहमति।',
    exampleSentence: 'सक्षम प्राधिकारी के अनुमोदन के उपरांत ही व्यय स्वीकृत किया जाएगा।',
  },
  {
    id: 'adm-3',
    english: 'Circular',
    hindi: 'परिपत्र',
    category: 'administrative',
    meaning: 'एक ही सूचना को अनेक कार्यालयों या व्यक्तियों तक पहुंचाने वाला पत्र।',
    exampleSentence: 'मुख्यालय द्वारा जारी नवीन परिपत्र का कड़ाई से अनुपालन सुनिश्चित करें।',
  },
  {
    id: 'adm-4',
    english: 'Compliance',
    hindi: 'अनुपालन',
    category: 'administrative',
    meaning: 'नियमों, निर्देशों अथवा आदेशों के अनुरूप कार्य करना।',
    exampleSentence: 'राजभाषा अधिनियम की धारा 3(3) का शत-प्रतिशत अनुपालन अनिवार्य है।',
  },
  {
    id: 'adm-5',
    english: 'Designation',
    hindi: 'पदनाम',
    category: 'administrative',
    meaning: 'कार्यालय में किसी कर्मचारी या अधिकारी के पद की आधिकारिक उपाधि।',
    exampleSentence: 'प्रपत्र में नाम के साथ अपना पदनाम एवं शाखा का नाम अवश्य लिखें।',
  },
  {
    id: 'adm-6',
    english: 'Expedite',
    hindi: 'शीघ्र निपटाना / गति देना',
    category: 'administrative',
    meaning: 'किसी लंबित कार्य की प्रक्रिया को तीव्र करना।',
    exampleSentence: 'लंबित फाइलों के शीघ्र निपटान हेतु विशेष अभियान चलाया जाए।',
  },
  {
    id: 'adm-7',
    english: 'Notification',
    hindi: 'अधिसूचना',
    category: 'administrative',
    meaning: 'शासकीय गजट में प्रकाशित आधिकारिक वैधानिक सूचना।',
    exampleSentence: 'राजभाषा नियम 10(4) के तहत इस शाखा को अधिसूचित किया गया है।',
  },
  {
    id: 'adm-8',
    english: 'Quarterly Progress Report',
    hindi: 'तिमाही प्रगति रिपोर्ट',
    category: 'administrative',
    meaning: 'प्रत्येक तीन माह पर भेजी जाने वाली कार्य-प्रगति विवरणी।',
    exampleSentence: 'तिमाही प्रगति रिपोर्ट प्रत्येक तिमाही समाप्त होने के 15 दिनों के भीतर प्रस्तुत करें।',
  },
];

export const BANKING_GLOSSARY: GlossaryItem[] = [
  {
    id: 'bnk-1',
    english: 'Account Balance',
    hindi: 'खाता शेष / जमा शेष',
    category: 'banking',
    meaning: 'ग्राहक के खाते में उपलब्ध कुल शुद्ध राशि।',
    exampleSentence: 'ग्राहक अपने मोबाइल ऐप से किसी भी समय खाता शेष की जांच कर सकते हैं।',
  },
  {
    id: 'bnk-2',
    english: 'Collateral Security',
    hindi: 'सम्पार्श्विक प्रतिभूति / गौण प्रतिभूति',
    category: 'banking',
    meaning: 'ऋण की सुरक्षा के लिए मुख्य बंधक के अतिरिक्त दी गई अतिरिक्त परिसंपत्ति।',
    exampleSentence: 'व्यावसायिक ऋण के लिए अचल संपत्ति की संपार्श्विक प्रतिभूति ली गई।',
  },
  {
    id: 'bnk-3',
    english: 'Demand Draft (DD)',
    hindi: 'मांग ड्राफ्ट',
    category: 'banking',
    meaning: 'बैंक द्वारा जारी वित्तीय विपत्र जो मांग पर भुगतेय होता है।',
    exampleSentence: 'निविदा शुल्क के रूप में मांग ड्राफ्ट संलग्न करना आवश्यक है।',
  },
  {
    id: 'bnk-4',
    english: 'Financial Inclusion',
    hindi: 'वित्तीय समावेशन',
    category: 'banking',
    meaning: 'समाज के वंचित एवं कमजोर वर्गों तक सस्ती बैंकिंग सुविधाएं पहुंचाना।',
    exampleSentence: 'प्रधानमंत्री जन-धन योजना वित्तीय समावेशन का उत्कृष्ट उदाहरण है।',
  },
  {
    id: 'bnk-5',
    english: 'Non-Performing Asset (NPA)',
    hindi: 'अनर्जक आस्तियां / निष्पादित न होने वाली परिसंपत्ति',
    category: 'banking',
    meaning: 'ऐसा ऋण खाता जिस पर 90 दिनों से मूलधन अथवा ब्याज का भुगतान न हुआ हो।',
    exampleSentence: 'आंचलिक कार्यालय ने चालू वित्त वर्ष में एनपीए वसूली में उल्लेखनीय सफलता प्राप्त की।',
  },
  {
    id: 'bnk-6',
    english: 'Promissory Note',
    hindi: 'वचन पत्र',
    category: 'banking',
    meaning: 'एक लिखित प्रतिज्ञापत्र जिसमें निश्चित राशि निश्चित व्यक्ति को चुकाने का वचन हो।',
    exampleSentence: 'ऋण स्वीकृति के समय ग्राहक द्वारा विधिवत हस्ताक्षरित वचन पत्र प्राप्त किया गया।',
  },
  {
    id: 'bnk-7',
    english: 'Fixed Deposit (FD)',
    hindi: 'सावधि जमा',
    category: 'banking',
    meaning: 'एक निश्चित समयावधि के लिए बैंक में जमा की गई धनराशि जिस पर उच्च ब्याज मिलता है।',
    exampleSentence: 'वरिष्ठ नागरिकों को सावधि जमा योजनाओं पर अतिरिक्त ब्याज दर दी जाती है।',
  },
  {
    id: 'bnk-8',
    english: 'Know Your Customer (KYC)',
    hindi: 'अपने ग्राहक को जानिए (केवाईसी)',
    category: 'banking',
    meaning: 'ग्राहक की पहचान एवं पते का बैंक द्वारा सत्यापन करने की अनिवार्य प्रक्रिया।',
    exampleSentence: 'खाता सक्रिय बनाए रखने हेतु आवधिक केवाईसी प्रपत्र जमा करना अनिवार्य है।',
  },
];

export const AUTHOR_OF_MONTH: AuthorProfile = {
  name: 'Ramdhari Singh "Dinkar"',
  hindiName: 'राष्ट्रकवि रामधारी सिंह "दिनकर"',
  era: 'आधुनिक काल (छायावादोत्तर एवं प्रगतिवादी युग)',
  birthPlace: 'सिमरिया (मुंगेर/बेगूसराय), बिहार - पटना अंचल',
  famousWorks: [
    'रश्मिरथी (Rashmirathi)',
    'उर्वशी (Urvashi - ज्ञानपीठ पुरस्कार से सम्मानित)',
    'कुरुक्षेत्र (Kurukshetra)',
    'संस्कृति के चार अध्याय (Sanskriti Ke Chaar Adhyay)',
    'हुंकार (Hunkar)',
    'रेणुका (Renuka)',
  ],
  bio: 'राष्ट्रकवि रामधारी सिंह दिनकर हिंदी के मूर्धन्य कवि, निबंधकार और विचारक थे। वे बिहार की पावन धरा से संबंध रखते थे और पटना विश्वविद्यालय एवं बिहार हिंदी समिति से लंबे समय तक जुड़े रहे। उनकी ओजस्वी और राष्ट्रभक्ति पूर्ण कविताओं ने स्वाधीनता संग्राम और स्वतंत्र भारत के नवनिर्माण में जनचेतना का शंखनाद किया।',
  popularQuote: 'जब नाश मनुज पर छाता है, पहले विवेक मर जाता है। सच है विपत्ति जब आती है, कायर को ही दहलाती है, शूरमा नहीं विचलित होते, क्षण एक नहीं धीरज खोते!',
  image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
};

export const THOUGHT_OF_THE_DAY: ThoughtItem = {
  hindi: 'निज भाषा उन्नति अहै, सब उन्नति को मूल। बिन निज भाषा-ज्ञान के, मिटत न हिय को सूल॥',
  english: 'The progress of one’s own mother tongue is the root of all progress; without the knowledge of one’s own language, the pangs of the heart cannot be removed. - भारतेन्दु हरिश्चंद्र',
  author: 'भारतेन्दु हरिश्चंद्र (आधुनिक हिंदी के जनक)',
  date: 'आज का सुविचार',
};

export const DEFAULT_ADMIN_PASSWORD = 'CBI@123';

export interface RegionOption {
  id: string;
  nameHindi: string;
  nameEnglish: string;
  officeType: string;
}

export const AVAILABLE_REGIONS: RegionOption[] = [
  { id: 'patna', nameHindi: 'पटना (Patna)', nameEnglish: 'Patna', officeType: 'क्षेत्रीय कार्यालय पटना' },
  { id: 'muzaffarpur', nameHindi: 'मुजफ्फरपुर (Muzaffarpur)', nameEnglish: 'Muzaffarpur', officeType: 'क्षेत्रीय कार्यालय मुजफ्फरपुर' },
  { id: 'darbhanga', nameHindi: 'दरभंगा (Darbhanga)', nameEnglish: 'Darbhanga', officeType: 'क्षेत्रीय कार्यालय दरभंगा' },
  { id: 'gaya', nameHindi: 'गया (Gaya)', nameEnglish: 'Gaya', officeType: 'क्षेत्रीय कार्यालय गया' },
  { id: 'katihar', nameHindi: 'कटिहार (Katihar)', nameEnglish: 'Katihar', officeType: 'क्षेत्रीय कार्यालय कटिहार' },
  { id: 'purnia', nameHindi: 'पूर्णिया (Purnia)', nameEnglish: 'Purnia', officeType: 'क्षेत्रीय कार्यालय पूर्णिया' },
  { id: 'siwan', nameHindi: 'सीवान (Siwan)', nameEnglish: 'Siwan', officeType: 'क्षेत्रीय कार्यालय सीवान' },
  { id: 'ranchi', nameHindi: 'रांची (Ranchi)', nameEnglish: 'Ranchi', officeType: 'क्षेत्रीय कार्यालय रांची' },
  { id: 'dhanbad', nameHindi: 'धनबाद (Dhanbad)', nameEnglish: 'Dhanbad', officeType: 'क्षेत्रीय कार्यालय धनबाद' },
  { id: 'motihari', nameHindi: 'मोतिहारी (Motihari)', nameEnglish: 'Motihari', officeType: 'क्षेत्रीय कार्यालय मोतिहारी' },
];

export const DEFAULT_TAB_VISIBILITY = {
  home: true,
  monthly_report: true,
  quarterly_report: true,
  emagazine: true,
  olic: true,
  rv_format: true,
  annual_programme: true,
  mis_portal: true,
  hindi_workshop: true,
  tolic: true,
  circulars: true,
  author_of_month: true,
  admin_glossary: true,
  banking_glossary: true,
  thought_of_day: true,
};

export const DEFAULT_TAB_ORDER: TabKey[] = [
  'home',
  'monthly_report',
  'quarterly_report',
  'emagazine',
  'olic',
  'rv_format',
  'annual_programme',
  'mis_portal',
  'hindi_workshop',
  'tolic',
  'circulars',
  'author_of_month',
  'admin_glossary',
  'banking_glossary',
  'thought_of_day',
];

export const DEFAULT_TAB_SIZES: TabSizeConfig = {
  home: 'normal',
  monthly_report: 'normal',
  quarterly_report: 'normal',
  emagazine: 'normal',
  olic: 'normal',
  rv_format: 'normal',
  annual_programme: 'normal',
  mis_portal: 'normal',
  hindi_workshop: 'normal',
  tolic: 'normal',
  circulars: 'normal',
  author_of_month: 'normal',
  admin_glossary: 'normal',
  banking_glossary: 'normal',
  thought_of_day: 'normal',
};

export const DEFAULT_USERS = [
  {
    id: 'user-admin',
    name: 'अभिजाय कुमार (मुख्य प्रबंधक / प्रशासक)',
    email: 'admin@rajbhasha.in',
    username: 'admin',
    linkedDriveEmail: ADMIN_TARGET_EMAIL,
    role: 'admin' as const,
    region: 'patna',
    regionHindi: 'आंचलिक कार्यालय पटना',
    password: DEFAULT_ADMIN_PASSWORD,
    department: 'राजभाषा विभाग, आंचलिक कार्यालय पटना',
    designation: 'मुख्य प्रबंधक (राजभाषा) / प्रशासक',
  },
];
