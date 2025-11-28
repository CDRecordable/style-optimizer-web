// src/services/aiPrompts.js

// Definición de Tonos
export const TONES = {
    MINIMALIST: 'minimalist', // Carver/Hemingway
    LITERARY: 'literary',     // Proust/Gabo
    CORPORATE: 'corporate'    // Forbes/Oficina
};

// Mapa de nombres legibles para la UI
export const TONE_LABELS = {
    [TONES.MINIMALIST]: '🔪 Minimalista (Directo)',
    [TONES.LITERARY]: '🎻 Literario (Evocador)',
    [TONES.CORPORATE]: '🏢 Corporativo (Eficaz)'
};

// Matriz Maestra de Prompts
export const PROMPT_MATRICES = {
    'detail-prosody': {
        [TONES.MINIMALIST]: "Rompe cualquier cadencia musical evidente. Reescribe usando un ritmo seco, tajante y directo. Elimina adjetivos que solo sirvan a la métrica.",
        [TONES.LITERARY]: "El ritmo actual es plano. Reescribe buscando una cadencia musical compleja (anfíbracos o dáctilos) que evoque la emoción de la escena.",
        [TONES.CORPORATE]: "Reescribe para que la lectura sea fluida y neutral. Evita cacofonías rítmicas o musicalidad excesiva que distraiga del mensaje."
    },
    'detail-passive': {
        [TONES.MINIMALIST]: "Pasa todo a voz activa. Sujeto + Verbo. Si no hay sujeto claro, invéntalo o usa 'alguien'. Sé agresivamente directo.",
        [TONES.LITERARY]: "Transforma a voz activa, otorgando la agencia al sujeto más poético o relevante emocionalmente de la oración.",
        [TONES.CORPORATE]: "Pasa a voz activa para clarificar responsabilidades. Mantén un tono profesional y diplomático."
    },
    'detail-readability': {
        [TONES.MINIMALIST]: "Simplifica el texto para un nivel de lectura de 6º de primaria. Frases cortas. Palabras sencillas. Elimina jergas.",
        [TONES.LITERARY]: "Eleva el registro del lenguaje sin perder claridad. Usa una sintaxis más elaborada si mejora la estética.",
        [TONES.CORPORATE]: "Optimiza para lectura rápida (skimming). Usa conectores lógicos claros y vocabulario de negocios estándar."
    },
    'detail-dialogue': {
        [TONES.MINIMALIST]: "Haz el diálogo cortante y realista. Elimina saludos, despedidas y etiquetas de diálogo ('dijo él') innecesarias.",
        [TONES.LITERARY]: "Añade subtexto y matices a las voces. Que lo que dicen oculte lo que realmente sienten. Diferencia el habla de los personajes.",
        [TONES.CORPORATE]: "Asegura que el intercambio de información en este diálogo sea preciso, cortés y eficiente. Elimina coloquialismos."
    },
    'detail-sismografo': {
        [TONES.MINIMALIST]: "Detecto frases demasiado largas. Rómpelas drásticamente. Punto y seguido es tu mejor amigo. Elimina oraciones subordinadas y conjunciones.",
        [TONES.LITERARY]: "El texto es denso. Orquestalo mejor usando puntuación variada (puntos y coma, guiones) para crear un ritmo de lectura envolvente.",
        [TONES.CORPORATE]: "Resume este bloque de texto denso. Divídelo en frases lógicas claras o conviértelo en una lista de puntos si es enumerativo."
    },
    'detail-showtell': {
        [TONES.MINIMALIST]: "Elimina el filtro mental ('vio que', 'sintió que'). Describe directamente la acción física o el objeto. Sé objetivo.",
        [TONES.LITERARY]: "Aplica 'Show, Don't Tell'. Usa metáforas sensoriales y descripciones evocadoras para sumergir al lector en la sensación sin nombrarla.",
        [TONES.CORPORATE]: "Elimina la subjetividad ('le pareció', 'creyó ver'). Céntrate en los hechos observables y los datos concretos."
    },
    'detail-baul': {
        [TONES.MINIMALIST]: "Sustituye la palabra vaga ('cosa', 'algo') por el sustantivo concreto. Si no aporta nada, elimínala.",
        [TONES.LITERARY]: "Encuentra un sinónimo inusual, preciso o poético para sustituir estos términos genéricos y enriquecer el léxico.",
        [TONES.CORPORATE]: "Sustituye por terminología técnica o formal (ej: 'realizar' por 'hacer', 'asunto' por 'tema'). Sé preciso."
    },
    'detail-punctuation': {
        [TONES.MINIMALIST]: "Esta frase es un laberinto. Divídela en dos o tres oraciones simples. Elimina aclaraciones entre comas.",
        [TONES.LITERARY]: "Revisa la puntuación. Asegúrate de que las pausas sirvan al ritmo dramático. Usa el punto y coma si es necesario.",
        [TONES.CORPORATE]: "Simplifica la sintaxis. Usa estructura Sujeto-Verbo-Objeto para reducir la necesidad de incisos y comas."
    },
    'detail-metrics': {
        [TONES.MINIMALIST]: "Elimina todos los adverbios en -mente. Elimina adjetivos antepuestos. Convierte nominalizaciones en verbos activos.",
        [TONES.LITERARY]: "Reduce los adverbios. Si dejas uno, que sea imprescindible. Busca adjetivos más potentes en lugar de acumular varios débiles.",
        [TONES.CORPORATE]: "Reduce adjetivos subjetivos. Mantén nominalizaciones solo si son términos estándar del sector. Modera los adverbios."
    },
    'detail-senses': {
        [TONES.MINIMALIST]: "Analiza el uso de los 5 sentidos en este texto. Sé breve. Dime qué sentido predomina y cuál falta. Critica si hay exceso de abstracción visual.",
        [TONES.LITERARY]: "Analiza la atmósfera sensorial del texto. ¿Es inmersiva? ¿Qué sentido predomina y cuál está ausente? Sugiere cómo enriquecer la sinestesia sin reescribir el texto.",
        [TONES.CORPORATE]: "Evalúa la claridad descriptiva. Indica si el texto se apoya demasiado en elementos visuales o si utiliza otros sentidos para reforzar el mensaje."
    },
    'detail-cacophony': {
        [TONES.MINIMALIST]: "Reescribe para eliminar la cacofonía (rima interna o aliteración molesta) detectada, buscando sinónimos.",
        [TONES.LITERARY]: "Reescribe para eliminar la cacofonía (rima interna o aliteración molesta) detectada, buscando sinónimos.",
        [TONES.CORPORATE]: "Reescribe para eliminar la cacofonía (rima interna o aliteración molesta) detectada, buscando sinónimos."
    },
    'detail-repetitions': {
        [TONES.MINIMALIST]: "Elimina la palabra repetida usando elipsis si se entiende. Si no, usa un pronombre simple.",
        [TONES.LITERARY]: "Sustituye la repetición por una metáfora, una perífrasis o un sinónimo culto que aporte matices nuevos.",
        [TONES.CORPORATE]: "Usa la repetición solo si es necesaria para la consistencia técnica. Si no, usa pronombres o referencias cruzadas."
    },
    'detail-anaphora': {
        [TONES.MINIMALIST]: "Fusiona las oraciones repetitivas o cambia radicalmente el sujeto de una de ellas.",
        [TONES.LITERARY]: "Si la anáfora no es poética, varía la sintaxis invirtiendo el orden de la oración (hipérbaton suave).",
        [TONES.CORPORATE]: "Si estás enumerando, usa una lista con viñetas. Si no, usa conectores de orden (Primero, Además)."
    },
    'detail-sticky': {
        [TONES.MINIMALIST]: "Elimina preposiciones y artículos sobrantes. Condensa la frase. Haz que sustantivo y verbo choquen.",
        [TONES.LITERARY]: "Reescribe para que la frase fluya mejor, ocultando la estructura gramatical pesada bajo un léxico más rico.",
        [TONES.CORPORATE]: "Ve al grano. Elimina rodeos y fórmulas de cortesía vacías ('con el objetivo de' -> 'para')."
    },
    'detail-pleonasms': {
        [TONES.MINIMALIST]: "Elimina la redundancia lógica detectada.",
        [TONES.LITERARY]: "Elimina la redundancia lógica detectada.",
        [TONES.CORPORATE]: "Elimina la redundancia lógica detectada."
    },
    'detail-starts': {
        [TONES.MINIMALIST]: "Empieza con el Sujeto o la Acción principal. Evita conectores largos al inicio.",
        [TONES.LITERARY]: "Introduce variedad empezando la oración con un complemento circunstancial, un adverbio o una cláusula absoluta.",
        [TONES.CORPORATE]: "Usa conectores lógicos claros al inicio (Por tanto, Sin embargo, En consecuencia) para estructurar el argumento."
    },
    'detail-uncountables': {
        [TONES.MINIMALIST]: "Elimina la cantidad vaga o dalo con un número exacto. 'Muchos' no sirve.",
        [TONES.LITERARY]: "Sustituye la cantidad vaga por una metáfora o imagen que sugiera magnitud (ej: 'una legión', 'un diluvio').",
        [TONES.CORPORATE]: "Sustituye términos vagos por cifras, porcentajes o rangos estimados concretos."
    },
    'detail-weakverbs': {
        [TONES.MINIMALIST]: "Encuentra un verbo simple y fuerte que sustituya a la construcción 'verbo+adverbio'. Sin florituras.",
        [TONES.LITERARY]: "Busca un verbo preciso, sonoro y evocador que capture la acción y la emoción, eliminando el adverbio.",
        [TONES.CORPORATE]: "Usa verbos de acción ejecutiva (liderar, gestionar, resolver) para reemplazar construcciones débiles."
    },
    'detail-archaisms': {
        [TONES.MINIMALIST]: "Identifica palabras arcaicas, en desuso o innecesariamente cultas que dificulten la lectura rápida.",
        [TONES.LITERARY]: "Identifica arcaísmos que suenen forzados, anacrónicos o que rompan la inmersión del lector moderno.",
        [TONES.CORPORATE]: "Detecta terminología obsoleta o palabras demasiado rebuscadas que resten claridad al mensaje profesional."
    }
};

/**
 * EXPORTACIONES ESPECÍFICAS
 */

export const PROMPT_ARCHAISMS = (text) => `Actúa como un lingüista experto. Analiza el siguiente texto en busca de arcaísmos, palabras en desuso o léxico innecesariamente complejo.
        
Texto: "${text}"

IMPORTANTE: Tu respuesta debe ser EXCLUSIVAMENTE un objeto JSON válido con este formato exacto, sin texto antes ni después:
{
    "archaisms": [
        { "word": "palabra_detectada", "suggestion": "sinónimo_moderno", "reason": "breve explicación" }
    ]
}
Si no encuentras ninguno, devuelve: { "archaisms": [] }`;

export const PROMPT_SHOW_DONT_TELL = (text) => `Actúa como un editor literario experto en la técnica 'Show, Don't Tell'.
Analiza el siguiente texto y detecta frases donde el autor 'cuenta' (resume, etiqueta emociones, usa verbos de percepción abstractos) en lugar de 'mostrar' (acciones, sentidos, pruebas físicas).

Texto: "${text}"

IMPORTANTE: Tu respuesta debe ser EXCLUSIVAMENTE un objeto JSON válido con este formato exacto:
{
    "issues": [
        { 
            "quote": "fragmento exacto del texto original", 
            "issue": "explicación breve de por qué es Telling", 
            "suggestion": "reescritura en modo Showing" 
        }
    ]
}
Si el texto es perfecto, devuelve: { "issues": [] }`;

export const PROMPT_REPETITIONS_NEARBY = (text) => `
    Eres un experto editor de estilo. Analiza el siguiente texto y detecta **repeticiones de palabras (sustantivos, verbos, adjetivos) que estén a menos de 15 palabras de distancia entre sí**. Ignora artículos y preposiciones comunes (el, la, de, en, que, y...).

    IMPORTANTE:
    1. Devuelve SOLAMENTE un array JSON válido.
    2. Usa comillas dobles (") para todas las claves y valores.
    3. Si el texto original contiene comillas, escápalas correctamente.
    4. No incluyas texto antes ni después del JSON.

    Formato JSON requerido:
    [
      {
        "segment": "El fragmento exacto del texto donde ocurre la repetición...",
        "word": "palabra_repetida",
        "suggestion": "Sugerencia para reescribir la frase"
      }
    ]

    Si no hay repeticiones molestas, devuelve: []

    TEXTO:
    "${text}"
`;

// Función helper para construir el prompt final
export const getPrompt = (componentId, tone, userText) => {
    const instruction = PROMPT_MATRICES[componentId]?.[tone] || "Mejora este texto.";
    
    if (componentId === 'detail-archaisms') return PROMPT_ARCHAISMS(userText);
    if (componentId === 'detail-senses') return `Actúa como un crítico literario experto. Analiza (NO reescribas) el equilibrio sensorial. Texto: "${userText}"`;
    if (componentId === 'detail-showtell') return PROMPT_SHOW_DONT_TELL(userText);

    return `Actúa como un editor experto con un estilo ${tone}. Tarea: ${instruction}. Texto: "${userText}". Devuelve solo el texto reescrito.`;
};