const fs = require('fs');

const path = 'src/routes/(marketing)/+page.svelte';
let content = fs.readFileSync(path, 'utf8');

// 1. Add Scramble Action
if (!content.includes('function scrambleText')) {
    const scrambleFunc = `
  function scrambleText(node, text) {
    const chars = '!<>-_\\\\/[]{}—=+*^?#_';
    let frame = 0;
    let queue = [];
    
    for (let i = 0; i < text.length; i++) {
      queue.push({
        from: chars[Math.floor(Math.random() * chars.length)],
        to: text[i],
        start: Math.floor(Math.random() * 40),
        end: Math.floor(Math.random() * 40) + 40
      });
    }
    
    const update = () => {
      let output = '';
      let complete = 0;
      for (let i = 0; i < queue.length; i++) {
        let { from, to, start, end } = queue[i];
        if (frame >= end) {
          complete++;
          output += to;
        } else if (frame >= start) {
          output += \`<span class="opacity-50 text-[var(--cyan)]">\${chars[Math.floor(Math.random() * chars.length)]}</span>\`;
        } else {
          output += \`<span class="opacity-0">\${from}</span>\`;
        }
      }
      node.innerHTML = output;
      if (complete === queue.length) return;
      frame++;
      requestAnimationFrame(update);
    };
    
    setTimeout(() => requestAnimationFrame(update), 500);
  }
`;
    content = content.replace("let activeStep = $state(0);", "let activeStep = $state(0);\n" + scrambleFunc);
}

fs.writeFileSync(path, content);
