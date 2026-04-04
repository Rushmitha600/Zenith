// Word + Number combination captcha
const captchaStore = new Map();

// Word list for captcha
const words = [
  'RAIN', 'SUN', 'CLOUD', 'STORM', 'WIND', 'FLOOD', 'HEAT', 'COLD',
  'SAFE', 'WORK', 'RIDE', 'DELIVER', 'PROTECT', 'SHIELD', 'CLAIM',
  'POLICY', 'GIG', 'INCOME', 'WEATHER', 'BIKE', 'HELMET'
];

export const generateCaptcha = () => {
  // Random word
  const word = words[Math.floor(Math.random() * words.length)];
  // Random number between 1 and 99
  const number = Math.floor(Math.random() * 99) + 1;
  
  const captchaId = Date.now().toString() + Math.random().toString(36).substr(2, 6);
  const captchaText = `${word} - ${number}`;
  const answer = `${word}${number}`.toLowerCase();
  
  captchaStore.set(captchaId, {
    answer: answer,
    expiresAt: Date.now() + 5 * 60 * 1000,
    word: word,
    number: number
  });
  
  console.log(`Captcha generated: ${captchaText} = ${answer}`);
  
  return { captchaId, captchaText };
};

export const verifyCaptcha = (captchaId, userAnswer) => {
  const stored = captchaStore.get(captchaId);
  
  if (!stored) {
    return { success: false, message: 'Captcha expired. Please refresh.' };
  }
  
  if (Date.now() > stored.expiresAt) {
    captchaStore.delete(captchaId);
    return { success: false, message: 'Captcha expired. Please refresh.' };
  }
  
  if (stored.answer === userAnswer.toLowerCase().trim()) {
    captchaStore.delete(captchaId);
    return { success: true, message: 'Captcha verified' };
  }
  
  return { success: false, message: 'Incorrect answer. Try again!' };
};

export default { generateCaptcha, verifyCaptcha };