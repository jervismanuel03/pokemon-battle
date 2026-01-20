// Load the sound file (This is a free short punch sound)
const hitSound = new Audio('https://www.myinstants.com/media/sounds/punch-gaming.mp3');

// 1. Initialize Level (Check if a level is already saved in the phone)
// We use Number() because LocalStorage only saves text (strings)
let savedLevel = localStorage.getItem('playerLevel');
let heroLevel = savedLevel ? Number(savedLevel) : 15;

const levelBtn = document.querySelector('#lvl-btn');
const levelText = document.querySelector('#level-display');

// Show the saved level immediately on load
levelText.innerText = `Current Level: ${heroLevel}`;

// 2. Update and Save on click
levelBtn.addEventListener('click', () => {
    heroLevel++; // Shorthand for heroLevel = heroLevel + 1
    
    // Update the UI
    levelText.innerText = `Current Level: ${heroLevel}`;
    
    // SAVE to LocalStorage (Key, Value)
    localStorage.setItem('playerLevel', heroLevel);
    
    console.log(`Progress Saved! Level: ${heroLevel}`);
});

/* --- RPG CLICKER GAME LOGIC --- */

// 1. Load Gold from Memory (or start at 0)
let savedGold = localStorage.getItem('playerGold');
let gold = savedGold ? Number(savedGold) : 0;

let monsterMaxHp = 100;
let currentMonsterHp = 100;

// Select Elements
const pokemonImg = document.querySelector('#pokemon-img');
const hpBar = document.querySelector('#pokemon-hp-bar');
const hpText = document.querySelector('#pokemon-hp-text');
const goldDisplay = document.querySelector('#gold-display');

// 2. Show the saved gold immediately
goldDisplay.innerText = gold;

// The Attack Function
pokemonImg.addEventListener('click', () => {
  // Reset sound so you can spam click!
  hitSound.currentTime = 0;
  hitSound.play();
// 1. Calculate Damage based on your Hero Level!
    // Example: Level 15 = 15 damage per click
    let damage = heroLevel;
    let isCrit = false;
    
    // Critical Hit Logic (20% Chance)
    // Math.random() gives a number between 0 and 1.
    // If it's less than 0.2, that's a 20% chance!
    if(Math.random() < 0.2) {
      damage = damage * 3; // Triple Damage!
      isCrit = true;
    }
    
    // 2. Apply Damage
    currentMonsterHp -= damage;

    // 3. Update Visuals
    if (currentMonsterHp < 0) currentMonsterHp = 0; // Don't go below 0
    
    if (isCrit) {
      hpText.innerText = `CRITICAL HIT -${damage}`;
      hpText.style.color = "red";
      hpText.style.fontWeight = "bold";
      pokemonImg.style.transform = "scale(1.2)"; // Big pop effect
      setTimeout(() => pokemonImg.style.transform = "scale(1)", 100);
      } else {
        hpText.innerText = `${currentMonsterHp} / ${monsterMaxHp} HP`;
        hpText.style.color = "black";
        hpText.style.fontWeight = "normal";
      }
      
      // Update Bar
      const hpPercent = (currentMonsterHp/monsterMaxHp) * 100;
      hpBar.style.width = `${hpPercent}%`;

    // 4. Check for Victory
    if (currentMonsterHp === 0) {
        defeatMonster();
    }
});
// We need to access the stored crypto data
// (Make sure this runs AFTER the API has fetched data)

function defeatMonster() {
    // 1. Check if we have crypto prices loaded
    // We check the first card's text (Bitcoin)
    const btcText = document.querySelectorAll('.card p')[0].innerText;
    
    // Simple check: If market is "hot" (BTC > $90k), give bonus gold!
    // We strip the text "BTC: $" to get just the number
    let bonusGold = 0;
    
    if (btcText.includes("$")) {
        // This is a rough way to parse "$95,000" into number 95000
        let priceString = btcText.split('$')[1].replace(',', ''); 
        let price = Number(priceString);

        if (price > 90000) {
            bonusGold = 50; // Market is Bullish, extra loot!
            alert(`BITCOIN IS BOOMING! The Pokemon dropped extra loot! (+${bonusGold} Gold)`);
        }
    }

    let totalReward = 50 + bonusGold;
    
    alert(`Victory! You earned ${totalReward} Gold.`);
    
    gold += totalReward;
    goldDisplay.innerText = gold;
    localStorage.setItem('playerGold', gold);

    // ... reset monster ...
    monsterMaxHp += 50; 
    currentMonsterHp = monsterMaxHp;
    hpBar.style.width = '100%';
    hpText.innerText = `${currentMonsterHp} / ${monsterMaxHp} HP`;
}

const shopBtn = document.querySelector('#buy-potion-btn');

shopBtn.addEventListener('click', () => {
    // 1. Check if they have enough money
    if (gold >= 100) {
        // 2. Take the money
        gold -= 100;
        goldDisplay.innerText = gold;
        localStorage.setItem('playerGold', gold);

        // 3. Give the reward (Level Up!)
        heroLevel++; 
        levelText.innerText = `Current Level: ${heroLevel}`;
        localStorage.setItem('playerLevel', heroLevel);

        alert("Gulp! You feel stronger. Level Up!");
    } else {
        alert("Not enough gold! Keep battling");
    }
});

// --- THE CRYPTO ENGINE ---
async function updateMarket() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd');
        const data = await response.json();
        const prices = [data.bitcoin.usd, data.ethereum.usd, data.solana.usd];
        
        // Update the hidden cards so the Game Logic can read them
        const allCards = document.querySelectorAll('.card p');
        allCards.forEach((card, index) => {
            card.innerText = `BTC: $${prices[index]}`;
        });
        console.log("Crypto Prices Updated for Game Logic");

    } catch (error) {
        console.log("Offline Mode: using default values");
    }
}

// Start the engine automatically when the game loads
updateMarket();


