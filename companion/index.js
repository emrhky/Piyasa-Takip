import * as messaging from "messaging";

const API_URL = "https://finans.truncgil.com/today.json";

// Mesaj kuyruğu (Bağlantı hazır değilse burada bekleteceğiz)
let msgQueue = [];

// 1. Cihazdan mesaj gelince
messaging.peerSocket.onmessage = function(evt) {
  console.log("Companion: Cihazdan komut geldi -> " + JSON.stringify(evt.data));
  if (evt.data && evt.data.command === "update") {
    fetchMarkets();
  }
}

// 2. Bağlantı açılınca kuyruktaki mesajları yolla
messaging.peerSocket.onopen = function() {
  console.log("Companion: Socket AÇIK, kuyruk işleniyor...");
  while (msgQueue.length > 0) {
    let msg = msgQueue.shift();
    sendToDevice(msg);
  }
}

messaging.peerSocket.onerror = function(err) {
  console.log("Companion: Socket Hatası -> " + err.code + " " + err.message);
}

function fetchMarkets() {
  console.log("Companion: API isteği gönderiliyor...");
  
  fetch(API_URL)
  .then(response => {
    // Yanıt durumunu logla
    console.log("Companion: API Sunucu Durumu -> " + response.status);
    if (!response.ok) {
      throw new Error("Sunucu Yanıt Vermedi: " + response.status);
    }
    return response.json();
  })
  .then(data => {
    // GELEN VERİYİ GÖRMEK İÇİN LOGLUYORUZ
    // (Burası hatanın sebebini anlamamızı sağlayacak)
    // console.log("Gelen Ham Veri: " + JSON.stringify(data)); 

    // Veri güvenliği kontrolü
    // Eğer API yapısı değişmişse burada yakalarız.
    let usd = safeGet(data, "ABD DOLARI");
    let eur = safeGet(data, "EURO");
    let gold = safeGet(data, "GRAM ALTIN");
    let silver = safeGet(data, "GÜMÜŞ");

    let packet = {
      success: true,
      usd: usd,
      eur: eur,
      gold: gold,
      silver: silver
    };

    console.log("Companion: Veri paketlendi, saate gönderiliyor...");
    sendToDevice(packet);
  })
  .catch(err => {
    console.error("Companion Fetch Hatası: " + err);
    sendToDevice({
      success: false,
      error: "İnternet/API Yok"
    });
  });
}

// Güvenli veri okuma fonksiyonu (Hata patlamasını önler)
function safeGet(data, key) {
  if (data && data[key] && data[key].Satis) {
    return data[key].Satis;
  }
  return "0.00"; // Veri yoksa 0.00 dönsün
}

function sendToDevice(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
    console.log("Companion: Veri yollandı.");
  } else {
    console.log("Companion: Socket KAPALI, mesaj kuyruğa eklendi.");
    msgQueue.push(data);
  }
}
