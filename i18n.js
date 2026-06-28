/* ============================================================
   DEEPX clone — lightweight KO/EN i18n layer
   ------------------------------------------------------------
   Non-invasive runtime translation for the mirrored static page.
   - Matches visible text nodes against a normalized EN->KO dict
   - Persists choice in localStorage
   - Re-applies on dynamically inserted nodes (Swiper clones etc.)
   - Original English is always restorable (stored per node)
   Extend by adding entries to DICT below (keys = English source).
   ============================================================ */
(function () {
  "use strict";

  var STORE_KEY = "deepx_lang";

  /* Normalize a string so curly quotes / dashes / whitespace
     variations don't break dictionary matching. Keys in DICT are
     written in this normalized (straight-quote, single-space) form. */
  function norm(s) {
    return s
      .replace(/ /g, " ")
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[–—]/g, "-")
      .replace(/\s+/g, " ")
      .trim();
  }

  /* EN (normalized) -> KO. Product/brand tokens are intentionally
     left untranslated (DX-M1, DXNN, CES, NVIDIA, info@deepx.ai ...). */
  var DICT = {
    // ---- Top bar / nav ----
    "Skip to content": "본문 바로가기",
    "AI Chips Available for Evaluation": "평가용 AI 칩 제공",
    "AI Chips Available for Testing": "테스트용 AI 칩 제공",
    "Apply Now": "지금 신청하기",
    "Products": "제품",
    "Solutions": "솔루션",
    "Edge Computing": "엣지 컴퓨팅",
    "Smart Mobility": "스마트 모빌리티",
    "Smart Factory": "스마트 팩토리",
    "Smart City": "스마트 시티",
    "Developers": "개발자",
    "About Us": "회사 소개",
    "Our Story": "회사 이야기",
    "Newsroom": "뉴스룸",
    "Career": "채용",
    "Contact Us": "문의하기",
    "Sales Distributors": "판매 대리점",
    "DX TechBridge Program": "DX 테크브리지 프로그램",
    "CES On!": "CES On!",
    "Shop Now": "구매하기",

    // ---- Accessible header chrome (aria / UX labels) ----
    "Open menu": "메뉴 열기",
    "Close menu": "메뉴 닫기",
    "Main menu": "메인 메뉴",
    "Main navigation": "메인 내비게이션",
    "Language": "언어",
    "AI accelerators engineered for maximum efficiency.":
      "최대 효율을 위해 설계된 AI 가속기.",
    "Real-world deployments across industries.":
      "여러 산업에 걸친 실제 도입 사례.",
    "Get started with DEEPX silicon.":
      "DEEPX 실리콘으로 시작하세요.",

    // ---- Event popup ----
    "DEEPX EVENT": "딥엑스 이벤트",
    "Tech Seminar": "테크 세미나",
    "Discover how the DX-M1 NPU delivers GPU-level on-device AI - with live demos and a Q&A session with our engineers.":
      "DX-M1 NPU가 어떻게 GPU급 온디바이스 AI를 구현하는지, 라이브 데모와 엔지니어 Q&A 세션과 함께 만나보세요.",
    "Date": "일시",
    "Thu, Jul 16, 2026 · 2:00 PM KST": "2026년 7월 16일 (목) · 오후 2시 KST",
    "Venue": "장소",
    "COEX Grand Ballroom, Seoul": "코엑스 그랜드볼룸, 서울",
    "Entry": "참가",
    "Free · Pre-registration required": "무료 · 사전 등록 필수",
    "Reserve Your Seat": "좌석 예약하기",
    "Don't show again": "다시 보지 않기",
    "Close": "닫기",

    // ---- Hero slider ----
    "DEEPX & Koshida at": "DEEPX & Koshida,",
    "Tokyo Physical AI Expo": "도쿄 피지컬 AI 엑스포",
    "Leader In Physical AI Semiconductors.": "피지컬 AI 반도체의 리더.",
    "Jul 1 - 3, 2026 l Tokyo Big Sight l Booth No. S14-16":
      "2026년 7월 1–3일 l 도쿄 빅사이트 l 부스 No. S14-16",
    "Schedule a Meeting": "미팅 예약하기",
    "Industry-Leading TCO": "업계 최고 수준의 TCO",
    "(Total Cost of Ownership)": "(총소유비용)",
    "Compared to GPGPUs, each DX-M1 saves approximately 94%":
      "GPGPU 대비, DX-M1 한 개당 약 94%를 절감합니다",
    "in electricity costs over five years": "5년간 전기요금 기준",
    "Unlock Your TCO Advantage": "TCO 이점 확인하기",
    "The True Future of": "하이퍼 AI의",
    "Hyper-AI Begins": "진정한 미래가 시작됩니다",
    "The DX-M2, in development, extends DEEPX's vision":
      "개발 중인 DX-M2는 접근 가능하고 지속 가능한 AI를 향한",
    "for accessible, sustainable AI, bringing Generative AI":
      "DEEPX의 비전을 확장하여, 생성형 AI를",
    "to portable, battery-powered devices anytime, anywhere.":
      "언제 어디서나 휴대용 배터리 기반 기기로 구현합니다.",
    "DEEPX at Tokyo Physical AI Expo": "도쿄 피지컬 AI 엑스포의 DEEPX",
    "Unlock Superior TCO with Intelligent AI": "지능형 AI로 탁월한 TCO 실현",
    "DX-M2: Advancing Efficient LLMs for the Edge":
      "DX-M2: 엣지를 위한 효율적인 LLM의 진화",

    // ---- TCO / value props ----
    "Lower Power, Heat, and Bill.": "더 낮은 전력, 발열, 그리고 비용.",
    "Lower TCO than even Free Chips": "무료 칩보다도 낮은 TCO",
    "Is Your AI System Reliable? DEEPX ensures unmatched reliability of your AI systems with lower power, heat, and bill - lower TCO than even free chips":
      "당신의 AI 시스템은 신뢰할 수 있습니까? DEEPX는 더 낮은 전력, 발열, 비용으로 비교 불가한 신뢰성을 보장하며, 무료 칩보다도 낮은 TCO를 실현합니다.",
    "Unmatched AI Performance": "비교 불가한 AI 성능",
    "DX-M1 outperforms 40W GPGPU by 240%, provides 20x efficiency improvement, and consumes only 5W":
      "DX-M1은 40W GPGPU 대비 240% 높은 성능과 20배 향상된 효율을 제공하며, 전력은 단 5W만 소비합니다",
    "GPU-level Accuracy, Maximum AI Efficiency": "GPU 수준의 정확도, 최대 AI 효율",
    "DEEPX IQ8: Intelligent Quantization with INT8 achieves the efficiency of INT8 with the precision of FP32 for unparalleled AI accuracy":
      "DEEPX IQ8: INT8 기반 지능형 양자화로 INT8의 효율과 FP32의 정밀도를 동시에 달성하여 비교 불가한 AI 정확도를 제공합니다",
    "Sustainable AI for a Greener Future": "더 푸른 미래를 위한 지속 가능한 AI",
    "DEEPX reduces AI energy use and emissions by 90%, equivalent to planting 6,700 pine trees":
      "DEEPX는 AI 에너지 사용량과 탄소 배출을 90% 절감하며, 이는 소나무 6,700그루를 심는 것과 같습니다",
    "AI & Cost": "AI 및 비용",
    "Leadership": "리더십",
    "DEEPX's AI semiconductors deliver breakthrough performance at 10% of GPU costs-making AI adoption inevitable":
      "DEEPX의 AI 반도체는 GPU 비용의 10%로 획기적인 성능을 제공하여 AI 도입을 필연으로 만듭니다",
    "True Innovation for": "피지컬 AI 반도체를 위한",
    "Phyiscal AI Semiconductors": "진정한 혁신",
    "Unmatched Performance/Power/Cost Efficiency with Maximum Accuracy":
      "최대 정확도와 함께 비교 불가한 성능·전력·비용 효율",

    // ---- Product categories ----
    "AI Chips": "AI 칩",
    "Cutting-edge AI chips engineered for maximum efficiency and effortless integration into any device":
      "최대 효율과 어떤 기기에도 손쉬운 통합을 위해 설계된 최첨단 AI 칩",
    "Details": "자세히 보기",
    "AI Modules": "AI 모듈",
    "High-performance AI modules with exceptional inference, low power, and minimal space needs":
      "탁월한 추론 성능, 저전력, 최소 공간을 갖춘 고성능 AI 모듈",
    "AI Systems": "AI 시스템",
    "Comprehensive AI computing solutions designed for peak performance, reliability, and efficiency":
      "최고의 성능, 신뢰성, 효율을 위해 설계된 종합 AI 컴퓨팅 솔루션",

    // ---- Success stories ----
    "Success Stories": "성공 사례",
    "of Innovation and Transformation": "— 혁신과 변화의 이야기",
    "Pioneering breakthroughs: How DEEPX is revolutionizing industries and reimagining what's possible":
      "선도적인 혁신: DEEPX가 산업을 혁신하고 가능성을 재정의하는 방법",
    "Video Management System": "영상 관리 시스템",
    "Edge computing is revolutionizing the way data is processed, enabling real-time decision-making at the source of data generation. By reducing latency and bandwidth consumption, edge computing empowers industries to make faster, more informed decisions without relying on distant cloud servers. DEEPX's ultra-low-power AI accelerators are designed to optimize on-device processing, ensuring fast, reliable, and efficient computation for edge devices, making them ideal for IoT applications, remote monitoring, and other critical use cases.":
      "엣지 컴퓨팅은 데이터가 생성되는 현장에서 실시간 의사결정을 가능하게 하여 데이터 처리 방식을 혁신하고 있습니다. 지연 시간과 대역폭 소비를 줄임으로써, 엣지 컴퓨팅은 원거리 클라우드 서버에 의존하지 않고도 더 빠르고 정확한 판단을 내릴 수 있게 합니다. DEEPX의 초저전력 AI 가속기는 온디바이스 처리를 최적화하도록 설계되어 엣지 기기에 빠르고 안정적이며 효율적인 연산을 제공하며, IoT 애플리케이션·원격 모니터링 등 핵심 활용 사례에 이상적입니다.",
    "Smart mobility is revolutionizing transportation with technologies like drones and Autonomous Mobile Robots (AMRs) for tasks such as delivery, inspection, and warehouse automation. These systems rely on real-time data processing and AI for efficient, autonomous operation. DEEPX's high-performance AI accelerators provide the computational power needed for precise navigation, decision-making, and seamless integration in complex environments. Our solutions ensure drones and AMRs operate with enhanced efficiency, autonomy, and reliability. Explore Our Solutions":
      "스마트 모빌리티는 배송·점검·창고 자동화 같은 작업을 위한 드론과 자율 이동 로봇(AMR) 기술로 운송을 혁신하고 있습니다. 이러한 시스템은 효율적이고 자율적인 운영을 위해 실시간 데이터 처리와 AI에 의존합니다. DEEPX의 고성능 AI 가속기는 복잡한 환경에서 정밀한 내비게이션, 의사결정, 매끄러운 통합에 필요한 연산 능력을 제공합니다. DEEPX의 솔루션은 드론과 AMR이 한층 향상된 효율, 자율성, 신뢰성으로 작동하도록 보장합니다. 솔루션 살펴보기",
    "Smart Factories utilize interconnected systems for optimized production and efficient operation. Empowered by DEEPX AI, these solutions enhance automation, predictive maintenance, and stringent quality control. They drive efficiency and innovation in modern industrial manufacturing environments.":
      "스마트 팩토리는 상호 연결된 시스템을 활용해 생산을 최적화하고 효율적으로 운영합니다. DEEPX AI로 강화된 이 솔루션은 자동화, 예지 정비, 엄격한 품질 관리를 향상시키며, 현대 산업 제조 환경에서 효율과 혁신을 이끕니다.",
    "Smart cities use digital technologies to enhance urban living, making cities safer, more sustainable, and more efficient. From intelligent traffic systems to energy-efficient buildings, smart cities rely on data-driven insights to optimize city operations. DEEPX's AI chips enable smart city solutions by processing vast amounts of data on the edge, supporting applications like traffic management, environmental monitoring, and public safety with high performance and low energy consumption.":
      "스마트 시티는 디지털 기술을 활용해 도시 생활을 개선하고, 도시를 더 안전하고 지속 가능하며 효율적으로 만듭니다. 지능형 교통 시스템부터 에너지 효율적인 건물까지, 스마트 시티는 데이터 기반 인사이트로 도시 운영을 최적화합니다. DEEPX의 AI 칩은 방대한 데이터를 엣지에서 처리하여 교통 관리, 환경 모니터링, 공공 안전 같은 애플리케이션을 고성능·저전력으로 지원하는 스마트 시티 솔루션을 구현합니다.",
    "Video management systems (VMS) are crucial for monitoring and securing large-scale infrastructures such as public spaces, commercial properties, and industrial sites. With AI-powered video analytics, these systems can detect anomalies, recognize faces, and analyze traffic patterns in real-time. DEEPX's high-performance AI accelerators enable advanced video analytics, offering enhanced video processing, lower latency, and increased efficiency for VMS applications, ensuring secure and intelligent surveillance systems.":
      "영상 관리 시스템(VMS)은 공공장소, 상업 시설, 산업 현장 같은 대규모 인프라를 모니터링하고 보호하는 데 필수적입니다. AI 기반 영상 분석을 통해 이러한 시스템은 이상 징후를 감지하고, 얼굴을 인식하며, 교통 패턴을 실시간으로 분석할 수 있습니다. DEEPX의 고성능 AI 가속기는 향상된 영상 처리, 낮은 지연, 높은 효율을 제공하는 고급 영상 분석을 가능하게 하여 안전하고 지능적인 감시 시스템을 보장합니다.",
    "Explore Our Solution": "솔루션 살펴보기",

    // ---- Latest news ----
    "Latest News": "최신 뉴스",
    "Stay up to date with our latest announcements, industry insights,":
      "최신 소식과 산업 인사이트,",
    "and media coverage as we lead the way in AI semiconductor innovation":
      "그리고 AI 반도체 혁신을 선도하는 DEEPX의 미디어 보도를 만나보세요",
    "Event": "이벤트",
    "10 June, 2026": "2026년 6월 10일",
    "Avnet Edge & Beyond Tech Days 2026 (10 Jul 2026 - 24 Jul 2026)":
      "Avnet Edge & Beyond Tech Days 2026 (2026년 7월 10일 – 7월 24일)",
    "Let's Meet at Manufacturing World 2026 Tokyo | DEEPX Booth #S14-16":
      "Manufacturing World 2026 도쿄에서 만나요 | DEEPX 부스 #S14-16",
    "News": "뉴스",
    "08 June, 2026": "2026년 6월 8일",
    "DEEPX Announces Global Physical AI Mass Production Partnership with AAEON":
      "DEEPX, AAEON과 글로벌 피지컬 AI 양산 파트너십 발표",
    "09 June, 2026": "2026년 6월 9일",
    "From Startup Stage to Global Stage: DEEPX at COMPUTEX TAIPEI 2026 (Part 1 of 2)":
      "스타트업 무대에서 글로벌 무대로: COMPUTEX TAIPEI 2026의 DEEPX (1/2)",
    "27 May, 2026": "2026년 5월 27일",
    "[Notice] Warning Regarding Impersonation and Copyright Infringement in Vietnam":
      "[공지] 베트남 내 사칭 및 저작권 침해 관련 경고",
    "21 May, 2026": "2026년 5월 21일",
    "[Webinar] Ultralytics Live Session 23 (May 27th, 2026)":
      "[웨비나] Ultralytics 라이브 세션 23 (2026년 5월 27일)",
    "Learn More News": "뉴스 더 보기",

    // ---- Awards ----
    "DEEPX Swept All the Innovation Awards": "DEEPX, 혁신 어워드를 석권하다",
    "CES Innovation Awards 2026, Double Honoree": "CES 혁신상 2026, 2개 부문 수상",
    "Recognized as a Double Honoree at CES 2026 for outstanding design in embedded tech and hardware.":
      "임베디드 기술 및 하드웨어 분야의 뛰어난 설계로 CES 2026에서 2개 부문 수상작으로 선정되었습니다.",
    'CTA, "What Not To Miss" for 2nd Year': 'CTA, 2년 연속 "놓치지 말아야 할" 기업 선정',
    "Featured in the official CES 2026 guide as a key AI innovator alongside industry titans such as NVIDIA, Samsung, and Qualcomm.":
      "CES 2026 공식 가이드에 NVIDIA, 삼성, 퀄컴 등 업계 거물들과 함께 핵심 AI 혁신 기업으로 소개되었습니다.",
    "EE Times, Best Product of the Year": "EE Times, 올해의 최고 제품",
    'Named "Best Product of the Year" by EE Times for its commercial on-device AI chip.':
      '상용 온디바이스 AI 칩으로 EE Times로부터 "올해의 최고 제품"으로 선정되었습니다.',
    "WEF MINDS Award, First Cohort Winner": "WEF MINDS 어워드, 1기 선정 기업",
    "Selected as a First Cohort Winner of the World Economic Forum's MINDS program representing the chip industry.":
      "반도체 산업을 대표하여 세계경제포럼(WEF) MINDS 프로그램의 1기 선정 기업으로 뽑혔습니다.",
    "Frost & Sullivan, Best AI Chip Company": "Frost & Sullivan, 최고의 AI 칩 기업",
    'Awarded "Company of the Year in AI Chip Industry" by Frost & Sullivan as an emerging leader.':
      '신흥 리더로서 Frost & Sullivan으로부터 "AI 칩 산업 올해의 기업"으로 선정되었습니다.',
    "CES Innovation Awards 2024, Triple Honoree": "CES 혁신상 2024, 3개 부문 수상",
    "Secured the Triple Honoree distinction at CES 2024, proving excellence in edge AI semiconductor technology.":
      "CES 2024에서 3개 부문 수상의 영예를 안으며 엣지 AI 반도체 기술의 우수성을 입증했습니다.",
    "Computex, Innovation Award Winner": "Computex, 혁신상 수상",
    "Won 2nd place at Computex 2023 for innovative AI chip technology and market potential.":
      "혁신적인 AI 칩 기술과 시장 잠재력으로 Computex 2023에서 2위를 차지했습니다.",
    "VSD Innovators Awards, Gold Medal": "VSD 이노베이터 어워드, 금메달",
    "Received the Gold Medal at VSD's 2023 Innovators Awards for its DX-GEN IP technology.":
      "DX-GEN IP 기술로 VSD 2023 이노베이터 어워드에서 금메달을 수상했습니다.",
    "Korea Presidential Citation by KIPO": "특허청(KIPO) 대통령 표창 수상",
    "Honored with the Presidential Citation by KIPO for establishing a world-class patent portfolio and IP strategy.":
      "세계적 수준의 특허 포트폴리오와 IP 전략을 구축한 공로로 특허청으로부터 대통령 표창을 받았습니다.",

    // ---- Inquiry ----
    "DEEPX Submit an Inquiry": "DEEPX 문의 접수",
    "Technical": "기술 지원",
    "Technical support, and": "기술 지원 및",
    "developer questions": "개발 관련 문의",
    "Inquiry": "문의하기",
    "Sales": "영업",
    "Product, pricing, and": "제품, 가격 및",
    "purchase-related questions": "구매 관련 문의",
    "Partnerships": "파트너십",
    "Strategic alliances &": "전략적 제휴 및",
    "technology collaborations": "기술 협력",
    "Any others": "기타",
    "General questions,": "일반 문의,",
    "Event, IR, and PR": "이벤트, IR 및 PR",
    "Careers": "채용",
    "Explore careers at DEEPX and job application inquiries":
      "DEEPX의 채용 정보 및 입사 지원 문의",

    // ---- Footer ----
    "Video Management Systems": "영상 관리 시스템",
    "Company": "회사",
    "Trust Center": "트러스트 센터",
    "Single Board Computers": "싱글 보드 컴퓨터",
    "SoM Boards": "SoM 보드",
    "AI Gateway": "AI 게이트웨이",
    "Industrial PCs": "산업용 PC",
    "Workstations & Severs": "워크스테이션 & 서버",
    "Subscribe to our Newsletter": "뉴스레터 구독하기",
    "By clicking submit, you acknowledge that you have read and agree to our Privacy Policy.":
      "제출을 클릭하면 개인정보 처리방침을 읽고 이에 동의하는 것으로 간주됩니다.",
    "DEEPX HQ: 3F, 20 Pangyoyeok-ro 241beon-gil, Seongnam-si, Gyeonggi-do, 13494, Republic of Korea":
      "DEEPX 본사: 경기도 성남시 분당구 판교역로241번길 20, 3층 (13494), 대한민국",
    "E-mail: info@deepx.ai": "이메일: info@deepx.ai",
    "Privacy Policy": "개인정보 처리방침",
    "Terms of Use": "이용약관",
    "Copyrightⓒ 2026 DEEPX Co., Ltd. All Rights Reserved.":
      "Copyrightⓒ 2026 DEEPX Co., Ltd. All Rights Reserved.",
    "- Edge Computing": "– 엣지 컴퓨팅",
    "- Smart Mobility": "– 스마트 모빌리티",
    "- Smart Factory": "– 스마트 팩토리",
    "- Smart City": "– 스마트 시티",
    "- Video Management Systems": "– 영상 관리 시스템",

    // ---- Form controls (translated via attributes) ----
    "Enter your email": "이메일을 입력하세요",
    "Subscribe": "구독하기",
    "Search": "검색"
  };

  // Build normalized lookup once.
  var LOOKUP = Object.create(null);
  Object.keys(DICT).forEach(function (k) {
    LOOKUP[norm(k)] = DICT[k];
  });

  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, CODE: 1 };
  var nodes = []; // translatable text nodes
  var attrs = []; // { el, name } whose value/placeholder we translate
  var lang = "en";

  function isInSwitch(node) {
    var p = node.parentNode;
    while (p) {
      if (p.id === "deepx-lang-switch") return true;
      p = p.parentNode;
    }
    return false;
  }

  function consider(textNode) {
    if (!textNode.nodeValue) return;
    var parent = textNode.parentNode;
    if (!parent || SKIP_TAGS[parent.nodeName]) return;
    if (isInSwitch(textNode)) return;
    var key = norm(textNode.nodeValue);
    if (!key || !(key in LOOKUP)) return;
    if (textNode.__deepx_en === undefined) textNode.__deepx_en = textNode.nodeValue;
    nodes.push(textNode);
    // If we're already in KO mode (e.g. node added later), translate now.
    if (lang === "ko") applyOne(textNode);
  }

  function considerAttrs(el) {
    if (el.id === "deepx-lang-switch" || isInSwitch(el)) return;
    var candidates = [];
    if (el.hasAttribute && el.hasAttribute("placeholder")) candidates.push("placeholder");
    // submit/button labels live in the value attribute
    var tag = el.nodeName, type = (el.getAttribute && el.getAttribute("type")) || "";
    if (tag === "INPUT" && (type === "submit" || type === "button") &&
        el.hasAttribute("value")) candidates.push("value");
    for (var i = 0; i < candidates.length; i++) {
      var name = candidates[i], val = el.getAttribute(name);
      if (val == null || !(norm(val) in LOOKUP)) continue;
      var store = "__deepx_attr_" + name;
      if (el[store] === undefined) el[store] = val;
      attrs.push({ el: el, name: name });
      if (lang === "ko") applyAttr(el, name);
    }
  }

  function applyAttr(el, name) {
    var store = "__deepx_attr_" + name, en = el[store];
    if (en === undefined) return;
    if (lang === "ko") {
      var ko = LOOKUP[norm(en)];
      if (ko !== undefined) el.setAttribute(name, ko);
    } else {
      el.setAttribute(name, en);
    }
  }

  function applyOne(textNode) {
    var en = textNode.__deepx_en;
    if (en === undefined) return;
    if (lang === "ko") {
      var ko = LOOKUP[norm(en)];
      if (ko !== undefined) {
        // preserve original leading/trailing whitespace
        var lead = (en.match(/^\s*/) || [""])[0];
        var trail = (en.match(/\s*$/) || [""])[0];
        textNode.nodeValue = lead + ko + trail;
      }
    } else {
      textNode.nodeValue = en;
    }
  }

  function scan(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = walker.nextNode())) consider(n);
    // attributes on the root itself + descendants
    if (root.nodeType === 1) considerAttrs(root);
    if (root.querySelectorAll) {
      var els = root.querySelectorAll("[placeholder], input[type=submit], input[type=button]");
      for (var i = 0; i < els.length; i++) considerAttrs(els[i]);
    }
  }

  function apply() {
    for (var i = 0; i < nodes.length; i++) applyOne(nodes[i]);
    for (var a = 0; a < attrs.length; a++) applyAttr(attrs[a].el, attrs[a].name);
    document.documentElement.setAttribute("lang", lang === "ko" ? "ko" : "en-US");
    var btn = document.getElementById("deepx-lang-switch");
    if (btn) {
      btn.querySelector("[data-l='en']").classList.toggle("on", lang === "en");
      btn.querySelector("[data-l='ko']").classList.toggle("on", lang === "ko");
    }
  }

  function setLang(next) {
    lang = next === "ko" ? "ko" : "en";
    try { localStorage.setItem(STORE_KEY, lang); } catch (e) {}
    apply();
    // Notify external UI (e.g. the accessible header toggle) so it can
    // reflect the active language without reaching into our internals.
    try {
      document.dispatchEvent(new CustomEvent("deepx:langchange", { detail: { lang: lang } }));
    } catch (e) {}
  }

  /* Re-scan the DOM for newly added translatable text/attributes and
     re-apply the current language. Safe to call repeatedly; nodes are
     de-duplicated implicitly because each stores its own English source. */
  function refresh() {
    scan(document.body);
    apply();
  }

  function buildSwitch() {
    var css = document.createElement("style");
    css.textContent =
      "#deepx-lang-switch{position:fixed;left:20px;bottom:20px;z-index:99999;" +
      "display:inline-flex;align-items:center;background:#0b1220;color:#fff;" +
      "border-radius:999px;padding:4px;box-shadow:0 6px 24px rgba(0,0,0,.28);" +
      "font-family:Roboto,system-ui,'Noto Sans KR',sans-serif;font-size:13px;" +
      "font-weight:600;user-select:none;border:1px solid rgba(255,255,255,.14)}" +
      "#deepx-lang-switch button{all:unset;cursor:pointer;padding:6px 13px;" +
      "border-radius:999px;line-height:1;transition:background .18s,color .18s;" +
      "color:#9aa6bf}" +
      "#deepx-lang-switch button.on{background:#1d4ed8;color:#fff}" +
      "#deepx-lang-switch button:hover:not(.on){color:#fff}" +
      "@media (max-width:600px){#deepx-lang-switch{left:12px;bottom:12px;font-size:12px}}";
    document.head.appendChild(css);

    var wrap = document.createElement("div");
    wrap.id = "deepx-lang-switch";
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", "Language / 언어");
    wrap.innerHTML =
      "<button data-l='en' type='button' aria-label='English'>EN</button>" +
      "<button data-l='ko' type='button' aria-label='한국어'>한국어</button>";
    wrap.querySelector("[data-l='en']").addEventListener("click", function () { setLang("en"); });
    wrap.querySelector("[data-l='ko']").addEventListener("click", function () { setLang("ko"); });
    document.body.appendChild(wrap);
  }

  function init() {
    // The accessible header (header.js) provides its own in-bar language
    // toggle. When it's present we suppress the standalone floating pill to
    // avoid a duplicate control. header.js sets this flag before we run.
    if (!window.__DEEPX_HEADER_PRESENT__) buildSwitch();
    scan(document.body);
    try { lang = localStorage.getItem(STORE_KEY) === "ko" ? "ko" : "en"; } catch (e) {}
    apply();

    // Public API consumed by header.js (and anything else that needs to
    // drive translation). Kept tiny and stable.
    window.DeepxI18n = {
      set: setLang,
      get: function () { return lang; },
      refresh: refresh
    };
    // Announce initial state so late-loaded UI can sync immediately.
    try {
      document.dispatchEvent(new CustomEvent("deepx:langchange", { detail: { lang: lang } }));
    } catch (e) {}

    // Re-scan late-rendered content (Swiper loop clones, lazy widgets).
    setTimeout(function () { scan(document.body); apply(); }, 1200);

    // Translate nodes inserted after load while staying in sync.
    if (window.MutationObserver) {
      var mo = new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var added = muts[i].addedNodes;
          for (var j = 0; j < added.length; j++) {
            var node = added[j];
            if (node.nodeType === 3) consider(node);
            else if (node.nodeType === 1 && !SKIP_TAGS[node.nodeName] && node.id !== "deepx-lang-switch") {
              scan(node);
            }
          }
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
