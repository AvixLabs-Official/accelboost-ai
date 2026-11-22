const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
// theme toggle with circular expanding transition
const thBtn=$('#thBtn');
const getTh=()=>document.documentElement.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
thBtn.onclick=e=>{
  const nxt=getTh()==='dark'?'light':'dark';
  thBtn.classList.add('spinning');
  setTimeout(()=>thBtn.classList.remove('spinning'),500);

  const rect=thBtn.getBoundingClientRect();
  const x=rect.left+rect.width/2;
  const y=rect.top+rect.height/2;
  const maxR=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));

  if(document.startViewTransition){
    const transition=document.startViewTransition(()=>{
      document.documentElement.setAttribute('data-theme',nxt);
      localStorage.setItem('theme',nxt);
    });
    transition.ready.then(()=>{
      document.documentElement.animate({
        clipPath:[`circle(0px at ${x}px ${y}px)`,`circle(${maxR}px at ${x}px ${y}px)`]
      },{
        duration:850,
        easing:'cubic-bezier(0.7,0,0.2,1)',
        pseudoElement:'::view-transition-new(root)'
      });
    });
  } else {
    const rip=document.createElement('div');
    rip.className=`th-ripple ${nxt}`;
    rip.style.left=x+'px';
    rip.style.top=y+'px';
    rip.style.width=(maxR*2.2)+'px';
    rip.style.height=(maxR*2.2)+'px';
    document.body.appendChild(rip);
    void rip.offsetWidth;
    rip.classList.add('active');
    setTimeout(()=>{
      document.documentElement.setAttribute('data-theme',nxt);
      localStorage.setItem('theme',nxt);
      rip.style.opacity='0';
      setTimeout(()=>rip.remove(),400);
    },700);
  }
};
const savedTh=localStorage.getItem('theme');if(savedTh)document.documentElement.setAttribute('data-theme',savedTh);
// menu, cookies, header hide
const menu=$('#menu'),bg=$('#bg');bg.onclick=()=>{menu.classList.toggle('o');bg.classList.toggle('o')};$$('.menu a').forEach(a=>a.onclick=()=>{menu.classList.remove('o');bg.classList.remove('o')});
$$('[data-x]').forEach(b=>b.onclick=()=>$('#ck').classList.add('x'));
let ly=0;addEventListener('scroll',()=>{const y=scrollY;$('#hd').classList.toggle('h',y>ly&&y>400&&!menu.classList.contains('o'));ly=y},{passive:true});
// dock sliding highlight with keyboard & mouse support
const dk=$('#dock'),pi=dk.querySelector('i');
const movePill=a=>{pi.style.left=a.offsetLeft+'px';pi.style.width=a.offsetWidth+'px';pi.style.opacity=1};
$$('#dock a').forEach(a=>{a.addEventListener('mouseenter',()=>movePill(a));a.addEventListener('focus',()=>movePill(a));a.addEventListener('blur',()=>pi.style.opacity=0)});
dk.addEventListener('mouseleave',()=>pi.style.opacity=0);
// reveal + count-up + chart fill
function cnt(el){const t=+el.dataset.c,d=t%1?1:0,s=performance.now();(function f(n){const k=Math.min((n-s)/1600,1);el.textContent=(t*(1-Math.pow(1-k,3))).toFixed(d);if(k<1)requestAnimationFrame(f)})(s)}
const io=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting){const t=x.target;t.classList.add('v');t.querySelectorAll('[data-c]').forEach(cnt);const v=t.querySelector('.v2');if(v)v.style.strokeDashoffset=200;io.unobserve(t)}}),{threshold:.15});$$('.rv').forEach(e=>io.observe(e));
// showreel
const sc=$$('.sc'),reel=$('.reel'),cur=$('#cur'),pg=[...$('#pg').children],D=[4200,4600,4600,5000];let i=0,paused=false,t,startTime=performance.now(),remaining=D[0];
function go(n){sc[i].classList.remove('on');i=n%sc.length;void sc[i].offsetWidth;sc[i].classList.add('on');pg.forEach(p=>p.classList.remove('a'));void $('#pg').offsetWidth;pg[i].style.setProperty('--t',D[i]+'ms');pg[i].classList.add('a');remaining=D[i];startTime=performance.now()}
function tick(delay=remaining){clearTimeout(t);startTime=performance.now();remaining=delay;t=setTimeout(()=>{if(!paused){go(i+1);tick(D[i])}},delay)}
go(0);tick();
reel.onclick=e=>{if(e.target.closest('a,button'))return;paused=!paused;reel.classList.toggle('pz',paused);cur.textContent=paused?'▶ Play':'❚❚ Pause';if(paused){clearTimeout(t);remaining-=performance.now()-startTime}else{tick(Math.max(remaining,200))}};
// cursor follower
let mx=0,my=0,cx=0,cy=0;addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY},{passive:true});
(function r(){cx+=(mx-cx)*.18;cy+=(my-cy)*.18;cur.style.transform=`translate(${cx+16}px,${cy+16}px)`;requestAnimationFrame(r)})();
function lab(el,f){el.addEventListener('mouseenter',()=>{cur.textContent=f();cur.classList.add('on')});el.addEventListener('mouseleave',()=>cur.classList.remove('on'))}
lab(reel,()=>paused?'▶ Play':'❚❚ Pause');$$('a.post').forEach(c=>lab(c,()=>'View ↗'));
// reel scroll shrink
const inn=$('#in');addEventListener('scroll',()=>{const p=Math.min(scrollY/innerHeight,1);inn.style.transform=`scale(${1-p*.07}) translateY(${p*50}px)`;reel.style.borderRadius=(34+p*30)+'px'},{passive:true});
// word-by-word lead
const lead=$('#lead');lead.innerHTML=lead.textContent.split(' ').map(w=>`<span class="w${/paid|search|flat/.test(w)?' or':''}">${w}</span>`).join(' ');const ws=$$('#lead .w');
function hl(){const r=lead.getBoundingClientRect(),p=Math.min(Math.max((innerHeight*.88-r.top)/(r.height+innerHeight*.3),0),1);ws.forEach((w,k)=>w.classList.toggle('on',k/ws.length<p))}addEventListener('scroll',hl,{passive:true});hl();
// watermark progressive highlight up to hovered char
const wmkChars=$$('.wmk-char');
wmkChars.forEach((ch,idx)=>{
  ch.addEventListener('mouseenter',()=>{
    wmkChars.forEach((c,i)=>{
      c.classList.toggle('act',i<=idx);
    });
  });
});
const wmkBrand=$('#wmkBrand');
if(wmkBrand){
  wmkBrand.addEventListener('mouseleave',()=>{
    wmkChars.forEach(c=>c.classList.remove('act'));
  });
}
// pricing toggle
$$('#tog button').forEach(b=>b.onclick=()=>{$$('#tog button').forEach(x=>x.classList.remove('on'));b.classList.add('on');const m=b.dataset.m==='1';$$('[data-p]').forEach(p=>{const to=m?+p.dataset.p:Math.round(p.dataset.p*.8),from=parseInt(p.textContent.replace(/\D/g,'')),s=performance.now();(function f(n){const k=Math.min((n-s)/500,1);p.textContent='$'+Math.round(from+(to-from)*(1-Math.pow(1-k,3))).toLocaleString();if(k<1)requestAnimationFrame(f)})(s)})});