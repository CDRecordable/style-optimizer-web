import React, { useState, useRef } from 'react';
import { 
  BookOpen, 
  Activity, 
  Repeat, 
  Mic2, 
  AlertTriangle, 
  Feather, 
  Eye,
  Type,
  ArrowLeft,
  Maximize2,
  Sparkles,
  Bot,
  Music,
  Zap,
  AlignJustify,
  Minus,
  Box,
  MousePointerClick,
  Layers,
  List,
  Fingerprint,
  Ear,
  Utensils,
  PauseCircle,
  RefreshCcw,
  MessageSquare,
  Gauge,
  FileText,
  Printer,
  UserX
} from 'lucide-react';

// --- CONSTANTES Y DICCIONARIOS ---

const STOPWORDS = new Set([
  "el", "la", "los", "las", "un", "una", "unos", "unas", "y", "o", "pero", "que", "de", "del", "al", "en", "con", "por", "para", "si", "no", "es", "son", "a", "su", "sus", "mi", "mis", "tu", "tus", "se", "le", "les", "lo", "me", "te", "nos", "os", "esta", "este", "esto", "como", "cuando", "donde", "porque", "tan"
]);

// Refinamiento de categorías Baúl
const VERBOS_BAUL = new Set([
  "hacer", "hizo", "hace", "hecho", "haciendo", "hago", "haga",
  "tener", "tiene", "tenía", "tenido", "teniendo", "tengo", "tenga",
  "poner", "puso", "puesto", "poniendo", "pongo", "ponga",
  "decir", "dijo", "dicho", "diciendo", "digo", "diga",
  "haber", "hay", "había", "hubo",
  "dar", "dio", "dado", "dando", "doy"
]);

const SUSTANTIVOS_BAUL = new Set([
  "cosa", "cosas", "algo", "tema", "temas", "asunto", "asuntos", 
  "gente", "personas", "tipo", "tipos", "problema", "problemas", "manera", "formas",
  "bueno", "malo", "importante", "interesante" 
]);

const PALABRAS_BAUL = new Set([...VERBOS_BAUL, ...SUSTANTIVOS_BAUL]);

// LISTA AMPLIADA DE VERBOS DE PERCEPCIÓN/FILTRADO (Show vs Tell)
const VERBOS_PERCEPCION = new Set([
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

// DICCIONARIOS SENSORIALES
const SENSORY_DICT = {
    sight: new Set(["rojo", "azul", "verde", "amarillo", "blanco", "negro", "gris", "brillante", "oscuro", "luz", "sombra", "pálido", "resplandor", "destello", "color", "transparente", "borroso", "nítido", "visual", "imagen", "reflejo"]),
    sound: new Set(["ruido", "sonido", "silencio", "grito", "susurro", "crujido", "estruendo", "murmullo", "eco", "voz", "zumbido", "chirrido", "golpe", "timbres", "melodía", "musical", "audible", "ronco", "agudo"]),
    touch: new Set(["suave", "áspero", "rugoso", "frío", "caliente", "tibio", "helado", "ardiente", "duro", "blando", "húmedo", "seco", "pegajoso", "piel", "caricia", "golpe", "roce", "textura", "seda", "lija"]),
    smell_taste: new Set(["olor", "aroma", "perfume", "peste", "hedor", "fragancia", "dulce", "amargo", "salado", "ácido", "picante", "sabor", "gusto", "delicioso", "nauseabundo", "acre", "rancio", "fresco"])
};

const SUFIJOS_ADJETIVOS = ["oso", "osa", "ble", "al", "ante", "ente", "ivo", "iva", "ado", "ada", "ido", "ida"];

// --- CONFIGURACIÓN GEMINI API ---
const apiKey = ""; 

async function getGeminiFeedback(text) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Actúa como un editor literario experto. Analiza brevemente este texto. 1. Tono general. 2. Dos sugerencias de mejora (ritmo, léxico). 3. Un punto fuerte. Texto: "${text.substring(0, 1000)}..."` 
            }]
          }]
        })
      }
    );
    if (!response.ok) throw new Error('Error IA');
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Error al generar.";
  } catch (error) {
    console.error("Error IA:", error);
    return "Error de conexión con la IA.";
  }
}

// --- MOTOR DE PROSODIA ---
const isVowel = (c) => /[aeiouáéíóúü]/i.test(c);
const isStrong = (c) => /[aeoáéó]/i.test(c); 
const isWeak = (c) => /[iuíúü]/i.test(c);     
const isAccented = (c) => /[áéíóú]/.test(c);   

const getProsody = (word) => {
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

export default function StyleOptimizer() {
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [viewMode, setViewMode] = useState('input');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);

  const handleAnalyze = () => {
    if (!text.trim()) return;
    setAiFeedback(null);

    const wordsRaw = text.split(/\s+/);
    const pureSentences = text.split(/([.!?]+)/).filter(s => s.trim().length > 0 && !/^[.!?]+$/.test(s));
    
    // --- 1. ANALISIS BASICO ---
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

    // CÁLCULO DE DIÁLOGO POR PÁRRAFOS (CORREGIDO)
    const paragraphsRaw = text.split(/\n+/);
    paragraphsRaw.forEach(p => {
        const trimmed = p.trim();
        if (!trimmed) return;
        // Heurística: Si empieza por raya, guion o comillas, es diálogo
        if (/^[—\-«"“]/.test(trimmed)) {
            dialogueWordCount += trimmed.split(/\s+/).length;
        }
    });

    wordsRaw.forEach((word, index) => {
      const clean = word.toLowerCase().replace(/[.,;:!?()"«»—]/g, "");
      if (!clean) return;

      // Sílabas para legibilidad
      const prosody = getProsody(clean);
      if(prosody) totalSyllables += prosody.numSyllables;

      if (!STOPWORDS.has(clean) && clean.length > 2) wordCounts[clean] = (wordCounts[clean] || 0) + 1;
      if (clean.endsWith("mente")) rhymes.mente++;
      if (clean.endsWith("ción") || clean.endsWith("cion")) rhymes.cion++;
      if (clean.endsWith("ado") || clean.endsWith("ido")) rhymes.ado_ido++;
      
      if (PALABRAS_BAUL.has(clean)) baulWords.add(clean);
      if (VERBOS_PERCEPCION.has(clean)) perceptionCount++;

      // Voz pasiva / Se impersonal
      if (clean === 'se' && index < wordsRaw.length - 1) {
          passiveCount++; 
      }
      if ((clean === 'fue' || clean === 'fueron' || clean === 'sido') && index < wordsRaw.length - 1) {
          const next = wordsRaw[index+1].toLowerCase();
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

      if (SENSORY_DICT.sight.has(clean)) sensoryCounts.sight++;
      if (SENSORY_DICT.sound.has(clean)) sensoryCounts.sound++;
      if (SENSORY_DICT.touch.has(clean)) sensoryCounts.touch++;
      if (SENSORY_DICT.smell_taste.has(clean)) sensoryCounts.smell_taste++;
      
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

    // --- 2.1 DATOS POR FRASE ---
    const commasPerSentence = pureSentences.map(s => (s.match(/,/g) || []).length);
    const perceptionPerSentence = pureSentences.map(s => {
        const words = s.toLowerCase().replace(/[.,;:!?]/g, "").split(/\s+/);
        return words.filter(w => VERBOS_PERCEPCION.has(w)).length;
    });

    // --- SENSORY TIMELINE ---
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

    setAnalysis({
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
      rawText: text 
    });
    setViewMode("dashboard");
  };

  const triggerAiAnalysis = async () => {
    if (!analysis) return;
    setAiLoading(true);
    const feedback = await getGeminiFeedback(analysis.rawText);
    setAiFeedback(feedback);
    setAiLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderDetailView = () => {
    const paragraphs = analysis.rawText.split(/\n+/);
    
    if (viewMode === 'detail-passive') {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <UserX className="text-gray-500" /> Voz Pasiva e Impersonal
                    </h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>
                <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200 flex gap-4">
                    <div className="flex-1">
                        <h4 className="font-bold text-gray-800 mb-1">¿Por qué evitarlo?</h4>
                        <p className="text-sm text-gray-600">El "se" impersonal y la voz pasiva ("fue hecho") ocultan al sujeto. Restan fuerza y agencia a los personajes. </p>
                    </div>
                    <div className="text-right">
                        <span className="block text-3xl font-bold text-gray-800">{analysis.passiveCount}</span>
                        <span className="text-xs text-gray-500">casos detectados</span>
                    </div>
                </div>
                <div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700">
                    {paragraphs.map((para, pIdx) => {
                        if (!para.trim()) return null;
                        const words = para.split(/(\s+)/);
                        return (
                            <p key={pIdx} className="mb-6">
                                {words.map((w, i) => {
                                    if (!/\w+/.test(w)) return <span key={i}>{w}</span>;
                                    const clean = w.toLowerCase().replace(/[.,;:!?()"«»]/g, "");
                                    let style = "";
                                    if (clean === 'se' || clean === 'fue' || clean === 'fueron' || clean === 'sido') {
                                        style = "bg-gray-200 text-gray-800 font-medium px-1 rounded border-b-2 border-gray-400";
                                    }
                                    return <span key={i} className={style}>{w}</span>;
                                })}
                            </p>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (viewMode === 'detail-readability') {
        const score = analysis.readabilityScore;
        let label = "Normal";
        let color = "text-yellow-600";
        let desc = "Texto estándar, accesible para la mayoría.";
        
        if (score > 80) { label = "Muy Fácil"; color = "text-green-600"; desc = "Lectura muy sencilla, ideal para diálogos o infantil."; }
        else if (score > 60) { label = "Fácil"; color = "text-green-500"; desc = "Fluido y claro. Estilo periodístico o novela ligera."; }
        else if (score > 40) { label = "Normal"; color = "text-yellow-600"; desc = "Estilo narrativo estándar."; }
        else { label = "Difícil"; color = "text-red-600"; desc = "Texto denso, académico o barroco. Requiere concentración."; }

        return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                 <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Gauge className="text-teal-500" /> Índice de Legibilidad
                    </h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative w-48 h-48 flex items-center justify-center rounded-full border-8 border-gray-100">
                        <div className="text-center">
                            <span className={`text-5xl font-black ${color}`}>{score}</span>
                            <span className="block text-xs text-gray-400 uppercase mt-1">Fernández Huerta</span>
                        </div>
                    </div>
                    <h3 className={`mt-6 text-2xl font-bold ${color}`}>{label}</h3>
                    <p className="text-gray-600 mt-2 max-w-md text-center">{desc}</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl text-sm text-gray-600">
                    <h4 className="font-bold text-gray-800 mb-2">¿Cómo se calcula?</h4>
                    <p>Se basa en la longitud de las palabras (sílabas) y la longitud de las frases. <br/>Palabras largas + Frases largas = Texto difícil.</p>
                </div>
            </div>
        );
    }

    if (viewMode === 'detail-punctuation') {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <PauseCircle className="text-orange-500" /> Ritmo Respiratorio (Puntuación)
                    </h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>
                <div className="mb-10 p-5 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider flex items-center gap-2">
                        <Activity size={16}/> Densidad de Comas por Frase
                    </h3>
                    <div className="h-32 flex items-end gap-1 border-b border-gray-300 pb-1 overflow-x-auto mb-4 w-full">
                        {analysis.commasPerSentence.map((count, i) => {
                            let color = "bg-green-400";
                            if (count === 0) color = "bg-blue-300"; 
                            if (count > 3) color = "bg-orange-400"; 
                            if (count > 6) color = "bg-red-500";    
                            return (
                                <div key={i} className={`w-2 flex-shrink-0 rounded-t relative group ${color}`} style={{ height: `${Math.min(100, (count/8)*100 + 5)}%`, minWidth: '6px' }}>
                                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded mb-2 pointer-events-none z-20 whitespace-nowrap transition-opacity duration-200">
                                        Frase {i+1}: <span className="font-bold">{count} comas</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex flex-col p-3 rounded bg-blue-50 border border-blue-100"><span className="text-blue-800 font-bold text-sm mb-1">0 Comas (Directo)</span><p className="text-blue-700 text-xs opacity-90">Frase directa y rápida. Ideal para acción.</p></div>
                        <div className="flex flex-col p-3 rounded bg-green-50 border border-green-100"><span className="text-green-800 font-bold text-sm mb-1">1-3 Comas (Equilibrado)</span><p className="text-green-700 text-xs opacity-90">Ritmo estándar narrativo con pausas naturales.</p></div>
                        <div className="flex flex-col p-3 rounded bg-red-50 border border-red-100"><span className="text-red-800 font-bold text-sm mb-1">4+ Comas (Laberíntico)</span><p className="text-red-700 text-xs opacity-90">Riesgo de perder al lector. Considera dividir la frase.</p></div>
                    </div>
                </div>
                <div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700">
                    {paragraphs.map((para, pIdx) => {
                        if (!para.trim()) return null;
                        const sentences = para.split(/([.!?]+)/);
                        return (
                            <p key={pIdx} className="mb-6">
                                {sentences.map((part, sIdx) => {
                                    if (/^[.!?]+$/.test(part) || part.trim().length === 0) return <span key={sIdx}>{part}</span>;
                                    const commaCount = (part.match(/,/g) || []).length;
                                    let styleClass = "";
                                    if (commaCount === 0 && part.split(" ").length > 5) styleClass = "bg-blue-50 text-blue-900";
                                    if (commaCount > 3) styleClass = "bg-orange-50 text-orange-900";
                                    if (commaCount > 6) styleClass = "bg-red-100 text-red-900 border-b-2 border-red-300";
                                    const highlightedPart = part.split(/(,)/).map((token, tIdx) => {
                                        if (token === ',') return <span key={tIdx} className={commaCount > 3 ? "font-black text-red-600 bg-red-200" : "font-bold"}>,</span>;
                                        return token;
                                    });
                                    return <span key={sIdx} className={`rounded px-1 transition-colors hover:bg-opacity-80 ${styleClass}`} title={`${commaCount} comas`}>{highlightedPart}</span>;
                                })}
                            </p>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (viewMode === 'detail-showtell') {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Eye className="text-green-600" /> Show vs Tell (Filtros Mentales)
                    </h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>
                <div className="mb-10 p-5 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider flex items-center gap-2">
                        <Activity size={16}/> Densidad de "Filtros" por Frase
                    </h3>
                    <div className="h-32 flex items-end gap-1 border-b border-gray-300 pb-1 overflow-x-auto mb-4 w-full">
                        {analysis.perceptionPerSentence.map((count, i) => {
                            let color = "bg-green-400"; 
                            if (count > 0) color = "bg-red-400"; 
                            return (
                                <div key={i} className={`w-2 flex-shrink-0 rounded-t relative group ${color}`} style={{ height: `${Math.min(100, (count/3)*100 + 10)}%`, minWidth: '6px' }}>
                                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded mb-2 pointer-events-none z-20 whitespace-nowrap transition-opacity duration-200">
                                        Frase {i+1}: <span className="font-bold">{count} filtros</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-start gap-3 p-3 rounded bg-green-50 border border-green-100"><Eye size={20} className="text-green-600 mt-1" /><div><span className="text-green-800 font-bold text-sm block">Show (Experiencia Directa)</span><p className="text-green-700 text-xs opacity-90">El lector "vive" la escena sin intermediarios.</p></div></div>
                        <div className="flex items-start gap-3 p-3 rounded bg-red-50 border border-red-100"><Eye size={20} className="text-red-600 mt-1" /><div><span className="text-red-800 font-bold text-sm block">Tell (Filtro Mental)</span><p className="text-red-700 text-xs opacity-90">Verbos como <i>vio, sintió</i> crean distancia.</p></div></div>
                    </div>
                </div>
                <div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700">
                    {paragraphs.map((para, pIdx) => {
                        if (!para.trim()) return null;
                        const words = para.split(/(\s+)/); 
                        return (
                            <p key={pIdx} className="mb-6">
                                {words.map((w, wIdx) => {
                                    const clean = w.toLowerCase().replace(/[.,;:!?()"«»]/g, "");
                                    let styleClass = "";
                                    let tooltip = "";
                                    if (VERBOS_PERCEPCION.has(clean)) {
                                        styleClass = "bg-red-100 text-red-900 border-b-2 border-red-300 cursor-help transition-colors hover:bg-red-200 font-medium";
                                        tooltip = "Filtro: Intenta describir lo que vio/sintió directamente.";
                                    }
                                    return <span key={wIdx} className={`relative group ${styleClass}`}>{w}{tooltip && (<span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-max max-w-xs px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-sans font-normal shadow-lg text-center">{tooltip}</span>)}</span>;
                                })}
                            </p>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (viewMode === 'detail-senses') {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Eye className="text-blue-500" /> Mapa Sensorial (Show, Don't Tell)
                    </h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-blue-50 p-3 rounded border border-blue-200 text-center"><Eye className="mx-auto text-blue-500 mb-1" size={20}/><span className="text-blue-800 font-bold text-sm">Vista: {analysis.sensoryCounts.sight}</span></div>
                    <div className="bg-green-50 p-3 rounded border border-green-200 text-center"><Ear className="mx-auto text-green-500 mb-1" size={20}/><span className="text-green-800 font-bold text-sm">Oído: {analysis.sensoryCounts.sound}</span></div>
                    <div className="bg-orange-50 p-3 rounded border border-orange-200 text-center"><Fingerprint className="mx-auto text-orange-500 mb-1" size={20}/><span className="text-orange-800 font-bold text-sm">Tacto: {analysis.sensoryCounts.touch}</span></div>
                    <div className="bg-pink-50 p-3 rounded border border-pink-200 text-center"><Utensils className="mx-auto text-pink-500 mb-1" size={20}/><span className="text-pink-800 font-bold text-sm">Olfato/Gusto: {analysis.sensoryCounts.smell_taste}</span></div>
                </div>
                <div className="mb-10 p-5 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider flex items-center gap-2">
                        <Activity size={16}/> Distribución Sensorial (Línea de Tiempo)
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3"><Eye size={16} className="text-blue-400 w-6" /><div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden flex">{analysis.sensoryTimeline.map((s, i) => (<div key={i} className={`flex-1 h-full border-r border-white/20 ${s.sight > 0 ? 'bg-blue-500' : 'bg-transparent'}`} title={`Frase ${i+1}: ${s.sight} términos visuales`} />))}</div></div>
                        <div className="flex items-center gap-3"><Ear size={16} className="text-green-400 w-6" /><div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden flex">{analysis.sensoryTimeline.map((s, i) => (<div key={i} className={`flex-1 h-full border-r border-white/20 ${s.sound > 0 ? 'bg-green-500' : 'bg-transparent'}`} title={`Frase ${i+1}: ${s.sound} términos sonoros`} />))}</div></div>
                        <div className="flex items-center gap-3"><Fingerprint size={16} className="text-orange-400 w-6" /><div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden flex">{analysis.sensoryTimeline.map((s, i) => (<div key={i} className={`flex-1 h-full border-r border-white/20 ${s.touch > 0 ? 'bg-orange-500' : 'bg-transparent'}`} title={`Frase ${i+1}: ${s.touch} términos táctiles`} />))}</div></div>
                        <div className="flex items-center gap-3"><Utensils size={16} className="text-pink-400 w-6" /><div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden flex">{analysis.sensoryTimeline.map((s, i) => (<div key={i} className={`flex-1 h-full border-r border-white/20 ${s.smell_taste > 0 ? 'bg-pink-500' : 'bg-transparent'}`} title={`Frase ${i+1}: ${s.smell_taste} términos olfativos/gustativos`} />))}</div></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-3 text-center italic">Cada bloque representa una frase del texto. Los colores indican presencia sensorial. Se incluyen búsquedas parciales para cubrir plurales y variaciones.</p>
                </div>
                <div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700">
                    {paragraphs.map((para, pIdx) => {
                        if (!para.trim()) return null;
                        const words = para.split(/(\s+|[.,;:!?()"«»]+)/).filter(w => w.length > 0);
                        return (
                            <p key={pIdx} className="mb-6">
                                {words.map((w, i) => {
                                    if (!/\w+/.test(w)) return <span key={i}>{w}</span>;
                                    const clean = w.toLowerCase().replace(/[.,;:!?()"«»]/g, "");
                                    let style = "";
                                    if ([...SENSORY_DICT.sight].some(s => clean.includes(s))) style = "bg-blue-100 text-blue-900 border-b-2 border-blue-300";
                                    else if ([...SENSORY_DICT.sound].some(s => clean.includes(s))) style = "bg-green-100 text-green-900 border-b-2 border-green-300";
                                    else if ([...SENSORY_DICT.touch].some(s => clean.includes(s))) style = "bg-orange-100 text-orange-900 border-b-2 border-orange-300";
                                    else if ([...SENSORY_DICT.smell_taste].some(s => clean.includes(s))) style = "bg-pink-100 text-pink-900 border-b-2 border-pink-300";
                                    return <span key={i} className={style ? `px-1 rounded ${style}` : ""}>{w}</span>;
                                })}
                            </p>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (viewMode === 'detail-anaphora') {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <RefreshCcw className="text-teal-500" /> Inicios Repetitivos (Anáforas)
                    </h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>
                
                <div className="bg-teal-50 p-4 rounded-lg border border-teal-200 mb-6">
                    <div className="flex items-center gap-2 text-teal-800 font-bold mb-1"><RefreshCcw size={18}/> Anáfora Involuntaria</div>
                    <p className="text-sm text-teal-700">Empezar frases consecutivas con la misma palabra puede volver el texto monótono. Úsalo solo si es un recurso poético intencionado.</p>
                </div>
                <div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700">
                    {paragraphs.map((para, pIdx) => {
                        if (!para.trim()) return null;
                        const sentences = para.split(/([.!?]+)/);
                        return (
                            <p key={pIdx} className="mb-4">
                                {sentences.map((part, sIdx) => {
                                    if (/^[.!?]+$/.test(part) || part.trim().length === 0) return <span key={sIdx}>{part}</span>;
                                    const words = part.split(/(\s+)/);
                                    const firstWord = words.find(w => w.trim().length > 0);
                                    let highlight = false;
                                    if (firstWord) {
                                        const cleanFirst = firstWord.toLowerCase().replace(/[.,;:!?]/g, "");
                                        if (analysis.anaphoraAlerts.some(a => a.word === cleanFirst)) highlight = true;
                                    }
                                    return (
                                        <span key={sIdx}>
                                            {words.map((w, wIdx) => {
                                                if (wIdx === 0 && highlight && w.trim().length>0) { return <span key={wIdx} className="bg-teal-100 text-teal-900 font-bold border-b-2 border-teal-300 px-1 rounded">{w}</span>; }
                                                if (highlight && w.trim().length > 0 && words.slice(0, wIdx).every(pw => pw.trim().length === 0)) { return <span key={wIdx} className="bg-teal-100 text-teal-900 font-bold border-b-2 border-teal-300 px-1 rounded">{w}</span>; }
                                                return <span key={wIdx}>{w}</span>;
                                            })}
                                        </span>
                                    );
                                })}
                            </p>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (viewMode === 'detail-rhythm') {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Mic2 className="text-pink-500" /> Análisis Métrico y Rítmico
                    </h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>

                {/* CRONOGRAMA RÍTMICO */}
                <div className="mb-10 p-5 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider flex items-center gap-2">
                        <Activity size={16}/> Distribución Rítmica (Línea de Tiempo)
                    </h3>
                    <div className="space-y-3">
                        {/* Endecasílabos */}
                        <div className="flex items-center gap-3">
                            <div className="w-24 text-xs font-bold text-purple-600 text-right">Endecasílabos (11)</div>
                            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden flex">
                                {analysis.rhythmAnalysis.map((s, i) => (
                                    <div key={i} className={`flex-1 h-full border-r border-white/20 ${s.isHendecasyllable ? 'bg-purple-500' : 'bg-transparent'}`} title={`Frase ${i+1}: Endecasílabo`} />
                                ))}
                            </div>
                        </div>
                        {/* Octosílabos */}
                        <div className="flex items-center gap-3">
                            <div className="w-24 text-xs font-bold text-orange-600 text-right">Octosílabos (8)</div>
                            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden flex">
                                {analysis.rhythmAnalysis.map((s, i) => (
                                    <div key={i} className={`flex-1 h-full border-r border-white/20 ${s.isOctosyllable ? 'bg-orange-500' : 'bg-transparent'}`} title={`Frase ${i+1}: Octosílabo`} />
                                ))}
                            </div>
                        </div>
                        {/* Dactílico */}
                        <div className="flex items-center gap-3">
                            <div className="w-24 text-xs font-bold text-blue-600 text-right">Dactílico (Vals)</div>
                            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden flex">
                                {analysis.rhythmAnalysis.map((s, i) => {
                                    const hasPattern = s.highlights.some(h => h.type === 'Dactílico');
                                    return <div key={i} className={`flex-1 h-full border-r border-white/20 ${hasPattern ? 'bg-blue-500' : 'bg-transparent'}`} title={`Frase ${i+1}: Ritmo Dactílico`} />
                                })}
                            </div>
                        </div>
                        {/* Anfíbraco */}
                        <div className="flex items-center gap-3">
                             <div className="w-24 text-xs font-bold text-green-600 text-right">Anfíbraco</div>
                             <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden flex">
                                {analysis.rhythmAnalysis.map((s, i) => {
                                    const hasPattern = s.highlights.some(h => h.type === 'Anfíbraco');
                                    return <div key={i} className={`flex-1 h-full border-r border-white/20 ${hasPattern ? 'bg-green-500' : 'bg-transparent'}`} title={`Frase ${i+1}: Ritmo Anfíbraco`} />
                                })}
                            </div>
                        </div>
                         {/* Trocaico */}
                         <div className="flex items-center gap-3">
                             <div className="w-24 text-xs font-bold text-yellow-600 text-right">Trocaico</div>
                             <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden flex">
                                {analysis.rhythmAnalysis.map((s, i) => {
                                    const hasPattern = s.highlights.some(h => h.type === 'Trocaico');
                                    return <div key={i} className={`flex-1 h-full border-r border-white/20 ${hasPattern ? 'bg-yellow-500' : 'bg-transparent'}`} title={`Frase ${i+1}: Ritmo Trocaico`} />
                                })}
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-3 text-center italic">Visualización de la densidad métrica y rítmica a lo largo del texto.</p>
                </div>

                <div className="space-y-8">
                    {analysis.rhythmAnalysis.map((sentData, idx) => {
                        if (!sentData) return null;
                        let metricBadge = null;
                        let borderColor = "border-gray-100";
                        if (sentData.isHendecasyllable) { borderColor = "border-purple-200"; metricBadge = <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded uppercase tracking-wider mr-2">Endecasílabo (11)</span>; }
                        else if (sentData.isOctosyllable) { borderColor = "border-orange-200"; metricBadge = <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded uppercase tracking-wider mr-2">Octosílabo (8)</span>; }
                        return (
                            <div key={idx} className={`p-5 rounded-lg border ${borderColor} bg-gray-50 relative overflow-hidden`}>
                                <div className="flex items-center mb-4 gap-2">
                                    {metricBadge}
                                    {!metricBadge && <span className="text-xs text-gray-400 font-mono">{sentData.metricCount} sílabas</span>}
                                </div>
                                <div className="flex flex-wrap gap-x-2 gap-y-4 items-end leading-none relative z-10">
                                    {sentData.prosody.map((w, wIdx) => {
                                        const highlight = sentData.highlights.find(h => wIdx >= h.startWordIdx && wIdx <= h.endWordIdx);
                                        let containerClasses = "flex flex-col items-center group p-1 rounded transition-all duration-300";
                                        let label = null;
                                        if (highlight) {
                                            if (highlight.type === 'Dactílico') { containerClasses += " bg-blue-100 shadow-sm ring-1 ring-blue-200"; if (wIdx === highlight.startWordIdx) label = "Dactílico"; }
                                            else if (highlight.type === 'Anfíbraco') { containerClasses += " bg-green-100 shadow-sm ring-1 ring-green-200"; if (wIdx === highlight.startWordIdx) label = "Anfíbraco"; }
                                            else if (highlight.type === 'Trocaico') { containerClasses += " bg-yellow-100 shadow-sm ring-1 ring-yellow-200"; if (wIdx === highlight.startWordIdx) label = "Trocaico"; }
                                        }
                                        return (
                                            <div key={wIdx} className="relative">
                                                {label && <div className="absolute -top-6 left-0 z-20 whitespace-nowrap bg-white text-[10px] px-1.5 py-0.5 rounded shadow border font-bold uppercase tracking-wide text-gray-600 pointer-events-none">{label}</div>}
                                                <div className={containerClasses}>
                                                    <div className="flex gap-[2px] mb-1.5">
                                                        {w.syllableMap.map((isStressed, sIdx) => {
                                                            const visualStress = (w.numSyllables === 1 && STOPWORDS.has(w.clean)) ? 0 : isStressed;
                                                            return <div key={sIdx} className={`w-2 h-2 rounded-full transition-all ${visualStress ? 'bg-pink-500 w-2.5 h-2.5 mb-[1px]' : 'bg-gray-300'}`} />;
                                                        })}
                                                    </div>
                                                    <span className={`text-lg font-serif ${w.syllableMap.includes(1) && !STOPWORDS.has(w.clean) ? 'text-gray-900' : 'text-gray-500'}`}>{w.clean}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (viewMode === 'detail-sismografo') {
        let globalSentenceIdx = 0;

        return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Activity className="text-indigo-500" /> Mapa de Longitud y Cadencia
                    </h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>
                <div className="mb-10 bg-gray-50 p-6 rounded-xl -mx-2 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Activity size={20} /> Ritmo Visual del Texto
                    </h3>
                    <div className="h-40 flex items-end gap-1 border-b border-gray-300 pb-1 overflow-x-auto mb-8 w-full">
                        {analysis.sentenceLengths.map((len, i) => (
                            <div key={i} className={`w-2 rounded-t relative group flex-shrink-0 ${len > 20 ? 'bg-red-400' : len < 8 ? 'bg-blue-300' : 'bg-indigo-400'}`} style={{ height: `${Math.min(100, (len/40)*100)}%`, minWidth: '6px' }}>
                                <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded mb-2 pointer-events-none z-20 whitespace-nowrap transition-opacity duration-200">
                                    Frase {i+1}: <span className="font-bold">{len} palabras</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex flex-col p-4 rounded-lg bg-blue-50 border border-blue-100 h-full">
                            <div className="flex items-center gap-2 mb-2"><Zap size={18} className="text-blue-500" /><span className="text-blue-800 font-bold text-base">Staccato</span></div>
                            <p className="text-blue-700 text-xs leading-relaxed opacity-90">Sucesión de 4 o más frases cortas (&lt;10 palabras).</p>
                        </div>
                        <div className="flex flex-col p-4 rounded-lg bg-red-50 border border-red-100 h-full">
                            <div className="flex items-center gap-2 mb-2"><AlignJustify size={18} className="text-red-500" /><span className="text-red-800 font-bold text-base">Muro de Texto</span></div>
                            <p className="text-red-700 text-xs leading-relaxed opacity-90">Bloque denso de 3 o más frases largas (&gt;20 palabras).</p>
                        </div>
                        <div className="flex flex-col p-4 rounded-lg bg-gray-100 border border-gray-200 h-full"><div className="flex items-center gap-2 mb-2"><Minus size={18} className="text-gray-500" /><span className="text-gray-800 font-bold text-base">Monotonía</span></div><p className="text-gray-600 text-xs leading-relaxed">Secuencia de frases que tienen casi la misma longitud.</p></div><div className="flex flex-col p-4 rounded-lg bg-purple-50 border border-purple-100 h-full"><div className="flex items-center gap-2 mb-2"><div className="flex"><AlignJustify size={18} className="text-purple-500"/><Minus size={18} className="text-purple-500 -ml-1"/></div><span className="text-purple-800 font-bold text-base">Muro Monótono</span></div><p className="text-purple-700 text-xs leading-relaxed opacity-90">La combinación más peligrosa: frases largas y repetitivas.</p></div></div></div><div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700 space-y-6">{paragraphs.map((para, pIdx) => { if (!para.trim()) return null; const sentences = para.split(/([.!?]+)/); const sentenceElements = []; let buffer = ""; for (let i = 0; i < sentences.length; i++) { const part = sentences[i]; buffer += part; if (/^[.!?]+$/.test(part) || i === sentences.length - 1) { if(buffer.trim().length > 0 && !/^[.!?]+$/.test(buffer)) { const currentIdx = globalSentenceIdx; const activeAlerts = analysis.sismografoAlerts.filter(a => currentIdx >= a.start && currentIdx <= a.end); let style = "hover:bg-gray-50 transition-colors px-1 rounded"; let label = null; let icon = null; const types = activeAlerts.map(a => a.type); if (types.includes('wall') && types.includes('flat')) { style = "bg-purple-100 text-purple-900 decoration-purple-400 underline decoration-double underline-offset-4 font-medium"; const wallAlert = activeAlerts.find(a => a.type === 'wall'); if (currentIdx === wallAlert.start) { label = "Muro Monótono"; icon = <span className="flex"><AlignJustify size={12}/><Minus size={12}/></span>; } } else if (types.includes('staccato') && types.includes('flat')) { style = "bg-teal-100 text-teal-900 decoration-teal-400 underline decoration-double underline-offset-4 font-medium"; const staccatoAlert = activeAlerts.find(a => a.type === 'staccato'); if (currentIdx === staccatoAlert.start) { label = "Staccato Monótono"; icon = <span className="flex"><Zap size={12}/><Minus size={12}/></span>; } } else if (types.includes('wall')) { style = "bg-red-100 text-red-900 decoration-red-300 underline decoration-2 underline-offset-4"; const alert = activeAlerts.find(a => a.type === 'wall'); if (currentIdx === alert.start) { label = "Muro denso"; icon = <AlignJustify size={12}/>; } } else if (types.includes('staccato')) { style = "bg-blue-100 text-blue-900 decoration-blue-300 underline decoration-2 underline-offset-4"; const alert = activeAlerts.find(a => a.type === 'staccato'); if (currentIdx === alert.start) { label = "Ametralladora"; icon = <Zap size={12}/>; } } else if (types.includes('flat')) { style = "bg-gray-200 text-gray-800 decoration-gray-400 underline decoration-2 underline-offset-4"; const alert = activeAlerts.find(a => a.type === 'flat'); if (currentIdx === alert.start) { label = "Monotonía"; icon = <Minus size={12}/>; } } sentenceElements.push(<span key={i} className={`relative inline ${style} mr-1`}>{label && (<span className="absolute -top-5 left-0 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-white border px-1 rounded shadow-sm whitespace-nowrap z-10">{icon} {label}</span>)}{buffer}</span>); globalSentenceIdx++; } else { sentenceElements.push(<span key={i}>{buffer}</span>); } buffer = ""; } } return <p key={pIdx}>{sentenceElements}</p>; })}</div></div>); }
    if (viewMode === 'detail-cacophony') { /* ... */ return ( <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300"><div className="flex justify-between items-center mb-6 border-b pb-4"><h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Music className="text-red-500" /> Escáner Sonoro</h2><button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button></div><div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200"><div className="flex items-center gap-3 p-2"><div className="w-4 h-4 rounded-full bg-red-100 border border-red-300 flex items-center justify-center text-[10px] font-bold text-red-600">!</div><div><span className="block text-sm font-bold text-red-700">Choque</span><span className="text-xs text-gray-500">Final e inicio idénticos.</span></div></div><div className="flex items-center gap-3 p-2"><div className="w-4 h-4 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center text-[10px] font-bold text-blue-600">R</div><div><span className="block text-sm font-bold text-blue-700">Repetición</span><span className="text-xs text-gray-500">Misma palabra cerca.</span></div></div><div className="flex items-center gap-3 p-2"><div className="w-4 h-4 rounded-full bg-orange-100 border border-orange-300 flex items-center justify-center text-[10px] font-bold text-orange-600">E</div><div><span className="block text-sm font-bold text-orange-700">Eco</span><span className="text-xs text-gray-500">Rima interna.</span></div></div></div><div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700">{paragraphs.map((para, pIdx) => { if (!para.trim()) return null; const words = para.split(/(\s+|[.,;:!?()"«»]+)/).filter(w => w.length > 0); const realWordIndices = []; words.forEach((w, i) => { if (/\w+/.test(w) && w.trim().length > 0) realWordIndices.push(i); }); return ( <p key={pIdx} className="mb-6"> {words.map((w, i) => { if (!/\w+/.test(w)) return <span key={i}>{w}</span>; const clean = w.toLowerCase().replace(/[.,;:!?()"«»]/g, ""); if (clean.length < 2) return <span key={i}>{w}</span>; let styleClass = ""; let title = ""; const currentRealIdxPos = realWordIndices.indexOf(i); if (currentRealIdxPos === -1) return <span key={i}>{w}</span>; if (clean.length >= 3 && currentRealIdxPos < realWordIndices.length - 1) { const nextWIdx = realWordIndices[currentRealIdxPos + 1]; const nextW = words[nextWIdx].toLowerCase().replace(/[.,;:!?()"«»]/g, ""); if (nextW.length >= 3 && clean.slice(-2) === nextW.slice(0, 2)) { styleClass = "text-red-600 font-bold decoration-wavy underline decoration-red-300 bg-red-50"; title = "Choque sonoro"; } } if (!styleClass && !STOPWORDS.has(clean) && clean.length > 3) { const searchRange = realWordIndices.slice(currentRealIdxPos + 1, currentRealIdxPos + 15); const isRepeated = searchRange.some(idx => words[idx].toLowerCase().replace(/[.,;:!?()"«»]/g, "") === clean); const searchRangeBack = realWordIndices.slice(Math.max(0, currentRealIdxPos - 15), currentRealIdxPos); const isRepeatedBack = searchRangeBack.some(idx => words[idx].toLowerCase().replace(/[.,;:!?()"«»]/g, "") === clean); if (isRepeated || isRepeatedBack) { styleClass = "bg-blue-100 text-blue-900 border-b border-blue-300"; title = "Repetición cercana"; } } if (!styleClass && !STOPWORDS.has(clean) && clean.length > 4) { const suffix = clean.slice(-3); const searchRange = realWordIndices.slice(currentRealIdxPos + 1, currentRealIdxPos + 10); const hasEcho = searchRange.some(idx => { const target = words[idx].toLowerCase().replace(/[.,;:!?()"«»]/g, ""); return target.length > 4 && target.endsWith(suffix) && target !== clean; }); const searchRangeBack = realWordIndices.slice(Math.max(0, currentRealIdxPos - 10), currentRealIdxPos); const hasEchoBack = searchRangeBack.some(idx => { const target = words[idx].toLowerCase().replace(/[.,;:!?()"«»]/g, ""); return target.length > 4 && target.endsWith(suffix) && target !== clean; }); if (hasEcho || hasEchoBack) { styleClass = "text-orange-700 decoration-dotted underline decoration-orange-400 bg-orange-50"; title = "Eco / Rima interna"; } } return <span key={i} className={styleClass} title={title}>{w}</span>; })} </p> ); })}</div></div>); }
    if (viewMode === 'detail-baul') { /* ... */ return ( <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300"><div className="flex justify-between items-center mb-6 border-b pb-4"><h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><AlertTriangle className="text-yellow-500" /> Palabras Baúl</h2><button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200"><div className="flex items-start gap-3 p-2"><div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-300 flex-shrink-0 flex items-center justify-center text-orange-600"><MousePointerClick size={16} /></div><div><span className="block text-sm font-bold text-orange-800">Verbos Comodín</span><span className="text-xs text-gray-600 block mt-1">Verbos de significado muy amplio.</span></div></div><div className="flex items-start gap-3 p-2"><div className="w-8 h-8 rounded-full bg-yellow-100 border border-yellow-300 flex-shrink-0 flex items-center justify-center text-yellow-700"><Box size={16} /></div><div><span className="block text-sm font-bold text-yellow-800">Sustantivos Vagos</span><span className="text-xs text-gray-600 block mt-1">Términos abstractos o genéricos.</span></div></div></div><div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700">{paragraphs.map((para, pIdx) => { if (!para.trim()) return null; const words = para.split(/(\s+)/); return ( <p key={pIdx} className="mb-6"> {words.map((w, wIdx) => { const clean = w.toLowerCase().replace(/[.,;:!?()"«»]/g, ""); let styleClass = ""; if (VERBOS_BAUL.has(clean)) styleClass = "bg-orange-100 text-orange-900 border-b-2 border-orange-300 cursor-help transition-colors hover:bg-orange-200"; else if (SUSTANTIVOS_BAUL.has(clean)) styleClass = "bg-yellow-100 text-yellow-900 border-b-2 border-yellow-300 cursor-help transition-colors hover:bg-yellow-200"; return <span key={wIdx} className={styleClass}>{w}</span>; })} </p> ); })}</div></div>); }
    if (viewMode === 'detail-metrics') { /* ... */ return ( <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300"><div className="flex justify-between items-center mb-6 border-b pb-4"><h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Layers className="text-purple-500" /> Análisis de Densidad y Estilo</h2><button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button></div>
    
    {/* GRAPHIC: METRICS DISTRIBUTION (NEW) */}
    <div className="mb-10 p-5 bg-gray-50 rounded-xl border border-gray-200"><h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider flex items-center gap-2"><Activity size={16}/> Distribución de Estilo (Línea de Tiempo)</h3><div className="space-y-3"><div className="flex items-center gap-3"><div className="w-6 text-xs font-bold text-purple-500 text-right">-mte</div><div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden flex">{analysis.metricsTimeline.map((s, i) => (<div key={i} className={`flex-1 h-full border-r border-white/20 flex-shrink-0 ${s.mente > 0 ? 'bg-purple-500' : 'bg-transparent'}`} title={`Frase ${i+1}: ${s.mente} adverbios`} />))}</div></div><div className="flex items-center gap-3"><div className="w-6 text-xs font-bold text-indigo-500 text-right">-ción</div><div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden flex">{analysis.metricsTimeline.map((s, i) => (<div key={i} className={`flex-1 h-full border-r border-white/20 flex-shrink-0 ${s.cion > 0 ? 'bg-indigo-500' : 'bg-transparent'}`} title={`Frase ${i+1}: ${s.cion} nominalizaciones`} />))}</div></div><div className="flex items-center gap-3"><div className="w-6 text-xs font-bold text-orange-500 text-right">Adj+</div><div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden flex">{analysis.metricsTimeline.map((s, i) => (<div key={i} className={`flex-1 h-full border-r border-white/20 flex-shrink-0 ${s.adj > 0 ? 'bg-orange-500' : 'bg-transparent'}`} title={`Frase ${i+1}: ${s.adj} clusters de adjetivos`} />))}</div></div></div><p className="text-xs text-gray-400 mt-3 text-center italic">Cada bloque representa una frase. Los colores indican la presencia de elementos de estilo.</p></div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200"><div className="flex items-start gap-3 p-2"><div className="w-10 h-10 rounded-full bg-purple-100 border border-purple-300 flex-shrink-0 flex items-center justify-center text-purple-600 font-bold text-xs">-mte</div><div><span className="block text-sm font-bold text-purple-800">Adverbios -mente</span><span className="text-xs text-gray-600 block mt-1">Abuso indica verbos débiles.</span></div></div><div className="flex items-start gap-3 p-2"><div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-300 flex-shrink-0 flex items-center justify-center text-indigo-600 font-bold text-xs">-ción</div><div><span className="block text-sm font-bold text-indigo-800">Nominalizaciones</span><span className="text-xs text-gray-600 block mt-1">Estilo burocrático.</span></div></div><div className="flex items-start gap-3 p-2"><div className="w-10 h-10 rounded-full bg-orange-100 border border-orange-300 flex-shrink-0 flex items-center justify-center text-orange-600 font-bold text-xs">Adj+</div><div><span className="block text-sm font-bold text-orange-800">Clusters Adjetivos</span><span className="text-xs text-gray-600 block mt-1">Saturan la descripción.</span></div></div></div><div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700">{paragraphs.map((para, pIdx) => { if (!para.trim()) return null; const words = para.split(/(\s+|[.,;:!?()"«»]+)/).filter(w => w.length > 0); return ( <p key={pIdx} className="mb-6"> {words.map((w, i) => { if (!/\w+/.test(w)) return <span key={i}>{w}</span>; const clean = w.toLowerCase().replace(/[.,;:!?()"«»]/g, ""); let styleClass = ""; if (clean.endsWith("mente") && clean.length > 5) styleClass = "text-purple-700 bg-purple-50 font-bold border-b border-purple-200"; else if ((clean.endsWith("ción") || clean.endsWith("cion")) && clean.length > 4) styleClass = "text-indigo-700 bg-indigo-50 font-bold border-b border-indigo-200"; else { const isAdj = (word) => SUFIJOS_ADJETIVOS.some(s => word.toLowerCase().endsWith(s)); if (isAdj(clean) && !STOPWORDS.has(clean)) { const prevW = i > 1 ? words[i-2].toLowerCase().replace(/[.,;:!?]/g,"") : ""; const nextW = i < words.length - 2 ? words[i+2].toLowerCase().replace(/[.,;:!?]/g,"") : ""; if ((isAdj(prevW) && !STOPWORDS.has(prevW)) || (isAdj(nextW) && !STOPWORDS.has(nextW))) styleClass = "text-orange-700 bg-orange-50 font-bold border-b border-orange-200"; } } return <span key={i} className={styleClass}>{w}</span>; })} </p> ); })}</div></div>); }
    if (viewMode === 'detail-repetitions') { /* ... */ return ( <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300"><div className="flex justify-between items-center mb-6 border-b pb-4"><div className="flex items-center gap-3"><h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Repeat className="text-blue-500" /> Repeticiones</h2></div><button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"><div className="bg-blue-50 p-5 rounded-xl border border-blue-100"><div className="flex items-start gap-3 mb-2"><div className="p-2 bg-blue-100 rounded-full text-blue-600"><Repeat size={20} /></div><div><h3 className="font-bold text-blue-900">Eco Léxico</h3><p className="text-xs text-blue-700 mt-1 leading-relaxed">Repetición no intencionada de palabras con carga semántica.</p></div></div></div><div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"><div className="flex items-center gap-2 mb-3 text-gray-700 font-bold text-sm uppercase tracking-wider border-b pb-2"><List size={16} /> Hallazgos</div>{analysis.repetitions.length > 0 ? (<div className="space-y-2">{analysis.repetitions.slice(0, 5).map(([word, count], idx) => (<div key={word} className="flex justify-between items-center text-sm group"><span className="font-medium text-gray-800 capitalize">{word}</span><span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">{count}</span></div>))}</div>) : <p className="text-sm text-gray-400">Sin datos.</p>}</div></div><div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700">{paragraphs.map((para, pIdx) => { if (!para.trim()) return null; const words = para.split(/(\s+)/); return ( <p key={pIdx} className="mb-6"> {words.map((w, wIdx) => { const clean = w.toLowerCase().replace(/[.,;:!?()"«»]/g, ""); let styleClass = ""; if (viewMode === 'detail-repetitions') { const isRepeated = analysis.repetitions.some(([rw]) => rw === clean); if (isRepeated && !STOPWORDS.has(clean)) styleClass = "bg-blue-100 text-blue-900 font-medium border-b-2 border-blue-200"; } return <span key={wIdx} className={styleClass}>{w}</span>; })} </p> ); })}</div></div>); }
    if (viewMode === 'detail-dialogue') {
         return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><MessageSquare className="text-blue-500" /> Radiografía de Diálogo</h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>
                <div className="mb-8">
                    <div className="flex justify-between text-sm font-bold text-gray-600 mb-2">
                        <span>Narrativa ({100 - analysis.dialogueRatio}%)</span>
                        <span>Diálogo ({analysis.dialogueRatio}%)</span>
                    </div>
                    <div className="h-6 bg-gray-200 rounded-full overflow-hidden flex">
                        <div className="h-full bg-gray-400" style={{width: `${100 - analysis.dialogueRatio}%`}}></div>
                        <div className="h-full bg-blue-500" style={{width: `${analysis.dialogueRatio}%`}}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">El equilibrio ideal depende del género, pero los extremos suelen ser problemáticos.</p>
                </div>
                <div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700">
                     {paragraphs.map((para, pIdx) => {
                        if (!para.trim()) return null;
                        const isDialogue = /^[—\-«"“]/.test(para.trim());
                        return (
                            <p key={pIdx} className={`mb-6 p-2 rounded ${isDialogue ? 'bg-blue-50 border-l-4 border-blue-300 text-blue-900' : ''}`}>
                                {para}
                            </p>
                        );
                    })}
                </div>
            </div>
         );
    }

    return null;
  };

  // Main Dashboard Render
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <header className="bg-indigo-700 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold flex items-center gap-2"><Feather className="w-6 h-6" /> Style Optimizer <span className="text-xs bg-indigo-800 px-2 py-1 rounded text-indigo-200">Ultra</span></h1>
            <div className="flex gap-3">
                {analysis && <button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-xs transition flex items-center gap-2"><Printer size={14}/> Imprimir Informe</button>}
                {analysis && viewMode !== 'input' && ( <button onClick={() => { setAnalysis(null); setText(""); setViewMode("input"); setAiFeedback(null); }} className="bg-indigo-800 hover:bg-indigo-600 px-4 py-2 rounded-lg text-xs transition">Nuevo Texto</button> )}
            </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 print:p-0 print:max-w-none">
        
        {viewMode === 'input' && (
          <div className="bg-white rounded-xl shadow-md p-5 transition-all duration-500">
            <div className="mb-2 flex items-center justify-between"><label className="text-lg font-semibold text-gray-700">Introduce tu texto:</label></div>
            <textarea className="w-full h-48 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-lg leading-relaxed font-serif" placeholder="Pega aquí el pasaje a analizar..." value={text} onChange={(e) => setText(e.target.value)} />
            <div className="mt-3 flex justify-end">
              <button onClick={handleAnalyze} disabled={!text.trim()} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-indigo-700 flex items-center gap-2"><Activity className="w-4 h-4" /> Empezar Análisis</button>
            </div>
          </div>
        )}

        {viewMode.startsWith('detail-') && renderDetailView()}

        {viewMode === 'dashboard' && analysis && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* METRICS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard icon={<Type />} label="Palabras" value={analysis.wordCount} color="blue" />
                <MetricCard icon={<BookOpen />} label="Frases" value={analysis.sentenceCount} color="indigo" />
                <MetricCard icon={<Eye />} label="Show vs Tell" value={`${analysis.perceptionRatio}%`} color={analysis.perceptionRatio > 5 ? "red" : "green"} onClick={() => setViewMode('detail-showtell')} />
                <MetricCard icon={<PauseCircle />} label="Densidad Punt." value={analysis.punctuationDensity} color="orange" subtext="Comas/Frase" onClick={() => setViewMode('detail-punctuation')} />
            </div>
            
            {/* SECONDARY METRICS ROW (NEW) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard icon={<MessageSquare />} label="Diálogo" value={`${analysis.dialogueRatio}%`} color="blue" subtext="vs Narrativa" onClick={() => setViewMode('detail-dialogue')} />
                <MetricCard icon={<Gauge />} label="Legibilidad" value={analysis.readabilityScore} color="teal" subtext="Escala F. Huerta" onClick={() => setViewMode('detail-readability')} />
                <MetricCard icon={<UserX />} label="Voz Pasiva" value={analysis.passiveCount} color="gray" subtext="Casos detectados" onClick={() => setViewMode('detail-passive')} />
            </div>

            {/* IA SECTION */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-5 shadow-sm print:hidden">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3"><Bot size={24} className="text-purple-600" /><div><h3 className="font-bold text-gray-800">Editor Virtual (IA)</h3><p className="text-xs text-gray-500">Feedback cualitativo inteligente</p></div></div>
                    {!aiFeedback && (<button onClick={triggerAiAnalysis} disabled={aiLoading} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 shadow-md">{aiLoading ? "Analizando..." : <><Sparkles size={14} /> Consultar IA</>}</button>)}
                </div>
                {aiFeedback && <div className="mt-4 bg-white p-4 rounded border border-purple-100 text-sm text-gray-700 whitespace-pre-line animate-in fade-in">{aiFeedback}</div>}
            </div>

            {/* GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-6 lg:col-span-2">
                    {/* CARD SISMOGRAFO */}
                    <DashboardCard title="Sismógrafo de Frases" icon={<Activity className="text-indigo-600 w-5 h-5" />} onViewDetail={() => setViewMode('detail-sismografo')}>
                         <div className="mb-2 flex gap-2">
                            {analysis.sismografoAlerts.filter(a => a.type === 'staccato').length > 0 && <Badge color="blue" text="Staccato" count={analysis.sismografoAlerts.filter(a => a.type === 'staccato').length} />}
                            {analysis.sismografoAlerts.filter(a => a.type === 'wall').length > 0 && <Badge color="red" text="Muros" count={analysis.sismografoAlerts.filter(a => a.type === 'wall').length} />}
                            {analysis.sismografoAlerts.filter(a => a.type === 'flat').length > 0 && <Badge color="gray" text="Monotonía" count={analysis.sismografoAlerts.filter(a => a.type === 'flat').length} />}
                         </div>
                         <div className="h-24 flex items-end gap-1 border-b border-gray-200 pb-1 overflow-x-auto mb-1">
                            {analysis.sentenceLengths.map((len, i) => (<div key={i} className={`w-2 rounded-t relative group flex-shrink-0 ${len > 20 ? 'bg-red-400' : len < 8 ? 'bg-blue-300' : 'bg-indigo-400'}`} style={{ height: `${Math.min(100, (len/40)*100)}%`, minWidth: '6px' }}><div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded mb-2 pointer-events-none z-20 whitespace-nowrap transition-opacity duration-200">Frase {i+1}: <span className="font-bold">{len} palabras</span></div></div>))}
                         </div>
                    </DashboardCard>
                    
                    {/* CARD RITMO */}
                    <DashboardCard title="Logs de Ritmo (Prosodia)" icon={<Mic2 className="text-pink-600 w-5 h-5" />} onViewDetail={() => setViewMode('detail-rhythm')}>
                        <div className="mb-2 space-y-2">
                            <div className="flex gap-2 flex-wrap">
                                {analysis.rhythmAnalysis.some(s => s.isHendecasyllable) && <Badge color="purple" text="Endecasílabos" />}
                                {analysis.rhythmAnalysis.some(s => s.highlights.length > 0) && <Badge color="blue" text="Patrones" />}
                            </div>
                            <div className="bg-gray-50 p-2 rounded border border-gray-100 text-xs font-mono text-gray-400 overflow-hidden whitespace-nowrap">{analysis.rhythmAnalysis[0]?.text.substring(0, 50)}...</div>
                        </div>
                    </DashboardCard>

                    {/* NEW CARD: MAPA SENSORIAL */}
                    <DashboardCard title="Mapa Sensorial" icon={<Eye className="text-teal-600 w-5 h-5" />} onViewDetail={() => setViewMode('detail-senses')}>
                        <div className="grid grid-cols-4 gap-2 text-center">
                            <div className="bg-blue-50 rounded p-2"><Eye size={16} className="mx-auto text-blue-500"/><span className="text-xs font-bold text-blue-700">{analysis.sensoryCounts.sight}</span></div>
                            <div className="bg-green-50 rounded p-2"><Ear size={16} className="mx-auto text-green-500"/><span className="text-xs font-bold text-green-700">{analysis.sensoryCounts.sound}</span></div>
                            <div className="bg-orange-50 rounded p-2"><Fingerprint size={16} className="mx-auto text-orange-500"/><span className="text-xs font-bold text-orange-700">{analysis.sensoryCounts.touch}</span></div>
                            <div className="bg-pink-50 rounded p-2"><Utensils size={16} className="mx-auto text-pink-500"/><span className="text-xs font-bold text-pink-700">{analysis.sensoryCounts.smell_taste}</span></div>
                        </div>
                    </DashboardCard>
                </div>

                <div className="space-y-6">
                    {/* NEW CARD: ANÁFORAS */}
                    <DashboardCard title="Inicios Repetitivos" icon={<RefreshCcw className="text-teal-600 w-5 h-5" />} onViewDetail={() => setViewMode('detail-anaphora')}>
                        {analysis.anaphoraAlerts.length > 0 ? (
                            <div className="space-y-1">{analysis.anaphoraAlerts.slice(0,3).map((a,i) => (<div key={i} className="flex justify-between text-sm"><span className="text-gray-700 italic">"{a.word}..."</span><span className="text-xs bg-teal-100 text-teal-800 px-1 rounded">x{a.indices.length}</span></div>))}</div>
                        ) : <p className="text-xs text-gray-400">Sin anáforas detectadas.</p>}
                    </DashboardCard>

                    <DashboardCard title="Repeticiones" icon={<Repeat className="text-blue-600 w-5 h-5" />} onViewDetail={() => setViewMode('detail-repetitions')}>
                        <div className="space-y-1">{analysis.repetitions.slice(0, 3).map(([w, c]) => (<div key={w} className="flex justify-between text-sm"><span className="text-gray-700">{w}</span><span className="bg-blue-100 text-blue-800 px-2 rounded-full text-xs">{c}</span></div>))}</div>
                    </DashboardCard>
                    
                    <DashboardCard title="Cacofonías y Ecos" icon={<Music className="text-red-500 w-5 h-5" />} onViewDetail={() => setViewMode('detail-cacophony')}>
                        {analysis.cacophonies.length > 0 ? <p className="text-sm text-red-600 font-medium">{analysis.cacophonies.length} choques detectados</p> : <p className="text-xs text-green-600">Limpio.</p>}
                    </DashboardCard>

                    <DashboardCard title="Métricas Rápidas" icon={<Layers className="text-purple-600 w-5 h-5" />} onViewDetail={() => setViewMode('detail-metrics')}>
                        <div className="grid grid-cols-2 gap-2 text-center">
                             <div className="bg-purple-50 rounded p-1"><span className="block text-lg font-bold text-purple-600">{analysis.rhymes.mente}</span><span className="text-[10px] text-purple-400">-mente</span></div>
                             <div className="bg-indigo-50 rounded p-1"><span className="block text-lg font-bold text-indigo-600">{analysis.rhymes.cion}</span><span className="text-[10px] text-indigo-400">-ción</span></div>
                        </div>
                    </DashboardCard>
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function DashboardCard({ title, icon, children, onViewDetail }) {
    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2">{icon}<h3 className="font-bold text-gray-800">{title}</h3></div><button onClick={onViewDetail} className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-full"><Maximize2 size={16} /></button></div>
            <div className="mb-2">{children}</div>
            <div className="mt-1 pt-2 border-t border-gray-100"><button onClick={onViewDetail} className="w-full text-center text-xs font-medium text-indigo-600 hover:text-indigo-800">Ver detalles &rarr;</button></div>
        </div>
    );
}

function MetricCard({ icon, label, value, color, subtext, onClick }) {
    const colorClasses = { blue: "bg-blue-100 text-blue-700", indigo: "bg-indigo-100 text-indigo-700", red: "bg-red-100 text-red-700", green: "bg-green-100 text-green-700", orange: "bg-orange-100 text-orange-700", teal: "bg-teal-100 text-teal-700", gray: "bg-gray-100 text-gray-700" };
    return (
        <div 
            onClick={onClick}
            className={`relative bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-start space-x-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-all group hover:-translate-y-0.5' : ''}`}
        >
            <div className={`p-3 rounded-lg ${colorClasses[color] || colorClasses.blue}`}>{React.cloneElement(icon, { size: 24 })}</div>
            <div className="flex-grow"><p className="text-gray-500 text-sm font-medium">{label}</p><h4 className="text-2xl font-bold text-gray-800">{value}</h4>{subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}</div>
            {onClick && (
                <div className="absolute top-4 right-4 text-gray-300 group-hover:text-indigo-500 transition-colors">
                    <Maximize2 size={16} />
                </div>
            )}
        </div>
    );
}

function Badge({ color, text, count }) {
    const colors = { purple: "bg-purple-100 text-purple-700 border-purple-200", orange: "bg-orange-100 text-orange-700 border-orange-200", blue: "bg-blue-100 text-blue-700 border-blue-200", red: "bg-red-100 text-red-700 border-red-200", gray: "bg-gray-100 text-gray-700 border-gray-200" };
    return <span className={`px-2 py-1 rounded text-xs border ${colors[color]} flex items-center gap-1`}>{text} {count && <span className="font-bold">({count})</span>}</span>;
}