const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Replace the modal HTML
const newModalHtml = `
  <div class="modal-overlay" id="modalOverlay" onclick="closeModalOutside(event)" style="background: rgba(0,0,0,0.4); backdrop-filter: blur(8px);">
    <div class="modal" style="background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.6); max-width: 520px; border-radius: 24px; padding: 2rem; box-shadow: 0 24px 48px rgba(0,0,0,0.1);">
      
      <h2 style="text-align: center; color: var(--primary); font-family: 'Playfair Display', serif; font-size: 1.5rem; margin-bottom: 1.5rem;">Add New Plant</h2>
      
      <!-- Search Database Section -->
      <div style="background: rgba(255,255,255,0.6); border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem; position: relative; border: 1px solid rgba(255,255,255,0.8);">
        <label style="display:block; text-align:center; font-weight: 600; font-size: 1.2rem; color: #1a3d1a; margin-bottom: 0.8rem;">Search Plant Database</label>
        <div style="position: relative;">
          <span style="position:absolute; left:1rem; top:50%; transform:translateY(-50%); color:#8a9e8c;">🔍</span>
          <input type="text" id="plantSearchDb" placeholder="thousands of plants..." style="width:100%; padding: 0.8rem 1rem 0.8rem 2.5rem; border-radius: 12px; border: 1px solid #c8d8c8; font-size: 1rem; outline: none; transition: border-color 0.2s; background: rgba(255,255,255,0.9);" oninput="searchPlantDb(this.value)" onfocus="searchPlantDb(this.value)" onblur="setTimeout(() => document.getElementById('dbDropdown').style.display='none', 200)">
          
          <!-- Dropdown -->
          <div id="dbDropdown" style="display:none; position:absolute; top:100%; left:0; right:0; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); border-radius: 12px; border: 1px solid #c8d8c8; box-shadow: 0 8px 24px rgba(0,0,0,0.1); margin-top: 0.5rem; z-index: 100; max-height: 200px; overflow-y: auto;">
          </div>
        </div>
      </div>

      <!-- Selected Plant Card -->
      <div style="background: rgba(255,255,255,0.6); border-radius: 20px; padding: 1.5rem; border: 1px solid rgba(255,255,255,0.8); margin-bottom: 1.5rem;">
        <div style="display: flex; gap: 1.5rem; align-items: stretch; margin-bottom: 1.2rem;">
          <div id="selectedPlantIcon" style="width: 120px; height: 120px; background: #eaf4e6; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 4rem; flex-shrink: 0; box-shadow: inset 0 4px 12px rgba(0,0,0,0.05); user-select:none;">
            🌿
          </div>
          <div style="flex-grow: 1; display: flex; flex-direction: column; gap: 0.6rem;">
            <div style="display: flex; gap: 1rem;">
              <div style="flex:1;">
                <label style="font-size: 0.8rem; color: #8a9e8c; display:block; margin-bottom: 0.2rem;">Plant Name</label>
                <input type="text" id="plantName" placeholder="e.g. Aloe Vera" style="width:100%; padding: 0.5rem; border-radius: 8px; border: 1px solid #e0e8e0; background: rgba(255,255,255,0.8);">
              </div>
              <div style="flex:1;">
                <label style="font-size: 0.8rem; color: #8a9e8c; display:block; margin-bottom: 0.2rem;">Plant Nickname</label>
                <input type="text" id="plantVariety" placeholder="e.g. Bedroom Healer" style="width:100%; padding: 0.5rem; border-radius: 8px; border: 1px solid #e0e8e0; background: rgba(255,255,255,0.8);">
              </div>
            </div>
            <div style="font-size: 0.85rem; color: #4a5c4a; font-style: italic;" id="scientificName">Scientific Name: <span>Unknown</span></div>
            
            <div style="margin-top: 0.4rem;">
              <label style="font-size: 0.8rem; color: #8a9e8c; display:block; margin-bottom: 0.4rem;">Health Benefits</label>
              <div id="healthBenefitsContainer" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <div style="font-size:0.75rem; color:#8a9e8c; font-style:italic;">Select a plant from the database</div>
              </div>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 140px;">
            <label style="font-size: 0.85rem; color: #4a5c4a; display:block; margin-bottom: 0.4rem;">Location</label>
            <select id="gardenType" style="width:100%; padding: 0.6rem; border-radius: 8px; border: 1px solid #e0e8e0; background: rgba(255,255,255,0.8); outline:none;">
              <option>🛋️ Living Room</option>
              <option>🛏️ Bedroom</option>
              <option>☀️ Balcony</option>
              <option>🌳 Backyard</option>
              <option>🪴 Indoor</option>
              <option>🏡 Outdoor</option>
            </select>
          </div>
          <div style="flex: 1; min-width: 140px;">
            <label style="font-size: 0.85rem; color: #4a5c4a; display:block; margin-bottom: 0.4rem;">Date Planted</label>
            <input type="date" id="plantDate" style="width:100%; padding: 0.6rem; border-radius: 8px; border: 1px solid #e0e8e0; background: rgba(255,255,255,0.8); outline:none;">
          </div>
        </div>
        
        <div style="margin-top: 1.2rem; display: flex; align-items: center; justify-content: space-between;">
           <div style="flex: 1;">
              <label style="font-size: 0.85rem; color: #4a5c4a; display:flex; align-items:center; gap: 0.5rem;">Care Frequency (Days) <span id="careFreqVal" style="font-weight:bold;">2</span></label>
              <input type="range" id="waterFreq" min="1" max="30" value="2" style="width: 100%; margin-top: 0.5rem; accent-color: var(--primary);" oninput="document.getElementById('careFreqVal').textContent = this.value">
           </div>
           <div style="flex: 1; padding-left: 2rem; display:flex; flex-direction:column; align-items:flex-start;">
              <label style="font-size: 0.85rem; color: #4a5c4a; display:block; margin-bottom: 0.4rem;">Care Reminders</label>
              <div style="display:flex; align-items:center; gap:0.5rem;">
                <input type="time" id="reminderTimeInput" value="09:00" style="padding: 0.4rem; border-radius: 6px; border: 1px solid #e0e8e0; background: rgba(255,255,255,0.8);">
              </div>
           </div>
        </div>
      </div>
      
      <!-- Hidden fields to maintain compatibility with existing JS -->
      <textarea id="plantNotes" style="display:none;"></textarea>

      <div class="modal-btns" style="display:flex; gap: 1rem; margin-top: 1rem;">
        <button onclick="closeModal()" style="flex: 1; padding: 0.8rem; border-radius: 20px; border: 1px solid #8a9e8c; background: transparent; color: #4a5c4a; font-weight: 600; cursor:pointer;">Cancel</button>
        <button onclick="addPlant()" style="flex: 1; padding: 0.8rem; border-radius: 20px; border: none; background: linear-gradient(135deg, #4f805d, #3c6e4a); color: white; font-weight: 600; cursor:pointer; box-shadow: 0 4px 12px rgba(79, 128, 93, 0.3);">Add to Garden</button>
      </div>
    </div>
  </div>`;

html = html.replace(/<div class="modal-overlay" id="modalOverlay"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, newModalHtml);


// 2. Add the JS logic right before function addPlant()
const searchLogic = `
    const plantDatabase = [
      { name: "Aloe Vera (Medicinal)", scientific: "Aloe barbadensis miller", icon: "🪴", freq: 14, health: [{icon:"🧴", text:"Soothes Skin"}, {icon:"✨", text:"Purifies Air"}] },
      { name: "Holy Basil / Tulsi", scientific: "Ocimum tenuiflorum", icon: "🌿", freq: 2, health: [{icon:"🛡️", text:"Immunity Booster"}, {icon:"🫁", text:"Respiratory Health"}] },
      { name: "Mint (Herbal)", scientific: "Mentha", icon: "🍃", freq: 2, health: [{icon:"🌿", text:"Aids Digestion"}, {icon:"🧠", text:"Relieves Stress"}] },
      { name: "Ashwagandha", scientific: "Withania somnifera", icon: "🪴", freq: 5, health: [{icon:"😌", text:"Reduces Anxiety"}, {icon:"💤", text:"Improves Sleep"}] },
      { name: "Neem", scientific: "Azadirachta indica", icon: "🌳", freq: 7, health: [{icon:"🦠", text:"Antibacterial"}, {icon:"🩸", text:"Blood Purifier"}] },
      { name: "Rosemary", scientific: "Salvia rosmarinus", icon: "🌿", freq: 7, health: [{icon:"🧠", text:"Memory Boost"}, {icon:"✨", text:"Antioxidant"}] },
      { name: "Tomato", scientific: "Solanum lycopersicum", icon: "🍅", freq: 2, health: [{icon:"❤️", text:"Heart Health"}, {icon:"👀", text:"Vision Support"}] },
      { name: "Strawberry", scientific: "Fragaria × ananassa", icon: "🍓", freq: 2, health: [{icon:"✨", text:"Vitamin C"}, {icon:"🧠", text:"Brain Health"}] },
      { name: "Snake Plant", scientific: "Sansevieria trifasciata", icon: "🪴", freq: 14, health: [{icon:"🌬️", text:"Night Air Purifier"}, {icon:"✨", text:"Removes Toxins"}] },
      { name: "Alocasia Polly", scientific: "Alocasia amazonica", icon: "🌿", freq: 5, health: [{icon:"✨", text:"Air Purifier"}] },
      { name: "Spider Plant", scientific: "Chlorophytum comosum", icon: "🪴", freq: 4, health: [{icon:"🌬️", text:"Air Purifier"}] }
    ];

    function searchPlantDb(q) {
      const dropdown = document.getElementById('dbDropdown');
      dropdown.style.display = 'block';
      dropdown.innerHTML = '';
      
      const lower = q.toLowerCase();
      let matches = plantDatabase;
      if (q) {
         matches = plantDatabase.filter(p => p.name.toLowerCase().includes(lower) || p.scientific.toLowerCase().includes(lower));
      }
      
      if (matches.length === 0) {
        dropdown.innerHTML = '<div style="padding: 0.8rem 1rem; color: #8a9e8c;">No plants found. Try a different name!</div>';
        return;
      }
      
      matches.forEach(p => {
        const div = document.createElement('div');
        div.style.cssText = 'padding: 0.8rem 1rem; cursor: pointer; border-bottom: 1px solid #f0f0f0; display:flex; align-items:center; gap: 0.8rem; transition: background 0.2s;';
        div.onmouseover = () => div.style.background = '#f5f9f5';
        div.onmouseout = () => div.style.background = 'transparent';
        div.innerHTML = \`<span style="font-size:1.5rem">\${p.icon}</span> <div><div style="font-weight:600; color:#1a3d1a">\${p.name}</div><div style="font-size:0.8rem; color:#8a9e8c">\${p.scientific}</div></div>\`;
        div.onclick = () => selectPlantFromDb(p);
        dropdown.appendChild(div);
      });
    }

    function selectPlantFromDb(p) {
      document.getElementById('plantSearchDb').value = p.name;
      document.getElementById('dbDropdown').style.display = 'none';
      
      selectedEmoji = p.icon; // update global emoji
      document.getElementById('selectedPlantIcon').textContent = p.icon;
      document.getElementById('plantName').value = p.name;
      document.getElementById('scientificName').innerHTML = 'Scientific Name: <span>' + p.scientific + '</span>';
      
      document.getElementById('waterFreq').value = p.freq;
      document.getElementById('careFreqVal').textContent = p.freq;
      
      const hc = document.getElementById('healthBenefitsContainer');
      hc.innerHTML = '';
      if (p.health && p.health.length > 0) {
        p.health.forEach(h => {
          hc.innerHTML += \`<div class="health-pill" style="font-size:0.75rem; background:rgba(255,255,255,0.9); border:1px solid #d4eed8; padding:0.3rem 0.6rem; border-radius:20px; display:flex; align-items:center; gap:0.3rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02);"><span>\${h.icon}</span> \${h.text}</div>\`;
        });
      } else {
         hc.innerHTML = '<div style="font-size:0.75rem; color:#8a9e8c; font-style:italic;">No known specific benefits</div>';
      }
    }

    // Default stage since we removed the picker
    let selectedStage = '🌱 Vegetative';

    function addPlant() {`;

html = html.replace(/function addPlant\(\) \{/g, searchLogic);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully implemented option 3 layout');
