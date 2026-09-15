/* ============================================================
   BACHOTE — internationalisation de l'INTERFACE
   (les cartes de l'utilisateur restent dans la langue qu'il écrit)
   Langues : fr (défaut), en, es, it, de, zh, ru
   ============================================================ */
(function () {
  "use strict";

  window.LANGS = [
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "en", label: "English",  flag: "🇬🇧" },
    { code: "es", label: "Español",  flag: "🇪🇸" },
    { code: "it", label: "Italiano", flag: "🇮🇹" },
    { code: "de", label: "Deutsch",  flag: "🇩🇪" },
    { code: "zh", label: "中文",      flag: "🇨🇳" },
    { code: "ru", label: "Русский",  flag: "🇷🇺" }
  ];

  var CODES = window.LANGS.map(function (l) { return l.code; });
  window.LANG_CODES = CODES;

  /* ---------- chaînes simples ---------- */
  var I = {
    // Barre du haut
    sound_toggle: { fr:"Activer / couper les sons", en:"Turn sound on / off", es:"Activar / silenciar sonidos", it:"Attiva / disattiva i suoni", de:"Ton an / aus", zh:"开启 / 关闭声音", ru:"Звук вкл. / выкл." },
    theme_toggle: { fr:"Thème clair / sombre", en:"Light / dark theme", es:"Tema claro / oscuro", it:"Tema chiaro / scuro", de:"Helles / dunkles Design", zh:"浅色 / 深色主题", ru:"Светлая / тёмная тема" },
    lang_toggle:  { fr:"Changer de langue", en:"Change language", es:"Cambiar de idioma", it:"Cambia lingua", de:"Sprache ändern", zh:"切换语言", ru:"Сменить язык" },

    // Accueil
    hero_l1:  { fr:"Colle ton cours.", en:"Paste your notes.", es:"Pega tus apuntes.", it:"Incolla i tuoi appunti.", de:"Text einfügen.", zh:"粘贴你的课堂笔记。", ru:"Вставь свой конспект." },
    hero_l2:  { fr:"On fabrique tes fiches.", en:"We make your cards.", es:"Creamos tus fichas.", it:"Creiamo le tue carte.", de:"Wir machen deine Karten.", zh:"我们帮你做卡片。", ru:"Мы сделаем карточки." },
    hero_sub: { fr:"Flashcards, quiz, jeu d'association et révision intelligente. Gratuit, sans compte, tes fiches restent sur ton appareil.",
                en:"Flashcards, quizzes, matching game and smart review. Free, no account, your cards stay on your device.",
                es:"Tarjetas, cuestionarios, juego de emparejar y repaso inteligente. Gratis, sin cuenta, tus fichas se quedan en tu dispositivo.",
                it:"Flashcard, quiz, gioco di abbinamento e ripasso intelligente. Gratis, senza account, le tue carte restano sul tuo dispositivo.",
                de:"Karteikarten, Quiz, Zuordnungsspiel und smartes Wiederholen. Kostenlos, ohne Konto, deine Karten bleiben auf deinem Gerät.",
                zh:"抽认卡、测验、连线游戏和智能复习。免费、无需账号，你的卡片只保存在本机。",
                ru:"Карточки, тесты, игра на сопоставление и умное повторение. Бесплатно, без аккаунта, карточки остаются на твоём устройстве." },
    due_hint: { fr:"La révision intelligente te montre en priorité ce que tu es sur le point d'oublier.",
                en:"Smart review shows you first what you're about to forget.",
                es:"El repaso inteligente te muestra primero lo que estás a punto de olvidar.",
                it:"Il ripasso intelligente ti mostra prima ciò che stai per dimenticare.",
                de:"Das smarte Wiederholen zeigt dir zuerst, was du bald vergisst.",
                zh:"智能复习会优先给你即将遗忘的内容。",
                ru:"Умное повторение показывает в первую очередь то, что ты вот-вот забудешь." },
    due_start: { fr:"Lancer la révision", en:"Start reviewing", es:"Empezar el repaso", it:"Inizia il ripasso", de:"Wiederholung starten", zh:"开始复习", ru:"Начать повторение" },
    decks_title: { fr:"Tes paquets", en:"Your decks", es:"Tus mazos", it:"I tuoi mazzi", de:"Deine Stapel", zh:"你的卡组", ru:"Твои наборы" },
    new_deck: { fr:"+ Nouveau paquet", en:"+ New deck", es:"+ Nuevo mazo", it:"+ Nuovo mazzo", de:"+ Neuer Stapel", zh:"+ 新建卡组", ru:"+ Новый набор" },
    subject_note: { fr:"Choisis une matière et remplis-la avec tes propres mots — ou colle ton cours.",
                    en:"Pick a subject and fill it with your own words — or paste your notes.",
                    es:"Elige una asignatura y complétala con tus propias palabras — o pega tus apuntes.",
                    it:"Scegli una materia e riempila con le tue parole — o incolla i tuoi appunti.",
                    de:"Wähle ein Fach und füll es mit deinen eigenen Wörtern — oder füg deinen Text ein.",
                    zh:"选择一个科目，用你自己的词填充——或直接粘贴课堂笔记。",
                    ru:"Выбери предмет и заполни его своими словами — или вставь конспект." },
    subject_head_empty: { fr:"Commence par une matière", en:"Start with a subject", es:"Empieza por una asignatura", it:"Inizia da una materia", de:"Beginne mit einem Fach", zh:"从一个科目开始", ru:"Начни с предмета" },
    subject_head_more:  { fr:"Créer un nouveau paquet", en:"Create a new deck", es:"Crear un mazo nuevo", it:"Crea un nuovo mazzo", de:"Neuen Stapel erstellen", zh:"创建新卡组", ru:"Создать новый набор" },
    create_deck_tile: { fr:"+ Créer un paquet", en:"+ Create a deck", es:"+ Crear un mazo", it:"+ Crea un mazzo", de:"+ Stapel erstellen", zh:"+ 创建卡组", ru:"+ Создать набор" },
    blank_deck: { fr:"Paquet vierge", en:"Blank deck", es:"Mazo en blanco", it:"Mazzo vuoto", de:"Leerer Stapel", zh:"空白卡组", ru:"Пустой набор" },
    new_deck_tile: { fr:"Nouveau paquet", en:"New deck", es:"Nuevo mazo", it:"Nuovo mazzo", de:"Neuer Stapel", zh:"新建卡组", ru:"Новый набор" },

    // Écran paquet
    back_all: { fr:"← Tous les paquets", en:"← All decks", es:"← Todos los mazos", it:"← Tutti i mazzi", de:"← Alle Stapel", zh:"← 所有卡组", ru:"← Все наборы" },
    edit:   { fr:"Modifier", en:"Edit", es:"Editar", it:"Modifica", de:"Bearbeiten", zh:"编辑", ru:"Изменить" },
    share:  { fr:"Partager", en:"Share", es:"Compartir", it:"Condividi", de:"Teilen", zh:"分享", ru:"Поделиться" },
    delete: { fr:"Supprimer", en:"Delete", es:"Eliminar", it:"Elimina", de:"Löschen", zh:"删除", ru:"Удалить" },
    how_work: { fr:"Comment veux-tu travailler ?", en:"How do you want to study?", es:"¿Cómo quieres estudiar?", it:"Come vuoi studiare?", de:"Wie möchtest du lernen?", zh:"你想怎么学？", ru:"Как хочешь заниматься?" },
    mode_review_name: { fr:"Révision intelligente", en:"Smart review", es:"Repaso inteligente", it:"Ripasso intelligente", de:"Smartes Wiederholen", zh:"智能复习", ru:"Умное повторение" },
    mode_review_desc: { fr:"L'algorithme choisit quoi te montrer et quand. Le plus efficace.", en:"The algorithm picks what to show and when. The most effective.", es:"El algoritmo elige qué mostrarte y cuándo. Lo más eficaz.", it:"L'algoritmo sceglie cosa mostrarti e quando. Il più efficace.", de:"Der Algorithmus wählt, was wann drankommt. Am effektivsten.", zh:"算法决定给你看什么、什么时候看。最有效。", ru:"Алгоритм сам решает, что и когда показать. Самое эффективное." },
    mode_flash_name: { fr:"Flashcards", en:"Flashcards", es:"Tarjetas", it:"Flashcard", de:"Karteikarten", zh:"抽认卡", ru:"Карточки" },
    mode_flash_desc: { fr:"Tu retournes la carte, tu vérifies. Simple et rapide.", en:"Flip the card, check yourself. Simple and fast.", es:"Giras la tarjeta y compruebas. Simple y rápido.", it:"Giri la carta e verifichi. Semplice e veloce.", de:"Karte umdrehen, prüfen. Einfach und schnell.", zh:"翻开卡片，自我检查。简单快速。", ru:"Переворачиваешь карточку и проверяешь себя. Просто и быстро." },
    mode_match_name: { fr:"Associer", en:"Match", es:"Emparejar", it:"Abbina", de:"Zuordnen", zh:"连线", ru:"Сопоставить" },
    mode_match_desc: { fr:"Relie chaque mot à sa définition, le plus vite possible.", en:"Link each word to its definition, as fast as you can.", es:"Une cada palabra con su definición lo más rápido posible.", it:"Collega ogni parola alla sua definizione il più in fretta possibile.", de:"Verbinde jedes Wort mit seiner Definition, so schnell du kannst.", zh:"尽快把每个词和它的定义连起来。", ru:"Соедини каждое слово с определением как можно быстрее." },
    mode_mcq_name: { fr:"QCM", en:"Quiz", es:"Test", it:"Quiz", de:"Quiz", zh:"选择题", ru:"Тест" },
    mode_mcq_desc: { fr:"Quatre propositions, une bonne réponse.", en:"Four choices, one right answer.", es:"Cuatro opciones, una correcta.", it:"Quattro opzioni, una giusta.", de:"Vier Optionen, eine richtige.", zh:"四个选项，一个正确答案。", ru:"Четыре варианта, один верный." },
    mode_write_name: { fr:"Écrire", en:"Write", es:"Escribir", it:"Scrivi", de:"Schreiben", zh:"拼写", ru:"Написать" },
    mode_write_desc: { fr:"Retrouve le mot à partir de la définition. Le plus exigeant.", en:"Find the word from its definition. The most demanding.", es:"Encuentra la palabra a partir de la definición. Lo más exigente.", it:"Trova la parola dalla definizione. Il più impegnativo.", de:"Finde das Wort zur Definition. Am anspruchsvollsten.", zh:"根据定义写出词语。最有挑战性。", ru:"Угадай слово по определению. Самое сложное." },
    cards_title: { fr:"Les cartes", en:"The cards", es:"Las fichas", it:"Le carte", de:"Die Karten", zh:"卡片", ru:"Карточки" },

    // Éditeur
    editor_cancel: { fr:"← Annuler", en:"← Cancel", es:"← Cancelar", it:"← Annulla", de:"← Abbrechen", zh:"← 取消", ru:"← Отмена" },
    edit_heading_new: { fr:"Nouveau paquet", en:"New deck", es:"Nuevo mazo", it:"Nuovo mazzo", de:"Neuer Stapel", zh:"新建卡组", ru:"Новый набор" },
    edit_heading_edit: { fr:"Modifier le paquet", en:"Edit deck", es:"Editar mazo", it:"Modifica mazzo", de:"Stapel bearbeiten", zh:"编辑卡组", ru:"Изменить набор" },
    deck_name_label: { fr:"Nom du paquet", en:"Deck name", es:"Nombre del mazo", it:"Nome del mazzo", de:"Name des Stapels", zh:"卡组名称", ru:"Название набора" },
    deck_name_ph: { fr:"ex. SVT — La cellule", en:"e.g. Biology — The cell", es:"p. ej. Biología — La célula", it:"es. Scienze — La cellula", de:"z. B. Biologie — Die Zelle", zh:"例如：生物 — 细胞", ru:"напр. Биология — Клетка" },
    subject_label: { fr:"Matière", en:"Subject", es:"Asignatura", it:"Materia", de:"Fach", zh:"科目", ru:"Предмет" },
    paste_title: { fr:"⚡ Coller mon cours d'un coup", en:"⚡ Paste my notes all at once", es:"⚡ Pegar mis apuntes de una vez", it:"⚡ Incolla i miei appunti in una volta", de:"⚡ Text auf einmal einfügen", zh:"⚡ 一次性粘贴笔记", ru:"⚡ Вставить конспект целиком" },
    paste_hint: { fr:"La façon la plus rapide de remplir un paquet", en:"The fastest way to fill a deck", es:"La forma más rápida de llenar un mazo", it:"Il modo più veloce per riempire un mazzo", de:"Der schnellste Weg, einen Stapel zu füllen", zh:"填充卡组最快的方式", ru:"Самый быстрый способ заполнить набор" },
    paste_help: { fr:"Colle tes lignes, une par carte. Bachote détecte tout seul le séparateur entre le mot et sa définition.",
                  en:"Paste your lines, one per card. Bachote detects the separator between the word and its definition on its own.",
                  es:"Pega tus líneas, una por ficha. Bachote detecta solo el separador entre la palabra y su definición.",
                  it:"Incolla le tue righe, una per carta. Bachote rileva da solo il separatore tra la parola e la definizione.",
                  de:"Füge deine Zeilen ein, eine pro Karte. Bachote erkennt das Trennzeichen zwischen Wort und Definition von selbst.",
                  zh:"粘贴你的文本，每行一张卡片。Bachote 会自动识别词语和定义之间的分隔符。",
                  ru:"Вставь строки, по одной на карточку. Bachote сам определит разделитель между словом и определением." },
    paste_ph: { fr:"mitose : division cellulaire qui produit deux cellules identiques\nméiose : division qui produit quatre cellules à n chromosomes\nchromosome — molécule d'ADN condensée portant les gènes",
                en:"mitosis: cell division that yields two identical cells\nmeiosis: division that yields four haploid cells\nchromosome — condensed DNA molecule carrying the genes",
                es:"mitosis: división celular que produce dos células idénticas\nmeiosis: división que produce cuatro células haploides\ncromosoma — molécula de ADN condensada que porta los genes",
                it:"mitosi: divisione cellulare che produce due cellule identiche\nmeiosi: divisione che produce quattro cellule aploidi\ncromosoma — molecola di DNA condensata che porta i geni",
                de:"Mitose: Zellteilung, die zwei identische Zellen ergibt\nMeiose: Teilung, die vier haploide Zellen ergibt\nChromosom — verdichtetes DNA-Molekül mit den Genen",
                zh:"有丝分裂：产生两个相同细胞的细胞分裂\n减数分裂：产生四个单倍体细胞的分裂\n染色体 — 携带基因的浓缩 DNA 分子",
                ru:"митоз: деление клетки на две одинаковые\nмейоз: деление, дающее четыре гаплоидные клетки\nхромосома — конденсированная молекула ДНК с генами" },
    sep_label: { fr:"Séparateur", en:"Separator", es:"Separador", it:"Separatore", de:"Trennzeichen", zh:"分隔符", ru:"Разделитель" },
    sep_auto: { fr:"Détection automatique", en:"Auto-detect", es:"Detección automática", it:"Rilevamento automatico", de:"Automatisch erkennen", zh:"自动检测", ru:"Автоопределение" },
    sep_tab:  { fr:"Tabulation", en:"Tab", es:"Tabulación", it:"Tabulazione", de:"Tabulator", zh:"制表符", ru:"Табуляция" },
    sep_colon:{ fr:"Deux-points :", en:"Colon :", es:"Dos puntos :", it:"Due punti :", de:"Doppelpunkt :", zh:"冒号 :", ru:"Двоеточие :" },
    sep_dash: { fr:"Tiret -", en:"Dash -", es:"Guion -", it:"Trattino -", de:"Bindestrich -", zh:"连字符 -", ru:"Дефис -" },
    sep_eq:   { fr:"Égal =", en:"Equals =", es:"Igual =", it:"Uguale =", de:"Gleich =", zh:"等号 =", ru:"Равно =" },
    paste_apply: { fr:"Créer les cartes", en:"Create the cards", es:"Crear las fichas", it:"Crea le carte", de:"Karten erstellen", zh:"创建卡片", ru:"Создать карточки" },
    cards_edit_title: { fr:"Cartes", en:"Cards", es:"Fichas", it:"Carte", de:"Karten", zh:"卡片", ru:"Карточки" },
    add_card: { fr:"+ Ajouter une carte", en:"+ Add a card", es:"+ Añadir una ficha", it:"+ Aggiungi una carta", de:"+ Karte hinzufügen", zh:"+ 添加卡片", ru:"+ Добавить карточку" },
    save_deck: { fr:"Enregistrer le paquet", en:"Save the deck", es:"Guardar el mazo", it:"Salva il mazzo", de:"Stapel speichern", zh:"保存卡组", ru:"Сохранить набор" },
    ph_term: { fr:"Mot ou terme", en:"Word or term", es:"Palabra o término", it:"Parola o termine", de:"Wort oder Begriff", zh:"词语或术语", ru:"Слово или термин" },
    ph_def:  { fr:"Sa définition", en:"Its definition", es:"Su definición", it:"La sua definizione", de:"Seine Definition", zh:"它的定义", ru:"Его определение" },
    row_del_title: { fr:"Supprimer cette carte", en:"Delete this card", es:"Eliminar esta ficha", it:"Elimina questa carta", de:"Diese Karte löschen", zh:"删除此卡片", ru:"Удалить эту карточку" },

    // Étude
    quit: { fr:"Quitter", en:"Quit", es:"Salir", it:"Esci", de:"Beenden", zh:"退出", ru:"Выйти" },
    face_term: { fr:"Terme", en:"Term", es:"Término", it:"Termine", de:"Begriff", zh:"术语", ru:"Термин" },
    face_def: { fr:"Définition", en:"Definition", es:"Definición", it:"Definizione", de:"Definition", zh:"定义", ru:"Определение" },
    flip_hint_a: { fr:"Appuie sur la carte ou ", en:"Tap the card or press ", es:"Toca la ficha o pulsa ", it:"Tocca la carta o premi ", de:"Tippe die Karte oder drücke ", zh:"点击卡片或按 ", ru:"Нажми на карточку или " },
    flip_hint_b: { fr:" pour retourner", en:" to flip", es:" para girar", it:" per girare", de:" zum Umdrehen", zh:" 翻面", ru:" чтобы перевернуть" },
    g_again: { fr:"Encore", en:"Again", es:"Otra vez", it:"Ancora", de:"Nochmal", zh:"重来", ru:"Ещё раз" },
    g_hard:  { fr:"Difficile", en:"Hard", es:"Difícil", it:"Difficile", de:"Schwer", zh:"困难", ru:"Трудно" },
    g_good:  { fr:"Bien", en:"Good", es:"Bien", it:"Bene", de:"Gut", zh:"良好", ru:"Хорошо" },
    g_easy:  { fr:"Facile", en:"Easy", es:"Fácil", it:"Facile", de:"Leicht", zh:"简单", ru:"Легко" },
    prev: { fr:"← Précédent", en:"← Previous", es:"← Anterior", it:"← Precedente", de:"← Zurück", zh:"← 上一张", ru:"← Назад" },
    next: { fr:"Suivant →", en:"Next →", es:"Siguiente →", it:"Successivo →", de:"Weiter →", zh:"下一张 →", ru:"Дальше →" },
    mcq_label: { fr:"Quelle est la définition de", en:"What is the definition of", es:"¿Cuál es la definición de", it:"Qual è la definizione di", de:"Was ist die Definition von", zh:"这个词的定义是什么：", ru:"Какое определение у слова" },
    write_q: { fr:"Quel mot correspond à cette définition ?", en:"Which word matches this definition?", es:"¿Qué palabra corresponde a esta definición?", it:"Quale parola corrisponde a questa definizione?", de:"Welches Wort passt zu dieser Definition?", zh:"哪个词对应这个定义？", ru:"Какое слово подходит к этому определению?" },
    write_ph: { fr:"Écris le mot…", en:"Type the word…", es:"Escribe la palabra…", it:"Scrivi la parola…", de:"Wort eingeben…", zh:"输入词语……", ru:"Введи слово…" },
    validate: { fr:"Valider", en:"Check", es:"Comprobar", it:"Conferma", de:"Prüfen", zh:"确认", ru:"Проверить" },
    dont_know: { fr:"Je ne sais pas", en:"I don't know", es:"No lo sé", it:"Non lo so", de:"Ich weiß es nicht", zh:"我不知道", ru:"Не знаю" },
    match_help: { fr:"Clique un mot, puis sa définition.", en:"Click a word, then its definition.", es:"Haz clic en una palabra y luego en su definición.", it:"Clicca una parola, poi la sua definizione.", de:"Klick ein Wort an, dann seine Definition.", zh:"先点一个词，再点它的定义。", ru:"Нажми слово, затем его определение." },
    fb_correct: { fr:"Correct : ", en:"Correct: ", es:"Correcto: ", it:"Corretto: ", de:"Richtig: ", zh:"正确：", ru:"Верно: " },
    fb_almost: { fr:"Presque — on accepte : ", en:"Almost — accepted: ", es:"Casi — se acepta: ", it:"Quasi — accettato: ", de:"Fast — akzeptiert: ", zh:"差不多——算对：", ru:"Почти — засчитано: " },
    fb_wrong: { fr:"La réponse était : ", en:"The answer was: ", es:"La respuesta era: ", it:"La risposta era: ", de:"Die Antwort war: ", zh:"答案是：", ru:"Правильный ответ: " },

    // Résultat
    done_flash: { fr:"Paquet parcouru", en:"Deck reviewed", es:"Mazo repasado", it:"Mazzo scorso", de:"Stapel durchgesehen", zh:"卡组已浏览", ru:"Набор пройден" },
    done_review: { fr:"Révision terminée", en:"Review complete", es:"Repaso terminado", it:"Ripasso completato", de:"Wiederholung fertig", zh:"复习完成", ru:"Повторение завершено" },
    res_excellent: { fr:"Excellent !", en:"Excellent!", es:"¡Excelente!", it:"Eccellente!", de:"Ausgezeichnet!", zh:"太棒了！", ru:"Отлично!" },
    res_good: { fr:"Bien joué", en:"Well done", es:"Bien hecho", it:"Ben fatto", de:"Gut gemacht", zh:"做得好", ru:"Молодец" },
    res_progress: { fr:"Ça progresse", en:"Getting there", es:"Vas mejorando", it:"Stai migliorando", de:"Es wird besser", zh:"在进步", ru:"Прогресс есть" },
    res_retry: { fr:"On recommence ?", en:"Try again?", es:"¿Otra vez?", it:"Riproviamo?", de:"Nochmal?", zh:"再来一次？", ru:"Ещё разок?" },
    res_done: { fr:"Terminé !", en:"Done!", es:"¡Listo!", it:"Fatto!", de:"Fertig!", zh:"完成！", ru:"Готово!" },
    cards_seen: { fr:"cartes vues", en:"cards seen", es:"fichas vistas", it:"carte viste", de:"Karten gesehen", zh:"看过的卡片", ru:"карточек просмотрено" },
    cards_reviewed: { fr:"cartes revues", en:"cards reviewed", es:"fichas repasadas", it:"carte ripassate", de:"Karten wiederholt", zh:"复习的卡片", ru:"карточек повторено" },
    known: { fr:"sues", en:"known", es:"acertadas", it:"sapute", de:"gewusst", zh:"已掌握", ru:"знаешь" },
    to_revise: { fr:"à revoir", en:"to review", es:"por repasar", it:"da rivedere", de:"zu wiederholen", zh:"待复习", ru:"повторить" },
    correct_answers: { fr:"bonnes réponses", en:"correct answers", es:"aciertos", it:"risposte giuste", de:"richtige Antworten", zh:"答对", ru:"верных ответов" },
    errors: { fr:"erreurs", en:"mistakes", es:"errores", it:"errori", de:"Fehler", zh:"错误", ru:"ошибок" },
    success_rate: { fr:"de réussite", en:"accuracy", es:"de acierto", it:"di successo", de:"Erfolg", zh:"正确率", ru:"успеха" },
    work_time: { fr:"de travail", en:"of work", es:"de trabajo", it:"di lavoro", de:"gelernt", zh:"用时", ru:"работы" },
    again: { fr:"Recommencer", en:"Play again", es:"Repetir", it:"Ricomincia", de:"Nochmal", zh:"再来一次", ru:"Ещё раз" },
    back_deck: { fr:"Retour au paquet", en:"Back to deck", es:"Volver al mazo", it:"Torna al mazzo", de:"Zurück zum Stapel", zh:"返回卡组", ru:"К набору" },
    to_review_title: { fr:"À retravailler", en:"To work on", es:"Para repasar", it:"Da ripassare", de:"Zu üben", zh:"需要加强", ru:"Повторить" },

    // Menu contextuel / modale
    options_deck: { fr:"Options du paquet", en:"Deck options", es:"Opciones del mazo", it:"Opzioni del mazzo", de:"Stapel-Optionen", zh:"卡组选项", ru:"Опции набора" },
    fav_add: { fr:"Mettre en favori", en:"Add to favorites", es:"Añadir a favoritos", it:"Aggiungi ai preferiti", de:"Zu Favoriten", zh:"加入收藏", ru:"В избранное" },
    fav_remove: { fr:"Retirer des favoris", en:"Remove from favorites", es:"Quitar de favoritos", it:"Rimuovi dai preferiti", de:"Aus Favoriten entfernen", zh:"取消收藏", ru:"Убрать из избранного" },
    confirm_del_title: { fr:"Supprimer ce paquet ?", en:"Delete this deck?", es:"¿Eliminar este mazo?", it:"Eliminare questo mazzo?", de:"Diesen Stapel löschen?", zh:"删除这个卡组？", ru:"Удалить этот набор?" },
    cancel: { fr:"Annuler", en:"Cancel", es:"Cancelar", it:"Annulla", de:"Abbrechen", zh:"取消", ru:"Отмена" },
    close: { fr:"Fermer", en:"Close", es:"Cerrar", it:"Chiudi", de:"Schließen", zh:"关闭", ru:"Закрыть" },
    share_deck_title: { fr:"Partager le paquet", en:"Share the deck", es:"Compartir el mazo", it:"Condividi il mazzo", de:"Stapel teilen", zh:"分享卡组", ru:"Поделиться набором" },
    share_link_msg: { fr:"Copie ce lien et envoie-le à qui tu veux :", en:"Copy this link and send it to anyone:", es:"Copia este enlace y envíalo a quien quieras:", it:"Copia questo link e invialo a chi vuoi:", de:"Kopiere diesen Link und schick ihn, wem du willst:", zh:"复制这个链接，发给任何人：", ru:"Скопируй ссылку и отправь кому хочешь:" },

    // Toasts
    t_deck_deleted: { fr:"Paquet supprimé.", en:"Deck deleted.", es:"Mazo eliminado.", it:"Mazzo eliminato.", de:"Stapel gelöscht.", zh:"卡组已删除。", ru:"Набор удалён." },
    t_fav_added: { fr:"Ajouté aux favoris.", en:"Added to favorites.", es:"Añadido a favoritos.", it:"Aggiunto ai preferiti.", de:"Zu Favoriten hinzugefügt.", zh:"已加入收藏。", ru:"Добавлено в избранное." },
    t_fav_removed: { fr:"Retiré des favoris.", en:"Removed from favorites.", es:"Quitado de favoritos.", it:"Rimosso dai preferiti.", de:"Aus Favoriten entfernt.", zh:"已取消收藏。", ru:"Убрано из избранного." },
    t_deck_gone: { fr:"Ce paquet n'existe plus.", en:"This deck no longer exists.", es:"Este mazo ya no existe.", it:"Questo mazzo non esiste più.", de:"Diesen Stapel gibt es nicht mehr.", zh:"这个卡组已不存在。", ru:"Этого набора больше нет." },
    t_no_card: { fr:"Aucune carte détectée dans ce texte.", en:"No card detected in this text.", es:"No se detectó ninguna ficha en este texto.", it:"Nessuna carta rilevata in questo testo.", de:"In diesem Text wurde keine Karte erkannt.", zh:"未在文本中检测到卡片。", ru:"В тексте не найдено ни одной карточки." },
    t_need_name: { fr:"Donne un nom à ton paquet.", en:"Give your deck a name.", es:"Ponle un nombre a tu mazo.", it:"Dai un nome al tuo mazzo.", de:"Gib deinem Stapel einen Namen.", zh:"给你的卡组起个名字。", ru:"Дай набору название." },
    t_need_card: { fr:"Il faut au moins une carte complète (mot + définition).", en:"You need at least one complete card (word + definition).", es:"Necesitas al menos una ficha completa (palabra + definición).", it:"Serve almeno una carta completa (parola + definizione).", de:"Du brauchst mindestens eine vollständige Karte (Wort + Definition).", zh:"至少需要一张完整的卡片（词语 + 定义）。", ru:"Нужна хотя бы одна полная карточка (слово + определение)." },
    t_saved: { fr:"Paquet enregistré.", en:"Deck saved.", es:"Mazo guardado.", it:"Mazzo salvato.", de:"Stapel gespeichert.", zh:"卡组已保存。", ru:"Набор сохранён." },
    t_nothing_due: { fr:"Rien à réviser pour l'instant. Reviens plus tard, ou choisis un autre mode.", en:"Nothing to review right now. Come back later, or pick another mode.", es:"Nada que repasar por ahora. Vuelve más tarde o elige otro modo.", it:"Niente da ripassare per ora. Torna più tardi o scegli un'altra modalità.", de:"Gerade nichts zu wiederholen. Komm später wieder oder wähl einen anderen Modus.", zh:"现在没有需要复习的内容。稍后再来，或选择其他模式。", ru:"Пока нечего повторять. Зайди позже или выбери другой режим." },
    t_empty_deck: { fr:"Ce paquet est vide.", en:"This deck is empty.", es:"Este mazo está vacío.", it:"Questo mazzo è vuoto.", de:"Dieser Stapel ist leer.", zh:"这个卡组是空的。", ru:"Этот набор пуст." },
    t_need_4: { fr:"Il faut au moins 4 cartes pour ce mode.", en:"You need at least 4 cards for this mode.", es:"Necesitas al menos 4 fichas para este modo.", it:"Servono almeno 4 carte per questa modalità.", de:"Für diesen Modus brauchst du mindestens 4 Karten.", zh:"这个模式至少需要 4 张卡片。", ru:"Для этого режима нужно хотя бы 4 карточки." },
    t_too_big: { fr:"Ce paquet est trop gros pour un lien. Réduis-le ou partage-le en deux paquets.", en:"This deck is too big for a link. Trim it or split it into two decks.", es:"Este mazo es demasiado grande para un enlace. Redúcelo o divídelo en dos.", it:"Questo mazzo è troppo grande per un link. Riducilo o dividilo in due.", de:"Dieser Stapel ist zu groß für einen Link. Kürze ihn oder teil ihn in zwei.", zh:"这个卡组太大，无法生成链接。请精简或拆成两个卡组。", ru:"Набор слишком большой для ссылки. Уменьши его или раздели на два." },
    t_link_copied: { fr:"Lien copié ! Colle-le dans ton groupe de classe.", en:"Link copied! Paste it in your class group.", es:"¡Enlace copiado! Pégalo en tu grupo de clase.", it:"Link copiato! Incollalo nel gruppo della classe.", de:"Link kopiert! Füg ihn in deine Klassengruppe ein.", zh:"链接已复制！粘贴到你的班级群里。", ru:"Ссылка скопирована! Вставь её в чат класса." },
    t_link_invalid: { fr:"Ce lien de partage est invalide ou abîmé.", en:"This share link is invalid or broken.", es:"Este enlace de compartir no es válido o está dañado.", it:"Questo link di condivisione non è valido o è danneggiato.", de:"Dieser Teilen-Link ist ungültig oder beschädigt.", zh:"这个分享链接无效或已损坏。", ru:"Эта ссылка недействительна или повреждена." },

    all_cards: { fr:"Toutes tes cartes", en:"All your cards", es:"Todas tus fichas", it:"Tutte le tue carte", de:"Alle deine Karten", zh:"你的所有卡片", ru:"Все твои карточки" },

    // Analyse du collage
    paste_none: { fr:"Aucune ligne reconnue. Chaque ligne doit contenir un séparateur entre le mot et sa définition, par exemple « mitose : division cellulaire ».",
                  en:"No line recognized. Each line must contain a separator between the word and its definition, e.g. “mitosis: cell division”.",
                  es:"Ninguna línea reconocida. Cada línea debe tener un separador entre la palabra y su definición, p. ej. “mitosis: división celular”.",
                  it:"Nessuna riga riconosciuta. Ogni riga deve contenere un separatore tra la parola e la definizione, es. “mitosi: divisione cellulare”.",
                  de:"Keine Zeile erkannt. Jede Zeile braucht ein Trennzeichen zwischen Wort und Definition, z. B. „Mitose: Zellteilung“.",
                  zh:"未识别到任何行。每行都需要在词语和定义之间加分隔符，例如“有丝分裂：细胞分裂”。",
                  ru:"Ни одна строка не распознана. В каждой строке нужен разделитель между словом и определением, напр. «митоз: деление клетки»." },
    sep_mixed: { fr:"séparateurs mélangés, c'est géré", en:"mixed separators, handled", es:"separadores mezclados, controlado", it:"separatori misti, gestito", de:"gemischte Trennzeichen, kein Problem", zh:"分隔符混用，已处理", ru:"разделители разные — это ок" },
    sep_which: { fr:"séparateur : ", en:"separator: ", es:"separador: ", it:"separatore: ", de:"Trennzeichen: ", zh:"分隔符：", ru:"разделитель: " },
    sep_word_tab: { fr:"tabulation", en:"tab", es:"tabulación", it:"tabulazione", de:"Tabulator", zh:"制表符", ru:"табуляция" },
    sep_word_space: { fr:"espace", en:"space", es:"espacio", it:"spazio", de:"Leerzeichen", zh:"空格", ru:"пробел" },

    foot: { fr:"Bachote — tes fiches sont enregistrées dans ton navigateur, rien n'est envoyé nulle part.",
            en:"Bachote — your cards are saved in your browser, nothing is sent anywhere.",
            es:"Bachote — tus fichas se guardan en tu navegador, no se envía nada a ningún sitio.",
            it:"Bachote — le tue carte sono salvate nel browser, non viene inviato nulla.",
            de:"Bachote — deine Karten werden im Browser gespeichert, es wird nichts irgendwohin gesendet.",
            zh:"Bachote — 你的卡片保存在浏览器里，不会发送到任何地方。",
            ru:"Bachote — карточки хранятся в твоём браузере, ничего никуда не отправляется." },
    to_review_word: { fr:"à réviser", en:"to review", es:"por repasar", it:"da ripassare", de:"zu wiederholen", zh:"待复习", ru:"к повторению" },
    to_review_now: { fr:"à réviser maintenant", en:"to review now", es:"por repasar ahora", it:"da ripassare ora", de:"jetzt zu wiederholen", zh:"现在待复习", ru:"к повторению сейчас" },
    nothing_due_short: { fr:"rien à réviser pour l'instant", en:"nothing to review right now", es:"nada que repasar ahora", it:"niente da ripassare ora", de:"gerade nichts zu wiederholen", zh:"暂无需复习", ru:"пока нечего повторять" },
    in_progress_word: { fr:"en cours", en:"in progress", es:"en curso", it:"in corso", de:"in Arbeit", zh:"学习中", ru:"в процессе" },
    unit_sec: { fr:"s", en:"s", es:"s", it:"s", de:"s", zh:"秒", ru:"с" },
    unit_min: { fr:"min", en:"min", es:"min", it:"min", de:"Min.", zh:"分", ru:"мин" },
    t_created: { fr:"Paquet créé !", en:"Deck created!", es:"¡Mazo creado!", it:"Mazzo creato!", de:"Stapel erstellt!", zh:"卡组已创建！", ru:"Набор создан!" },
    t_imported: { fr:"Paquet importé !", en:"Deck imported!", es:"¡Mazo importado!", it:"Mazzo importato!", de:"Stapel importiert!", zh:"卡组已导入！", ru:"Набор импортирован!" },
    flip_kbd: { fr:"Espace", en:"Space", es:"Espacio", it:"Spazio", de:"Leertaste", zh:"空格", ru:"Пробел" },
    iv_min: { fr:"< 1 min", en:"< 1 min", es:"< 1 min", it:"< 1 min", de:"< 1 Min.", zh:"< 1 分钟", ru:"< 1 мин" }
  };

  /* ---------- chaînes avec compte (pluriel) ---------- */
  var PL = {
    n_cards: {
      fr:{one:"{n} carte", other:"{n} cartes"},
      en:{one:"{n} card", other:"{n} cards"},
      es:{one:"{n} ficha", other:"{n} fichas"},
      it:{one:"{n} carta", other:"{n} carte"},
      de:{one:"{n} Karte", other:"{n} Karten"},
      zh:{other:"{n} 张卡片"},
      ru:{one:"{n} карточка", few:"{n} карточки", many:"{n} карточек"}
    },
    lbl_decks: {
      fr:{one:"paquet", other:"paquets"}, en:{one:"deck", other:"decks"},
      es:{one:"mazo", other:"mazos"}, it:{one:"mazzo", other:"mazzi"},
      de:{one:"Stapel", other:"Stapel"}, zh:{other:"卡组"},
      ru:{one:"набор", few:"набора", many:"наборов"}
    },
    lbl_cards: {
      fr:{one:"carte", other:"cartes"}, en:{one:"card", other:"cards"},
      es:{one:"ficha", other:"fichas"}, it:{one:"carta", other:"carte"},
      de:{one:"Karte", other:"Karten"}, zh:{other:"卡片"},
      ru:{one:"карточка", few:"карточки", many:"карточек"}
    },
    lbl_mastered: {
      fr:{one:"maîtrisée", other:"maîtrisées"}, en:{one:"mastered", other:"mastered"},
      es:{one:"dominada", other:"dominadas"}, it:{one:"padroneggiata", other:"padroneggiate"},
      de:{one:"gemeistert", other:"gemeistert"}, zh:{other:"已掌握"},
      ru:{one:"освоена", few:"освоено", many:"освоено"}
    },
    lbl_streak: {
      fr:{one:"jour d'affilée", other:"jours d'affilée"}, en:{one:"day streak", other:"day streak"},
      es:{one:"día seguido", other:"días seguidos"}, it:{one:"giorno di fila", other:"giorni di fila"},
      de:{one:"Tag in Folge", other:"Tage in Folge"}, zh:{other:"天连续"},
      ru:{one:"день подряд", few:"дня подряд", many:"дней подряд"}
    },
    due_label: {
      fr:{one:"carte à réviser", other:"cartes à réviser"},
      en:{one:"card to review", other:"cards to review"},
      es:{one:"ficha por repasar", other:"fichas por repasar"},
      it:{one:"carta da ripassare", other:"carte da ripassare"},
      de:{one:"Karte zu wiederholen", other:"Karten zu wiederholen"},
      zh:{other:"张卡片待复习"},
      ru:{one:"карточка к повторению", few:"карточки к повторению", many:"карточек к повторению"}
    },
    lbl_fresh: {
      fr:{one:"jamais vue", other:"jamais vues"}, en:{one:"new", other:"new"},
      es:{one:"nueva", other:"nuevas"}, it:{one:"mai vista", other:"mai viste"},
      de:{one:"neu", other:"neu"}, zh:{other:"未学"},
      ru:{one:"новая", few:"новые", many:"новых"}
    },
    n_added: {
      fr:{one:"{n} carte ajoutée", other:"{n} cartes ajoutées"},
      en:{one:"{n} card added", other:"{n} cards added"},
      es:{one:"{n} ficha añadida", other:"{n} fichas añadidas"},
      it:{one:"{n} carta aggiunta", other:"{n} carte aggiunte"},
      de:{one:"{n} Karte hinzugefügt", other:"{n} Karten hinzugefügt"},
      zh:{other:"已添加 {n} 张卡片"},
      ru:{one:"добавлена {n} карточка", few:"добавлено {n} карточки", many:"добавлено {n} карточек"}
    },
    n_skipped: {
      fr:{one:"{n} ligne ignorée", other:"{n} lignes ignorées"},
      en:{one:"{n} line skipped", other:"{n} lines skipped"},
      es:{one:"{n} línea omitida", other:"{n} líneas omitidas"},
      it:{one:"{n} riga ignorata", other:"{n} righe ignorate"},
      de:{one:"{n} Zeile übersprungen", other:"{n} Zeilen übersprungen"},
      zh:{other:"跳过 {n} 行"},
      ru:{one:"{n} строка пропущена", few:"{n} строки пропущено", many:"{n} строк пропущено"}
    },
    iv_day: {
      fr:{one:"1 jour", other:"{n} jours"}, en:{one:"1 day", other:"{n} days"},
      es:{one:"1 día", other:"{n} días"}, it:{one:"1 giorno", other:"{n} giorni"},
      de:{one:"1 Tag", other:"{n} Tage"}, zh:{other:"{n} 天"},
      ru:{one:"{n} день", few:"{n} дня", many:"{n} дней"}
    },
    iv_month: {
      fr:{one:"1 mois", other:"{n} mois"}, en:{one:"1 month", other:"{n} months"},
      es:{one:"1 mes", other:"{n} meses"}, it:{one:"1 mese", other:"{n} mesi"},
      de:{one:"1 Monat", other:"{n} Monate"}, zh:{other:"{n} 个月"},
      ru:{one:"{n} месяц", few:"{n} месяца", many:"{n} месяцев"}
    },
    iv_year: {
      fr:{one:"1 an", other:"{n} ans"}, en:{one:"1 year", other:"{n} years"},
      es:{one:"1 año", other:"{n} años"}, it:{one:"1 anno", other:"{n} anni"},
      de:{one:"1 Jahr", other:"{n} Jahre"}, zh:{other:"{n} 年"},
      ru:{one:"{n} год", few:"{n} года", many:"{n} лет"}
    }
  };

  /* ---------- matières par langue ---------- */
  window.SUBJECT_I18N = {
    svt:   { fr:"SVT", en:"Biology", es:"Biología", it:"Scienze", de:"Biologie", zh:"生物", ru:"Биология" },
    phys:  { fr:"Physique-Chimie", en:"Physics & Chem.", es:"Física y Química", it:"Fisica-Chimica", de:"Physik-Chemie", zh:"物理化学", ru:"Физика-химия" },
    math:  { fr:"Maths", en:"Maths", es:"Matemáticas", it:"Matematica", de:"Mathe", zh:"数学", ru:"Математика" },
    hist:  { fr:"Histoire-Géo", en:"History & Geo.", es:"Historia-Geo.", it:"Storia-Geo.", de:"Geschichte", zh:"历史地理", ru:"История" },
    ses:   { fr:"SES", en:"Economics", es:"Economía", it:"Economia", de:"Wirtschaft", zh:"经济社会", ru:"Обществознание" },
    philo: { fr:"Philo", en:"Philosophy", es:"Filosofía", it:"Filosofia", de:"Philosophie", zh:"哲学", ru:"Философия" },
    lang:  { fr:"Français", en:"French", es:"Francés", it:"Francese", de:"Französisch", zh:"法语", ru:"Французский" },
    angl:  { fr:"Anglais", en:"English", es:"Inglés", it:"Inglese", de:"Englisch", zh:"英语", ru:"Английский" },
    autre: { fr:"Autre", en:"Other", es:"Otro", it:"Altro", de:"Andere", zh:"其他", ru:"Другое" }
  };

  /* ---------- règles de pluriel ---------- */
  function plCat(lang, n) {
    n = Math.abs(n);
    if (lang === "zh") return "other";
    if (lang === "fr") return n < 2 ? "one" : "other";      // fr : 0 et 1 au singulier
    if (lang === "ru") {
      if (Number.isInteger(n)) {
        var m10 = n % 10, m100 = n % 100;
        if (m10 === 1 && m100 !== 11) return "one";
        if (m10 >= 2 && m10 <= 4 && !(m100 >= 12 && m100 <= 14)) return "few";
        return "many";
      }
      return "many";
    }
    return n === 1 ? "one" : "other";                        // en, es, it, de
  }

  function pick(map, lang) {
    if (!map) return "";
    if (map[lang] != null) return map[lang];
    return map.fr != null ? map.fr : "";
  }

  window.tRaw = function (lang, key) {
    return pick(I[key], lang) || key;
  };

  window.tnRaw = function (lang, key, n) {
    var forms = PL[key] ? (PL[key][lang] || PL[key].fr) : null;
    if (!forms) return String(n);
    var cat = plCat(lang, n);
    var s = forms[cat] || forms.other || forms.many || forms.one;
    return String(s).replace("{n}", n);
  };

  window.subjectLabel = function (lang, key) {
    var m = window.SUBJECT_I18N[key] || window.SUBJECT_I18N.autre;
    return pick(m, lang);
  };
})();
