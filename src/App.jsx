// Storage via Supabase — see db.js
import { signIn as sbSignIn, signUp as sbSignUp, signOut as sbSignOut,
  loadProfile, saveProfile, loadGames as sbLoadGames,
  saveGame as sbSaveGame, deleteGame as sbDeleteGame,
  getSession } from './db';
import { useState, useEffect, useRef, createContext, useContext } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine } from "recharts";
import {
  Home, List, TrendingUp, Settings, Plus, Minus,
  Play, Pause, StopCircle, ChevronLeft, Trophy,
  Timer, Check, X, Trash2, ChevronDown, ChevronUp,
  LogOut, User, Heart, Pencil, MessageSquare, Send, Globe, Download, BarChart2, Mic, MicOff
} from "lucide-react";

// ─── Palette ──────────────────────────────────────────────────────
const G = {
  green:'#2D8B2D', greenL:'#43A047', greenBg:'#E8F5E9',
  blue:'#0D4A7A',  blueL:'#1565C0',  blueBg:'#E3F2FD',
  orange:'#E64A19', orangeBg:'#FBE9E7',
  red:'#C62828',   redBg:'#FFEBEE',
  bg:'#F2F2EE', card:'#FFFFFF', border:'#E0E0DA',
  grayL:'#F0F0EC', muted:'#ABABAB', sub:'#616161', text:'#1A1A1A',
};

// ─── Languages ────────────────────────────────────────────────────
const LANGS = [
  { code:'PL', flag:'🇵🇱', name:'Polski' },
  { code:'EN', flag:'🇬🇧', name:'English' },
  { code:'DE', flag:'🇩🇪', name:'Deutsch' },
  { code:'FR', flag:'🇫🇷', name:'Français' },
  { code:'IT', flag:'🇮🇹', name:'Italiano' },
  { code:'ES', flag:'🇪🇸', name:'Español' },
];

// ─── Translations ─────────────────────────────────────────────────
const TR = {
  // Navigation
  nav_home:       { PL:'Strona',    EN:'Home',       DE:'Start',       FR:'Accueil',   IT:'Home',        ES:'Inicio'     },
  nav_games:      { PL:'Mecze',     EN:'Games',      DE:'Spiele',      FR:'Matchs',    IT:'Partite',     ES:'Partidos'   },
  nav_progress:   { PL:'Postępy',   EN:'Progress',   DE:'Fortschr.',   FR:'Progrès',   IT:'Progressi',   ES:'Progreso'   },
  nav_settings:   { PL:'Ustaw.',    EN:'Settings',   DE:'Einst.',      FR:'Réglages',  IT:'Impost.',     ES:'Ajustes'    },
  // App subtitle
  app_subtitle:   { PL:'Śledzenie postępów – piłka nożna', EN:'Football Progress Tracker', DE:'Fußball-Fortschrittstracker', FR:'Suivi de progrès – football', IT:'Tracker progressi calcio', ES:'Seguimiento progreso fútbol' },
  // Auth
  sign_in:        { PL:'Zaloguj się',        EN:'Sign In',            DE:'Anmelden',           FR:'Se connecter',      IT:'Accedi',              ES:'Iniciar sesión'    },
  register:       { PL:'Zarejestruj',        EN:'Register',           DE:'Registrieren',       FR:"S'inscrire",        IT:'Registrati',          ES:'Registrarse'       },
  username:       { PL:'Nazwa użytkownika',  EN:'Username',           DE:'Benutzername',       FR:'Identifiant',       IT:'Nome utente',         ES:'Usuario'           },
  pin_label:      { PL:'PIN (6 cyfr)',    EN:'PIN (6 digits)', DE:'PIN (6 Stellen)', FR:'PIN (6 chiffres)', IT:'PIN (6 cifre)', ES:'PIN (6 dígitos)' },
  create_account: { PL:'Utwórz konto',       EN:'Create Account',     DE:'Konto erstellen',    FR:'Créer un compte',   IT:'Crea account',        ES:'Crear cuenta'      },
  loading:        { PL:'Ładowanie…',         EN:'Loading…',           DE:'Laden…',             FR:'Chargement…',       IT:'Caricamento…',        ES:'Cargando…'         },
  err_user_short: { PL:'Nazwa za krótka',    EN:'Username too short', DE:'Name zu kurz',       FR:'Identifiant court', IT:'Nome troppo corto',   ES:'Usuario muy corto' },
  err_pin_short:  { PL:'PIN musi mieć 6 cyfr', EN:'PIN must be exactly 6 digits', DE:'PIN muss 6 Stellen haben', FR:'Le PIN doit avoir 6 chiffres', IT:'Il PIN deve avere 6 cifre', ES:'El PIN debe tener 6 dígitos' },
  err_no_account: { PL:'Konto nie istnieje', EN:'Account not found',  DE:'Konto nicht gefunden',FR:'Compte introuvable',IT:'Account non trovato', ES:'Cuenta no encontrada'},
  err_wrong_pin:  { PL:'Błędny PIN',         EN:'Incorrect PIN',      DE:'Falscher PIN',       FR:'PIN incorrect',     IT:'PIN errato',          ES:'PIN incorrecto'    },
  err_user_taken: { PL:'Nazwa zajęta',       EN:'Username taken',     DE:'Name vergeben',      FR:'Nom déjà pris',     IT:'Nome non disponibile',ES:'Usuario ocupado'   },
  err_generic:    { PL:'Coś poszło nie tak', EN:'Something went wrong',DE:'Fehler aufgetreten',FR:'Une erreur est survenue',IT:'Qualcosa è andato storto',ES:'Algo salió mal'},
  enter_username: { PL:'Podaj nazwę użytkownika', EN:'Enter a username', DE:'Benutzername eingeben', FR:'Entrez un identifiant', IT:'Inserisci nome utente', ES:'Ingresa usuario'},
  // Dashboard
  start_new_game: { PL:'Rozpocznij grę',    EN:'Start New Game',     DE:'Neues Spiel',        FR:'Nouvelle partie',   IT:'Nuova partita',       ES:'Nuevo partido'     },
  games_count:    { PL:'Mecze',             EN:'Games',              DE:'Spiele',             FR:'Matchs',            IT:'Partite',             ES:'Partidos'          },
  minutes:        { PL:'Minuty',            EN:'Minutes',            DE:'Minuten',            FR:'Minutes',           IT:'Minuti',              ES:'Minutos'           },
  goals:          { PL:'Gole',              EN:'Goals',              DE:'Tore',               FR:'Buts',              IT:'Gol',                 ES:'Goles'             },
  this_month:     { PL:'Ten miesiąc',       EN:'This month',         DE:'Dieser Monat',       FR:'Ce mois-ci',        IT:'Questo mese',         ES:'Este mes'          },
  recent_games:   { PL:'Ostatnie mecze',    EN:'Recent Games',       DE:'Letzte Spiele',      FR:'Matchs récents',    IT:'Partite recenti',     ES:'Partidos recientes'},
  no_games_yet:   { PL:'Brak meczów',       EN:'No games yet',       DE:'Keine Spiele',       FR:'Aucun match',       IT:'Nessuna partita',     ES:'Sin partidos'      },
  no_games_hint:  { PL:'Naciśnij „Rozpocznij grę" aby zacząć!', EN:'Tap "Start New Game" to begin!', DE:'Tippe auf „Neues Spiel"!', FR:'Appuie sur « Nouvelle partie »!', IT:'Tocca "Nuova partita"!', ES:'Pulsa "Nuevo partido"!'},
  donate_nudge:   { PL:'Podoba Ci się? Postaw kawę! ☕', EN:'Like the app? Buy us a coffee! ☕', DE:'App gefällt? Kauf uns Kaffee! ☕', FR:'Vous aimez? Offrez-nous un café! ☕', IT:'Ti piace? Offri un caffè! ☕', ES:'¿Te gusta? Invítanos un café! ☕'},
  games_and_min:  { PL:'mecze · {m} min na boisku', EN:'games · {m} min on pitch', DE:'Spiele · {m} Min. auf dem Platz', FR:'matchs · {m} min sur le terrain', IT:'partite · {m} min in campo', ES:'partidos · {m} min en el campo'},
  // Games list
  all_games:      { PL:'Wszystkie mecze',   EN:'All Games',          DE:'Alle Spiele',        FR:'Tous les matchs',   IT:'Tutte le partite',    ES:'Todos los partidos'},
  new_btn:        { PL:'Nowy',              EN:'New',                DE:'Neu',                FR:'Nouveau',           IT:'Nuovo',               ES:'Nuevo'             },
  no_stats:       { PL:'Brak statystyk',    EN:'No stats recorded',  DE:'Keine Statistiken',  FR:'Aucune statistique',IT:'Nessuna statistica',  ES:'Sin estadísticas'  },
  // New game
  new_game:       { PL:'Nowy mecz',         EN:'New Game',           DE:'Neues Spiel',        FR:'Nouveau match',     IT:'Nuova partita',       ES:'Nuevo partido'     },
  game_name_opt:  { PL:'Nazwa meczu (opcjonalnie)', EN:'Game Name (optional)', DE:'Spielname (optional)', FR:'Nom du match (optionnel)', IT:'Nome partita (opzionale)', ES:'Nombre partido (opcional)'},
  game_name_ph:   { PL:'np. vs FC Wisła…',  EN:'e.g. vs FC United…', DE:'z.B. vs FC Bayern…', FR:'ex. vs Paris FC…',  IT:'es. vs AC Milan…',    ES:'ej. vs Real Madrid…'},
  type_label:     { PL:'Rodzaj',            EN:'Type',               DE:'Typ',                FR:'Type',              IT:'Tipo',                ES:'Tipo'              },
  friendly:       { PL:'Towarzyski',        EN:'Friendly',           DE:'Freundschaft',       FR:'Amical',            IT:'Amichevole',          ES:'Amistoso'          },
  league:         { PL:'Liga',              EN:'League',             DE:'Liga',               FR:'Championnat',       IT:'Campionato',          ES:'Liga'              },
  tournament:     { PL:'Turniej',           EN:'Tournament',         DE:'Turnier',            FR:'Tournoi',           IT:'Torneo',              ES:'Torneo'            },
  date_label:     { PL:'Data',              EN:'Date',               DE:'Datum',              FR:'Date',              IT:'Data',                ES:'Fecha'             },
  duration_label: { PL:'Czas gry: {m} min', EN:'Duration: {m} min',  DE:'Dauer: {m} Min.',    FR:'Durée: {m} min',    IT:'Durata: {m} min',     ES:'Duración: {m} min' },
  custom_min_ph:  { PL:'Inna liczba minut…',EN:'Custom minutes…',    DE:'Eigene Minuten…',    FR:'Minutes perso…',    IT:'Minuti personalizzati…',ES:'Minutos personalizados…'},
  position_label: { PL:'Pozycja',           EN:'Position',           DE:'Position',           FR:'Poste',             IT:'Posizione',           ES:'Posición'          },
  tap_to_change:  { PL:'Dotknij aby zmienić',EN:'Tap to change',     DE:'Tippen zum Ändern',  FR:'Toucher pour changer',IT:'Tocca per cambiare', ES:'Toca para cambiar' },
  tracking_label: { PL:'Śledzenie',         EN:'Tracking',           DE:'Verfolgung',         FR:'Suivi',             IT:'Monitoraggio',        ES:'Seguimiento'       },
  start_tracking: { PL:'Rozpocznij śledzenie',EN:'Start Tracking',   DE:'Tracking starten',   FR:'Commencer le suivi',IT:'Inizia monitoraggio', ES:'Iniciar seguimiento'},
  // Active game
  events:         { PL:'zdarzeń',           EN:'events',             DE:'Ereignisse',         FR:'événements',        IT:'eventi',              ES:'eventos'           },
  change:         { PL:'zmień',             EN:'change',             DE:'ändern',             FR:'changer',           IT:'cambia',              ES:'cambiar'           },
  pause:          { PL:'Pauza',             EN:'Pause',              DE:'Pause',              FR:'Pause',             IT:'Pausa',               ES:'Pausa'             },
  resume:         { PL:'Wznów',             EN:'Resume',             DE:'Weiter',             FR:'Reprendre',         IT:'Riprendi',            ES:'Reanudar'          },
  end_game:       { PL:'Zakończ',           EN:'End',                DE:'Beenden',            FR:'Terminer',          IT:'Termina',             ES:'Terminar'          },
  // End screen
  end_game_title: { PL:'Zakończ mecz',      EN:'End Game',           DE:'Spiel beenden',      FR:'Fin du match',      IT:'Fine partita',        ES:'Fin del partido'   },
  min_played:     { PL:'Zagrane minuty',    EN:'Minutes Played',     DE:'Gespielte Minuten',  FR:'Minutes jouées',    IT:'Minuti giocati',      ES:'Minutos jugados'   },
  timer_label:    { PL:'Stoper: {m}m',      EN:'Timer: {m}m',        DE:'Timer: {m}m',        FR:'Minuteur: {m}m',    IT:'Timer: {m}m',         ES:'Temporizador: {m}m'},
  pos_played:     { PL:'Grana pozycja',     EN:'Position Played',    DE:'Gespielte Position', FR:'Poste joué',        IT:'Posizione giocata',   ES:'Posición jugada'   },
  stats_total:    { PL:'Statystyki ({n} łącznie)', EN:'Stats ({n} total)', DE:'Statistiken ({n})', FR:'Stats ({n} total)', IT:'Stat ({n} totale)', ES:'Stats ({n} total)'},
  back_btn:       { PL:'Wstecz',            EN:'Back',               DE:'Zurück',             FR:'Retour',            IT:'Indietro',            ES:'Atrás'             },
  save_game:      { PL:'Zapisz mecz',       EN:'Save Game',          DE:'Spiel speichern',    FR:'Sauvegarder',       IT:'Salva partita',       ES:'Guardar partido'   },
  // Progress
  progress_title: { PL:'Postępy',           EN:'Progress',           DE:'Fortschritt',        FR:'Progrès',           IT:'Progressi',           ES:'Progreso'          },
  progress_sub:   { PL:'Śledź swoją poprawę w czasie', EN:'Track your improvement over time', DE:'Fortschritt über Zeit verfolgen', FR:'Suivez vos progrès', IT:'Monitora i tuoi progressi', ES:'Sigue tu mejora en el tiempo'},
  play_2_games:   { PL:'Zagraj co najmniej 2 mecze, aby zobaczyć wykresy', EN:'Play at least 2 games to see charts', DE:'Mind. 2 Spiele für Diagramme', FR:'Jouez 2 matchs pour les graphiques', IT:'Gioca almeno 2 partite per i grafici', ES:'Juega 2 partidos para ver gráficos'},
  filters:        { PL:'Filtry',            EN:'Filters',            DE:'Filter',             FR:'Filtres',           IT:'Filtri',              ES:'Filtros'           },
  game_type_f:    { PL:'Rodzaj meczu',      EN:'Game Type',          DE:'Spieltyp',           FR:'Type de match',     IT:'Tipo di partita',     ES:'Tipo de partido'   },
  all_types:      { PL:'Wszystkie',         EN:'All',                DE:'Alle',               FR:'Tous',              IT:'Tutti',               ES:'Todos'             },
  last_n_games:   { PL:'Ostatnie mecze',    EN:'Last N Games',       DE:'Letzte N Spiele',    FR:'N derniers matchs', IT:'Ultimi N partite',    ES:'Últimos N partidos'},
  showing_of:     { PL:'{a} z {b}',         EN:'{a} of {b}',         DE:'{a} von {b}',        FR:'{a} sur {b}',       IT:'{a} di {b}',          ES:'{a} de {b}'        },
  last_n:         { PL:'Ostatnie {n}',      EN:'Last {n}',           DE:'Letzte {n}',         FR:'{n} derniers',      IT:'Ultimi {n}',          ES:'Últimos {n}'       },
  custom_n_ph:    { PL:'Wpisz N…',          EN:'Custom N…',          DE:'Eigenes N…',         FR:'N perso…',          IT:'N personalizzato…',   ES:'N personalizado…'  },
  average:        { PL:'Średnia',           EN:'Average',            DE:'Durchschnitt',       FR:'Moyenne',           IT:'Media',               ES:'Promedio'          },
  best:           { PL:'Najlepszy',         EN:'Best',               DE:'Bestes',             FR:'Meilleur',          IT:'Migliore',            ES:'Mejor'             },
  last_game:      { PL:'Ostatni mecz',      EN:'Last game',          DE:'Letztes Spiel',      FR:'Dernier match',     IT:'Ultima partita',      ES:'Último partido'    },
  per_game:       { PL:'{m} na mecz',       EN:'{m} per game',       DE:'{m} pro Spiel',      FR:'{m} par match',     IT:'{m} per partita',     ES:'{m} por partido'   },
  all_totals:     { PL:'Łącznie {c}',       EN:'All {c} totals',     DE:'Alle {c} gesamt',    FR:'Total {c}',         IT:'Totale {c}',          ES:'Total {c}'         },
  no_match_filter:{ PL:'Brak meczów pasujących do filtrów', EN:'No games match the current filters', DE:'Keine Spiele passen zu den Filtern', FR:'Aucun match pour ces filtres', IT:'Nessuna partita per i filtri', ES:'Sin partidos con estos filtros'},
  // Settings
  settings_title: { PL:'Ustawienia',        EN:'Settings',           DE:'Einstellungen',      FR:'Réglages',          IT:'Impostazioni',        ES:'Configuración'     },
  account_label:  { PL:'Konto: {u}',        EN:'Account: {u}',       DE:'Konto: {u}',         FR:'Compte: {u}',       IT:'Account: {u}',        ES:'Cuenta: {u}'       },
  signed_in:      { PL:'Zalogowano',        EN:'Signed in',          DE:'Angemeldet',         FR:'Connecté',          IT:'Connesso',            ES:'Sesión iniciada'   },
  sign_out:       { PL:'Wyloguj',           EN:'Sign Out',           DE:'Abmelden',           FR:'Déconnexion',       IT:'Disconnetti',         ES:'Cerrar sesión'     },
  player_name:    { PL:'Imię zawodnika',    EN:'Player Name',        DE:'Spielername',        FR:'Nom du joueur',     IT:'Nome giocatore',      ES:'Nombre del jugador'},
  edit_btn:       { PL:'Edytuj',            EN:'Edit',               DE:'Bearbeiten',         FR:'Modifier',          IT:'Modifica',            ES:'Editar'            },
  age_label:      { PL:'Wiek',              EN:'Age',                DE:'Alter',              FR:'Âge',               IT:'Età',                 ES:'Edad'              },
  optional:       { PL:'opcjonalnie',       EN:'optional',           DE:'optional',           FR:'facultatif',        IT:'opzionale',           ES:'opcional'          },
  not_set:        { PL:'Nie ustawiono',     EN:'Not set',            DE:'Nicht gesetzt',      FR:'Non défini',        IT:'Non impostato',       ES:'No definido'       },
  years_old:      { PL:'{n} lat',           EN:'{n} years old',      DE:'{n} Jahre alt',      FR:'{n} ans',           IT:'{n} anni',            ES:'{n} años'          },
  age_ph:         { PL:'np. 11',            EN:'e.g. 11',            DE:'z.B. 11',            FR:'ex. 11',            IT:'es. 11',              ES:'ej. 11'            },
  feedback_btn:   { PL:'Opinia',            EN:'Feedback',           DE:'Feedback',           FR:'Avis',              IT:'Feedback',            ES:'Opinión'           },
  donate_btn:     { PL:'Wesprzyj',          EN:'Donate',             DE:'Spenden',            FR:'Donner',            IT:'Dona',                ES:'Donar'             },
  cats_measures:  { PL:'Kategorie i miary', EN:'Categories & Measures', DE:'Kategorien & Maßnahmen', FR:'Catégories et mesures', IT:'Categorie e misure', ES:'Categorías y medidas'},
  add_category:   { PL:'Dodaj kategorię',   EN:'Add Category',       DE:'Kategorie hinzufügen',FR:'Ajouter catégorie', IT:'Aggiungi categoria',  ES:'Añadir categoría'  },
  add_btn:        { PL:'Dodaj',             EN:'Add',                DE:'Hinzufügen',         FR:'Ajouter',           IT:'Aggiungi',            ES:'Añadir'            },
  new_category:   { PL:'Nowa kategoria',    EN:'New Category',       DE:'Neue Kategorie',     FR:'Nouvelle catégorie',IT:'Nuova categoria',     ES:'Nueva categoría'   },
  cat_name_ph:    { PL:'Nazwa kategorii…',  EN:'Category name…',     DE:'Kategoriename…',     FR:'Nom de catégorie…', IT:'Nome categoria…',     ES:'Nombre categoría…' },
  colour_label:   { PL:'Kolor',             EN:'Colour',             DE:'Farbe',              FR:'Couleur',           IT:'Colore',              ES:'Color'             },
  cancel_btn:     { PL:'Anuluj',            EN:'Cancel',             DE:'Abbrechen',          FR:'Annuler',           IT:'Annulla',             ES:'Cancelar'          },
  add_measure:    { PL:'Dodaj miarę',       EN:'Add Measure',        DE:'Maßnahme hinzufügen',FR:'Ajouter mesure',    IT:'Aggiungi misura',     ES:'Añadir medida'     },
  measure_name_ph:{ PL:'Nazwa miary…',      EN:'Measure name…',      DE:'Maßnahmenname…',     FR:'Nom de la mesure…', IT:'Nome misura…',        ES:'Nombre medida…'    },
  active_label:   { PL:'aktywne',           EN:'active',             DE:'aktiv',              FR:'actifs',            IT:'attive',              ES:'activas'           },
  custom_badge:   { PL:'Własna',            EN:'Custom',             DE:'Benutzerdefiniert',  FR:'Perso',             IT:'Personalizzata',      ES:'Personalizada'     },
  language_label: { PL:'Język',             EN:'Language',           DE:'Sprache',            FR:'Langue',            IT:'Lingua',              ES:'Idioma'            },
  // Position areas
  area_defence:   { PL:'obrona',            EN:'defence',            DE:'Abwehr',             FR:'défense',           IT:'difesa',              ES:'defensa'           },
  area_midfield:  { PL:'pomoc',             EN:'midfield',           DE:'Mittelfeld',         FR:'milieu',            IT:'centrocampo',         ES:'centrocampo'       },
  area_attack:    { PL:'atak',              EN:'attack',             DE:'Angriff',            FR:'attaque',           IT:'attacco',             ES:'ataque'            },
  change_position:{ PL:'Zmień pozycję',     EN:'Change Position',    DE:'Position ändern',    FR:'Changer de poste',  IT:'Cambia posizione',    ES:'Cambiar posición'  },
  // Position names
  pos_gk:         { PL:'Bramkarz',          EN:'Goalkeeper',         DE:'Torwart',            FR:'Gardien',           IT:'Portiere',            ES:'Portero'           },
  pos_rb:         { PL:'Prawy Obrońca',     EN:'Right Back',         DE:'Rechtsverteidiger',  FR:'Défenseur droit',   IT:'Terzino destro',      ES:'Lateral derecho'   },
  pos_lb:         { PL:'Lewy Obrońca',      EN:'Left Back',          DE:'Linksverteidiger',   FR:'Défenseur gauche',  IT:'Terzino sinistro',    ES:'Lateral izquierdo' },
  pos_cb:         { PL:'Środkowy Obrońca',  EN:'Centre Back',        DE:'Innenverteidiger',   FR:'Défenseur central', IT:'Difensore centrale',  ES:'Defensa central'   },
  pos_sw:         { PL:'Środkowy/Stopper',  EN:'Stopper/CB',         DE:'Stopper/IV',         FR:'Stoppeur',          IT:'Stopper/DC',          ES:'Stopper/DC'        },
  pos_dm:         { PL:'Defensywny Pomocnik',EN:'Defensive Mid',     DE:'Defensives Mittelfeld',FR:'Milieu défensif',  IT:'Mediano difensivo',   ES:'Mediocentro def.'  },
  pos_rw:         { PL:'Prawe Skrzydło',    EN:'Right Wing',         DE:'Rechtsaußen',        FR:'Ailier droit',      IT:'Ala destra',          ES:'Extremo derecho'   },
  pos_cm:         { PL:'Środkowy Pomocnik', EN:'Central Mid',        DE:'Zentrales Mittelfeld',FR:'Milieu central',   IT:'Centrocampista',      ES:'Centrocampista'    },
  pos_cf:         { PL:'Środkowy Napastnik',EN:'Centre Fwd',         DE:'Mittelstürmer',      FR:'Avant-centre',      IT:'Centravanti',         ES:'Delantero centro'  },
  pos_10:         { PL:'Ofensywny Pomocnik',EN:'Attacking Mid',      DE:'Offensives Mittelfeld',FR:'Milieu offensif',  IT:'Trequartista',        ES:'Mediocentro of.'   },
  pos_lw:         { PL:'Lewe Skrzydło',     EN:'Left Wing',          DE:'Linksaußen',         FR:'Ailier gauche',     IT:'Ala sinistra',        ES:'Extremo izquierdo' },
  // Default category names
  cat_passing:    { PL:'Podania',           EN:'Passing',            DE:'Pässe',              FR:'Passes',            IT:'Passaggi',            ES:'Pases'             },
  cat_shooting:   { PL:'Strzały',           EN:'Shooting',           DE:'Schüsse',            FR:'Tirs',              IT:'Tiri',                ES:'Disparos'          },
  cat_dribbling:  { PL:'Drybling',          EN:'Dribbling',          DE:'Dribblings',         FR:'Dribbles',          IT:'Dribbling',           ES:'Regates'           },
  cat_defending:  { PL:'Obrona',            EN:'Defending',          DE:'Verteidigung',       FR:'Défense',           IT:'Difesa',              ES:'Defensa'           },
  cat_physical:   { PL:'Fizyczne',          EN:'Physical',           DE:'Physisches',         FR:'Physique',          IT:'Fisico',              ES:'Físico'            },
  cat_general:    { PL:'Ogólne',            EN:'General',            DE:'Allgemeines',        FR:'Général',           IT:'Generale',            ES:'General'           },
  // Default measure names
  m_passes_completed: { PL:'Podania celne',      EN:'Passes Completed',   DE:'Genaue Pässe',       FR:'Passes réussies',   IT:'Passaggi riusciti',   ES:'Pases completados' },
  m_passes_attempted: { PL:'Próby podań',        EN:'Passes Attempted',   DE:'Passversuche',       FR:'Passes tentées',    IT:'Passaggi tentati',    ES:'Pases intentados'  },
  m_key_passes:       { PL:'Kluczowe podania',   EN:'Key Passes',         DE:'Schlüsselpässe',     FR:'Passes clés',       IT:'Passaggi chiave',     ES:'Pases clave'       },
  m_long_passes:      { PL:'Długie podania',     EN:'Long Passes',        DE:'Lange Pässe',        FR:'Longues passes',    IT:'Passaggi lunghi',     ES:'Pases largos'      },
  m_assists:          { PL:'Asysty',             EN:'Assists',            DE:'Vorlagen',           FR:'Passes décisives',  IT:'Assist',              ES:'Asistencias'       },
  m_goals:            { PL:'Gole',               EN:'Goals',              DE:'Tore',               FR:'Buts',              IT:'Gol',                 ES:'Goles'             },
  m_shots_on_target:  { PL:'Strzały celne',      EN:'Shots on Target',    DE:'Schüsse aufs Tor',   FR:'Tirs cadrés',       IT:'Tiri in porta',       ES:'Tiros a puerta'    },
  m_shots_off_target: { PL:'Strzały niecelne',   EN:'Shots off Target',   DE:'Schüsse daneben',    FR:'Tirs non cadrés',   IT:'Tiri fuori',          ES:'Tiros desviados'   },
  m_dribbles_completed:{ PL:'Drybling udany',    EN:'Dribbles Completed', DE:'Erfolgreiche Dribblings',FR:'Dribbles réussis',IT:'Dribbling riusciti', ES:'Regates completados'},
  m_dribbles_attempted:{ PL:'Próby dryblingu',   EN:'Dribbles Attempted', DE:'Dribbling-Versuche', FR:'Dribbles tentés',   IT:'Dribbling tentati',   ES:'Regates intentados'},
  m_tackles_won:      { PL:'Odbiory',            EN:'Tackles Won',        DE:'Gewonnene Zweikämpfe',FR:'Tacles réussis',   IT:'Contrasti vinti',     ES:'Entradas ganadas'  },
  m_interceptions:    { PL:'Przechwyty',         EN:'Interceptions',      DE:'Abfangaktionen',     FR:'Interceptions',     IT:'Intercettazioni',     ES:'Intercepciones'    },
  m_clearances:       { PL:'Wybicia',            EN:'Clearances',         DE:'Klärungsaktionen',   FR:'Dégagements',       IT:'Rinvii',              ES:'Despejes'          },
  m_blocks:           { PL:'Bloki',              EN:'Blocks',             DE:'Blocks',             FR:'Blocages',          IT:'Blocchi',             ES:'Bloqueos'          },
  m_headers_won:      { PL:'Główki wygrane',     EN:'Headers Won',        DE:'Gewonnene Kopfbälle',FR:'Têtes gagnées',     IT:'Colpi di testa vinti',ES:'Cabezazos ganados' },
  m_duels_won:        { PL:'Pojedynki wygrane',  EN:'Duels Won',          DE:'Gewonnene Zweikämpfe',FR:'Duels gagnés',     IT:'Duelli vinti',        ES:'Duelos ganados'    },
  m_fouls:            { PL:'Faule',              EN:'Fouls',              DE:'Fouls',              FR:'Fautes',            IT:'Falli',               ES:'Faltas'            },
  m_touches:          { PL:'Dotknięcia',         EN:'Touches',            DE:'Ballkontakte',       FR:'Touches de balle',  IT:'Tocchi',              ES:'Toques'            },
  m_yellow_cards:     { PL:'Żółte kartki',       EN:'Yellow Cards',       DE:'Gelbe Karten',       FR:'Cartons jaunes',    IT:'Cartellini gialli',   ES:'Tarjetas amarillas'},
  // Payment
  pay_amount:     { PL:'Kwota: ',           EN:'Amount: ',           DE:'Betrag: ',           FR:'Montant: ',         IT:'Importo: ',           ES:'Importe: '         },
  pay_choose_method:{ PL:'Wybierz metodę płatności', EN:'Choose your payment method', DE:'Zahlungsart wählen', FR:'Choisissez le mode de paiement', IT:'Scegli metodo di pagamento', ES:'Elige método de pago'},
  pay_blik_desc:  { PL:'6-cyfrowy kod z aplikacji bankowej', EN:'6-digit code from your banking app', DE:'6-stelliger Code aus Ihrer Banking-App', FR:'Code 6 chiffres de votre app bancaire', IT:'Codice a 6 cifre dalla tua app bancaria', ES:'Código de 6 dígitos de tu app bancaria'},
  pay_card_desc:  { PL:'Visa, Mastercard, Amex',EN:'Visa, Mastercard, Amex',DE:'Visa, Mastercard, Amex',FR:'Visa, Mastercard, Amex',IT:'Visa, Mastercard, Amex',ES:'Visa, Mastercard, Amex'},
  pay_secure:     { PL:'Bezpieczna płatność · SSL',EN:'Secure payment · SSL encrypted',DE:'Sichere Zahlung · SSL',FR:'Paiement sécurisé · SSL',IT:'Pagamento sicuro · SSL',ES:'Pago seguro · SSL'},
  pay_processing: { PL:'Przetwarzanie płatności…',EN:'Processing payment…',DE:'Zahlung wird verarbeitet…',FR:'Traitement du paiement…',IT:'Elaborazione pagamento…',ES:'Procesando pago…'},
  pay_dont_close: { PL:'Nie zamykaj aplikacji',EN:"Please don't close the app",DE:'Bitte App nicht schließen',FR:"Ne fermez pas l'application",IT:"Non chiudere l'app",ES:'No cierres la app'},
  pay_btn:        { PL:'Zapłać {a} PLN',    EN:'Pay {a} PLN',        DE:'{a} PLN bezahlen',   FR:'Payer {a} PLN',     IT:'Paga {a} PLN',        ES:'Pagar {a} PLN'     },
  pay_confirm:    { PL:'Potwierdź {a} PLN', EN:'Confirm {a} PLN',    DE:'{a} PLN bestätigen', FR:'Confirmer {a} PLN', IT:'Conferma {a} PLN',    ES:'Confirmar {a} PLN' },
  pay_card_num:   { PL:'NUMER KARTY',       EN:'CARD NUMBER',        DE:'KARTENNUMMER',       FR:'NUMÉRO DE CARTE',   IT:'NUMERO CARTA',        ES:'NÚMERO TARJETA'    },
  pay_expiry:     { PL:'DATA WAŻNOŚCI',     EN:'EXPIRY',             DE:'ABLAUFDATUM',        FR:'EXPIRATION',        IT:'SCADENZA',            ES:'CADUCIDAD'         },
  pay_cvc:        { PL:'CVC',               EN:'CVC',                DE:'CVC',                FR:'CVC',               IT:'CVC',                 ES:'CVC'               },
  pay_cardholder: { PL:'IMIĘ I NAZWISKO',   EN:'CARDHOLDER NAME',    DE:'KARTENINHABER',      FR:'NOM DU TITULAIRE',  IT:'TITOLARE CARTA',      ES:'TITULAR TARJETA'   },
  pay_card_ph:    { PL:'Jak na karcie',     EN:'As shown on card',   DE:'Wie auf der Karte',  FR:'Comme sur la carte',IT:'Come sulla carta',    ES:'Como en la tarjeta'},
  pay_pci:        { PL:'🔒 Szyfrowane · PCI DSS',EN:'🔒 Encrypted · PCI DSS',DE:'🔒 Verschlüsselt · PCI DSS',FR:'🔒 Chiffré · PCI DSS',IT:'🔒 Crittografato · PCI DSS',ES:'🔒 Cifrado · PCI DSS'},
  blik_how_title: { PL:'Jak zapłacić BLIKiem:',EN:'How to pay with BLIK:',DE:'So bezahlen Sie mit BLIK:',FR:'Comment payer avec BLIK:',IT:'Come pagare con BLIK:',ES:'Cómo pagar con BLIK:'},
  blik_steps:     {
    PL:['Otwórz aplikację bankową','Znajdź BLIK lub płatności mobilne','Skopiuj 6-cyfrowy kod','Wpisz go poniżej i potwierdź'],
    EN:['Open your banking app','Find BLIK or Mobile payments','Copy the 6-digit code','Enter it below and confirm'],
    DE:['Banking-App öffnen','BLIK oder mobile Zahlung finden','6-stelligen Code kopieren','Unten eingeben und bestätigen'],
    FR:['Ouvrez votre appli bancaire','Trouvez BLIK ou paiements mobiles','Copiez le code à 6 chiffres','Entrez-le ci-dessous et confirmez'],
    IT:['Apri la tua app bancaria','Trova BLIK o pagamenti mobili','Copia il codice a 6 cifre','Inseriscilo qui sotto e conferma'],
    ES:['Abre tu app bancaria','Busca BLIK o pagos móviles','Copia el código de 6 dígitos','Introdúcelo abajo y confirma'],
  },
  blik_code_label:{ PL:'KOD BLIK',          EN:'BLIK CODE',          DE:'BLIK-CODE',          FR:'CODE BLIK',         IT:'CODICE BLIK',         ES:'CÓDIGO BLIK'       },
  blik_valid:     { PL:'Kod ważny ok. 2 minuty',EN:'Code valid for ~2 minutes',DE:'Code ~2 Minuten gültig',FR:'Code valable ~2 minutes',IT:'Codice valido ~2 minuti',ES:'Código válido ~2 minutos'},
  pay_card_err1:  { PL:'Podaj prawidłowy 16-cyfrowy numer karty', EN:'Enter a valid 16-digit card number', DE:'Gültige 16-stellige Kartennummer eingeben', FR:'Entrez un numéro de carte à 16 chiffres', IT:'Inserisci un numero carta valido a 16 cifre', ES:'Ingresa un número de tarjeta válido de 16 dígitos'},
  pay_card_err2:  { PL:'Podaj datę ważności MM/RR', EN:'Enter a valid expiry date MM/YY', DE:'Gültiges Ablaufdatum MM/JJ eingeben', FR:'Entrez une date d\'expiration MM/AA valide', IT:'Inserisci data scadenza MM/AA', ES:'Ingresa fecha de caducidad MM/AA'},
  pay_card_err3:  { PL:'Podaj prawidłowy CVC', EN:'Enter a valid CVC', DE:'Gültige CVC eingeben', FR:'Entrez un CVC valide', IT:'Inserisci un CVC valido', ES:'Ingresa un CVC válido'},
  pay_card_err4:  { PL:'Podaj imię posiadacza karty', EN:'Enter the cardholder name', DE:'Karteninhaber eingeben', FR:'Entrez le nom du titulaire', IT:'Inserisci il nome del titolare', ES:'Ingresa el nombre del titular'},
  pay_blik_err:   { PL:'Wpisz 6-cyfrowy kod BLIK z aplikacji bankowej', EN:'Enter the 6-digit BLIK code from your banking app', DE:'6-stelligen BLIK-Code aus Banking-App eingeben', FR:'Entrez le code BLIK à 6 chiffres', IT:'Inserisci il codice BLIK a 6 cifre', ES:'Introduce el código BLIK de 6 dígitos'},
  // Donate
  donate_title:   { PL:'Wesprzyj nas',      EN:'Support Us',         DE:'Unterstütze uns',    FR:'Soutenez-nous',     IT:'Supportaci',          ES:'Apóyanos'          },
  donate_sub:     { PL:'Za darmo na zawsze · Twoje wsparcie pomaga nam rosnąć', EN:'Free forever · Your support helps it grow', DE:'Kostenlos für immer · Ihre Unterstützung hilft', FR:'Gratuit pour toujours · Votre soutien aide', IT:'Gratis per sempre · Il tuo supporto aiuta', ES:'Gratis para siempre · Tu apoyo nos ayuda'},
  donate_msg:     { PL:'GrowInSport powstał z pasji do piłki nożnej dla dzieci. Jest całkowicie bezpłatny i taki pozostanie. Jeśli pomógł Ci śledzić postępy Twojego dziecka – rozważ małą darowiznę!', EN:'GrowInSport is built with passion for youth football. Completely free and will always stay that way. If it helps you track your child\'s progress, consider a small donation!', DE:'GrowInSport wurde mit Leidenschaft für den Jugendfußball entwickelt. Komplett kostenlos – für immer. Eine kleine Spende hilft uns, das Projekt am Leben zu erhalten!', FR:'GrowInSport est créé avec passion pour le football des jeunes. Totalement gratuit pour toujours. Si cela vous aide à suivre les progrès de votre enfant, pensez à un don!', IT:'GrowInSport è fatto con passione per il calcio giovanile. Completamente gratuito per sempre. Se ti aiuta a seguire i progressi di tuo figlio, considera una piccola donazione!', ES:'GrowInSport está hecho con pasión por el fútbol juvenil. Completamente gratis para siempre. Si te ayuda a seguir el progreso de tu hijo, ¡considera una pequeña donación!'},
  donate_choose:  { PL:'Wybierz kwotę',     EN:'Choose an amount',   DE:'Betrag wählen',      FR:'Choisir un montant',IT:'Scegli un importo',   ES:'Elige un importe'  },
  donate_custom:  { PL:'Inna kwota',        EN:'Custom amount',      DE:'Eigener Betrag',     FR:'Montant personnalisé',IT:'Importo personalizzato',ES:'Importe personalizado'},
  donate_ph:      { PL:'Wpisz kwotę…',      EN:'Enter amount…',      DE:'Betrag eingeben…',   FR:'Entrez un montant…',IT:'Inserisci importo…',  ES:'Ingresa importe…'  },
  donate_btn_amt: { PL:'Przekaż {a} PLN',   EN:'Donate {a} PLN',     DE:'{a} PLN spenden',    FR:'Donner {a} PLN',    IT:'Dona {a} PLN',        ES:'Donar {a} PLN'     },
  donate_btn_sel: { PL:'Wybierz kwotę',     EN:'Select an amount first',DE:'Betrag wählen',   FR:'Choisissez un montant',IT:'Seleziona un importo',ES:'Selecciona un importe'},
  donate_footer:  { PL:'🔒 Bezpieczne · Brak subskrypcji · BLIK i karty', EN:'🔒 Secure · No subscription · BLIK & Cards accepted', DE:'🔒 Sicher · Kein Abo · BLIK & Karten', FR:'🔒 Sécurisé · Sans abonnement · BLIK & Cartes', IT:'🔒 Sicuro · Nessun abbonamento · BLIK & Carte', ES:'🔒 Seguro · Sin suscripción · BLIK y tarjetas'},
  donate_thanks:  { PL:'Dziękujemy!',       EN:'Thank you!',         DE:'Danke!',             FR:'Merci!',            IT:'Grazie!',             ES:'¡Gracias!'         },
  donate_thanks_msg:{ PL:'Twoja darowizna w wysokości {a} PLN wiele dla nas znaczy.\nDzięki Tobie GrowInSport pozostaje bezpłatny dla każdej rodziny.', EN:'Your donation of {a} PLN means the world to us.\nIt keeps GrowInSport free for every family.', DE:'Ihre Spende von {a} PLN bedeutet uns sehr viel.\nSie hält GrowInSport für alle Familien kostenlos.', FR:'Votre don de {a} PLN nous touche beaucoup.\nIl maintient GrowInSport gratuit pour toutes les familles.', IT:'La tua donazione di {a} PLN significa moltissimo per noi.\nMantiene GrowInSport gratuito per ogni famiglia.', ES:'Tu donación de {a} PLN significa mucho para nosotros.\nMantiene GrowInSport gratuito para todas las familias.'},
  back_to_app:    { PL:'Wróć do aplikacji', EN:'Back to App',        DE:'Zurück zur App',     FR:"Retour à l'app",    IT:"Torna all'app",       ES:'Volver a la app'   },
  // Feedback
  feedback_title: { PL:'Opinia',            EN:'Feedback',           DE:'Feedback',           FR:'Avis',              IT:'Feedback',            ES:'Opinión'           },
  feedback_sub:   { PL:'Pomóż nam ulepszyć GrowInSport', EN:'Help us improve GrowInSport', DE:'Helfen Sie uns, GrowInSport zu verbessern', FR:'Aidez-nous à améliorer GrowInSport', IT:'Aiutaci a migliorare GrowInSport', ES:'Ayúdanos a mejorar GrowInSport'},
  feedback_rate:  { PL:'Jak oceniasz aplikację?', EN:'How would you rate the app?', DE:'Wie bewerten Sie die App?', FR:'Comment noteriez-vous l\'app?', IT:'Come valuteresti l\'app?', ES:'¿Cómo valorarías la app?'},
  feedback_stars: {
    PL:['','😞 Słabo','😕 Poniżej oczekiwań','😐 Przeciętnie','😊 Dobrze','🤩 Doskonale!'],
    EN:['','😞 Poor','😕 Below average','😐 Average','😊 Good','🤩 Excellent!'],
    DE:['','😞 Schlecht','😕 Unter Durchschnitt','😐 Durchschnittlich','😊 Gut','🤩 Ausgezeichnet!'],
    FR:['','😞 Mauvais','😕 En dessous de la moyenne','😐 Moyen','😊 Bien','🤩 Excellent!'],
    IT:['','😞 Scarso','😕 Sotto la media','😐 Medio','😊 Buono','🤩 Eccellente!'],
    ES:['','😞 Malo','😕 Por debajo de la media','😐 Normal','😊 Bueno','🤩 ¡Excelente!'],
  },
  feedback_cat:   { PL:'Kategoria',         EN:'Category',           DE:'Kategorie',          FR:'Catégorie',         IT:'Categoria',           ES:'Categoría'         },
  feedback_cats:  {
    PL:['Ogólne','Błąd','Propozycja','UI / Wygląd','Wydajność'],
    EN:['General','Bug Report','Feature Request','UI / Design','Performance'],
    DE:['Allgemein','Fehlerbericht','Funktionswunsch','UI / Design','Leistung'],
    FR:['Général','Rapport de bug','Demande de fonction','UI / Design','Performance'],
    IT:['Generale','Segnalazione bug','Richiesta funzione','UI / Design','Prestazioni'],
    ES:['General','Informe de error','Solicitud de función','UI / Diseño','Rendimiento'],
  },
  feedback_msg:   { PL:'Twoja wiadomość',   EN:'Your Message',       DE:'Ihre Nachricht',     FR:'Votre message',     IT:'Il tuo messaggio',    ES:'Tu mensaje'        },
  feedback_ph:    { PL:'Napisz co myślisz, co można poprawić lub zgłoś problem…', EN:'Tell us what you think, what could be better, or report a problem…', DE:'Sagen Sie uns, was Sie denken, was verbessert werden könnte…', FR:'Dites-nous ce que vous pensez, ce qui pourrait être mieux…', IT:'Dicci cosa pensi, cosa potrebbe migliorare o segnala un problema…', ES:'Cuéntanos qué piensas, qué podría mejorar o reporta un problema…'},
  chars_label:    { PL:'znaków',            EN:'chars',              DE:'Zeichen',            FR:'caract.',           IT:'caratteri',           ES:'caract.'           },
  send_feedback:  { PL:'Wyślij opinię',     EN:'Send Feedback',      DE:'Feedback senden',    FR:'Envoyer l\'avis',   IT:'Invia feedback',      ES:'Enviar opinión'    },
  sending:        { PL:'Wysyłanie…',        EN:'Sending…',           DE:'Senden…',            FR:'Envoi…',            IT:'Invio…',              ES:'Enviando…'         },
  feedback_thanks:{ PL:'Dziękujemy!',       EN:'Thank you!',         DE:'Danke!',             FR:'Merci!',            IT:'Grazie!',             ES:'¡Gracias!'         },
  feedback_thanks_msg:{ PL:'Twoja opinia pomaga nam ulepszać GrowInSport dla każdego zawodnika i rodzica.', EN:'Your feedback helps us make GrowInSport better for every player and parent out there.', DE:'Ihr Feedback hilft uns, GrowInSport für jeden Spieler und Elternteil zu verbessern.', FR:'Votre avis nous aide à améliorer GrowInSport pour tous les joueurs et parents.', IT:'Il tuo feedback ci aiuta a migliorare GrowInSport per ogni giocatore e genitore.', ES:'Tu opinión nos ayuda a mejorar GrowInSport para cada jugador y padre.'},
  give_rating:    { PL:'Oceń aplikację',    EN:'Please give a star rating', DE:'Bitte Sterne vergeben', FR:'Veuillez noter', IT:'Per favore dai una valutazione', ES:'Por favor puntúa la app'},
  write_msg:      { PL:'Napisz wiadomość',  EN:'Please write a message', DE:'Bitte Nachricht schreiben', FR:'Veuillez écrire un message', IT:'Scrivi un messaggio', ES:'Por favor escribe un mensaje'},
  send_error:     { PL:'Nie udało się wysłać',EN:'Could not submit — please try again',DE:'Senden fehlgeschlagen',FR:'Envoi échoué – réessayez',IT:'Invio fallito – riprova',ES:'No se pudo enviar – inténtalo de nuevo'},

  third_n:        { PL:'{n}. tercja',        EN:'Third {n}',          DE:'{n}. Drittel',       FR:'{n}ème tiers',      IT:'{n}° terzo',          ES:'{n}er tercio'      },
  quarter_n:      { PL:'{n}. kwarta',        EN:'Quarter {n}',        DE:'{n}. Viertel',       FR:'{n}ème quart',      IT:'{n}° quarto',         ES:'{n}er cuarto'      },
  next_period:    { PL:'Następna część',     EN:'Next Period',        DE:'Nächster Abschnitt', FR:'Période suivante',  IT:'Periodo successivo',  ES:'Siguiente período' },
  end_period:     { PL:'Zakończ część',      EN:'End Period',         DE:'Abschnitt beenden',  FR:'Fin de période',    IT:'Fine periodo',        ES:'Fin del período'   },
  period_total:   { PL:'suma',               EN:'total',              DE:'gesamt',             FR:'total',             IT:'totale',              ES:'total'             },
  period_mins_each:{PL:'{m} min / część',   EN:'{m} min / period',   DE:'{m} Min. / Abschnitt',FR:'{m} min / période', IT:'{m} min / periodo',  ES:'{m} min / período' },
  // Edit game
  edit_game:      { PL:'Edytuj mecz',        EN:'Edit Game',          DE:'Spiel bearbeiten',   FR:'Modifier le match', IT:'Modifica partita',    ES:'Editar partido'    },
  edit_stats:     { PL:'Statystyki',         EN:'Statistics',         DE:'Statistiken',        FR:'Statistiques',      IT:'Statistiche',         ES:'Estadísticas'      },
  edit_meta:      { PL:'Dane meczu',         EN:'Game Details',       DE:'Spieldetails',       FR:'Détails du match',  IT:'Dettagli partita',    ES:'Detalles partido'  },
  save_changes:   { PL:'Zapisz zmiany',      EN:'Save Changes',       DE:'Änderungen speichern',FR:'Enregistrer',      IT:'Salva modifiche',     ES:'Guardar cambios'   },
  periods_tab:    { PL:'Okresy',             EN:'Periods',            DE:'Abschnitte',         FR:'Périodes',          IT:'Periodi',             ES:'Períodos'          },
  total_tab:      { PL:'Łącznie',            EN:'Total',              DE:'Gesamt',             FR:'Total',             IT:'Totale',              ES:'Total'             },
  no_period_data: { PL:'Brak danych dla tej części', EN:'No data for this period', DE:'Keine Daten für diesen Abschnitt', FR:'Pas de données pour cette période', IT:'Nessun dato per questo periodo', ES:'Sin datos para este período'},
  // Periods
  periods_label:   { PL:'Podział na części',  EN:'Split into periods', DE:'In Abschnitte teilen', FR:'Diviser en périodes', IT:'Dividi in periodi',   ES:'Dividir en periodos' },
  periods_none:    { PL:'Bez podziału',        EN:'No split',           DE:'Kein Abschnitt',      FR:'Sans division',      IT:'Senza divisione',      ES:'Sin división'        },
  periods_2:       { PL:'2 połowy',            EN:'2 halves',           DE:'2 Halbzeiten',        FR:'2 mi-temps',         IT:'2 tempi',              ES:'2 tiempos'           },
  periods_3:       { PL:'3 tercje',            EN:'3 thirds',           DE:'3 Drittel',           FR:'3 tiers-temps',      IT:'3 terzi',              ES:'3 tercios'           },
  periods_4:       { PL:'4 kwarty',            EN:'4 quarters',         DE:'4 Viertel',           FR:'4 quarts-temps',     IT:'4 quarti',             ES:'4 cuartos'           },
  period_of:       { PL:'{n}. {name}',         EN:'{n}. {name}',        DE:'{n}. {name}',         FR:'{n}. {name}',        IT:'{n}. {name}',          ES:'{n}. {name}'         },
  next_period:     { PL:'Następna część →',    EN:'Next Period →',      DE:'Nächster Abschnitt →',FR:'Période suivante →', IT:'Periodo successivo →', ES:'Siguiente período →' },
  period_name_half:{ PL:'Połowa',              EN:'Half',               DE:'Halbzeit',            FR:'Mi-temps',           IT:'Tempo',                ES:'Tiempo'              },
  period_name_third:{PL:'Tercja',              EN:'Third',              DE:'Drittel',             FR:'Tiers-temps',        IT:'Terzo',                ES:'Tercio'              },
  period_name_quarter:{PL:'Kwarta',            EN:'Quarter',            DE:'Viertel',             FR:'Quart-temps',        IT:'Quarto',               ES:'Cuarto'              },
  period_name_part:{ PL:'Część',               EN:'Part',               DE:'Teil',                FR:'Partie',             IT:'Parte',                ES:'Parte'               },
  // Edit game
  edit_game_btn:   { PL:'Edytuj',              EN:'Edit',               DE:'Bearbeiten',          FR:'Modifier',           IT:'Modifica',             ES:'Editar'              },
  edit_game_title: { PL:'Edytuj mecz',         EN:'Edit Game',          DE:'Spiel bearbeiten',    FR:'Modifier le match',  IT:'Modifica partita',     ES:'Editar partido'      },
  edit_stats_label:{ PL:'Statystyki',          EN:'Statistics',         DE:'Statistiken',         FR:'Statistiques',       IT:'Statistiche',          ES:'Estadísticas'        },
  edit_game_info:  { PL:'Informacje o meczu',  EN:'Game Info',          DE:'Spielinfo',           FR:'Infos du match',     IT:'Info partita',         ES:'Info partido'        },
  save_changes:    { PL:'Zapisz zmiany',       EN:'Save Changes',       DE:'Änderungen speichern',FR:'Enregistrer',        IT:'Salva modifiche',      ES:'Guardar cambios'     },

  // Progress — vs average comparison
  vs_avg_title:    { PL:'Ostatni mecz vs. średnia',   EN:'Last game vs. average',      DE:'Letztes Spiel vs. Schnitt',    FR:'Dernier match vs. moyenne',   IT:'Ultima vs. media',            ES:'Último vs. promedio'         },
  vs_avg_last:     { PL:'Ostatni',                     EN:'Last',                       DE:'Letztes',                      FR:'Dernier',                     IT:'Ultimo',                      ES:'Último'                      },
  vs_avg_avg:      { PL:'Średnia z {n}',               EN:'Avg of {n}',                 DE:'Ø von {n}',                    FR:'Moy. sur {n}',                IT:'Media su {n}',                ES:'Prom. de {n}'                },
  vs_avg_above:    { PL:'+{d} powyżej średniej',       EN:'+{d} above average',         DE:'+{d} über dem Schnitt',        FR:'+{d} au-dessus de la moyenne',IT:'+{d} sopra la media',         ES:'+{d} sobre el promedio'      },
  vs_avg_below:    { PL:'{d} poniżej średniej',        EN:'{d} below average',          DE:'{d} unter dem Schnitt',        FR:'{d} sous la moyenne',         IT:'{d} sotto la media',          ES:'{d} bajo el promedio'        },
  vs_avg_equal:    { PL:'Dokładnie na poziomie średniej',EN:'Right on the average',     DE:'Genau im Schnitt',             FR:'Exactement dans la moyenne',  IT:'Esattamente nella media',     ES:'Exactamente en el promedio'  },
  trend_up:        { PL:'Tendencja wzrostowa ↑',       EN:'Trending up ↑',              DE:'Aufwärtstrend ↑',              FR:'Tendance à la hausse ↑',      IT:'Tendenza in aumento ↑',       ES:'Tendencia al alza ↑'         },
  trend_down:      { PL:'Tendencja spadkowa ↓',        EN:'Trending down ↓',            DE:'Abwärtstrend ↓',               FR:'Tendance à la baisse ↓',      IT:'Tendenza in calo ↓',          ES:'Tendencia a la baja ↓'       },
  trend_stable:    { PL:'Stabilna forma →',            EN:'Stable form →',              DE:'Stabile Form →',               FR:'Forme stable →',              IT:'Forma stabile →',             ES:'Forma estable →'             },
  no_data_yet:     { PL:'Brak danych',                 EN:'No data yet',                DE:'Noch keine Daten',             FR:'Pas encore de données',       IT:'Nessun dato',                 ES:'Sin datos aún'               },

  // Analysis
  analysis_tab:     {PL:'Analiza',            EN:'Analysis',          DE:'Analyse',            FR:'Analyse',           IT:'Analisi',            ES:'Análisis'          },
  analysis_period:  {PL:'Wg części gry',      EN:'By game period',    DE:'Nach Spielabschnitt',FR:'Par période',       IT:'Per periodo',        ES:'Por período'       },
  analysis_timerange:{PL:'Przedział minut',   EN:'Minute range',      DE:'Minutenbereich',     FR:'Plage de minutes',  IT:'Intervallo minuti',  ES:'Rango de minutos'  },
  period_filter_all:{PL:'Cały mecz',          EN:'Full game',         DE:'Ganzes Spiel',       FR:'Match complet',     IT:'Partita intera',     ES:'Partido completo'  },
  from_min:         {PL:'Od minuty',          EN:'From min',          DE:'Von Min.',           FR:'De min.',           IT:'Dal minuto',         ES:'Del minuto'        },
  to_min:           {PL:'Do minuty',          EN:'To min',            DE:'Bis Min.',           FR:'À min.',            IT:'Al minuto',          ES:'Al minuto'         },
  apply_range:      {PL:'Zastosuj',           EN:'Apply',             DE:'Anwenden',           FR:'Appliquer',         IT:'Applica',            ES:'Aplicar'           },
  no_event_data:    {PL:'Brak danych zdarzeń (mecze sprzed aktualizacji)', EN:'No event data (pre-update games)', DE:'Keine Ereignisdaten', FR:"Pas de données d'événements", IT:'Nessun dato evento', ES:'Sin datos de eventos'},
  events_in_range:  {PL:'Zdarzenia w przedziale',EN:'Events in range', DE:'Ereignisse im Bereich',FR:'Événements dans la plage',IT:"Eventi nell'intervallo",ES:'Eventos en el rango'},
  avg_per_game:     {PL:'Śr. na mecz',        EN:'Avg/game',          DE:'Ø/Spiel',            FR:'Moy./match',        IT:'Media/partita',      ES:'Prom./partido'     },
  // Export
  export_title:     {PL:'Eksport danych',     EN:'Export Data',       DE:'Daten exportieren',  FR:'Exporter les données',IT:'Esporta dati',      ES:'Exportar datos'    },
  export_sub:       {PL:'Pobierz dane do analizy zewnętrznej', EN:'Download data for external analysis', DE:'Daten für externe Analyse herunterladen', FR:'Télécharger pour analyse externe', IT:'Scarica per analisi esterna', ES:'Descargar para análisis externo'},
  export_events:    {PL:'Eksport zdarzeń',    EN:'Event Log Export',  DE:'Ereignisprotokoll',  FR:'Journal des événements',IT:'Log degli eventi',  ES:'Registro de eventos'},
  export_events_desc:{PL:'Każde kliknięcie z minutą i częścią gry – do analizy szczegółowej', EN:'Every tap with timestamp, period & minute – for detailed analysis', DE:'Jeden Klick mit Zeitstempel', FR:'Chaque action avec horodatage', IT:'Ogni azione con timestamp', ES:'Cada acción con marca de tiempo'},
  export_summary:   {PL:'Eksport podsumowania',EN:'Summary Export',   DE:'Zusammenfassung',    FR:'Résumé des matchs',  IT:'Riepilogo partite',  ES:'Resumen de partidos'},
  export_summary_desc:{PL:'Jeden wiersz na mecz ze wszystkimi statystykami – do arkuszy kalkulacyjnych', EN:'One row per game with all stats – for spreadsheets', DE:'Eine Zeile pro Spiel', FR:'Une ligne par match', IT:'Una riga per partita', ES:'Una fila por partido'},
  export_btn:       {PL:'Pobierz CSV',        EN:'Download CSV',      DE:'CSV herunterladen',  FR:'Télécharger CSV',   IT:'Scarica CSV',        ES:'Descargar CSV'     },
  export_json:      {PL:'Pobierz JSON',       EN:'Download JSON',     DE:'JSON herunterladen', FR:'Télécharger JSON',  IT:'Scarica JSON',       ES:'Descargar JSON'    },
  export_done:      {PL:'Pobieranie rozpoczęte',EN:'Download started',DE:'Download gestartet', FR:'Téléchargement lancé',IT:'Download avviato',  ES:'Descarga iniciada' },
  export_no_data:   {PL:'Brak danych do eksportu',EN:'No data to export',DE:'Keine Daten',    FR:'Aucune donnée',     IT:'Nessun dato',        ES:'Sin datos'         },
  export_games_count:{PL:'{n} meczów',        EN:'{n} games',         DE:'{n} Spiele',         FR:'{n} matchs',        IT:'{n} partite',        ES:'{n} partidos'      },
  export_events_count:{PL:'{n} zdarzeń',      EN:'{n} events',        DE:'{n} Ereignisse',     FR:'{n} événements',    IT:'{n} eventi',         ES:'{n} eventos'       },

  // Substitutions
  on_pitch:         {PL:'Na boisku',         EN:'On Pitch',           DE:'Auf dem Platz',      FR:'Sur le terrain',    IT:'In campo',           ES:'En el campo'       },
  benched:          {PL:'Zmieniony',          EN:'Benched',            DE:'Ausgewechselt',      FR:'Sur le banc',       IT:'In panchina',        ES:'En el banco'       },
  sub_off:          {PL:'Schodź ↓',          EN:'Sub Off ↓',          DE:'Auswechslung ↓',     FR:'Sortie ↓',          IT:'Uscita ↓',           ES:'Salida ↓'          },
  sub_on:           {PL:'Wejdź ↑',           EN:'Sub On ↑',           DE:'Einwechslung ↑',     FR:'Entrée ↑',          IT:'Entrata ↑',          ES:'Entrada ↑'         },
  on_pitch_mins:    {PL:'{m} min na boisku', EN:'{m} min on pitch',   DE:'{m} Min. im Spiel',  FR:'{m} min sur terrain',IT:'{m} min in campo',   ES:'{m} min en campo'  },
  period_time:      {PL:'Czas części',        EN:'Period time',        DE:'Abschnittszeit',     FR:'Temps de période',  IT:'Tempo periodo',      ES:'Tiempo período'    },
  // Progress – scope
  scope_label:      {PL:'Zakres analizy',     EN:'Analysis scope',     DE:'Analysebereich',     FR:"Périmètre d'analyse",IT:'Ambito analisi',    ES:'Ámbito de análisis'},
  scope_full:       {PL:'Cały mecz',          EN:'Full game',          DE:'Ganzes Spiel',       FR:'Match complet',     IT:'Partita intera',     ES:'Partido completo'  },
  scope_period:     {PL:'Wybrana część',      EN:'Selected period',    DE:'Gewählter Abschnitt',FR:'Période choisie',   IT:'Periodo scelto',     ES:'Período elegido'   },
  scope_range:      {PL:'Przedział minut',    EN:'Minute range',       DE:'Minutenbereich',     FR:'Plage de minutes',  IT:'Intervallo minuti',  ES:'Rango de minutos'  },
  compare_periods:  {PL:'Porównaj części',    EN:'Compare periods',    DE:'Abschnitte vergleichen',FR:'Comparer périodes',IT:'Confronta periodi', ES:'Comparar períodos' },
  ref_avg:          {PL:'Śr. z {n} meczów',  EN:'Avg of {n} games',   DE:'Ø aus {n} Spielen',  FR:'Moy. {n} matchs',   IT:'Media {n} partite',  ES:'Prom. {n} partidos'},
  // Export tab
  export_tab:       {PL:'Eksport',            EN:'Export',             DE:'Export',             FR:'Export',            IT:'Export',             ES:'Exportar'          },

  // Timing
  game_start_time:  {PL:'Start',             EN:'Started',          DE:'Gestartet',        FR:'Commencé',        IT:'Iniziato',          ES:'Iniciado'          },
  game_end_time:    {PL:'Koniec',            EN:'Ended',            DE:'Beendet',           FR:'Terminé',         IT:'Terminato',         ES:'Terminado'         },
  period_dur:       {PL:'Czas części',       EN:'Period duration',  DE:'Abschnittsdauer',   FR:'Durée période',   IT:'Durata periodo',    ES:'Duración período'  },
  // Targets
  targets_tab:      {PL:'Cele',              EN:'Targets',          DE:'Ziele',             FR:'Objectifs',       IT:'Obiettivi',         ES:'Objetivos'         },
  targets_title:    {PL:'Zaplanuj cele',     EN:'Set game targets', DE:'Ziele festlegen',   FR:'Fixer des objectifs',IT:'Imposta obiettivi',ES:'Establecer objetivos'},
  targets_subtitle: {PL:'Opcjonalnie – ustaw ile chcesz osiągnąć', EN:'Optional – set what you want to achieve', DE:'Optional – Ziele setzen', FR:'Optionnel – définir vos objectifs', IT:'Opzionale – imposta i tuoi obiettivi', ES:'Opcional – establece tus objetivos'},
  target_planned:   {PL:'Plan',              EN:'Plan',             DE:'Plan',              FR:'Objectif',        IT:'Piano',             ES:'Plan'              },
  target_actual:    {PL:'Wynik',             EN:'Result',           DE:'Ergebnis',          FR:'Résultat',        IT:'Risultato',         ES:'Resultado'         },
  target_hit:       {PL:'Cel osiągnięty ✓',  EN:'Target hit ✓',     DE:'Ziel erreicht ✓',   FR:'Objectif atteint ✓',IT:'Obiettivo raggiunto ✓',ES:'Objetivo logrado ✓'},
  target_missed:    {PL:'Cel nieosignięty ✗',EN:'Target missed ✗',  DE:'Ziel verfehlt ✗',   FR:'Objectif manqué ✗',IT:'Obiettivo mancato ✗',ES:'Objetivo fallido ✗'},
  targets_none:     {PL:'Brak celów dla tego meczu', EN:'No targets set for this game', DE:'Keine Ziele für dieses Spiel', FR:'Aucun objectif pour ce match', IT:'Nessun obiettivo per questa partita', ES:'Sin objetivos para este partido'},
  skip_targets:     {PL:'Pomiń',             EN:'Skip',             DE:'Überspringen',      FR:'Ignorer',         IT:'Salta',             ES:'Omitir'            },
  // Summary
  game_summary:     {PL:'Podsumowanie',      EN:'Summary',          DE:'Zusammenfassung',   FR:'Résumé',          IT:'Riepilogo',         ES:'Resumen'           },
  targets_vs_actual:{PL:'Cele vs. Wyniki',   EN:'Targets vs. Results',DE:'Ziele vs. Ergebnis',FR:'Objectifs vs. Résultats',IT:'Obiettivi vs. Risultati',ES:'Objetivos vs. Resultados'},
  all_targets_hit:  {PL:'Wszystkie cele osiągnięte! 🎉',EN:'All targets hit! 🎉',DE:'Alle Ziele erreicht! 🎉',FR:'Tous les objectifs atteints! 🎉',IT:'Tutti gli obiettivi raggiunti! 🎉',ES:'¡Todos los objetivos logrados! 🎉'},

  // Voice
  voice_on:         {PL:'Głos ON',            EN:'Voice ON',           DE:'Stimme AN',          FR:'Voix ON',           IT:'Voce ON',            ES:'Voz ON'            },
  voice_off:        {PL:'Głos OFF',           EN:'Voice OFF',          DE:'Stimme AUS',         FR:'Voix OFF',          IT:'Voce OFF',           ES:'Voz OFF'           },
  voice_hint:       {PL:'Mów nazwę statystyki', EN:'Say a stat name',   DE:'Statistikname sagen',FR:'Dites un nom de stat',IT:'Dì il nome di una stat',ES:'Di el nombre de una stat'},
  voice_unsupported:{PL:'Przeglądarka nie obsługuje głosu',EN:'Voice not supported in this browser',DE:'Stimme nicht unterstützt',FR:'Voix non supportée',IT:'Voce non supportata',ES:'Voz no soportada'},
  voice_heard:      {PL:'Usłyszano',          EN:'Heard',              DE:'Gehört',             FR:'Entendu',           IT:'Sentito',            ES:'Escuchado'         },

};

// ─── Translation helper ───────────────────────────────────────────
// Pass lang context down via React context
const LangCtx = createContext('PL');
const useLang = () => useContext(LangCtx);

function useT() {
  const lang = useLang();
  return (key, vars={}) => {
    const entry = TR[key];
    if (!entry) return key;
    let str = entry[lang] ?? entry['EN'] ?? key;
    Object.entries(vars).forEach(([k,v]) => { str = str.replace(`{${k}}`, v); });
    return str;
  };
}

// ─── Data (uses translation keys for names) ───────────────────────
const POSITIONS = [
  {num:1, code:'GK', nameKey:'pos_gk', area:'defence'},
  {num:2, code:'RB', nameKey:'pos_rb', area:'defence'},
  {num:3, code:'LB', nameKey:'pos_lb', area:'defence'},
  {num:4, code:'CB', nameKey:'pos_cb', area:'defence'},
  {num:5, code:'SW', nameKey:'pos_sw', area:'defence'},
  {num:6, code:'DM', nameKey:'pos_dm', area:'midfield'},
  {num:7, code:'RW', nameKey:'pos_rw', area:'midfield'},
  {num:8, code:'CM', nameKey:'pos_cm', area:'midfield'},
  {num:9, code:'CF', nameKey:'pos_cf', area:'attack'},
  {num:10,code:'10', nameKey:'pos_10', area:'attack'},
  {num:11,code:'LW', nameKey:'pos_lw', area:'attack'},
];
const posOf = n => POSITIONS.find(p=>p.num===n)||POSITIONS[0];

const DEFAULT_CATS = [
  {id:'passing',   nameKey:'cat_passing',   color:'#1565C0', measures:[
    {id:'passes_completed',  nameKey:'m_passes_completed',  active:true,  custom:false},
    {id:'passes_attempted',  nameKey:'m_passes_attempted',  active:true,  custom:false},
    {id:'key_passes',        nameKey:'m_key_passes',        active:true,  custom:false},
    {id:'long_passes',       nameKey:'m_long_passes',       active:false, custom:false},
    {id:'assists',           nameKey:'m_assists',           active:true,  custom:false},
  ]},
  {id:'shooting',  nameKey:'cat_shooting',  color:'#E64A19', measures:[
    {id:'goals',             nameKey:'m_goals',             active:true,  custom:false},
    {id:'shots_on_target',   nameKey:'m_shots_on_target',   active:true,  custom:false},
    {id:'shots_off_target',  nameKey:'m_shots_off_target',  active:true,  custom:false},
  ]},
  {id:'dribbling', nameKey:'cat_dribbling', color:'#2D8B2D', measures:[
    {id:'dribbles_completed',nameKey:'m_dribbles_completed',active:true,  custom:false},
    {id:'dribbles_attempted',nameKey:'m_dribbles_attempted',active:true,  custom:false},
  ]},
  {id:'defending', nameKey:'cat_defending', color:'#0F6E56', measures:[
    {id:'tackles_won',       nameKey:'m_tackles_won',       active:true,  custom:false},
    {id:'interceptions',     nameKey:'m_interceptions',     active:true,  custom:false},
    {id:'clearances',        nameKey:'m_clearances',        active:true,  custom:false},
    {id:'blocks',            nameKey:'m_blocks',            active:true,  custom:false},
  ]},
  {id:'physical',  nameKey:'cat_physical',  color:'#BA7517', measures:[
    {id:'headers_won',       nameKey:'m_headers_won',       active:true,  custom:false},
    {id:'duels_won',         nameKey:'m_duels_won',         active:true,  custom:false},
    {id:'fouls',             nameKey:'m_fouls',             active:false, custom:false},
  ]},
  {id:'general',   nameKey:'cat_general',   color:'#534AB7', measures:[
    {id:'touches',           nameKey:'m_touches',           active:false, custom:false},
    {id:'yellow_cards',      nameKey:'m_yellow_cards',      active:false, custom:false},
  ]},
];

const CAT_COLORS=['#1565C0','#E64A19','#2D8B2D','#0F6E56','#BA7517','#534AB7','#C62828','#0277BD','#558B2F','#6A1B9A'];

// Game types use translation keys
const GAME_TYPE_DEFS=[
  {id:'friendly',  labelKey:'friendly',  color:'#43A047'},
  {id:'league',    labelKey:'league',    color:'#1565C0'},
  {id:'tournament',labelKey:'tournament',color:'#E64A19'},
];
const DONATE_TIERS=[{emoji:'☕',labelKey:'Coffee',amount:5},{emoji:'🍺',labelKey:'Beer',amount:10},{emoji:'🍹',labelKey:'Drink',amount:30},{emoji:'🥂',labelKey:'Champagne',amount:50}];
const DONATE_TIER_LABELS={Coffee:{PL:'Kawa',EN:'Coffee',DE:'Kaffee',FR:'Café',IT:'Caffè',ES:'Café'},Beer:{PL:'Piwo',EN:'Beer',DE:'Bier',FR:'Bière',IT:'Birra',ES:'Cerveza'},Drink:{PL:'Drink',EN:'Drink',DE:'Drink',FR:'Boisson',IT:'Drink',ES:'Bebida'},Champagne:{PL:'Szampan',EN:'Champagne',DE:'Champagner',FR:'Champagne',IT:'Champagne',ES:'Champán'}};

// ─── Storage ──────────────────────────────────────────────────────
const feedKey=`gis_feedback_v5`;
const sg=async()=>null;

// ─── Data migration — safely upgrades old game records to current schema ─────
// Add new fields here whenever the game schema changes. Never remove old ones.
function migrateGame(g){
  return {
    // Core (always existed)
    id:          g.id          || String(Date.now()),
    date:        g.date        || new Date().toISOString().slice(0,10),
    name:        g.name        || '',
    type:        g.type        || 'friendly',
    totalMinutes:g.totalMinutes|| g.totalMins || 60,
    minutesPlayed:g.minutesPlayed != null ? g.minutesPlayed : 0,
    position:    g.position    || null,
    // v2+
    periods:     g.periods     || 1,
    metrics:     g.metrics     || {},
    // v3+  (events log — may not exist on old games)
    events:      g.events      || [],
    // v4+  (per-period counters)
    periodMetrics: g.periodMetrics || (g.periods>1 ? Array.from({length:g.periods||1},(_,i)=>i===0?{...(g.metrics||{})}:{}) : null),
    // v5+  (substitution log)
    subs:        g.subs        || [],
    // v6+  (targets, timestamps)
    targets:     g.targets     || {},
    startTime:   g.startTime   || g.start_time  || null,
    endTime:     g.endTime     || g.end_time     || null,
    periodLog:   g.periodLog   || g.period_log   || null,
  };
}
function migrateUserData(data){
  if(!data) return {games:[],categories:null,playerName:'',age:null,lang:'PL'};
  return {
    ...data,
    games: (data.games||[]).map(migrateGame),
  };
}
const ss=async()=>null;

// ─── Helpers ──────────────────────────────────────────────────────
const shortDt=iso=>new Date(iso).toLocaleDateString('pl-PL',{day:'numeric',month:'short'});
const fmtTimer=ms=>{const s=Math.floor(ms/1000),m=Math.floor(s/60),h=Math.floor(m/60);return h>0?`${h}:${String(m%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`:`${m}:${String(s%60).padStart(2,'0')}`;};
const gameTypeDef=id=>GAME_TYPE_DEFS.find(t=>t.id===id)||GAME_TYPE_DEFS[0];
const uid=()=>Math.random().toString(36).slice(2,10);

// ─── Period helpers ───────────────────────────────────────────────
function getPeriodName(periods, idx, t) {
  if (periods === 2) return t('period_name_half');
  if (periods === 3) return t('period_name_third');
  if (periods === 4) return t('period_name_quarter');
  return t('period_name_part');
}
// Returns the translation key for a period label given total period count
const periodKey=(periods,n)=>{
  if(periods===2) return 'half_n';
  if(periods===3) return 'third_n';
  if(periods===4) return 'quarter_n';
  return 'period_n';
};
// Sum an array of metric objects into a single flat object
const sumMetrics=arr=>arr.reduce((acc,m)=>{Object.entries(m||{}).forEach(([k,v])=>{acc[k]=(acc[k]||0)+v;});return acc;},{});

// ─── Style helpers ────────────────────────────────────────────────
const card=(x={})=>({background:G.card,borderRadius:16,border:`1px solid ${G.border}`,padding:'16px',...x});
const pill=(bg,color,x={})=>({background:bg,color,borderRadius:20,padding:'3px 10px',fontSize:11,fontWeight:700,display:'inline-block',...x});
const btnSt=(bg,fg='#fff',x={})=>({background:bg,color:fg,border:'none',borderRadius:10,padding:'12px 18px',fontFamily:'inherit',fontWeight:700,fontSize:15,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6,...x});
const inp=(x={})=>({width:'100%',padding:'12px 14px',border:`1px solid ${G.border}`,borderRadius:10,fontSize:15,fontFamily:'inherit',color:G.text,boxSizing:'border-box',...x});


// ─── Logo ─────────────────────────────────────────────────────────
const LOGO_B64 = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCADIAMgDASIAAhEBAxEB/8QAHAABAQACAwEBAAAAAAAAAAAAAAEHCAQFBgMC/8QARBAAAQMDAwIDBQYCBggHAAAAAQACAwQFEQYHEiExE0FRCBQiYXEyQlKBkaEVYiMzcoKSsRYXU6Kys8PwJCg2Y3R1wf/EABsBAQACAwEBAAAAAAAAAAAAAAABBAMFBgIH/8QAMxEAAgEDAgUACAYCAwAAAAAAAAECAwQRITEFEhNBYQYUIlFxkaGxI0KB0eHwMjRScsH/2gAMAwEAAhEDEQA/ANvFVEXg9FRREBUUVQBERAVFEQFREQBERAEREBUURAVFEQFRREBUREAREQHzVURAVFEQFQKKoCqIiAqIiAIiIAqooXND+Bc0PP3SRn9EB+kTzRAEUXyraqnoaKetq5WxU9PG6WV57NY0ZJ/QFNyG8as+yLqNG3Z1+0nar26MRGupWVHAfd5dcLtlMk4tpkRkpJSXcqIig9BERAEREB81VEUAqKIgKiIgCqiKQVFEQFVURAY13j1vVWaWKxWmYw1csQlqJ2/ajYchrW+hOCc+Qx6rEsVXJJL4skj3yE5L3OJcT9e673fqmqKTcN9TIHeDWU0T4neR4jg4fkR+4Xjqabt1XBcalUrXElJ6LZH1/wBHrKhR4fTlTWsllv3v+NjM+1Wr6qSvisdynfPHKCKaSQ5cxwGeJPmCAcZ7H6rKS1320imrdaWqOEElk4leR91rOpP/AH6rYgLfejtarUtmqjzh4T8HD+llpRt7xdJY5llrzl/cLAPtP7hxspn6Gs83OZ+Dc5GH7I7tg+pOC70GB5ldtvjvJS6ejn09peojqL0QWT1LCHMo/UDydJ8uzfPr0WFtkdOT6x3LooqnnPTU8nv1fI8l3JrHZw4nuXPwPnkruLCz5F6zW2Wq/v2PmnFeI9WSs7d5lLRv3eP3Nu9GW91p0hZrY8YfS0EMLh/MGDP75XbITkknz7qLTybk22dFCKjFRXYqIig9BERAEREB80UReQVVRMoCplTKICrjXU3EUMhtTaR9WB/RtqnObGfkS3JC5CIQ1lGFNS7q6503czQXrS1spZMZYecpZIPxMeHYcPp+eEt++0xcBXabiLfM09UQf0c0/wCaytqvT9s1NZZbVdYBJC/qx4HxxP8AJ7D5Efv2PRao6ms9XpvUVZZa0gzUsnHmBgSNIy14+RBBWjvp3Vs+aM8p/A0V7O6tJKSnmL+BsRYt2dI3ItZUT1FskPlVR/B/jbkfrhe5paiCqp2VFLPFPC8ZbJG8Oa76EdFp7QwVNRFLLTxOlELecoZ1cxv4iO/H1PYeeF3elNR3awVQqLVWyQZOXMzmOQfzN7H/AD+arU+OVKbXWjle9f3X6E0OKy06iNj9a6WtWrLV7hc2PaWEvgnj6SQuxjIPp6g9CsXHZO6sqsRahoXQZ6OfTvD8fQEjP5r3eiNwLXf7bNJWyQ26rpYjLUtkkAj8Noy6Rrj90eeeo/dYn3K9o+KJ8tv0LSNmIy03OrYeH1ji8/q7/Ct7R4fQ4slUhHm87fM6e29Kq/C6H4VXEX2wn8kzKNtoNJbW2KW43a6xQukHGSrqMB8uOvCNgyT/AGRknzWDt19+rpf2TWnSjZrTbHZZJUk4qZx8iP6tp9AeXzHZYf1BfrxqG5PuN8uVTcKt/eWd/IgegHZo+QwFwWnJ9V1dhwehaxSxt8jh+L+kd1xCpKWXru+7/b4I5MLZJpWRRMdJI9waxjRlziTgADzJK3N2I0ENDaRArWN/jNfxmriOvh4HwxA/ygnP8xPyXivZ02kfZhBq/VFNxuTm8qCjkHWmBH9Y8f7QjsPujr37Z3Vbid8qn4UNlv5LfBOFuh+PVXtPbx/Jcooi050ZUURAVFFUAREQHzRRF5BUURAVFFUAQIiAq129puGOHW9uqGgB9Rbhz+fGRwH7H9lsQtevapa5mp7HL911BI0fUS9f8wqXEI81Bmr4x/qt/D7mNrXX1VvrYa2iqJKephdzjlYcOaf+/wAj2KyNFZ6HXNinvOnqeKkv9G3lcbZEMMqB/tYR5E/h7Z6d8ZxNFJ816HRuoazTeoKS8URJfA74484ErD9ph+o/Q4Pkubgop8lRZi/p5RzttXjF8s/8X/co+wEVRTyU1QznFKwse3tkHoQsS3yhktV3qKGRxd4bvhcfvNPVp/RbK7w2aijnodYWXBtl6aJHcR0bKRyz8uQySPxBywVujCPeaGsA6vjdE4/2SCP+IrdejFWpYcRlaN+zP7pZT/VZ/qPd7R5cxfY8o1/VbNezPtNHFT0uuNTUwfNIBLa6SRvSNvlO8Hu492g9h8XcjGFdjNLRay3NtNnqo/Eog51TVt/FFGORb/ePFv8AeW+HHgA3hwAGAMYA+QXa8Su5QXSj33LfBrCM315rbYuUURaE6gqqiIAqoikFRTKICooikHzREXkBVREBUURAVFEQFWGPartj5tOWi8xtJFHVOhlPo2Vox/vMA/NZmXV6ssdJqTTddY67IgrIiwuA6sd3a8fMOAP5LHWh1IOJWvKHXoSpruaVRyLkwy4PdfrVFjummL7UWa7wGKpgPcfZkb5PYfNp8v07hcKN65ypSxozg/ahJxlo0Z00VIdQbA362S/HLaJXTQZ7tAxKP+oPzWA9yZg6koIwevN7vywFnzYWMs2w1pVy9IXsewE9jxp3E/8AEFrLrOu96ujYWnLaaMM/vHq7/wDB+S3PCbV1LyhU/wCKefql9zbXLboUm92vszgUFdWUE/j0NXUUsuC3xIJXRuwe4y0g4Xp9Obk66sNWyot2qboOJyY5qh00Tvk5jyQQvYaV9njXF608bvVS0Npc+Ey09JVFxnk6ZaHADEefmc9eoCw/kg4III6EHyXcRnSrNpYeCtOncW6UnmOdjfrZzW8WvtD0988FlPVte6nrYWE8WTNxnjnrxIIcM+uPJeyWFfY7tk9FtZUV8wIbcrlJLCD5sY1sefzc136LNK5u4jGFWUY7HYWk5ToxlPdoqZURYSwVFFUBUURAVFEUg+aKIoBUyoiAqZREAREQBERAed15o2x6ztPuN3gPNmTT1MeBLA4+bT6erT0P7rVPcLSNy0TqQ2aueyp5sEtNNEOk8ZJAPHuHZBBHr6rc4LC9qpaTXe69w15cJImaW02Pd6OaU4jnkiy50hJ6cGuLnk/2fmqtxRjUxjc03FbKFfl5V7be/jvn4HD19UDaz2bRapCxl4ujfA4Z6+NN8Up+jGDH5D1WNvZP28GptSyauvEHi2u1SjwGyDIqKruM+oZkOPzLR6rg61ud7393fhtWn2vZaaXMdK+Rp4QU4cPEqZB5Fxwcd/sN7rbXR2nrZpTTNDp+0RGOjoouDM/aee7nuPm5xJJPzW4xG0o8kf8AJ/RChQjXrKSXsQ0XnByNSXSCy6euV4qnhsNFSy1D3E/haT+5wPzWgO3+l7rrjV1HYbYw+PVO5TSkZbBGOr5HfJoP5nA81s37RF5u+ra6LaTRMBrLlUlk15ka7EdLCCC1kjuzcnDneeA0YJdhe42c21tG3NgNLSuFXc6kA11c5uHSkdmtH3WDyH5nr29UKvq1Jv8ANLYyXND1utGP5Y7/ALHrNOWiisFhobJbY/Do6GBkELT34tGMn5nqT8yVz1EVBtt5ZtEsLCP0iiKCSooqgCIiAIiID5plFEJKimUQFRFEIKiIhIRRfC4RTzUckVPM6GRwwHtPE/k7B4/UAkeXVAeP3Auc1zhrdOW24sttJEwm/Xh7w2O3wEZdG1x6eM8dMfcacnqWg4Wv1xvW7LYdutqbe63aGt5bDV3GVro4pg05+I9y3PxBn2nnq7A7Zbq9q6O+ugj1ddZrjbKd/OCy0TTS0DXZzyeA4yTPJ6lz3dSScdV762UNFbKCGgt1HT0dJA3jFBBGGRsHoAOgWWnKNJ828voik7eVSTcnjP293hfVnmtrdv7Ft5p4WqzxmSaUh9ZWSAeLUvHm70aOuGjoPmSSfT18MtTRywQ1c1HI9vETxBpfH828gRn0JBx3wvsqvEpOTy9y3GEYrlitDqdL6cs2maB9HZqJtO2WQyzyOcXy1Eh6mSWR2XPefUn9F2yIobb1ZKSSwiooigFREQFRREBcoiIAiIgPmiiISVFEQFXW6ovlBpywVl7ucjmUtJHzfxGXOOcNa0eZJIA+q7FYz9pilqqnaiqfTNc5tNVwTzhvlGCQT9AXNK8zeItowXVSVKjKcVqk2eXt2s94tbMluukrTQW+0te5sXiiMmQjy5yfbI8+IAz0Xvtvb1rat0zc6jV9mgttZSCRsD2jiZi1hJcY8kAAgYIOHdcDzPQaInrNS7GWu3aGvVPa7vSwwwSvLsGBzHf0gcACRyGSDjryXSbO6g1VcL3rWyajv010/hlDJG0uILA8Oexzm9B0OFgjlNZb1+RqqNRwnTcpylzrxy5xn9MHWaM1rvVq23S19ijtNXDDIIpC6CGM8+IdgBzgT0IXvNoNxqnVDbrbtRUcNuutpBfUloLWFgJa4kEniWkdRkjzCwntjedxrHoS63XScVKbPTSiStkfFHJIx/BuXBrjkgNwTgEdyva7R6bkuW2Wr9SwXP8AiN7vdHU07mNB5RPAc5zXer3kg9OmCMLxTlLK1ZUsbms5Qw5N4bedmvHfc5ztx9f64vVVSbb2uCG3Upw6rqWMJcPIuc/4WcsZDQCcd1ytO7l6s09q2n0zuXb4YDVFohrYmNaG8jhrjxPF7M9CRgt81+fZRvFsfpOusrZYo7lHWuqHROID5I3NaA4DzxxIPp09V1XtRV1HdLxp3Tltcypu7Jn8mRHk6PxODWMOOxJGcegypzJQ6nNqZerVjaq7VRuT7dt9sHr7frW/0m+tVou8y07rbM1xoeMAY8ZYHx5cO/QPb9Qun3w3QvWldV0tosEtKBFTNmqxLAJC5ziS1oz2+Ef7y4vtGUs9iv8ApLWtNkzUczaad48ywh7c/UeIF0ulbH/rOum4mpXRktnifT2zkOrX9Hx4+YZHGP75UTlPWCeufoK9evzTtoSfPnK/64z/AAZU3L1t/A9sRqa0yRCesZB7iZGh7cyYdkjzw3l+i7nbqsu9x0TarjfnxuuFXAJ5OEQjDQ8ksHEfylq1mo7xVa1s2iNvm+IHU9bJFLn8DnDj/hjMn6LbaKOOKJkUTQyJjQ1jR5NAwB+iy0pucnLsXbG5ldVXUT9lJLHnd/LYxtqjWV8t+9th0pTS04tdbHE6ZjoAXku8TOHdx9kLzuv91r7pXdSa1uFPPZKd0JlgEA8VzHRtLsP75ySR9ML867P/AJodJj/2YP8ArLr7xaaG/wDtNXKzXOLxaSqt7mSAdx/4VpDmnycDgg+oWKbm8pPuU69au+aMJYfUwvlt8DIO7msauybdU+pNM1dM/wB5qIRDM6ISMfG8OOcH6D6L1mkq2e5aVtNxqi11RVUUM0pa3iC5zATgeQyey1c1rU3rSlguW2d6DpoYK2Ost846NMfxZI/ldnOPJwcFszt5/wCgdPf/AFdN/wAtq90qjnN59xasrqVe4knphLK9zy8nfIoism2KiiICoiID5oiISEREAX4niingkgnjZLFI0sfG9vJrmkYIIPcEL9ogMPXv2f8AS9VcJKq03a52dkhyYIuMjGj0aXYcB8iSvS6E2401oWnroaSvqX1Vxg8CaarnY1xZ1wGs6AdTnzXM3qv9x0vtZf77aTxrqamHgP48vDc57Wc8fy8s/kFrLtJtda91LTWXi8bgPjvz6h7PdXhs04xjEj+bw5wdk44+nfyGWlawcXUeiNVOhQoVl0qa5nr7jZ7bbQdt0LZKu0UdVVV0FVN40nvbW/gDOOGgAggfuuLt9t5bdEXa4Vdmu1d7pXdXUMpYYoyDlpaQOWWgkA57Hqur2W0NqHQWlLtbL/qKS6l0knukQe4xU8TWEAtDvia52clvYYGPMrWPYbbV25093hk1FPav4dHC8FsPjeJzLhjq9uMcfn3XqFtTeXzaR74956ly0+lGNPXXCzsbL632S0xqK6vu1LUVllq5nF8ppWtMcjj3dxP2SfPiQD6LsNutpdNaOrxcoXVNzugz4dTVY/o89CWMb0BP4up+YWB9Nz6m2W31tuj5L9LdbRcJadkkRLgySKd3Fr+BJ4SNd16HrjzBXoN99car1buYzabQ9TJStbKKerlikMbp5ePJ4c8dWxMb3A7kHOegT1Fc6xjG+TFFWsW6rp4mnjHn7fqZ113p2061sE2nK6s8PnIyQGB7DLG5hyCGnPzHbsV+tvdJW/ROnm2W2zTzsE753zTAc3vcR3wMdAAB9FgOs9lyuprV73adZ+Le2N5sa+lMUT3+gkDi9vXs4j64Xo/Zb3Jvt5uFfoPV8s012trXPp55zmZzY3BkkUh+85hIw7uRnOcApK2hh1IPOCxCa66lVp4k1hPf9D3WmNqtPae11NqykrKt873zPjppOHhQmXOeOBnoCQM+qyCPs8vL18lpVZdFO3D371Xp515mtjWVdfUiZsZl+xPjjx5D8XfPkufrmyao9n/VNludo1XLcKasD5DEWujbKIy3nHJGXOa5pDhh3cfIhZVZQT5Yy1euMGGlcKjFuNPEc6tP/wANlr1oO23PcS261muFXHWW9jGx07eHhP488ZyM/fPb0SPQdsZua/XouNV76+LwjTnh4WPDEec45dhnv3Xh9ztk49xdUf6VN1VUWttTSQNbTCk8TiGs6HlzHU59FgTY/bd25N2vFDJqGe2C2xMkD2w+L4nJ5bjHIY7Z814ha0pwcnLbV6E1XyVFHpZy8rXdrubablbf2XXlLSsuMs9LPSuJiqabjz4n7TDkEFpOD8iPqvR2O3x2my0NqhkfJFR08dOx78cnBjQ0E46Z6LpdsNKDRGiaLTQuL7iKV0rveHx8C/m9z/s5OMZx38l6ZVnCKk2i/TpRUupy4k9yooiGYqIiEDKIiA/CIiEhERAEURAcLUAtZsVf/HBTm1+7Se+io/qvB4nny+WMrXe7+z3obUVpdqLb/WXu1M6MzQ+NK2op2dM4MmRJGB58skea2C1XYLXqjT9ZYb1TuqKCsYGzRtkLCcEEEEdQQQD+SwRWeyrZTWPdQ6zulPSPPxRSUkcj8enIOaD+bVZoTUPzYKlzTc8ewpL44Zx/ZB1hqG70+o9N3avnuFHQUQnpZJpDI6EkuYWB56lp7gHtg47rE+wdv3PuFRdxtpcmUMrI4ffi6eOPk0l3D7bTnB5dvVbdbabc6d2/sFRarEyZz6rrVVc5Dpp3cSBnAAAGThoGBk+ZJXTbK7SUG2M90lor3V3I3GOJjhPAyPh4ZcQRxJznl+yy+sQXO4rfGDArSo+mpPbOdTw+2WyeqjuDFrvcy9w3C4U8rZoYI5jM6SVowx0j8Boa3oQ1voOw7+KmuEO2vtd11z1Dyht1ZVTSCpcCQ2GpYeMvzDXHB9MO9FtsvI7m7c6Y3CtsdLf6WQTwZ92rKdwZPBnuAcEFp82kEfn1WOFzmT59msGWpaJRXT3Tzr3+J3Vx1Jp63WR97rb3b4bY1niGq94a5hb/ACkH4ifIDJK1s9msT6t9obUet6WmfDbW+9TEkYwah+I2H+bjycR8l3lN7KVkbXB9RrG5S0gOfCZRRskx/a5ED68VnLROlbFo2xQ2XT1C2kpI3cyM8nyvPd73Hq5xwOp+gwOic9OnBqDy2OSrVnFzWEvOcmn9os2sb9v9qyh0PeBabqKyvkdOal0H9EJ/ibyaCepLemPJfXb6wz6v3xZprdW+3N9fRvdGIaqUyGpkjPL3fm4/C1wy4YHxDtgkFbF6H2joNK7m3bXMF7q6qouXvHOlkgY1kfjSB5w4HJxjC+O6WzNo1xqmi1PFea2xXala0OqKOJrjIWEGN5yRhzewPmMDyCzu6i3jxv3KysZJZ3ec4zo0ZQGOmAAPIDsFq57EpzqvWH/xof8AnPW0FM2ZlPEyomE8zWASS8Azm7HV3EdBk9ceWVjnZ3aSg22ud1rqO91lydco2RvbNAyMM4vLsjievfCq05qNOcX3wXatKUqsJLZZMlIiLAWSoiIAiIgCIiA/KIiAIiIAiiqAiIiAKqIgKiIgCIiAIiICoiIAiIgKiiIChERAEREB+cIiIAiIgGEREAwiIgGEREAwmERAFURAEREAREQBERAVERAEREAREQH/2Q==";
const LOGO_SRC = `data:image/jpeg;base64,${LOGO_B64}`;

function GISLogo({size=40, dark=false}){
  if(dark){
    return(
      <div style={{width:size,height:size,borderRadius:Math.round(size*0.22),background:'white',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,overflow:'hidden',padding:2}}>
        <img src={LOGO_SRC} alt="Grow In Sport" style={{width:'100%',height:'100%',objectFit:'contain'}}/>
      </div>
    );
  }
  return <img src={LOGO_SRC} alt="Grow In Sport" style={{width:size,height:size,objectFit:'contain',flexShrink:0}}/>;
}

// ─── Language Selector ────────────────────────────────────────────
function LangSelector({lang, setLang}){
  const [open, setOpen] = useState(false);
  const cur = LANGS.find(l=>l.code===lang)||LANGS[0];
  return(
    <div style={{position:'relative'}}>
      <button onClick={()=>setOpen(o=>!o)} style={{
        background:'rgba(255,255,255,.15)',border:'1px solid rgba(255,255,255,.3)',
        borderRadius:8,padding:'6px 10px',color:'white',cursor:'pointer',
        display:'flex',alignItems:'center',gap:5,fontFamily:'inherit',fontSize:13,fontWeight:700,
      }}>
        <span style={{fontSize:16}}>{cur.flag}</span>
        <span>{cur.code}</span>
        <ChevronDown size={12} color="rgba(255,255,255,0.7)"/>
      </button>
      {open&&(
        <div style={{position:'absolute',top:'calc(100% + 6px)',right:0,background:G.card,border:`1px solid ${G.border}`,borderRadius:12,boxShadow:'0 4px 20px rgba(0,0,0,0.15)',zIndex:50,overflow:'hidden',minWidth:140}}>
          {LANGS.map(l=>(
            <button key={l.code} onClick={()=>{setLang(l.code);setOpen(false);}} style={{
              width:'100%',padding:'10px 14px',border:'none',
              background:l.code===lang?G.blueBg:G.card,
              color:l.code===lang?G.blue:G.text,
              display:'flex',alignItems:'center',gap:8,cursor:'pointer',
              fontFamily:'inherit',fontSize:14,fontWeight:l.code===lang?700:400,textAlign:'left',
              borderBottom:`1px solid ${G.border}`,
            }}>
              <span style={{fontSize:18}}>{l.flag}</span>
              <span>{l.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Shared App Header ────────────────────────────────────────────
function AppHeader({title,subtitle,right,onBack,lang,setLang}){
  return(
    <div style={{background:G.blue,padding:'12px 16px 14px',color:'white',flexShrink:0,display:'flex',alignItems:'center',gap:10}}>
      {onBack?(
        <button onClick={onBack} style={{background:'none',border:'none',cursor:'pointer',padding:4,flexShrink:0,display:'flex',alignItems:'center'}}>
          <ChevronLeft size={24} color="white"/>
        </button>
      ):(
        <GISLogo size={36} dark/>
      )}
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:onBack?17:18,fontWeight:900,color:'white',lineHeight:1.1,letterSpacing:-0.3,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{title}</div>
        {subtitle&&<div style={{fontSize:11,color:'rgba(255,255,255,0.65)',marginTop:1}}>{subtitle}</div>}
      </div>
      {/* Always show lang selector on right unless custom right widget passed */}
      {lang&&setLang&&!right&&<LangSelector lang={lang} setLang={setLang}/>}
      {right&&<div style={{flexShrink:0,display:'flex',alignItems:'center',gap:8}}>{right}{lang&&setLang&&<LangSelector lang={lang} setLang={setLang}/>}</div>}
    </div>
  );
}

// ─── Position Picker ──────────────────────────────────────────────
function PositionPicker({current,onSelect,onClose}){
  const t = useT();
  const areaKeys = {defence:'area_defence', midfield:'area_midfield', attack:'area_attack'};
  return(
    <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.6)',zIndex:30,display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
      <div style={{background:G.card,borderRadius:'20px 20px 0 0',padding:'20px',maxHeight:'72vh',overflowY:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <div style={{fontSize:16,fontWeight:700,color:G.blue}}>{t('change_position')}</div>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer'}}><X size={22} color={G.sub}/></button>
        </div>
        {['defence','midfield','attack'].map(area=>(
          <div key={area} style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:G.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>{t(areaKeys[area])}</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {POSITIONS.filter(p=>p.area===area).map(p=>(
                <button key={p.num} onClick={()=>onSelect(p.num)} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 14px',border:`2px solid ${current===p.num?G.orange:G.border}`,borderRadius:12,background:current===p.num?G.orangeBg:G.card,cursor:'pointer',fontFamily:'inherit'}}>
                  <span style={{background:current===p.num?G.orange:G.muted,color:'white',borderRadius:6,width:24,height:24,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:900}}>{p.num}</span>
                  <div><div style={{fontSize:13,fontWeight:700,color:current===p.num?G.orange:G.text}}>{p.code}</div><div style={{fontSize:11,color:G.sub}}>{t(p.nameKey)}</div></div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Feedback Screen ──────────────────────────────────────────────
function FeedbackScreen({username,onClose,lang,setLang}){
  const t = useT();
  const feedbackCats = TR.feedback_cats[lang]||TR.feedback_cats['EN'];
  const feedbackStars = TR.feedback_stars[lang]||TR.feedback_stars['EN'];
  const [stars,    setStars]    =useState(0);
  const [hovered,  setHovered]  =useState(0);
  const [category, setCategory] =useState(feedbackCats[0]);
  const [message,  setMessage]  =useState('');
  const [submitted,setSubmitted]=useState(false);
  const [loading,  setLoading]  =useState(false);
  const [error,    setError]    =useState('');

  const submit=async()=>{
    if(!stars){setError(t('give_rating'));return;}
    if(!message.trim()){setError(t('write_msg'));return;}
    setLoading(true);setError('');
    try{
      const res=await fetch('https://formspree.io/f/REPLACE_WITH_YOUR_ID',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          user:     username,
          stars,
          category,
          message:  message.trim(),
          lang,
          date:     new Date().toISOString(),
        }),
      });
      if(!res.ok) throw new Error('Failed');
      setSubmitted(true);
    }catch{setError(t('send_error'));}
    setLoading(false);
  };

  if(submitted) return(
    <div style={{minHeight:'100vh',background:G.bg,display:'flex',flexDirection:'column'}}>
      <AppHeader title={t('feedback_title')} onBack={onClose} lang={lang} setLang={setLang}/>
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:32,textAlign:'center'}}>
        <div style={{fontSize:72,marginBottom:16}}>🙏</div>
        <div style={{fontSize:22,fontWeight:900,color:G.blue,marginBottom:8}}>{t('feedback_thanks')}</div>
        <div style={{fontSize:15,color:G.sub,lineHeight:1.7,marginBottom:32}}>{t('feedback_thanks_msg')}</div>
        <button onClick={onClose} style={{...btnSt(G.green),padding:'14px 32px',fontSize:16,borderRadius:14}}>{t('back_to_app')}</button>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:'100vh',background:G.bg,display:'flex',flexDirection:'column'}}>
      <AppHeader title={t('feedback_title')} subtitle={t('feedback_sub')} onBack={onClose} lang={lang} setLang={setLang}/>
      <div style={{padding:'20px 16px 60px',overflowY:'auto'}}>
        <div style={{...card(),marginBottom:16,textAlign:'center'}}>
          <div style={{fontSize:15,fontWeight:700,color:G.text,marginBottom:16}}>{t('feedback_rate')}</div>
          <div style={{display:'flex',justifyContent:'center',gap:10}}>
            {[1,2,3,4,5].map(n=>(
              <button key={n} onMouseEnter={()=>setHovered(n)} onMouseLeave={()=>setHovered(0)} onClick={()=>setStars(n)}
                style={{background:'none',border:'none',cursor:'pointer',padding:4,fontSize:36,lineHeight:1,filter:n<=(hovered||stars)?'none':'grayscale(1) opacity(0.3)'}}>★</button>
            ))}
          </div>
          {stars>0&&<div style={{fontSize:13,color:G.sub,marginTop:10}}>{feedbackStars[stars]}</div>}
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:G.sub,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>{t('feedback_cat')}</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {feedbackCats.map(c=>(
              <button key={c} onClick={()=>setCategory(c)} style={{padding:'6px 14px',border:`2px solid ${category===c?G.blue:G.border}`,borderRadius:20,background:category===c?G.blueBg:G.card,color:category===c?G.blue:G.sub,fontWeight:600,fontSize:13,cursor:'pointer',fontFamily:'inherit'}}>{c}</button>
            ))}
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:12,fontWeight:700,color:G.sub,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>{t('feedback_msg')}</div>
          <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder={t('feedback_ph')} rows={5} style={{...inp({resize:'vertical',lineHeight:1.6,fontSize:14})}}/>
          <div style={{fontSize:11,color:G.muted,marginTop:4,textAlign:'right'}}>{message.length} {t('chars_label')}</div>
        </div>
        {error&&<div style={{color:G.red,fontSize:13,marginBottom:14,background:G.redBg,padding:'8px 12px',borderRadius:8}}>{error}</div>}
        <button onClick={submit} disabled={!!loading} style={{...btnSt(loading?G.muted:G.blue),width:'100%',padding:'16px',fontSize:16,borderRadius:14}}>
          <Send size={18}/> {loading?t('sending'):t('send_feedback')}
        </button>
      </div>
    </div>
  );
}

// ─── Auth Screen ──────────────────────────────────────────────────
function AuthScreen({onLogin,lang,setLang}){
  const t = useT();
  const [tab,    setTab]   =useState('login');
  const [user,   setUser]  =useState('');
  const [pin,    setPin]   =useState('');
  const [error,  setError] =useState('');
  const [loading,setLoading]=useState(false);

  const submit=async()=>{
    const u=user.trim().toLowerCase();
    setError('');
    if(!u){setError(t('enter_username'));return;}
    if(pin.length<6){setError(t('err_pin_short'));return;}
    if(tab==='register'&&u.length<2){setError(t('err_user_short'));return;}
    setLoading(true);
    try{
      if(tab==='login'){
        await sbSignIn(u, pin);
      } else {
        await sbSignUp(u, pin);
      }
      onLogin(u);
    }catch(err){
      const msg = err?.message||'';
      if(msg.includes('Invalid login'))           setError(t('err_wrong_pin'));
      else if(msg.includes('already registered')) setError(t('err_user_taken'));
      else if(msg.includes('User already'))       setError(t('err_user_taken'));
      else { setError(t('err_generic')); console.error('Auth error:',err); }
    }
    setLoading(false);
  };

  return(
    <div style={{minHeight:'100vh',background:G.bg,display:'flex',flexDirection:'column'}}>
      <div style={{background:G.blue,padding:'36px 16px 32px',textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',position:'relative'}}>
        <div style={{position:'absolute',top:14,right:16}}><LangSelector lang={lang} setLang={setLang}/></div>
        <GISLogo size={80} dark/>
        <div style={{fontSize:26,fontWeight:900,color:'white',marginTop:14,letterSpacing:-0.5}}>Grow In Sport</div>
        <div style={{fontSize:13,color:'rgba(255,255,255,0.65)',marginTop:4}}>{t('app_subtitle')}</div>
      </div>
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px 16px'}}>
        <div style={{width:'100%',maxWidth:360}}>
          <div style={{display:'flex',background:G.grayL,borderRadius:12,padding:4,marginBottom:24}}>
            {[['login',t('sign_in')],['register',t('register')]].map(([m,l])=>(
              <button key={m} onClick={()=>{setTab(m);setError('');}} style={{flex:1,padding:'10px',border:'none',borderRadius:9,background:tab===m?G.card:'transparent',color:tab===m?G.blue:G.sub,fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'inherit',boxShadow:tab===m?'0 1px 4px rgba(0,0,0,.1)':'none'}}>{l}</button>
            ))}
          </div>
          <div style={card({padding:'24px'})}>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:13,fontWeight:700,color:G.text,display:'block',marginBottom:6}}>{t('username')}</label>
              <input value={user} onChange={e=>setUser(e.target.value)} placeholder="tommy_fc" onKeyDown={e=>e.key==='Enter'&&submit()} style={inp()}/>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{fontSize:13,fontWeight:700,color:G.text,display:'block',marginBottom:6}}>{t('pin_label')}</label>
              <input type="password" inputMode="numeric" value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="••••••" onKeyDown={e=>e.key==='Enter'&&submit()} style={inp({letterSpacing:6,fontSize:22,fontFamily:'monospace'})}/>
            </div>
            {error&&<div style={{color:G.red,fontSize:13,marginBottom:14,background:G.redBg,padding:'8px 12px',borderRadius:8}}>{error}</div>}
            <button onClick={submit} disabled={!!loading} style={{...btnSt(loading?G.muted:G.green),width:'100%',padding:'14px',fontSize:16}}>
              {loading?t('loading'):tab==='login'?t('sign_in'):t('create_account')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── Helper: get translated cat/measure name ──────────────────────
function useCatName(cat){ const t=useT(); return cat.custom ? cat.name : t(cat.nameKey); }
function useMeasName(m){ const t=useT(); return m.custom ? m.name : t(m.nameKey); }

// ─── Game Card ────────────────────────────────────────────────────
function GameCard({game,categories,onDelete,onEdit,onAnalyse,onSummary}){
  const t=useT();
  const typeDef=gameTypeDef(game.type);
  const typeLabel=t(typeDef.labelKey);
  const pos=game.position?posOf(game.position):null;
  const highlights=[];
  for(const cat of categories)
    for(const m of cat.measures)
      if(m.active&&game.metrics?.[m.id]){
        const mName=m.custom?m.name:t(m.nameKey);
        highlights.push({name:mName,val:game.metrics[m.id],color:cat.color});
      }
  highlights.sort((a,b)=>b.val-a.val);
  return(
    <div onClick={onSummary?()=>onSummary(game):undefined} style={{...card(),marginBottom:10,cursor:onSummary?'pointer':'default'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
        <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
          <span style={pill(typeDef.color+'22',typeDef.color)}>{typeLabel}</span>
          {game.name&&<span style={{fontSize:14,fontWeight:700,color:G.text}}>{game.name}</span>}
          <span style={{fontSize:12,color:G.sub}}>{shortDt(game.date)}</span>
          {game.periods>1&&<span style={pill(G.blueBg,G.blue,{fontSize:10})}>{t('period_'+game.periods)}</span>}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {pos&&<span style={{background:G.orange,color:'white',borderRadius:6,padding:'2px 7px',fontSize:11,fontWeight:700}}>#{pos.num} {pos.code}</span>}
          <span style={{fontSize:12,color:G.sub,display:'flex',alignItems:'center',gap:2}}><Timer size={12}/>{game.minutesPlayed}m</span>
          {onAnalyse&&<button onClick={e=>{e.stopPropagation();onAnalyse(game);}} title="Analyse" style={{background:'none',border:'none',cursor:'pointer',padding:2}}><BarChart2 size={13} color={G.green}/></button>}
          {onEdit&&<button onClick={e=>{e.stopPropagation();onEdit(game);}} style={{background:'none',border:'none',cursor:'pointer',padding:2}}><Pencil size={13} color={G.blueL}/></button>}
          {onDelete&&<button onClick={e=>{e.stopPropagation();onDelete(game.id);}} style={{background:'none',border:'none',cursor:'pointer',padding:2}}><Trash2 size={13} color={G.muted}/></button>}
        </div>
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
        {highlights.slice(0,6).map(h=><span key={h.name} style={pill(h.color+'18',h.color)}>{h.name}: {h.val}</span>)}
        {highlights.length===0&&<span style={{color:G.muted,fontSize:13}}>{t('no_stats')}</span>}
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────
function Dashboard({games,categories,playerName,age,onStartGame,onDonate,onFeedback,onEdit,onAnalyse,onSummary,lang,setLang}){
  const t=useT();
  const totalMins=games.reduce((s,g)=>s+(g.minutesPlayed||0),0);
  const goalsTotal=games.reduce((s,g)=>s+(g.metrics?.goals||0),0);
  const recent=[...games].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,3);
  const now=new Date();
  const monthly=games.filter(g=>{const d=new Date(g.date);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();});
  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      <AppHeader title="Grow In Sport" subtitle={t('app_subtitle')+` · ${playerName}${age?` · ${t('years_old',{n:age})}`:''}` }
        right={<button onClick={onFeedback} style={{background:'rgba(255,255,255,.15)',border:'1px solid rgba(255,255,255,.3)',borderRadius:8,padding:'6px 10px',color:'white',cursor:'pointer',display:'flex',alignItems:'center',gap:5,fontFamily:'inherit',fontSize:12,fontWeight:600}}><MessageSquare size={13}/> {t('feedback_btn')}</button>}
        lang={lang} setLang={setLang}/>
      <div style={{flex:1,overflowY:'auto',padding:'16px 16px 90px'}}>
        <button onClick={onStartGame} style={{...btnSt(G.green),width:'100%',padding:'18px',fontSize:17,borderRadius:14,marginBottom:16,boxShadow:'0 6px 16px rgba(45,139,45,0.28)'}}>
          <Play size={20} fill="#fff"/> {t('start_new_game')}
        </button>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:16}}>
          {[{l:t('games_count'),v:games.length},{l:t('minutes'),v:totalMins},{l:t('goals')+' ⚽',v:goalsTotal}].map(s=>(
            <div key={s.l} style={{...card(),padding:'14px',textAlign:'center'}}>
              <div style={{fontSize:26,fontWeight:900,color:G.blue}}>{s.v}</div>
              <div style={{fontSize:11,color:G.sub,marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>
        {monthly.length>0&&(
          <div style={{...card(),marginBottom:14,background:G.blue}}>
            <div style={{fontSize:12,color:'rgba(255,255,255,.65)',marginBottom:4}}>{t('this_month')}</div>
            <div style={{fontSize:15,fontWeight:700,color:'white'}}>
              {monthly.length} {t('games_and_min',{m:monthly.reduce((s,g)=>s+(g.minutesPlayed||0),0)})}
            </div>
          </div>
        )}
        {recent.length>0&&(<><div style={{fontSize:15,fontWeight:700,color:G.text,marginBottom:10}}>{t('recent_games')}</div>{recent.map(g=><GameCard key={g.id} game={g} categories={categories} onEdit={onEdit} onAnalyse={onAnalyse} onSummary={onSummary}/>)}</>)}
        {games.length===0&&(
          <div style={{...card(),textAlign:'center',padding:'40px 20px'}}>
            <Trophy size={44} color={G.muted} style={{marginBottom:12}}/>
            <div style={{fontSize:16,fontWeight:700,color:G.sub}}>{t('no_games_yet')}</div>
            <div style={{fontSize:13,color:G.muted,marginTop:4}}>{t('no_games_hint')}</div>
          </div>
        )}
        <button onClick={onDonate} style={{width:'100%',marginTop:16,padding:'14px',border:`1px solid ${G.border}`,borderRadius:14,background:G.card,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
          <Heart size={14} color="#C62828"/>
          <span style={{fontSize:14,fontWeight:700,color:G.sub}}>{t('donate_nudge')}</span>
          <span style={{fontSize:11,color:G.muted}}>ko-fi.com/luckyluk ↗</span>
        </button>
      </div>
    </div>
  );
}

// ─── Games List ───────────────────────────────────────────────────
// ─── Games List ───────────────────────────────────────────────────
function GamesList({games,categories,onStartGame,onDelete,onEdit,onAnalyse,onCompare,onSummary,lang,setLang}){
  const t=useT();
  const [selectMode, setSelectMode] = useState(false);
  const [selected,   setSelected]   = useState(new Set());

  const sorted=[...games].sort((a,b)=>new Date(b.date)-new Date(a.date));

  const toggleSel = id => setSelected(s=>{
    const n=new Set(s);
    n.has(id)?n.delete(id):n.add(id);
    return n;
  });
  const clearSel = () => { setSelected(new Set()); setSelectMode(false); };
  const selGames = sorted.filter(g=>selected.has(g.id));

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      <AppHeader title={t('all_games')}
        right={
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <button onClick={()=>{setSelectMode(s=>!s);setSelected(new Set());}}
              style={{...btnSt(selectMode?G.orange:G.grayL, selectMode?'white':G.sub),
                padding:'7px 12px',fontSize:13,borderRadius:10}}>
              {selectMode?'✕ Cancel':'☑ Select'}
            </button>
            {!selectMode&&<button onClick={onStartGame} style={{...btnSt(G.greenL),padding:'7px 12px',fontSize:13,borderRadius:10}}><Plus size={15}/> {t('new_btn')}</button>}
          </div>
        }
        lang={lang} setLang={setLang}/>

      <div style={{flex:1,overflowY:'auto',padding:'12px 12px 120px'}}>
        {sorted.length===0?(
          <div style={{...card(),textAlign:'center',padding:'48px 20px'}}>
            <Trophy size={44} color={G.muted} style={{marginBottom:12}}/>
            <div style={{fontSize:16,fontWeight:700,color:G.sub}}>{t('no_games_yet')}</div>
          </div>
        ):sorted.map(g=>{
          const isSel = selected.has(g.id);
          return(
            <div key={g.id} style={{position:'relative',marginBottom:10}}>
              {selectMode&&(
                <div onClick={()=>toggleSel(g.id)}
                  style={{position:'absolute',left:0,top:0,bottom:0,width:'100%',zIndex:5,cursor:'pointer',borderRadius:16,
                    border:`3px solid ${isSel?G.green:G.border}`,
                    boxShadow:isSel?`0 0 0 2px ${G.green}44`:'none',
                    background:isSel?G.green+'08':'transparent',
                    display:'flex',alignItems:'center',justifyContent:'flex-end',padding:'0 14px',
                  }}>
                  <div style={{width:26,height:26,borderRadius:6,border:`2px solid ${isSel?G.green:G.border}`,
                    background:isSel?G.green:'white',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    {isSel&&<Check size={15} color="white"/>}
                  </div>
                </div>
              )}
              <GameCard game={g} categories={categories}
                onDelete={!selectMode?onDelete:null}
                onEdit={!selectMode?onEdit:null}
                onAnalyse={!selectMode?onAnalyse:null}
                onSummary={!selectMode?onSummary:null}/>
            </div>
          );
        })}
      </div>

      {/* ── Selection action bar ── */}
      {selectMode&&(
        <div style={{
          position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',
          width:'100%',maxWidth:520,
          background:G.card,borderTop:`2px solid ${G.border}`,
          padding:'12px 14px 20px',zIndex:200,
        }}>
          {selected.size===0?(
            <div style={{textAlign:'center',fontSize:14,color:G.muted,padding:'6px 0'}}>
              Tap games to select them
            </div>
          ):(
            <>
              <div style={{fontSize:12,fontWeight:700,color:G.sub,marginBottom:10,textAlign:'center'}}>
                {selected.size} game{selected.size!==1?'s':''} selected
              </div>
              <div style={{display:'grid',gridTemplateColumns:selected.size===1?'1fr 1fr 1fr':'1fr 1fr',gap:8}}>
                {selected.size===1&&(
                  <button onClick={()=>{onAnalyse(selGames[0]);clearSel();}}
                    style={{...btnSt(G.blue),padding:'11px 6px',borderRadius:12,flexDirection:'column',gap:3,fontSize:12}}>
                    <BarChart2 size={18}/>
                    <span>Periods</span>
                  </button>
                )}
                <button onClick={()=>{onCompare({mode:'vs_all',   games:selGames});clearSel();}}
                  style={{...btnSt(G.green),padding:'11px 6px',borderRadius:12,flexDirection:'column',gap:3,fontSize:12}}>
                  <TrendingUp size={18}/>
                  <span>vs All games</span>
                </button>
                <button onClick={()=>{onCompare({mode:'vs_select',games:selGames,allGames:sorted});clearSel();}}
                  style={{...btnSt(G.orange),padding:'11px 6px',borderRadius:12,flexDirection:'column',gap:3,fontSize:12}}>
                  <List size={18}/>
                  <span>vs Selection</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── New Game Setup ───────────────────────────────────────────────
function NewGameSetup({categories,onStart,onBack,lang,setLang}){
  const t=useT();
  const [step,      setStep]     = useState('setup'); // 'setup'|'targets'
  const [type,      setType]     = useState('friendly');
  const [name,      setName]     = useState('');
  const [totalMins, setTotalMins]= useState(60);
  const [customMin, setCustomMin]= useState('');
  const [date,      setDate]     = useState(new Date().toISOString().slice(0,10));
  const [position,  setPosition] = useState(9);
  const [showPos,   setShowPos]  = useState(false);
  const [periods,   setPeriods]  = useState(2);
  const [targets,   setTargets]  = useState({});

  const effectiveMins=customMin!==''?(parseInt(customMin)||0):totalMins;
  const pos=posOf(position);
  const activeCats=categories.filter(c=>c.measures.some(m=>m.active));
  const allActiveMeas=activeCats.flatMap(c=>c.measures.filter(m=>m.active).map(m=>({...m,catColor:c.color})));

  const setTarget=(id,val)=>setTargets(ts=>val===''?Object.fromEntries(Object.entries(ts).filter(([k])=>k!==id)):{...ts,[id]:parseInt(val)||0});

  if(step==='targets') return(
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      <AppHeader title={t('targets_title')} subtitle={t('targets_subtitle')} onBack={()=>setStep('setup')} lang={lang} setLang={setLang}/>
      <div style={{flex:1,overflowY:'auto',padding:'16px 16px 90px'}}>
        <div style={{...card(),marginBottom:16,background:G.blueBg,border:`1px solid ${G.blue}33`}}>
          <div style={{fontSize:13,color:G.blue,lineHeight:1.7}}>
            Set targets for today's game. After the game you'll see how you did vs your plan. Leave blank to skip any metric.
          </div>
        </div>
        {activeCats.map(cat=>{
          const catName=cat.custom?cat.name:t(cat.nameKey);
          const meas=cat.measures.filter(m=>m.active);
          return(
            <div key={cat.id} style={{...card(),marginBottom:12}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
                <div style={{width:10,height:10,borderRadius:2,background:cat.color}}/>
                <div style={{fontSize:14,fontWeight:700,color:G.text}}>{catName}</div>
              </div>
              {meas.map(m=>{
                const mName=m.custom?m.name:t(m.nameKey);
                return(
                  <div key={m.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0',borderTop:`1px solid ${G.border}`}}>
                    <span style={{fontSize:13,color:G.text}}>{mName}</span>
                    <input type="number" min={0} max={99} value={targets[m.id]??''}
                      onChange={e=>setTarget(m.id,e.target.value)}
                      placeholder="—"
                      style={{width:64,padding:'6px 8px',border:`2px solid ${targets[m.id]!=null?cat.color:G.border}`,borderRadius:8,
                        fontSize:16,fontWeight:700,textAlign:'center',fontFamily:'inherit',color:cat.color,
                        background:targets[m.id]!=null?cat.color+'10':'white'}}/>
                  </div>
                );
              })}
            </div>
          );
        })}
        <div style={{display:'flex',gap:10,marginTop:4}}>
          <button onClick={()=>onStart({type,name:name.trim(),totalMins:effectiveMins,date,position,periods,targets:{}})}
            style={{...btnSt(G.grayL,G.sub),flex:1,padding:'14px',fontSize:15,borderRadius:14}}>
            {t('skip_targets')}
          </button>
          <button onClick={()=>onStart({type,name:name.trim(),totalMins:effectiveMins,date,position,periods,targets})}
            style={{...btnSt(G.green),flex:2,padding:'14px',fontSize:15,borderRadius:14,boxShadow:'0 4px 12px rgba(45,139,45,.25)'}}>
            <Play size={18} fill="#fff"/> {t('start_tracking')}
          </button>
        </div>
      </div>
    </div>
  );

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      <AppHeader title={t('new_game')} onBack={onBack} lang={lang} setLang={setLang}/>
      <div style={{flex:1,overflowY:'auto',padding:'16px 16px 90px'}}>
        <div style={{marginBottom:18}}>
          <div style={{fontSize:12,fontWeight:700,color:G.sub,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>{t('game_name_opt')}</div>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder={t('game_name_ph')} style={inp()}/>
        </div>
        <div style={{marginBottom:18}}>
          <div style={{fontSize:12,fontWeight:700,color:G.sub,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>{t('type_label')}</div>
          <div style={{display:'flex',gap:8}}>
            {GAME_TYPE_DEFS.map(td=>(
              <button key={td.id} onClick={()=>setType(td.id)} style={{flex:1,padding:'12px 6px',border:`2px solid ${type===td.id?td.color:G.border}`,borderRadius:12,background:type===td.id?td.color+'18':G.card,color:type===td.id?td.color:G.sub,fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'inherit'}}>{t(td.labelKey)}</button>
            ))}
          </div>
        </div>
        <div style={{marginBottom:18}}>
          <div style={{fontSize:12,fontWeight:700,color:G.sub,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>{t('date_label')}</div>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={inp()}/>
        </div>
        <div style={{marginBottom:18}}>
          <div style={{fontSize:12,fontWeight:700,color:G.sub,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>{t('duration_label',{m:effectiveMins})}</div>
          <div style={{display:'flex',gap:6,marginBottom:8}}>
            {[30,40,60,80,90].map(m=>(
              <button key={m} onClick={()=>{setTotalMins(m);setCustomMin('');}} style={{flex:1,padding:'9px 2px',border:`2px solid ${totalMins===m&&customMin===''?G.blue:G.border}`,borderRadius:10,background:totalMins===m&&customMin===''?G.blueBg:G.card,color:totalMins===m&&customMin===''?G.blue:G.sub,fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>{m}m</button>
            ))}
          </div>
          <input type="number" min={1} max={200} value={customMin} onChange={e=>setCustomMin(e.target.value)} placeholder={t('custom_min_ph')} style={inp({fontSize:14})}/>
        </div>
        <div style={{marginBottom:18}}>
          <div style={{fontSize:12,fontWeight:700,color:G.sub,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>{t('periods_label')} {periods>1&&effectiveMins>0&&<span style={{fontWeight:400,marginLeft:6,color:G.blue}}>· ~{Math.round(effectiveMins/periods)} min each</span>}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:8}}>
            {[[1,t('periods_none')],[2,t('periods_2')],[3,t('periods_3')],[4,t('periods_4')]].map(([v,lbl])=>(
              <button key={v} onClick={()=>setPeriods(v)} style={{padding:'12px 4px',textAlign:'center',border:`2px solid ${periods===v?G.blue:G.border}`,borderRadius:12,background:periods===v?G.blueBg:G.card,color:periods===v?G.blue:G.sub,fontWeight:700,fontSize:11,cursor:'pointer',fontFamily:'inherit',lineHeight:1.3}}>{lbl}</button>
            ))}
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:12,fontWeight:700,color:G.sub,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>{t('position_label')}</div>
          <button onClick={()=>setShowPos(s=>!s)} style={{width:'100%',padding:'14px',border:`2px solid ${G.border}`,borderRadius:12,background:G.card,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:12}}>
            <span style={{background:G.orange,color:'white',borderRadius:8,width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:900,flexShrink:0}}>{pos.num}</span>
            <div style={{textAlign:'left'}}><div style={{fontSize:15,fontWeight:700,color:G.text}}>{pos.code} — {t(pos.nameKey)}</div><div style={{fontSize:12,color:G.sub}}>{t('tap_to_change')}</div></div>
            <ChevronDown size={18} color={G.muted} style={{marginLeft:'auto'}}/>
          </button>
          {showPos&&(
            <div style={{...card(),marginTop:8,padding:'16px'}}>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {POSITIONS.map(p=>(
                  <button key={p.num} onClick={()=>{setPosition(p.num);setShowPos(false);}} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 10px',border:`2px solid ${position===p.num?G.orange:G.border}`,borderRadius:10,background:position===p.num?G.orangeBg:G.card,cursor:'pointer',fontFamily:'inherit'}}>
                    <span style={{background:position===p.num?G.orange:G.muted,color:'white',borderRadius:5,width:20,height:20,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:900}}>{p.num}</span>
                    <span style={{fontSize:12,fontWeight:700,color:G.text}}>{p.code}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <button onClick={()=>setStep('targets')} style={{...btnSt(G.green),width:'100%',padding:'18px',fontSize:17,borderRadius:14,boxShadow:'0 6px 16px rgba(45,139,45,0.28)'}}>
          Next: Set targets →
        </button>
      </div>
    </div>
  );
}

// ─── Voice keyword map builder ────────────────────────────────────
// Builds a map from every word/alias → metricId for the active measures
function buildVoiceMap(categories, lang){
  const map = {};
  const add = (phrase, id) => {
    const key = phrase.toLowerCase().trim();
    if(key) map[key] = id;
  };
  // Built-in aliases per language for common metrics
  const ALIASES = {
    goals:              {PL:['gol','gole','bramka','bramki'],    EN:['goal','goals'],          DE:['tor','tore'],         FR:['but','buts'],          IT:['gol','rete'],         ES:['gol','goles']},
    passes_completed:   {PL:['podanie','podania','pas'],         EN:['pass','passes'],         DE:['pass','pässe'],       FR:['passe','passes'],      IT:['passaggio','passaggi'],ES:['pase','pases']},
    assists:            {PL:['asysta','asysty'],                 EN:['assist','assists'],      DE:['vorlage','vorlagen'], FR:['passe décisive'],      IT:['assist'],             ES:['asistencia']},
    shots_on_target:    {PL:['strzał','strzały','strzał celny'],EN:['shot','shots','on target'],DE:['schuss','schüsse'], FR:['tir','tirs'],          IT:['tiro','tiri'],        ES:['disparo','tiros']},
    tackles_won:        {PL:['odbiór','odbior','odbiory'],      EN:['tackle','tackles'],      DE:['zweikampf'],          FR:['tacle','tacles'],      IT:['contrasto'],          ES:['entrada','entradas']},
    interceptions:      {PL:['przechwyt','przechwyty'],         EN:['interception','interceptions'],DE:['abfangen'],     FR:['interception'],        IT:['intercettazione'],    ES:['intercepción']},
    dribbles_completed: {PL:['drybling','dryble'],              EN:['dribble','dribbles'],    DE:['dribbling'],          FR:['dribble','dribbles'],  IT:['dribbling'],          ES:['regate','regates']},
    yellow_cards:       {PL:['żółta','żółte','kartka'],         EN:['yellow','yellow card'],  DE:['gelb','gelbe karte'], FR:['carton jaune'],        IT:['giallo','cartellino'],ES:['amarilla','tarjeta amarilla']},
    fouls:              {PL:['faul','faule','przewinienie'],     EN:['foul','fouls'],          DE:['foul','fouls'],       FR:['faute','fautes'],      IT:['fallo','falli'],      ES:['falta','faltas']},
    headers_won:        {PL:['główka','główki'],                 EN:['header','headers'],      DE:['kopfball'],           FR:['tête','têtes'],        IT:['colpo di testa'],     ES:['cabezazo']},
    duels_won:          {PL:['pojedynek','duel'],               EN:['duel','duels'],          DE:['duell'],              FR:['duel','duels'],        IT:['duello'],             ES:['duelo']},
    touches:            {PL:['dotknięcie','kontakt'],           EN:['touch','touches'],       DE:['ballkontakt'],        FR:['touche','contact'],    IT:['tocco'],              ES:['toque']},
    clearances:         {PL:['wybicie','wybicia'],              EN:['clear','clearance'],     DE:['klärung'],            FR:['dégagement'],          IT:['rinvio'],             ES:['despeje']},
    blocks:             {PL:['blok','bloki'],                   EN:['block','blocks'],        DE:['block','blocks'],     FR:['blocage'],             IT:['blocco'],             ES:['bloqueo']},
  };
  for(const cat of categories){
    for(const m of cat.measures.filter(x=>x.active)){
      // Add the display name itself
      const displayName = m.custom ? m.name : (m.nameKey||m.name||'');
      add(displayName, m.id);
      // Add known aliases
      const aliasLang = ALIASES[m.id]?.[lang] || ALIASES[m.id]?.EN || [];
      for(const alias of aliasLang) add(alias, m.id);
    }
  }
  return map;
}

function ActiveGame({setup,categories,onEnd}){
  const t=useT();
  const periods       = setup.periods||1;
  const perPeriodMins = periods>1 ? Math.round(setup.totalMins/periods) : setup.totalMins;

  // ── State ────────────────────────────────────────────────────────
  const [metrics,       setMetrics]      = useState({});
  const [periodMetrics, setPeriodMetrics]= useState([{}]);
  const [events,        setEvents]       = useState([]);
  const [activeCat,     setActiveCat]    = useState(null);

  // Timer state: 'idle'|'running'|'paused'|'period_break'|'ended'
  const [timerState,    setTimerState]   = useState('idle');
  const [elapsed,       setElapsed]      = useState(0);   // total ms running across all periods
  const [periodElapsedMs,setPeriodElapsedMs]=useState(0); // ms within current period only

  const [currentPeriod, setCurrentPeriod]= useState(1);
  const [periodStarts,  setPeriodStarts] = useState([]);   // wall ms when each period started
  const [periodLog,     setPeriodLog]    = useState([]);
  const [gameStartWall] = useState(()=>new Date().toLocaleTimeString('pl-PL',{hour:'2-digit',minute:'2-digit',second:'2-digit'}));
  const [gameEndWall,   setGameEndWall]  = useState(null);

  const [onPitch,       setOnPitch]      = useState(true);
  const [subs,          setSubs]         = useState([]);
  const [showPosPick,   setShowPosPick]  = useState(false);
  const [position,      setPosition]     = useState(setup.position||9);
  // Voice recognition
  const [voiceOn,       setVoiceOn]      = useState(false);
  const [voiceSupported]=useState(()=>'SpeechRecognition' in window||'webkitSpeechRecognition' in window);
  const [voiceFlash,    setVoiceFlash]   = useState(null); // {metricId, word} for flash confirmation
  const recogRef = useRef(null);
  const [endScreen,     setEndScreen]    = useState(false);
  const [overrideMins,  setOverrideMins] = useState(null);

  // Timer refs
  const timerRef        = useRef(null);
  const periodStartRef  = useRef(null);   // Date.now() when current period timer last started
  const periodAccRef    = useRef(0);      // ms accumulated in current period before last pause
  const totalAccRef     = useRef(0);      // ms accumulated in all previous periods

  const activeCats=categories.filter(c=>c.measures.some(m=>m.active));
  useEffect(()=>{ if(!activeCat&&activeCats.length) setActiveCat(activeCats[0].id); },[]);

  // Voice recognition effect
  useEffect(()=>{
    if(!voiceOn||!voiceSupported||timerState!=='running') return;
    const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
    const recog=new SpeechRecognition();
    recogRef.current=recog;
    const langMap={PL:'pl-PL',EN:'en-GB',DE:'de-DE',FR:'fr-FR',IT:'it-IT',ES:'es-ES'};
    recog.lang=langMap[lang]||'en-GB';
    recog.continuous=true;
    recog.interimResults=false;
    recog.maxAlternatives=3;

    recog.onresult=(e)=>{
      const voiceMap=buildVoiceMap(categories, lang);
      for(let i=e.resultIndex;i<e.results.length;i++){
        for(let j=0;j<e.results[i].length;j++){
          const word=e.results[i][j].transcript.toLowerCase().trim();
          // Check each word/phrase in the transcript
          const words=word.split(/\s+/);
          let matched=false;
          // Try progressively shorter phrases (up to 3 words)
          for(let len=Math.min(3,words.length);len>=1;len--){
            for(let start=0;start<=words.length-len;start++){
              const phrase=words.slice(start,start+len).join(' ');
              if(voiceMap[phrase]){
                const mId=voiceMap[phrase];
                inc(mId);
                setVoiceFlash({metricId:mId,word:phrase});
                setTimeout(()=>setVoiceFlash(null),1500);
                matched=true;
                break;
              }
            }
            if(matched) break;
          }
        }
      }
    };

    recog.onerror=(e)=>{ if(e.error!=='no-speech') console.error('Speech error:',e.error); };
    recog.onend=()=>{ if(voiceOn&&timerState==='running') recog.start(); }; // auto-restart
    recog.start();
    return()=>{ recog.onend=null; recog.stop(); };
  },[voiceOn, timerState, lang, categories]);

  // Clean up timer on unmount
  useEffect(()=>()=>{ if(timerRef.current) clearInterval(timerRef.current); },[]);

  // ── Timer control ─────────────────────────────────────────────────
  const startTimer=()=>{
    periodStartRef.current=Date.now();
    timerRef.current=setInterval(()=>{
      const periodMs=periodAccRef.current+(Date.now()-periodStartRef.current);
      setPeriodElapsedMs(periodMs);
      setElapsed(totalAccRef.current+periodMs);
    },200);
  };

  const pauseTimer=()=>{
    clearInterval(timerRef.current);
    periodAccRef.current+=(Date.now()-periodStartRef.current);
  };

  const nowMs=()=>totalAccRef.current+periodAccRef.current+(timerState==='running'?Date.now()-periodStartRef.current:0);
  const wallNow=()=>new Date().toLocaleTimeString('pl-PL',{hour:'2-digit',minute:'2-digit',second:'2-digit'});

  // ── Actions ───────────────────────────────────────────────────────
  const handleStart=()=>{
    const wall=wallNow();
    setPeriodLog(pl=>[...pl,{period:currentPeriod,startWall:wall}]);
    setSubs(s=>[...s,{elapsedMs:0,type:'on',period:currentPeriod}]);
    setTimerState('running');
    startTimer();
  };

  const handlePause=()=>{
    pauseTimer();
    setTimerState('paused');
    const ms=nowMs();
    setSubs(s=>[...s,{elapsedMs:ms,type:'off',period:currentPeriod}]);
  };

  const handleResume=()=>{
    setTimerState('running');
    startTimer();
    const ms=nowMs();
    setSubs(s=>[...s,{elapsedMs:ms,type:'on',period:currentPeriod}]);
  };

  const handleEndPeriod=()=>{
    if(timerState==='running') pauseTimer();
    const ms=nowMs();
    const wall=wallNow();
    const periodMs=periodAccRef.current+(timerState==='running'?Date.now()-periodStartRef.current:0);
    // Close current period in log
    setPeriodLog(pl=>{
      const up=[...pl];
      if(up.length>0) up[up.length-1]={...up[up.length-1],endWall:wall,durationMins:Math.round(periodMs/60000)};
      return up;
    });
    // Accumulate period into total
    totalAccRef.current+=periodMs;
    periodAccRef.current=0;
    setPeriodElapsedMs(0);
    setCurrentPeriod(p=>p+1);
    setPeriodMetrics(pm=>[...pm,{}]);
    setSubs(s=>[...s,{elapsedMs:ms,type:'period',period:currentPeriod+1}]);
    setTimerState('period_break');
  };

  const handleStartNextPeriod=()=>{
    const wall=wallNow();
    setPeriodLog(pl=>[...pl,{period:currentPeriod,startWall:wall}]);
    setTimerState('running');
    startTimer();
  };

  const handleEndGame=()=>{
    if(timerState==='running') pauseTimer();
    const wall=wallNow();
    const periodMs=periodAccRef.current;
    // Close final period if not already closed
    setPeriodLog(pl=>{
      const up=[...pl];
      if(up.length>0&&!up[up.length-1].endWall){
        up[up.length-1]={...up[up.length-1],endWall:wall,durationMins:Math.round(periodMs/60000)};
      }
      return up;
    });
    // Accumulate into total then zero out period so elapsedMins doesn't double-count
    totalAccRef.current+=periodMs;
    periodAccRef.current=0;
    setGameEndWall(wall);
    setTimerState('ended');
    setEndScreen(true);
  };

  // ── Metric tracking ───────────────────────────────────────────────
  const inc=id=>{
    if(timerState!=='running') return; // only track when running
    const ms=nowMs();
    setEvents(es=>[...es,{id:uid(),metricId:id,elapsedMs:ms,period:currentPeriod,onPitch}]);
    setPeriodMetrics(pm=>{const up=[...pm];const pi=currentPeriod-1;up[pi]={...up[pi],[id]:(up[pi][id]||0)+1};return up;});
    setMetrics(m=>({...m,[id]:(m[id]||0)+1}));
  };
  const dec=id=>{
    setEvents(es=>{const all=[...es].map((e,j)=>({e,j})).filter(x=>x.e.metricId===id&&x.e.period===currentPeriod);if(!all.length)return es;return es.filter((_,j)=>j!==all[all.length-1].j);});
    setPeriodMetrics(pm=>{const up=[...pm];const pi=currentPeriod-1;if((up[pi][id]||0)<=0)return pm;up[pi]={...up[pi],[id]:Math.max(0,(up[pi][id]||0)-1)};return up;});
    setMetrics(m=>({...m,[id]:Math.max(0,(m[id]||0)-1)}));
  };

  const sumPeriodMetrics=pm=>{const total={};for(const p of pm)for(const[k,v]of Object.entries(p))total[k]=(total[k]||0)+v;return total;};

  const togglePitch=()=>{
    if(timerState!=='running') return;
    const ms=nowMs();
    setSubs(s=>[...s,{elapsedMs:ms,type:onPitch?'off':'on',period:currentPeriod}]);
    setOnPitch(v=>!v);
  };

  // Derived
  const elapsedMins   = Math.round((totalAccRef.current+periodAccRef.current+(timerState==='running'?Date.now()-periodStartRef.current:0))/60000);
  const minsPlayed    = overrideMins!==null ? overrideMins : elapsedMins;
  const currentCat    = activeCats.find(c=>c.id===activeCat);
  const total         = Object.values(metrics).reduce((s,v)=>s+v,0);
  const typeDef       = gameTypeDef(setup.type);
  const pos           = posOf(position);
  const isLastPeriod  = currentPeriod>=periods;
  const pName         = getPeriodName(periods,currentPeriod,t);

  const buildGame=()=>({
    id:Date.now().toString(), date:setup.date, name:setup.name, type:setup.type,
    totalMinutes:setup.totalMins, minutesPlayed:minsPlayed, position,
    periods, metrics:sumPeriodMetrics(periodMetrics), periodMetrics, events, subs,
    targets:setup.targets||{}, startTime:gameStartWall, endTime:gameEndWall||wallNow(), periodLog,
  });

  // ── END SCREEN ────────────────────────────────────────────────────
  if(endScreen) return(
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <AppHeader title={t("end_game_title")} subtitle={setup.name||undefined} onBack={()=>setEndScreen(false)}/>
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 90px"}}>

        {/* Start / End time */}
        <div style={{...card(),marginBottom:12,display:'flex',padding:0,overflow:'hidden'}}>
          {[{label:t('game_start_time'),val:gameStartWall},{label:t('game_end_time'),val:gameEndWall||wallNow()}].map((x,i)=>(
            <div key={i} style={{flex:1,padding:'14px',textAlign:'center',borderRight:i===0?`1px solid ${G.border}`:'none'}}>
              <div style={{fontSize:11,fontWeight:700,color:G.sub,marginBottom:4}}>{x.label}</div>
              <div style={{fontSize:20,fontWeight:900,color:G.blue}}>{x.val}</div>
            </div>
          ))}
        </div>

        {/* Minutes played */}
        <div style={{...card(),marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:700,color:G.sub,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>{t("min_played")}</div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>setOverrideMins(Math.max(0,minsPlayed-1))} style={{...btnSt(G.grayL,G.sub),padding:"10px 20px"}}><Minus size={16}/></button>
            <span style={{fontSize:36,fontWeight:900,color:G.blue,flex:1,textAlign:"center"}}>{minsPlayed}</span>
            <button onClick={()=>setOverrideMins(minsPlayed+1)} style={{...btnSt(G.grayL,G.sub),padding:"10px 20px"}}><Plus size={16}/></button>
          </div>
          <div style={{fontSize:11,color:G.muted,textAlign:"center",marginTop:4}}>{t("timer_label",{m:elapsedMins})}</div>
        </div>

        {/* Period log */}
        {periodLog.length>0&&(
          <div style={{...card(),marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:700,color:G.sub,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>{t('period_dur')}</div>
            {periodLog.map((pl,i)=>{
              const col=['#1565C0','#E64A19','#2D8B2D','#534AB7'][i%4];
              return(
                <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderTop:i>0?`1px solid ${G.border}`:'none'}}>
                  <span style={{fontSize:13,fontWeight:700,color:col}}>
                    {periods>1?t('period_of',{n:pl.period,name:getPeriodName(periods,pl.period,t)}):'Game'}
                  </span>
                  <span style={{fontSize:12,color:G.sub}}>
                    {pl.startWall} → {pl.endWall||'—'}
                    {pl.durationMins!=null&&<strong style={{color:col,marginLeft:5}}>{pl.durationMins} min</strong>}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Position */}
        <div style={{...card(),marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:700,color:G.sub,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>{t("pos_played")}</div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{background:G.orange,color:"white",borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900}}>{pos.num}</span>
            <span style={{fontSize:15,fontWeight:700,color:G.text}}>{pos.code} — {t(pos.nameKey)}</span>
          </div>
        </div>

        {/* Stats by category — ALL categories, 0 shown too */}
        <div style={{...card(),marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:700,color:G.sub,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>{t("stats_total",{n:total})}</div>
          {categories.filter(c=>c.measures.some(m=>m.active)).map(cat=>{
            const catName=cat.custom?cat.name:t(cat.nameKey);
            return(
              <div key={cat.id} style={{marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:700,color:cat.color,marginBottom:5}}>{catName}</div>
                {cat.measures.filter(m=>m.active).map(m=>{
                  const nm=m.custom?m.name:t(m.nameKey);
                  const val=metrics[m.id]||0;
                  const target=setup.targets?.[m.id];
                  const hit=target!=null&&val>=target;
                  return(
                    <div key={m.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:`1px solid ${G.border}`}}>
                      <span style={{fontSize:13,color:G.text}}>{nm}</span>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        {target!=null&&<span style={{fontSize:11,color:G.sub}}>{t('target_planned')}: {target}</span>}
                        <span style={{fontSize:14,fontWeight:700,color:val>0?(target!=null?(hit?G.green:G.red):cat.color):G.muted}}>{val}</span>
                        {target!=null&&<span>{hit?'✓':'✗'}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Targets summary */}
        {setup.targets&&Object.keys(setup.targets).length>0&&(()=>{
          const entries=Object.entries(setup.targets);
          const hitCount=entries.filter(([id,tgt])=>(metrics[id]||0)>=tgt).length;
          const allHit=hitCount===entries.length;
          return(
            <div style={{...card(),marginBottom:20,background:allHit?G.greenBg:G.grayL,border:`1px solid ${allHit?G.green:G.border}`}}>
              <div style={{fontSize:14,fontWeight:700,color:allHit?G.green:G.sub,textAlign:'center'}}>
                {allHit?t('all_targets_hit'):`${hitCount}/${entries.length} targets hit`}
              </div>
            </div>
          );
        })()}

        <button onClick={()=>onEnd(buildGame())}
          style={{...btnSt(G.green),width:"100%",padding:"16px",fontSize:16,borderRadius:14}}>
          <Check size={18}/> {t("save_game")}
        </button>
      </div>
    </div>
  );

  // ── ACTIVE TRACKING ────────────────────────────────────────────
  const isIdle        = timerState==='idle';
  const isRunning     = timerState==='running';
  const isPaused      = timerState==='paused';
  const isPeriodBreak = timerState==='period_break';

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:G.bg,overflow:"hidden",position:"relative"}}>
      {/* ── HEADER ── */}
      <div style={{background:isPeriodBreak?"#4A5568":isRunning?G.blue:isPaused?"#BA7517":"#2D3748",padding:"10px 14px",color:"white",flexShrink:0,transition:"background .4s"}}>

        {/* Row 1: logo / type / events */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <GISLogo size={26} dark/>
            <span style={pill(typeDef.color+"44","white")}>{t(typeDef.labelKey)}</span>
            {setup.name&&<span style={{fontSize:11,opacity:.8,fontWeight:600,maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{setup.name}</span>}
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:9,opacity:.6}}>🕐 {gameStartWall}</div>
            <div style={{fontSize:10,opacity:.7}}>{total} {t("events")}</div>
          </div>
        </div>

        {/* Period dots */}
        {periods>1&&(
          <div style={{display:"flex",gap:4,marginBottom:6}}>
            {Array.from({length:periods},(_,i)=>(
              <div key={i} style={{flex:1,height:4,borderRadius:2,
                background:i+1<currentPeriod?"rgba(255,255,255,.9)":i+1===currentPeriod?"white":"rgba(255,255,255,.2)"}}/>
            ))}
          </div>
        )}

        {/* Period name + timer */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11,opacity:.65,marginBottom:2}}>
              {periods>1?t('period_of',{n:currentPeriod,name:pName}):'Game'} 
              {isPaused&&<span style={{marginLeft:6,background:'rgba(255,255,255,.2)',borderRadius:10,padding:'1px 6px',fontSize:10}}>⏸ Paused</span>}
              {isPeriodBreak&&<span style={{marginLeft:6,background:'rgba(255,255,255,.2)',borderRadius:10,padding:'1px 6px',fontSize:10}}>⏱ Break</span>}
            </div>
            <div style={{fontSize:38,fontWeight:900,letterSpacing:1,lineHeight:1,opacity:isRunning?1:0.6}}>
              {fmtTimer(periodElapsedMs)}
            </div>
            {periods>1&&<div style={{fontSize:10,opacity:.5,marginTop:1}}>total {fmtTimer(elapsed)}</div>}
          </div>
          <button onClick={()=>setShowPosPick(true)} style={{background:"rgba(255,255,255,.15)",border:"2px solid rgba(255,255,255,.3)",borderRadius:12,padding:"6px 10px",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}>
            <span style={{background:G.orange,color:"white",borderRadius:5,width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900}}>{pos.num}</span>
            <div><div style={{color:"white",fontWeight:700,fontSize:12}}>{pos.code}</div><div style={{color:"rgba(255,255,255,.55)",fontSize:9}}>{t("change")}</div></div>
          </button>
        </div>

        {/* ── CONTROL BUTTONS — change based on state ── */}
        {isIdle&&(
          <button onClick={handleStart} style={{width:'100%',padding:"12px",background:"rgba(45,139,45,.6)",border:"2px solid rgba(45,139,45,.9)",borderRadius:12,color:"white",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontWeight:900,fontSize:16}}>
            <Play size={20} fill="white"/>
            {periods>1?`Start ${pName} ${currentPeriod}`:'Start tracking'}
          </button>
        )}

        {isPeriodBreak&&(
          <button onClick={handleStartNextPeriod} style={{width:'100%',padding:"12px",background:"rgba(45,139,45,.6)",border:"2px solid rgba(45,139,45,.9)",borderRadius:12,color:"white",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontWeight:900,fontSize:16}}>
            <Play size={20} fill="white"/>
            Start {pName} {currentPeriod}
          </button>
        )}

        {(isRunning||isPaused)&&(
          <div style={{display:"flex",gap:6}}>
            {/* Sub off/on */}
            <button onClick={togglePitch} disabled={!isRunning} style={{flex:1,padding:"8px 6px",background:onPitch?"rgba(43,139,43,.35)":"rgba(230,74,25,.35)",border:`2px solid ${onPitch?"rgba(43,139,43,.7)":"rgba(230,74,25,.7)"}`,borderRadius:10,color:"white",cursor:isRunning?"pointer":"default",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5,fontWeight:700,fontSize:12,opacity:isRunning?1:0.5}}>
              {onPitch?<>🟢 {t("sub_off")}</>:<>🔴 {t("sub_on")}</>}
            </button>

            {/* Mic / Voice */}
            {voiceSupported&&(
              <button onClick={()=>setVoiceOn(v=>!v)} style={{
                flex:1,padding:"8px 6px",
                background:voiceOn?"rgba(198,40,40,.5)":"rgba(255,255,255,.15)",
                border:`2px solid ${voiceOn?"rgba(198,40,40,.8)":"rgba(255,255,255,.3)"}`,
                borderRadius:10,color:"white",cursor:"pointer",fontFamily:"inherit",
                display:"flex",alignItems:"center",justifyContent:"center",gap:4,fontWeight:700,fontSize:12,
              }}>
                {voiceOn?<MicOff size={14}/>:<Mic size={14}/>}
                {voiceOn?t('voice_on'):t('voice_off')}
              </button>
            )}
            {/* Pause / Resume */}
            {isRunning?(
              <button onClick={handlePause} style={{flex:1,padding:"8px 6px",background:"rgba(186,117,23,.4)",border:"2px solid rgba(186,117,23,.8)",borderRadius:10,color:"white",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5,fontWeight:700,fontSize:12}}>
                ⏸ Pause
              </button>
            ):(
              <button onClick={handleResume} style={{flex:1,padding:"8px 6px",background:"rgba(45,139,45,.4)",border:"2px solid rgba(45,139,45,.8)",borderRadius:10,color:"white",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5,fontWeight:700,fontSize:12}}>
                ▶ Resume
              </button>
            )}

            {/* End period / End game */}
            {periods>1&&!isLastPeriod?(
              <button onClick={handleEndPeriod} style={{flex:1,padding:"8px 6px",background:"rgba(249,168,37,.3)",border:"2px solid rgba(249,168,37,.7)",borderRadius:10,color:"white",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:4,fontWeight:700,fontSize:11}}>
                ⏭ End {pName}
              </button>
            ):(
              <button onClick={handleEndGame} style={{flex:1,padding:"8px 6px",background:"rgba(198,40,40,.35)",border:"2px solid rgba(198,40,40,.7)",borderRadius:10,color:"white",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5,fontWeight:700,fontSize:12}}>
                <StopCircle size={14}/> {t("end_game")}
              </button>
            )}
          </div>
        )}

        {/* End game always visible when on break too */}
        {(isIdle||isPeriodBreak)&&(
          <button onClick={handleEndGame} style={{width:'100%',marginTop:6,padding:"8px",background:"rgba(198,40,40,.25)",border:"1px solid rgba(198,40,40,.5)",borderRadius:10,color:"rgba(255,255,255,.7)",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5,fontWeight:600,fontSize:12}}>
            <StopCircle size={13}/> End game
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div style={{display:"flex",overflowX:"auto",background:G.card,borderBottom:`1px solid ${G.border}`,flexShrink:0,scrollbarWidth:"none"}}>
        {activeCats.map(c=>{const cn=c.custom?c.name:t(c.nameKey);return(
          <button key={c.id} onClick={()=>setActiveCat(c.id)} style={{padding:"10px 14px",border:"none",background:"none",borderBottom:`3px solid ${activeCat===c.id?c.color:"transparent"}`,color:activeCat===c.id?c.color:G.sub,fontWeight:activeCat===c.id?700:400,fontSize:13,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit"}}>{cn}</button>
        );})}
      </div>

      {/* Counter grid — dim and disable when not running */}
      <div style={{flex:1,overflowY:"auto",padding:"10px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,alignContent:"start",opacity:isRunning&&onPitch?1:0.5}}>
        {!isRunning&&!isPaused&&(
          <div style={{gridColumn:'1/-1',textAlign:'center',padding:'20px',color:G.muted,fontSize:13,fontWeight:600}}>
            {isIdle?'Press Start to begin tracking':'Press Resume or Start Next Period to continue'}
          </div>
        )}
        {currentCat?.measures.filter(m=>m.active).map(m=>{
          const count=(periodMetrics[currentPeriod-1]||{})[m.id]||0;
          const mName=m.custom?m.name:t(m.nameKey);
          const target=setup.targets?.[m.id];
          const totalCount=metrics[m.id]||0;
          const hit=target!=null&&totalCount>=target;
          return(
            <div key={m.id} style={{background:G.card,borderRadius:16,border:`2px solid ${count>0?currentCat.color:G.border}`,padding:"12px 10px",display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
              <div style={{fontSize:12,fontWeight:600,color:G.sub,textAlign:"center",lineHeight:1.3}}>{mName}</div>
              {target!=null&&<div style={{fontSize:10,color:hit?G.green:G.muted,fontWeight:700}}>{t('target_planned')}: {target} ({totalCount}) {hit?'✓':''}</div>}
              <div style={{fontSize:48,fontWeight:900,lineHeight:1,color:count>0?currentCat.color:G.text}}>{count}</div>
              <div style={{display:"flex",gap:6,width:"100%"}}>
                <button onClick={()=>dec(m.id)} style={{flex:1,padding:"9px 0",background:G.grayL,border:"none",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:20,color:G.sub,fontFamily:"inherit"}}>−</button>
                <button onClick={()=>inc(m.id)} disabled={!isRunning} style={{flex:2,padding:"9px 0",background:isRunning?currentCat.color:G.muted,border:"none",borderRadius:8,cursor:isRunning?"pointer":"not-allowed",fontWeight:900,fontSize:20,color:"white",fontFamily:"inherit"}}>+</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Voice flash — shows what word was heard and which metric it triggered */}
      {voiceFlash&&(()=>{
        let mName=voiceFlash.metricId, mColor=G.green;
        for(const c of categories){const m=c.measures.find(m=>m.id===voiceFlash.metricId);if(m){mName=m.custom?m.name:t(m.nameKey);mColor=c.color;break;}}
        return(
          <div style={{position:"absolute",top:80,left:0,right:0,display:"flex",justifyContent:"center",pointerEvents:"none",zIndex:10}}>
            <div style={{background:"rgba(0,0,0,.75)",color:"white",borderRadius:16,padding:"8px 20px",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:8}}>
              <span style={{color:mColor}}>+1 {mName}</span>
              <span style={{opacity:.6,fontSize:11}}>"{voiceFlash.word}"</span>
            </div>
          </div>
        );
      })()}
      {voiceOn&&timerState==='running'&&(
        <div style={{position:"absolute",top:140,left:0,right:0,textAlign:"center",pointerEvents:"none"}}>
          <span style={{background:"rgba(198,40,40,.7)",color:"white",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,display:"inline-flex",alignItems:"center",gap:4}}>
            <Mic size={10}/> {t('voice_hint')}
          </span>
        </div>
      )}
      {!onPitch&&isRunning&&(
        <div style={{position:"absolute",bottom:10,left:0,right:0,textAlign:"center",pointerEvents:"none"}}>
          <span style={{background:"rgba(0,0,0,.6)",color:"white",borderRadius:20,padding:"4px 14px",fontSize:12,fontWeight:700}}>⏸ {t("benched")}</span>
        </div>
      )}

      {showPosPick&&<PositionPicker current={position} onSelect={n=>{setPosition(n);setShowPosPick(false);}} onClose={()=>setShowPosPick(false)}/>}
    </div>
  );
}

// ─── Progress helpers ─────────────────────────────────────────────
function countEventsInRange(evs,fromMs,toMs,mId){
  return evs.filter(e=>e.metricId===mId&&e.elapsedMs>=fromMs&&e.elapsedMs<toMs).length;
}
function countEventsInPeriod(evs,period,mId){
  return evs.filter(e=>e.metricId===mId&&e.period===period).length;
}
// Value for a game in a given scope — falls back gracefully
function getValForScope(g,mId,scope){
  const evs=g.events||[];
  if(scope.type==='full') return g.metrics?.[mId]||0;
  if(scope.type==='range'){
    if(evs.length) return countEventsInRange(evs,scope.from*60000,scope.to*60000,mId);
    // Estimate proportionally
    const tot=g.minutesPlayed||g.totalMinutes||90;
    return Math.round((g.metrics?.[mId]||0)*Math.min(1,(scope.to-scope.from)/Math.max(1,tot)));
  }
  return g.metrics?.[mId]||0;
}
// Value for a defined time-range "segment" — used in comparison
function getSegVal(g,mId,seg){
  return getValForScope(g,mId,{type:'range',from:seg.from,to:seg.to});
}

// ─── Game Summary ─────────────────────────────────────────────────
function GameSummary({game, categories, onBack, onAnalyse, onEdit, onDelete, lang, setLang}){
  const t       = useT();
  const typeDef = gameTypeDef(game.type);
  const pos     = game.position ? posOf(game.position) : null;
  const periods = game.periods||1;
  const targets = game.targets||{};
  const hasTargets = Object.keys(targets).length>0;

  const targetEntries = hasTargets ? Object.entries(targets).map(([id,tgt])=>{
    let mName=id,col=G.blue;
    for(const c of categories){const m=c.measures.find(m=>m.id===id);if(m){mName=m.custom?m.name:t(m.nameKey);col=c.color;break;}}
    const actual=game.metrics?.[id]||0;
    const hit=actual>=tgt;
    return {id,mName,col,tgt,actual,hit};
  }) : [];
  const hitsCount = targetEntries.filter(x=>x.hit).length;
  const allHit    = targetEntries.length>0 && hitsCount===targetEntries.length;

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      <AppHeader
        title={game.name||t(typeDef.labelKey)}
        subtitle={game.date?new Date(game.date).toLocaleDateString('pl-PL',{day:'numeric',month:'long',year:'numeric'}):''}
        onBack={onBack} lang={lang} setLang={setLang}
        right={
          <div style={{display:'flex',gap:6}}>
            <button onClick={()=>onEdit(game)} style={{background:'rgba(255,255,255,.15)',border:'1px solid rgba(255,255,255,.3)',borderRadius:8,padding:'6px 10px',color:'white',cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:600,display:'flex',alignItems:'center',gap:4}}><Pencil size={13}/> Edit</button>
            <button onClick={()=>onAnalyse(game)} style={{background:'rgba(255,255,255,.15)',border:'1px solid rgba(255,255,255,.3)',borderRadius:8,padding:'6px 10px',color:'white',cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:600,display:'flex',alignItems:'center',gap:4}}><BarChart2 size={13}/> Analyse</button>
            {onDelete&&<button onClick={()=>{if(window.confirm('Delete this game?')){onDelete(game.id);}}} style={{background:'rgba(198,40,40,.3)',border:'1px solid rgba(198,40,40,.5)',borderRadius:8,padding:'6px 10px',color:'white',cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:600,display:'flex',alignItems:'center',gap:4}}><Trash2 size={13}/></button>}
          </div>
        }/>
      <div style={{flex:1,overflowY:'auto',padding:'12px 12px 90px'}}>

        {/* Header info row */}
        <div style={{...card(),marginBottom:12}}>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:10}}>
            <span style={pill(typeDef.color+'22',typeDef.color)}>{t(typeDef.labelKey)}</span>
            {periods>1&&<span style={pill(G.blueBg,G.blue)}>{periods === 2?t('periods_2'):periods===3?t('periods_3'):t('periods_4')}</span>}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
            {[
              {l:'Duration',       v:`${game.minutesPlayed} min`},
              {l:t('pos_played'),  v:pos?`#${pos.num} ${pos.code}`:t('not_set')},
              {l:t('on_pitch_mins',{m:''}), v:`${game.minutesPlayed} min`},
            ].map(x=>(
              <div key={x.l} style={{textAlign:'center'}}>
                <div style={{fontSize:14,fontWeight:900,color:G.blue}}>{x.v}</div>
                <div style={{fontSize:10,color:G.sub,marginTop:2}}>{x.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Start/end + period times */}
        {(game.startTime||game.periodLog?.length>0)&&(
          <div style={{...card(),marginBottom:12}}>
            {game.startTime&&(
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <div style={{textAlign:'center',flex:1}}>
                  <div style={{fontSize:11,color:G.sub,marginBottom:2}}>{t('game_start_time')}</div>
                  <div style={{fontSize:18,fontWeight:900,color:G.blue}}>{game.startTime}</div>
                </div>
                {game.endTime&&(
                  <div style={{textAlign:'center',flex:1,borderLeft:`1px solid ${G.border}`}}>
                    <div style={{fontSize:11,color:G.sub,marginBottom:2}}>{t('game_end_time')}</div>
                    <div style={{fontSize:18,fontWeight:900,color:G.blue}}>{game.endTime}</div>
                  </div>
                )}
              </div>
            )}
            {periods>1&&game.periodLog?.length>0&&(
              <div style={{borderTop:`1px solid ${G.border}`,paddingTop:8}}>
                {game.periodLog.map((pl,i)=>{
                  const col=['#1565C0','#E64A19','#2D8B2D','#534AB7'][i%4];
                  return(
                    <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'5px 0',borderTop:i>0?`1px solid ${G.border}`:'none'}}>
                      <span style={{fontSize:12,fontWeight:700,color:col}}>{t('period_of',{n:pl.period,name:getPeriodName(periods,pl.period,t)})}</span>
                      <span style={{fontSize:11,color:G.sub}}>
                        {pl.startWall} → {pl.endWall||'—'}
                        {pl.durationMins!=null&&<strong style={{color:col,marginLeft:5}}>{pl.durationMins} min</strong>}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Targets vs results */}
        {hasTargets&&(
          <div style={{...card(),marginBottom:12,border:`2px solid ${allHit?G.green:G.border}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <div style={{fontSize:14,fontWeight:700,color:G.text}}>{t('targets_vs_actual')}</div>
              <span style={{background:allHit?G.greenBg:G.grayL,color:allHit?G.green:G.sub,borderRadius:20,padding:'3px 10px',fontSize:11,fontWeight:700}}>
                {hitsCount}/{targetEntries.length} hit
              </span>
            </div>
            {targetEntries.map(({id,mName,col,tgt,actual,hit})=>{
              const pct=Math.min(100,Math.round((actual/Math.max(tgt,1))*100));
              return(
                <div key={id} style={{marginBottom:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:4}}>
                    <span style={{fontSize:13,color:G.text}}>{mName}</span>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontSize:11,color:G.sub}}>{t('target_planned')}: {tgt}</span>
                      <span style={{fontSize:16,fontWeight:900,color:hit?G.green:G.red}}>{actual}</span>
                      <span style={{fontSize:16}}>{hit?'✓':'✗'}</span>
                    </div>
                  </div>
                  <div style={{height:8,background:G.grayL,borderRadius:4,overflow:'hidden'}}>
                    <div style={{height:'100%',borderRadius:4,width:pct+'%',background:hit?G.green:G.red,transition:'width .4s'}}/>
                  </div>
                </div>
              );
            })}
            {allHit&&<div style={{textAlign:'center',fontSize:14,fontWeight:700,color:G.green,marginTop:8}}>{t('all_targets_hit')}</div>}
          </div>
        )}

        {/* Stats by category */}
        {categories.filter(c=>c.measures.some(m=>m.active)).map(cat=>{
          const catName=cat.custom?cat.name:t(cat.nameKey);
          const meas=cat.measures.filter(m=>m.active);
          const catTotal=meas.reduce((s,m)=>s+(game.metrics?.[m.id]||0),0);
          return(
            <div key={cat.id} style={{...card(),marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:10,height:10,borderRadius:2,background:cat.color}}/>
                  <span style={{fontSize:14,fontWeight:700,color:G.text}}>{catName}</span>
                </div>
                <span style={{fontSize:13,fontWeight:700,color:cat.color}}>{catTotal} total</span>
              </div>
              {meas.map(m=>{
                const nm=m.custom?m.name:t(m.nameKey);
                const val=game.metrics?.[m.id]||0;
                const tgt=targets[m.id];
                const hit=tgt!=null&&val>=tgt;
                const maxInCat=Math.max(...meas.map(x=>game.metrics?.[x.id]||0),tgt||0,1);
                return(
                  <div key={m.id} style={{marginBottom:8}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:2}}>
                      <span style={{fontSize:12,color:G.sub,flex:1}}>{nm}</span>
                      {tgt!=null&&(
                        <span style={{fontSize:11,color:G.muted,marginRight:10}}>
                          {t('target_planned')}: <strong>{tgt}</strong>
                        </span>
                      )}
                      <span style={{fontSize:13,fontWeight:700,color:tgt!=null?(hit?G.green:G.red):cat.color}}>
                        {val}{tgt!=null&&<span style={{fontSize:12,marginLeft:3}}>{hit?'✓':'✗'}</span>}
                      </span>
                    </div>
                    <div style={{height:5,background:G.grayL,borderRadius:3,overflow:'hidden'}}>
                      <div style={{height:'100%',borderRadius:3,width:Math.round((val/maxInCat)*100)+'%',background:tgt!=null?(hit?G.green:G.red):cat.color}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Single Game Analysis ─────────────────────────────────────────
function GameDetail({game, categories, onBack, lang, setLang}){
  const t         = useT();
  const periods   = game.periods || 1;
  const hasEvents = (game.events||[]).length > 0;
  const totalMins = game.minutesPlayed || game.totalMinutes || 90;
  const halfMins  = Math.round(totalMins / 2);
  const PCOLS     = ['#1565C0','#E64A19','#2D8B2D','#534AB7'];

  // Build default segments from recorded periods, else two halves
  const makeDefaultSegs = () => periods > 1
    ? Array.from({length:periods},(_,i)=>({
        label: t('period_of',{n:i+1, name:getPeriodName(periods,i+1,t)}),
        from: Math.round(i*(totalMins/periods)),
        to:   Math.round((i+1)*(totalMins/periods)),
        color: PCOLS[i%4],
      }))
    : [
        {label:'1st Half', from:0,        to:halfMins,  color:PCOLS[0]},
        {label:'2nd Half', from:halfMins,  to:totalMins, color:PCOLS[1]},
      ];

  const [segments,   setSegments]   = useState(makeDefaultSegs);
  const [editingSeg, setEditingSeg] = useState(null);
  const [catId,      setCatId]      = useState(null);

  const allCats    = categories.filter(c=>c.measures.some(m=>m.active));
  const cat        = categories.find(c=>c.id===catId) || allCats[0];
  const activeMeas = (cat?.measures||[]).filter(m=>m.active);

  // Get metric value for a segment
  const getVal = (mId, seg) => {
    const evs = game.events||[];
    const pm  = game.periodMetrics;
    if(evs.length)
      return countEventsInRange(evs, seg.from*60000, seg.to*60000, mId);
    if(pm && periods > 1){
      let total = 0;
      const perMins = totalMins / periods;
      for(let p=0;p<periods;p++){
        const pFrom=p*perMins, pTo=(p+1)*perMins;
        const overlap=Math.max(0,Math.min(seg.to,pTo)-Math.max(seg.from,pFrom));
        if(overlap>0 && pm[p]) total+=Math.round((pm[p][mId]||0)*overlap/perMins);
      }
      return total;
    }
    return Math.round((game.metrics?.[mId]||0)*Math.min(1,(seg.to-seg.from)/Math.max(1,totalMins)));
  };

  const updateSeg = (i,patch) => setSegments(ss=>ss.map((s,j)=>j===i?{...s,...patch}:s));
  const addSeg    = () => setSegments(ss=>[...ss,{label:`+${ss.length+1}`,from:0,to:halfMins,color:PCOLS[ss.length%4]}]);
  const removeSeg = i  => setSegments(ss=>ss.filter((_,j)=>j!==i));

  const typeDef = gameTypeDef(game.type);
  const pos     = game.position ? posOf(game.position) : null;
  const dateStr = game.date ? new Date(game.date).toLocaleDateString('pl-PL',{day:'numeric',month:'short',year:'numeric'}) : '';

  // Compute all comparison data once
  const mData = activeMeas.map(m=>{
    const mName = m.custom?m.name:t(m.nameKey);
    const vals  = segments.map(seg=>getVal(m.id,seg));
    const total = game.metrics?.[m.id]||0;
    return {m,mName,vals,total};
  });

  const barMax = Math.max(...mData.flatMap(d=>d.vals), 1);

  // Preset splits
  const PRESETS = [
    {label:'Halves',   segs:[{label:'1st Half',from:0,to:halfMins,color:PCOLS[0]},{label:'2nd Half',from:halfMins,to:totalMins,color:PCOLS[1]}]},
    {label:'Thirds',   segs:Array.from({length:3},(_,i)=>({label:`${['1st','2nd','3rd'][i]} Third`,from:Math.round(i*totalMins/3),to:Math.round((i+1)*totalMins/3),color:PCOLS[i]}))},
    {label:'Quarters', segs:Array.from({length:4},(_,i)=>({label:`Q${i+1}`,from:Math.round(i*totalMins/4),to:Math.round((i+1)*totalMins/4),color:PCOLS[i]}))},
    {label:'0–15 / 15–30 / 30–45',segs:[{label:'0–15′',from:0,to:15,color:PCOLS[0]},{label:'15–30′',from:15,to:30,color:PCOLS[1]},{label:'30–45′',from:30,to:45,color:PCOLS[2]}]},
    {label:'0–30 / 30–60 / 60+', segs:[{label:'0–30′',from:0,to:30,color:PCOLS[0]},{label:'30–60′',from:30,to:60,color:PCOLS[1]},{label:'60+′',from:60,to:totalMins,color:PCOLS[2]}]},
  ];
  if(periods>1) PRESETS.unshift({
    label:`${periods} Periods`,
    segs:Array.from({length:periods},(_,i)=>({
      label:t('period_of',{n:i+1,name:getPeriodName(periods,i+1,t)}),
      from:Math.round(i*totalMins/periods),to:Math.round((i+1)*totalMins/periods),color:PCOLS[i%4],
    }))
  });

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      <AppHeader
        title={game.name||t(typeDef.labelKey)}
        subtitle={`${dateStr} · ${game.minutesPlayed}min${pos?' · #'+pos.num+' '+pos.code:''}`}
        onBack={onBack} lang={lang} setLang={setLang}/>

      <div style={{flex:1,overflowY:'auto',padding:'12px 12px 90px'}}>

        {/* ── QUICK PRESET BUTTONS ── */}
        <div style={{...card(),marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:G.sub,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>
            Compare by:
          </div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {PRESETS.map((p,i)=>(
              <button key={i} onClick={()=>{setSegments(p.segs);setEditingSeg(null);}}
                style={{padding:'6px 12px',border:`2px solid ${G.border}`,borderRadius:10,
                  background:G.card,color:G.text,fontWeight:600,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>
                {p.label}
              </button>
            ))}
            <button onClick={addSeg}
              style={{padding:'6px 12px',border:`2px dashed ${G.blue}`,borderRadius:10,
                background:G.blueBg,color:G.blue,fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>
              + Custom
            </button>
          </div>
        </div>

        {/* ── ACTIVE SEGMENTS (editable) ── */}
        <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
          {segments.map((seg,i)=>(
            <div key={i} style={{flex:1,minWidth:90,padding:'10px 12px',borderRadius:12,
              border:`2px solid ${seg.color}`,background:seg.color+'12',position:'relative'}}>
              {editingSeg===i?(
                <div>
                  <input value={seg.label} onChange={e=>updateSeg(i,{label:e.target.value})}
                    style={inp({padding:'4px 6px',fontSize:13,fontWeight:700,marginBottom:6})}/>
                  <div style={{display:'flex',gap:6,marginBottom:6}}>
                    <input type="number" min={0} max={seg.to-1} value={seg.from} onChange={e=>updateSeg(i,{from:+e.target.value})}
                      style={inp({padding:'4px',fontSize:12,textAlign:'center',fontWeight:700,flex:1})}/>
                    <span style={{alignSelf:'center',fontSize:11,color:G.sub}}>–</span>
                    <input type="number" min={seg.from+1} max={totalMins} value={seg.to} onChange={e=>updateSeg(i,{to:+e.target.value})}
                      style={inp({padding:'4px',fontSize:12,textAlign:'center',fontWeight:700,flex:1})}/>
                  </div>
                  <div style={{display:'flex',gap:4,marginBottom:6}}>
                    {['#1565C0','#E64A19','#2D8B2D','#534AB7','#BA7517','#C62828'].map(c=>(
                      <button key={c} onClick={()=>updateSeg(i,{color:c})}
                        style={{width:20,height:20,borderRadius:'50%',background:c,border:`2px solid ${seg.color===c?G.text:'transparent'}`,cursor:'pointer',flexShrink:0}}/>
                    ))}
                  </div>
                  <div style={{display:'flex',gap:6}}>
                    <button onClick={()=>setEditingSeg(null)} style={{...btnSt(G.green),flex:1,padding:'5px'}}><Check size={12}/></button>
                    {segments.length>2&&<button onClick={()=>{removeSeg(i);setEditingSeg(null);}} style={{...btnSt(G.grayL,G.sub),flex:1,padding:'5px'}}><Trash2 size={12}/></button>}
                  </div>
                </div>
              ):(
                <div onClick={()=>setEditingSeg(i)} style={{cursor:'pointer'}}>
                  <div style={{fontSize:13,fontWeight:900,color:seg.color,marginBottom:3}}>{seg.label}</div>
                  <div style={{fontSize:11,color:G.sub}}>{seg.from}–{seg.to}′</div>
                  <Pencil size={10} color={seg.color} style={{position:'absolute',top:8,right:8,opacity:.5}}/>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── CATEGORY PICKER — always visible ── */}
        <>
          <div style={{display:'flex',overflowX:'auto',gap:6,marginBottom:12,paddingBottom:4,scrollbarWidth:'none'}}>
            {allCats.map(c=>{
              const cn=c.custom?c.name:t(c.nameKey);
              const active=cat?.id===c.id;
              return(<button key={c.id} onClick={()=>setCatId(c.id)}
                style={{padding:'5px 12px',border:`2px solid ${active?c.color:G.border}`,borderRadius:20,
                  background:active?c.color:G.card,color:active?'white':G.sub,
                  fontWeight:700,fontSize:13,cursor:'pointer',whiteSpace:'nowrap',fontFamily:'inherit'}}>{cn}</button>);
            })}
          </div>

          {/* ── MAIN COMPARISON TABLE ── */}
          <div style={{...card(),marginBottom:12,overflow:'hidden'}}>
            {/* Header row with segment names */}
            <div style={{display:'grid',gridTemplateColumns:`1fr repeat(${segments.length},1fr)`,gap:4,marginBottom:12,padding:'8px 0 0'}}>
              <div/>
              {segments.map((seg,i)=>(
                <div key={i} style={{textAlign:'center'}}>
                  <div style={{fontSize:12,fontWeight:900,color:seg.color}}>{seg.label}</div>
                  <div style={{fontSize:10,color:G.muted}}>{seg.from}–{seg.to}′</div>
                </div>
              ))}
            </div>

            {/* Metric rows */}
            {mData.map(({m,mName,vals,total},ri)=>{
              const rowMax = Math.max(...vals,1);
              const winner = vals.indexOf(Math.max(...vals));
              return(
                <div key={m.id} style={{
                  borderTop:`1px solid ${G.border}`,
                  padding:'10px 0',
                  background:ri%2===0?'transparent':G.grayL+'44',
                }}>
                  {/* Metric name + total */}
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:8,padding:'0 4px'}}>
                    <span style={{fontSize:13,fontWeight:700,color:G.text}}>{mName}</span>
                    <span style={{fontSize:11,color:G.muted}}>Total: {total}</span>
                  </div>
                    {/* Values grid */}
                    <div style={{display:'grid',gridTemplateColumns:`repeat(${segments.length},1fr)`,gap:6}}>
                      {segments.map((seg,i)=>{
                        const v=vals[i];
                        const pct=Math.round((v/rowMax)*100);
                        const isWinner=i===winner&&v>0&&vals.filter(x=>x===v).length===1;
                        return(
                          <div key={i} style={{textAlign:'center'}}>
                            <div style={{
                              fontSize:26,fontWeight:900,
                              color:isWinner?seg.color:v>0?seg.color:G.muted,
                              lineHeight:1,marginBottom:4,
                            }}>
                              {v}
                              {isWinner&&<span style={{fontSize:10,marginLeft:2}}>↑</span>}
                            </div>
                            {/* Mini bar */}
                            <div style={{height:6,background:G.grayL,borderRadius:3,overflow:'hidden',margin:'0 8px'}}>
                              <div style={{height:'100%',width:pct+'%',background:seg.color,borderRadius:3,transition:'width .4s'}}/>
                            </div>
                            {pct>0&&<div style={{fontSize:9,color:G.muted,marginTop:2}}>{pct}%</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── RADAR-STYLE BAR CHART ── */}
            {mData.length>0&&(
              <div style={{...card(),padding:'14px 6px 10px',marginBottom:12}}>
                <div style={{fontSize:13,fontWeight:700,color:G.text,marginBottom:6,paddingLeft:8}}>
                  {cat?.custom?cat.name:t(cat?.nameKey||'')} — segment comparison
                </div>
                <div style={{display:'flex',gap:12,paddingLeft:8,marginBottom:8,flexWrap:'wrap'}}>
                  {segments.map((seg,i)=>(
                    <span key={i} style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:seg.color,fontWeight:700}}>
                      <span style={{width:10,height:10,borderRadius:2,background:seg.color,display:'inline-block'}}/>
                      {seg.label}
                    </span>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={mData.map(({m,mName,vals})=>({
                      name:mName.length>10?mName.slice(0,9)+'…':mName,
                      ...Object.fromEntries(segments.map((seg,i)=>[`s${i}`,vals[i]])),
                    }))}
                    margin={{top:5,right:10,bottom:28,left:-18}}>
                    <CartesianGrid strokeDasharray="3 3" stroke={G.border}/>
                    <XAxis dataKey="name" tick={{fontSize:9}} angle={-30} textAnchor="end" stroke={G.border}/>
                    <YAxis tick={{fontSize:10}} allowDecimals={false} stroke={G.border}/>
                    <Tooltip contentStyle={{background:G.card,border:`1px solid ${G.border}`,borderRadius:8,fontSize:12}}/>
                    {segments.map((seg,i)=>(
                      <Bar key={i} dataKey={`s${i}`} name={seg.label} fill={seg.color} radius={[3,3,0,0]}/>
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* ── TIMELINE (events only) ── */}
            {hasEvents&&(()=>{
              const evs=game.events||[];
              const bins=Math.min(6,totalMins);
              const binMins=totalMins/bins;
              const tlData=Array.from({length:bins},(_,i)=>({
                name:`${Math.round(i*binMins)}–${Math.round((i+1)*binMins)}′`,
                ...Object.fromEntries(activeMeas.slice(0,3).map(m=>[m.id,countEventsInRange(evs,i*binMins*60000,(i+1)*binMins*60000,m.id)])),
              }));
              return(
                <div style={{...card(),padding:'14px 6px 10px'}}>
                  <div style={{fontSize:13,fontWeight:700,color:G.text,marginBottom:8,paddingLeft:8}}>Activity timeline</div>
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={tlData} margin={{top:5,right:10,bottom:20,left:-18}}>
                      <CartesianGrid strokeDasharray="3 3" stroke={G.border}/>
                      <XAxis dataKey="name" tick={{fontSize:9}} stroke={G.border}/>
                      <YAxis tick={{fontSize:10}} allowDecimals={false} stroke={G.border}/>
                      <Tooltip contentStyle={{background:G.card,border:`1px solid ${G.border}`,borderRadius:8,fontSize:12}}/>
                      {activeMeas.slice(0,3).map((m,i)=>(
                        <Bar key={m.id} dataKey={m.id} name={m.custom?m.name:t(m.nameKey)}
                          fill={[cat.color,'#E64A19','#2D8B2D'][i]||cat.color} radius={[2,2,0,0]} stackId="a"/>
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            })()}

            {!hasEvents&&(
              <div style={{fontSize:11,color:G.muted,textAlign:'center',padding:'8px'}}>
                ℹ️ Values estimated proportionally — record new games for exact per-minute data
              </div>
            )}
        </>

      </div>
    </div>
  );
}

// ─── Game Comparison ─────────────────────────────────────────────
// Handles two modes:
//   vs_all:    selectedGames vs average of all other games
//   vs_select: pick additional games then compare side by side
function GameComparison({config, allGames, categories, onBack, lang, setLang}){
  const t          = useT();
  const {mode}     = config;
  const initGames  = config.games || [];           // games user already selected
  const pool       = (config.allGames || allGames) // full pool for picking more
    .sort((a,b)=>new Date(b.date)-new Date(a.date));

  // For vs_select: user picks additional games from the pool
  const [extraSel, setExtraSel] = useState(new Set(initGames.map(g=>g.id)));
  const [catId,    setCatId]    = useState(null);
  const [measId,   setMeasId]   = useState(null);
  const [step,     setStep]     = useState(mode==='vs_select'?'pick':'compare'); // 'pick'|'compare'

  const allCats    = categories.filter(c=>c.measures.some(m=>m.active));
  const cat        = categories.find(c=>c.id===catId)||allCats[0];
  const activeMeas = (cat?.measures||[]).filter(m=>m.active);

  // Resolved game sets
  const selGames  = mode==='vs_all'
    ? initGames
    : pool.filter(g=>extraSel.has(g.id));
  const restGames = mode==='vs_all'
    ? allGames.filter(g=>!initGames.find(x=>x.id===g.id))
    : [];

  const COLORS = ['#1565C0','#E64A19','#2D8B2D','#534AB7','#BA7517','#C62828','#0F6E56','#8B1A8B'];

  const getMName = m => m.custom?m.name:t(m.nameKey);

  // Compute per-metric stats for a set of games
  const calcStats = (gSet, mId) => {
    const vals = gSet.map(g=>g.metrics?.[mId]||0);
    if(!vals.length) return {avg:0,best:0,vals:[]};
    return {
      avg:  +(vals.reduce((s,v)=>s+v,0)/vals.length).toFixed(1),
      best: Math.max(...vals),
      vals,
    };
  };

  // ── STEP 1: Game picker (vs_select only) ──────────────────────
  if(step==='pick'){
    const toggleExtra = id => setExtraSel(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n;});
    return(
      <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
        <AppHeader title="Select games to compare" onBack={onBack} lang={lang} setLang={setLang}/>
        <div style={{flex:1,overflowY:'auto',padding:'12px 12px 100px'}}>
          <div style={{...card(),marginBottom:12,background:G.blueBg,border:`1px solid ${G.blue}33`}}>
            <div style={{fontSize:13,color:G.blue,fontWeight:600}}>
              ✓ {initGames.length} pre-selected · tap more to add · {extraSel.size} total selected
            </div>
          </div>
          {pool.map(g=>{
            const isSel = extraSel.has(g.id);
            const isInit= !!initGames.find(x=>x.id===g.id);
            const typeDef=gameTypeDef(g.type);
            const pos=g.position?posOf(g.position):null;
            return(
              <div key={g.id} onClick={()=>toggleExtra(g.id)}
                style={{...card(),marginBottom:8,cursor:'pointer',
                  border:`2px solid ${isSel?G.blue:G.border}`,
                  background:isSel?G.blueBg:'white',
                  display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:28,height:28,borderRadius:7,
                  border:`2px solid ${isSel?G.blue:G.border}`,
                  background:isSel?G.blue:'white',
                  display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  {isSel&&<Check size={15} color="white"/>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
                    <span style={pill(typeDef.color+'22',typeDef.color,{fontSize:10})}>{t(typeDef.labelKey)}</span>
                    {g.name&&<span style={{fontSize:13,fontWeight:700,color:G.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:120}}>{g.name}</span>}
                    <span style={{fontSize:11,color:G.sub}}>{shortDt(g.date)}</span>
                    {isInit&&<span style={pill(G.green+'22',G.green,{fontSize:10})}>pre-selected</span>}
                  </div>
                  {pos&&<div style={{fontSize:11,color:G.sub,marginTop:2}}>#{pos.num} {pos.code} · {g.minutesPlayed}min</div>}
                </div>
              </div>
            );
          })}
        </div>
        {extraSel.size>=2&&(
          <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',
            width:'100%',maxWidth:520,background:G.card,
            borderTop:`2px solid ${G.border}`,padding:'12px 14px 24px',zIndex:200}}>
            <button onClick={()=>setStep('compare')}
              style={{...btnSt(G.blue),width:'100%',padding:'14px',fontSize:16,borderRadius:12}}>
              Compare {extraSel.size} games →
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── STEP 2: Comparison view ────────────────────────────────────
  const heading = mode==='vs_all'
    ? `${selGames.length} game${selGames.length!==1?'s':''} vs all others (${restGames.length})`
    : `${selGames.length} games compared`;

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      <AppHeader title="Game Comparison" subtitle={heading} onBack={onBack} lang={lang} setLang={setLang}/>
      <div style={{flex:1,overflowY:'auto',padding:'12px 12px 90px'}}>

        {/* ── Selected games summary chips ── */}
        <div style={{...card(),marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:G.sub,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>
            {mode==='vs_all'?'Selected':'Games compared'}
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            {selGames.map((g,i)=>{
              const typeDef=gameTypeDef(g.type);
              return(
                <span key={g.id} style={{
                  display:'inline-flex',alignItems:'center',gap:5,
                  padding:'4px 10px',borderRadius:20,
                  background:COLORS[i%COLORS.length]+'18',
                  border:`1px solid ${COLORS[i%COLORS.length]}44`,
                  fontSize:12,fontWeight:700,color:COLORS[i%COLORS.length],
                }}>
                  <span style={{width:8,height:8,borderRadius:2,background:COLORS[i%COLORS.length],flexShrink:0}}/>
                  {g.name||t(typeDef.labelKey)} · {shortDt(g.date)}
                </span>
              );
            })}
            {mode==='vs_all'&&restGames.length>0&&(
              <span style={{display:'inline-flex',alignItems:'center',gap:5,padding:'4px 10px',borderRadius:20,background:G.grayL,border:`1px solid ${G.border}`,fontSize:12,fontWeight:700,color:G.sub}}>
                vs avg of {restGames.length} other games
              </span>
            )}
          </div>
          {mode==='vs_select'&&(
            <button onClick={()=>setStep('pick')} style={{marginTop:10,background:'none',border:'none',cursor:'pointer',fontSize:12,color:G.blueL,fontWeight:600,fontFamily:'inherit',padding:0}}>
              ✏️ Change selection
            </button>
          )}
        </div>

        {/* ── Category + Measure pickers ── */}
        <div style={{display:'flex',overflowX:'auto',gap:6,marginBottom:8,paddingBottom:4,scrollbarWidth:'none'}}>
          {allCats.map(c=>{
            const cn=c.custom?c.name:t(c.nameKey);
            const active=cat?.id===c.id;
            return(<button key={c.id} onClick={()=>{setCatId(c.id);setMeasId(null);}}
              style={{padding:'5px 12px',border:`2px solid ${active?c.color:G.border}`,borderRadius:20,
                background:active?c.color:G.card,color:active?'white':G.sub,
                fontWeight:700,fontSize:13,cursor:'pointer',whiteSpace:'nowrap',fontFamily:'inherit'}}>{cn}</button>);
          })}
        </div>
        <div style={{display:'flex',overflowX:'auto',gap:6,marginBottom:14,paddingBottom:4,scrollbarWidth:'none'}}>
          {activeMeas.map(m=>{
            const mn=getMName(m);
            const active=measId===m.id;
            return(<button key={m.id} onClick={()=>setMeasId(m.id)}
              style={{padding:'5px 10px',border:`1px solid ${active?(cat?.color||G.blue):G.border}`,borderRadius:14,
                background:active?(cat?.color||G.blue)+'18':G.card,color:active?(cat?.color||G.blue):G.sub,
                fontWeight:600,fontSize:12,cursor:'pointer',whiteSpace:'nowrap',fontFamily:'inherit'}}>{mn}</button>);
          })}
        </div>

        {/* ── vs ALL: selected vs rest averages ── */}
        {mode==='vs_all'&&(
          <>
            {/* Per-metric comparison table */}
            {activeMeas.map(m=>{
              const selSt  = calcStats(selGames,  m.id);
              const restSt = calcStats(restGames, m.id);
              const mName  = getMName(m);
              const delta  = +(selSt.avg - restSt.avg).toFixed(1);
              const above  = delta > 0;
              const below  = delta < 0;
              const barMax = Math.max(selSt.avg, restSt.avg, 1);
              return(
                <div key={m.id} style={{...card(),marginBottom:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                    <span style={{fontSize:14,fontWeight:700,color:G.text}}>{mName}</span>
                    <span style={{
                      background:above?G.greenBg:below?G.redBg:G.grayL,
                      color:above?G.green:below?G.red:G.sub,
                      borderRadius:20,padding:'3px 10px',fontSize:11,fontWeight:700,
                    }}>
                      {above?'+':''}{delta} {above?'↑':below?'↓':'='}
                    </span>
                  </div>
                  {/* Selected avg */}
                  <div style={{marginBottom:8}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                      <span style={{fontSize:12,fontWeight:700,color:COLORS[0]}}>
                        Selected ({selGames.length})
                      </span>
                      <span style={{fontSize:16,fontWeight:900,color:COLORS[0]}}>{selSt.avg}</span>
                    </div>
                    <div style={{height:10,background:G.grayL,borderRadius:5,overflow:'hidden'}}>
                      <div style={{height:'100%',borderRadius:5,width:Math.round((selSt.avg/barMax)*100)+'%',background:COLORS[0],transition:'width .4s'}}/>
                    </div>
                    <div style={{fontSize:10,color:G.muted,marginTop:2}}>Best: {selSt.best}</div>
                  </div>
                  {/* Rest avg */}
                  <div>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                      <span style={{fontSize:12,fontWeight:700,color:G.sub}}>
                        Other games ({restGames.length})
                      </span>
                      <span style={{fontSize:16,fontWeight:900,color:G.sub}}>{restSt.avg}</span>
                    </div>
                    <div style={{height:10,background:G.grayL,borderRadius:5,overflow:'hidden'}}>
                      <div style={{height:'100%',borderRadius:5,width:Math.round((restSt.avg/barMax)*100)+'%',background:G.muted,transition:'width .4s'}}/>
                    </div>
                    <div style={{fontSize:10,color:G.muted,marginTop:2}}>Best: {restSt.best}</div>
                  </div>
                </div>
              );
            })}

            {/* Overview chart: selected avg vs rest avg */}
            {activeMeas.length>0&&(
              <div style={{...card(),padding:'14px 6px 10px',marginBottom:12}}>
                <div style={{fontSize:13,fontWeight:700,color:G.text,marginBottom:6,paddingLeft:8}}>
                  Selected avg vs other games avg
                </div>
                <div style={{display:'flex',gap:14,paddingLeft:8,marginBottom:10}}>
                  {[{label:`Selected (${selGames.length})`,color:COLORS[0]},{label:`Others (${restGames.length})`,color:G.muted}].map((x,i)=>(
                    <span key={i} style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:x.color,fontWeight:700}}>
                      <span style={{width:10,height:10,borderRadius:2,background:x.color,display:'inline-block'}}/>
                      {x.label}
                    </span>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={activeMeas.map(m=>{
                      const s=calcStats(selGames,m.id);
                      const r=calcStats(restGames,m.id);
                      const mn=getMName(m);
                      return({name:mn.length>10?mn.slice(0,9)+'…':mn,selected:s.avg,others:r.avg});
                    })}
                    margin={{top:5,right:10,bottom:28,left:-18}}>
                    <CartesianGrid strokeDasharray="3 3" stroke={G.border}/>
                    <XAxis dataKey="name" tick={{fontSize:9}} angle={-30} textAnchor="end" stroke={G.border}/>
                    <YAxis tick={{fontSize:10}} allowDecimals={false} stroke={G.border}/>
                    <Tooltip contentStyle={{background:G.card,border:`1px solid ${G.border}`,borderRadius:8,fontSize:12}}/>
                    <Bar dataKey="selected" name={`Selected (${selGames.length})`} fill={COLORS[0]} radius={[3,3,0,0]}/>
                    <Bar dataKey="others"   name={`Others (${restGames.length})`}  fill={G.muted}    radius={[3,3,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {/* ── vs SELECT: side-by-side per game ── */}
        {mode==='vs_select'&&(
          <>
            {/* Comparison table: one column per game, one row per metric */}
            {activeMeas.length>0&&(
              <div style={{...card(),marginBottom:12,overflow:'hidden'}}>
                {/* Header */}
                <div style={{display:'grid',gridTemplateColumns:`1fr repeat(${selGames.length},1fr)`,gap:4,marginBottom:8,borderBottom:`1px solid ${G.border}`,paddingBottom:8}}>
                  <div/>
                  {selGames.map((g,i)=>{
                    const typeDef=gameTypeDef(g.type);
                    return(
                      <div key={g.id} style={{textAlign:'center'}}>
                        <div style={{width:10,height:10,borderRadius:2,background:COLORS[i%COLORS.length],margin:'0 auto 4px'}}/>
                        <div style={{fontSize:11,fontWeight:700,color:COLORS[i%COLORS.length],whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                          {g.name||t(typeDef.labelKey)}
                        </div>
                        <div style={{fontSize:9,color:G.muted}}>{shortDt(g.date)}</div>
                      </div>
                    );
                  })}
                </div>
                {/* Metric rows */}
                {activeMeas.map((m,ri)=>{
                  const vals  = selGames.map(g=>g.metrics?.[m.id]||0);
                  const rowMax= Math.max(...vals,1);
                  const winner= vals.indexOf(Math.max(...vals));
                  return(
                    <div key={m.id} style={{borderTop:ri>0?`1px solid ${G.border}`:'none',padding:'10px 0',background:ri%2===0?'transparent':G.grayL+'44'}}>
                      <div style={{fontSize:12,fontWeight:700,color:G.text,marginBottom:8,paddingLeft:2}}>{getMName(m)}</div>
                      <div style={{display:'grid',gridTemplateColumns:`repeat(${selGames.length},1fr)`,gap:6}}>
                        {selGames.map((g,i)=>{
                          const v=vals[i];
                          const isW=i===winner&&v>0&&vals.filter(x=>x===v).length===1;
                          return(
                            <div key={g.id} style={{textAlign:'center'}}>
                              <div style={{fontSize:24,fontWeight:900,color:isW?COLORS[i%COLORS.length]:v>0?COLORS[i%COLORS.length]:G.muted,lineHeight:1,marginBottom:3}}>
                                {v}{isW&&<span style={{fontSize:10}}>↑</span>}
                              </div>
                              <div style={{height:6,background:G.grayL,borderRadius:3,overflow:'hidden',margin:'0 10px'}}>
                                <div style={{height:'100%',width:Math.round((v/rowMax)*100)+'%',background:COLORS[i%COLORS.length],borderRadius:3}}/>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Multi-game line trend chart for selected measure */}
            {measId&&(()=>{
              const m=activeMeas.find(x=>x.id===measId);
              if(!m) return null;
              const chartData=selGames.map((g,i)=>({
                name:shortDt(g.date),
                value:g.metrics?.[m.id]||0,
                game:g.name||t(gameTypeDef(g.type).labelKey),
                color:COLORS[i%COLORS.length],
              }));
              return(
                <div style={{...card(),padding:'14px 6px 10px',marginBottom:12}}>
                  <div style={{fontSize:13,fontWeight:700,color:G.text,marginBottom:8,paddingLeft:8}}>
                    {getMName(m)} — selected games
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData} margin={{top:5,right:10,bottom:28,left:-18}}>
                      <CartesianGrid strokeDasharray="3 3" stroke={G.border}/>
                      <XAxis dataKey="name" tick={{fontSize:9}} angle={-30} textAnchor="end" stroke={G.border}/>
                      <YAxis tick={{fontSize:10}} allowDecimals={false} stroke={G.border}/>
                      <Tooltip contentStyle={{background:G.card,border:`1px solid ${G.border}`,borderRadius:8,fontSize:12}}
                        formatter={(v,_,p)=>[v,p.payload.game]}/>
                      <Bar dataKey="value" radius={[4,4,0,0]}>
                        {chartData.map((entry,i)=>(
                          <rect key={i} fill={entry.color}/>
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            })()}

            {/* Summary stats row */}
            {activeMeas.length>0&&(
              <div style={{...card(),padding:'14px'}}>
                <div style={{fontSize:13,fontWeight:700,color:G.text,marginBottom:12}}>Category totals — {cat?.custom?cat.name:t(cat?.nameKey||'')}</div>
                {selGames.map((g,i)=>{
                  const catTotal=activeMeas.reduce((s,m)=>s+(g.metrics?.[m.id]||0),0);
                  const typeDef=gameTypeDef(g.type);
                  const barW=Math.round((catTotal/Math.max(...selGames.map(x=>activeMeas.reduce((s,m)=>s+(x.metrics?.[m.id]||0),0)),1))*100);
                  return(
                    <div key={g.id} style={{marginBottom:10}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                        <span style={{fontSize:12,fontWeight:700,color:COLORS[i%COLORS.length]}}>
                          {g.name||t(typeDef.labelKey)} <span style={{fontWeight:400,color:G.muted,fontSize:11}}>{shortDt(g.date)}</span>
                        </span>
                        <span style={{fontSize:16,fontWeight:900,color:COLORS[i%COLORS.length]}}>{catTotal}</span>
                      </div>
                      <div style={{height:8,background:G.grayL,borderRadius:4,overflow:'hidden'}}>
                        <div style={{height:'100%',borderRadius:4,width:barW+'%',background:COLORS[i%COLORS.length],transition:'width .4s'}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

// ─── Progress View ────────────────────────────────────────────────
const DEFAULT_SEGS=[
  {label:'1st Half', from:0,  to:45,  color:'#1565C0'},
  {label:'2nd Half', from:45, to:90,  color:'#E64A19'},
];

function ProgressView({games,categories,lang,setLang}){
  const t=useT();
  const allCats=categories.filter(c=>c.measures.some(m=>m.active));
  const [catId,      setCatId]      = useState(allCats[0]?.id||null);
  const [measId,     setMeasId]     = useState(null);
  const [lastN,      setLastN]      = useState(10);
  const [customN,    setCustomN]    = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [posFilter,  setPosFilter]  = useState('all');
  const [viewMode,   setViewMode]   = useState('trend');  // 'trend' | 'compare'
  // Trend scope — Full game OR custom minute range (one section, no duplication)
  const [rangeFrom,      setRangeFrom]      = useState(0);
  const [rangeTo,        setRangeTo]        = useState(90);
  const [useRange,       setUseRange]       = useState(false);
  const [rangeApplied,   setRangeApplied]   = useState({from:0,to:90});
  // Compare segments — user-defined time windows
  const [segments,       setSegments]       = useState(DEFAULT_SEGS);
  const [editingSeg,     setEditingSeg]     = useState(null);  // index or null
  const [focusSeg,       setFocusSeg]       = useState(null);  // null=all, index=focus

  const cat=categories.find(c=>c.id===catId);
  const activeMeasures=cat?.measures.filter(m=>m.active)||[];

  useEffect(()=>{
    const first=activeMeasures[0]?.id;
    if(!measId||!activeMeasures.find(m=>m.id===measId)) setMeasId(first||null);
  },[catId]);

  const getMName=()=>{
    const m=activeMeasures.find(x=>x.id===measId);
    return m?(m.custom?m.name:t(m.nameKey)):'';
  };

  const scope=useRange?{type:'range',from:rangeApplied.from,to:rangeApplied.to}:{type:'full'};
  const scopeLabel=useRange?`${rangeApplied.from}–${rangeApplied.to}′`:t('scope_full');

  const filtered=[...games]
    .filter(g=>typeFilter==='all'||g.type===typeFilter)
    .filter(g=>posFilter==='all'||String(g.position)===String(posFilter))
    .sort((a,b)=>new Date(a.date)-new Date(b.date));
  const effectiveN=customN!==''?(parseInt(customN)||filtered.length):lastN;
  const sliced=filtered.slice(-effectiveN);
  const hasEvents=sliced.some(g=>g.events?.length>0);

  // Trend chart data
  const chartData=sliced.map(g=>({name:shortDt(g.date),value:getValForScope(g,measId,scope)}));
  const vals=chartData.map(d=>d.value);
  const avgNum=vals.length?+(vals.reduce((s,v)=>s+v,0)/vals.length).toFixed(2):null;
  const avg=avgNum!=null?avgNum.toFixed(1):'—';
  const bestNum=vals.length?Math.max(...vals):null;
  const best=bestNum!=null?bestNum:'—';
  const lastVal=vals.length?vals[vals.length-1]:null;
  const lastDisp=lastVal!=null?lastVal:'—';
  const delta=lastVal!=null&&avgNum!=null?+(lastVal-avgNum).toFixed(1):null;
  const aboveAvg=delta!=null&&delta>0;
  const belowAvg=delta!=null&&delta<0;
  const barMax=Math.max(lastVal||0,avgNum||0,1);
  const lastPct=lastVal!=null?Math.round((lastVal/barMax)*100):0;
  const avgPct=avgNum!=null?Math.round((avgNum/barMax)*100):0;
  let trendKey='trend_stable';
  if(sliced.length>=4&&measId){
    const half=Math.floor(sliced.length/2);
    const rec=sliced.slice(-half).reduce((s,g)=>s+getValForScope(g,measId,scope),0)/half;
    const old=sliced.slice(0,half).reduce((s,g)=>s+getValForScope(g,measId,scope),0)/half;
    if(rec>old+0.3) trendKey='trend_up'; else if(rec<old-0.3) trendKey='trend_down';
  }

  // Compare chart data — one value per segment per game
  const compareData=sliced.map(g=>{
    const row={name:shortDt(g.date)};
    segments.forEach((seg,i)=>{ row[`s${i}`]=getSegVal(g,measId,seg); });
    return row;
  });

  const usedPos=[...new Set(games.map(g=>g.position).filter(Boolean))].sort((a,b)=>a-b);

  // Segment editor helpers
  const updateSeg=(i,patch)=>setSegments(ss=>ss.map((s,j)=>j===i?{...s,...patch}:s));
  const addSeg=()=>setSegments(ss=>[...ss,{label:`Part ${ss.length+1}`,from:0,to:45,color:['#2D8B2D','#534AB7','#BA7517'][ss.length%3]}]);
  const removeSeg=i=>setSegments(ss=>ss.filter((_,j)=>j!==i));

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      <AppHeader title={t('progress_title')} subtitle={t('progress_sub')} lang={lang} setLang={setLang}/>
      <div style={{flex:1,overflowY:'auto',padding:'12px 12px 90px'}}>
        {games.length<2?(
          <div style={{...card(),textAlign:'center',padding:'48px 20px'}}>
            <TrendingUp size={44} color={G.muted} style={{marginBottom:12}}/>
            <div style={{fontSize:16,fontWeight:700,color:G.sub}}>{t('play_2_games')}</div>
          </div>
        ):(
          <>
            {/* ── VIEW TABS ── */}
            <div style={{display:'flex',background:G.grayL,borderRadius:12,padding:3,marginBottom:12}}>
              {[['trend','📈 '+t('progress_title')],['compare','⚖️ '+t('compare_periods')]].map(([m,lbl])=>(
                <button key={m} onClick={()=>setViewMode(m)} style={{flex:1,padding:'9px 4px',border:'none',borderRadius:10,fontFamily:'inherit',fontSize:13,fontWeight:700,cursor:'pointer',background:viewMode===m?G.card:'transparent',color:viewMode===m?G.blue:G.sub,boxShadow:viewMode===m?'0 1px 4px rgba(0,0,0,.08)':'none'}}>{lbl}</button>
              ))}
            </div>

            {/* ── FILTERS (shared) ── */}
            <div style={{...card(),marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:G.sub,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>{t('filters')}</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:8}}>
                <button onClick={()=>setTypeFilter('all')} style={{padding:'5px 10px',border:`2px solid ${typeFilter==='all'?G.blue:G.border}`,borderRadius:8,background:typeFilter==='all'?G.blueBg:G.card,color:typeFilter==='all'?G.blue:G.sub,fontWeight:600,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>{t('all_types')}</button>
                {GAME_TYPE_DEFS.map(td=>(<button key={td.id} onClick={()=>setTypeFilter(td.id)} style={{padding:'5px 10px',border:`2px solid ${typeFilter===td.id?td.color:G.border}`,borderRadius:8,background:typeFilter===td.id?td.color+'18':G.card,color:typeFilter===td.id?td.color:G.sub,fontWeight:600,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>{t(td.labelKey)}</button>))}
              </div>
              {usedPos.length>0&&(
                <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:8}}>
                  <button onClick={()=>setPosFilter('all')} style={{padding:'5px 10px',border:`2px solid ${posFilter==='all'?G.orange:G.border}`,borderRadius:8,background:posFilter==='all'?G.orangeBg:G.card,color:posFilter==='all'?G.orange:G.sub,fontWeight:600,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>{t('all_types')}</button>
                  {usedPos.map(n=>{const p=posOf(n);return(<button key={n} onClick={()=>setPosFilter(String(n))} style={{padding:'5px 8px',border:`2px solid ${posFilter===String(n)?G.orange:G.border}`,borderRadius:8,background:posFilter===String(n)?G.orangeBg:G.card,color:posFilter===String(n)?G.orange:G.sub,fontWeight:600,fontSize:12,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:3}}><span style={{background:posFilter===String(n)?G.orange:G.muted,color:'white',borderRadius:3,width:16,height:16,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:900}}>{n}</span>{p.code}</button>);})}
                </div>
              )}
              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:6}}>
                {[5,10,20,50].map(n=>(<button key={n} onClick={()=>{setLastN(n);setCustomN('');}} style={{padding:'5px 10px',border:`2px solid ${lastN===n&&customN===''?G.blue:G.border}`,borderRadius:8,background:lastN===n&&customN===''?G.blueBg:G.card,color:lastN===n&&customN===''?G.blue:G.sub,fontWeight:600,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>{t('last_n',{n})}</button>))}
                <button onClick={()=>setCustomN(String(filtered.length))} style={{padding:'5px 10px',border:`2px solid ${G.border}`,borderRadius:8,background:G.card,color:G.sub,fontWeight:600,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>{t('all_types')}</button>
                <span style={{alignSelf:'center',fontSize:11,color:G.blue,fontWeight:700}}>({Math.min(effectiveN,filtered.length)}/{filtered.length})</span>
              </div>
              <input type="number" min={1} max={filtered.length} value={customN} onChange={e=>setCustomN(e.target.value)} placeholder={t('custom_n_ph')} style={inp({fontSize:13,padding:'8px 12px'})}/>
            </div>

            {/* ── CATEGORY + MEASURE ── */}
            <div style={{display:'flex',overflowX:'auto',gap:8,marginBottom:8,paddingBottom:4,scrollbarWidth:'none'}}>
              {allCats.map(c=>{const cn=c.custom?c.name:t(c.nameKey);return(
                <button key={c.id} onClick={()=>setCatId(c.id)} style={{padding:'6px 12px',border:`2px solid ${catId===c.id?c.color:G.border}`,borderRadius:20,background:catId===c.id?c.color:G.card,color:catId===c.id?'white':G.sub,fontWeight:700,fontSize:13,cursor:'pointer',whiteSpace:'nowrap',fontFamily:'inherit'}}>{cn}</button>
              );})}
            </div>
            <div style={{display:'flex',overflowX:'auto',gap:6,marginBottom:12,paddingBottom:4,scrollbarWidth:'none'}}>
              {activeMeasures.map(m=>{const mn=m.custom?m.name:t(m.nameKey);return(
                <button key={m.id} onClick={()=>setMeasId(m.id)} style={{padding:'5px 10px',border:`1px solid ${measId===m.id?(cat?.color||G.blue):G.border}`,borderRadius:14,background:measId===m.id?(cat?.color||G.blue)+'18':G.card,color:measId===m.id?(cat?.color||G.blue):G.sub,fontWeight:600,fontSize:12,cursor:'pointer',whiteSpace:'nowrap',fontFamily:'inherit'}}>{mn}</button>
              );})}
            </div>

            {/* ══════════ TREND VIEW ══════════ */}
            {viewMode==='trend'&&(
              <>
                {/* SINGLE TIME RANGE SECTION — no duplication */}
                <div style={{...card(),marginBottom:12}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                    <div style={{fontSize:12,fontWeight:700,color:G.sub,textTransform:'uppercase',letterSpacing:.5}}>{t('scope_label')}</div>
                    <div style={{display:'flex',background:G.grayL,borderRadius:8,padding:2}}>
                      <button onClick={()=>setUseRange(false)} style={{padding:'5px 10px',border:'none',borderRadius:7,fontFamily:'inherit',fontSize:12,fontWeight:700,cursor:'pointer',background:!useRange?G.card:'transparent',color:!useRange?G.blue:G.sub}}>{t('scope_full')}</button>
                      <button onClick={()=>setUseRange(true)}  style={{padding:'5px 10px',border:'none',borderRadius:7,fontFamily:'inherit',fontSize:12,fontWeight:700,cursor:'pointer',background:useRange?G.card:'transparent',color:useRange?G.blue:G.sub}}>{t('scope_range')}</button>
                    </div>
                  </div>
                  {useRange&&(
                    <>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:8}}>
                        <div><div style={{fontSize:11,color:G.sub,marginBottom:4}}>{t('from_min')}</div><input type="number" min={0} max={rangeTo-1} value={rangeFrom} onChange={e=>setRangeFrom(+e.target.value)} style={inp({padding:'8px 10px',fontSize:16,textAlign:'center',fontWeight:700})}/></div>
                        <div><div style={{fontSize:11,color:G.sub,marginBottom:4}}>{t('to_min')}</div><input type="number" min={rangeFrom+1} max={200} value={rangeTo} onChange={e=>setRangeTo(+e.target.value)} style={inp({padding:'8px 10px',fontSize:16,textAlign:'center',fontWeight:700})}/></div>
                      </div>
                      <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:8}}>
                        {[[0,45,'0–45'],[45,90,'45–90'],[0,10,'0–10'],[0,15,'0–15'],[0,30,'0–30'],[30,45,'30–45'],[45,60,'45–60'],[60,75,'60–75'],[75,90,'75–90'],[80,90,'80–90']].map(([f,to,lbl])=>(
                          <button key={lbl} onClick={()=>{setRangeFrom(f);setRangeTo(to);setRangeApplied({from:f,to});}} style={{padding:'4px 8px',border:`1px solid ${rangeApplied.from===f&&rangeApplied.to===to?G.blue:G.border}`,borderRadius:7,background:rangeApplied.from===f&&rangeApplied.to===to?G.blueBg:G.card,color:rangeApplied.from===f&&rangeApplied.to===to?G.blue:G.sub,fontWeight:600,fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>{lbl}′</button>
                        ))}
                      </div>
                      <button onClick={()=>setRangeApplied({from:rangeFrom,to:rangeTo})} style={{...btnSt(G.blue),width:'100%',padding:'9px',fontSize:13,borderRadius:10}}>
                        {t('apply_range')}: {rangeFrom}–{rangeTo}′
                      </button>
                      {!hasEvents&&<div style={{marginTop:8,fontSize:11,color:G.orange,fontWeight:600}}>ℹ️ {t('no_event_data')} — showing estimates</div>}
                    </>
                  )}
                </div>

                {/* SUMMARY STATS */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:12}}>
                  {[{l:t('average'),v:avg,col:cat?.color||G.blue},{l:t('best'),v:best,col:cat?.color||G.blue},{l:t('last_game'),v:lastDisp,col:aboveAvg?G.green:belowAvg?G.red:cat?.color||G.blue}].map(s=>(
                    <div key={s.l} style={{...card(),padding:'12px',textAlign:'center'}}>
                      <div style={{fontSize:22,fontWeight:900,color:s.col}}>{s.v}</div>
                      <div style={{fontSize:11,color:G.sub,marginTop:2}}>{s.l}</div>
                    </div>
                  ))}
                </div>

                {/* VS AVERAGE */}
                {sliced.length>=2&&lastVal!=null&&delta!==null&&(
                  <div style={{...card(),marginBottom:12}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:G.text}}>{t('vs_avg_title')}</div>
                        <div style={{fontSize:11,color:G.sub,marginTop:1}}>{scopeLabel} · {t('ref_avg',{n:sliced.length})}</div>
                      </div>
                      <span style={{background:aboveAvg?G.greenBg:belowAvg?G.redBg:G.grayL,color:aboveAvg?G.green:belowAvg?G.red:G.sub,borderRadius:20,padding:'3px 10px',fontSize:11,fontWeight:700}}>
                        {aboveAvg?t('vs_avg_above',{d:'+'+delta}):belowAvg?t('vs_avg_below',{d:delta}):t('vs_avg_equal')}
                      </span>
                    </div>
                    <div style={{marginBottom:8}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:4}}><span style={{fontSize:11,fontWeight:700,color:G.sub}}>{t('vs_avg_last')}</span><span style={{fontSize:20,fontWeight:900,color:aboveAvg?G.green:belowAvg?G.red:G.blue}}>{lastVal}</span></div>
                      <div style={{height:10,background:G.grayL,borderRadius:5,overflow:'hidden'}}><div style={{height:'100%',borderRadius:5,width:lastPct+'%',background:aboveAvg?G.green:belowAvg?G.red:G.blue,transition:'width .4s'}}/></div>
                    </div>
                    <div style={{marginBottom:10}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:4}}><span style={{fontSize:11,fontWeight:700,color:G.sub}}>{t('vs_avg_avg',{n:sliced.length})}</span><span style={{fontSize:20,fontWeight:900,color:G.sub}}>{avg}</span></div>
                      <div style={{height:10,background:G.grayL,borderRadius:5,overflow:'hidden'}}><div style={{height:'100%',borderRadius:5,width:avgPct+'%',background:G.muted,transition:'width .4s'}}/></div>
                    </div>
                    <div style={{background:G.grayL,borderRadius:8,padding:'7px 10px',fontSize:11,fontWeight:600,color:G.sub,textAlign:'center'}}>
                      {t(trendKey)} · {getMName()} · {scopeLabel}
                    </div>
                  </div>
                )}

                {/* LINE CHART */}
                {sliced.length>0&&(
                  <div style={{...card(),padding:'14px 6px 10px',marginBottom:12}}>
                    <div style={{fontSize:13,fontWeight:700,color:G.text,marginBottom:8,paddingLeft:8}}>{getMName()} — {scopeLabel}</div>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={chartData} margin={{top:5,right:14,bottom:0,left:-18}}>
                        <CartesianGrid strokeDasharray="3 3" stroke={G.border}/>
                        <XAxis dataKey="name" tick={{fontSize:10}} stroke={G.border}/>
                        <YAxis tick={{fontSize:10}} allowDecimals={false} stroke={G.border}/>
                        {avgNum!=null&&<ReferenceLine y={avgNum} stroke={G.muted} strokeDasharray="5 3" label={{value:`⌀ ${avgNum.toFixed(1)}`,position:'insideTopRight',fontSize:10,fill:G.sub}}/>}
                        <Tooltip contentStyle={{background:G.card,border:`1px solid ${G.border}`,borderRadius:8,fontSize:12}} formatter={v=>[v,getMName()]}/>
                        <Line type="monotone" dataKey="value" stroke={cat?.color||G.blue} strokeWidth={3} dot={{r:5,fill:cat?.color||G.blue,strokeWidth:0}} activeDot={{r:7}}/>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* ALL MEASURES BAR */}
                {activeMeasures.length>1&&sliced.length>0&&(
                  <div style={{...card(),padding:'14px 6px 10px'}}>
                    <div style={{fontSize:13,fontWeight:700,color:G.text,marginBottom:8,paddingLeft:8}}>{t('all_totals',{c:cat?.custom?cat.name:t(cat?.nameKey||'')})} — {scopeLabel}</div>
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={activeMeasures.map(m=>{const mn=m.custom?m.name:t(m.nameKey);return({name:mn.length>12?mn.slice(0,11)+'…':mn,value:sliced.reduce((s,g)=>s+getValForScope(g,m.id,scope),0)});})} margin={{top:5,right:14,bottom:28,left:-18}}>
                        <CartesianGrid strokeDasharray="3 3" stroke={G.border}/>
                        <XAxis dataKey="name" tick={{fontSize:9}} angle={-30} textAnchor="end" stroke={G.border}/>
                        <YAxis tick={{fontSize:10}} allowDecimals={false} stroke={G.border}/>
                        <Tooltip contentStyle={{background:G.card,border:`1px solid ${G.border}`,borderRadius:8,fontSize:12}}/>
                        <Bar dataKey="value" fill={cat?.color||G.blue} radius={[4,4,0,0]}/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            )}

            {/* ══════════ COMPARE VIEW ══════════ */}
            {viewMode==='compare'&&(
              <>
                {/* SEGMENT DEFINITIONS — user sets the time windows to compare */}
                <div style={{...card(),marginBottom:12}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                    <div style={{fontSize:12,fontWeight:700,color:G.sub,textTransform:'uppercase',letterSpacing:.5}}>Define time segments to compare</div>
                    {segments.length<4&&<button onClick={addSeg} style={{...btnSt(G.blue),padding:'5px 10px',fontSize:12,borderRadius:8}}><Plus size={12}/> Add</button>}
                  </div>
                  {segments.map((seg,i)=>(
                    <div key={i} style={{marginBottom:10,padding:'10px 12px',borderRadius:12,border:`2px solid ${seg.color}33`,background:seg.color+'08'}}>
                      {editingSeg===i?(
                        <div>
                          <div style={{display:'flex',gap:8,marginBottom:8,alignItems:'center'}}>
                            <input value={seg.label} onChange={e=>updateSeg(i,{label:e.target.value})} style={inp({flex:1,padding:'7px 10px',fontSize:13,fontWeight:700})} placeholder="Label"/>
                            <button onClick={()=>setEditingSeg(null)} style={{...btnSt(G.green),padding:'7px 12px'}}><Check size={14}/></button>
                            {segments.length>2&&<button onClick={()=>{removeSeg(i);setEditingSeg(null);}} style={{...btnSt(G.grayL,G.sub),padding:'7px 12px'}}><Trash2 size={14}/></button>}
                          </div>
                          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                            <div><div style={{fontSize:11,color:G.sub,marginBottom:3}}>{t('from_min')}</div><input type="number" min={0} max={seg.to-1} value={seg.from} onChange={e=>updateSeg(i,{from:+e.target.value})} style={inp({padding:'7px',fontSize:15,textAlign:'center',fontWeight:700})}/></div>
                            <div><div style={{fontSize:11,color:G.sub,marginBottom:3}}>{t('to_min')}</div><input type="number" min={seg.from+1} max={200} value={seg.to} onChange={e=>updateSeg(i,{to:+e.target.value})} style={inp({padding:'7px',fontSize:15,textAlign:'center',fontWeight:700})}/></div>
                          </div>
                          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                            {['#1565C0','#E64A19','#2D8B2D','#534AB7','#BA7517','#C62828'].map(c=>(
                              <button key={c} onClick={()=>updateSeg(i,{color:c})} style={{width:24,height:24,borderRadius:'50%',background:c,border:`3px solid ${seg.color===c?G.text:'transparent'}`,cursor:'pointer',flexShrink:0}}/>
                            ))}
                          </div>
                        </div>
                      ):(
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                          <div style={{display:'flex',alignItems:'center',gap:10}}>
                            <div style={{width:12,height:12,borderRadius:3,background:seg.color,flexShrink:0}}/>
                            <span style={{fontSize:14,fontWeight:700,color:G.text}}>{seg.label}</span>
                            <span style={{fontSize:12,color:G.sub}}>{seg.from}–{seg.to}′</span>
                          </div>
                          <button onClick={()=>setEditingSeg(i)} style={{background:'none',border:'none',cursor:'pointer',padding:4}}><Pencil size={14} color={G.blueL}/></button>
                        </div>
                      )}
                    </div>
                  ))}
                  {!hasEvents&&(
                    <div style={{padding:'8px 10px',background:G.orangeBg,borderRadius:8,fontSize:11,color:G.orange,fontWeight:600,marginTop:6}}>
                      ℹ️ {t('no_event_data')} — values estimated proportionally from total stats
                    </div>
                  )}
                </div>

                {/* FOCUS: which segment to highlight vs all */}
                <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:12}}>
                  <button onClick={()=>setFocusSeg(null)} style={{padding:'7px 12px',border:`2px solid ${focusSeg===null?G.blue:G.border}`,borderRadius:10,background:focusSeg===null?G.blueBg:G.card,color:focusSeg===null?G.blue:G.sub,fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>All segments</button>
                  {segments.map((seg,i)=>(
                    <button key={i} onClick={()=>setFocusSeg(i)} style={{padding:'7px 12px',border:`2px solid ${focusSeg===i?seg.color:G.border}`,borderRadius:10,background:focusSeg===i?seg.color+'18':G.card,color:focusSeg===i?seg.color:G.sub,fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>
                      {seg.label}
                    </button>
                  ))}
                </div>

                {/* FOCUS MODE: single segment vs its average */}
                {focusSeg!==null&&(()=>{
                  const seg=segments[focusSeg];
                  const sVals=sliced.map(g=>getSegVal(g,measId,seg));
                  const sData=sliced.map((g,i)=>({name:shortDt(g.date),value:sVals[i]}));
                  const sAvgNum=sVals.length?+(sVals.reduce((s,v)=>s+v,0)/sVals.length).toFixed(2):null;
                  const sLast=sVals.length?sVals[sVals.length-1]:null;
                  const sBest=sVals.length?Math.max(...sVals):null;
                  const sDelta=sLast!=null&&sAvgNum!=null?+(sLast-sAvgNum).toFixed(1):null;
                  const sAbove=sDelta!=null&&sDelta>0, sBelow=sDelta!=null&&sDelta<0;
                  return(
                    <>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:12}}>
                        {[{l:t('average'),v:sAvgNum!=null?sAvgNum.toFixed(1):'—'},{l:t('best'),v:sBest??'—'},{l:t('last_game'),v:sLast??'—'}].map(s=>(
                          <div key={s.l} style={{...card(),padding:'12px',textAlign:'center'}}>
                            <div style={{fontSize:22,fontWeight:900,color:seg.color}}>{s.v}</div>
                            <div style={{fontSize:11,color:G.sub,marginTop:2}}>{s.l}</div>
                          </div>
                        ))}
                      </div>
                      {sDelta!==null&&(
                        <div style={{...card(),marginBottom:12,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 14px'}}>
                          <div style={{fontSize:13,color:G.text}}>{seg.label}: last vs {t('ref_avg',{n:sliced.length})}</div>
                          <span style={{background:sAbove?G.greenBg:sBelow?G.redBg:G.grayL,color:sAbove?G.green:sBelow?G.red:G.sub,borderRadius:20,padding:'3px 12px',fontSize:12,fontWeight:700}}>
                            {sAbove?'+':''}{sDelta}
                          </span>
                        </div>
                      )}
                      <div style={{...card(),padding:'14px 6px 10px',marginBottom:12}}>
                        <div style={{fontSize:13,fontWeight:700,color:G.text,marginBottom:8,paddingLeft:8}}>
                          {getMName()} · {seg.label} ({seg.from}–{seg.to}′) — {sliced.length} games
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={sData} margin={{top:5,right:14,bottom:0,left:-18}}>
                            <CartesianGrid strokeDasharray="3 3" stroke={G.border}/>
                            <XAxis dataKey="name" tick={{fontSize:10}} stroke={G.border}/>
                            <YAxis tick={{fontSize:10}} allowDecimals={false} stroke={G.border}/>
                            {sAvgNum!=null&&<ReferenceLine y={sAvgNum} stroke={G.muted} strokeDasharray="5 3" label={{value:`⌀ ${sAvgNum.toFixed(1)}`,position:'insideTopRight',fontSize:10,fill:G.sub}}/>}
                            <Tooltip contentStyle={{background:G.card,border:`1px solid ${G.border}`,borderRadius:8,fontSize:12}} formatter={v=>[v,getMName()]}/>
                            <Line type="monotone" dataKey="value" stroke={seg.color} strokeWidth={3} dot={{r:5,fill:seg.color,strokeWidth:0}} activeDot={{r:7}}/>
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </>
                  );
                })()}

                {/* ALL SEGMENTS: averages summary + multi-line chart + grouped bar */}
                {focusSeg===null&&(
                  <>
                    {/* Per-segment averages */}
                    <div style={{...card(),marginBottom:12}}>
                      <div style={{fontSize:13,fontWeight:700,color:G.text,marginBottom:12}}>
                        {getMName()} — {t('ref_avg',{n:sliced.length})} per segment
                      </div>
                      {segments.map((seg,i)=>{
                        const sVals=sliced.map(g=>getSegVal(g,measId,seg));
                        const sAvg=sVals.length?+(sVals.reduce((s,v)=>s+v,0)/sVals.length).toFixed(1):0;
                        const sBest=sVals.length?Math.max(...sVals):0;
                        const sLast=sVals.length?sVals[sVals.length-1]:0;
                        const sMax=Math.max(...segments.flatMap(s2=>sliced.map(g=>getSegVal(g,measId,s2))),1);
                        return(
                          <div key={i} style={{marginBottom:12}}>
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                              <span style={{fontSize:13,fontWeight:700,color:seg.color}}>{seg.label} <span style={{fontWeight:400,fontSize:11,color:G.sub}}>({seg.from}–{seg.to}′)</span></span>
                              <div style={{display:'flex',gap:12,fontSize:11,color:G.sub}}>
                                <span>{t('average')}: <strong style={{color:seg.color}}>{sAvg}</strong></span>
                                <span>{t('best')}: <strong style={{color:seg.color}}>{sBest}</strong></span>
                                <span>{t('last_game')}: <strong style={{color:seg.color}}>{sLast}</strong></span>
                              </div>
                            </div>
                            <div style={{height:10,background:G.grayL,borderRadius:5,overflow:'hidden'}}>
                              <div style={{height:'100%',borderRadius:5,width:Math.round((sAvg/sMax)*100)+'%',background:seg.color,transition:'width .5s'}}/>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Multi-line chart */}
                    <div style={{...card(),padding:'14px 6px 10px',marginBottom:12}}>
                      <div style={{fontSize:13,fontWeight:700,color:G.text,marginBottom:6,paddingLeft:8}}>{getMName()} — segments over time</div>
                      <div style={{display:'flex',gap:14,paddingLeft:8,marginBottom:10}}>
                        {segments.map((seg,i)=>(
                          <span key={i} style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:seg.color,fontWeight:600}}>
                            <span style={{width:12,height:3,background:seg.color,display:'inline-block',borderRadius:2}}/>
                            {seg.label}
                          </span>
                        ))}
                      </div>
                      <ResponsiveContainer width="100%" height={210}>
                        <LineChart data={compareData} margin={{top:5,right:14,bottom:0,left:-18}}>
                          <CartesianGrid strokeDasharray="3 3" stroke={G.border}/>
                          <XAxis dataKey="name" tick={{fontSize:10}} stroke={G.border}/>
                          <YAxis tick={{fontSize:10}} allowDecimals={false} stroke={G.border}/>
                          <Tooltip contentStyle={{background:G.card,border:`1px solid ${G.border}`,borderRadius:8,fontSize:12}}/>
                          {segments.map((seg,i)=>(
                            <Line key={i} type="monotone" dataKey={`s${i}`} name={seg.label} stroke={seg.color} strokeWidth={2.5} dot={{r:4,fill:seg.color,strokeWidth:0}} activeDot={{r:6}}/>
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Grouped bar chart */}
                    <div style={{...card(),padding:'14px 6px 10px'}}>
                      <div style={{fontSize:13,fontWeight:700,color:G.text,marginBottom:8,paddingLeft:8}}>{getMName()} — per game by segment</div>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={compareData} margin={{top:5,right:14,bottom:28,left:-18}}>
                          <CartesianGrid strokeDasharray="3 3" stroke={G.border}/>
                          <XAxis dataKey="name" tick={{fontSize:9}} angle={-30} textAnchor="end" stroke={G.border}/>
                          <YAxis tick={{fontSize:10}} allowDecimals={false} stroke={G.border}/>
                          <Tooltip contentStyle={{background:G.card,border:`1px solid ${G.border}`,borderRadius:8,fontSize:12}}/>
                          {segments.map((seg,i)=>(
                            <Bar key={i} dataKey={`s${i}`} name={seg.label} fill={seg.color} radius={[3,3,0,0]}/>
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Edit Game ────────────────────────────────────────────────────
function EditGame({game, categories, onSave, onBack}){
  const t = useT();
  const [metrics,    setMetrics]    = useState({...(game.metrics||{})});
  const [minsPlayed, setMinsPlayed] = useState(game.minutesPlayed||0);
  const [position,   setPosition]   = useState(game.position||9);
  const [gameName,   setGameName]   = useState(game.name||'');
  const [activeCat,  setActiveCat]  = useState(null);
  const [showPosPick,setShowPosPick]= useState(false);

  const activeCats = categories.filter(c=>c.measures.some(m=>m.active));
  const currentCat = activeCats.find(c=>c.id===activeCat)||activeCats[0];
  const pos        = posOf(position);
  const total      = Object.values(metrics).reduce((s,v)=>s+v,0);
  const typeDef    = gameTypeDef(game.type);

  const inc = id => setMetrics(m=>({...m,[id]:(m[id]||0)+1}));
  const dec = id => setMetrics(m=>({...m,[id]:Math.max(0,(m[id]||0)-1)}));

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({...game, name:gameName.trim()||game.name, minutesPlayed:minsPlayed, position, metrics});
    setSaving(false);
  };

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%",position:"relative"}}>
      <AppHeader title={t("edit_game_title")}
        subtitle={`${t(typeDef.labelKey)} · ${game.date ? new Date(game.date).toLocaleDateString('pl-PL',{day:"numeric",month:"short",year:"numeric"}) : ""}`}
        onBack={onBack}/>
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 90px"}}>

        {/* Game name */}
        <div style={{...card(),marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:700,color:G.sub,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>{t("game_name_opt")}</div>
          <input value={gameName} onChange={e=>setGameName(e.target.value)} placeholder={t("game_name_ph")} style={inp()}/>
        </div>

        {/* Minutes played */}
        <div style={{...card(),marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:700,color:G.sub,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>{t("min_played")}</div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>setMinsPlayed(m=>Math.max(0,m-1))} style={{...btnSt(G.grayL,G.sub),padding:"10px 20px"}}><Minus size={16}/></button>
            <span style={{fontSize:36,fontWeight:900,color:G.blue,flex:1,textAlign:"center"}}>{minsPlayed}</span>
            <button onClick={()=>setMinsPlayed(m=>m+1)} style={{...btnSt(G.grayL,G.sub),padding:"10px 20px"}}><Plus size={16}/></button>
          </div>
        </div>

        {/* Position */}
        <div style={{...card(),marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:700,color:G.sub,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>{t("position_label")}</div>
          <button onClick={()=>setShowPosPick(true)} style={{width:"100%",padding:"12px",border:`2px solid ${G.border}`,borderRadius:12,background:G.card,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:12}}>
            <span style={{background:G.orange,color:"white",borderRadius:8,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,flexShrink:0}}>{pos.num}</span>
            <div style={{textAlign:"left"}}>
              <div style={{fontSize:15,fontWeight:700,color:G.text}}>{pos.code} — {t(pos.nameKey)}</div>
              <div style={{fontSize:12,color:G.sub}}>{t("tap_to_change")}</div>
            </div>
            <ChevronDown size={18} color={G.muted} style={{marginLeft:"auto"}}/>
          </button>
        </div>

        {/* Stats section */}
        <div style={{marginBottom:10}}>
          <div style={{fontSize:15,fontWeight:700,color:G.text,marginBottom:8}}>
            {t("edit_stats_label")} <span style={{fontSize:13,fontWeight:400,color:G.sub}}>({total} {t("events")})</span>
          </div>
        </div>

        {/* Category tabs */}
        <div style={{display:"flex",overflowX:"auto",gap:6,marginBottom:12,paddingBottom:4,scrollbarWidth:"none"}}>
          {activeCats.map(c=>{
            const cn=c.custom?c.name:t(c.nameKey);
            const catActive=activeCat===c.id||(activeCat===null&&activeCats[0]?.id===c.id);
            return(
              <button key={c.id} onClick={()=>setActiveCat(c.id)} style={{
                padding:"7px 14px",border:`2px solid ${catActive?c.color:G.border}`,
                borderRadius:20,background:catActive?c.color:G.card,
                color:catActive?"white":G.sub,fontWeight:700,fontSize:13,
                cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit",flexShrink:0,
              }}>{cn}</button>
            );
          })}
        </div>

        {/* Measure counters — same UI as active game */}
        {currentCat&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
            {currentCat.measures.filter(m=>m.active).map(m=>{
              const count = metrics[m.id]||0;
              const mName = m.custom?m.name:t(m.nameKey);
              return(
                <div key={m.id} style={{
                  background:G.card,borderRadius:16,
                  border:`2px solid ${count>0?currentCat.color:G.border}`,
                  padding:"14px 10px",display:"flex",flexDirection:"column",alignItems:"center",gap:8,
                  transition:"border-color .15s",
                }}>
                  <div style={{fontSize:12,fontWeight:600,color:G.sub,textAlign:"center",lineHeight:1.3}}>{mName}</div>
                  <div style={{fontSize:52,fontWeight:900,lineHeight:1,color:count>0?currentCat.color:G.text}}>{count}</div>
                  <div style={{display:"flex",gap:6,width:"100%"}}>
                    <button onClick={()=>dec(m.id)} style={{flex:1,padding:"10px 0",background:G.grayL,border:"none",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:20,color:G.sub,fontFamily:"inherit"}}>−</button>
                    <button onClick={()=>inc(m.id)} style={{flex:2,padding:"10px 0",background:currentCat.color,border:"none",borderRadius:8,cursor:"pointer",fontWeight:900,fontSize:20,color:"white",fontFamily:"inherit"}}>+</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button onClick={handleSave} disabled={saving} style={{...btnSt(saving?G.muted:G.green),width:"100%",padding:"16px",fontSize:16,borderRadius:14,boxShadow:"0 6px 16px rgba(45,139,45,0.28)"}}>
          <Check size={18}/> {saving?'Saving…':t("save_changes")}
        </button>
      </div>
      {showPosPick&&(
        <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,zIndex:40}}>
          <PositionPicker current={position} onSelect={n=>{setPosition(n);setShowPosPick(false);}} onClose={()=>setShowPosPick(false)}/>
        </div>
      )}
    </div>
  );
}

function SettingsPage({categories,setCategories,playerName,setPlayerName,age,setAge,username,onLogout,onDonate,onFeedback,lang,setLang}){
  const t=useT();
  const [editPlayer,setEditPlayer]=useState(false);
  const [tempName,  setTempName] =useState(playerName);
  const [editAge,   setEditAge]  =useState(false);
  const [tempAge,   setTempAge]  =useState(age||'');
  const [expanded,  setExpanded] =useState(null);
  const [addingTo,  setAddingTo] =useState(null);
  const [newMeas,   setNewMeas]  =useState('');
  const [editCatId, setEditCatId]=useState(null);
  const [editCatNm, setEditCatNm]=useState('');
  const [showAddCat,setShowAddCat]=useState(false);
  const [newCatNm,  setNewCatNm] =useState('');
  const [newCatCol, setNewCatCol]=useState(CAT_COLORS[0]);
  const toggleM=(cid,mid)=>setCategories(cs=>cs.map(c=>c.id===cid?{...c,measures:c.measures.map(m=>m.id===mid?{...m,active:!m.active}:m)}:c));
  const addM=cid=>{if(!newMeas.trim())return;const id=newMeas.trim().toLowerCase().replace(/\s+/g,'_')+'_'+uid();setCategories(cs=>cs.map(c=>c.id===cid?{...c,measures:[...c.measures,{id,name:newMeas.trim(),active:true,custom:true}]}:c));setNewMeas('');setAddingTo(null);};
  const delM=(cid,mid)=>setCategories(cs=>cs.map(c=>c.id===cid?{...c,measures:c.measures.filter(m=>m.id!==mid)}:c));
  const saveCat=cid=>{if(!editCatNm.trim())return;setCategories(cs=>cs.map(c=>c.id===cid?{...c,name:editCatNm.trim(),custom:true}:c));setEditCatId(null);};
  const delCat=cid=>setCategories(cs=>cs.filter(c=>c.id!==cid));
  const addCat=()=>{if(!newCatNm.trim())return;const id=newCatNm.trim().toLowerCase().replace(/\s+/g,'_')+'_'+uid();setCategories(cs=>[...cs,{id,name:newCatNm.trim(),color:newCatCol,measures:[],custom:true}]);setNewCatNm('');setShowAddCat(false);};

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      <AppHeader title={t('settings_title')} subtitle={t('account_label',{u:username})} lang={lang} setLang={setLang}/>
      <div style={{flex:1,overflowY:'auto',padding:'16px 16px 90px'}}>
        {/* Account */}
        <div style={{...card(),marginBottom:14,background:G.blue}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:40,height:40,borderRadius:'50%',background:'rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center'}}><User size={20} color="white"/></div>
              <div><div style={{fontSize:15,fontWeight:700,color:'white'}}>{username}</div><div style={{fontSize:12,color:'rgba(255,255,255,.65)'}}>{t('signed_in')}</div></div>
            </div>
            <button onClick={onLogout} style={{background:'rgba(255,255,255,.15)',border:'1px solid rgba(255,255,255,.3)',borderRadius:8,padding:'7px 12px',color:'white',cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontFamily:'inherit',fontSize:13,fontWeight:600}}><LogOut size={14}/> {t('sign_out')}</button>
          </div>
        </div>
        {/* Language */}
        <div style={{...card(),marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:700,color:G.sub,textTransform:'uppercase',letterSpacing:.5,marginBottom:12}}>{t('language_label')}</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {LANGS.map(l=>(
              <button key={l.code} onClick={()=>setLang(l.code)} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 12px',border:`2px solid ${lang===l.code?G.blue:G.border}`,borderRadius:10,background:lang===l.code?G.blueBg:G.card,cursor:'pointer',fontFamily:'inherit',fontWeight:lang===l.code?700:400}}>
                <span style={{fontSize:18}}>{l.flag}</span>
                <span style={{fontSize:13,color:lang===l.code?G.blue:G.text}}>{l.name}</span>
              </button>
            ))}
          </div>
        </div>
        {/* Player name */}
        <div style={{...card(),marginBottom:10}}>
          <div style={{fontSize:12,fontWeight:700,color:G.sub,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>{t('player_name')}</div>
          {editPlayer?(
            <div style={{display:'flex',gap:8}}><input value={tempName} onChange={e=>setTempName(e.target.value)} autoFocus onKeyDown={e=>{if(e.key==='Enter'){setPlayerName(tempName);setEditPlayer(false);}}} style={inp({flex:1})}/><button onClick={()=>{setPlayerName(tempName);setEditPlayer(false);}} style={{...btnSt(G.green),padding:'10px 14px'}}><Check size={16}/></button><button onClick={()=>setEditPlayer(false)} style={{...btnSt(G.grayL,G.sub),padding:'10px 14px'}}><X size={16}/></button></div>
          ):(
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:16,fontWeight:600,color:G.text}}>{playerName}</span><button onClick={()=>{setTempName(playerName);setEditPlayer(true);}} style={{background:'none',border:'none',cursor:'pointer',color:G.blueL,fontWeight:600,fontFamily:'inherit',fontSize:13}}>{t('edit_btn')}</button></div>
          )}
        </div>
        {/* Age */}
        <div style={{...card(),marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:G.sub,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>{t('age_label')} <span style={{fontSize:11,fontWeight:400,textTransform:'none',color:G.muted}}>({t('optional')})</span></div>
          {editAge?(
            <div style={{display:'flex',gap:8}}><input type="number" min={3} max={99} value={tempAge} onChange={e=>setTempAge(e.target.value)} autoFocus placeholder={t('age_ph')} onKeyDown={e=>{if(e.key==='Enter'){setAge(tempAge?Number(tempAge):null);setEditAge(false);}}} style={inp({flex:1})}/><button onClick={()=>{setAge(tempAge?Number(tempAge):null);setEditAge(false);}} style={{...btnSt(G.green),padding:'10px 14px'}}><Check size={16}/></button><button onClick={()=>setEditAge(false)} style={{...btnSt(G.grayL,G.sub),padding:'10px 14px'}}><X size={16}/></button></div>
          ):(
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:16,fontWeight:600,color:G.text}}>{age?t('years_old',{n:age}):t('not_set')}</span><button onClick={()=>{setTempAge(age||'');setEditAge(true);}} style={{background:'none',border:'none',cursor:'pointer',color:G.blueL,fontWeight:600,fontFamily:'inherit',fontSize:13}}>{t('edit_btn')}</button></div>
          )}
        </div>
        {/* Donate + Feedback */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
          <button onClick={onFeedback} style={{...btnSt(G.blueBg,G.blue),padding:'14px',borderRadius:12,border:`1px solid ${G.blue}22`}}><MessageSquare size={17}/> {t('feedback_btn')}</button>
          <button onClick={onDonate} style={{...btnSt(G.orangeBg,G.orange),padding:'14px',borderRadius:12,border:`1px solid ${G.orange}44`}}><Heart size={17}/> {t('donate_btn')} ☕</button>
        </div>

        {/* Categories */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div style={{fontSize:12,fontWeight:700,color:G.sub,textTransform:'uppercase',letterSpacing:.5}}>{t('cats_measures')}</div>
          <button onClick={()=>setShowAddCat(s=>!s)} style={{...btnSt(G.blue),padding:'6px 12px',fontSize:12,borderRadius:8}}><Plus size={13}/> {t('add_btn')}</button>
        </div>
        {showAddCat&&(
          <div style={{...card(),marginBottom:12,border:`2px dashed ${G.blue}`}}>
            <div style={{fontSize:13,fontWeight:700,color:G.text,marginBottom:10}}>{t('new_category')}</div>
            <input value={newCatNm} onChange={e=>setNewCatNm(e.target.value)} placeholder={t('cat_name_ph')} autoFocus onKeyDown={e=>e.key==='Enter'&&addCat()} style={inp({marginBottom:10})}/>
            <div style={{fontSize:12,color:G.sub,marginBottom:8}}>{t('colour_label')}</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>
              {CAT_COLORS.map(c=>(<button key={c} onClick={()=>setNewCatCol(c)} style={{width:28,height:28,borderRadius:'50%',background:c,border:`3px solid ${newCatCol===c?G.text:'transparent'}`,cursor:'pointer',flexShrink:0}}/>))}
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={addCat} style={{...btnSt(G.green),flex:1,padding:'10px'}}><Check size={14}/> {t('add_btn')}</button>
              <button onClick={()=>{setShowAddCat(false);setNewCatNm('');}} style={{...btnSt(G.grayL,G.sub),flex:1,padding:'10px'}}><X size={14}/> {t('cancel_btn')}</button>
            </div>
          </div>
        )}
        {categories.map(cat=>{
          const catName=cat.custom?cat.name:t(cat.nameKey||cat.name);
          return(
            <div key={cat.id} style={{...card(),marginBottom:10}}>
              {editCatId===cat.id?(
                <div style={{display:'flex',gap:8}}><input value={editCatNm} onChange={e=>setEditCatNm(e.target.value)} autoFocus onKeyDown={e=>{if(e.key==='Enter')saveCat(cat.id);}} style={inp({flex:1,fontSize:14})}/><button onClick={()=>saveCat(cat.id)} style={{...btnSt(G.green),padding:'8px 12px'}}><Check size={14}/></button><button onClick={()=>setEditCatId(null)} style={{...btnSt(G.grayL,G.sub),padding:'8px 12px'}}><X size={14}/></button></div>
              ):(
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <button onClick={()=>setExpanded(expanded===cat.id?null:cat.id)} style={{flex:1,background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:10,padding:0,fontFamily:'inherit',textAlign:'left'}}>
                    <div style={{width:12,height:12,borderRadius:'50%',background:cat.color,flexShrink:0}}/>
                    <span style={{fontSize:15,fontWeight:700,color:G.text}}>{catName}</span>
                    <span style={{fontSize:12,color:G.muted}}>{cat.measures.filter(m=>m.active).length}/{cat.measures.length} {t('active_label')}</span>
                    {expanded===cat.id?<ChevronUp size={16} color={G.muted}/>:<ChevronDown size={16} color={G.muted}/>}
                  </button>
                  <div style={{display:'flex',gap:4,marginLeft:8}}>
                    <button onClick={()=>{setEditCatId(cat.id);setEditCatNm(catName);}} style={{background:'none',border:'none',cursor:'pointer',padding:4}}><Pencil size={14} color={G.blueL}/></button>
                    {cat.custom&&<button onClick={()=>delCat(cat.id)} style={{background:'none',border:'none',cursor:'pointer',padding:4}}><Trash2 size={14} color={G.muted}/></button>}
                  </div>
                </div>
              )}
              {expanded===cat.id&&(
                <div style={{marginTop:12}}>
                  {cat.measures.map(m=>{
                    const mn=m.custom?m.name:t(m.nameKey||m.name);
                    return(
                      <div key={m.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 0',borderTop:`1px solid ${G.border}`}}>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <span style={{fontSize:14,color:G.text}}>{mn}</span>
                          {m.custom&&<span style={pill(G.orangeBg,G.orange,{fontSize:10})}>{t('custom_badge')}</span>}
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          {m.custom&&<button onClick={()=>delM(cat.id,m.id)} style={{background:'none',border:'none',cursor:'pointer',padding:2}}><Trash2 size={13} color={G.muted}/></button>}
                          <div onClick={()=>toggleM(cat.id,m.id)} style={{width:46,height:26,borderRadius:13,cursor:'pointer',background:m.active?cat.color:G.border,position:'relative',transition:'background .2s',flexShrink:0}}>
                            <div style={{position:'absolute',top:3,left:m.active?23:3,width:20,height:20,borderRadius:'50%',background:'white',transition:'left .2s',boxShadow:'0 1px 3px rgba(0,0,0,.2)'}}/>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {addingTo===cat.id?(
                    <div style={{display:'flex',gap:6,marginTop:10,paddingTop:10,borderTop:`1px solid ${G.border}`}}>
                      <input value={newMeas} onChange={e=>setNewMeas(e.target.value)} placeholder={t('measure_name_ph')} autoFocus onKeyDown={e=>e.key==='Enter'&&addM(cat.id)} style={inp({flex:1,padding:'8px 10px',fontSize:13})}/>
                      <button onClick={()=>addM(cat.id)} style={{...btnSt(G.green),padding:'8px 12px'}}><Check size={14}/></button>
                      <button onClick={()=>{setAddingTo(null);setNewMeas('');}} style={{...btnSt(G.grayL,G.sub),padding:'8px 12px'}}><X size={14}/></button>
                    </div>
                  ):(
                    <button onClick={()=>setAddingTo(cat.id)} style={{width:'100%',marginTop:10,padding:'9px',border:`1px dashed ${G.border}`,borderRadius:8,background:'none',color:G.blueL,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:4}}>
                      <Plus size={14}/> {t('add_measure')}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Game Edit Screen ─────────────────────────────────────────────
function GameEditScreen({game, categories, onSave, onBack, lang, setLang}){
  const t=useT();
  const [name,    setName]    =useState(game.name||'');
  const [date,    setDate]    =useState(game.date||new Date().toISOString().slice(0,10));
  const [type,    setType]    =useState(game.type||'friendly');
  const [minsPlayed,setMinsPlayed]=useState(game.minutesPlayed||0);
  const [position,setPosition]=useState(game.position||9);
  // Per-period metrics editing — init from saved game
  const periods=game.periods||1;
  const [periodMetrics,setPeriodMetrics]=useState(()=>{
    if((game.periodMetrics||[])&&(game.periodMetrics||[]).length===periods) return (game.periodMetrics||[]).map(p=>({...p}));
    // Backwards-compat: if no periodMetrics, put all in period 0
    return Array.from({length:periods},(_,i)=>i===0?{...(game.metrics||{})}:{});
  });
  const [viewPeriod,setViewPeriod]=useState(periods>1?0:'flat');
  const [activeTab, setActiveTab]=useState('stats'); // 'stats' | 'details'
  const [activeCat, setActiveCat]=useState(categories.filter(c=>c.measures.some(m=>m.active))[0]?.id);
  const [showPos,   setShowPos]  =useState(false);

  // Derived totals
  const totalMetrics=sumMetrics(periodMetrics);

  const inc=(pid,mid)=>setPeriodMetrics(pm=>{const n=[...pm];n[pid]={...n[pid],[mid]:(n[pid][mid]||0)+1};return n;});
  const dec=(pid,mid)=>setPeriodMetrics(pm=>{const n=[...pm];n[pid]={...n[pid],[mid]:Math.max(0,(n[pid][mid]||0)-1)};return n;});

  const editPid=viewPeriod==='flat'?0:viewPeriod;
  const displayMetrics=periods>1?periodMetrics[editPid]||{}:totalMetrics;
  const currentCat=categories.find(c=>c.id===activeCat);
  const pos=posOf(position);
  const typeDef=gameTypeDef(type);
  const activeCats=categories.filter(c=>c.measures.some(m=>m.active));

  const handleSave=()=>{
    onSave({
      ...game,
      name:name.trim(), date, type, minutesPlayed:minsPlayed, position, periods,
      metrics:sumMetrics(periodMetrics),
      periodMetrics,
    });
  };

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      <AppHeader title={t('edit_game')} subtitle={game.name||shortDt(game.date)} onBack={onBack} lang={lang} setLang={setLang}/>

      {/* Tab bar */}
      <div style={{display:'flex',background:G.card,borderBottom:`1px solid ${G.border}`,flexShrink:0}}>
        {[['stats',t('edit_stats')],['details',t('edit_meta')]].map(([k,l])=>(
          <button key={k} onClick={()=>setActiveTab(k)} style={{
            flex:1,padding:'12px',border:'none',background:'none',
            borderBottom:`3px solid ${activeTab===k?G.blue:'transparent'}`,
            color:activeTab===k?G.blue:G.sub,fontWeight:activeTab===k?700:400,
            fontSize:14,cursor:'pointer',fontFamily:'inherit',
          }}>{l}</button>
        ))}
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'16px 16px 100px'}}>

        {/* ── STATS TAB ── */}
        {activeTab==='stats'&&(
          <>
            {/* Period selector */}
            {periods>1&&(
              <div style={{display:'flex',overflowX:'auto',gap:6,marginBottom:14,scrollbarWidth:'none',paddingBottom:2}}>
                {Array.from({length:periods},(_,i)=>(
                  <button key={i} onClick={()=>setViewPeriod(i)} style={{
                    padding:'6px 14px',border:`2px solid ${viewPeriod===i?G.orange:G.border}`,
                    borderRadius:20,background:viewPeriod===i?G.orangeBg:G.card,
                    color:viewPeriod===i?G.orange:G.sub,fontWeight:700,fontSize:13,
                    cursor:'pointer',whiteSpace:'nowrap',fontFamily:'inherit',
                  }}>{t(periodKey(periods,i+1),{n:i+1})}</button>
                ))}
                <button onClick={()=>setViewPeriod('flat')} style={{
                  padding:'6px 14px',border:`2px solid ${viewPeriod==='flat'?G.blue:G.border}`,
                  borderRadius:20,background:viewPeriod==='flat'?G.blueBg:G.card,
                  color:viewPeriod==='flat'?G.blue:G.sub,fontWeight:700,fontSize:13,
                  cursor:'pointer',whiteSpace:'nowrap',fontFamily:'inherit',
                }}>{t('total_tab')}</button>
              </div>
            )}

            {/* Readonly total banner when viewing "total" tab in multi-period */}
            {viewPeriod==='flat'&&periods>1&&(
              <div style={{...card(),marginBottom:12,background:G.grayL}}>
                <div style={{fontSize:12,color:G.sub,marginBottom:8,fontWeight:600}}>{t('total_tab')} — {t('edit_stats').toLowerCase()}</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {Object.entries(totalMetrics).filter(([,v])=>v>0).map(([id,v])=>{
                    let nm=id,col=G.blue;
                    for(const c of categories){const m=c.measures.find(m=>m.id===id);if(m){nm=m.custom?m.name:t(m.nameKey);col=c.color;break;}}
                    return <span key={id} style={pill(col+'18',col)}>{nm}: {v}</span>;
                  })}
                </div>
                <div style={{fontSize:11,color:G.muted,marginTop:8}}>↓ Edit individual periods below</div>
              </div>
            )}

            {/* Category tabs */}
            {(viewPeriod!=='flat'||periods===1)&&(
              <>
                <div style={{display:'flex',overflowX:'auto',gap:6,marginBottom:12,scrollbarWidth:'none'}}>
                  {activeCats.map(c=>{const cn=c.custom?c.name:t(c.nameKey);return(
                    <button key={c.id} onClick={()=>setActiveCat(c.id)} style={{
                      padding:'5px 12px',border:`2px solid ${activeCat===c.id?c.color:G.border}`,
                      borderRadius:16,background:activeCat===c.id?c.color:G.card,
                      color:activeCat===c.id?'white':G.sub,fontWeight:activeCat===c.id?700:400,
                      fontSize:12,cursor:'pointer',whiteSpace:'nowrap',fontFamily:'inherit',
                    }}>{cn}</button>
                  );})}
                </div>

                {/* Measure edit grid */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  {currentCat?.measures.filter(m=>m.active).map(m=>{
                    const pid=periods===1?0:editPid;
                    const count=(periodMetrics[pid]||{})[m.id]||0;
                    const mName=m.custom?m.name:t(m.nameKey);
                    const totalCount=totalMetrics[m.id]||0;
                    return(
                      <div key={m.id} style={{background:G.card,borderRadius:14,border:`2px solid ${count>0?currentCat.color:G.border}`,padding:'12px 10px',display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
                        <div style={{fontSize:11,fontWeight:600,color:G.sub,textAlign:'center',lineHeight:1.3}}>{mName}</div>
                        <div style={{fontSize:44,fontWeight:900,lineHeight:1,color:count>0?currentCat.color:G.text}}>{count}</div>
                        {periods>1&&<div style={{fontSize:10,color:G.muted}}>{totalCount} {t('period_total')}</div>}
                        <div style={{display:'flex',gap:5,width:'100%'}}>
                          <button onClick={()=>dec(pid,m.id)} style={{flex:1,padding:'8px 0',background:G.grayL,border:'none',borderRadius:8,cursor:'pointer',fontWeight:700,fontSize:18,color:G.sub,fontFamily:'inherit'}}>−</button>
                          <button onClick={()=>inc(pid,m.id)} style={{flex:2,padding:'8px 0',background:currentCat.color,border:'none',borderRadius:8,cursor:'pointer',fontWeight:900,fontSize:18,color:'white',fontFamily:'inherit'}}>+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* ── DETAILS TAB ── */}
        {activeTab==='details'&&(
          <>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:700,color:G.sub,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>{t('game_name_opt')}</div>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder={t('game_name_ph')} style={inp()}/>
            </div>

            <div style={{marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:700,color:G.sub,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>{t('type_label')}</div>
              <div style={{display:'flex',gap:8}}>
                {GAME_TYPE_DEFS.map(td=>(
                  <button key={td.id} onClick={()=>setType(td.id)} style={{flex:1,padding:'11px 4px',border:`2px solid ${type===td.id?td.color:G.border}`,borderRadius:12,background:type===td.id?td.color+'18':G.card,color:type===td.id?td.color:G.sub,fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>{t(td.labelKey)}</button>
                ))}
              </div>
            </div>

            <div style={{marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:700,color:G.sub,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>{t('date_label')}</div>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={inp()}/>
            </div>

            <div style={{marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:700,color:G.sub,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>{t('min_played')}</div>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <button onClick={()=>setMinsPlayed(m=>Math.max(0,m-1))} style={{...btnSt(G.grayL,G.sub),padding:'10px 20px'}}><Minus size={16}/></button>
                <span style={{fontSize:32,fontWeight:900,color:G.blue,flex:1,textAlign:'center'}}>{minsPlayed}</span>
                <button onClick={()=>setMinsPlayed(m=>m+1)} style={{...btnSt(G.grayL,G.sub),padding:'10px 20px'}}><Plus size={16}/></button>
              </div>
            </div>

            <div style={{marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:700,color:G.sub,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>{t('position_label')}</div>
              <button onClick={()=>setShowPos(s=>!s)} style={{width:'100%',padding:'12px',border:`2px solid ${G.border}`,borderRadius:12,background:G.card,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:12}}>
                <span style={{background:G.orange,color:'white',borderRadius:7,width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:900,flexShrink:0}}>{pos.num}</span>
                <div style={{textAlign:'left'}}>
                  <div style={{fontSize:14,fontWeight:700,color:G.text}}>{pos.code} — {t(pos.nameKey)}</div>
                  <div style={{fontSize:11,color:G.sub}}>{t('tap_to_change')}</div>
                </div>
                <ChevronDown size={16} color={G.muted} style={{marginLeft:'auto'}}/>
              </button>
              {showPos&&(
                <div style={{...card(),marginTop:8,padding:'14px'}}>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {POSITIONS.map(p=>(
                      <button key={p.num} onClick={()=>{setPosition(p.num);setShowPos(false);}} style={{display:'flex',alignItems:'center',gap:5,padding:'5px 9px',border:`2px solid ${position===p.num?G.orange:G.border}`,borderRadius:9,background:position===p.num?G.orangeBg:G.card,cursor:'pointer',fontFamily:'inherit'}}>
                        <span style={{background:position===p.num?G.orange:G.muted,color:'white',borderRadius:4,width:18,height:18,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:900}}>{p.num}</span>
                        <span style={{fontSize:11,fontWeight:700,color:G.text}}>{p.code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Sticky save bar */}
      <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:520,background:G.card,borderTop:`1px solid ${G.border}`,padding:'12px 16px',zIndex:50}}>
        <button onClick={handleSave} style={{...btnSt(G.green),width:'100%',padding:'15px',fontSize:16,borderRadius:12,boxShadow:'0 4px 12px rgba(45,139,45,0.25)'}}>
          <Check size={18}/> {t('save_changes')}
        </button>
      </div>
    </div>
  );
}

// ─── Export Screen ────────────────────────────────────────────────
function ExportScreen({games,categories,playerName,onBack,lang,setLang}){
  const t=useT();
  const [status,   setStatus]   = useState('');
  const [selected, setSelected] = useState(new Set());
  const [selMode,  setSelMode]  = useState(false);

  const sorted = [...games].sort((a,b)=>new Date(b.date)-new Date(a.date));
  const exportSet = selMode && selected.size>0
    ? sorted.filter(g=>selected.has(g.id))
    : sorted;

  const toggleSel = id => setSelected(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n;});
  const selAll    = ()  => setSelected(new Set(sorted.map(g=>g.id)));
  const selNone   = ()  => setSelected(new Set());

  const totalEvents = exportSet.reduce((s,g)=>s+(g.events?.length||0),0);

  const measureName = id => {
    for(const c of categories){const m=c.measures.find(m=>m.id===id);if(m) return m.custom?m.name:t(m.nameKey);}
    return id;
  };
  const allMetrics = [...new Set(exportSet.flatMap(g=>Object.keys(g.metrics||{})))];

  const escCSV = v => {
    if(v==null) return '';
    const s=String(v);
    return s.includes(',')||s.includes('"')||s.includes('\n')?`"${s.replace(/"/g,'""')}"`  :s;
  };
  const rowCSV = (...cols) => cols.map(escCSV).join(',')+'\n';

  const downloadFile = (content,filename,mime='text/csv') => {
    const blob=new Blob([content],{type:mime});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download=filename;a.click();
    URL.revokeObjectURL(url);
  };

  const stamp = ()=>new Date().toISOString().slice(0,10);
  const safeName = playerName.replace(/\s+/g,'_');

  const exportEvents = () => {
    if(!exportSet.length){setStatus(t('export_no_data'));return;}
    let csv=rowCSV('game_id','date','game_name','type','position','total_mins','periods','event_id','metric_id','metric_name','period','elapsed_ms','minute','second');
    for(const g of exportSet){
      const evs=g.events||[];
      if(!evs.length){
        for(const[mId,cnt] of Object.entries(g.metrics||{}))
          if(cnt>0) csv+=rowCSV(g.id,g.date,g.name||'',g.type,g.position||'',g.minutesPlayed,g.periods||1,'',mId,measureName(mId),'','','','');
      } else {
        for(const ev of evs){
          csv+=rowCSV(g.id,g.date,g.name||'',g.type,g.position||'',g.minutesPlayed,g.periods||1,
            ev.id,ev.metricId,measureName(ev.metricId),ev.period||1,ev.elapsedMs,
            Math.floor(ev.elapsedMs/60000),Math.floor((ev.elapsedMs%60000)/1000));
        }
      }
    }
    downloadFile(csv,`growinsport_events_${safeName}_${stamp()}.csv`);
    setStatus(`${t('export_done')} ✓ ${exportSet.length} games · ${totalEvents} events`);
  };

  const exportSummary = () => {
    if(!exportSet.length){setStatus(t('export_no_data'));return;}
    const header=rowCSV('game_id','date','game_name','type','position','position_code','total_mins','minutes_played','periods',...allMetrics.map(id=>measureName(id)));
    let csv=header;
    for(const g of [...exportSet].sort((a,b)=>new Date(a.date)-new Date(b.date))){
      const pos=g.position?posOf(g.position):null;
      csv+=rowCSV(g.id,g.date,g.name||'',g.type,g.position||'',pos?pos.code:'',
        g.totalMinutes||g.minutesPlayed,g.minutesPlayed,g.periods||1,
        ...allMetrics.map(id=>g.metrics?.[id]||0));
    }
    downloadFile(csv,`growinsport_summary_${safeName}_${stamp()}.csv`);
    setStatus(`${t('export_done')} ✓ ${exportSet.length} games`);
  };

  const exportJSON = () => {
    if(!exportSet.length){setStatus(t('export_no_data'));return;}
    const payload={
      exportDate:new Date().toISOString(), player:playerName,
      totalGames:exportSet.length, totalEvents,
      games:[...exportSet].sort((a,b)=>new Date(a.date)-new Date(b.date)).map(g=>({
        ...g,
        typeName:GAME_TYPE_DEFS.find(td=>td.id===g.type)?.id||g.type,
        positionName:g.position?posOf(g.position).name:'',
        metricsNamed:Object.fromEntries(Object.entries(g.metrics||{}).map(([id,v])=>[measureName(id),v])),
        events:(g.events||[]).map(ev=>({...ev,metricName:measureName(ev.metricId),
          minute:Math.floor(ev.elapsedMs/60000),second:Math.floor((ev.elapsedMs%60000)/1000)})),
      })),
    };
    downloadFile(JSON.stringify(payload,null,2),`growinsport_full_${safeName}_${stamp()}.json`,'application/json');
    setStatus(`${t('export_done')} ✓ JSON · ${exportSet.length} games`);
  };

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      <AppHeader title={t('export_title')} subtitle={t('export_sub')} onBack={onBack} lang={lang} setLang={setLang}/>
      <div style={{flex:1,overflowY:'auto',padding:'12px 12px 40px'}}>

        {/* ── SCOPE selector ── */}
        <div style={{...card(),marginBottom:14}}>
          <div style={{display:'flex',background:G.grayL,borderRadius:10,padding:3,marginBottom:selMode?12:0}}>
            <button onClick={()=>{setSelMode(false);setSelected(new Set());setStatus('');}}
              style={{flex:1,padding:'8px 4px',border:'none',borderRadius:8,fontFamily:'inherit',fontSize:13,fontWeight:700,cursor:'pointer',
                background:!selMode?G.card:'transparent',color:!selMode?G.blue:G.sub,
                boxShadow:!selMode?'0 1px 4px rgba(0,0,0,.08)':'none'}}>
              All {games.length} games
            </button>
            <button onClick={()=>{setSelMode(true);setStatus('');}}
              style={{flex:1,padding:'8px 4px',border:'none',borderRadius:8,fontFamily:'inherit',fontSize:13,fontWeight:700,cursor:'pointer',
                background:selMode?G.card:'transparent',color:selMode?G.blue:G.sub,
                boxShadow:selMode?'0 1px 4px rgba(0,0,0,.08)':'none'}}>
              Select games
            </button>
          </div>

          {selMode&&(
            <>
              {/* Select all / none */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <span style={{fontSize:13,fontWeight:700,color:G.text}}>
                  {selected.size} of {games.length} selected
                </span>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={selAll}  style={{fontSize:12,color:G.blueL,background:'none',border:'none',cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>All</button>
                  <button onClick={selNone} style={{fontSize:12,color:G.sub,  background:'none',border:'none',cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>None</button>
                </div>
              </div>
              {/* Game list */}
              <div style={{maxHeight:240,overflowY:'auto',borderRadius:8,border:`1px solid ${G.border}`}}>
                {sorted.map((g,i)=>{
                  const isSel=selected.has(g.id);
                  const typeDef=gameTypeDef(g.type);
                  const pos=g.position?posOf(g.position):null;
                  return(
                    <div key={g.id} onClick={()=>toggleSel(g.id)} style={{
                      display:'flex',alignItems:'center',gap:10,
                      padding:'10px 12px',cursor:'pointer',
                      background:isSel?G.blueBg:'white',
                      borderBottom:i<sorted.length-1?`1px solid ${G.border}`:'none',
                    }}>
                      <div style={{width:22,height:22,borderRadius:5,border:`2px solid ${isSel?G.blue:G.border}`,
                        background:isSel?G.blue:'white',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        {isSel&&<Check size={13} color="white"/>}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:'flex',alignItems:'center',gap:6}}>
                          <span style={pill(typeDef.color+'22',typeDef.color,{fontSize:10,padding:'2px 6px'})}>{t(typeDef.labelKey)}</span>
                          {g.name&&<span style={{fontSize:13,fontWeight:700,color:G.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:120}}>{g.name}</span>}
                          <span style={{fontSize:11,color:G.sub,flexShrink:0}}>{shortDt(g.date)}</span>
                        </div>
                        {pos&&<div style={{fontSize:10,color:G.muted,marginTop:1}}>#{pos.num} {pos.code} · {g.minutesPlayed}min</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ── Stats for current export set ── */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
          <div style={{...card(),padding:'12px',textAlign:'center'}}>
            <div style={{fontSize:26,fontWeight:900,color:G.blue}}>{exportSet.length}</div>
            <div style={{fontSize:11,color:G.sub,marginTop:2}}>{t('games_count')}{selMode&&selected.size>0?' selected':''}</div>
          </div>
          <div style={{...card(),padding:'12px',textAlign:'center'}}>
            <div style={{fontSize:26,fontWeight:900,color:G.green}}>{totalEvents}</div>
            <div style={{fontSize:11,color:G.sub,marginTop:2}}>events</div>
          </div>
        </div>

        {/* ── Export buttons ── */}
        {(selMode?selected.size>0:true)?[
          {icon:'📋',title:t('export_events'),  desc:t('export_events_desc'),  btn:t('export_btn'), fn:exportEvents, color:G.blue},
          {icon:'📊',title:t('export_summary'), desc:t('export_summary_desc'), btn:t('export_btn'), fn:exportSummary,color:G.green},
          {icon:'🗂️',title:'Full JSON',          desc:'Complete data with all events & enriched metadata',btn:t('export_json'),fn:exportJSON,color:G.orange},
        ].map(({icon,title,desc,btn,fn,color})=>(
          <div key={title} style={{...card(),marginBottom:10}}>
            <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:12}}>
              <span style={{fontSize:26,flexShrink:0}}>{icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:G.text,marginBottom:3}}>{title}</div>
                <div style={{fontSize:12,color:G.sub,lineHeight:1.5}}>{desc}</div>
              </div>
            </div>
            <button onClick={()=>{setStatus('');fn();}}
              style={{...btnSt(color),width:'100%',padding:'12px',fontSize:14,borderRadius:12}}>
              ⬇ {btn}
            </button>
          </div>
        )):(
          <div style={{...card(),textAlign:'center',padding:'24px',color:G.muted,fontSize:14}}>
            Select at least one game above
          </div>
        )}

        {status&&(
          <div style={{...card(),marginTop:4,background:G.greenBg,border:`1px solid ${G.green}44`,textAlign:'center',padding:'10px',fontSize:13,fontWeight:600,color:G.green}}>
            {status}
          </div>
        )}

        <div style={{...card(),marginTop:14,background:G.grayL,border:'none'}}>
          <div style={{fontSize:11,fontWeight:700,color:G.sub,marginBottom:6}}>FORMAT NOTES</div>
          <div style={{fontSize:11,color:G.sub,lineHeight:1.8}}>
            • UTF-8 CSV — Excel, Google Sheets, Python/pandas, R<br/>
            • Events CSV: one row per tap with timestamp &amp; period<br/>
            • Summary CSV: one row per game, all metric columns<br/>
            • JSON: full nested structure with human-readable names
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Bottom Nav ───────────────────────────────────────────────────
function BottomNav({view,setView}){
  const t=useT();
  const tabs=[
    ['dashboard','nav_home',Home],
    ['games','nav_games',List],
    ['progress','nav_progress',TrendingUp],
    ['export','export_tab',Download],
    ['settings','nav_settings',Settings],
  ];
  return(
    <nav style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:520,background:G.card,borderTop:`1px solid ${G.border}`,display:'flex',zIndex:100}}>
      {tabs.map(([id,key,Icon])=>{
        const active=view===id;
        return(<button key={id} onClick={()=>setView(id)} style={{flex:1,padding:'10px 0 8px',border:'none',background:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:3,color:active?G.green:G.muted}}>
          <Icon size={20}/><span style={{fontSize:9,fontWeight:active?700:400,fontFamily:'inherit'}}>{t(key)}</span>
        </button>);
      })}
    </nav>
  );
}

// ─── App Root ─────────────────────────────────────────────────────
export default function GrowInSport(){
  const [username,   setUsername]  =useState(null);
  const [lang,       setLang]      =useState('PL');
  const [view,       setView]      =useState('dashboard');
  const [games,      setGames]     =useState([]);
  const [categories, setCategories]=useState(DEFAULT_CATS);
  const [playerName, setPlayerName]=useState('Zawodnik');
  const [age,        setAge]       =useState(null);
  const [gameSetup,  setGameSetup] =useState(null);
  const gameSetupRef = useRef(null);   // sync ref so ActiveGame always has setup
  const [editingGame,setEditingGame]=useState(null);
  const [analysingGame,setAnalysingGame]=useState(null);
  const [summaryGame,  setSummaryGame]  =useState(null);
  const [comparisonConfig,setComparisonConfig]=useState(null);
  const [booting,    setBooting]   =useState(true);

  useEffect(()=>{
    getSession().then(async session=>{
      if(session?.user){
        try{
          const [profile, games] = await Promise.all([loadProfile(), sbLoadGames()]);
          if(profile){
            setUsername(profile.username);
            setPlayerName(profile.player_name||'');
            if(profile.categories) setCategories(profile.categories);
            if(profile.age!=null)  setAge(profile.age);
            if(profile.lang)       setLang(profile.lang);
          }
          setGames((games||[]).map(migrateGame));
        }catch(e){ console.error('Session restore error:',e); }
      }
      setBooting(false);
    });
  },[]);

  const saveTimerRef = useRef(null);
  useEffect(()=>{
    if(!username||booting) return;
    if(saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(()=>{
      saveProfile({player_name:playerName, age, lang, categories});
    }, 800);
    return ()=>{ if(saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  },[playerName,age,lang,categories,username,booting]);

  const handleLogin=async u=>{
    try{
      const [profile, games] = await Promise.all([loadProfile(), sbLoadGames()]);
      if(profile){
        setPlayerName(profile.player_name||'');
        if(profile.categories) setCategories(profile.categories);
        if(profile.age!=null)  setAge(profile.age);
        if(profile.lang)       setLang(profile.lang);
      }
      setGames((games||[]).map(migrateGame));
    }catch(e){ console.error('Login load error:',e); }
    setUsername(u);setView('dashboard');
  };
  const handleLogout=async()=>{await sbSignOut();setUsername(null);setGames([]);setCategories(DEFAULT_CATS);setPlayerName('Zawodnik');setAge(null);setLang('PL');setView('dashboard');};
  const deleteGame = id => {
    sbDeleteGame(id);
    setGames(gs=>gs.filter(g=>g.id!==id));
  };
  const handleEdit    = game => { setEditingGame(game); setView('editGame'); };
  const handleAnalyse  = game   => { setAnalysingGame(game);    setView('gameDetail');    };
  const handleSummary  = game   => { setSummaryGame(game); };
  const handleCompare  = config => { setComparisonConfig(config); setView('gameCompare'); };
  const showNav=!['newGame','feedback','editGame','gameDetail','gameCompare'].includes(view);

  const ST=`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;900&display=swap');*{box-sizing:border-box;margin:0;padding:0;}`;

  const props={lang,setLang};

  if(booting) return(
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',background:G.blue,fontFamily:"'Nunito',system-ui,sans-serif",gap:16}}>
      <style>{ST}</style>
      <GISLogo size={88} dark/>
      <div style={{fontSize:22,fontWeight:900,color:'white',letterSpacing:-0.3}}>Grow In Sport</div>
    </div>
  );

  return(
    <LangCtx.Provider value={lang}>
      <div style={{fontFamily:"'Nunito',system-ui,sans-serif",background:G.bg,height:'100vh',display:'flex',flexDirection:'column',maxWidth:520,margin:'0 auto',overflow:'hidden',position:'relative'}}>
        <style>{ST}</style>
        {!username&&<AuthScreen onLogin={handleLogin} lang={lang} setLang={setLang}/>}
        {username&&(
          <>
            <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column'}}>
              {view==='dashboard' && <Dashboard    games={games} categories={categories} playerName={playerName} age={age} onStartGame={()=>setView('newGame')} onDonate={()=>window.open('https://ko-fi.com/luckyluk','_blank')} onFeedback={()=>setView('feedback')} onEdit={handleEdit} onAnalyse={handleAnalyse} onSummary={handleSummary} {...props}/>}
              {view==='games'     && <GamesList    games={games} categories={categories} onStartGame={()=>setView('newGame')} onDelete={deleteGame} onEdit={handleEdit} onAnalyse={handleAnalyse} onCompare={handleCompare} onSummary={handleSummary} {...props}/>}
              {view==='newGame'   && <NewGameSetup categories={categories} onStart={s=>{console.log('onStart called',s);gameSetupRef.current=s;setGameSetup(s);setView('games');}} onBack={()=>setView('games')} {...props}/>}
              {view==='activeGame'&& gameSetup && <ActiveGame setup={gameSetup} categories={categories} onEnd={g=>{sbSaveGame(g);setGames(gs=>[...gs,g]);setGameSetup(null);setSummaryGame(g);setView('games');}}/>}
              {view==='activeGame'&& !gameSetup && <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}><button onClick={()=>setView('games')} style={{...btnSt(G.blue),padding:'14px 24px'}}>← Back to games</button></div>}
              {view==='progress'  && <ProgressView games={games} categories={categories} {...props}/>}
              {view==='settings'  && <SettingsPage categories={categories} setCategories={setCategories} playerName={playerName} setPlayerName={setPlayerName} age={age} setAge={setAge} username={username} onLogout={handleLogout} onDonate={()=>window.open('https://ko-fi.com/luckyluk','_blank')} onFeedback={()=>setView('feedback')} {...props}/>}
              {view==='feedback'  && <FeedbackScreen username={username} onClose={()=>setView('settings')} {...props}/>}
              {view==='export'    && <ExportScreen games={games} categories={categories} playerName={playerName} onBack={()=>setView('progress')} {...props}/>}
              {view==='editGame'  && editingGame && <EditGame game={editingGame} categories={categories}
                onSave={async g=>{
                  try{
                    await sbSaveGame(g);
                    setGames(gs=>gs.map(x=>x.id===g.id?g:x));
                    setEditingGame(null);
                    setView('games');
                  }catch(e){
                    console.error('EditGame save failed:',e);
                    alert('Save failed: '+e.message);
                  }
                }}
                onBack={()=>{setEditingGame(null);setView('games');}}/>}
              {view==='gameDetail'&& analysingGame && <GameDetail game={analysingGame} categories={categories} onBack={()=>{setAnalysingGame(null);setView('games');}} {...props}/>}
              {/* GameSummary is now an overlay — see below */}
              {view==='gameCompare'&& comparisonConfig && <GameComparison config={comparisonConfig} allGames={games} categories={categories} onBack={()=>{setComparisonConfig(null);setView('games');}} {...props}/>}

            </div>
            {showNav && <BottomNav view={view} setView={setView}/>}
            {/* ActiveGame overlay — full screen, renders immediately when gameSetup set */}
            {(gameSetup||gameSetupRef.current)&&(console.log('Rendering ActiveGame overlay',gameSetup),true)&&(
              <div style={{position:'fixed',top:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:520,bottom:0,zIndex:300,background:G.bg,display:'flex',flexDirection:'column'}}>
                <ActiveGame
                  setup={gameSetup||gameSetupRef.current}
                  categories={categories}
                  onEnd={g=>{
                    sbSaveGame(g);
                    setGames(gs=>[...gs,g]);
                    gameSetupRef.current=null;
                    setGameSetup(null);
                    setSummaryGame(g);
                  }}/>
              </div>
            )}
            {/* GameSummary overlay — fixed position, immune to parent overflow */}
            {summaryGame&&(
              <div style={{position:'fixed',top:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:520,bottom:0,zIndex:200,background:G.bg,display:'flex',flexDirection:'column'}}>
                <GameSummary
                  game={summaryGame}
                  categories={categories}
                  onBack={()=>setSummaryGame(null)}
                  onDelete={id=>{setSummaryGame(null);deleteGame(id);}}
                  onEdit={g=>{setSummaryGame(null);setEditingGame(g);setView('editGame');}}
                  onAnalyse={g=>{setSummaryGame(null);setAnalysingGame(g);setView('gameDetail');}}
                  {...props}/>
              </div>
            )}
          </>
        )}
      </div>
    </LangCtx.Provider>
  );
}
