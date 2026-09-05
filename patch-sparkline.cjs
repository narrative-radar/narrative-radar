const fs = require('fs');

const repoPath = 'src/lib/server/repositories/cluster.repository.ts';
let repoCode = fs.readFileSync(repoPath, 'utf8');

// Change recomputeCluster signature
repoCode = repoCode.replace('sparklinePoint: number; // the new member_count snapshot to append', 'sparklinePoints: number[]; // the pre-computed sliced array');
repoCode = repoCode.replace('sparklinePoint,', 'sparklinePoints,');

// Remove the complex SQL
repoCode = repoCode.replace(/const appendAndTrim = sql`[\s\S]*?\]`;/, '');
repoCode = repoCode.replace(/const sparklineUpdate = sql`[\s\S]*?\]`;/, '');
repoCode = repoCode.replace(/\/\/ Trim to last 12 via slice[\s\S]*?const sparklineTrimmed = sql`[\s\S]*?\)\)`;/, '');
repoCode = repoCode.replace(/sparklinePoints: sparklineTrimmed,/, 'sparklinePoints,');

fs.writeFileSync(repoPath, repoCode);

const svcPath = 'src/lib/server/services/clustering.service.ts';
let svcCode = fs.readFileSync(svcPath, 'utf8');

// Update how recomputeCluster is called
svcCode = svcCode.replace(
    "sparklinePoint: newMemberCount,", 
    "sparklinePoints: [...(Array.isArray(bestMatch.sparklinePoints) ? bestMatch.sparklinePoints : []), newMemberCount].slice(-12),"
);

fs.writeFileSync(svcPath, svcCode);
console.log("Patched!");
