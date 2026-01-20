import * as messaging from "messaging";

const API_URL = "https://finans.truncgil.com/today.json";

messaging.peerSocket.onmessage = function(evt) {
  if (evt.data && evt.data.command === "update") {
    console.log("Companion: Güncelleme isteği alındı, API'ye gidiliyor...");
    fetchMarkets();
  }
}

function fetchMarkets() {
  fetch(API_URL)
  .then(response => {
    if (!response.ok) {
      throw new Error("API Hatası Kod: " + response.status);
    }
    return response.json();
  })
  .then(data => {
    // 1. Veri geldi mi diye konsola basalım (Loglarda bunu görmelisin)
    console.log("Companion: API Yanıtı Başarılı. Veri işleniyor...");

    // 2. Güvenli ayrıştırma ve Virgül/Nokta düzeltme
    let usd = parseCurrency(data, "ABD DOLARI");
    let eur = parseCurrency(data, "EURO");
    let gold = parseCurrency(data, "GRAM ALTIN");
    
    // Gümüş bazen "GÜMÜŞ", bazen gelmiyor. Kontrollü alalım.
    let silver = parseCurrency(data, "GÜMÜŞ"); 

    let marketData = {
      success: true,
      usd: usd,
      eur: eur,
      gold: gold,
      silver: silver
    };

    console.log("Companion: Gönderilen Veri -> " + JSON.stringify(marketData));
    sendToDevice(marketData);
  })
  .catch(err => {
    console.error("Companion Hatası: " + err);
    sendToDevice({ success: false, error: "Veri Alınamadı" });
  });
}

// Yardımcı Fonksiyon: Veriyi temizler ve sayıya çevirir
function parseCurrency(data, key) {
  // Veri yoksa veya key yanlışsa
  if (!data || !data[key]) {
    console.log("Uyarı: " + key + " verisi API'de bulunamadı.");
    return "0.00";
  }

  let priceStr = data[key].Satis; // Örn: "30,2500"
  
  if (!priceStr) return "0.00";

  // Virgülü noktaya çevir (JavaScript için zorunlu)
  priceStr = priceStr.replace(",", ".");
  
  // Sayıya çevirip 2 basamak formatla, sonra tekrar string yap
  let priceVal = parseFloat(priceStr);
  return priceVal.toFixed(2); // Örn: "30.25"
}

function sendToDevice(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  } else {
    console.log("Companion: Bağlantı kopuk, veri gönderilemedi.");
  }
}
