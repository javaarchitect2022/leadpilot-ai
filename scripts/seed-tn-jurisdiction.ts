import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface JurisdictionData {
  zone: string;
  district: string;
  sro: string;
  villages: string[];
}

const TN_JURISDICTIONS: JurisdictionData[] = [
  // ZONE 1: CHENNAI
  // District: Chennai
  {
    zone: "Chennai",
    district: "Chennai",
    sro: "Central Chennai",
    villages: ["Triplicane", "Mylapore", "Royapettah", "Thousand Lights", "T. Nagar", "Nungambakkam"],
  },
  {
    zone: "Chennai",
    district: "Chennai",
    sro: "North Chennai",
    villages: ["George Town", "Royapuram", "Tondiarpet", "Washermanpet", "Harbour"],
  },
  {
    zone: "Chennai",
    district: "Chennai",
    sro: "South Chennai",
    villages: ["Saidapet", "Guindy", "Velachery", "Adyar", "Besant Nagar", "Thiruvanmiyur"],
  },
  {
    zone: "Chennai",
    district: "Chennai",
    sro: "Anna Nagar",
    villages: ["Anna Nagar", "Aminjikarai", "Kilpauk", "Shenoy Nagar", "Arumbakkam"],
  },
  {
    zone: "Chennai",
    district: "Chennai",
    sro: "Ashok Nagar",
    villages: ["Ashok Nagar", "K.K. Nagar", "Vadapalani", "West Mambalam", "Jafferkhanpet"],
  },
  {
    zone: "Chennai",
    district: "Chennai",
    sro: "Kodambakkam",
    villages: ["Kodambakkam", "Saligramam", "Virugambakkam", "Kalaignar Karunanidhi Nagar"],
  },
  {
    zone: "Chennai",
    district: "Chennai",
    sro: "Mylapore",
    villages: ["Mylapore", "Mandaveli", "Santhome", "R.A. Puram", "Alwarpet", "Luz"],
  },
  {
    zone: "Chennai",
    district: "Chennai",
    sro: "Perambur",
    villages: ["Perambur", "Vyasarpadi", "Kolathur", "Sembium", "Peravallur"],
  },
  {
    zone: "Chennai",
    district: "Chennai",
    sro: "Purasawalkam",
    villages: ["Purasawalkam", "Vepery", "Otteri", "Choolai", "Periamet"],
  },
  {
    zone: "Chennai",
    district: "Chennai",
    sro: "Royapuram",
    villages: ["Royapuram", "Kasimedu", "Korukkupet", "Stanley"],
  },
  {
    zone: "Chennai",
    district: "Chennai",
    sro: "T. Nagar",
    villages: ["T. Nagar", "West Mambalam", "CIT Nagar", "Habibullah Road", "Pondy Bazaar"],
  },
  {
    zone: "Chennai",
    district: "Chennai",
    sro: "Triplicane",
    villages: ["Triplicane", "Chepauk", "Royapettah", "Ice House", "Mirbakshi Ali Street"],
  },
  {
    zone: "Chennai",
    district: "Chennai",
    sro: "Villivakkam",
    villages: ["Villivakkam", "Konnur", "Padi", "Mogappair", "Sidco Nagar"],
  },

  // District: Chengalpattu
  {
    zone: "Chennai",
    district: "Chengalpattu",
    sro: "Tambaram",
    villages: ["Tambaram", "Mudichur", "Perungalathur", "Peerkankaranai", "Irumbuliyur", "Selaiyur", "Kadaperi", "Padappai"],
  },
  {
    zone: "Chennai",
    district: "Chengalpattu",
    sro: "Guduvanchery",
    villages: ["Guduvanchery", "Nandivaram", "Urapakkam", "Maraimalai Nagar", "Kattankulathur", "Kayarambedu", "Potheri"],
  },
  {
    zone: "Chennai",
    district: "Chengalpattu",
    sro: "Pallavaram",
    villages: ["Pallavaram", "Chromepet", "Zamin Pallavaram", "Hasthinapuram", "Nemilichery", "Keelkattalai"],
  },
  {
    zone: "Chennai",
    district: "Chengalpattu",
    sro: "Alandur",
    villages: ["Alandur", "St. Thomas Mount", "Pazhavanthangal", "Nanganallur", "Meenambakkam", "Madipakkam"],
  },
  {
    zone: "Chennai",
    district: "Chengalpattu",
    sro: "Chengalpattu Joint",
    villages: ["Chengalpattu Town", "Alapakkam", "Melamaiyur", "Vallam", "Paranur", "Pulipakkam", "Singaperumal Koil"],
  },
  {
    zone: "Chennai",
    district: "Chengalpattu",
    sro: "Thiruporur",
    villages: ["Thiruporur", "Kelambakkam", "Kalavakkam", "Thaiyur", "Siruseri", "Navalur", "Kazhipattur", "Padur", "Egattur"],
  },
  {
    zone: "Chennai",
    district: "Chengalpattu",
    sro: "Maduranthakam",
    villages: ["Maduranthakam", "Karunguzhi", "Acharapakkam", "Vedanthangal", "Padalam"],
  },
  {
    zone: "Chennai",
    district: "Chengalpattu",
    sro: "Cheyyur",
    villages: ["Cheyyur", "Pavinjur", "Chunampet", "Seekinankuppam", "Mudaliarkuppam"],
  },

  // District: Kanchipuram
  {
    zone: "Chennai",
    district: "Kanchipuram",
    sro: "Kanchipuram Joint I",
    villages: ["Big Kanchipuram", "Little Kanchipuram", "Orikkai", "Sevilimedu", "Ozhukarai"],
  },
  {
    zone: "Chennai",
    district: "Kanchipuram",
    sro: "Kanchipuram Joint II",
    villages: ["Konerikuppam", "Nathapettai", "Thenambakkam", "Pillayarpalayam"],
  },
  {
    zone: "Chennai",
    district: "Kanchipuram",
    sro: "Sriperumbudur",
    villages: ["Sriperumbudur", "Mambakkam", "Pondur", "Irungattukottai", "Nemili", "Vallam", "Pillaipakkam"],
  },
  {
    zone: "Chennai",
    district: "Kanchipuram",
    sro: "Walajabad",
    villages: ["Walajabad", "Muthialpet", "Thenneri", "Ekanapuram", "Parandur", "Singadivakkam"],
  },
  {
    zone: "Chennai",
    district: "Kanchipuram",
    sro: "Uthiramerur",
    villages: ["Uthiramerur", "Kaliyampoondi", "Manampathi", "Thirupulivanam", "Kattankulam"],
  },

  // District: Thiruvallur
  {
    zone: "Chennai",
    district: "Thiruvallur",
    sro: "Thiruvallur Joint",
    villages: ["Thiruvallur Town", "Ikkadu", "Putlur", "Manavala Nagar", "Sevvapet", "Thirupachur"],
  },
  {
    zone: "Chennai",
    district: "Thiruvallur",
    sro: "Poonamallee",
    villages: ["Poonamallee", "Kattupakkam", "Senneerkuppam", "Karayanchavadi", "Mangadu", "Porur", "Iyyappanthangal"],
  },
  {
    zone: "Chennai",
    district: "Thiruvallur",
    sro: "Avadi",
    villages: ["Avadi", "Paruthipattu", "Kovilpathagai", "Mitnamallee", "Pattabiram", "Morai"],
  },
  {
    zone: "Chennai",
    district: "Thiruvallur",
    sro: "Ambattur",
    villages: ["Ambattur", "Korattur", "Mannurpet", "Athipattu", "Menambedu", "Kallikuppam"],
  },
  {
    zone: "Chennai",
    district: "Thiruvallur",
    sro: "Redhills",
    villages: ["Redhills", "Naravarikuppam", "Padianallur", "Puzhal", "Grant Lyon", "Sholavaram"],
  },
  {
    zone: "Chennai",
    district: "Thiruvallur",
    sro: "Ponneri",
    villages: ["Ponneri", "Minjur", "Athipattu Pudunagar", "Arani", "Chinnakavanam", "Kattupalli"],
  },
  {
    zone: "Chennai",
    district: "Thiruvallur",
    sro: "Gummidipoondi",
    villages: ["Gummidipoondi", "Elavur", "Arambakkam", "Sunnambukulam", "Kallur"],
  },

  // ZONE 2: COIMBATORE
  {
    zone: "Coimbatore",
    district: "Coimbatore",
    sro: "Coimbatore Joint I",
    villages: ["Town Hall", "R.S. Puram", "Ramnagar", "Gandhipuram", "Peelamedu", "Race Course"],
  },
  {
    zone: "Coimbatore",
    district: "Coimbatore",
    sro: "Coimbatore Joint II",
    villages: ["Singanallur", "Ramanathapuram", "Ondipudur", "Uppilipalayam", "Sowripalayam"],
  },
  {
    zone: "Coimbatore",
    district: "Coimbatore",
    sro: "Ganapathy",
    villages: ["Ganapathy", "Saravanampatti", "Chinnavedampatti", "Vilankurichi", "Kalapatti"],
  },
  {
    zone: "Coimbatore",
    district: "Coimbatore",
    sro: "Pollachi",
    villages: ["Pollachi Town", "Achipatti", "Suleeswaranpatti", "Mahalingapuram", "Annamalai"],
  },
  {
    zone: "Coimbatore",
    district: "Coimbatore",
    sro: "Mettupalayam",
    villages: ["Mettupalayam Town", "Sirumugai", "Karamadai", "Bellathi", "Odanthurai"],
  },
  {
    zone: "Coimbatore",
    district: "Coimbatore",
    sro: "Sulur",
    villages: ["Sulur", "Kalangal", "Kannampalayam", "Ravathur", "Neelambur", "Irugur"],
  },
  {
    zone: "Coimbatore",
    district: "Tiruppur",
    sro: "Tiruppur Joint I",
    villages: ["Tiruppur Fort", "Nallur", "Chettipalayam", "Mannarai", "Thottipalayam"],
  },
  {
    zone: "Coimbatore",
    district: "Tiruppur",
    sro: "Tiruppur Joint II",
    villages: ["Velampalayam", "Neruperichal", "Anupparpalayam", "Perumanallur"],
  },
  {
    zone: "Coimbatore",
    district: "Tiruppur",
    sro: "Avinashi",
    villages: ["Avinashi", "Karumathampatti", "Sevur", "Palangarai", "Kaniyur"],
  },
  {
    zone: "Coimbatore",
    district: "Tiruppur",
    sro: "Palladam",
    villages: ["Palladam", "Karaipudur", "Pongalur", "Samalapuram", "Koduvai"],
  },
  {
    zone: "Coimbatore",
    district: "Erode",
    sro: "Erode Joint I",
    villages: ["Erode Fort", "Surampatti", "Periyasemur", "Veerappanchatram", "Brahmana Periya Agraharam"],
  },
  {
    zone: "Coimbatore",
    district: "Erode",
    sro: "Erode Joint II",
    villages: ["Kasipalayam", "Solar", "Thindal", "Modakkurichi", "Chithode"],
  },
  {
    zone: "Coimbatore",
    district: "Erode",
    sro: "Gobichettipalayam",
    villages: ["Gobichettipalayam", "Lakkampatti", "Modachur", "Kolappalur", "Kavindapadi"],
  },
  {
    zone: "Coimbatore",
    district: "Nilgiris",
    sro: "Udhagamandalam",
    villages: ["Ooty Town", "Fingerpost", "Lovedale", "Ketti", "Fernhill", "Dodabetta"],
  },
  {
    zone: "Coimbatore",
    district: "Nilgiris",
    sro: "Coonoor",
    villages: ["Coonoor Town", "Wellington", "Kotagiri", "Aruvankadu", "Hubbathalai"],
  },

  // ZONE 3: MADURAI
  {
    zone: "Madurai",
    district: "Madurai",
    sro: "Madurai South",
    villages: ["Madurai South", "Thiruparankundram", "Villapuram", "Jaihindpuram", "Avaniyapuram", "Palanganatham"],
  },
  {
    zone: "Madurai",
    district: "Madurai",
    sro: "Madurai North",
    villages: ["Tallakulam", "K.K. Nagar", "Sellur", "Goripalayam", "Othakadai", "Bibikulam", "Anna Nagar"],
  },
  {
    zone: "Madurai",
    district: "Madurai",
    sro: "Melur",
    villages: ["Melur Town", "Kottampatti", "Uranganpatti", "Navinipatti", "Therku Theru"],
  },
  {
    zone: "Madurai",
    district: "Madurai",
    sro: "Thirumangalam",
    villages: ["Thirumangalam", "Kappalur", "Maravankulam", "Kallikudi", "T.Kallupatti"],
  },
  {
    zone: "Madurai",
    district: "Dindigul",
    sro: "Dindigul Joint",
    villages: ["Dindigul Town", "Nagal Nagar", "Balakrishnapuram", "Begambur", "Seelapadi"],
  },
  {
    zone: "Madurai",
    district: "Dindigul",
    sro: "Kodaikanal",
    villages: ["Kodaikanal Town", "Shenbaganur", "Vilpatti", "Poombarai", "Mannavanur"],
  },
  {
    zone: "Madurai",
    district: "Dindigul",
    sro: "Palani",
    villages: ["Palani Town", "Ayakudi", "Neikarapatti", "Balasamudram", "Oddanchatram"],
  },
  {
    zone: "Madurai",
    district: "Theni",
    sro: "Theni Joint",
    villages: ["Theni Allinagaram", "Bodinayakanur", "Periyakulam", "Chinnamanur", "Cumbum"],
  },
  {
    zone: "Madurai",
    district: "Virudhunagar",
    sro: "Virudhunagar Joint",
    villages: ["Virudhunagar Town", "Sivakasi", "Aruppukkottai", "Rajapalayam", "Srivilliputhur"],
  },

  // ZONE 4: SALEM
  {
    zone: "Salem",
    district: "Salem",
    sro: "Salem West",
    villages: ["Salem Fort", "Shevapet", "Gugai", "Meyyanur", "Suramangalam", "Kandampatti"],
  },
  {
    zone: "Salem",
    district: "Salem",
    sro: "Salem East",
    villages: ["Hasthampatti", "Ammapet", "Ponnamapet", "Gorimedu", "Kannankurichi", "Yercaud Foot Hills"],
  },
  {
    zone: "Salem",
    district: "Salem",
    sro: "Attur",
    villages: ["Attur Town", "Narasingapuram", "Thalaivasal", "Mallur", "Peddanaickenpalayam"],
  },
  {
    zone: "Salem",
    district: "Salem",
    sro: "Omalur",
    villages: ["Omalur", "Tharamangalam", "Kadayampatti", "Mecheri", "Jalakandapuram"],
  },
  // District: Namakkal
  {
    zone: "Salem",
    district: "Namakkal",
    sro: "Mallasamuthiram",
    villages: [
      "Akkarai patti",
      "Anantha Goundampalayam",
      "Attyam patti",
      "Avanasi patti",
      "Ballakkuli",
      "Ballakkuli Agraharam",
      "Goundam palayam",
      "Irukalur Pudupalayam",
      "Kallupalayam",
      "Karumanur",
      "Karungalpatti",
      "Kattupalayam",
      "Kolankondai",
      "Konnaiyar",
      "Koothanatham",
      "Kottapalayam",
      "Kuppuchipalayam",
      "Malla Samuthiram Kil mugam",
      "Malla Samuthiram mel mugam",
      "Mamundi Agraharam",
      "Mangalam",
      "Marapparai Vadpagam",
      "Marulayam palayam",
      "Minnampalli",
      "Moramgam",
      "Munjanur",
      "Muthanampalayam",
      "Nagar palayam",
      "Nainampatti",
      "Palamedu",
      "Pappara patti",
      "Paruthi palli",
      "Periyamanali",
      "Pilla Natham",
      "Ramapuram",
      "Sambagamahadevi",
      "Senbaga Madevi",
      "Seppaiyapuram",
      "Sirkar Mamundi",
      "Thana Kutti palayam",
      "Vandinatham",
    ],
  },
  {
    zone: "Salem",
    district: "Namakkal",
    sro: "Namakkal Joint I",
    villages: [
      "Namakkal Town",
      "Nallipalayam",
      "Thindamangalam",
      "Vagurampatti",
      "Kondichettipatti",
      "Siluvampatti",
      "Kadapalli",
      "Vettambadi",
    ],
  },
  {
    zone: "Salem",
    district: "Namakkal",
    sro: "Namakkal Joint II",
    villages: [
      "Mohanur Road Area",
      "Aniyapuram",
      "Keerambur",
      "Vallipuram",
      "Konur",
      "Mudalaipatti",
      "Marurpatti",
    ],
  },
  {
    zone: "Salem",
    district: "Namakkal",
    sro: "Thiruchengode",
    villages: [
      "Thiruchengode Town",
      "Kailasampalayam",
      "Sirumolasi",
      "Chittalandur",
      "Devanankurichi",
      "Thokkavadi",
      "Andipalayam",
      "Anangur",
    ],
  },
  {
    zone: "Salem",
    district: "Namakkal",
    sro: "Rasipuram",
    villages: [
      "Rasipuram Town",
      "Pattanam",
      "Koneripatti",
      "Bodinaickenpatti",
      "Gurusamipalayam",
      "Andagalur Gate",
      "Chandrasekarapuram",
    ],
  },
  {
    zone: "Salem",
    district: "Namakkal",
    sro: "Paramathi",
    villages: [
      "Paramathi Town",
      "Koodacheri",
      "Melmugam",
      "Kizhmugam",
      "Vilakkattur",
      "Pillur",
    ],
  },
  {
    zone: "Salem",
    district: "Namakkal",
    sro: "Velur",
    villages: [
      "Paramathi Velur",
      "Pothanur",
      "Pandamangalam",
      "Kabilarmalai",
      "Solasiramani",
      "Jedarpalayam",
    ],
  },
  {
    zone: "Salem",
    district: "Namakkal",
    sro: "Mohanur",
    villages: [
      "Mohanur Town",
      "Oruvandur",
      "Komaripalayam",
      "Pettapalayam",
      "Madakasampatti",
    ],
  },
  {
    zone: "Salem",
    district: "Namakkal",
    sro: "Sendamangalam",
    villages: [
      "Sendamangalam Town",
      "Kalappanaickenpatti",
      "Belukurichi",
      "Pachudayampalayam",
      "Nainamalai Area",
    ],
  },
  {
    zone: "Salem",
    district: "Namakkal",
    sro: "Puduchathiram",
    villages: [
      "Puduchathiram",
      "Thathayangarpatti",
      "Elur",
      "Navani",
      "Kalyani",
    ],
  },
  {
    zone: "Salem",
    district: "Namakkal",
    sro: "Erumaipatti",
    villages: [
      "Erumaipatti",
      "Pavithram",
      "Varagur",
      "Devarayapuram",
      "Muttanchetti",
    ],
  },
  {
    zone: "Salem",
    district: "Namakkal",
    sro: "Kumarapalayam",
    villages: [
      "Kumarapalayam Town",
      "Pallakkapalayam",
      "Samayasangili",
      "Valayakkaranur",
    ],
  },
  {
    zone: "Salem",
    district: "Namakkal",
    sro: "Namagiripettai",
    villages: [
      "Namagiripettai Town",
      "Mullukurichi",
      "Perumagoundampalayam",
      "Thimmannaickenpatti",
    ],
  },
  {
    zone: "Salem",
    district: "Namakkal",
    sro: "Pallipalayam",
    villages: [
      "Pallipalayam Town",
      "Alampalayam",
      "Kokkarayanpettai",
      "Vediarasampalayam",
    ],
  },
  {
    zone: "Salem",
    district: "Namakkal",
    sro: "Velagoundampatty",
    villages: [
      "Velagoundampatty",
      "Agaram",
      "Tholur",
      "Ladduvadi",
    ],
  },
  {
    zone: "Salem",
    district: "Krishnagiri",
    sro: "Hosur",
    villages: ["Hosur Town", "Zuzuvadi", "Mookandapalli", "Avalapalli", "Bagalur", "Sipcot Phase I", "Sipcot Phase II", "Moranapalli"],
  },
  {
    zone: "Salem",
    district: "Krishnagiri",
    sro: "Krishnagiri Joint",
    villages: ["Krishnagiri Town", "Kattiganapalli", "Peddanapalli", "Kaveripattinam", "Bargur"],
  },
  {
    zone: "Salem",
    district: "Dharmapuri",
    sro: "Dharmapuri Joint",
    villages: ["Dharmapuri Town", "Palacode", "Harur", "Pennagaram", "Karimangalam"],
  },

  // ZONE 5: TRICHY
  {
    zone: "Trichy",
    district: "Tiruchirappalli",
    sro: "Trichy Joint I",
    villages: ["Cantonment", "Thillai Nagar", "Woraiyur", "Palakkarai", "Thennur", "Puthur"],
  },
  {
    zone: "Trichy",
    district: "Tiruchirappalli",
    sro: "Trichy Joint II",
    villages: ["Srirangam", "Thiruvanaikovil", "Golden Rock", "K.K. Nagar", "Ponmalai", "Ariyamangalam"],
  },
  {
    zone: "Trichy",
    district: "Tiruchirappalli",
    sro: "Thiruverumbur",
    villages: ["Thiruverumbur", "Kattur", "BHEL Township", "Koothaipar", "Navalpattu", "Gundur"],
  },
  {
    zone: "Trichy",
    district: "Tiruchirappalli",
    sro: "Lalgudi",
    villages: ["Lalgudi", "Poovalur", "Pullambadi", "Samayapuram", "Manachanallur"],
  },
  {
    zone: "Trichy",
    district: "Karur",
    sro: "Karur Joint",
    villages: ["Karur Town", "Inam Karur", "Thanthoni", "Vengamedu", "Puliyur", "Kulithalai"],
  },
  {
    zone: "Trichy",
    district: "Pudukkottai",
    sro: "Pudukkottai Joint",
    villages: ["Pudukkottai Town", "Alangudi", "Aranthangi", "Thirumayam", "Viralimalai"],
  },

  // ZONE 6: TIRUNELVELI
  {
    zone: "Tirunelveli",
    district: "Tirunelveli",
    sro: "Tirunelveli Joint",
    villages: ["Tirunelveli Town", "Tirunelveli Junction", "Palayamkottai", "Vannarpettai", "Pettai", "Thachanallur"],
  },
  {
    zone: "Tirunelveli",
    district: "Tirunelveli",
    sro: "Palayamkottai",
    villages: ["Palayamkottai", "Shanthi Nagar", "Maharaja Nagar", "Perumalpuram", "Samathanapuram"],
  },
  {
    zone: "Tirunelveli",
    district: "Thoothukudi",
    sro: "Thoothukudi Joint",
    villages: ["Thoothukudi Town", "Meelavittan", "Mullakadu", "Muthiahpuram", "Tiruchendur", "Kovilpatti"],
  },
  {
    zone: "Tirunelveli",
    district: "Kanyakumari",
    sro: "Nagercoil Joint",
    villages: ["Nagercoil Town", "Vadiveeswaram", "Kottar", "Vadasery", "Suchindram", "Kanyakumari"],
  },

  // ZONE 7: THANJAVUR
  {
    zone: "Thanjavur",
    district: "Thanjavur",
    sro: "Thanjavur Joint I",
    villages: ["Thanjavur Town", "Karanthai", "Medical College", "Vallam", "Pillaiyarpatti", "Nanjikottai"],
  },
  {
    zone: "Thanjavur",
    district: "Thanjavur",
    sro: "Kumbakonam Joint",
    villages: ["Kumbakonam Town", "Darasuram", "Swamimalai", "Thirunageswaram", "Papanasam"],
  },
  {
    zone: "Thanjavur",
    district: "Nagapattinam",
    sro: "Nagapattinam Joint",
    villages: ["Nagapattinam Town", "Velankanni", "Nagore", "Vedaranyam", "Kilvelur"],
  },
  {
    zone: "Thanjavur",
    district: "Mayiladuthurai",
    sro: "Mayiladuthurai Joint",
    villages: ["Mayiladuthurai Town", "Sirkazhi", "Tharangambadi", "Kuthalam"],
  },

  // ZONE 8: VELLORE
  {
    zone: "Vellore",
    district: "Vellore",
    sro: "Vellore Joint I",
    villages: ["Vellore Fort", "Bagayam", "Katpadi", "Sathuvachari", "Thorapadi", "Shenbakkam", "Kosapet"],
  },
  {
    zone: "Vellore",
    district: "Vellore",
    sro: "Katpadi",
    villages: ["Katpadi Town", "Dharapadavedu", "Kangeyanallur", "Senur", "Brammapuram", "VIT Area"],
  },
  {
    zone: "Vellore",
    district: "Ranipet",
    sro: "Ranipet Joint",
    villages: ["Ranipet Town", "Walajah", "Arcot", "Melvisharam", "Sipcot", "Arakkonam"],
  },
  {
    zone: "Vellore",
    district: "Tiruvannamalai",
    sro: "Tiruvannamalai Joint",
    villages: ["Tiruvannamalai Town", "Vengikkal", "Kilnathur", "Adi Annamalai", "Chengam", "Polur"],
  },

  // ZONE 9: CUDDALORE
  {
    zone: "Cuddalore",
    district: "Cuddalore",
    sro: "Cuddalore Joint I",
    villages: ["Cuddalore Old Town", "Cuddalore New Town", "Manjakuppam", "Tirupapuliyur", "Padirikuppam"],
  },
  {
    zone: "Cuddalore",
    district: "Cuddalore",
    sro: "Chidambaram Joint",
    villages: ["Chidambaram Town", "Annamalai Nagar", "Bhuvanagiri", "Parangipettai", "Kattumannarkoil"],
  },
  {
    zone: "Cuddalore",
    district: "Villupuram",
    sro: "Villupuram Joint",
    villages: ["Villupuram Town", "Salamedu", "Koliyanur", "Valavanur", "Tindivanam", "Gingee"],
  },
];

async function main() {
  console.log("Seeding Tamil Nadu TNREGINET Jurisdiction Hierarchy...");

  // Reset table to guarantee clean 1:1 match with official list
  await prisma.tnJurisdiction.deleteMany({});

  let seededCount = 0;
  for (const item of TN_JURISDICTIONS) {
    await prisma.tnJurisdiction.upsert({
      where: {
        zone_district_sro: {
          zone: item.zone,
          district: item.district,
          sro: item.sro,
        },
      },
      update: {
        villages: JSON.stringify(item.villages),
      },
      create: {
        zone: item.zone,
        district: item.district,
        sro: item.sro,
        villages: JSON.stringify(item.villages),
      },
    });
    seededCount++;
  }

  console.log(`Successfully seeded ${seededCount} TNREGINET SRO jurisdiction records.`);
  
  // Verify count
  const count = await prisma.tnJurisdiction.count();
  console.log(`Total TnJurisdiction records in database: ${count}`);
}

main()
  .catch((e) => {
    console.error("Error seeding TN Jurisdiction:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
