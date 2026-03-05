---
title: Home
layout: none
---

<!-- Import packages CSS -->
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
            <span>R</span><span>O</span><span>R</span><span>O</span><span>A</span><span>D</span>
            &nbsp;
            <span>T</span><span>R</span><span>I</span><span>P</span>
        </h1>
        <img src="assets/images/header/yann.png" class="header-yann">
        <img src="assets/images/header/exocet.png" class="header-exocet">
        <img src="assets/images/header/chichen-itza.png" class="header-itza">
        <img src="assets/images/header/grenouille.png" class="header-grenouille">
        <img src="assets/images/header/rose-des-vents.png" class="header-rdv">
        <img src="assets/images/header/loutre.png" class="header-loutre">
    </div>
</header>

<div class="mobile-warning">
    <p>💻 Ce site est optimisé pour un usage sur ordinateur.</p>
    <button onclick="this.parentElement.style.display='none'">Continuer quand même</button>
</div>

<div id="map">

<a href="https://forms.gle/EgaQ7tgcw7v7PLp9A" target="_blank" class="bug-report-button">
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M480-80q-106 0-186-68.5T197-322l-77 77-57-56 87-87q-13-26-21.5-54.5T120-423h-80v-80h80q0-25 5-51.5t16-52.5l-95-94 57-57 101 101q41-55 101-89t128-40v-95h80v95q68 6 128 40t101 89l101-101 57 57-95 94q11 26 16 52.5t5 51.5h80v80h-80q0 28-8.5 56.5T836-332l87 87-57 56-77-77q-17 104-97 172.5T480-80Zm0-120q75 0 127.5-52.5T660-380v-100H300v100q0 75 52.5 127.5T480-200Zm-100-260h200v-120q0-42-29-71t-71-29q-42 0-71 29t-29 71v120Z"/></svg>
</a>

</div>

<footer class="main-footer">
    <p>&copy; 2026 Yann Rodriguez. All rights reserved.</p>
</footer>