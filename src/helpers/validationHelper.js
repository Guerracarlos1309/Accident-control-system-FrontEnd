/**
 * validationHelper.js
 * Centralized heuristic validations to filter out fake, placeholder, or nonsensical data.
 */

/**
 * Checks if a string is a simple sequential number sequence (e.g., "12345" or "54321").
 */
function isSequential(str) {
  let ascending = true;
  let descending = true;
  for (let i = 0; i < str.length - 1; i++) {
    const current = parseInt(str[i], 10);
    const next = parseInt(str[i + 1], 10);
    if (isNaN(current) || isNaN(next)) return false;
    if (next !== current + 1) ascending = false;
    if (next !== current - 1) descending = false;
  }
  return ascending || descending;
}

/**
 * Validates names and surnames.
 */
export function validateName(name, label = "El nombre", required = false) {
  if (!name || name.trim() === "") {
    if (required) {
      return { isValid: false, message: `${label} es obligatorio.` };
    }
    return { isValid: true, message: "" };
  }

  const val = name.trim();

  if (val.length < 2) {
    return { isValid: false, message: `${label} debe tener al menos 2 caracteres.` };
  }
  if (val.length > 30) {
    return { isValid: false, message: `${label} no debe exceder los 30 caracteres.` };
  }

  // Letters and spaces (allowing typical Spanish accents and characters)
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(val)) {
    return { isValid: false, message: `${label} solo puede contener letras y espacios.` };
  }

  // Detect 4 or more identical consecutive characters (e.g., "aaaa")
  if (/([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ])\1{3,}/i.test(val)) {
    return { isValid: false, message: `El sistema no permitirá esto: ${label} contiene caracteres repetidos no válidos.` };
  }

  // Detect 3 or more identical consecutive vowels (e.g., "aaa")
  if (/([aeiouáéíóúü])\1{2,}/i.test(val)) {
    return { isValid: false, message: `El sistema no permitirá esto: ${label} tiene demasiadas vocales idénticas repetidas.` };
  }

  // Detect 3 or more identical consecutive consonants (e.g., "lll", "rrr")
  if (/([bcdfghjklmnñpqrstvwxyz])\1{2,}/i.test(val)) {
    return { isValid: false, message: `El sistema no permitirá esto: ${label} tiene consonantes repetidas inválidas.` };
  }

  // Block 5 consonants in a row (keyboard mash like "sdfgh")
  if (/([^aeiouáéíóúü\s'-]){5,}/i.test(val)) {
    return { isValid: false, message: `El sistema no permitirá esto: ${label} contiene demasiadas consonantes consecutivas (sospecha de dato falso).` };
  }

  // Detect 3 or more identical consecutive groups of 2-4 characters (e.g., "dasdasdas")
  if (/([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]{2,4})\1{2,}/i.test(val)) {
    return { isValid: false, message: `El sistema no permitirá esto: ${label} contiene patrones de caracteres repetitivos.` };
  }

  // Unique letters density checks
  const uniqueChars = new Set(val.toLowerCase().replace(/[^a-záéíóúñü]/g, ""));
  if (val.length >= 9 && uniqueChars.size < 5) {
    return { isValid: false, message: `El sistema no permitirá esto: ${label} parece ser una combinación aleatoria de pocas letras.` };
  }
  if (val.length >= 7 && uniqueChars.size < 3) {
    return { isValid: false, message: `El sistema no permitirá esto: ${label} tiene muy poca variedad de letras.` };
  }

  // Keyboard walks and common mock values
  const lowercaseVal = val.toLowerCase();
  const dummyWords = [
    "prueba", "test", "demo", "dummy", "fake", "falso", "ninguno", "ninguna",
    "admin", "usuario", "invitado", "vacio", "vacío", "no aplica", "n/a", "na",
    "inventado", "ejemplo", "asd", "qwe", "zxc", "qwerty", "asdf"
  ];

  for (const word of dummyWords) {
    if (
      lowercaseVal === word ||
      lowercaseVal.includes(` ${word} `) ||
      lowercaseVal.startsWith(`${word} `) ||
      lowercaseVal.endsWith(` ${word}`)
    ) {
      return { isValid: false, message: `El sistema no permitirá esto: ${label} no puede ser una palabra de prueba.` };
    }
  }

  const walks = ["qwerty", "asdfg", "zxcvb", "mnbvc", "lkjhg", "poiuy", "qwert", "asdf", "1234"];
  for (const walk of walks) {
    if (lowercaseVal.includes(walk)) {
      return { isValid: false, message: `El sistema no permitirá esto: ${label} contiene secuencias de teclado sospechosas.` };
    }
  }

  // Vowels & Consonants balance check for length > 3
  if (val.length > 3) {
    const hasVowel = /[aeiouáéíóúü]/i.test(val);
    const hasConsonant = /[bcdfghjklmnñpqrstvwxyz]/i.test(val);
    if (!hasVowel || !hasConsonant) {
      return { isValid: false, message: `El sistema no permitirá esto: ${label} debe ser un nombre real (con vocales y consonantes).` };
    }
  }

  return { isValid: true, message: "" };
}

/**
 * Validates Cédula de Identidad (only standard range and characters, allowed repeats).
 */
export function validateIdCardNumber(idNumber, required = false) {
  if (!idNumber || idNumber.trim() === "") {
    if (required) {
      return { isValid: false, message: "La cédula de identidad es obligatoria." };
    }
    return { isValid: true, message: "" };
  }

  const clean = idNumber.replace(/\D/g, "");

  if (clean.length < 5 || clean.length > 8) {
    return { isValid: false, message: "El sistema no permitirá esto: La cédula debe tener entre 5 y 8 dígitos numéricos." };
  }

  return { isValid: true, message: "" };
}

/**
 * Validates Employee Personal Number.
 */
export function validatePersonalNumber(personalNumber, required = false) {
  if (!personalNumber || personalNumber.trim() === "") {
    if (required) {
      return { isValid: false, message: "El número de personal es obligatorio." };
    }
    return { isValid: true, message: "" };
  }

  const val = personalNumber.trim();

  if (!/^\d{5,7}$/.test(val)) {
    return { isValid: false, message: "El sistema no permitirá esto: El número de personal debe tener entre 5 y 7 dígitos numéricos." };
  }

  // Trivial repetitions check (e.g. "11111")
  if (/^(\d)\1+$/.test(val)) {
    return { isValid: false, message: "El sistema no permitirá esto: El número de personal no puede constar del mismo dígito repetido." };
  }

  // Sequential check
  if (isSequential(val)) {
    return { isValid: false, message: "El sistema no permitirá esto: El número de personal no puede ser una secuencia numérica simple." };
  }

  return { isValid: true, message: "" };
}

/**
 * Validates Email addresses.
 */
export function validateEmailAddress(email, required = false) {
  if (!email || email.trim() === "") {
    if (required) {
      return { isValid: false, message: "El correo electrónico es obligatorio." };
    }
    return { isValid: true, message: "" };
  }

  const val = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(val)) {
    return { isValid: false, message: "El sistema no permitirá esto: Ingrese un correo electrónico válido." };
  }

  const parts = val.split("@");
  const userPart = parts[0];
  const domainPart = parts[1];

  // Block placeholder domains
  const blockedDomains = [
    "example.com", "test.com", "prueba.com", "dummy.com", "fake.com",
    "correo.com", "email.com", "mail.com", "mock.com", "domain.com"
  ];
  if (blockedDomains.includes(domainPart)) {
    return { isValid: false, message: `El sistema no permitirá esto: El dominio "${domainPart}" no es un servidor de correo válido.` };
  }

  // Block placeholder usernames
  const blockedUsers = ["test", "prueba", "admin", "asdf", "dummy", "fake", "user", "usuario", "invitado"];
  if (blockedUsers.includes(userPart)) {
    return { isValid: false, message: "El sistema no permitirá esto: El usuario de correo parece ser un dato de prueba." };
  }

  return { isValid: true, message: "" };
}

/**
 * Validates phone numbers.
 */
export function validatePhoneNumber(phone, label = "El número de teléfono", required = false) {
  if (!phone || phone.trim() === "") {
    if (required) {
      return { isValid: false, message: `${label} es obligatorio.` };
    }
    return { isValid: true, message: "" };
  }

  const clean = phone.replace(/\D/g, "");

  if (clean.length !== 11 && clean.length !== 12) {
    return { isValid: false, message: `${label} debe tener 11 dígitos (o 12 si incluye el código de país 58).` };
  }

  const isLocal = /^0(412|414|424|416|426|2\d{2})\d{7}$/.test(clean);
  const isIntl = /^58(412|414|424|416|426|2\d{2})\d{7}$/.test(clean);
  if (!isLocal && !isIntl) {
    return { isValid: false, message: "El sistema no permitirá esto: Ingrese un número de teléfono venezolano válido (ej: 04141234567 o 02121234567)." };
  }

  // Extract subscriber number (last 7 digits)
  const subscriber = clean.slice(-7);
  if (/^(\d)\1+$/.test(subscriber)) {
    return { isValid: false, message: `El sistema no permitirá esto: ${label} contiene un número de abonado repetido no válido.` };
  }
  if (isSequential(subscriber)) {
    return { isValid: false, message: `El sistema no permitirá esto: ${label} contiene una secuencia numérica consecutiva no válida.` };
  }

  return { isValid: true, message: "" };
}

/**
 * Validates generic text inputs (descriptions, names, addresses).
 */
export function validateGenericText(text, label = "El campo", minLength = 3, required = false) {
  if (!text || text.trim() === "") {
    if (required) {
      return { isValid: false, message: `${label} es obligatorio.` };
    }
    return { isValid: true, message: "" };
  }

  const val = text.trim();

  if (val.length < minLength) {
    return { isValid: false, message: `${label} debe tener al menos ${minLength} caracteres.` };
  }

  const lowercaseVal = val.toLowerCase();
  const dummyWords = ["prueba", "test", "demo", "dummy", "fake", "falso", "ninguno", "ninguna", "vacio", "vacío", "no aplica"];
  if (dummyWords.includes(lowercaseVal)) {
    return { isValid: false, message: `El sistema no permitirá esto: ${label} no puede ser una palabra de prueba.` };
  }

  const walks = ["qwerty", "asdfgh", "zxcvbn", "asd", "qwe", "abc", "12345"];
  for (const walk of walks) {
    if (lowercaseVal === walk || (lowercaseVal.length < 10 && lowercaseVal.includes(walk))) {
      return { isValid: false, message: `El sistema no permitirá esto: ${label} contiene secuencias de teclado sospechosas.` };
    }
  }

  if (/([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ])\1{4,}/i.test(val)) {
    return { isValid: false, message: `El sistema no permitirá esto: ${label} contiene demasiados caracteres idénticos repetidos.` };
  }

  return { isValid: true, message: "" };
}

/**
 * Validates office phone numbers (max 11 digits, null if empty).
 */
export function validateOfficePhoneNumber(phone, required = false) {
  if (!phone || phone.trim() === "") {
    if (required) {
      return { isValid: false, message: "El teléfono de oficina es obligatorio." };
    }
    return { isValid: true, message: "" };
  }

  const clean = phone.replace(/\D/g, "");

  if (clean.length > 11) {
    return { isValid: false, message: "El sistema no permitirá esto: El teléfono de oficina debe tener un máximo de 11 dígitos numéricos." };
  }
  if (clean.length < 3) {
    return { isValid: false, message: "El sistema no permitirá esto: El teléfono de oficina debe tener al menos 3 dígitos numéricos." };
  }

  // Extract subscriber number (last digits)
  if (/^(\d)\1+$/.test(clean)) {
    return { isValid: false, message: "El sistema no permitirá esto: El teléfono de oficina contiene un número repetido no válido." };
  }
  if (isSequential(clean)) {
    return { isValid: false, message: "El sistema no permitirá esto: El teléfono de oficina contiene una secuencia numérica consecutiva no válida." };
  }

  return { isValid: true, message: "" };
}

/**
 * Validates facility name (Sede / Planta).
 */
export function validateFacilityName(name, required = false) {
  if (!name || name.trim() === "") {
    if (required) {
      return { isValid: false, message: "El nombre de la sede es obligatorio." };
    }
    return { isValid: true, message: "" };
  }

  const val = name.trim();

  if (val.length < 4) {
    return { isValid: false, message: "El nombre de la sede debe tener al menos 4 caracteres." };
  }
  if (val.length > 50) {
    return { isValid: false, message: "El nombre de la sede no debe exceder los 50 caracteres." };
  }

  // Allow letters, numbers, spaces, and basic punctuation commonly used in facility names
  // e.g. "Subestación San Cristóbal II", "S/E Centro", "Planta N-3"
  if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s'\-\./()]+$/.test(val)) {
    return { isValid: false, message: "El nombre de la sede contiene caracteres no permitidos." };
  }

  // Must contain at least one letter (cannot be just numbers and symbols)
  if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/i.test(val)) {
    return { isValid: false, message: "El nombre de la sede debe contener letras." };
  }

  // Detect 4 or more identical consecutive characters (e.g., "aaaa")
  if (/([a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ])\1{3,}/i.test(val)) {
    return { isValid: false, message: "El nombre contiene caracteres repetidos no válidos." };
  }

  // Keyboard walks and common mock values
  const lowercaseVal = val.toLowerCase();
  const dummyWords = [
    "prueba", "test", "demo", "dummy", "fake", "falso", "ninguno", "ninguna",
    "admin", "usuario", "invitado", "vacio", "vacío", "no aplica", "n/a", "na",
    "inventado", "ejemplo", "asd", "qwe", "zxc", "qwerty", "asdf"
  ];

  for (const word of dummyWords) {
    if (
      lowercaseVal === word ||
      lowercaseVal.includes(` ${word} `) ||
      lowercaseVal.startsWith(`${word} `) ||
      lowercaseVal.endsWith(` ${word}`)
    ) {
      return { isValid: false, message: "El nombre no puede contener palabras de prueba o genéricas." };
    }
  }

  const walks = ["qwerty", "asdfg", "zxcvb", "mnbvc", "lkjhg", "poiuy", "qwert", "asdf", "1234"];
  for (const walk of walks) {
    if (lowercaseVal.includes(walk)) {
      return { isValid: false, message: "El nombre contiene secuencias de teclado sospechosas." };
    }
  }

  // Detect 3 or more identical consecutive groups of 2-4 characters (e.g., "dasdasdas")
  if (/([a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ]{2,4})\1{2,}/i.test(val)) {
    return { isValid: false, message: "El nombre contiene patrones repetitivos no válidos." };
  }

  // Unique letters density / ratio check for keyboard mashing detection (e.g. CARSADACACSDASDCASDSACSDA)
  const lettersOnly = val.replace(/[^a-z0-9áéíóúñü]/gi, "");
  const uniqueChars = new Set(lettersOnly.toLowerCase());
  if (lettersOnly.length >= 8) {
    const ratio = uniqueChars.size / lettersOnly.length;
    if (ratio < 0.35) {
      return { isValid: false, message: "Muy poca variedad de letras para un nombre de este tamaño (posible teclado aleatorio)." };
    }
  }

  return { isValid: true, message: "" };
}

/**
 * Validates coordinates (LAT, LONG).
 */
export function validateCoordinates(coordinates, required = false) {
  if (!coordinates || coordinates.trim() === "") {
    if (required) {
      return { isValid: false, message: "Las coordenadas son obligatorias." };
    }
    return { isValid: true, message: "" };
  }

  const val = coordinates.trim();

  // Basic regex check for "lat, long"
  const coordRegex = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
  if (!coordRegex.test(val)) {
    return { isValid: false, message: "Las coordenadas deben tener el formato 'LATITUD, LONGITUD' (ej: 12.3123, -73.3123)." };
  }

  const parts = val.split(",");
  const lat = parseFloat(parts[0].trim());
  const lng = parseFloat(parts[1].trim());

  if (isNaN(lat) || isNaN(lng)) {
    return { isValid: false, message: "Las coordenadas contienen valores numéricos no válidos." };
  }

  // Check mathematical bounds of coordinates: Latitude between -90 and 90, Longitude between -180 and 180
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return { isValid: false, message: "Las coordenadas deben ser reales (Latitud entre -90 y 90, Longitud entre -180 y 180)." };
  }

  return { isValid: true, message: "" };
}
