/**
 * Official TNREGINET Certificate of Encumbrance (EC) Template & Authentic Records Engine
 * Reproduces the exact bilingual format of the Tamil Nadu Registration Department.
 */

export interface ECEntry {
  srNo: number;
  docNo: string;
  execDate: string;
  presDate: string;
  regDate: string;
  nature: string;
  executants: string[];
  claimants: string[];
  volPage?: string;
  consideration: string;
  marketValue: string;
  prNumber: string;
  remarks?: string;
  schedules?: Array<{
    scheduleTitle: string;
    propertyType: string;
    extent: string;
    villageStreet: string;
    surveyNo: string;
    plotNo?: string;
    boundary: string;
    scheduleRemarks?: string;
  }>;
}

export const MALLASAMUDRAM_322_ENTRIES: ECEntry[] = [
  {
    srNo: 1,
    docNo: "5207/2010",
    execDate: "24-Nov-2010",
    presDate: "24-Nov-2010",
    regDate: "24-Nov-2010",
    nature: "Conveyance Non Metro/UA",
    executants: [
      "1. ஆர். ரங்கசாமி (முதல்வர்)",
      "2. ஆர். காளியண்ணன் (முதல்வர்)",
      "3. சி.கே. பாபாதாஷ் (முகவர்)",
      "4. சி. சுப்ரமணியம்",
    ],
    claimants: ["1. மேற்படி நபர்கள்"],
    volPage: "-",
    consideration: "Rs. 7,00,000/-",
    marketValue: "Rs. 7,00,000/-",
    prNumber: "997/ 1997",
    remarks: "விஉரூ 700000/- மாம ரூ 250000/- கெடு 1வருடம்(இந்த ஆவணம் 1புத்தகம் 2012 ம் ஆண்டின் 1323நெ.ஆவணத்தால் இரத்துசெய்யப்படுகிறது)",
    schedules: [
      {
        scheduleTitle: "Schedule 1 Details:",
        propertyType: "Agricultural Land",
        extent: "ஏ 0.38",
        villageStreet: "Mallasamudram Kilmugam, மல்லசமுத்திரம் கீழ்முகம்",
        surveyNo: "322/1B, 322/1B3",
        boundary: "சநெ 322/1பி புஏ 1.86 புதுசநெ 322/1பி3 புஹெ 0.15.0க்கு ஏ 0.38ல், சநெ 321 சேலம் டூ திருச்செங்கோடு செல்லும் மெயின் ரோட்டுக்கும்(கி) ஆறுமுகம் கவுண்டர் பாகத்துக்கும் (மே), சநெ 322/1பி2 சுப்பரமணி பாகத்துக்கும்(தெ) சநெ 322/1பி4 ஆறுமுக கவுண்டர் பாகத்துக்கும்(வ), ல் ஏ 0.38செ நிலம் பூராவும் ஆவணப்படிதடபாத்தியம்.",
      },
    ],
  },
  {
    srNo: 2,
    docNo: "1323/2012",
    execDate: "27-Mar-2012",
    presDate: "27-Mar-2012",
    regDate: "27-Mar-2012",
    nature: "Cancellation",
    executants: [
      "1. ஆர். ரங்கசாமி (முதல்வர்)",
      "2. ஆர். காளியண்ணன் (முதல்வர்)",
      "3. சி.கே. பாபாதாஷ் (முகவர்)",
      "4. சி. சுப்ரமணியம்",
    ],
    claimants: ["1. மேற்படி நபர்கள்"],
    volPage: "-",
    consideration: "-",
    marketValue: "-",
    prNumber: "997/ 1997",
    remarks: "வி.உ.ஆவணத்தை இரத்து செய்வதாய்(இந்த ஆவணம் 1புத்தகம் 2010ம் ஆண்டின் நெ.5207 ஆவணத்தை இரத்துசெய்கிறது)",
    schedules: [
      {
        scheduleTitle: "Schedule 1 Details:",
        propertyType: "Agricultural Land",
        extent: "ஏ 0.38",
        villageStreet: "Mallasamudram Kilmugam, மல்லசமுத்திரம் கீழ்முகம்",
        surveyNo: "322/1B, 322/1B3",
        boundary: "சநெ 322/1பி புஏ 1.86 புதுசநெ 322/1பி3 புஹெ 0.15.0க்கு ஏ 0.38ல், சநெ 321 சேலம் டூ திருச்செங்கோடு செல்லும் மெயின் ரோட்டுக்கும்(கி) ஆறுமுகம் கவுண்டர் பாகத்துக்கும் (மே), சநெ 322/1பி2 சுப்பரமணி பாகத்துக்கும்(தெ) சநெ 322/1பி4 ஆறுமுக கவுண்டர் பாகத்துக்கும்(வ), ல் ஏ 0.38செ நிலம் பூராவும் ஆவணப்படிதடபாத்தியம்.",
      },
    ],
  },
  {
    srNo: 3,
    docNo: "1325/2012",
    execDate: "27-Mar-2012",
    presDate: "27-Mar-2012",
    regDate: "27-Mar-2012",
    nature: "Conveyance Non Metro/UA",
    executants: ["1. ஆர். ரங்கசாமி", "2. காளயிண்ணன்"],
    claimants: ["1. என். பழனிசாமி"],
    volPage: "-",
    consideration: "Rs. 75,000/-",
    marketValue: "Rs. 75,000/-",
    prNumber: "997/ 97",
    remarks: "வி.ரூ-75000/-",
    schedules: [
      {
        scheduleTitle: "Schedule 1 Details:",
        propertyType: "House Site",
        extent: "1240 சதுரடி",
        villageStreet: "Mallasamudram Kilmugam, மல்லசமுத்திரம் கீழ்முகம்",
        surveyNo: "322/1B, 322/1B3",
        plotNo: "1",
        boundary: "ச.நெ. 322/1பி பு.ஏ. 1.86 க்குபுதிய ச.நெ. 322/1பி3 பு.ஹெ 0.15.0 க்கு புஏ 0.37 வார்டு எண் 10 தெரு பாலிக்காடு தண்ணீர் கிணற்று வீதி மனைஎண் 1 க்கு, சேலம் to திகோடு ரோட்டுக்கு (கி) ஷை மனை எண் 2 க்கு (மே)...",
      },
    ],
  },
  {
    srNo: 4,
    docNo: "1326/2012",
    execDate: "27-Mar-2012",
    presDate: "27-Mar-2012",
    regDate: "27-Mar-2012",
    nature: "Conveyance Non Metro/UA",
    executants: ["1. ஆர். ரங்கசாமி", "2. காளயிண்ணன்"],
    claimants: ["1. கே. பெருமாள்"],
    volPage: "-",
    consideration: "Rs. 85,000/-",
    marketValue: "Rs. 85,000/-",
    prNumber: "997/ 97",
    remarks: "வி.ரூ-85000/-",
    schedules: [
      {
        scheduleTitle: "Schedule 1 Details:",
        propertyType: "House Site",
        extent: "1460 சதுரடி",
        villageStreet: "Mallasamudram Kilmugam, மல்லசமுத்திரம் கீழ்முகம்",
        surveyNo: "322/1B, 322/1B3",
        plotNo: "6",
        boundary: "ச.நெ. 322/1பி பு.ஏ. 1.86 க்குபுதிய ச.நெ. 322/1பி3 பு.ஹெ 0.15.0 க்கு புஏ 0.37 வார்டு எண் 10 தெரு பாலிக்காடு தண்ணீர் கிணற்று வீதி மனைஎண் 6 க்கு, மனைஎண் 5 க்கு (கி) மனைஎண் 7 க்கு (மே)...",
      },
    ],
  },
  {
    srNo: 5,
    docNo: "1349/2012",
    execDate: "28-Mar-2012",
    presDate: "28-Mar-2012",
    regDate: "28-Mar-2012",
    nature: "Conveyance Non Metro/UA",
    executants: ["1. ஆர். ரங்கசாமி", "2. காளயிண்ணன்"],
    claimants: ["1. D. கணேசன்", "2. எம். நல்லதம்பி"],
    volPage: "-",
    consideration: "Rs. 75,000/-",
    marketValue: "Rs. 75,000/-",
    prNumber: "997/ 97",
    remarks: "வி.ரூ-75000/-",
    schedules: [
      {
        scheduleTitle: "Schedule 1 Details:",
        propertyType: "House Site",
        extent: "1239 சதுரடி",
        villageStreet: "Mallasamudram Kilmugam, மல்லசமுத்திரம் கீழ்முகம்",
        surveyNo: "322/1B, 322/1B3",
        plotNo: "2",
        boundary: "மனைஎண் 1 க்கு (கி) மனைஎண் 3 க்கு (மே), ஷைநெ 20 அடி அகல கிமே பாதைக்கு(தெ) ஆறுமுககவுண்டர் பாகத்திற்கு (வ)...",
      },
    ],
  },
  {
    srNo: 6,
    docNo: "1350/2012",
    execDate: "28-Mar-2012",
    presDate: "28-Mar-2012",
    regDate: "28-Mar-2012",
    nature: "Conveyance Non Metro/UA",
    executants: ["1. ஆர். ரங்கசாமி", "2. காளயிண்ணன்"],
    claimants: ["1. கே. சாமிமுத்து"],
    volPage: "-",
    consideration: "Rs. 80,000/-",
    marketValue: "Rs. 84,000/-",
    prNumber: "997/ 97",
    remarks: "வி.ரூ-80000/-",
    schedules: [
      {
        scheduleTitle: "Schedule 1 Details:",
        propertyType: "House Site",
        extent: "1390 சதுரடி",
        villageStreet: "Mallasamudram Kilmugam, மல்லசமுத்திரம் கீழ்முகம்",
        surveyNo: "322/1B, 322/1B3",
        plotNo: "5",
        boundary: "மனைஎண் 4 க்கு (கி) மனைஎண் 6 க்கு (மே), ஷைநெ 20 அடி அகல கிமே பாதைக்கு(தெ)...",
      },
    ],
  },
  {
    srNo: 7,
    docNo: "1351/2012",
    execDate: "28-Mar-2012",
    presDate: "28-Mar-2012",
    regDate: "28-Mar-2012",
    nature: "Conveyance Non Metro/UA",
    executants: ["1. ஆர். ரங்கசாமி", "2. காளயிண்ணன்"],
    claimants: ["1. டி. லோகேஷ்வரன்"],
    volPage: "-",
    consideration: "Rs. 80,000/-",
    marketValue: "Rs. 80,100/-",
    prNumber: "997/ 97",
    remarks: "வி.ரூ-80000/-",
    schedules: [
      {
        scheduleTitle: "Schedule 1 Details:",
        propertyType: "House Site",
        extent: "1325 சதுரடி",
        villageStreet: "Mallasamudram Kilmugam, மல்லசமுத்திரம் கீழ்முகம்",
        surveyNo: "322/1B, 322/1B3",
        plotNo: "4",
        boundary: "மனைஎண் 3 க்கு (கி) மனைஎண் 5 க்கு (மே), ஷைநெ 20 அடி அகல கிமே பாதைக்கு(தெ)...",
      },
    ],
  },
  {
    srNo: 8,
    docNo: "1352/2012",
    execDate: "28-Mar-2012",
    presDate: "28-Mar-2012",
    regDate: "28-Mar-2012",
    nature: "Conveyance Non Metro/UA",
    executants: ["1. ஆர். ரங்கசாமி", "2. காளயிண்ணன்"],
    claimants: ["1. பி. சிவக்குமார்"],
    volPage: "-",
    consideration: "Rs. 1,50,000/-",
    marketValue: "Rs. 1,63,500/-",
    prNumber: "997/ 97",
    remarks: "வி.ரூ-150000/-மா.ம.ரூ163500/-",
    schedules: [
      {
        scheduleTitle: "Schedule 1 Details:",
        propertyType: "House Site",
        extent: "2703.3/4 சதுரடி",
        villageStreet: "Mallasamudram Kilmugam, மல்லசமுத்திரம் கீழ்முகம்",
        surveyNo: "322/1B, 322/1B3",
        plotNo: "8",
        boundary: "மனை எண் 7 க்கு 20 அடி அகல கிமே பாதைக்கு(கி) ஆறுமுககவுண்டர் பாகத்திற்கு (மே), சுப்பரமணி பாகத்திற்கு (தெ)...",
      },
    ],
  },
  {
    srNo: 9,
    docNo: "1353/2012",
    execDate: "28-Mar-2012",
    presDate: "28-Mar-2012",
    regDate: "28-Mar-2012",
    nature: "Conveyance Non Metro/UA",
    executants: ["1. ஆர். ரங்கசாமி", "2. காளயிண்ணன்"],
    claimants: ["1. ஆர். செல்லமுத்து", "2. ராஜாங்கம்"],
    volPage: "-",
    consideration: "Rs. 75,000/-",
    marketValue: "Rs. 76,500/-",
    prNumber: "997/ 97",
    remarks: "வி.ரூ-75000/-மா.ம.ரூ-76500/-",
    schedules: [
      {
        scheduleTitle: "Schedule 1 Details:",
        propertyType: "House Site",
        extent: "1263 சதுரடி",
        villageStreet: "Mallasamudram Kilmugam, மல்லசமுத்திரம் கீழ்முகம்",
        surveyNo: "322/1B, 322/1B3",
        plotNo: "3",
        boundary: "மனைஎண் 2 க்கு (கி) மனைஎண் 4 க்கு (மே)...",
      },
    ],
  },
  {
    srNo: 10,
    docNo: "1431/2012",
    execDate: "29-Mar-2012",
    presDate: "29-Mar-2012",
    regDate: "29-Mar-2012",
    nature: "Conveyance Non Metro/UA",
    executants: ["1. ஆர். ரங்கசாமி", "2. காளயிண்ணன்"],
    claimants: ["1. G. ரமேஷ்"],
    volPage: "-",
    consideration: "Rs. 95,000/-",
    marketValue: "Rs. 97,200/-",
    prNumber: "997/ 97",
    remarks: "வி.ரூ-95000/-மா.ம.ரூ-97200/-",
    schedules: [
      {
        scheduleTitle: "Schedule 1 Details:",
        propertyType: "House Site",
        extent: "1607 சதுரடி",
        villageStreet: "Mallasamudram Kilmugam, மல்லசமுத்திரம் கீழ்முகம்",
        surveyNo: "322/1B, 322/1B3",
        plotNo: "7",
        boundary: "மனைஎண் 6 க்கு (கி) மனைஎண் 8 க்கு (மே)...",
      },
    ],
  },
  {
    srNo: 11,
    docNo: "1474/2013",
    execDate: "08-Apr-2013",
    presDate: "08-Apr-2013",
    regDate: "08-Apr-2013",
    nature: "Conveyance Non Metro/UA",
    executants: ["1. ஜி. ரமேஷ்"],
    claimants: ["1. கந்தாயி"],
    volPage: "-",
    consideration: "Rs. 2,00,000/-",
    marketValue: "Rs. 2,41,200/-",
    prNumber: "1431/ 12",
    remarks: "வி ரூ.200000 ம ரூ.241200",
    schedules: [
      {
        scheduleTitle: "Schedule 1 Details:",
        propertyType: "House Site",
        extent: "1607 சஅடி",
        villageStreet: "Mallasamudram Kilmugam, மல்லசமுத்திரம் கீழ்முகம்",
        surveyNo: "322/1B, 322/1B3",
        plotNo: "7",
        boundary: "மனைஎண் 6 க்கு (கி) மனைஎண் 8 க்கு (மே)... சகல ஈஸ்ட்மெண்ட் பாத்யங்கள் சகிதம்.",
      },
    ],
  },
  {
    srNo: 12,
    docNo: "2134/2013",
    execDate: "24-May-2013",
    presDate: "24-May-2013",
    regDate: "24-May-2013",
    nature: "Conveyance Non Metro/UA",
    executants: [
      "1. என். பழனிசாமி",
      "2. டி. கணேசன்",
      "3. எம். நல்லதம்பி",
      "4. ஆர். செல்லமுத்து",
      "5. எஸ். ராஜாங்கம்",
    ],
    claimants: ["1. பி. வேல்முருகன்", "2. பி. பழனிவேல்"],
    volPage: "-",
    consideration: "Rs. 5,00,000/-",
    marketValue: "Rs. 5,61,500/-",
    prNumber: "1325/ 2012, 1349/ 2012, 1353/ 2012",
    remarks: "வி.ரூ. 500000/- மா மதிப்பு ரூ. 561500/-",
    schedules: [
      {
        scheduleTitle: "Schedule 1 Details:",
        propertyType: "House Site",
        extent: "3742 சதுரடி",
        villageStreet: "Mallasamudram Kilmugam, மல்லசமுத்திரம் கீழ்முகம்",
        surveyNo: "322/1B, 322/1B3",
        plotNo: "1, 2, 3",
        boundary: "சேலம்-தி.கோடு மெயின்ரோட்டுக்கும் (கி), மனை எண் 4-க்கும் (மே), 20அடி அகல கிமே பாதைக்கும் (தெ), ஆறுமுக கவுண்டர் பாகத்துக்கும் (வ)",
        scheduleRemarks: "சநெ 322/1ஏ3 - பிளாட் நெ 1- கிமே வபு 32அடி தெபு 32அடி தெவ கிபு 40அடி மேபு 37 1/2அடி ஆக 1240 சதுரடி நிலம் பூரா. பிளாட் நெ 2 - கிமே வபு 30அடி தெபு 30 1/4அடி தெவ கிபு 42 1/4அடி மேபு 40அடி ஆக 1239 சதுரடி நிலம் பூரா. பிளாட் நெ 3 - கிமே வபு 296 அடி தெபு 29 1/4அடி தெவ கிபு 44 1/2அடி மேபு 42 1/4அடி ஆக 1263 சதுரடிநிலம் பூரா ஆக மொத்தம் 3742 சதுரடி நிலம் பூரா. பத்திரத்தில் கண்ட சகல ஈஸ்ட்மெண்ட் பாத்யங்கள் சகிதம்.",
      },
    ],
  },
  {
    srNo: 13,
    docNo: "1706/2014",
    execDate: "03-Jun-2014",
    presDate: "04-Jun-2014",
    regDate: "04-Jun-2014",
    nature: "Conveyance Non Metro/UA",
    executants: ["1. பி. வேல்முருகன்", "2. பி. பழனிவேல்"],
    claimants: ["1. இளங்கோவன்"],
    volPage: "-",
    consideration: "Rs. 5,25,000/-",
    marketValue: "Rs. 5,61,500/-",
    prNumber: "-",
    remarks: "வி.ரூ. 525000/- மா மதிப்பு ரூ. 561500/-",
    schedules: [
      {
        scheduleTitle: "Schedule 1 Details:",
        propertyType: "House Site",
        extent: "3742 சதுரடி",
        villageStreet: "Mallasamudram Kilmugam, மல்லசமுத்திரம் கீழ்முகம்",
        surveyNo: "322/1B, 322/1B3",
        plotNo: "1, 2, 3",
        boundary: "சநெ 322/1பி புஏ 1.86 புதுசநெ 322/1பி3 புஹெ 0.15.0க்கு ஏ0.37 வார்டுஎண் 10 பாலிக்காடு தண்ணீர்கிணற்று விதி, மனை எண் 4-க்கும் (மே)சேலம்-தி.கோடு மெயின்ரோட்டுக்கும் (கி)...",
      },
    ],
  },
  {
    srNo: 14,
    docNo: "2378/2014",
    execDate: "18-Aug-2014",
    presDate: "19-Aug-2014",
    regDate: "19-Aug-2014",
    nature: "Agreement",
    executants: ["1. இளங்கோவன்", "2. சி. கனகராஜ்"],
    claimants: ["1. மேற்படி நபர்கள்"],
    volPage: "-",
    consideration: "Rs. 7,50,000/-",
    marketValue: "Rs. 7,50,000/-",
    prNumber: "1706/ 2014",
    remarks: "வி.உ.ரூ. 750000/- முன்பணம் ரூ. 500000/- (சொத்து சுவாதீனம் இல்லை.) குறிப்பு இந்த ஆவணம் 1புத்தகம் 2015ம் ஆண்டு 732 எண் ஆவணத்தால் ரத்து செய்யப்படுகிறது",
    schedules: [
      {
        scheduleTitle: "Schedule 1 Details:",
        propertyType: "House Site",
        extent: "3742 சதுரடி",
        villageStreet: "Mallasamudram Kilmugam, மல்லசமுத்திரம் கீழ்முகம்",
        surveyNo: "322/1B, 322/1B3",
        plotNo: "1, 2, 3",
        boundary: "சநெ 322/1பி புஏ 1.86 புதுசநெ 322/1பி3 புஹெ 0.15.0க்கு ஏ0.37 வார்டுஎண் 10...",
      },
    ],
  },
  {
    srNo: 15,
    docNo: "2792/2014",
    execDate: "15-Sep-2014",
    presDate: "15-Sep-2014",
    regDate: "15-Sep-2014",
    nature: "Conveyance Non Metro/UA",
    executants: ["1. கே. பெருமாள்"],
    claimants: ["1. கே. வேலாயுதம்", "2. ஏ. மணிமேகலை"],
    volPage: "-",
    consideration: "Rs. 2,75,000/-",
    marketValue: "Rs. 2,92,100/-",
    prNumber: "1326/ 2012, 997/ 97",
    remarks: "வி.ரூ-275000/-மாமரூ 292100/-",
    schedules: [
      {
        scheduleTitle: "Schedule 1 Details:",
        propertyType: "House Site",
        extent: "1460 சதுரடி",
        villageStreet: "Mallasamudram Kilmugam, மல்லசமுத்திரம் கீழ்முகம்",
        surveyNo: "322/1B, 322/1B3",
        plotNo: "6",
        boundary: "மனைஎண் 5 க்கு (கி) மனைஎண் 7 க்கு (மே), ஷைநெ 20 அடி அகல கிமே பாதைக்கு(தெ)...",
      },
    ],
  },
  {
    srNo: 16,
    docNo: "4035/2014",
    execDate: "24-Dec-2014",
    presDate: "24-Dec-2014",
    regDate: "24-Dec-2014",
    nature: "Gift Other property",
    executants: ["1. ஆர். ரங்கசாமி", "2. ஆர். காளியண்ணன்"],
    claimants: ["1. ஹெச். ரவிக்குமார்"],
    volPage: "1067, 241",
    consideration: "Rs. 100/-",
    marketValue: "Rs. 100/-",
    prNumber: "638/ 1984, 997/ 1997",
    remarks: "தானம்",
    schedules: [
      {
        scheduleTitle: "Schedule 1 Details:",
        propertyType: "Agricultural Land",
        extent: "4165 சஅடி",
        villageStreet: "Mallasamudram Kilmugam, மல்லசமுத்திரம் கீழ்முகம்",
        surveyNo: "322/1B, 322/1B3",
        boundary: "ச.எ.322/1பி புஏ 1.86க்கு பு ச எ.322/1பி3 புஹெ0.15.0க்கு புஏ 0.37 வார்டு எண்.10 தெரு பாலிக்காடு தண்ணீர் கிணற்று வீதி 4165சஅடிக்கு சக்குபந்தி., ம.எ.8க்கும்(மே) சேலம் டூ திருச்செங்கோடு மெயின் ரோட்டுக்கும்(கி)...",
      },
    ],
  },
  {
    srNo: 17,
    docNo: "732/2015",
    execDate: "02-Mar-2015",
    presDate: "02-Mar-2015",
    regDate: "03-Mar-2015",
    nature: "Cancellation",
    executants: ["1. இளங்கோவன்", "2. சி. கனகராஜ்"],
    claimants: ["1. மேற்படி நபர்கள்"],
    volPage: "-",
    consideration: "-",
    marketValue: "-",
    prNumber: "2378/ 2014",
    remarks: "வி.உ.ரத்துப்பத்திரம் குறிப்பு இந்த ஆவணம் 1புத்தகம் 2014ம் ஆண்டு 2378 எண் ஆவணத்தை ரத்து செய்கிறது (சொத்து சுவாதீனம் இல்லை.)",
    schedules: [
      {
        scheduleTitle: "Schedule 1 Details:",
        propertyType: "House Site",
        extent: "3742 சதுரடி",
        villageStreet: "Mallasamudram Kilmugam, மல்லசமுத்திரம் கீழ்முகம்",
        surveyNo: "322/1B, 322/1B3",
        plotNo: "1, 2, 3",
        boundary: "சநெ 322/1பி புஏ 1.86 புதுசநெ 322/1பி3 புஹெ 0.15.0க்கு ஏ0.37 வார்டுஎண் 10...",
      },
    ],
  },
  {
    srNo: 18,
    docNo: "1229/2015",
    execDate: "13-Apr-2015",
    presDate: "13-Apr-2015",
    regDate: "13-Apr-2015",
    nature: "Settlement-family members",
    executants: ["1. இளங்கோவன்"],
    claimants: ["1. எம் . கலைவாணி"],
    volPage: "-",
    consideration: "Rs. 7,48,500/-",
    marketValue: "-",
    prNumber: "-",
    remarks: "தாசெரூ 748500/-மனைவிக்கு",
    schedules: [
      {
        scheduleTitle: "Schedule 3 Details:",
        propertyType: "House Site",
        extent: "1263",
        villageStreet: "Mallasamudram Kilmugam, மல்லசமுத்திரம் கீழ்முகம்",
        surveyNo: "322/1B, 322/1B3",
        boundary: "சநெ 322/1பி புஏ 1.86 புதுசநெ 322/1பி3...",
      },
    ],
  },
  {
    srNo: 19,
    docNo: "1650/2015",
    execDate: "25-May-2015",
    presDate: "26-May-2015",
    regDate: "26-May-2015",
    nature: "Deposit of Title Deeds If loan is repayable on demand",
    executants: ["1. எம் . கலைவாணி"],
    claimants: ["1. REPCO HOME FINANCE LTD (RHFL) SALEM"],
    volPage: "-",
    consideration: "Rs. 40,00,000/-",
    marketValue: "Rs. 40,00,000/-",
    prNumber: "-",
    remarks: "உரிமை ஆவணங்கள் ஒப்படைப்பு ரூ4000000/-",
    schedules: [
      {
        scheduleTitle: "Schedule 1 Details:",
        propertyType: "House Site",
        extent: "1240 சதுரடி",
        villageStreet: "Mallasamudram Kilmugam, மல்லசமுத்திரம் கீழ்முகம்",
        surveyNo: "322/1B, 322/1B3",
        plotNo: "1, 2, 3",
        boundary: "சநெ 322/1பி புஏ 1.86 புதுசநெ 322/1பி3 புஹெ 0.15.0க்கு ஏ0.37 வார்டுஎண் 10 பாலிக்காடு தண்ணீர்கிணற்று விதி, சேலம்-தி.கோடு மெயின்ரோட்டுக்கும் (கி)...",
      },
      {
        scheduleTitle: "Schedule 2 Details:",
        propertyType: "House Site",
        extent: "1239",
        villageStreet: "Mallasamudram Kilmugam, மல்லசமுத்திரம் கீழ்முகம்",
        surveyNo: "322/1B, 322/1B3",
        boundary: "அயிட்டம் 2மேற்படி 1வதுஅயிட்ட நிலத்திற்கும் (கி) 3வதுஅயிட்ட நிலத்திற்கும் (மே)...",
      },
      {
        scheduleTitle: "Schedule 3 Details:",
        propertyType: "House Site",
        extent: "1263",
        villageStreet: "Mallasamudram Kilmugam, மல்லசமுத்திரம் கீழ்முகம்",
        surveyNo: "322/1B, 322/1B3",
        boundary: "2வதுஅயிட்ட நிலத்திற்கும் (கி) தமிழரசன் மகன் டி லோகேஸ்வரன் கிரயம் பெற்ற நிலத்திற்கும் (மே)...",
      },
    ],
  },
  {
    srNo: 20,
    docNo: "169/2018",
    execDate: "23-Jan-2018",
    presDate: "23-Jan-2018",
    regDate: "23-Jan-2018",
    nature: "Conveyance Non Metro/UA",
    executants: ["1. பி. சிவக்குமார்"],
    claimants: ["1. டி. ரேணுகா"],
    volPage: "-",
    consideration: "Rs. 3,62,500/-",
    marketValue: "Rs. 3,62,500/-",
    prNumber: "1352/2012/",
    remarks: "வி ரூ.3, 62, 500/- (மு.ஆ.எண்.1352/2012)",
    schedules: [
      {
        scheduleTitle: "Schedule 1 Details:",
        propertyType: "House Site",
        extent: "2703 3/4 ச அடி",
        villageStreet: "Mallasamudram Kilmugam, PALIKADU ARUNDHATHIYAR COLONY",
        surveyNo: "322/1B, 322/1B3",
        plotNo: "8",
        boundary: "ஷை மனைப்பிரிவில் மனை எண். 7 க்கும், 20அடி அகல கிழமேல் பாதைக்கும் கிழக்கு, ஆறுமுக கவுண்டர் நிலத்திற்கும் மேற்கும், வடக்கும், சுப்பரமணி நிலத்திற்கும் தெற்கு, ச.நெ.322/1பி, 322/1பி3...",
      },
    ],
  },
  {
    srNo: 21,
    docNo: "305/2018",
    execDate: "31-Jan-2018",
    presDate: "31-Jan-2018",
    regDate: "31-Jan-2018",
    nature: "Conveyance Non Metro/UA",
    executants: [
      "1. டி.என். ராஜேந்திரன் (பவர் ஏஜெண்ட்)",
      "2. ஆர். சத்தியகலா (பவர் ஏஜெண்ட்)",
      "3. ஆர். சிவலிங்கம் (பவர் ஏஜெண்ட்)",
      "4. ஜி. பாலாமணி (முதல்வர்)... (மொத்தம் 18 நபர்கள்)",
    ],
    claimants: ["1. டி.என். ராஜேந்திரன்", "2. ஆர். சத்தியகலா"],
    volPage: "1067, 241",
    consideration: "Rs. 20,00,000/-",
    marketValue: "Rs. 20,00,000/-",
    prNumber: "570/83, 1710/06, 262/79, 2564/62",
    remarks: "வி ரூ.20, 00, 000/- (மு.ஆ.எண்.570/83, 1710/06, 262/79, 2564/62, 674/03, 1552/96, 763/1998, 1100/1997, 679/2005)",
    schedules: [
      {
        scheduleTitle: "Schedule 1 Details:",
        propertyType: "Agricultural Land",
        extent: "0.32 செண்ட்",
        villageStreet: "Mallasamudram Kilmugam, மல்லசமுத்திரம் கீழ்முகம்",
        surveyNo: "216/4B, 216/5, 229/5, 287/1, 288/2, 322/1B1, 322/1B1A, 322/1B1B",
        boundary: "ச.நெ.216/5 ந.ஏ.0.32 க்கு தீ.ரூ.2.45 இந்த நிலம் பூராவும், இதற்கு செக்குப்பந்தி, சேலம் டூ திருச்செங்கோடு மெயின் ரோட்டிற்கும் மேற்கு...",
      },
    ],
  },
  {
    srNo: 22,
    docNo: "2157/2021",
    execDate: "25-Jun-2021",
    presDate: "25-Jun-2021",
    regDate: "25-Jun-2021",
    nature: "Sale deed",
    executants: ["1. டி .என். ராஜேந்திரன்", "2. ஆர்.சத்தியகலா"],
    claimants: ["1. மாலதி"],
    volPage: "-",
    consideration: "Rs. 7,89,000/-",
    marketValue: "Rs. 3,50,544/-",
    prNumber: "305/2018",
    remarks: "-",
    schedules: [
      {
        scheduleTitle: "Schedule 1 Details:",
        propertyType: "Plot",
        extent: "2616.0 SQUARE FEET",
        villageStreet: "Mallasamudram Kilmugam, PALIKADU ARUNDHATHIYAR COLONY",
        surveyNo: "322/1B1A",
        boundary: "கிழக்கு - சீரங்கன் வகையரா மீதி நிலத்திற்கும் மேற்கு,, மேற்கு - ஆட்டையாம்பட்டி டு திருச்செங்கோடு செல்லும் மெயின் ரோட்டிற்கும் கிழக்கு,, வடக்கு - அருந்ததியர் தெருவிற்கும் தெற்கு, தெற்கு - அமிர்தவேல் மனைவி மணி (எ) வள்ளியம்மாள் நிலத்திற்கும் வடக்கு,",
      },
    ],
  },
];

/**
 * Entry 22 Schedule 2 (Subdivision 1B1B):
 * Extent: 3270.0 SQUARE FEET, Market Value: Rs. 4,38,456/-, Survey No: 322/1B1B
 */
const ENTRY_22_1B1B: ECEntry = {
  srNo: 22,
  docNo: "2157/2021",
  execDate: "25-Jun-2021",
  presDate: "25-Jun-2021",
  regDate: "25-Jun-2021",
  nature: "Sale deed",
  executants: ["1. டி .என். ராஜேந்திரன்", "2. ஆர்.சத்தியகலா"],
  claimants: ["1. மாலதி"],
  volPage: "-",
  consideration: "Rs. 7,89,000/-",
  marketValue: "Rs. 4,38,456/-",
  prNumber: "305/2018",
  remarks: "-",
  schedules: [
    {
      scheduleTitle: "Schedule 2 Details:",
      propertyType: "Plot",
      extent: "3270.0 SQUARE FEET",
      villageStreet: "Mallasamudram Kilmugam, PALIKADU ARUNDHATHIYAR COLONY",
      surveyNo: "322/1B1B",
      boundary: "கிழக்கு - முனியன் வகையரா நிலத்திற்கும் மேற்கு, மேற்கு - 1 அயிட்ட நிலத்திற்கும் கிழக்கு, வடக்கு - அருந்ததியர் தெருவிற்கும் தெற்கு, , தெற்கு - சுப்ரமணி நிலத்திற்கும் வடக்கு",
      scheduleRemarks: "சர்வே எண் 322/1B1Aல் 2616 சதுரடியும், சர்வே எண் 322/1B1Bல் 3270 சதுரடிகளும் ஆக கூடுதல் 5886சதுரடிகள் பூராவும்",
    },
  ],
};

/**
 * Dynamically resolves the 22 authentic transactions for Survey 322 based on subdivision (1B1A vs 1B1B vs 1B).
 */
export function getMallasamudram322Entries(subDivision?: string): ECEntry[] {
  const cleanSub = (subDivision || "").toUpperCase().replace(/\s+/g, "");
  const baseEntries = MALLASAMUDRAM_322_ENTRIES.slice(0, 21);

  if (cleanSub === "1B1B" || cleanSub.endsWith("1B1B") || cleanSub.includes("1B1B")) {
    return [...baseEntries, ENTRY_22_1B1B];
  }

  if (cleanSub === "1B" || cleanSub === "1B1") {
    // Parent survey covering both Schedule 1 and Schedule 2
    const combinedEntry22: ECEntry = {
      ...MALLASAMUDRAM_322_ENTRIES[21],
      marketValue: "Rs. 7,89,000/-",
      schedules: [
        MALLASAMUDRAM_322_ENTRIES[21].schedules![0],
        ENTRY_22_1B1B.schedules![0],
      ],
    };
    return [...baseEntries, combinedEntry22];
  }

  // Default to Schedule 1 (1B1A)
  return [...baseEntries, MALLASAMUDRAM_322_ENTRIES[21]];
}

/**
 * Builds authentic bilingual HTML for TNREGINET Certificate of Encumbrance.
 */
export function buildOfficialTnreginetECHtml(options: {
  zone: string;
  district: string;
  sro: string;
  village: string;
  surveyNumber: string;
  subDivision: string;
  startDate: string;
  endDate: string;
  entries: ECEntry[];
}): string {
  const {
    zone,
    district,
    sro,
    village,
    surveyNumber,
    subDivision,
    startDate,
    endDate,
    entries,
  } = options;

  const today = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formattedToday = `${String(today.getDate()).padStart(2, "0")}-${months[today.getMonth()]}-${today.getFullYear()}`;

  const surveyDetails = subDivision ? `${surveyNumber}/${subDivision}` : surveyNumber;
  const isNil = entries.length === 0;

  let entriesRowsHtml = "";

  if (isNil) {
    entriesRowsHtml = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 24px 12px; background: #fff;">
          <div style="font-size: 15px; font-weight: bold; color: #166534; margin-bottom: 6px;">
            ✔ எவ்வித வில்லங்கமும் காணப்படவில்லை (NIL ENCUMBRANCE)
          </div>
          <div style="font-size: 12px; color: #475569;">
            தேடப்பட்ட காலத்திற்குள் (${startDate} முதல் ${endDate} வரை) இச்சொத்தின் மீது பதிவு செய்யப்பட்ட வில்லங்க பதிவுகள் எதுவும் காணப்படவில்லை.
          </div>
        </td>
      </tr>
    `;
  } else {
    entriesRowsHtml = entries
      .map((entry) => {
        let schedulesHtml = "";
        if (entry.schedules && entry.schedules.length > 0) {
          schedulesHtml = entry.schedules
            .map(
              (s) => `
            <div class="schedule-block">
              <div class="schedule-title"><strong>${s.scheduleTitle}</strong></div>
              <div class="schedule-grid">
                <div class="sg-item"><strong>Property Type/சொத்தின் வகைப்பாடு:</strong> ${s.propertyType}</div>
                <div class="sg-item"><strong>Property Extent/சொத்தின் விஸ்தீர்ணம்:</strong> ${s.extent}</div>
                <div class="sg-item"><strong>Village & Street/கிராமம் மற்றும் தெரு:</strong> ${s.villageStreet}</div>
                <div class="sg-item"><strong>Survey No./புல எண்:</strong> ${s.surveyNo}</div>
                ${s.plotNo ? `<div class="sg-item"><strong>Plot No./மனை எண்:</strong> ${s.plotNo}</div>` : ""}
              </div>
              <div class="boundary-block">
                <strong>Boundary Details:</strong><br/>
                ${s.boundary}
              </div>
              ${
                s.scheduleRemarks
                  ? `<div class="boundary-block" style="margin-top: 4px;">
                      <strong>Schedule Remarks/சொத்து விவரம் தொடர்பான குறிப்புரை:</strong> ${s.scheduleRemarks}
                    </div>`
                  : ""
              }
            </div>
          `
            )
            .join("");
        }

        return `
          <!-- Entry #${entry.srNo} -->
          <tr class="entry-header-row">
            <td rowspan="2" class="text-center font-bold" style="vertical-align: top; width: 45px;">${entry.srNo}</td>
            <td class="font-bold" style="width: 110px;">${entry.docNo}</td>
            <td style="width: 140px; font-size: 11px;">
              ${entry.execDate}<br/>
              ${entry.presDate}<br/>
              ${entry.regDate}
            </td>
            <td style="width: 130px; font-weight: 500;">${entry.nature}</td>
            <td style="font-size: 11px;">${entry.executants.join("<br/>")}</td>
            <td style="font-size: 11px;">${entry.claimants.join("<br/>")}</td>
            <td style="width: 90px; text-align: center;">${entry.volPage || "-"}</td>
          </tr>
          <tr class="entry-detail-row">
            <td colspan="6" style="padding: 6px 10px; background: #fafafa;">
              <div class="financials-bar">
                <span><strong>Consideration Value/கைமாற்றுத் தொகை:</strong> ${entry.consideration}</span>
                <span><strong>Market Value/சந்தை மதிப்பு:</strong> ${entry.marketValue}</span>
                <span><strong>PR Number/முந்தைய ஆவண எண்:</strong> ${entry.prNumber}</span>
              </div>
              ${
                entry.remarks && entry.remarks !== "-"
                  ? `<div class="remarks-box">
                      <strong>Document Remarks/ஆவணக் குறிப்புகள்:</strong> ${entry.remarks}
                    </div>`
                  : ""
              }
              ${schedulesHtml}
            </td>
          </tr>
        `;
      })
      .join("");
  }

  return `<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <title>Certificate of Encumbrance on Property - ${surveyDetails}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 8mm 10mm;
    }
    body {
      font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
      margin: 0;
      padding: 10px;
      color: #000;
      background: #fff;
      font-size: 11px;
      line-height: 1.35;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
    }
    .emblem-cell {
      width: 80px;
      text-align: center;
      vertical-align: middle;
    }
    .emblem-img {
      width: 65px;
      height: 65px;
      object-fit: contain;
    }
    .title-cell {
      text-align: center;
      vertical-align: middle;
    }
    .title-cell h1 {
      font-size: 14px;
      font-weight: bold;
      margin: 0;
      letter-spacing: 0.5px;
    }
    .title-cell h2 {
      font-size: 13px;
      font-weight: bold;
      margin: 2px 0;
    }
    .title-cell h3 {
      font-size: 13px;
      font-weight: bold;
      margin: 3px 0 0;
    }
    .meta-box {
      width: 100%;
      border: 1px solid #000;
      border-collapse: collapse;
      font-size: 11px;
      margin-bottom: 8px;
    }
    .meta-box td {
      border: 1px solid #000;
      padding: 4px 8px;
    }
    .search-period-banner {
      font-size: 12px;
      font-weight: bold;
      margin: 6px 0 8px 0;
    }
    .main-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #000;
      font-size: 11px;
      margin-bottom: 10px;
    }
    .main-table th {
      border: 1px solid #000;
      padding: 5px 6px;
      background: #f1f1f1;
      font-weight: bold;
      text-align: center;
      vertical-align: middle;
    }
    .main-table td {
      border: 1px solid #000;
      padding: 5px 6px;
      vertical-align: top;
    }
    .zone-row td {
      background: #fafafa;
      font-weight: bold;
      text-align: center;
      border: 1px solid #000;
      padding: 4px;
      font-size: 11px;
    }
    .text-center { text-align: center; }
    .font-bold { font-weight: bold; }
    .financials-bar {
      display: flex;
      gap: 20px;
      font-size: 11px;
      margin-bottom: 4px;
      border-bottom: 1px dashed #ccc;
      padding-bottom: 3px;
    }
    .remarks-box {
      font-size: 10.5px;
      margin: 4px 0;
      color: #111;
    }
    .schedule-block {
      margin-top: 6px;
      padding-top: 4px;
      border-top: 1px solid #ddd;
    }
    .schedule-title {
      font-weight: bold;
      text-decoration: underline;
      margin-bottom: 2px;
    }
    .schedule-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 2px 15px;
      font-size: 10.5px;
      margin-bottom: 4px;
    }
    .boundary-block {
      font-size: 10.5px;
      background: #fff;
      padding: 2px 0;
    }
    .summary-section {
      font-weight: bold;
      font-size: 11.5px;
      margin: 8px 0;
    }
    .disclaimer-text {
      font-size: 10px;
      color: #333;
      margin-bottom: 4px;
      line-height: 1.3;
    }
    .helpdesk-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #000;
      font-size: 10.5px;
      margin-top: 8px;
    }
    .helpdesk-table th, .helpdesk-table td {
      border: 1px solid #000;
      padding: 4px 8px;
      text-align: center;
    }
    .helpdesk-table th {
      background: #f1f1f1;
    }
  </style>
</head>
<body>
  <!-- Header with Government Emblem -->
  <table class="header-table">
    <tr>
      <td class="emblem-cell">
        <svg class="emblem-img" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#14532d" stroke="#166534" stroke-width="2"/>
          <circle cx="50" cy="50" r="41" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
          <!-- Gopuram temple outline -->
          <polygon points="50,15 42,28 58,28" fill="#854d0e"/>
          <polygon points="50,26 40,42 60,42" fill="#a16207"/>
          <polygon points="50,38 36,60 64,60" fill="#ca8a04"/>
          <rect x="42" y="60" width="16" height="18" fill="#78350f"/>
          <!-- Tamil text simulation curve -->
          <path d="M 22 76 Q 50 88 78 76" fill="none" stroke="#14532d" stroke-width="3"/>
        </svg>
      </td>
      <td class="title-cell">
        <h1>GOVERNMENT OF TAMILNADU</h1>
        <h1>REGISTRATION DEPARTMENT</h1>
        <h2>தமிழ்நாடு அரசு</h2>
        <h2>பதிவுத்துறை</h2>
        <h3>Certificate of Encumbrance on Property (ENCUMBRANCE CERTIFICATE)</h3>
        <h3>சொத்து தொடர்பான வில்லங்கச் சான்று</h3>
      </td>
    </tr>
  </table>

  <!-- Meta Box -->
  <table class="meta-box">
    <tr>
      <td style="width: 50%;"><strong>S.R.O /சா.ப.அ:</strong> ${sro}</td>
      <td style="width: 50%;"><strong>Date / நாள்:</strong> ${formattedToday}</td>
    </tr>
    <tr>
      <td><strong>Village /கிராமம்:</strong> ${village}</td>
      <td><strong>Survey Details /சர்வே விவரம்:</strong> ${surveyDetails}</td>
    </tr>
    <tr>
      <td colspan="2">
        Data Availability Period for Village: ${village}<br/>
        ${sro} Sub Registrar Office: From ${startDate} To ${endDate}
      </td>
    </tr>
  </table>

  <div class="search-period-banner">
    Search Period /தேடுதல் காலம்: ${startDate} - ${endDate}
  </div>

  <!-- Main Entries Table -->
  <table class="main-table">
    <thead>
      <tr>
        <th style="width: 45px;">Sr. No./<br/>வ. எண்</th>
        <th style="width: 110px;">Document No.&amp; Year/<br/>ஆவண எண் மற்றும் ஆண்டு</th>
        <th style="width: 140px;">Date of Execution &amp; Date of Presentation &amp; Date of Registration/<br/>எழுதிக் கொடுத்த நாள் &amp; தாக்கல் நாள் &amp; பதிவு நாள்</th>
        <th style="width: 130px;">Nature/<br/>தன்மை</th>
        <th>Name of Executant(s)/<br/>எழுதிக் கொடுத்தவர்(கள்)</th>
        <th>Name of Claimant(s)/<br/>எழுதி வாங்கியவர்(கள்)</th>
        <th style="width: 90px;">Vol.No &amp; Page. No/<br/>தொகுதி எண் மற்றும் பக்க எண்</th>
      </tr>
      <tr class="zone-row">
        <td colspan="7">
          Zone: ${zone} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          District: ${district} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          S.R.O: ${sro}
        </td>
      </tr>
    </thead>
    <tbody>
      ${entriesRowsHtml}
    </tbody>
  </table>

  <!-- Summary Footer -->
  <div class="summary-section">
    Number of Entries/பதிவுகளின் எண்ணிக்கை: ${entries.length}
  </div>

  <div class="disclaimer-text">
    <strong>Disclaimer:</strong> The details of the above property have been provided with due care and with reference to the Acts and Rules. However in case of any error or omission, the Department cannot be held responsible. The above details are of informative in nature.
  </div>
  <div class="disclaimer-text">
    <strong>குறிப்புரை:</strong> சட்டம் மற்றும் விதிகளுக்குட்பட்டு மிகுந்த கவனத்துடன் சொத்து தொடர்பான மேற்கண்ட விவரங்கள் அளிக்கப்பட்டுள்ளது எனினும் இதில் ஏதேனும் தவறுகளோ விடல்களோ இருப்பின், அதற்கு இத்துறை பொறுப்பேற்க இயலாது. மேற்கண்ட விவரங்கள் தகவலுக்காக அளிக்கப்பட்டுள்ளன
  </div>

  <!-- Helpdesk table -->
  <table class="helpdesk-table">
    <thead>
      <tr>
        <th colspan="2">ஏதேனும் சந்தேகங்கள்/குறைகள் இருப்பின் கீழ்க்கண்ட வழிமுறைகளில் தெரிவிக்கலாம்<br/>கட்டணமில்லா தொலைபேசி எண்</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="width: 50%;"><strong>கட்டணமில்லா தொலைபேசி எண்:</strong> 1800 102 5174</td>
        <td style="width: 50%;"><strong>மின்னஞ்சல் முகவரி:</strong> helpdesk@tnreginet.net</td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;
}

