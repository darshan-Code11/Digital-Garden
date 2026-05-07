const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldRenderTaskList = `    function renderTaskList(ud) {
      const tl = document.getElementById('taskList'); if (!tl) return;
      tl.innerHTML = '';
      
      let tasksToRender = [];
      if (ud.plants && ud.plants.length > 0) {
        const todayStr = new Date().toDateString();
        if (ud.lastTaskGenerationDate !== todayStr || !ud.tasks) {
            ud.tasks = ud.plants.map((p, i) => {
                let timeStr = p.reminderTime || '09:00';
                let h = parseInt(timeStr.split(':')[0]);
                let m = timeStr.split(':')[1];
                let ampm = h >= 12 ? 'PM' : 'AM';
                h = h % 12 || 12;
                return {
                    id: p.id || ('task_' + Date.now() + '_' + i),
                    dot: 'dot-water',
                    text: \`Water \${p.icon || '🌱'} \${p.name}\`,
                    time: \`\${h}:\${m} \${ampm}\`,
                    done: false
                };
            });
            ud.lastTaskGenerationDate = todayStr;
            ud.wateredToday = 0;
            saveUserDB();
        }
        
        // If a plant was newly added today, it might not be in ud.tasks yet.
        // Let's ensure all plants have a task.
        if (ud.plants.length > ud.tasks.length) {
            const existingIds = ud.tasks.map(t => t.id);
            ud.plants.forEach((p, i) => {
                const pid = p.id || ('task_' + Date.now() + '_' + i);
                if (!existingIds.includes(pid)) {
                    let timeStr = p.reminderTime || '09:00';
                    let h = parseInt(timeStr.split(':')[0]);
                    let m = timeStr.split(':')[1];
                    let ampm = h >= 12 ? 'PM' : 'AM';
                    h = h % 12 || 12;
                    ud.tasks.push({
                        id: pid,
                        dot: 'dot-water',
                        text: \`Water \${p.icon || '🌱'} \${p.name}\`,
                        time: \`\${h}:\${m} \${ampm}\`,
                        done: false
                    });
                }
            });
            saveUserDB();
        }
        
        tasksToRender = ud.tasks;
      } else {
        tasksToRender = [
            { id: 'empty', dot: 'dot-water', text: 'Add a plant to see tasks!', time: '', done: false }
        ];
      }

      tasksToRender.forEach(t => {
        const div = document.createElement('div');
        div.className = 'reminder-item';
        div.style.opacity = t.done ? .4 : 1;
        div.style.textDecoration = t.done ? 'line-through' : '';
        div.innerHTML = \`<div class="reminder-dot \${t.dot}"></div><div class="reminder-text">\${t.text}</div><div class="reminder-time">\${t.time}</div>\`;
        if (t.id !== 'empty') {
            div.onclick = () => markTaskDone(t.id, ud, div);
        }
        tl.appendChild(div);
      });
    }`;

const newRenderTaskList = `    function renderTaskList(ud) {
      const tl = document.getElementById('taskList'); if (!tl) return;
      tl.innerHTML = '';
      
      let tasksToRender = [];
      if (ud.plants && ud.plants.length > 0) {
        const todayStr = new Date().toDateString();
        
        // Filter plants that ACTUALLY need watering today based on frequency
        const getDuePlants = () => {
            return ud.plants.filter(p => {
                const today = new Date().setHours(0,0,0,0);
                const lastWateredDay = new Date(p.lastWatered || p.id).setHours(0,0,0,0);
                const diffDays = Math.floor((today - lastWateredDay) / (1000 * 60 * 60 * 24));
                return diffDays >= (p.waterFrequencyDays || 2) || (diffDays === 0 && !p.lastWatered);
            });
        };

        if (ud.lastTaskGenerationDate !== todayStr || !ud.tasks) {
            ud.tasks = getDuePlants().map((p, i) => {
                let timeStr = p.reminderTime || '09:00';
                let h = parseInt(timeStr.split(':')[0]);
                let m = timeStr.split(':')[1];
                let ampm = h >= 12 ? 'PM' : 'AM';
                h = h % 12 || 12;
                return {
                    id: p.id || ('task_' + Date.now() + '_' + i),
                    dot: 'dot-water',
                    text: \`Water \${p.icon || '🌱'} \${p.name}\`,
                    time: \`\${h}:\${m} \${ampm}\`,
                    done: false
                };
            });
            ud.lastTaskGenerationDate = todayStr;
            ud.wateredToday = 0;
            saveUserDB();
        }
        
        // Dynamically append newly added plants that are due today
        const existingIds = ud.tasks.map(t => t.id);
        const duePlants = getDuePlants();
        let tasksAdded = false;
        
        duePlants.forEach((p, i) => {
            const pid = p.id || ('task_' + Date.now() + '_' + i);
            if (!existingIds.includes(pid)) {
                let timeStr = p.reminderTime || '09:00';
                let h = parseInt(timeStr.split(':')[0]);
                let m = timeStr.split(':')[1];
                let ampm = h >= 12 ? 'PM' : 'AM';
                h = h % 12 || 12;
                ud.tasks.push({
                    id: pid,
                    dot: 'dot-water',
                    text: \`Water \${p.icon || '🌱'} \${p.name}\`,
                    time: \`\${h}:\${m} \${ampm}\`,
                    done: false
                });
                tasksAdded = true;
            }
        });
        
        if (tasksAdded) saveUserDB();
        
        tasksToRender = ud.tasks;
        if (tasksToRender.length === 0) {
            tasksToRender = [{ id: 'empty', dot: 'dot-water', text: 'All caught up for today! 🎉', time: '', done: false }];
        }
      } else {
        tasksToRender = [
            { id: 'empty', dot: 'dot-water', text: 'Add a plant to see tasks!', time: '', done: false }
        ];
      }

      tasksToRender.forEach(t => {
        const div = document.createElement('div');
        div.className = 'reminder-item';
        div.style.opacity = t.done ? .4 : 1;
        div.style.textDecoration = t.done ? 'line-through' : '';
        div.innerHTML = \`<div class="reminder-dot \${t.dot}"></div><div class="reminder-text">\${t.text}</div><div class="reminder-time">\${t.time}</div>\`;
        if (t.id !== 'empty') {
            div.onclick = () => markTaskDone(t.id, ud, div);
        }
        tl.appendChild(div);
      });
    }`;

html = html.replace(oldRenderTaskList, newRenderTaskList);

const oldMarkTaskDone = `    function markTaskDone(id, ud, el) {
      if (!ud.tasks) return;
      const t = ud.tasks.find(x => x.id === id);
      if (t && !t.done) {
        t.done = true; ud.wateredToday = (ud.wateredToday || 0) + 1;
        saveUserDB(); el.style.opacity = '.4'; el.style.textDecoration = 'line-through';
        updateStats(ud);
        showToast('✅ Task completed!');
      }
    }`;

const newMarkTaskDone = `    function markTaskDone(id, ud, el) {
      if (!ud.tasks) return;
      const t = ud.tasks.find(x => x.id === id);
      if (t && !t.done) {
        t.done = true; 
        ud.wateredToday = (ud.wateredToday || 0) + 1;
        
        // Update the plant's lastWatered date
        const plant = ud.plants.find(p => p.id === id);
        if (plant) plant.lastWatered = Date.now();
        
        saveUserDB(); 
        el.style.opacity = '.4'; 
        el.style.textDecoration = 'line-through';
        updateStats(ud);
        showToast('✅ Task completed!');
      }
    }`;

html = html.replace(oldMarkTaskDone, newMarkTaskDone);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully updated Today Tasks logic to support frequencies');
