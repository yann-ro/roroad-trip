---
title: Home
layout: none
---

<!-- Import packages CSS -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css">
<link
  rel="stylesheet"
  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Life+Savers:wght@400;700;800&display=swap" rel="stylesheet">

<!-- Import local CSS -->
<link rel="stylesheet" href="assets/css/style.css">
<link rel="stylesheet" href="assets/css/main.css">
<link rel="stylesheet" href="assets/css/poi.css">

<!-- Import packages JS -->
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet.motion/dist/leaflet.motion.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/leaflet.geodesic"></script>
<script src="https://unpkg.com/leaflet-antimeridian@1.0.0/dist/leaflet.antimeridian.js"></script>

<!-- Import local JS -->
<script type="module" src="{{ '/assets/js/main.js' | relative_url }}"></script>


<!-- Code -->

<link rel="icon" type="image/png" href="{{ '/favicon.png' | relative_url }}">

<header class="main-header">
<div class="header-content">
        <h1 class="hover-title">
            <span>ROROAD</span>
            &nbsp;
            <span>TRIP</span>
        </h1>
        <img src="assets/images/header/yann.png" class="header-yann">
        <img src="assets/images/header/exocet.png" class="header-exocet">
        <img src="assets/images/header/chichen-itza.png" class="header-itza">
        <img src="assets/images/header/grenouille.png" class="header-grenouille">
        <img src="assets/images/header/rose-des-vents.png" class="header-rdv">
        <img src="assets/images/header/loutre.png" class="header-loutre">
    </div>
</header>

<div id="map">

<a href="assets/subpages/dans-ma-valise.html" target="_self" title="dans ma valise" style="position: fixed; left: 1%; bottom: 17vh; z-index: 10000;border-radius: 60%; border: 3px solid #ffffff; background-color: rgba(255,255,255,0.4);">
<img src="assets/images/valise/sac-rando.png" class="to-click" style="height: 10vh">
</a>

<a href="assets/subpages/next-steps.html" target="_self" title="next steps" style="position: fixed; left: 1%; bottom: 5vh; z-index: 10000;border-radius: 50%; border: 3px solid #ffffff; background-color: rgba(255,255,255,0.4);">
<img src="assets/images/ns-line.png" class="to-click" style="height: 8vh; width:10vh">
</a>

<a style="position: fixed; left: 60vw; transform: translateX(-100%);translateY(-100%); bottom: 10vh; z-index: 10000">
  <img src="assets/images/stitch.gif" class="to-click" style="height: 10vh">
</a>

<iframe 
  id="sc-player" 
  style="position: fixed; left: 50%; bottom: 1.1rem; transform: translateX(-50%); z-index: 999999; width: 25vw; height: 10vh;" 
  scrolling="no" 
  frameborder="no" 
  allow="autoplay" 
  src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/soundcloud%253Atracks%253A330237877&color=%23dc860c&auto_play=true&visual=false">
</iframe>

</div>