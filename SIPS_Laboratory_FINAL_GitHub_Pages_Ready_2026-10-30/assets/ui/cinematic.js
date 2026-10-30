/* SIPS Cinematic Edition · UI-only enhancements. Zero external libraries. */
(function(){
  'use strict';
  const root=document.documentElement;
  const motionOK=!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const $=q=>document.querySelector(q);
  const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // Reading progress — scrolls within the currently active section, not a fake indicator.
  const progress=$('#scrollProgress');
  let ticking=false;
  const onScroll=()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{let max=Math.max(1,document.documentElement.scrollHeight-innerHeight);if(progress)progress.style.width=Math.max(0,Math.min(100,window.scrollY/max*100)).toFixed(2)+'%';ticking=false})};
  window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll,{passive:true});window.addEventListener('hashchange',()=>requestAnimationFrame(onScroll));onScroll();
  // Choreographed reveals. Dynamically filtered cards are supported through a light observer.
  if('IntersectionObserver' in window&&motionOK){
    const targets='.wow-story-heading,.wow-story-picture,.wow-story-copy,.atlas-lead,.atlas-mount,.section-heading,.pillar-card,.feature-strip,.approved-highlight,.rail-card,.project-card,.pub-item,.student-card,.workshop-card,.media-item,.patent-entry,.mile,.funding-card,.wow-story,.research-toolbar,.wow-interlude-media,.wow-interlude-copy,.wow-chapter,.course-card,.contact-layout,.research-photo,.section-photo-block,.lab-panel,.index-box,.teaching-ethos,.impact-stat,.funding-row,.media-grid,.dissertation-feature,.photo-feature-strip';
    const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('wow-visible');io.unobserve(e.target)}}),{threshold:.075,rootMargin:'0px 0px -24px 0px'});
    const scan=()=>document.querySelectorAll(targets).forEach(el=>{if(!el.classList.contains('wow-reveal')){el.classList.add('wow-reveal');io.observe(el)}});
    scan();root.classList.add('wow-can-animate');
    const mo=new MutationObserver(mutations=>{if(mutations.some(m=>m.addedNodes.length)){requestAnimationFrame(scan)}});
    mo.observe($('#appmain'),{childList:true,subtree:true});
    document.addEventListener('click',e=>{if(e.target.closest('[data-page],[data-domain]'))requestAnimationFrame(()=>{scan();onScroll()})});
  }
  // Gallery: curated filmstrip navigation, with the existing accessible full-screen viewer.
  
  // Page identity and subtle parallax are coordinated across every section, not only Home.
  const titleMap={home:'A RESEARCH PORTFOLIO',research:'RESEARCH',media:'MEDIA & NEWS',lab:'SIPS LAB',publications:'PUBLICATIONS',mentoring:'STUDENTS & MENTORING',doctoral:'MY RESEARCH JOURNEY',patents:'INVENTION',learning:'WORKSHOPS',timeline:'JOURNEY',gallery:'GALLERY',teaching:'TEACHING',impact:'GRANTS & IMPACT',contact:'CONNECT'};
  const chapters=['home','research','media','lab','publications','mentoring','doctoral','patents','learning','timeline','gallery','teaching','impact','contact'];
  const railPage=$('#wowRailPage'),railNum=$('#wowRailNum');
  let parallaxFrame=0;
  function syncChapter(){
    const active=document.querySelector('section.page.is-active');
    const key=active?.dataset.route||'home';
    if(railPage)railPage.textContent='SIPS / '+(titleMap[key]||key.toUpperCase());
    if(railNum)railNum.textContent=String(Math.max(0,chapters.indexOf(key))+1).padStart(2,'0')+' — '+String(chapters.length).padStart(2,'0');
    root.dataset.wowChapter=key;
    window.requestAnimationFrame(()=>{document.querySelectorAll('.wow-can-animate .page.is-active .wow-reveal').forEach(el=>{if(el.getBoundingClientRect().top<innerHeight*.94)el.classList.add('wow-visible')})});
  }
  function doParallax(){parallaxFrame=0;if(!motionOK)return;const area=document.querySelector('section.page.is-active');if(!area)return;
    area.querySelectorAll('.wow-interlude-media[data-parallax]').forEach(el=>{let r=el.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;let delta=(r.top+r.height*.5-innerHeight*.5)/innerHeight;el.style.setProperty('--parallax-y',Math.max(-23,Math.min(23,-delta*24)).toFixed(2)+'px')});
  }
  function scheduleParallax(){if(!parallaxFrame)parallaxFrame=requestAnimationFrame(doParallax)}
  document.addEventListener('click',e=>{if(e.target.closest('[data-page],[data-domain],[data-labtab]'))setTimeout(()=>{syncChapter();scheduleParallax()},25)});
  window.addEventListener('hashchange',()=>setTimeout(()=>{syncChapter();scheduleParallax()},25));
  window.addEventListener('scroll',scheduleParallax,{passive:true});
  window.addEventListener('resize',scheduleParallax,{passive:true});
  syncChapter();scheduleParallax();

  const gallery=$('#cinemaGallery');if(!gallery)return;
  const media=JSON.parse($('#approvedPhotos').textContent);
  const priority=['EVENT-2026-GREPBEAT','SANASOLO-010','PROJECTS-122','PROJECTS-116','FEATURE-07'];
  const all=[...media].sort((a,b)=>{
    const pa=priority.indexOf(a.id),pb=priority.indexOf(b.id);
    if(pa>=0||pb>=0)return(pa<0?999:pa)-(pb<0?999:pb);
    return 0;
  });
  let selection=all,idx=0,playing=false,timer=null,loadTicket=0;
  const mainImg=$('#cinemaImage'),capTitle=$('#cinemaTitle'),capType=$('#cinemaCategory'),capCount=$('#cinemaCount'),capDesc=$('#cinemaDescription'),link=$('#cinemaSource'),thumbs=$('#cinemaThumbnails'),open=$('#cinemaOpen'),play=$('#cinemaPlay');
  function list(){const filter=typeof approvedCategory==='string'?approvedCategory:'All';return all.filter(p=>filter==='All'||p.placement===filter)}
  function updateStage(){
    const p=selection[idx];if(!p)return;
    const ticket=++loadTicket;
    mainImg.classList.add('cinema-swapping');
    const loader=new Image();
    const swap=()=>{if(ticket!==loadTicket)return;mainImg.src=p.src;mainImg.alt=p.alt||p.title||'SIPS event photograph';requestAnimationFrame(()=>requestAnimationFrame(()=>mainImg.classList.remove('cinema-swapping')))};
    loader.onload=swap;loader.onerror=swap;loader.src=p.src;
    if(loader.complete)swap();
    capTitle.textContent=(p.title||p.placement||'Research moment').split(' · ')[0];
    capType.textContent=p.placement||'SIPS photography';
    capCount.textContent=String(idx+1).padStart(2,'0')+' / '+String(selection.length).padStart(2,'0');
    capDesc.textContent=p.description||p.alt||'A moment from SIPS research, outreach or professional engagement.';
    link.hidden=!p.link;link.style.display=p.link?'inline-flex':'none';if(p.link){link.href=p.link;link.textContent=(p.sourceLabel||'View original source')+' ↗'}else{link.removeAttribute('href');link.textContent=''}
    open.setAttribute('data-openphoto',p.id);
    const old=thumbs.querySelector('.is-current');old?.classList.remove('is-current');
    const current=thumbs.querySelector('[data-cinema-index="'+idx+'"]');if(current){current.classList.add('is-current');current.setAttribute('aria-current','true');thumbs.querySelectorAll('button:not(.is-current)').forEach(x=>x.removeAttribute('aria-current'));const center=current.offsetLeft+current.offsetWidth/2-thumbs.clientWidth/2;thumbs.scrollTo({left:Math.max(0,center),behavior:motionOK?'smooth':'instant'});}
  }
  function renderStrip(){thumbs.innerHTML=selection.map((p,i)=>`<button type="button" class="cinema-thumb" data-cinema-index="${i}" aria-label="Show photo ${i+1}: ${escape(p.title||p.placement)}"><img src="${escape(p.src)}" alt="" loading="lazy"><span>${String(i+1).padStart(2,'0')}</span></button>`).join('')}
  function select(i){if(!selection.length)return;idx=(i+selection.length)%selection.length;updateStage()}
  function pause(){playing=false;clearInterval(timer);timer=null;play.textContent='Play story ▷';play.setAttribute('aria-pressed','false')}
  function start(){if(!motionOK)return;playing=true;play.textContent='Pause story Ⅱ';play.setAttribute('aria-pressed','true');clearInterval(timer);timer=setInterval(()=>{if(!document.hidden&&$('#page-gallery').classList.contains('is-active'))select(idx+1)},4900)}
  window.syncCinematicGallery=function(){const chosen=list();if(!chosen.length){pause();selection=[];thumbs.innerHTML='';capTitle.textContent='No photographs in this category';capDesc.textContent='Choose another category to continue.';return}selection=chosen;idx=0;pause();renderStrip();updateStage()};
  window.syncCinematicGallery();
  $('#cinemaPrev').addEventListener('click',()=>{pause();select(idx-1)});
  $('#cinemaNext').addEventListener('click',()=>{pause();select(idx+1)});
  play.addEventListener('click',()=>playing?pause():start());
  thumbs.addEventListener('click',e=>{const b=e.target.closest('[data-cinema-index]');if(b){pause();select(Number(b.dataset.cinemaIndex))}});
  gallery.addEventListener('keydown',e=>{if(e.target.matches('input,select,textarea')||!$('#page-gallery').classList.contains('is-active')||!$('#imageViewer').hidden)return;if(e.key==='ArrowRight'){e.preventDefault();pause();select(idx+1)}else if(e.key==='ArrowLeft'){e.preventDefault();pause();select(idx-1)}});
  document.addEventListener('click',e=>{if(e.target.closest('[data-page]'))pause()});
  window.addEventListener('hashchange',()=>{if(!$('#page-gallery').classList.contains('is-active'))pause()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});
  window.addEventListener('pagehide',pause);
})();
