# 🏆 The Chris-cademy Awards

An interactive 3D Oscars trivia experience built for Chris's birthday. Chris is a movie buff who hosts an Oscars party every year.

**Live:** https://brandonganem.github.io/chris-oscars-birthday/

## What's inside

- **Play the Trivia**: three rounds (Classic, Emoji Movies, Guess the Year). You earn mini golden statuettes on stage, and your score earns a rank.
- **Walk the Red Carpet**: a trip down a 3D carpet with one billboard per decade, from the 1920s to the 2020s.
- **Speech Generator**: builds a random acceptance speech. You get 20 seconds before the orchestra plays you off.
- **The Final Envelope**: *Best Birthday in a Leading Role*. Yes, there's a mix-up.
- **The Cake**: tap the candles or blow into your mic to put them out.
- Also: a spinnable Oscar, paparazzi flashes, confetti, fireworks, and a synthesized soundtrack.

## Tech

It's plain static files with no build step: Three.js (r160) via an import map from jsDelivr, and all sound is synthesized with WebAudio. It deploys straight to GitHub Pages from `main`.

## Personalize

Edit `CONFIG` in `js/data.js` to change the honoree, the sender, the category, and so on. Trivia content is in the same file.

## Dev

```sh
python -m http.server 8141
# http://localhost:8141/?go=trivia   (jump to: menu | trivia | walk | speech | finale | cake | credits)
```
