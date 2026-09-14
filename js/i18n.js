/* Traductions de l'interface (fr par défaut, en, es, it, ru).
   Les {jetons} sont remplacés à l'exécution. t(clé, params) renvoie la chaîne. */
window.LANGS = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
];

window.I18N = {
  // Héros / accueil
  hero_badge: { fr: "Atlas de poche · 193 pays", en: "Pocket atlas · 193 countries", es: "Atlas de bolsillo · 193 países", it: "Atlante tascabile · 193 paesi", ru: "Карманный атлас · 193 страны" },
  hero_before: { fr: "Deviens le ", en: "Become the ", es: "Conviértete en el ", it: "Diventa il ", ru: "Стань " },
  hero_high: { fr: "maître du monde", en: "master of the world", es: "amo del mundo", it: "padrone del mondo", ru: "властелином мира" },
  hero_sub: {
    fr: "Situe chaque pays sur la carte, continent par continent. Gagne des étoiles, enchaîne les séries, monte de niveau.",
    en: "Locate every country on the map, continent by continent. Earn stars, build streaks, level up.",
    es: "Localiza cada país en el mapa, continente a continente. Gana estrellas, encadena rachas y sube de nivel.",
    it: "Individua ogni paese sulla mappa, continente per continente. Guadagna stelle, incatena serie e sali di livello.",
    ru: "Находи каждую страну на карте, континент за континентом. Зарабатывай звёзды, набирай серии и повышай уровень.",
  },
  ring_world: { fr: "du monde", en: "of the world", es: "del mundo", it: "del mondo", ru: "мира" },
  word_countries: { fr: "pays", en: "countries", es: "países", it: "paesi", ru: "стран" },

  sec_mode: { fr: "Mode de jeu", en: "Game mode", es: "Modo de juego", it: "Modalità di gioco", ru: "Режим игры" },
  sec_progress: { fr: "Ta progression", en: "Your progress", es: "Tu progreso", it: "I tuoi progressi", ru: "Твой прогресс" },
  sec_continent: { fr: "Choisis ton continent", en: "Choose your continent", es: "Elige tu continente", it: "Scegli il tuo continente", ru: "Выбери континент" },
  sec_challenge: { fr: "Ou relève le défi", en: "Or take the challenge", es: "O acepta el reto", it: "Oppure accetta la sfida", ru: "Или прими вызов" },
  sec_trophies: { fr: "Tes trophées", en: "Your trophies", es: "Tus trofeos", it: "I tuoi trofei", ru: "Твои трофеи" },
  sec_regions: { fr: "Régions", en: "Regions", es: "Regiones", it: "Regioni", ru: "Регионы" },

  world_title: { fr: "Tour du monde", en: "World tour", es: "Vuelta al mundo", it: "Giro del mondo", ru: "Кругосветка" },
  world_desc: { fr: "Les {n} pays du monde en une seule partie.", en: "All {n} countries of the world in one game.", es: "Los {n} países del mundo en una sola partida.", it: "Tutti i {n} paesi del mondo in una sola partita.", ru: "Все {n} стран мира в одной игре." },
  world_ultimate: { fr: "Le défi ultime.", en: "The ultimate challenge.", es: "El reto definitivo.", it: "La sfida definitiva.", ru: "Главный вызов." },

  foot_made: { fr: "Fait avec ❤️ pour les explorateur·rice·s.", en: "Made with ❤️ for explorers.", es: "Hecho con ❤️ para exploradores.", it: "Fatto con ❤️ per gli esploratori.", ru: "Сделано с ❤️ для исследователей." },
  foot_credit: { fr: "Frontières © Natural Earth · Données : world-countries", en: "Borders © Natural Earth · Data: world-countries", es: "Fronteras © Natural Earth · Datos: world-countries", it: "Confini © Natural Earth · Dati: world-countries", ru: "Границы © Natural Earth · Данные: world-countries" },

  // Progression / stats
  level_word: { fr: "Niveau", en: "Level", es: "Nivel", it: "Livello", ru: "Уровень" },
  stat_record: { fr: "Record", en: "Best", es: "Récord", it: "Record", ru: "Рекорд" },
  stat_stars: { fr: "Étoiles", en: "Stars", es: "Estrellas", it: "Stelle", ru: "Звёзды" },
  stat_regions: { fr: "Régions", en: "Regions", es: "Regiones", it: "Regioni", ru: "Регионы" },
  stars_earned: { fr: "étoiles gagnées", en: "stars earned", es: "estrellas ganadas", it: "stelle ottenute", ru: "звёзд получено" },

  // Modes
  mode_locate: { fr: "Localiser", en: "Locate", es: "Localizar", it: "Localizza", ru: "На карте" },
  mode_flags: { fr: "Drapeaux", en: "Flags", es: "Banderas", it: "Bandiere", ru: "Флаги" },
  mode_capitals: { fr: "Capitales", en: "Capitals", es: "Capitales", it: "Capitali", ru: "Столицы" },
  verb_locate: { fr: "Trouve", en: "Find", es: "Encuentra", it: "Trova", ru: "Найди" },
  verb_flags: { fr: "Trouve le drapeau de", en: "Find the flag of", es: "Encuentra la bandera de", it: "Trova la bandiera di", ru: "Найди флаг страны:" },
  verb_capitals: { fr: "Trouve la capitale de", en: "Find the capital of", es: "Encuentra la capital de", it: "Trova la capitale di", ru: "Найди столицу страны:" },

  // HUD
  hud_score: { fr: "Score", en: "Score", es: "Puntos", it: "Punti", ru: "Очки" },
  hud_streak: { fr: "Série", en: "Streak", es: "Racha", it: "Serie", ru: "Серия" },
  hud_countries: { fr: "Pays", en: "Countries", es: "Países", it: "Paesi", ru: "Страны" },
  skip: { fr: "🤷 Je ne sais pas", en: "🤷 I don't know", es: "🤷 No lo sé", it: "🤷 Non lo so", ru: "🤷 Не знаю" },

  // Toasts en jeu
  toast_recovered: { fr: "Bien rattrapé !", en: "Nice recovery!", es: "¡Bien recuperado!", it: "Bel recupero!", ru: "Неплохо!" },
  toast_aim_land: { fr: "Vise un pays 🌊", en: "Aim for a country 🌊", es: "Apunta a un país 🌊", it: "Mira a un paese 🌊", ru: "Целься в страну 🌊" },
  wrong_map: { fr: "Non ! Ça, c'est {name}", en: "No! That's {name}", es: "¡No! Eso es {name}", it: "No! Quello è {name}", ru: "Нет! Это {name}" },
  not_in_zone: { fr: "« {name} » n'est pas dans cette zone", en: "\"{name}\" is not in this area", es: "«{name}» no está en esta zona", it: "«{name}» non è in questa zona", ru: "«{name}» не в этой зоне" },
  hint_capital: { fr: "Indice : capitale {cap}", en: "Hint: capital {cap}", es: "Pista: capital {cap}", it: "Indizio: capitale {cap}", ru: "Подсказка: столица — {cap}" },
  reveal_was: { fr: "C'était {name}", en: "It was {name}", es: "Era {name}", it: "Era {name}", ru: "Это {name}" },
  wrong_flag: { fr: "Non — le drapeau de {name}", en: "No — the flag of {name}", es: "No — la bandera de {name}", it: "No — la bandiera di {name}", ru: "Нет — флаг страны {name}" },
  wrong_cap: { fr: "Non — la capitale de {name}", en: "No — the capital of {name}", es: "No — la capital de {name}", it: "No — la capitale di {name}", ru: "Нет — столица страны {name}" },
  skip_flag: { fr: "Le drapeau de {name} : {flag}", en: "The flag of {name}: {flag}", es: "La bandera de {name}: {flag}", it: "La bandiera di {name}: {flag}", ru: "Флаг страны {name}: {flag}" },

  // Continent / cartes
  challenge_prefix: { fr: "Défi", en: "Challenge", es: "Reto", it: "Sfida", ru: "Вызов" },
  challenge_desc: { fr: "Les {n} pays du continent en une partie · {mode}.", en: "All {n} countries of the continent in one game · {mode}.", es: "Los {n} países del continente en una partida · {mode}.", it: "Tutti i {n} paesi del continente in una partita · {mode}.", ru: "Все {n} стран континента в одной игре · {mode}." },
  play: { fr: "Jouer ▸", en: "Play ▸", es: "Jugar ▸", it: "Gioca ▸", ru: "Играть ▸" },
  fini: { fr: "FINI", en: "DONE", es: "HECHO", it: "FATTO", ru: "ГОТОВО" },

  // Résultats
  res_region_done: { fr: "Région terminée !", en: "Region complete!", es: "¡Región completada!", it: "Regione completata!", ru: "Регион пройден!" },
  res_continent_done: { fr: "Continent conquis !", en: "Continent conquered!", es: "¡Continente conquistado!", it: "Continente conquistato!", ru: "Континент покорён!" },
  res_world_done: { fr: "Monde conquis !", en: "World conquered!", es: "¡Mundo conquistado!", it: "Mondo conquistato!", ru: "Мир покорён!" },
  res_perfect: { fr: "Sans-faute légendaire !", en: "Flawless legend!", es: "¡Sin fallos, legendario!", it: "Impeccabile, leggendario!", ru: "Безупречно, легенда!" },
  res_almost: { fr: "Presque !", en: "So close!", es: "¡Casi!", it: "Quasi!", ru: "Почти!" },
  res_first_try: { fr: "du premier coup", en: "first try", es: "a la primera", it: "al primo colpo", ru: "с первого раза" },
  res_retry: { fr: "Réessaie, tu vas y arriver !", en: "Try again, you've got this!", es: "¡Inténtalo de nuevo, tú puedes!", it: "Riprova, ce la farai!", ru: "Попробуй ещё раз, у тебя получится!" },
  stat_precision: { fr: "Précision", en: "Accuracy", es: "Precisión", it: "Precisione", ru: "Точность" },
  stat_beststreak: { fr: "Meilleure série", en: "Best streak", es: "Mejor racha", it: "Serie migliore", ru: "Лучшая серия" },
  btn_home: { fr: "Accueil", en: "Home", es: "Inicio", it: "Home", ru: "Главная" },
  btn_replay: { fr: "↻ Rejouer", en: "↻ Replay", es: "↻ Repetir", it: "↻ Rigioca", ru: "↻ Заново" },
  btn_continent_done: { fr: "Continent ✓", en: "Continent ✓", es: "Continente ✓", it: "Continente ✓", ru: "Континент ✓" },

  // Toasts méta
  levelup: { fr: "⭐ Niveau {n} — {title} !", en: "⭐ Level {n} — {title}!", es: "⭐ Nivel {n} — {title}!", it: "⭐ Livello {n} — {title}!", ru: "⭐ Уровень {n} — {title}!" },
  trophy: { fr: "{ic} Trophée : {name} !", en: "{ic} Trophy: {name}!", es: "{ic} Trofeo: {name}!", it: "{ic} Trofeo: {name}!", ru: "{ic} Трофей: {name}!" },
  timer_on: { fr: "⏱️ Chrono activé", en: "⏱️ Timer on", es: "⏱️ Cronómetro activado", it: "⏱️ Timer attivo", ru: "⏱️ Таймер включён" },
  timer_off: { fr: "⏱️ Chrono coupé", en: "⏱️ Timer off", es: "⏱️ Cronómetro apagado", it: "⏱️ Timer spento", ru: "⏱️ Таймер выключен" },

  // Titres de niveau
  lvl_explorer: { fr: "Explorateur·rice", en: "Explorer", es: "Explorador/a", it: "Esploratore/trice", ru: "Исследователь" },
  lvl_adventurer: { fr: "Aventurier·ère", en: "Adventurer", es: "Aventurero/a", it: "Avventuriero/a", ru: "Путешественник" },
  lvl_navigator: { fr: "Navigateur·rice", en: "Navigator", es: "Navegante", it: "Navigatore/trice", ru: "Навигатор" },
  lvl_cartographer: { fr: "Cartographe", en: "Cartographer", es: "Cartógrafo/a", it: "Cartografo/a", ru: "Картограф" },
  lvl_globetrotter: { fr: "Globe-trotter", en: "Globetrotter", es: "Trotamundos", it: "Giramondo", ru: "Путешественник по миру" },
  lvl_master: { fr: "Maître du monde", en: "World master", es: "Maestro/a del mundo", it: "Padrone del mondo", ru: "Властелин мира" },
  lvl_legend: { fr: "Légende vivante", en: "Living legend", es: "Leyenda viva", it: "Leggenda vivente", ru: "Живая легенда" },

  // Réponses justes (au hasard)
  good: {
    fr: ["Bravo !", "Parfait !", "Super !", "Trouvé !"],
    en: ["Great!", "Perfect!", "Nice!", "Got it!"],
    es: ["¡Bien!", "¡Perfecto!", "¡Genial!", "¡Correcto!"],
    it: ["Bravo!", "Perfetto!", "Ottimo!", "Trovato!"],
    ru: ["Отлично!", "Верно!", "Супер!", "Есть!"],
  },

  // Trophées (nom + description)
  b_first: { fr: "Premiers pas", en: "First steps", es: "Primeros pasos", it: "Primi passi", ru: "Первые шаги" },
  b_first_d: { fr: "Termine ta 1ʳᵉ région", en: "Finish your 1st region", es: "Termina tu 1.ª región", it: "Completa la 1ª regione", ru: "Пройди первый регион" },
  b_perfect: { fr: "Sans faute", en: "Flawless", es: "Sin fallos", it: "Senza errori", ru: "Без ошибок" },
  b_perfect_d: { fr: "Une région 3 étoiles", en: "A 3-star region", es: "Una región de 3 estrellas", it: "Una regione a 3 stelle", ru: "Регион на 3 звезды" },
  b_streak10: { fr: "En feu", en: "On fire", es: "En racha", it: "Scatenato", ru: "В ударе" },
  b_streak10_d: { fr: "Série de 10", en: "Streak of 10", es: "Racha de 10", it: "Serie di 10", ru: "Серия из 10" },
  b_streak25: { fr: "Météore", en: "Meteor", es: "Meteoro", it: "Meteora", ru: "Метеор" },
  b_streak25_d: { fr: "Série de 25", en: "Streak of 25", es: "Racha de 25", it: "Serie di 25", ru: "Серия из 25" },
  b_c50: { fr: "Bourlingueur", en: "Wayfarer", es: "Trotamundos", it: "Giramondo", ru: "Странник" },
  b_c50_d: { fr: "50 pays maîtrisés", en: "50 countries mastered", es: "50 países dominados", it: "50 paesi imparati", ru: "50 стран освоено" },
  b_c100: { fr: "Centenaire", en: "Centurion", es: "Centenario", it: "Centenario", ru: "Сотня" },
  b_c100_d: { fr: "100 pays maîtrisés", en: "100 countries mastered", es: "100 países dominados", it: "100 paesi imparati", ru: "100 стран освоено" },
  b_cont: { fr: "Roi du continent", en: "Continent ruler", es: "Rey del continente", it: "Re del continente", ru: "Хозяин континента" },
  b_cont_d: { fr: "Un continent tout en or", en: "A continent all in gold", es: "Un continente todo en oro", it: "Un continente tutto d'oro", ru: "Континент полностью на золото" },
  b_world: { fr: "Tour du monde", en: "Around the world", es: "La vuelta al mundo", it: "Giro del mondo", ru: "Вокруг света" },
  b_world_d: { fr: "Les 193 pays", en: "All 193 countries", es: "Los 193 países", it: "Tutti i 193 paesi", ru: "Все 193 страны" },

  // Sélecteur de langue
  lang_label: { fr: "Langue", en: "Language", es: "Idioma", it: "Lingua", ru: "Язык" },
};
