// --- DICCIONARIOS Y CONSTANTES ---

export const STOPWORDS = new Set([
  "el", "la", "los", "las", "un", "una", "unos", "unas", "y", "o", "pero", "que", "de", "del", "al", "en", "con", "por", "para", "si", "no", "es", "son", "a", "su", "sus", "mi", "mis", "tu", "tus", "se", "le", "les", "lo", "me", "te", "nos", "os", "esta", "este", "esto", "como", "cuando", "donde", "porque", "tan"
]);

export const VERBOS_BAUL = new Set([
  "hacer", "hizo", "hace", "hecho", "haciendo", "hago", "haga",
  "tener", "tiene", "tenía", "tenido", "teniendo", "tengo", "tenga",
  "poner", "puso", "puesto", "poniendo", "pongo", "ponga",
  "decir", "dijo", "dicho", "diciendo", "digo", "diga",
  "haber", "hay", "había", "hubo",
  "dar", "dio", "dado", "dando", "doy"
]);

export const SUSTANTIVOS_BAUL = new Set([
  "cosa", "cosas", "algo", "tema", "temas", "asunto", "asuntos", 
  "gente", "personas", "tipo", "tipos", "problema", "problemas", "manera", "formas",
  "bueno", "malo", "importante", "interesante" 
]);

export const PALABRAS_BAUL = new Set([...VERBOS_BAUL, ...SUSTANTIVOS_BAUL]);

export const VERBOS_PERCEPCION = new Set([
  "ver", "veo", "ves", "ve", "vemos", "ven", "vi", "viste", "vio", "vimos", "vieron", "veía", "veías", "veíamos", "veían", "visto",
  "mirar", "miro", "miras", "mira", "miramos", "miran", "miré", "miraste", "miró", "miramos", "miraron", "miraba", "mirabas", "mirábamos", "miraban", "mirado",
  "observar", "observo", "observa", "observé", "observó", "observaba",
  "oír", "oigo", "oyes", "oye", "oímos", "oyen", "oí", "oíste", "oyó", "oyeron", "oía", "oías", "oíamos", "oían", "oído",
  "escuchar", "escucho", "escucha", "escuché", "escuchó", "escuchaba", "escuchado",
  "sentir", "siento", "sientes", "siente", "sentimos", "sienten", "sentí", "sentiste", "sintió", "sentimos", "sintieron", "sentía", "sentido",
  "notar", "noto", "nota", "noté", "notó", "notaba", "notado",
  "percibir", "percibo", "percibe", "percibí", "percibió", "percibía",
  "pensar", "pienso", "piensa", "pensé", "pensó", "pensaba", "pensado",
  "creer", "creo", "cree", "creí", "creyó", "creía", "creído",
  "saber", "sé", "sabe", "supe", "supo", "sabía", "sabido",
  "parecer", "parezco", "parece", "parecí", "pareció", "parecía", "parecido",
  "recordar", "recuerdo", "recuerda", "recordé", "recordó", "recordaba",
  "imaginar", "imagino", "imagina", "imaginé", "imaginó", "imaginaba",
  "decidir", "decido", "decide", "decidí", "decidió", "decidía",
  "comprender", "comprendo", "comprende", "comprendí", "comprendió", "comprendía"
]);

export const SENSORY_DICT = {
    sight: new Set(["rojo", "azul", "verde", "amarillo", "blanco", "negro", "gris", "brillante", "oscuro", "luz", "sombra", "pálido", "resplandor", "destello", "color", "transparente", "borroso", "nítido", "visual", "imagen", "reflejo"]),
    sound: new Set(["ruido", "sonido", "silencio", "grito", "susurro", "crujido", "estruendo", "murmullo", "eco", "voz", "zumbido", "chirrido", "golpe", "timbres", "melodía", "musical", "audible", "ronco", "agudo"]),
    touch: new Set(["suave", "áspero", "rugoso", "frío", "caliente", "tibio", "helado", "ardiente", "duro", "blando", "húmedo", "seco", "pegajoso", "piel", "caricia", "golpe", "roce", "textura", "seda", "lija"]),
    smell_taste: new Set(["olor", "aroma", "perfume", "peste", "hedor", "fragancia", "dulce", "amargo", "salado", "ácido", "picante", "sabor", "gusto", "delicioso", "nauseabundo", "acre", "rancio", "fresco"])
};

export const SUFIJOS_ADJETIVOS = ["oso", "osa", "ble", "al", "ante", "ente", "ivo", "iva", "ado", "ada", "ido", "ida"];

// --- HELPERS DE PROSODIA ---

const isVowel = (c) => /[aeiouáéíóúü]/i.test(c);
const isStrong = (c) => /[aeoáéó]/i.test(c); 
const isWeak = (c) => /[iuíúü]/i.test(c);     
const isAccented = (c) => /[áéíóú]/.test(c);   

export const getProsody = (word) => {
    const clean = word.toLowerCase().replace(/[.,;:!?()"«»]/g, "");
    if (!clean) return null;
    let nuclei = [];
    let currentNucleus = null;
    for(let i=0; i<clean.length; i++) {
        const c = clean[i];
        if (isVowel(c)) {
            const prev = clean[i-1];
            if (currentNucleus && prev && isVowel(prev)) {
                 if ((isStrong(prev) && isStrong(c)) || (isAccented(prev) && isWeak(c)) || (isWeak(prev) && isAccented(c))) {
                     nuclei.push(i); currentNucleus = i;
                 }
            } else { nuclei.push(i); currentNucleus = i; }
        } else { currentNucleus = null; }
    }
    const numSyllables = Math.max(1, nuclei.length);
    let stressIndex = -1; let tildeFound = false;
    nuclei.forEach((idx, sylIdx) => {
        if (isAccented(clean[idx]) || (clean[idx+1] && isVowel(clean[idx+1]) && isAccented(clean[idx+1]))) {
            stressIndex = numSyllables - 1 - sylIdx; tildeFound = true;
        }
    });
    if (!tildeFound) {
        const lastChar = clean[clean.length - 1];
        if (isVowel(lastChar) || lastChar === 'n' || lastChar === 's') stressIndex = 1; 
        else stressIndex = 0; 
    }
    const stressFromStart = numSyllables - 1 - stressIndex;
    return { clean, numSyllables, stressIndex: stressFromStart, stressType: stressIndex === 0 ? 'Aguda' : stressIndex === 1 ? 'Llana' : 'Esdrujula', syllableMap: Array(numSyllables).fill(0).map((_, i) => i === stressFromStart ? 1 : 0) };
};

// --- FUNCIÓN PRINCIPAL DE ANÁLISIS ---

export const analyzeText = (text) => {
    if (!text || !text.trim()) return null;

    const wordsRaw = text.split(/\s+/);
    const pureSentences = text.split(/([.!?]+)/).filter(s => s.trim().length > 0 && !/^[.!?]+$/.test(s));
    
    // Inicialización de métricas
    const wordCounts = {};
    const rhymes = { mente: 0, cion: 0, ado_ido: 0 };
    const baulWords = new Set();
    const cacophonies = [];
    let adjectiveClusters = 0;
    let perceptionCount = 0;
    let dialogueWordCount = 0;
    let passiveCount = 0;
    
    const sensoryCounts = { sight: 0, sound: 0, touch: 0, smell_taste: 0 };
    let totalCommas = 0;
    let totalSyllables = 0;

    // Análisis de Diálogo
    const dialogueRegex = /^[—–\-―«"“]/;
    const paragraphsRaw = text.split(/\n+/);
    paragraphsRaw.forEach(p => {
        const trimmed = p.trim();
        if (!trimmed) return;
        if (dialogueRegex.test(trimmed)) {
            dialogueWordCount += trimmed.split(/\s+/).length;
        } else {
             const quoteMatches = trimmed.match(/([“"«][^”"»]+[”"»])/g);
             if (quoteMatches) {
                 quoteMatches.forEach(match => {
                     dialogueWordCount += match.split(/\s+/).length;
                 });
            }
        }
    });

    // Análisis palabra por palabra
    wordsRaw.forEach((word, index) => {
      const clean = word.toLowerCase().replace(/[.,;:!?()"«»—]/g, "");
      if (!clean) return;

      const prosody = getProsody(clean);
      if(prosody) totalSyllables += prosody.numSyllables;

      if (!STOPWORDS.has(clean) && clean.length > 2) wordCounts[clean] = (wordCounts[clean] || 0) + 1;
      if (clean.endsWith("mente")) rhymes.mente++;
      if (clean.endsWith("ción") || clean.endsWith("cion")) rhymes.cion++;
      if (clean.endsWith("ado") || clean.endsWith("ido")) rhymes.ado_ido++;
      
      if (PALABRAS_BAUL.has(clean)) baulWords.add(clean);
      if (VERBOS_PERCEPCION.has(clean)) perceptionCount++;

      // Pasiva
      if (clean === 'se' && index < wordsRaw.length - 1) {
          passiveCount++; 
      }
      if ((clean === 'fue' || clean === 'fueron' || clean === 'sido') && index < wordsRaw.length - 1) {
          const next = wordsRaw[index+1] ? wordsRaw[index+1].toLowerCase() : "";
          if (next.endsWith('ado') || next.endsWith('ido')) passiveCount++;
      }

      // Cacofonías
      if (index < wordsRaw.length - 1) {
        const nextWord = wordsRaw[index + 1].toLowerCase().replace(/[.,;:!?()"«»]/g, "");
        if (clean.length >= 4 && nextWord.length >= 4) {
           if (clean.slice(-2) === nextWord.slice(0, 2)) cacophonies.push(`${clean} ${nextWord}`);
        }
      }
      
      // Adjetivos
      if (index < wordsRaw.length - 2) {
         const w2 = wordsRaw[index+1].toLowerCase().replace(/[.,;:!?]/g,"");
         const w3 = wordsRaw[index+2].toLowerCase().replace(/[.,;:!?]/g,"");
         const isAdj = (w) => SUFIJOS_ADJETIVOS.some(s => w.endsWith(s));
         if (!STOPWORDS.has(clean) && isAdj(w2) && isAdj(w3)) adjectiveClusters++;
      }

      // Sensorial
      if ([...SENSORY_DICT.sight].some(s => clean.includes(s))) sensoryCounts.sight++;
      if ([...SENSORY_DICT.sound].some(s => clean.includes(s))) sensoryCounts.sound++;
      if ([...SENSORY_DICT.touch].some(s => clean.includes(s))) sensoryCounts.touch++;
      if ([...SENSORY_DICT.smell_taste].some(s => clean.includes(s))) sensoryCounts.smell_taste++;
      
      if (word.includes(',')) totalCommas++;
    });

    const sortedRepetitions = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]).filter(([_, c]) => c > 1).slice(0, 10);
    const sentenceLengths = pureSentences.map(s => s.trim().split(/\s+/).length);
    const perceptionRatio = Math.min(100, Math.round(((perceptionCount / wordsRaw.length) * 100) * 10) / 10);
    const punctuationDensity = pureSentences.length > 0 ? Math.round((totalCommas / pureSentences.length) * 10) / 10 : 0;

    const avgSyllablesPerWord = totalSyllables / wordsRaw.length;
    const avgWordsPerSentence = wordsRaw.length / pureSentences.length;
    const readabilityScore = Math.max(0, Math.min(100, Math.round(206.84 - (60 * avgSyllablesPerWord) - (1.02 * avgWordsPerSentence))));
    
    const dialogueRatio = Math.round((dialogueWordCount / wordsRaw.length) * 100);

    const commasPerSentence = pureSentences.map(s => (s.match(/,/g) || []).length);
    const perceptionPerSentence = pureSentences.map(s => {
        const words = s.toLowerCase().replace(/[.,;:!?]/g, "").split(/\s+/);
        return words.filter(w => VERBOS_PERCEPCION.has(w)).length;
    });

    // Timelines
    const sensoryTimeline = pureSentences.map(sentence => {
        const sWords = sentence.toLowerCase().replace(/[.,;:!?]/g, "").split(/\s+/);
        const score = { sight: 0, sound: 0, touch: 0, smell_taste: 0 };
        sWords.forEach(w => {
            if ([...SENSORY_DICT.sight].some(s => w.includes(s))) score.sight++;
            if ([...SENSORY_DICT.sound].some(s => w.includes(s))) score.sound++;
            if ([...SENSORY_DICT.touch].some(s => w.includes(s))) score.touch++;
            if ([...SENSORY_DICT.smell_taste].some(s => w.includes(s))) score.smell_taste++;
        });
        return score;
    });

    const metricsTimeline = pureSentences.map(sentence => {
        const sWords = sentence.toLowerCase().replace(/[.,;:!?]/g, "").split(/\s+/);
        const score = { mente: 0, cion: 0, adj: 0 };
        sWords.forEach((w, idx) => {
            if (w.endsWith("mente") && w.length > 5) score.mente++;
            if ((w.endsWith("ción") || w.endsWith("cion")) && w.length > 4) score.cion++;
            const isAdj = (word) => SUFIJOS_ADJETIVOS.some(s => word && word.endsWith(s));
            if (isAdj(w) && !STOPWORDS.has(w)) {
                const nextW = sWords[idx+1];
                if (isAdj(nextW) && !STOPWORDS.has(nextW)) score.adj++;
            }
        });
        return score;
    });

    // Sismógrafo Alerts
    const sismografoAlerts = []; 
    let count = 0;
    for (let i = 0; i < sentenceLengths.length; i++) {
        if (sentenceLengths[i] < 10) count++;
        else { if (count >= 4) sismografoAlerts.push({ type: 'staccato', start: i - count, end: i - 1 }); count = 0; }
    }
    if (count >= 4) sismografoAlerts.push({ type: 'staccato', start: sentenceLengths.length - count, end: sentenceLengths.length - 1 });

    count = 0;
    for (let i = 0; i < sentenceLengths.length; i++) {
        if (sentenceLengths[i] > 20) count++; 
        else { if (count >= 3) sismografoAlerts.push({ type: 'wall', start: i - count, end: i - 1 }); count = 0; }
    }
    if (count >= 3) sismografoAlerts.push({ type: 'wall', start: sentenceLengths.length - count, end: sentenceLengths.length - 1 });

    count = 0; let flatStart = 0;
    for (let i = 1; i < sentenceLengths.length; i++) {
        const diff = Math.abs(sentenceLengths[i] - sentenceLengths[i-1]);
        if (diff < 3) count++;
        else { if (count >= 3) sismografoAlerts.push({ type: 'flat', start: flatStart, end: i - 1 }); count = 0; flatStart = i; }
    }
    if (count >= 3) sismografoAlerts.push({ type: 'flat', start: flatStart, end: sentenceLengths.length - 1 });

    // Anaphora
    const anaphoraAlerts = []; 
    for (let i = 0; i < pureSentences.length - 1; i++) {
        const s1 = pureSentences[i].trim().split(/\s+/);
        const s2 = pureSentences[i+1].trim().split(/\s+/);
        if(s1.length > 0 && s2.length > 0) {
            const w1 = s1[0].toLowerCase().replace(/[.,;:!?]/g,"");
            const w2 = s2[0].toLowerCase().replace(/[.,;:!?]/g,"");
            if (w1 === w2 && !STOPWORDS.has(w1) && w1.length > 2) {
                anaphoraAlerts.push({ word: w1, indices: [i, i+1] });
            }
        }
    }

    // Rhythm Analysis
    const rhythmAnalysis = pureSentences.map(sentence => {
        const words = sentence.trim().split(/\s+/);
        const prosodyData = words.map(w => getProsody(w)).filter(p => p !== null);
        if (prosodyData.length === 0) return null;

        const flatMap = []; const syllableSource = []; 
        prosodyData.forEach((p, wIdx) => {
            if (p.numSyllables === 1 && STOPWORDS.has(p.clean)) { flatMap.push(0); syllableSource.push({ wIdx }); }
            else { p.syllableMap.forEach(val => { flatMap.push(val); syllableSource.push({ wIdx }); }); }
        });

        const binaryString = flatMap.join('');
        const highlights = []; 
        const dactylRegex = /(100){3,}/g; const amphibrachRegex = /(010){3,}/g; const trocheeRegex = /(10){3,}/g;

        const findMatches = (regex, type, label) => {
            let match;
            while ((match = regex.exec(binaryString)) !== null) {
                const startSylIdx = match.index;
                const endSylIdx = match.index + match[0].length - 1;
                if (startSylIdx < syllableSource.length && endSylIdx < syllableSource.length) {
                    highlights.push({ type, label, startWordIdx: syllableSource[startSylIdx].wIdx, endWordIdx: syllableSource[endSylIdx].wIdx });
                }
            }
        };
        findMatches(dactylRegex, 'Dactílico', 'Vals/Épico');
        findMatches(amphibrachRegex, 'Anfíbraco', 'Melodioso');
        findMatches(trocheeRegex, 'Trocaico', 'Machacón');

        const lastWord = prosodyData[prosodyData.length - 1];
        let metricCount = flatMap.length;
        if (lastWord.stressType === 'Aguda') metricCount += 1; else if (lastWord.stressType === 'Esdrujula') metricCount -= 1;

        return { text: sentence, prosody: prosodyData, metricCount, highlights, isHendecasyllable: metricCount === 11, isOctosyllable: metricCount === 8 };
    }).filter(x => x);

    // RETORNO DEL OBJETO COMPLETO
    return {
      wordCount: wordsRaw.length,
      sentenceCount: pureSentences.length,
      repetitions: sortedRepetitions, 
      rhymes,
      sentenceLengths,
      sismografoAlerts, 
      anaphoraAlerts, 
      sensoryCounts, 
      sensoryTimeline, 
      metricsTimeline, 
      punctuationDensity,
      commasPerSentence, 
      perceptionPerSentence, 
      dialogueRatio, 
      readabilityScore, 
      passiveCount, 
      baulWords: [...baulWords],
      cacophonies: [...new Set(cacophonies)],
      perceptionRatio,
      adjectiveClusters,
      rhythmAnalysis,
      rawText: text,
      avgSentenceLength: pureSentences.length > 0 ? (wordsRaw.length / pureSentences.length).toFixed(1) : 0
    };
};