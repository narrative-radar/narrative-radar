const fs = require('fs');

const waveHtml = `
          <!-- Active Wave -->
          <div class="absolute -bottom-[1px] left-0 w-full flex items-end justify-between gap-[1px] h-[3px]">
            <div class="flex-1 bg-[var(--live)] animate-[wave_1s_ease-in-out_infinite_alternate] h-[40%]"></div>
            <div class="flex-1 bg-[var(--live)] animate-[wave_1.2s_ease-in-out_infinite_alternate_0.2s] h-[100%]"></div>
            <div class="flex-1 bg-[var(--live)] animate-[wave_0.8s_ease-in-out_infinite_alternate_0.4s] h-[60%]"></div>
            <div class="flex-1 bg-[var(--live)] animate-[wave_1.4s_ease-in-out_infinite_alternate_0.6s] h-[80%]"></div>
            <div class="flex-1 bg-[var(--live)] animate-[wave_1s_ease-in-out_infinite_alternate_0.3s] h-[50%]"></div>
            <div class="flex-1 bg-[var(--live)] animate-[wave_1.1s_ease-in-out_infinite_alternate_0.1s] h-[90%]"></div>
          </div>
`;

function patchTabs(filePath, isMarketing) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace the old nav block
  const oldNavRegex = /<nav class="hidden md:flex items-center gap-8 font-mono text-\[11px\] uppercase tracking-widest mt-1">[\s\S]*?<\/nav>/;
  
  let newNav = `<nav class="hidden md:flex items-center gap-8 font-mono text-[11px] uppercase tracking-widest mt-1">
        <a href="/" class="relative pb-2 transition-colors \${'${isMarketing ? 'true' : '$page.url.pathname === \'/\''}' === 'true' ? 'text-white font-bold' : 'text-[var(--dim)] hover:text-white'}">
          Overview
          {#if ${isMarketing ? 'true' : '$page.url.pathname === \'/\''}}${waveHtml}{/if}
        </a>
        <a href="/radar" class="relative pb-2 transition-colors \${'${isMarketing ? 'false' : '$page.url.pathname === \'/radar\''}' === 'true' ? 'text-white font-bold' : 'text-[var(--dim)] hover:text-white'}">
          Terminal_OS
          {#if ${isMarketing ? 'false' : '$page.url.pathname === \'/radar\''}}${waveHtml}{/if}
        </a>
        <a href="/track-record" class="relative pb-2 transition-colors \${'${isMarketing ? 'false' : '$page.url.pathname === \'/track-record\''}' === 'true' ? 'text-white font-bold' : 'text-[var(--dim)] hover:text-white'}">
          Track Record
          {#if ${isMarketing ? 'false' : '$page.url.pathname === \'/track-record\''}}${waveHtml}{/if}
        </a>
      </nav>`;
      
  content = content.replace(oldNavRegex, newNav);
  fs.writeFileSync(filePath, content);
}

patchTabs('src/routes/(app)/+layout.svelte', false);
patchTabs('src/routes/(marketing)/+page.svelte', true);
