const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldRenderTaskList = `    function renderTaskList(ud) {
      const tl = document.getElementById('taskList'); if (!tl) return;
      tl.innerHTML = '';
      (ud.tasks || defaultTasks).forEach(t => {
        const div = document.createElement('div');
        div.className = 'reminder-item';
        div.style.opacity = t.done ? .4 : 1;
        div.style.textDecoration = t.done ? 'line-through' : '';
        div.innerHTML = \`<div class="reminder-dot \${t.dot}"></div><div class="reminder-text">\${t.text}</div><div class="reminder-time">\${t.time}</div>\`;
        div.onclick = () => markTaskDone(t.id, ud, div);
        tl.appendChild(div);
      });
    }`;

const newRenderTaskList = `    function renderTaskList(ud) {
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

html = html.replace(oldRenderTaskList, newRenderTaskList);

const oldMarkTaskDone = `    function markTaskDone(id, ud, el) {
      const t = ud.tasks.find(x => x.id === id);
      if (t && !t.done) {`;

const newMarkTaskDone = `    function markTaskDone(id, ud, el) {
      if (!ud.tasks) return;
      const t = ud.tasks.find(x => x.id === id);
      if (t && !t.done) {`;

html = html.replace(oldMarkTaskDone, newMarkTaskDone);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully updated Today Tasks logic');
