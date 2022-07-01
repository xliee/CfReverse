# Cloudflare Reverse Engineered (work in progress)
Work in progress for:
- https://[WEBSITE]/cdn-cgi/challenge-platform/h/b/orchestrate/managed/v1?ray=[RAYID] ray script

Websites:
- https://innvictus.com/


### Inspiration from:
**Github:** [devgianlu/cloudflare-bypass](https://github.com/devgianlu/cloudflare-bypass "devgianlu/cloudflare-bypass")

**Github:** [ffeelix/cloudflare-deobfuscator](https://github.com/ffeelix/cloudflare-deobfuscator "ffeelix/cloudflare-deobfuscator")

### Deobfuscator Usage
From [@ffeelix](https://github.com/ffeelix "@ffeelix")
Features:
- Clean some Proxy Binary Functions
- Unconceals String Conceals
- ~~Unflattens Control Flow Flattening Protection~~

Paste the challenge script into input/main_challenge.js

Run
```bash
npm install
npm start
```