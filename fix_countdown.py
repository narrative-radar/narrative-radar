import os
import re

filepath = "src/routes/(app)/radar/+page.svelte"
with open(filepath, 'r') as f: content = f.read()

# Remove the old scanSeconds and formattedCountdown logic
content = re.sub(r'let scanSeconds = \$state\(300\); // 5 minutes\n\tlet scanInterval: any;',
                 r'let nextScanText = $state("scheduler: off");\n\tlet scanInterval: any;', content)

content = re.sub(r'scanInterval = setInterval\(\(\) => \{\n\t\t\tscanSeconds--;\n\t\t\tif \(scanSeconds < 0\) scanSeconds = 300;\n\t\t\}, 1000\);',
                 r"""scanInterval = setInterval(() => {
			const latestCronLog = clustersQuery.data?.latestCronLog;
			if (!latestCronLog || !latestCronLog.timestamp) {
				nextScanText = 'scheduler: off';
				return;
			}
			const lastRunMs = new Date(latestCronLog.timestamp).getTime();
			const nowMs = Date.now();
			if (nowMs - lastRunMs > 10 * 60 * 1000) {
				nextScanText = 'scheduler: off';
			} else {
				const nextRunMs = lastRunMs + 5 * 60 * 1000;
				const diffMs = nextRunMs - nowMs;
				if (diffMs <= 0) {
					nextScanText = 'scanning...';
				} else {
					const m = Math.floor(diffMs / 60000);
					const s = Math.floor((diffMs % 60000) / 1000);
					nextScanText = `0${m}:${s.toString().padStart(2, '0')}`;
				}
			}
		}, 1000);""", content)

content = re.sub(r'let formattedCountdown = \$derived\(\(\) => \{\n\t\tconst m = Math\.floor\(scanSeconds / 60\);\n\t\tconst s = scanSeconds % 60;\n\t\treturn `\$\{m\}:\$\{s < 10 \? \'0\' : \'\'\}\$\{s\}`;\n\t\}\);', '', content)

# Replace the HTML display
old_span = '<span class="text-[var(--text-secondary)] text-[13px] font-mono mt-1">scheduler: off</span>'
new_span = """{#if nextScanText === 'scheduler: off'}
						<span class="text-[var(--text-secondary)] text-[13px] font-mono mt-1">{nextScanText}</span>
					{:else}
						<span class="text-white text-[16px] font-bold">{nextScanText}</span>
					{/if}"""
content = content.replace(old_span, new_span)

with open(filepath, 'w') as f: f.write(content)
