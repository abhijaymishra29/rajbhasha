import React, { useState } from 'react';
import {
  BookOpen,
  Download,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Bookmark,
  Printer,
  FileText,
  Sparkles,
  Share2,
  Check,
  Upload,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X
} from 'lucide-react';
import { AuthUser } from '../types';

interface MagazineArticle {
  id: string;
  pageNumber: number;
  category: string;
  title: string;
  subtitle?: string;
  author: string;
  authorDesignation: string;
  authorBranch?: string;
  content: string[];
  quote?: string;
  highlightBox?: string;
  poems?: { title: string; lines: string[]; poet: string; designation: string }[];
}

interface MagazineIssue {
  id: string;
  issueNumber: string;
  monthYear: string;
  theme: string;
  description: string;
  coverTitle: string;
  coverSubtitle: string;
  editorialBoard: {
    patron: string;
    chiefEditor: string;
    editor: string;
    subEditors: string[];
  };
  articles: MagazineArticle[];
  fileName?: string;
  fileDataUrl?: string;
}

export const PRESET_MAGAZINE_ISSUES: MagazineIssue[] = [
  {
    id: 'issue-42',
    issueNumber: 'अंक 42',
    monthYear: 'जून 2026',
    theme: 'डिजिटल बैंकिंग एवं कृत्रिम बुद्धिमत्ता (AI) में हिंदी',
    description: 'बैंक के अधिकारियों, कर्मचारियों एवं परिजनों की मौलिक साहित्यिक, सांस्कृतिक एवं बैंकिंग रचनाओं का त्रैमासिक संकलन।',
    coverTitle: 'पाटलिपुत्र सौरभ',
    coverSubtitle: 'आंचलिक कार्यालय, पटना की त्रैमासिक ई-गृहपत्रिका',
    editorialBoard: {
      patron: 'श्री अरविन्द कुमार (महाप्रबंधक एवं आंचलिक प्रमुख)',
      chiefEditor: 'श्री अभिजाय कुमार (मुख्य प्रबंधक - राजभाषा)',
      editor: 'सुश्री प्रियंका कुमारी (प्रबंधक - राजभाषा)',
      subEditors: ['श्री सुमित सिन्हा (वरिष्ठ प्रबंधक)', 'श्रीमती रश्मि वर्मा (सहायक प्रबंधक)']
    },
    articles: [
      {
        id: 'p1',
        pageNumber: 1,
        category: 'मुखपृष्ठ (Cover Page)',
        title: 'पाटलिपुत्र सौरभ - अंक 42 (जून 2026)',
        subtitle: 'विशेषांक: डिजिटल एवं एआई बैंकिंग में राजभाषा का उत्कर्ष',
        author: 'संपादकीय मंडल',
        authorDesignation: 'राजभाषा विभाग, आंचलिक कार्यालय पटना',
        content: [
          'सेन्ट्रल बैंक ऑफ़ इण्डिया, आंचलिक कार्यालय पटना द्वारा प्रकाशित गौरवमयी त्रैमासिक ई-गृहपत्रिका "पाटलिपुत्र सौरभ" के 42वें अंक में आप सभी सुधी पाठकों का हार्दिक अभिनंदन है।',
          'यह अंक विशेष रूप से समकालीन बैंकिंग परिदृश्य में डिजिटल नवाचारों, मोबाइल बैंकिंग (Cent Mobile), एआई-संचालित ग्राहक सेवाओं और उनमें राष्ट्रभाषा हिंदी के सहज, सुलभ और सशक्त उपयोग को समर्पित है।',
          'इस अंक में आंचलिक प्रमुख का संदेश, बैंकिंग विशेषज्ञ आलेख, प्रेरणादायी लघुकथाएं, स्वरचित कविताएं एवं बिहार राज्य में सेन्ट्रल बैंक की राजभाषा उपलब्धियों का सचित्र विवरण संकलित है।'
        ],
        quote: 'निज भाषा उन्नति अहै, सब उन्नति को मूल। बिन निज भाषा-ज्ञान के, मिटत न हिय को सूल॥ — भारतेन्दु हरिश्चंद्र'
      },
      {
        id: 'p2',
        pageNumber: 2,
        category: 'आंचलिक प्रमुख का संदेश (Editorial Message)',
        title: 'संपादकीय संदेश: तकनीक और संवेदना का संगम है राजभाषा',
        subtitle: 'आंचलिक प्रमुख की कलम से',
        author: 'श्री अरविन्द कुमार',
        authorDesignation: 'महाप्रबंधक एवं आंचलिक प्रमुख, सेन्ट्रल बैंक ऑफ़ इण्डिया, पटना',
        content: [
          'मुझे यह जानकर अत्यंत प्रसन्नता हो रही है कि आंचलिक कार्यालय पटना के राजभाषा विभाग द्वारा ई-गृहपत्रिका "पाटलिपुत्र सौरभ" का 42वाँ अंक डिजिटल प्रारूप में प्रकाशित किया जा रहा है।',
          'बैंकिंग उद्योग आज तीव्र गति से डिजिटलीकरण और स्वचालित तकनीकों की ओर अग्रसर है। हमारे बैंक का ध्येय वाक्य "1911 से आपके लिए केंद्रित" केवल एक नारा नहीं, बल्कि करोड़ों ग्राहकों के विश्वास का आधार है। बिहार के कोने-कोने में स्थित हमारी शाखाओं में जब कोई किसान, व्यापारी, छात्र या वरिष्ठ नागरिक अपनी मातृभाषा में सहजता से लेन-देन करता है, तो वित्तीय समावेशन का वास्तविक उद्देश्य सफल होता है।',
          'आंचलिक कार्यालय पटना के अंतर्गत सभी क्षेत्रीय कार्यालयों (पटना, दरभंगा, गया, मुजफ्फरपुर, मोतिहारी आदि) ने गृह मंत्रालय द्वारा निर्धारित वार्षिक लक्ष्यों को प्राप्त करने में सराहनीय प्रगति की है। फाइलों पर 75% से अधिक हिंदी टिप्पणियां और धारा 3(3) का शत-प्रतिशत अनुपालन हमारी प्रतिबद्धता का परिचायक है।',
          'मैं इस पत्रिका के सफल संपादन हेतु संपादकीय मंडल को साधुवाद देता हूँ और सभी पाठकों से आह्वान करता हूँ कि वे दैनिक बैंकिंग कार्यों में हिंदी को अपनी स्वाभाविक कार्यसंस्कृति बनाएं।'
        ],
        highlightBox: 'संकल्प: "हर डिजिटल स्क्रीन पर हिंदी, हर शाखा काउंटर पर अपनी भाषा में आत्मीय सेवा!"'
      },
      {
        id: 'p3',
        pageNumber: 3,
        category: 'मुख्य आलेख (Lead Article)',
        title: 'डिजिटल बैंकिंग एवं कृत्रिम बुद्धिमत्ता (AI) में हिंदी: अवसर और दिशा',
        subtitle: 'समकालीन वित्तीय परिप्रेक्ष्य में राजभाषा का तकनीकी विस्तार',
        author: 'श्री अभिजाय कुमार',
        authorDesignation: 'मुख्य प्रबंधक (राजभाषा), आंचलिक कार्यालय पटना',
        content: [
          'बीसवीं सदी में जहां बैंकिंग केवल कागजी बही-खातों और पासबुकों तक सीमित थी, वहीं इक्कीसवीं सदी का तीसरा दशक कृत्रिम बुद्धिमत्ता (Artificial Intelligence), मशीन लर्निंग और वॉयस-आधारित बॉट्स (Voice Banking) का युग है। ऐसे तकनीकी परिवेश में अक्सर यह भ्रम पैदा किया जाता है कि अत्याधुनिक तकनीक केवल अंग्रेजी में ही संभव है। किंतु भारतीय बैंकिंग के यथार्थ ने इस मिथक को पूरी तरह तोड़ दिया है।',
          'आज सेन्ट्रल बैंक ऑफ़ इण्डिया का मोबाइल ऐप (Cent Mobile) और इंटरनेट बैंकिंग पोर्टल पूर्णतः द्विभाषी हैं। ग्राहक अपनी सुविधानुसार एक क्लिक में हिंदी भाषा का चयन कर सकते हैं। एटीएम मशीनों पर हिंदी भाषा का विकल्प ग्रामीण एवं अर्ध-शहरी ग्राहकों के लिए वरदान साबित हुआ है।',
          'एआई-आधारित चैटबॉट्स अब प्राकृतिक भाषा प्रसंस्करण (NLP) के माध्यम से शुद्ध और व्यावहारिक हिंदी में ग्राहकों की शंकाओं का त्वरित समाधान कर रहे हैं। चाहे खाता शेष जानना हो, सावधि जमा (FD) खोलना हो या ऋण पात्रता जांचना—सब कुछ हिंदी में संभव है।'
        ],
        highlightBox: 'तथ्य: भारत में इंटरनेट का उपयोग करने वाले 70% से अधिक नए उपयोक्ता अपनी क्षेत्रीय अथवा राष्ट्रीय भाषा में डिजिटल सेवाएं पसंद करते हैं।'
      },
      {
        id: 'p4',
        pageNumber: 4,
        category: 'ग्राहक सेवा स्तंभ (Customer Service Column)',
        title: 'बैंकिंग में संवाद की सरलता: ग्राहक संतुष्टि की कुंजी',
        subtitle: 'शाखा स्तर पर व्यावहारिक अनुभव',
        author: 'श्रीमती रश्मि वर्मा',
        authorDesignation: 'सहायक प्रबंधक, क्षेत्रीय कार्यालय मुजफ्फरपुर',
        content: [
          'बैंक केवल धन के लेन-देन का केंद्र नहीं है, बल्कि यह मानवीय संबंधों और परस्पर विश्वास का एक संवेदनशील ताना-बाना है। शाखा के पटल (Counter) पर खड़ा ग्राहक जब अपनी भाषा में सवाल पूछता है और बैंक कर्मी उसी आत्मीयता से हिंदी में उत्तर देता है, तो ग्राहक के मन में संस्था के प्रति सुरक्षा की भावना कई गुना बढ़ जाती है।',
          'अक्सर देखा गया है कि जटिल वित्तीय शब्दावली (जैसे Moratorium, Amortization, Foreclosure) को यदि सीधे अंग्रेजी में बोल दिया जाए तो साधारण ग्राहक असमंजस में पड़ जाता है। परंतु जब हम उसे "ऋण अधिस्थगन", "क्रमिक चुकता" या "ऋण पूर्व-समाप्ति" को सरल भाषा में समझाते हैं, तो वह सशक्त महसूस करता है।',
          'राजभाषा नीति का मूल संदेश भी यही है—भाषा ऐसी हो जो जन-जन को जोड़े, न कि भयभीत करे।'
        ],
        quote: 'भाषा वही सार्थक है जो हृदय से निकले और दूसरे के हृदय तक निर्बाध पहुंचे।'
      },
      {
        id: 'p5',
        pageNumber: 5,
        category: 'काव्य सौरभ (Poetry Section)',
        title: 'काव्य सौरभ: राष्ट्रभाषा एवं कर्मयोगी बैंकर',
        subtitle: 'हमारे बैंक कर्मियों की स्वरचित काव्य रचनाएं',
        author: 'विविध रचनाकार (CBI परिवार)',
        authorDesignation: 'आंचलिक कार्यालय पटना एवं शाखाएं',
        content: [
          'साहित्य और कविता जीवन को सरस बनाती है। दिनभर आंकड़ों और लेजरों के बीच व्यस्त रहने वाले हमारे बैंकर साथी जब लेखनी उठाते हैं, तो सुंदर भाव प्रस्फुटित होते हैं:'
        ],
        poems: [
          {
            title: 'मेरी हिंदी, मेरी पहचान',
            poet: 'श्री राजेश रंजन (वरिष्ठ प्रबंधक, कंकड़बाग शाखा पटना)',
            designation: 'वरिष्ठ प्रबंधक',
            lines: [
              'गंगा की अविरल धारा सी, पावन जिसकी वाणी है,',
              'पूरब से पश्चिम तक गूंजे, भारत की कल्याणी है।',
              'आंकड़ों के इस महासमर में, जब कलम हमारी चलती है,',
              'हिंदी के दो मीठे बोलों से, हर मुश्किल आसान निकलती है।',
              'बैंक हमारा मंदिर जैसा, ग्राहक देव हमारे हैं,',
              'निज भाषा में सेवा देकर, हमने स्वप्न संवारे हैं।'
            ]
          },
          {
            title: 'कर्मयोगी बैंकर',
            poet: 'सुश्री स्नेहा कुमारी (लिपिक, हाजीपुर शाखा)',
            designation: 'ग्राहक सेवा सहायक',
            lines: [
              'सुबह की पहली किरण संग, जो पटल पर मुस्कराए,',
              'किसान हो या व्यापारी, सबको गले लगाए।',
              'धन का हिसाब रखते-रखते, जो अपनापन भी बांटे,',
              'हिंदी की छांव तले जिसने, सेवा के पथ तराशे।'
            ]
          }
        ]
      },
      {
        id: 'p6',
        pageNumber: 6,
        category: 'लघुकथा (Short Story)',
        title: 'प्रेरक प्रसंग: विश्वास की पासबुक',
        subtitle: 'एक ग्रामीण शाखा का सच्चा संस्मरण',
        author: 'श्री आलोक नाथ झा',
        authorDesignation: 'शाखा प्रबंधक, सेन्ट्रल बैंक ऑफ़ इण्डिया, बिहटा',
        content: [
          'दरवाजे पर एक वृद्ध किसान, रामेश्वर काका, झिझकते हुए खड़े थे। हाथ में एक मुड़ा-तुड़ा आवेदन पत्र था जो अंग्रेजी में छपा था। वे चश्मे के ऊपर से बार-बार पन्नों को उलट रहे थे परंतु कुछ समझ नहीं पा रहे थे।',
          'मैंने उन्हें देखा और तुरंत केबिन में बुलाकर पानी पिलाया। जब मैंने भोजपुरी और सहज हिंदी में पूछा, "काका, का परेशानी बा? हमके बताईं", तो उनके चेहरे पर तैर रही घबराहट अचानक एक संतोषजनक मुस्कान में बदल गई।',
          'काका को अपनी पोती की पढ़ाई के लिए किसान क्रेडिट कार्ड (KCC) नवीनीकरण कराना था। हमने तुरंत उन्हें हमारी शाखा में उपलब्ध द्विभाषी हिंदी प्रपत्र दिया। उन्होंने स्वयं हिंदी में अपने हस्ताक्षर किए और कहा—"बाबू, जब अपनी भाषा में काम होता है तो लगता है कि यह बैंक सचमुच हमारा है।"',
          'उस दिन मुझे समझ आया कि राजभाषा का अनुपालन केवल कानूनी नियम नहीं, बल्कि अंतिम व्यक्ति तक न्याय और सम्मान पहुंचाने का साधन है।'
        ],
        quote: 'सम्मान वही है जो समझ में आए; भाषा वही है जो अपनत्व जगाए।'
      },
      {
        id: 'p7',
        pageNumber: 7,
        category: 'आंचलिक गतिविधियां (Zonal Activities)',
        title: 'आंचलिक कार्यालय पटना: राजभाषा गतिविधियां एवं कार्यशाला रिपोर्ट',
        subtitle: 'त्रैमासिक प्रगति एवं विशेष आयोजन',
        author: 'राजभाषा प्रकोष्ठ',
        authorDesignation: 'आंचलिक कार्यालय पटना',
        content: [
          '१. हिंदी कार्यशाला का भव्य आयोजन: विगत तिमाही में आंचलिक कार्यालय में तीन दिवसीय विशेष हिंदी कार्यशाला का आयोजन किया गया, जिसमें 45 शाखाओं के शाखा प्रबंधकों एवं राजभाषा प्रभारियों ने भाग लिया। कार्यशाला में यूनिकोड हिंदी टंकण और फाइलों पर प्रभावी टिप्पणी लेखन का व्यावहारिक प्रशिक्षण दिया गया।',
          '२. राजभाषा पखवाड़ा एवं हिंदी दिवस समारोह: 14 सितम्बर के उपलक्ष्य में आंचलिक स्तर पर निबंध, तात्कालिक भाषण, हिंदी आशुभाषण और बैंकिंग शब्दावली प्रतियोगिताओं का आयोजन किया गया। 60 से अधिक विजेताओं को आंचलिक प्रमुख द्वारा पुरस्कृत किया गया।',
          '३. धारा 3(3) का शत्-प्रतिशत अनुपालन: अंचल की समस्त शाखाओं द्वारा जारी सामान्य आदेश, परिपत्र एवं निविदाएं अनिवार्यतः द्विभाषी रूप में जारी की जा रही हैं।',
          '४. नगर राजभाषा कार्यान्वयन समिति (नराकास) में सक्रिय सहभागिता: पटना नराकास की अर्धवार्षिक बैठक में सेन्ट्रल बैंक ऑफ़ इण्डिया को उत्कृष्ट राजभाषा निष्पादन हेतु प्रशस्ति पत्र प्रदान किया गया।'
        ],
        highlightBox: 'उपलब्धि: आंचलिक कार्यालय पटना की वेबसाइट एवं ई-पत्राचार में 100% द्विभाषी मानक स्थापित।'
      },
      {
        id: 'p8',
        pageNumber: 8,
        category: 'अंतिम आवरण व संपादकीय मंडल (Credits & Board)',
        title: 'संपादकीय मंडल एवं प्रकाशन विवरण',
        subtitle: 'पाटलिपुत्र सौरभ - अंक 42',
        author: 'राजभाषा विभाग',
        authorDesignation: 'सेन्ट्रल बैंक ऑफ़ इण्डिया, आंचलिक कार्यालय पटना',
        content: [
          'संरक्षक: श्री अरविन्द कुमार (महाप्रबंधक एवं आंचलिक प्रमुख)',
          'मुख्य संपादक: श्री अभिजाय कुमार (मुख्य प्रबंधक - राजभाषा)',
          'संपादक: सुश्री प्रियंका कुमारी (प्रबंधक - राजभाषा)',
          'सह-संपादक: श्री सुमित सिन्हा (वरिष्ठ प्रबंधक), श्रीमती रश्मि वर्मा (सहायक प्रबंधक)',
          'मुद्रण एवं डिजिटल संयोजन: राजभाषा प्रकोष्ठ, आंचलिक कार्यालय, ब्लॉक-बी, द्वितीय तल, मौर्या लोक कॉम्प्लेक्स, डाकबंगला रोड, पटना - 800001 (बिहार)',
          'ईमेल संपर्क: rajbhasha.patna@centralbank.co.in | दूरभाष: 0612-2223344',
          'आगामी अंक (अंक 43 - सितम्बर 2026) हेतु रचनाएं आमंत्रित हैं। समस्त अधिकारी/कर्मचारी अपनी मौलिक कविताएं, कहानियां अथवा बैंकिंग आलेख 15 अगस्त 2026 तक प्रेषित कर सकते हैं।'
        ],
        quote: '"हिंदी देश की एकता की सबसे मजबूत कड़ी है।" — राष्ट्रपिता महात्मा गांधी'
      }
    ]
  },
  {
    id: 'issue-41',
    issueNumber: 'अंक 41',
    monthYear: 'मार्च 2026',
    theme: 'राष्ट्रकवि रामधारी सिंह दिनकर स्मृति विशेषांक',
    description: 'बिहार की साहित्यिक उर्वरा भूमि के अमर राष्ट्रकवि दिनकर के जीवन, काव्य और राष्ट्रीय चेतना को समर्पित विशेषांक।',
    coverTitle: 'पाटलिपुत्र सौरभ - अंक 41',
    coverSubtitle: 'दिनकर स्मृति विशेषांक एवं वित्तीय समावेशन',
    editorialBoard: {
      patron: 'श्री अरविन्द कुमार (आंचलिक प्रमुख)',
      chiefEditor: 'श्री अभिजाय कुमार (मुख्य प्रबंधक)',
      editor: 'सुश्री प्रियंका कुमारी',
      subEditors: ['श्री आलोक कुमार']
    },
    articles: [
      {
        id: 'p1-41',
        pageNumber: 1,
        category: 'मुखपृष्ठ (Cover Page)',
        title: 'पाटलिपुत्र सौरभ - अंक 41 (मार्च 2026)',
        subtitle: 'दिनकर स्मृति विशेषांक: "सच है, विपत्ति जब आती है, कायर को ही दहलाती है"',
        author: 'संपादकीय मंडल',
        authorDesignation: 'राजभाषा विभाग, पटना',
        content: [
          'राष्ट्रकवि रामधारी सिंह दिनकर जी की अमर पंक्तियों और ओजस्वी वाणी से प्रेरित यह विशेषांक हमारे बैंकर साथियों की साहित्यिक चेतना को समर्पित है।',
          'इस अंक में दिनकर जी के काव्य में राष्ट्रीयता, बैंकिंग में सरल हिंदी की उपादेयता और शाखा स्तर पर राजभाषा के सफल प्रयोगों का संकलन प्रस्तुत है।'
        ],
        quote: 'वसुधा का नेता कौन हुआ? भूखण्ड-विजेता कौन हुआ? अतुलित यश-क्रेता कौन हुआ? नव-धर्म प्रणेता कौन हुआ? जिसने न कभी आराम किया, विघ्नों में रहकर नाम किया। — दिनकर'
      },
      {
        id: 'p2-41',
        pageNumber: 2,
        category: 'साहित्यिक आलेख',
        title: 'दिनकर का काव्य चिंतन एवं कर्म की प्रेरणा',
        subtitle: 'बैंकिंग कार्यसंस्कृति के संदर्भ में',
        author: 'श्री सुमित सिन्हा',
        authorDesignation: 'वरिष्ठ प्रबंधक, आंचलिक कार्यालय पटना',
        content: [
          'दिनकर जी केवल कवि नहीं थे, वे कर्म के अमर साधक थे। कुरुक्षेत्र और रश्मिरथी की पंक्तियां हमें हर विपरीत परिस्थिति में अडिग रहकर अपने कर्तव्य का निर्वहन करने का संदेश देती हैं।',
          'एक बैंकर के रूप में जब हम जनसेवा के कठिन दायित्वों से जूझते हैं, तो दिनकर का ओज हमें नई ऊर्जा से भर देता है।'
        ]
      }
    ]
  }
];

interface MagazineReaderProps {
  currentUser?: AuthUser | null;
  onOpenUpload?: () => void;
}

export const MagazineReader: React.FC<MagazineReaderProps> = ({
  currentUser,
  onOpenUpload,
}) => {
  const [magazineIssues, setMagazineIssues] = useState<MagazineIssue[]>(() => {
    try {
      const saved = localStorage.getItem('rajbhasha_uploaded_magazines');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [selectedIssueId, setSelectedIssueId] = useState<string>(() => {
    return magazineIssues[0]?.id || '';
  });
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [readingTheme, setReadingTheme] = useState<'paper' | 'sepia' | 'dark'>('paper');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [viewMode, setViewMode] = useState<'single' | 'continuous'>('single');
  const [showToc, setShowToc] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Admin Magazine Upload Segment State
  const [showAdminUpload, setShowAdminUpload] = useState<boolean>(false);
  const [newIssueNumber, setNewIssueNumber] = useState<string>('');
  const [newMonthYear, setNewMonthYear] = useState<string>('');
  const [newTheme, setNewTheme] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newFile, setNewFile] = useState<{ name: string; dataUrl: string; size: number } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'admin';

  const currentIssue = magazineIssues.find((i) => i.id === selectedIssueId) || magazineIssues[0] || null;
  const activeArticle = currentIssue?.articles[currentPageIndex] || currentIssue?.articles[0] || null;
  const totalPages = currentIssue?.articles?.length || 0;

  // Handle Admin File Selection
  const handleMagazineFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setNewFile({
        name: file.name,
        dataUrl: reader.result as string,
        size: file.size,
      });
      if (!newIssueNumber) {
        setNewIssueNumber(`अंक ${magazineIssues.length + 1}`);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit New Magazine Issue from Admin
  const handleAdminUploadMagazine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssueNumber.trim() || !newFile) {
      setUploadError('कृपया अंक संख्या और पत्रिका फ़ाइल अवश्य चुनें।');
      return;
    }

    const createdIssue: MagazineIssue = {
      id: `mag-${Date.now()}`,
      issueNumber: newIssueNumber.trim(),
      monthYear: newMonthYear.trim() || new Date().toLocaleDateString('hi-IN', { month: 'long', year: 'numeric' }),
      theme: newTheme.trim() || 'राजभाषा ई-गृहपत्रिका',
      description: newDescription.trim() || 'सेन्ट्रल बैंक ऑफ़ इण्डिया, आंचलिक कार्यालय पटना द्वारा प्रकाशित ई-गृहपत्रिका "पाटलिपुत्र सौरभ"।',
      coverTitle: 'पाटलिपुत्र सौरभ',
      coverSubtitle: 'आंचलिक कार्यालय, पटना की त्रैमासिक ई-गृहपत्रिका',
      editorialBoard: {
        patron: 'श्री अरविन्द कुमार (महाप्रबंधक एवं आंचलिक प्रमुख)',
        chiefEditor: 'श्री अभिजाय कुमार (मुख्य प्रबंधक - राजभाषा)',
        editor: currentUser?.displayName || 'संपादक मंडल',
        subEditors: ['राजभाषा प्रकोष्ठ, पटना']
      },
      fileName: newFile.name,
      fileDataUrl: newFile.dataUrl,
      articles: [
        {
          id: `p1-${Date.now()}`,
          pageNumber: 1,
          category: 'मुखपृष्ठ (Cover Page)',
          title: `पाटलिपुत्र सौरभ - ${newIssueNumber.trim()}`,
          subtitle: newTheme.trim() || 'त्रैमासिक ई-गृहपत्रिका',
          author: 'संपादकीय मंडल',
          authorDesignation: 'राजभाषा विभाग, पटना',
          content: [
            newDescription.trim() || 'सेन्ट्रल बैंक ऑफ़ इण्डिया, आंचलिक कार्यालय पटना द्वारा प्रकाशित ई-गृहपत्रिका "पाटलिपुत्र सौरभ"।',
            `यह अंक मुख्य प्रशासक द्वारा आधिकारिक रूप से संलग्न फ़ाइल (${newFile.name}) के साथ प्रकाशित किया गया है।`,
            'समस्त पाठक नीचे दिए गए डाउनलोड बटन से पूर्ण ई-पत्रिका प्राप्त कर सकते हैं।'
          ],
          quote: 'निज भाषा उन्नति अहै, सब उन्नति को मूल। बिन निज भाषा-ज्ञान के, मिटत न हिय को सूल॥ — भारतेन्दु हरिश्चंद्र'
        }
      ]
    };

    const updated = [createdIssue, ...magazineIssues];
    setMagazineIssues(updated);
    localStorage.setItem('rajbhasha_uploaded_magazines', JSON.stringify(updated));
    setSelectedIssueId(createdIssue.id);
    setCurrentPageIndex(0);
    setShowAdminUpload(false);
    setNewIssueNumber('');
    setNewMonthYear('');
    setNewTheme('');
    setNewDescription('');
    setNewFile(null);
    setUploadError(null);
    setDownloadSuccess(`'${createdIssue.coverTitle} (${createdIssue.issueNumber})' सफलतापूर्वक अपलोड व प्रकाशित हो गई है!`);
    setTimeout(() => setDownloadSuccess(null), 5000);
  };

  // Allow Admin to quick-publish curated sample issue
  const handlePublishCuratedIssue = () => {
    const updated = [...PRESET_MAGAZINE_ISSUES];
    setMagazineIssues(updated);
    localStorage.setItem('rajbhasha_uploaded_magazines', JSON.stringify(updated));
    setSelectedIssueId(updated[0].id);
    setCurrentPageIndex(0);
    setDownloadSuccess('आधिकारिक विशेषांक (अंक 42 एवं 41) सफलतापूर्वक प्रकाशित कर दिया गया है!');
    setTimeout(() => setDownloadSuccess(null), 5000);
  };

  // Delete Issue (Admin Only)
  const handleDeleteIssue = (issueId: string) => {
    if (confirm('क्या आप इस ई-पत्रिका अंक को हटाना चाहते हैं?')) {
      const updated = magazineIssues.filter(i => i.id !== issueId);
      setMagazineIssues(updated);
      localStorage.setItem('rajbhasha_uploaded_magazines', JSON.stringify(updated));
      if (updated.length > 0) {
        setSelectedIssueId(updated[0].id);
        setCurrentPageIndex(0);
      } else {
        setSelectedIssueId('');
      }
      setDownloadSuccess('ई-पत्रिका अंक हटा दिया गया है।');
      setTimeout(() => setDownloadSuccess(null), 4000);
    }
  };

  // Navigate pages
  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex((prev) => prev + 1);
    }
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode === 'single') {
        if (e.key === 'ArrowRight') handleNextPage();
        if (e.key === 'ArrowLeft') handlePrevPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPageIndex, totalPages, viewMode]);

  // Download Full Issue
  const handleDownloadFullMagazine = () => {
    if (!currentIssue) return;

    if (currentIssue.fileDataUrl) {
      const a = document.createElement('a');
      a.href = currentIssue.fileDataUrl;
      a.download = currentIssue.fileName || `${currentIssue.coverTitle}_${currentIssue.issueNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setDownloadSuccess(`'${currentIssue.coverTitle} (${currentIssue.issueNumber})' फ़ाइल डाउनलोड प्रारंभ हो गई है!`);
      setTimeout(() => setDownloadSuccess(null), 4000);
      return;
    }

    let textDoc = `================================================================================
सेन्ट्रल बैंक ऑफ़ इण्डिया • CENTRAL BANK OF INDIA
आंचलिक कार्यालय, पटना (Zonal Office, Patna)
ई-गृहपत्रिका: ${currentIssue.coverTitle} (${currentIssue.issueNumber} - ${currentIssue.monthYear})
विषय: ${currentIssue.theme}
================================================================================

संरक्षक: ${currentIssue.editorialBoard.patron}
मुख्य संपादक: ${currentIssue.editorialBoard.chiefEditor}
संपादक: ${currentIssue.editorialBoard.editor}
सह-संपादक: ${currentIssue.editorialBoard.subEditors.join(', ')}

--------------------------------------------------------------------------------
अनुक्रमणिका (Table of Contents):
--------------------------------------------------------------------------------
${currentIssue.articles.map((a) => `पृष्ठ ${a.pageNumber}: [${a.category}] ${a.title} - ${a.author}`).join('\n')}

================================================================================
`;

    currentIssue.articles.forEach((art) => {
      textDoc += `\n\n--------------------------------------------------------------------------------
[पृष्ठ ${art.pageNumber} / ${totalPages}] - ${art.category}
शीर्षक: ${art.title}
${art.subtitle ? `उप-शीर्षक: ${art.subtitle}\n` : ''}लेखक/रचनाकार: ${art.author} (${art.authorDesignation})
--------------------------------------------------------------------------------\n\n`;

      if (art.quote) {
        textDoc += `“ ${art.quote} ”\n\n`;
      }

      art.content.forEach((para) => {
        textDoc += `${para}\n\n`;
      });

      if (art.poems && art.poems.length > 0) {
        art.poems.forEach((poem) => {
          textDoc += `*** ${poem.title} ***\nरचनाकार: ${poem.poet} (${poem.designation})\n\n`;
          textDoc += poem.lines.join('\n') + '\n\n';
        });
      }

      if (art.highlightBox) {
        textDoc += `[विशेष ध्यातव्य]: ${art.highlightBox}\n\n`;
      }
    });

    textDoc += `\n================================================================================
प्रकाशक: राजभाषा विभाग, सेन्ट्रल बैंक ऑफ़ इण्डिया, आंचलिक कार्यालय पटना
सर्वाधिकार सुरक्षित • वर्ष 2026
================================================================================`;

    const blob = new Blob([textDoc], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CBI_Patna_${currentIssue.coverTitle.replace(/\s+/g, '_')}_${currentIssue.issueNumber.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(`'${currentIssue.coverTitle} (${currentIssue.issueNumber})' संपूर्ण ई-पत्रिका सफलतापूर्वक डाउनलोड हो गई है!`);
    setTimeout(() => setDownloadSuccess(null), 5000);
  };

  // Download Current Single Article
  const handleDownloadSingleArticle = () => {
    const art = activeArticle;
    let textDoc = `================================================================================
सेन्ट्रल बैंक ऑफ़ इण्डिया • आंचलिक कार्यालय पटना
ई-गृहपत्रिका "${currentIssue.coverTitle}" (${currentIssue.issueNumber})
================================================================================
श्रेणी: ${art.category}
शीर्षक: ${art.title}
${art.subtitle ? `उप-शीर्षक: ${art.subtitle}\n` : ''}लेखक: ${art.author} (${art.authorDesignation})
--------------------------------------------------------------------------------\n\n`;

    if (art.quote) {
      textDoc += `“ ${art.quote} ”\n\n`;
    }

    art.content.forEach((para) => {
      textDoc += `${para}\n\n`;
    });

    if (art.poems) {
      art.poems.forEach((p) => {
        textDoc += `\n*** ${p.title} ***\n${p.poet}\n` + p.lines.join('\n') + '\n\n';
      });
    }

    const blob = new Blob([textDoc], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${art.title.slice(0, 30).replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(`आलेख '${art.title}' सफलतापूर्वक डाउनलोड हो गया है!`);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  // Theme styling classes
  const getThemeContainerClass = () => {
    if (readingTheme === 'sepia') return 'bg-[#fbf0d9] text-[#43302b] border-[#e6d3af]';
    if (readingTheme === 'dark') return 'bg-slate-900 text-slate-100 border-slate-800';
    return 'bg-[#faf9f6] text-slate-900 border-amber-200/80';
  };

  const getThemePaperClass = () => {
    if (readingTheme === 'sepia') return 'bg-[#fdf6e7] text-[#3d2b1f] shadow-amber-900/10 border-[#e8d7b8]';
    if (readingTheme === 'dark') return 'bg-slate-800 text-slate-100 shadow-black/40 border-slate-700';
    return 'bg-white text-slate-900 shadow-amber-950/5 border-amber-200/70';
  };

  const getFontSizeClass = () => {
    if (fontSize === 'sm') return 'text-xs sm:text-sm leading-relaxed';
    if (fontSize === 'lg') return 'text-base sm:text-lg leading-loose';
    return 'text-sm sm:text-base leading-relaxed';
  };

  return (
    <div className="space-y-4">
      {/* If No Magazine has been uploaded */}
      {(!currentIssue || magazineIssues.length === 0) ? (
        <div className="space-y-4">
          <div className="p-8 text-center space-y-3 bg-slate-50 border border-dashed border-slate-300 rounded-2xl">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto opacity-70" />
            <h3 className="font-bold text-slate-800 text-base">
              ई-गृहपत्रिका "पाटलिपुत्र सौरभ"
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              आंचलिक कार्यालय पटना द्वारा अभी ई-पत्रिका का कोई अंक अपलोड नहीं किया गया है।
            </p>
            <p className="text-[11px] text-slate-400">
              {isAdmin 
                ? 'मुख्य प्रशासक नीचे दिए गए अपलोड अनुभाग से पत्रिका फ़ाइल (PDF, Word) संलग्न कर नवीन अंक प्रकाशित कर सकते हैं।' 
                : 'जैसे ही मुख्य प्रशासक द्वारा नवीन अंक अपलोड किया जाएगा, वह यहाँ उपलब्ध होगा।'}
            </p>
          </div>

          {/* ADMIN UPLOAD SEGMENT WHEN EMPTY */}
          {isAdmin && (
            <div className="p-4 bg-red-50/60 border border-red-200 rounded-2xl space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-red-700" />
                  <h4 className="font-bold text-xs text-red-950">
                    प्रशासक ई-पत्रिका अपलोड अनुभाग (Admin Magazine Upload Segment)
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={handlePublishCuratedIssue}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-2xs cursor-pointer"
                  title="आधिकारिक विशेषांक प्रकाशित करें"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>आधिकारिक विशेषांक (अंक 42) प्रकाशित करें</span>
                </button>
              </div>

              <form onSubmit={handleAdminUploadMagazine} className="space-y-3 bg-white p-4 rounded-xl border border-red-100">
                {uploadError && (
                  <p className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded">{uploadError}</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      अंक सं. व नाम * (उदा. अंक 42)
                    </label>
                    <input
                      type="text"
                      value={newIssueNumber}
                      onChange={(e) => setNewIssueNumber(e.target.value)}
                      placeholder="उदा. अंक 42 / जून 2026 विशेषांक"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      प्रकाशन माह व वर्ष
                    </label>
                    <input
                      type="text"
                      value={newMonthYear}
                      onChange={(e) => setNewMonthYear(e.target.value)}
                      placeholder="उदा. जून 2026"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="font-bold text-slate-700 block mb-1">
                    मुख्य विषय / थीम (Theme)
                  </label>
                  <input
                    type="text"
                    value={newTheme}
                    onChange={(e) => setNewTheme(e.target.value)}
                    placeholder="उदा. डिजिटल बैंकिंग एवं कृत्रिम बुद्धिमत्ता में हिंदी"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
                  />
                </div>

                <div className="text-xs">
                  <label className="font-bold text-slate-700 block mb-1">
                    संक्षिप्त विवरण / संपादकीय परिचय
                  </label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="अंक का संक्षिप्त विवरण दर्ज करें..."
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
                  />
                </div>

                <div className="text-xs">
                  <label className="font-bold text-slate-700 block mb-1">
                    पत्रिका फ़ाइल संलग्न करें * (PDF, Word, Docx)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleMagazineFileChange}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 text-xs focus:outline-none file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-red-700 file:text-white hover:file:bg-red-800"
                    required
                  />
                  {newFile && (
                    <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                      ✓ चयनित फ़ाइल: {newFile.name} ({(newFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>ई-पत्रिका अपलोड व प्रकाशित करें</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* 1. TOP HEADER & MAGAZINE SELECTOR BAR */}
          <div className="p-4 bg-gradient-to-r from-red-800 via-red-900 to-amber-900 rounded-2xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>ई-गृहपत्रिका वाचनालय</span>
                </span>
                <span className="text-amber-200 font-bold text-xs">
                  सेन्ट्रल बैंक ऑफ़ इण्डिया • आंचलिक कार्यालय पटना
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-amber-300 shrink-0" />
                <span>पाटलिपुत्र सौरभ ({currentIssue.issueNumber})</span>
              </h2>
              <p className="text-xs text-amber-100/90 max-w-2xl">
                {currentIssue.description}
              </p>
            </div>

            {/* Action Controls in Header: Download and Issue Selection */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Issue Selector Dropdown */}
              <select
                value={selectedIssueId}
                onChange={(e) => {
                  setSelectedIssueId(e.target.value);
                  setCurrentPageIndex(0);
                }}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-amber-300/40 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                {magazineIssues.map((issue) => (
                  <option key={issue.id} value={issue.id} className="text-slate-900 font-semibold">
                    {issue.coverTitle} - {issue.issueNumber} ({issue.monthYear})
                  </option>
                ))}
              </select>

              {/* MAIN DOWNLOAD BUTTON: DOWNLOAD FULL MAGAZINE (Only when magazine issue exists) */}
              <button
                type="button"
                onClick={handleDownloadFullMagazine}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
                title="संपूर्ण पत्रिका डाउनलोड करें"
              >
                <Download className="w-4 h-4" />
                <span>संपूर्ण अंक डाउनलोड करें</span>
              </button>

              {/* Admin Upload Trigger */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setShowAdminUpload(!showAdminUpload)}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{showAdminUpload ? 'फ़ॉर्म बंद करें' : 'नया अंक अपलोड करें'}</span>
                </button>
              )}

              {/* Admin Delete Issue Button */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => handleDeleteIssue(currentIssue.id)}
                  className="p-2 bg-red-950/60 hover:bg-red-950 text-red-200 hover:text-white rounded-xl text-xs transition-colors cursor-pointer"
                  title="यह अंक हटाएं"
                >
                  अंक हटाएं
                </button>
              )}
            </div>
          </div>

          {/* Admin Upload Form (Visible when toggled) */}
          {isAdmin && showAdminUpload && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-3">
              <h4 className="font-bold text-xs text-red-950 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-red-700" />
                <span>प्रशासक ई-पत्रिका अपलोड अनुभाग</span>
              </h4>
              <form onSubmit={handleAdminUploadMagazine} className="space-y-3 bg-white p-4 rounded-xl border border-red-100">
                {uploadError && (
                  <p className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded">{uploadError}</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      अंक सं. व नाम * (उदा. अंक 43)
                    </label>
                    <input
                      type="text"
                      value={newIssueNumber}
                      onChange={(e) => setNewIssueNumber(e.target.value)}
                      placeholder="उदा. अंक 43"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      प्रकाशन माह व वर्ष
                    </label>
                    <input
                      type="text"
                      value={newMonthYear}
                      onChange={(e) => setNewMonthYear(e.target.value)}
                      placeholder="उदा. सितम्बर 2026"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="font-bold text-slate-700 block mb-1">
                    मुख्य विषय / थीम (Theme)
                  </label>
                  <input
                    type="text"
                    value={newTheme}
                    onChange={(e) => setNewTheme(e.target.value)}
                    placeholder="उदा. राजभाषा पखवाड़ा विशेषांक"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
                  />
                </div>

                <div className="text-xs">
                  <label className="font-bold text-slate-700 block mb-1">
                    पत्रिका फ़ाइल संलग्न करें * (PDF, Word, Docx)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleMagazineFileChange}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 text-xs focus:outline-none file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-red-700 file:text-white hover:file:bg-red-800"
                    required
                  />
                  {newFile && (
                    <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                      ✓ चयनित फ़ाइल: {newFile.name} ({(newFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAdminUpload(false)}
                    className="px-3 py-1.5 border rounded-lg text-xs text-slate-600 hover:bg-slate-50"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>अपलोड व प्रकाशित करें</span>
                  </button>
                </div>
              </form>
            </div>
          )}

      {/* Download Toast Notification */}
      {downloadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl flex items-center justify-between gap-2 text-xs shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{downloadSuccess}</span>
          </div>
          <button onClick={() => setDownloadSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. READER TOOLBAR (Page Nav, TOC, Display Mode, Font Size, Print/Download) */}
      <div className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${getThemeContainerClass()} shadow-2xs`}>
        {/* Left Side: Page Navigator & TOC toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowToc(!showToc)}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
              showToc ? 'bg-red-700 text-white' : 'bg-black/5 hover:bg-black/10 dark:bg-white/10'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>अनुक्रमणिका (TOC)</span>
          </button>

          {viewMode === 'single' && (
            <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-lg">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={currentPageIndex === 0}
                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/15 disabled:opacity-30 cursor-pointer"
                title="पिछला पृष्ठ (Previous Page)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold px-1.5">
                पृष्ठ {activeArticle.pageNumber} / {totalPages}
              </span>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={currentPageIndex === totalPages - 1}
                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/15 disabled:opacity-30 cursor-pointer"
                title="अगला पृष्ठ (Next Page)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right Side: View Mode, Theme, Font Size & Single Article Download */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-black/10 dark:border-white/20 rounded-lg p-0.5 bg-black/5 dark:bg-white/5">
            <button
              type="button"
              onClick={() => setViewMode('single')}
              className={`px-2 py-1 rounded-md font-semibold ${
                viewMode === 'single' ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white' : 'opacity-70 hover:opacity-100'
              }`}
            >
              पृष्ठ वाचन
            </button>
            <button
              type="button"
              onClick={() => setViewMode('continuous')}
              className={`px-2 py-1 rounded-md font-semibold ${
                viewMode === 'continuous' ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white' : 'opacity-70 hover:opacity-100'
              }`}
            >
              पूर्ण पत्रिका
            </button>
          </div>

          {/* Reading Mode Theme Switcher */}
          <div className="flex items-center border border-black/10 dark:border-white/20 rounded-lg p-0.5 bg-black/5 dark:bg-white/5">
            <button
              type="button"
              onClick={() => setReadingTheme('paper')}
              className={`px-2 py-1 rounded-md font-semibold ${readingTheme === 'paper' ? 'bg-white text-slate-900 shadow-2xs' : 'opacity-70'}`}
              title="धवल कागज़ मोड"
            >
              दिन
            </button>
            <button
              type="button"
              onClick={() => setReadingTheme('sepia')}
              className={`px-2 py-1 rounded-md font-semibold ${readingTheme === 'sepia' ? 'bg-[#f4e2c1] text-[#43302b] shadow-2xs' : 'opacity-70'}`}
              title="सेपिया / क्लासिक पुस्तक मोड"
            >
              सेपिया
            </button>
            <button
              type="button"
              onClick={() => setReadingTheme('dark')}
              className={`px-2 py-1 rounded-md font-semibold ${readingTheme === 'dark' ? 'bg-slate-700 text-white shadow-2xs' : 'opacity-70'}`}
              title="रात्रि वाचन मोड"
            >
              रात्रि
            </button>
          </div>

          {/* Font Size Adjuster */}
          <div className="flex items-center border border-black/10 dark:border-white/20 rounded-lg p-0.5 bg-black/5 dark:bg-white/5">
            <button
              type="button"
              onClick={() => setFontSize('sm')}
              className={`px-2 py-1 rounded-md ${fontSize === 'sm' ? 'font-bold bg-white dark:bg-slate-700 shadow-2xs' : 'opacity-70'}`}
              title="सामान्य फॉन्ट"
            >
              अ
            </button>
            <button
              type="button"
              onClick={() => setFontSize('base')}
              className={`px-2 py-1 rounded-md ${fontSize === 'base' ? 'font-bold bg-white dark:bg-slate-700 shadow-2xs' : 'opacity-70'}`}
              title="मध्यम फॉन्ट"
            >
              अ+
            </button>
            <button
              type="button"
              onClick={() => setFontSize('lg')}
              className={`px-2 py-1 rounded-md ${fontSize === 'lg' ? 'font-bold bg-white dark:bg-slate-700 shadow-2xs' : 'opacity-70'}`}
              title="बड़ा फॉन्ट"
            >
              अ++
            </button>
          </div>

          {/* Single Page Download */}
          <button
            type="button"
            onClick={handleDownloadSingleArticle}
            className="px-2.5 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 dark:bg-white/10 font-bold flex items-center gap-1 transition-colors"
            title="वर्तमान आलेख डाउनलोड करें"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">आलेख डाउनलोड</span>
          </button>

          {/* Print Button */}
          <button
            type="button"
            onClick={() => window.print()}
            className="p-1.5 rounded-lg bg-black/5 hover:bg-black/10 dark:bg-white/10 transition-colors"
            title="प्रिंट / PDF के रूप में सहेजें"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. COLLAPSIBLE TABLE OF CONTENTS (अनुक्रमणिका) DRAWER */}
      {showToc && (
        <div className="p-4 bg-amber-50/90 dark:bg-slate-800/90 border border-amber-300 dark:border-slate-700 rounded-xl space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-amber-200 dark:border-slate-700 pb-2">
            <span className="font-bold text-xs text-amber-950 dark:text-amber-300 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>{currentIssue.coverTitle} - अनुक्रमणिका एवं आलेख सूची:</span>
            </span>
            <button onClick={() => setShowToc(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
            {currentIssue.articles.map((art, idx) => (
              <button
                key={art.id}
                type="button"
                onClick={() => {
                  setCurrentPageIndex(idx);
                  setShowToc(false);
                }}
                className={`p-2.5 rounded-lg text-left transition-all border ${
                  currentPageIndex === idx
                    ? 'bg-red-700 text-white border-red-800 shadow-xs'
                    : 'bg-white dark:bg-slate-900/60 hover:bg-amber-100/60 dark:hover:bg-slate-700/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] opacity-75 mb-0.5">
                  <span>पृष्ठ {art.pageNumber}</span>
                  <span>{art.category}</span>
                </div>
                <div className="font-bold text-xs line-clamp-1">{art.title}</div>
                <div className="text-[11px] opacity-75 mt-0.5 line-clamp-1">{art.author}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. MAIN IN-PAGE READING AREA */}
      {viewMode === 'single' ? (
        // SINGLE PAGE FLIPBOOK / MAG-VIEW
        <div className={`p-6 sm:p-10 rounded-2xl border-2 transition-colors ${getThemePaperClass()} relative shadow-lg`}>
          {/* Ornamental Indian Magazine Border Header */}
          <div className="border-b-2 border-amber-900/15 dark:border-amber-400/20 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-black text-red-800 dark:text-amber-400 uppercase tracking-widest text-[11px]">
                {currentIssue.coverTitle} • {currentIssue.issueNumber} ({currentIssue.monthYear})
              </span>
              <span className="opacity-40">•</span>
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                {activeArticle.category}
              </span>
            </div>
            <div className="font-bold text-slate-500 dark:text-slate-400 text-[11px]">
              पृष्ठ संख्या: {activeArticle.pageNumber} / {totalPages}
            </div>
          </div>

          {/* Article Header */}
          <div className="space-y-2 mb-6">
            <span className="inline-block px-2 py-0.5 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 rounded font-bold text-[10px]">
              {activeArticle.category}
            </span>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
              {activeArticle.title}
            </h1>
            {activeArticle.subtitle && (
              <p className="text-sm sm:text-base font-medium opacity-80 italic">
                {activeArticle.subtitle}
              </p>
            )}
            <div className="flex items-center gap-2 pt-1 text-xs opacity-75 border-t border-black/5 dark:border-white/5">
              <span className="font-bold text-red-700 dark:text-amber-400">{activeArticle.author}</span>
              <span>•</span>
              <span>{activeArticle.authorDesignation}</span>
              {activeArticle.authorBranch && (
                <>
                  <span>•</span>
                  <span>{activeArticle.authorBranch}</span>
                </>
              )}
            </div>
          </div>

          {/* Quote / Subhead Banner if present */}
          {activeArticle.quote && (
            <blockquote className="p-4 my-4 bg-amber-50/70 dark:bg-slate-700/40 border-l-4 border-amber-600 dark:border-amber-400 rounded-r-xl italic font-serif text-sm sm:text-base leading-relaxed opacity-95">
              “{activeArticle.quote}”
            </blockquote>
          )}

          {/* Article Body Content */}
          <div className={`space-y-4 ${getFontSizeClass()}`}>
            {activeArticle.content.map((paragraph, pIdx) => (
              <p key={pIdx} className="text-justify font-normal leading-relaxed first-letter:float-left first-letter:text-3xl first-letter:font-black first-letter:mr-2 first-letter:text-red-800 dark:first-letter:text-amber-400">
                {paragraph}
              </p>
            ))}

            {/* Poems Section (if any) */}
            {activeArticle.poems && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                {activeArticle.poems.map((poem, poemIdx) => (
                  <div key={poemIdx} className="p-4 bg-amber-50/50 dark:bg-slate-700/30 border border-amber-200/80 dark:border-slate-600 rounded-xl space-y-2">
                    <h4 className="font-bold text-sm text-red-800 dark:text-amber-300">
                      {poem.title}
                    </h4>
                    <p className="text-[11px] opacity-75 font-medium">
                      रचनाकार: {poem.poet} ({poem.designation})
                    </p>
                    <div className="space-y-1 font-serif text-xs sm:text-sm italic leading-relaxed pt-1">
                      {poem.lines.map((line, lIdx) => (
                        <p key={lIdx}>{line}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Highlight Box if present */}
            {activeArticle.highlightBox && (
              <div className="p-4 my-4 bg-gradient-to-r from-red-50 to-amber-50 dark:from-slate-700/60 dark:to-slate-700/30 border border-red-200 dark:border-slate-600 rounded-xl text-xs sm:text-sm font-bold text-red-950 dark:text-amber-200 shadow-2xs">
                {activeArticle.highlightBox}
              </div>
            )}
          </div>

          {/* Bottom Page Navigation Controls */}
          <div className="border-t-2 border-amber-900/15 dark:border-amber-400/20 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={currentPageIndex === 0}
              className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-30 cursor-pointer shadow-2xs transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>पिछला पृष्ठ ({currentPageIndex > 0 ? currentIssue.articles[currentPageIndex - 1].title.slice(0, 18) + '...' : 'प्रारंभ'})</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadFullMagazine}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>संपूर्ण पत्रिका डाउनलोड</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleNextPage}
              disabled={currentPageIndex === totalPages - 1}
              className="w-full sm:w-auto px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-30 cursor-pointer shadow-2xs transition-colors"
            >
              <span>अगला पृष्ठ ({currentPageIndex < totalPages - 1 ? currentIssue.articles[currentPageIndex + 1].title.slice(0, 18) + '...' : 'समाप्त'})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        // CONTINUOUS ALL-PAGES READER MODE
        <div className="space-y-6">
          {currentIssue.articles.map((art) => (
            <div key={art.id} className={`p-6 sm:p-8 rounded-2xl border-2 ${getThemePaperClass()} shadow-md space-y-4`}>
              <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-2 text-xs">
                <span className="font-black text-red-800 dark:text-amber-400">
                  पृष्ठ {art.pageNumber} • {art.category}
                </span>
                <button
                  type="button"
                  onClick={handleDownloadFullMagazine}
                  className="text-emerald-700 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>डाउनलोड ई-बुक</span>
                </button>
              </div>

              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black">{art.title}</h2>
                {art.subtitle && <p className="text-sm font-medium italic opacity-80">{art.subtitle}</p>}
                <p className="text-xs font-bold text-red-700 dark:text-amber-400">
                  {art.author} — {art.authorDesignation}
                </p>
              </div>

              {art.quote && (
                <blockquote className="p-3 bg-amber-50 dark:bg-slate-700/50 border-l-4 border-amber-600 rounded-r-lg italic text-xs sm:text-sm font-serif">
                  “{art.quote}”
                </blockquote>
              )}

              <div className={`space-y-3 ${getFontSizeClass()}`}>
                {art.content.map((p, i) => (
                  <p key={i} className="text-justify font-normal leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>

              {art.poems && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {art.poems.map((poem, pidx) => (
                    <div key={pidx} className="p-3 bg-amber-50/50 dark:bg-slate-700/40 rounded-xl border border-amber-200 dark:border-slate-600">
                      <h5 className="font-bold text-xs text-red-800 dark:text-amber-300">{poem.title}</h5>
                      <p className="text-[10px] opacity-70 mb-1">{poem.poet}</p>
                      <div className="font-serif italic text-xs space-y-1">
                        {poem.lines.map((l, li) => (
                          <p key={li}>{l}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 5. FOOTER NOTICE */}
      <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-amber-950">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-red-700 shrink-0" />
          <span>
            ई-गृहपत्रिका "पाटलिपुत्र सौरभ" • सर्वाधिकार सेन्ट्रल बैंक ऑफ़ इण्डिया, आंचलिक कार्यालय पटना के अधीन सुरक्षित हैं।
          </span>
        </div>
        <button
          type="button"
          onClick={handleDownloadFullMagazine}
          className="font-bold text-red-700 hover:underline flex items-center gap-1 shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>ऑफ़लाइन ई-बुक (DOC/TXT) डाउनलोड करें</span>
        </button>
      </div>
      </>
      )}
    </div>
  );
};
