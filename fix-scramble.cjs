const fs = require('fs');
const path = 'src/routes/(app)/radar/+page.svelte';
let content = fs.readFileSync(path, 'utf8');

// Remove GSAP Scramble imports
content = content.replace(/import ScrambleTextPlugin from 'gsap\/dist\/ScrambleTextPlugin';\n/, '');
content = content.replace(/gsap\.registerPlugin\(ScrambleTextPlugin\);\n/, '');

// The custom scrambleText function
const scrambleFunc = `
	function scrambleText(element, finalString, durationMs = 1100, delayMs = 150) {
		const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		const totalFrames = Math.round((durationMs / 1000) * 60);
		let frame = 0;
		setTimeout(() => {
			const animate = () => {
				let output = "";
				const progress = frame / totalFrames;
				for (let i = 0; i < finalString.length; i++) {
					if (finalString[i] === " " || finalString[i] === ".") { output += finalString[i]; continue; }
					if (i < finalString.length * progress) { output += finalString[i]; } 
					else { output += chars[Math.floor(Math.random() * chars.length)]; }
				}
				element.textContent = output;
				if (frame < totalFrames) { frame++; requestAnimationFrame(animate); }
			};
			animate();
		}, delayMs);
	}
`;

// Inject custom function
content = content.replace(/let isDetailOpen = \$state\(false\);/, scrambleFunc + '\n\tlet isDetailOpen = $state(false);');

// Replace the gsap.to block
const oldGsapCall = `			gsap.to(titleEl, {
				duration: 1.1,
				delay: 0.1,
				scrambleText: { text, chars: "upperCase", speed: 0.5, revealDelay: 0.2 }
			});`;
const newCall = `			scrambleText(titleEl, text, 1100, 100);`;
content = content.replace(oldGsapCall, newCall);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed ScrambleTextPlugin issue.');
