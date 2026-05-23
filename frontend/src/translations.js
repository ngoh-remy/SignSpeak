// translations.js — All text content in English and French
// 💡 This is called an i18n (internationalization) file
//    Every piece of text in our app lives here
//    Switching language = switching which object we read from

const translations = {
  en: {
    // ── Navbar ──
    appName:        "SignSpeak",
    welcome:        "Welcome",
    logout:         "Logout",
    light:          "Light",
    dark:           "Dark",

    // ── Login ──
    welcomeBack:    "Welcome Back!",
    signInSub:      "Sign in to your account",
    emailPlaceholder:    "Email address",
    passwordPlaceholder: "Password",
    loginBtn:       "Login",
    loggingIn:      "Signing in...",
    noAccount:      "Don't have an account?",
    signUpFree:     "Sign up for free",
    fillAllFields:  "Please fill in all fields",
    loginFailed:    "Login failed",

    // ── Signup ──
    createAccount:  "Create Account",
    joinToday:      "Join SignSpeak today — it's free!",
    usernamePlaceholder: "Username",
    confirmPassword: "Confirm password",
    signUpBtn:      "Sign Up",
    creatingAccount: "Creating account...",
    alreadyAccount: "Already have an account?",
    loginLink:      "Login",
    accountCreated: "Account created! Redirecting...",
    registerFailed: "Registration failed",

    // History Panel
historyPanel:    "History & Insights",
totalDetections: "Total Detections",
mostUsed:        "Most Used",
todayCount:      "Today",
avgConfidence:   "Avg Confidence",
recentHistory:   "Recent Detections",
suggestions:     "Daily Suggestions",
suggestionText:  "Practice signing",
noSuggestions:   "Great job! You have used all gestures recently!",
noHistory:       "No detections yet — start signing!",
closePanel:      "Close",
history:         "History",

    // ── Dashboard ──
    liveCamera:     "Live Camera Feed",
    cameraPlaceholder: "Camera feed will appear here",
    startCamera:    "Start Camera",
    stopCamera:     "Stop Camera",
    currentDetection: "Current Detection",
    startCameraMsg: "Start camera to begin recognition",
    confidence:     "Confidence",
    recentDetections: "Recent Detections",
    noDetections:   "No detections yet",
    analyzing:      "Analyzing gesture...",
    gestureDetected: "Gesture detected! Waiting for next capture...",
    predictionFailed: "Prediction failed — retrying...",
    cameraActive:   "Camera active — detecting gestures...",
    cameraStopped:  "Camera stopped",
    clickToBegin:   'Click "Start Camera" to begin',
    cameraError:    "Camera access denied. Please allow camera permissions.",

    // ── Gesture translations ──
    gestures: {
      drink: "Drink",
      go:    "Go",
      help:  "Help",
      yes:   "Yes",
      no:    "No",
    }
  },

  fr: {
    // ── Navbar ──
    appName:        "SignSpeak",
    welcome:        "Bienvenue",
    logout:         "Déconnexion",
    light:          "Clair",
    dark:           "Sombre",

    // ── Login ──
    welcomeBack:    "Bon Retour!",
    signInSub:      "Connectez-vous à votre compte",
    emailPlaceholder:    "Adresse e-mail",
    passwordPlaceholder: "Mot de passe",
    loginBtn:       "Connexion",
    loggingIn:      "Connexion en cours...",
    noAccount:      "Pas encore de compte?",
    signUpFree:     "S'inscrire gratuitement",
    fillAllFields:  "Veuillez remplir tous les champs",
    loginFailed:    "Échec de la connexion",

    // ── Signup ──
    createAccount:  "Créer un Compte",
    joinToday:      "Rejoignez SignSpeak aujourd'hui — c'est gratuit!",
    usernamePlaceholder: "Nom d'utilisateur",
    confirmPassword: "Confirmer le mot de passe",
    signUpBtn:      "S'inscrire",
    creatingAccount: "Création du compte...",
    alreadyAccount: "Vous avez déjà un compte?",
    loginLink:      "Connexion",
    accountCreated: "Compte créé! Redirection...",
    registerFailed: "Échec de l'inscription",

    // History Panel
historyPanel:    "Historique & Analyses",
totalDetections: "Total Détections",
mostUsed:        "Plus Utilisé",
todayCount:      "Aujourd'hui",
avgConfidence:   "Confiance Moy.",
recentHistory:   "Détections Récentes",
suggestions:     "Suggestions du Jour",
suggestionText:  "Pratiquez le signe",
noSuggestions:   "Bravo! Vous avez utilisé tous les gestes récemment!",
noHistory:       "Aucune détection — commencez à signer!",
closePanel:      "Fermer",
history:         "Historique",

    // ── Dashboard ──
    liveCamera:     "Flux Caméra en Direct",
    cameraPlaceholder: "Le flux caméra apparaîtra ici",
    startCamera:    "Démarrer la Caméra",
    stopCamera:     "Arrêter la Caméra",
    currentDetection: "Détection Actuelle",
    startCameraMsg: "Démarrez la caméra pour commencer",
    confidence:     "Confiance",
    recentDetections: "Détections Récentes",
    noDetections:   "Aucune détection pour l'instant",
    analyzing:      "Analyse du geste...",
    gestureDetected: "Geste détecté! En attente de la prochaine capture...",
    predictionFailed: "Échec de la prédiction — nouvelle tentative...",
    cameraActive:   "Caméra active — détection des gestes...",
    cameraStopped:  "Caméra arrêtée",
    clickToBegin:   'Cliquez sur "Démarrer la Caméra" pour commencer',
    cameraError:    "Accès caméra refusé. Veuillez autoriser l'accès.",

    // ── Gesture translations ──
    gestures: {
    drink: "Boire",
    go:    "Aller",
    help:  "Aide",
    yes:   "Oui",
    no:    "Non",
    }
}
}

export default translations
// 💡 We export this object so any component can import it
//    and look up the right text based on current language