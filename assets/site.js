(function(){
var root=document.body.getAttribute('data-root')||'';
function get(k){try{return localStorage.getItem(k)}catch(e){return null}}
function set(k,v){try{localStorage.setItem(k,v)}catch(e){}}
// reading size
var size=parseFloat(get('al-size'))||1.15;
document.documentElement.style.setProperty('--fs',size+'rem');
document.querySelectorAll('[data-size]').forEach(function(b){b.addEventListener('click',function(){
 size=Math.min(1.7,Math.max(.95,size+parseInt(b.getAttribute('data-size'))*.1));
 document.documentElement.style.setProperty('--fs',size+'rem');set('al-size',size)})});
// chapter: progress bar, remember place, highlight
var ch=document.querySelector('.chapter');
if(ch){
 var bar=document.querySelector('.progress i');
 var upd=function(){var h=document.documentElement;var p=h.scrollTop/(h.scrollHeight-h.clientHeight||1);if(bar)bar.style.width=Math.min(100,p*100)+'%'};
 window.addEventListener('scroll',upd,{passive:true});upd();
 set('al-last',JSON.stringify({b:ch.dataset.book,n:+ch.dataset.n,bt:ch.dataset.btitle,ct:ch.dataset.ctitle}));
 var m=get('al-book-'+ch.dataset.book);if(!m||+m<+ch.dataset.n)set('al-book-'+ch.dataset.book,ch.dataset.n);
 var q=new URLSearchParams(location.search).get('q');
 if(q){var terms=q.toLowerCase().split(/\s+/).filter(function(t){return t.length>2});
  var w=document.createTreeWalker(ch.querySelector('.prose'),NodeFilter.SHOW_TEXT),nodes=[],n;while(n=w.nextNode())nodes.push(n);
  var re=new RegExp('('+terms.map(function(t){return t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}).join('|')+')\\w*','gi'),first=null;
  nodes.forEach(function(t){if(!re.test(t.nodeValue)){re.lastIndex=0;return}re.lastIndex=0;
   var s=document.createElement('span');s.innerHTML=t.nodeValue.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(re,'<mark>$&</mark>');
   t.parentNode.replaceChild(s,t);if(!first)first=s.querySelector('mark')});
  if(first)first.scrollIntoView({block:'center'})}
}
// book page: resume link
var rb=document.querySelector('[data-resume]');
if(rb){var bk=rb.getAttribute('data-resume'),n=get('al-book-'+bk);if(n&&+n>0){rb.href=n+'.html';rb.hidden=false;rb.textContent='Continue at chapter '+n}}
// home: continue reading
var res=document.getElementById('resume');
if(res){var l=get('al-last');if(l){try{var o=JSON.parse(l);res.innerHTML='Continue: <a href="'+root+'b/'+o.b+'/'+o.n+'.html"></a>';res.querySelector('a').textContent=o.bt+', '+o.ct;res.hidden=false}catch(e){}}}
// library filter
var f=document.getElementById('f');
if(f)f.addEventListener('input',function(){var v=f.value.toLowerCase();document.querySelectorAll('.theme').forEach(function(s){var any=false;s.querySelectorAll('li').forEach(function(li){var ok=li.textContent.toLowerCase().indexOf(v)>-1;li.hidden=!ok;if(ok)any=true});s.hidden=!any});if(v)document.querySelectorAll('.tsec:not([hidden])').forEach(function(d){if(window.alToggle)alToggle(d,true)})});
// search
var sf=document.getElementById('sf');
if(sf){
 var input=document.getElementById('q'),out=document.getElementById('results'),st=document.getElementById('status'),dec=null;
 function decode(){if(dec)return dec;dec={};var W=window.IDX.w;for(var k in W){var last=0,a=[];W[k].split(',').forEach(function(x){last+=parseInt(x,36);a.push(last)});dec[k]=a}return dec}
 function run(){
  var q=input.value.trim().toLowerCase();out.innerHTML='';
  if(!window.IDX){st.textContent='Loading the index. Try again in a moment.';return}
  var terms=q.split(/\s+/).filter(function(t){return t.length>=3});
  if(!terms.length){st.textContent='Type at least three letters.';return}
  var D=decode(),sets=terms.map(function(t){var s={};for(var k in D){if(k.indexOf(t)===0)D[k].forEach(function(i){s[i]=1})}return s});
  var ids=Object.keys(sets[0]).filter(function(i){return sets.every(function(s){return s[i]})}).map(Number).sort(function(a,b){return a-b});
  st.textContent=ids.length?ids.length+' chapter'+(ids.length>1?'s':'')+(ids.length>100?', showing the first 100':''):'No chapters match. Try a shorter word.';
  ids.slice(0,100).forEach(function(i){var c=IDX.c[i],li=document.createElement('li'),a=document.createElement('a'),sp=document.createElement('span');
   a.href=root+'b/'+c[0]+'/'+c[1]+'.html?q='+encodeURIComponent(q);a.textContent=c[2];sp.textContent=c[3]+', chapter '+c[1];li.appendChild(a);li.appendChild(sp);out.appendChild(li)})}
 sf.addEventListener('submit',function(e){e.preventDefault();run()});
 var u=new URLSearchParams(location.search).get('q');if(u){input.value=u;window.addEventListener('load',run)}
}
})();
(function(){var l=document.getElementById('skl');if(!l)return;
var items=[].slice.call(l.children),q=document.getElementById('sq'),b=document.getElementById('sb'),t=document.getElementById('st'),o=document.getElementById('so'),n=document.getElementById('skn');
function go(){var v=q.value.toLowerCase(),shown=0;
 var s=items.slice().sort(function(a,c){var m=o.value;
  if(m==='title')return a.dataset.title.localeCompare(c.dataset.title);
  if(m==='short')return a.dataset.words-c.dataset.words;if(m==='long')return c.dataset.words-a.dataset.words;
  return a.dataset.order-c.dataset.order});
 [].slice.call(l.querySelectorAll('.grp')).forEach(function(g){g.remove()});var lastb=null;
 s.forEach(function(li){if(o.value==='order'&&li.dataset.book!==lastb){lastb=li.dataset.book;var g=document.createElement('li');g.className='grp';g.innerHTML='<h3></h3>';g.firstChild.textContent=lastb;l.appendChild(g)}l.appendChild(li);var ok=(!v||li.textContent.toLowerCase().indexOf(v)>-1)&&(!b.value||li.dataset.book===b.value)&&(!t.value||li.dataset.theme===t.value);li.hidden=!ok;if(ok)shown++});
 n.textContent=shown+' skill'+(shown===1?'':'s')+' shown'}
[q,b,t,o].forEach(function(e){e.addEventListener('input',go)});go()})();

/* animated toggles: height eases, content lifts in, icon turns */
(function(){
var calm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function sh(d){return d.querySelector('summary').offsetHeight}
window.alToggle=function(d,open){
 if(open===undefined)open=!d.open; if(open===d.open)return;
 var body=d.querySelector('.tgb'),ease='cubic-bezier(.3,.8,.2,1)';
 if(d._a)d._a.cancel();
 if(calm||!d.animate){d.open=open;return}
 var start=d.offsetHeight;
 if(open){d.open=true;var end=d.scrollHeight;
  d._a=d.animate({height:[start+'px',end+'px']},{duration:380,easing:ease});
  if(body)body.animate({opacity:[0,1],transform:['translateY(-10px)','none']},{duration:380,easing:ease});
  d._a.onfinish=d._a.oncancel=function(){d._a=null}}
 else{var end=sh(d);
  if(body)body.animate({opacity:[1,0],transform:['none','translateY(-6px)']},{duration:240,easing:ease});
  d._a=d.animate({height:[start+'px',end+'px']},{duration:300,easing:ease});
  var an=d._a;an.onfinish=function(){d.open=false;d._a=null};setTimeout(function(){if(d.open&&d._a===an){an.cancel();d.open=false;d._a=null}},520)}
};
document.addEventListener('click',function(e){var s=e.target.closest&&e.target.closest('.tg>summary');if(!s)return;if(e.target.closest('a'))return;e.preventDefault();alToggle(s.parentNode)});
var ex=document.getElementById('exp'),co=document.getElementById('col');
if(ex){ex.addEventListener('click',function(){document.querySelectorAll('#skl .skill:not([hidden]) details').forEach(function(d,i){setTimeout(function(){alToggle(d,true)},Math.min(i,12)*30)})});
 co.addEventListener('click',function(){document.querySelectorAll('#skl details[open]').forEach(function(d){alToggle(d,false)})})}
var sa=document.getElementById('secall'),secs=document.querySelectorAll('.sec');
if(sa&&secs.length){sa.hidden=false;sa.addEventListener('click',function(){var anyOpen=[].some.call(secs,function(d){return d.open});secs.forEach(function(d,i){setTimeout(function(){alToggle(d,!anyOpen)},Math.min(i,10)*35)});sa.textContent=anyOpen?'Expand sections':'Collapse sections'})}
})();

(function(){var b=document.getElementById('themebtn');if(!b)return;
function eff(){var t=document.documentElement.getAttribute('data-theme');if(t)return t;return matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}
b.addEventListener('click',function(){var n=eff()==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',n);try{localStorage.setItem('al-theme',n)}catch(e){}});
})();

(function(){var h=location.hash.slice(1);if(!h)return;var t=document.getElementById(h);if(t&&t.classList.contains('tg'))t.open=true})();

(function(){document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('.jump a');if(!a)return;var t=document.querySelector(a.getAttribute('href'));if(t&&t.tagName==='DETAILS'&&!t.open)t.open=true})})();
