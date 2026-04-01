const roastLines = [
  "Bhai tu itna soya tha ya sirf andha tha jab hisab ho raha tha?",
  "Teri yadasht itni kamzor hai ya sirf paison se dushmani hai?",
  "Bina diye chain se sota hai? Wah bhai wah.",
  "Khata sab tera tha, deta sirf excuse hai.",
  "Itna bada dil hai toh nikal bhai paisa.",
  "Sab ne dekha, sab ne suna, bas tu hi bhool gaya.",
  "Pehle khaya, phir bhoola — classic move.",
  "Tera hisaab teri yadasht se zyada bhari hai.",
  "Dost hai isliye maafi — warna kya hota soch.",
  "Aaj dede, kal ki tension khatam.",
];

export function getRoastLine(): string {
  return roastLines[Math.floor(Math.random() * roastLines.length)];
}
