import { Deobfusactor } from "./deobfuscator";

import fs from 'fs';
const src = fs.readFileSync('input/second_challenge.js').toString()



const session = new Deobfusactor(src)






fs.writeFileSync("output2.js", session.deobfuscateMainChallenge())