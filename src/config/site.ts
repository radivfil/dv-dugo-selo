/**
 * CENTRALNA KONFIGURACIJA USTANOVE
 * ------------------------------------------------------------------
 * Jedino mjesto s podacima specifičnima za ovu ustanovu: naziv, boje, fontovi,
 * kontakt, lokacije, izbornik, tekstovi sekcija i programi.
 * Za novog klijenta (drugi vrtić ili škola) kopiraj projekt i promijeni SAMO
 * ovu datoteku, sadržaj u src/content/ i public/admin/config.yml.
 *
 * Ikone se navode imenom iz Lucide seta (PascalCase, npr. "Leaf"): https://lucide.dev/icons
 * Stavke označene s TODO treba provjeriti s ustanovom prije objave.
 */

export type IconName = string;

export interface Location {
  id: string;
  name: string;
  address: string;
  postalCity: string;
  phone: string;
  groups: string;
  description: string;
  mapQuery: string;
  image?: string;
}

export interface Program {
  id: string;
  title: string;
  age: string;
  icon: IconName;
  summary: string;
  details: string[];
  /** Veličina pločice u bento gridu: 'wide' zauzima dva stupca, 'tall' dva reda. */
  size?: 'wide' | 'tall' | 'normal';
  /** Ton pločice: 'brand' (plava), 'accent' (svijetlo zlatna) ili zadano neutralna. */
  tone?: 'brand' | 'accent';
  /** Fotografija na pločici */
  image?: string;
  imageAlt?: string;
  category: 'jaslice' | 'vrtic' | 'predskola' | 'posebni';
}

export const site = {
  // --- Identitet -------------------------------------------------
  name: 'Dječji vrtić „Dugo Selo”',
  shortName: 'DV Dugo Selo',
  legalName: 'Dječji vrtić Dugo Selo',
  /** Slova u monogramu logotipa (originalni znak, nije gradski grb). */
  monogram: 'DS',
  /** Dva retka tekstualnog dijela logotipa. */
  logoText: { top: 'Dječji vrtić', main: 'Dugo Selo' },
  tagline: 'Rastemo zajedno, u gradu uz Martin breg',
  description:
    'Javni dječji vrtić Grada Dugog Sela. Jaslički, vrtićki i predškolski programi na tri lokacije, s aktivnim statusom Eko vrtića.',
  founder: 'Grad Dugo Selo',
  founderUrl: 'https://www.dugoselo.hr',
  county: 'Zagrebačka županija',
  url: 'https://dugoselo.dvds.hr', // TODO: konačna domena nove stranice
  /** false = demo: tražilice ne indeksiraju stranicu (noindex). Za pravu objavu postaviti na true. */
  indexable: false,
  lang: 'hr',
  locale: 'hr_HR',

  // --- Boje (tokeni). Ravne boje, bez gradijenata. -----------------
  // Uloge:
  //   brand = identitet (plohe, zaglavlje, podnožje, poveznice)
  //   gold  = poziv na akciju (CTA gumbi) i status iz grba (Eko oznaka, sunce u logotipu)
  //   coral = sitni topli naglasci (brojevi koraka, ikone u karticama, crta ispod aktivne stavke)
  //   wash* = blijedo obojene plohe sekcija; stranica se izmjenjuje, ne ostaje prazno bijela
  // Svaki par tekst/podloga provjeren je na kontrast (min. 4.5:1, fokus prsten min. 3:1).
  colors: {
    light: {
      bg: '#FAFBFC',
      surface: '#FFFFFF',
      surface2: '#EEF5FD',
      washBlue: '#EEF5FD',
      washMint: '#EAF7F1',
      washCream: '#FDF3E0',
      line: '#DCE6F0',
      ink: '#17213A',
      muted: '#4A5468',
      brand: '#0E76C0',
      brandStrong: '#0B5E9A',
      brandInk: '#0A66AC', // plava kao tekst: 5.44:1 i na najsvjetlijoj plohi
      brandSoft: '#DCEDFA',
      onBrand: '#FFFFFF',
      focusOnBrand: '#FFD980', // fokus prsten na plavoj plohi: 3.54:1
      gold: '#E8B23A',
      goldStrong: '#D49C1F',
      goldSoft: '#FDF0D3',
      goldInk: '#7A5200',
      onGold: '#17213A',
      coral: '#C2410C',
      coralSoft: '#FBE7DC',
      coralInk: '#9A3412',
      onCoral: '#FFFFFF',
      success: '#1E6B3A',
      successSoft: '#E3F2E8',
      danger: '#A3261B',
      dangerSoft: '#FBE7E4',
    },
    dark: {
      bg: '#0F1A2B',
      surface: '#17233A',
      surface2: '#1B2B44',
      washBlue: '#152741',
      washMint: '#122E2B',
      washCream: '#2C2415',
      line: '#33486B',
      ink: '#EEF1F6',
      muted: '#B4BED1',
      brand: '#1A75B8', // bijeli tekst na njoj: 4.91:1
      brandStrong: '#1E86D0',
      brandInk: '#7FC2F0',
      brandSoft: '#15304D',
      onBrand: '#FFFFFF',
      focusOnBrand: '#FFD980',
      gold: '#E8B23A',
      goldStrong: '#F0C257',
      goldSoft: '#3A2E12',
      goldInk: '#F2CC74',
      onGold: '#17213A',
      coral: '#F0763C',
      coralSoft: '#3A1E11',
      coralInk: '#FFA97A',
      onCoral: '#17213A',
      success: '#7FD39B',
      successSoft: '#143222',
      danger: '#FF9C90',
      dangerSoft: '#3D1916',
    },
  },

  fonts: {
    heading: 'Poppins',
    body: 'Nunito',
  },

  // --- Kontakt ---------------------------------------------------
  contact: {
    address: 'Perivoj Ivane Brlić Mažuranić 2',
    postalCity: '10370 Dugo Selo',
    phone: '01 2753 418',
    phoneHref: '+38512753418',
    email: 'vrtic@dvds.hr', // TODO: provjeriti službenu adresu
    oib: '', // TODO: upisati OIB ustanove
    mapQuery: 'Perivoj Ivane Brlić Mažuranić 2, Dugo Selo',
    /** OpenStreetMap okvir karte (bbox: zapad, jug, istok, sjever) i oznaka. */
    map: { bbox: '16.2280,45.8025,16.2470,45.8115', marker: '45.8070,16.2375' }, // TODO: precizne koordinate
  },

  hours: [
    { label: 'Rad s djecom', value: 'pon – pet, 5:30 – 17:00' },
    { label: 'Uprava i tajništvo', value: 'pon – pet, 7:00 – 15:00' },
    { label: 'Primanje stranaka', value: 'utorak i četvrtak, 9:00 – 12:00' },
  ],

  // --- Lokacije ---------------------------------------------------
  // TODO: provjeriti nazive i adrese područnih objekata.
  locations: [
    {
      id: 'centralni',
      name: 'Centralni objekt',
      address: 'Perivoj Ivane Brlić Mažuranić 2',
      postalCity: '10370 Dugo Selo',
      phone: '01 2753 418',
      groups: 'jaslice, vrtić i predškola',
      description:
        'Sjedište vrtića i uprave, uz perivoj u samom središtu grada. Ovdje su stručni suradnici, kuhinja iz koje stižu obroci za sve objekte i najveće dvorište s eko vrtom.',
      mapQuery: 'Perivoj Ivane Brlić Mažuranić 2, Dugo Selo',
      image: '/images/placeholder/ucionica-1.jpg',
    },
    {
      id: 'podrucni-1',
      name: 'Područni objekt Kozinščak',
      address: 'Ulica Kozinščak 10',
      postalCity: '10370 Dugo Selo',
      phone: '01 2753 419',
      groups: 'vrtićke skupine',
      description:
        'Manji objekt u mirnom stambenom dijelu grada, s vlastitim igralištem. Pogodan za djecu koja se bolje snalaze u manjoj zajednici.',
      mapQuery: 'Kozinščak, Dugo Selo',
      image: '/images/placeholder/igraliste-2.jpg',
    },
    {
      id: 'podrucni-2',
      name: 'Područni objekt Ostrna',
      address: 'Ulica Josipa Zorića 5',
      postalCity: '10370 Dugo Selo',
      phone: '01 2753 420',
      groups: 'jaslice i mlađe vrtićke skupine',
      description:
        'Objekt prilagođen najmlađima: prostrane sobe za spavanje, prilaz bez stepenica i zasebno jasličko dvorište.',
      mapQuery: 'Ostrna, Dugo Selo',
      image: '/images/placeholder/ucionica-2.jpg',
    },
  ] satisfies Location[],

  // --- Izbornik ---------------------------------------------------
  // `short` se koristi na uskim ekranima gdje puna oznaka ne stane.
  nav: [
    { label: 'Početna', short: 'Početna', href: '/' },
    { label: 'O vrtiću', short: 'O vrtiću', href: '/o-vrticu' },
    { label: 'Programi i skupine', short: 'Programi', href: '/programi' },
    { label: 'Upisi i ispisi', short: 'Upisi', href: '/upisi' },
    { label: 'Kutak za roditelje', short: 'Roditelji', href: '/roditelji', highlight: true },
    { label: 'Novosti', short: 'Novosti', href: '/novosti' },
    { label: 'Galerija', short: 'Galerija', href: '/galerija' },
    { label: 'Dokumenti i transparentnost', short: 'Dokumenti', href: '/dokumenti' },
    { label: 'Kontakt', short: 'Kontakt', href: '/kontakt' },
  ],

  // --- Početna ------------------------------------------------------
  hero: {
    eyebrow: 'Javni vrtić Grada Dugog Sela',
    title: 'Mjesto gdje djeca istražuju, rastu i uče brinuti o svijetu oko sebe',
    text: 'Više od 500 djece iz Dugog Sela svaki dan provede u našim skupinama, u tri objekta. Svaka skupina ima dvorište i vrt, a svaki dan počinje obrokom iz naše kuhinje.', // TODO: provjeriti broj djece
    primaryCta: { label: 'Upisi u vrtić', href: '/upisi' },
    secondaryCta: { label: 'Prijava izostanka', href: '/roditelji/prijava-izostanka' },
    image: '/images/placeholder/igra-2.jpg',
    imageAlt: 'Dijete slaže drvene kocke na tepihu u svijetloj sobi vrtića',
  },

  badge: {
    title: 'Eko vrtić',
    text: 'Aktivan status međunarodnog programa Eko-škole',
    icon: 'Leaf',
  },

  quickLinks: [
    { label: 'Prijava izostanka', text: 'Javite do 8 sati, obrok se ne obračunava.', href: '/roditelji/prijava-izostanka', icon: 'CalendarX' },
    { label: 'Jelovnik', text: 'Tjedni jelovnik za sve objekte.', href: '/roditelji#jelovnik', icon: 'Utensils' },
    { label: 'e-Upisi', text: 'Prijave za novu pedagošku godinu.', href: '/upisi', icon: 'ClipboardPen' },
    { label: 'Dokumenti', text: 'Pravilnici, izvješća i odluke.', href: '/dokumenti', icon: 'FileText' },
  ],

  // --- O vrtiću ---------------------------------------------------
  about: {
    intro:
      'Dječji vrtić „Dugo Selo” javna je predškolska ustanova čiji je osnivač Grad Dugo Selo. Radimo po Nacionalnom kurikulumu za rani i predškolski odgoj, a naš kurikulum gradimo oko prirode, pokreta i zajedništva s obiteljima.',
    values: [
      { title: 'Priroda kao učionica', text: 'Svaki objekt ima vrt koji djeca sama obrađuju. Kompostiramo, štedimo vodu i razvrstavamo otpad, jer se tako uči najbolje: radeći.', icon: 'Sprout' },
      { title: 'Dijete u središtu', text: 'Aktivnosti planiramo prema interesima skupine, ne prema kalendaru. Odgojitelji prate svako dijete i redovito razgovaraju s roditeljima.', icon: 'Users' },
      { title: 'Stručni tim', text: 'Uz odgojitelje radi tim stručnih suradnika: pedagog, psiholog, logoped, edukacijski rehabilitator i zdravstvena voditeljica.', icon: 'HeartHandshake' },
    ],
    team: [
      { role: 'Ravnateljica', name: 'Ime Prezime' }, // TODO
      { role: 'Pedagoginja', name: 'Ime Prezime' },
      { role: 'Psihologinja', name: 'Ime Prezime' },
      { role: 'Logopedinja', name: 'Ime Prezime' },
      { role: 'Zdravstvena voditeljica', name: 'Ime Prezime' },
    ],
  },

  // --- Programi ---------------------------------------------------
  programs: [
    {
      id: 'jaslice',
      title: 'Jaslice',
      age: '1 – 3 godine',
      icon: 'Baby',
      image: '/images/placeholder/ucionica-3.jpg',
      imageAlt: 'Dijete slaže papirnate zvjezdice na tepihu u jasličkoj sobi',
      category: 'jaslice',
      size: 'tall',
      summary: 'Mirne sobe, stalni odgojitelji i puno vremena za prilagodbu. Prvih dana roditelj može ostati s djetetom u skupini.',
      details: ['Mlađa jaslička skupina (1 – 2 godine)', 'Starija jaslička skupina (2 – 3 godine)', 'Postupna prilagodba uz roditelja'],
    },
    {
      id: 'vrtic',
      title: 'Vrtićke skupine',
      age: '3 – 6 godina',
      icon: 'Palette',
      image: '/images/placeholder/igra-1.jpg',
      imageAlt: 'Dvoje djece igra se liječnika za stolom',
      category: 'vrtic',
      size: 'wide',
      tone: 'brand',
      summary: 'Desetosatni program u mješovitim i dobnim skupinama. Igra, istraživanje, likovni i glazbeni izraz te svakodnevni boravak vani.',
      details: ['Mlađa skupina (3 – 4 godine)', 'Srednja skupina (4 – 5 godina)', 'Starija skupina (5 – 6 godina)'],
    },
    {
      id: 'predskola',
      title: 'Program predškole',
      age: 'godina prije škole',
      icon: 'BookOpen',
      image: '/images/placeholder/slikanje-3.jpg',
      imageAlt: 'Djeca za stolom crtaju i slikaju vodenim bojama',
      category: 'predskola',
      summary: 'Obvezni program za djecu u godini prije polaska u osnovnu školu, i za djecu koja ne pohađaju vrtić.',
      details: ['250 sati godišnje', 'Poslijepodnevne skupine za djecu izvan vrtića'],
    },
    {
      id: 'eko',
      title: 'Eko program',
      age: 'sve skupine',
      icon: 'Leaf',
      image: '/images/placeholder/igraliste-1.jpg',
      imageAlt: 'Djeca slažu drvene kocke u dvorištu vrtića',
      category: 'posebni',
      size: 'wide',
      tone: 'accent',
      summary: 'Status Eko vrtića nosimo od prvih godina programa. Djeca vode eko patrolu, brinu o vrtu i kompostištu i svake godine biraju eko temu.',
      details: ['Eko vrt i kompostište u svakom objektu', 'Eko patrola i eko kodeks skupine'],
    },
    {
      id: 'engleski',
      title: 'Rano učenje engleskog',
      age: '4 – 6 godina',
      icon: 'MessagesSquare',
      image: '/images/placeholder/igra-3.jpg',
      imageAlt: 'Djeca i odgojiteljica razgovaraju za stolom',
      category: 'posebni',
      summary: 'Kraći program kroz pjesmu, igru i priču, dvaput tjedno u poslijepodnevnim satima.',
      details: ['Dvaput tjedno po 45 minuta'],
    },
    {
      id: 'sport',
      title: 'Sportski program',
      age: '4 – 6 godina',
      icon: 'Bike',
      image: '/images/placeholder/igraliste-3.jpg',
      imageAlt: 'Djeca voze romobile po vanjskoj stazi',
      category: 'posebni',
      summary: 'Poligoni, igre loptom i vožnja bicikla na vrtićkom igralištu, uz kineziologa.',
      details: ['Jednom tjedno, u dvorani ili vani'],
    },
  ] satisfies Program[],

  /** Okvirni dnevni ritam (stranica Programi) */
  dailyRhythm: [
    { time: '5:30 – 8:00', text: 'Dolazak, slobodna igra i doručak' },
    { time: '8:00 – 10:30', text: 'Aktivnosti u sobi i vani, užina' },
    { time: '10:30 – 12:00', text: 'Boravak na zraku, vrt i igralište' },
    { time: '12:00 – 14:30', text: 'Ručak i odmor' },
    { time: '14:30 – 17:00', text: 'Užina, igra i odlazak kući' },
  ],

  // --- Upisi ------------------------------------------------------
  enrollment: {
    url: 'https://vrtici.e-upisi.hr',
    intro:
      'Zahtjevi za upis podnose se isključivo elektronički, kroz sustav e-Upisi. Za prijavu vam treba e-Građanin vjerodajnica, a sustav sam dohvaća većinu podataka iz javnih registara.',
    priorityIntro: 'Prednost pri upisu imaju djeca s prebivalištem na području Grada Dugog Sela, prema redoslijedu iz Pravilnika o upisu:',
    priority: [
      'djeca roditelja žrtava i invalida Domovinskog rata',
      'djeca s teškoćama u razvoju i djeca s kroničnim bolestima',
      'djeca zaposlenih roditelja i samohranih roditelja',
      'djeca iz obitelji s troje ili više djece',
      'djeca u godini prije polaska u školu',
    ],
    steps: [
      { title: 'Pratite javni natječaj', text: 'Natječaj za upis objavljujemo na ovoj stranici i na oglasnoj ploči, obično u proljeće.' },
      { title: 'Prijavite se u e-Upise', text: 'Prijava ide preko sustava e-Građani. Odaberite vrtić, objekt i program.' },
      { title: 'Priložite dokumente', text: 'Učitajte samo dokumente koje sustav ne može sam dohvatiti, npr. potvrdu o zaposlenju.' },
      { title: 'Pratite rezultate', text: 'Rezultate i daljnje korake vidite u sustavu, a obavijest dobivate i e-poštom.' },
    ],
  },

  // --- Ispis iz vrtića (stranica Upisi i ispisi + obrazac /roditelji/ispis-djeteta) ----
  withdrawal: {
    href: '/roditelji/ispis-djeteta',
    noticeDays: 15,
    intro:
      'Zahtjev za ispis predaje se najmanje 15 dana prije posljednjeg dana u vrtiću. Cijeli postupak možete obaviti elektronički, bez dolaska u tajništvo, a roditeljska uplata obračunava se do posljednjeg dana boravka.',
    steps: [
      { title: 'Ispunite zahtjev', text: 'Podaci se odmah evidentiraju u tajništvu.' },
      { title: 'Preuzmite i potpišite PDF', text: 'Zahtjev je unaprijed popunjen, treba ga samo potpisati.' },
      { title: 'Učitajte potpisani sken', text: 'Fotografija mobitelom je dovoljna. Može i osobno u tajništvu.' },
    ],
  },

  // --- Kutak za roditelje ----------------------------------------------
  parents: {
    intro: 'Sve što vam treba u svakodnevici na jednom mjestu: prijava izostanka, jelovnik, ispis djeteta i savjeti naših stručnih suradnika.',
    absenceDeadline: '8:00',
    tips: [
      { title: 'Prvi dani u vrtiću', text: 'Oproštaj neka bude kratak i uvijek isti. Dijete lakše podnese odlazak koji je predvidljiv, nego iznenadni nestanak.', author: 'Psihologinja vrtića' },
      { title: 'Kad dijete ostaje doma', text: 'Uz povišenu temperaturu, povraćanje ili proljev dijete ostaje kod kuće najmanje 24 sata nakon posljednjih simptoma.', author: 'Zdravstvena voditeljica' },
      { title: 'Govor u predškolskoj dobi', text: 'Čitajte naglas svaki dan i pitajte dijete što misli da će se dogoditi dalje. Priča je najbolja vježba za govor.', author: 'Logopedinja vrtića' },
    ],
  },

  // --- Dokumenti --------------------------------------------------
  documentCategories: [
    'Statut i pravilnici',
    'Financijska izvješća',
    'Javna nabava',
    'Upravno vijeće',
    'Upisi',
    'Pravo na pristup informacijama',
  ],

  // --- Pristupačnost --------------------------------------------------
  accessibility: {
    statementDate: '21. rujna 2026.',
    reviewDate: '21. rujna 2026.',
    status: 'potpuno usklađena', // status: potpuno usklađeno
    supervisor: {
      name: 'Povjerenik za informiranje Republike Hrvatske',
      address: 'Trg kralja Petra Krešimira IV. br. 7, 10000 Zagreb',
      email: 'pristupacnost@pristupinfo.hr',
      url: 'https://www.pristupinfo.hr',
    },
  },

  social: [] as { label: string; href: string }[],
};

export type Site = typeof site;
