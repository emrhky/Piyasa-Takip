import * as messaging from "messaging";

const API_URL = "https://finans.truncgil.com/today.json";

// 1. Saat bağlantısı açıldığında (Opsiyonel tetikleme)
messaging.peerSocket.onopen = function() {
  console.log("Companion: Bağlantı hazır.");
}

// 2. Saatten mesaj geldiğinde
messaging.peerSocket.onmessage = function(evt) {
  if (evt.data && evt.data.command === "update") {
    console.log("Companion: Veri isteği alındı, API'ye gidiliyor...");
    fetchMarkets();
  }
}

// 3. Hata yakalama
messaging.peerSocket.onerror = function(err) {
  console.log("Companion Bağlantı Hatası: " + err.code + " - " + err.message);
}

function fetchMarkets() {
  fetch(API_URL)
  .then(response => {
    // Sunucu cevabını kontrol et
    if (!response.ok) {
      throw new Error("Sunucu: " + response.status);
    }
    return response.json();
  })
  .then(data => {
    // Gelen veriyi konsola bas (Debug için)
    // console.log("API Verisi: " + JSON.stringify(data));

    // SATIŞ Fiyatlarını Alıyoruz
    let usd = safeParse(data, "ABD DOLARI");
    let eur = safeParse(data, "EURO");
    let gold = safeParse(data, "GRAM ALTIN");
    let silver = safeParse(data, "GÜMÜŞ");

    let packet = {
      success: true,
      usd: usd,
      eur: eur,
      gold: gold,
      silver: silver
    };

    sendToDevice(packet);
  })
  .catch(err => {
    console.error("Fetch Hatası: " + err);
    // Hatayı saate bildir ki ekranda görelim
    sendToDevice({
      success: false,
      error: "Net/API Yok" 
    });
  });
}

// Güvenli veri okuma ve formatlama
function safeParse(data, key) {
  // Veri kontrolü
  if (data && data[key] && data[key].Satis) {
    let val = data[key].Satis;
    
    // Virgül varsa noktaya çevir (JavaScript sayı formatı için)
    // Örn: "34,50" -> "34.50"
    if (typeof val === 'string') {
      val = val.replace(',', '.');
    }

    let num = parseFloat(val);
    if (isNaN(num)) return "0.00";
    
    // Ekrana sığması için 2 basamak
    return num.toFixed(2);
  }
  return "0.00";
}

function sendToDevice(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
    console.log("Companion: Veri saate yollandı.");
  } else {
    console.log("Companion: HATA - Saat bağlantısı kopuk!");
  }
}
