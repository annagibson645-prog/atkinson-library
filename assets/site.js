(function(){
var root=document.body.getAttribute('data-root')||'';
function get(k){try{return localStorage.getItem(k)}catch(e){return null}}
function set(k,v){try{localStorage.setItem(k,v)}catch(e){}}
// reading size
var size=parseFloat(get('al-size'))||1.125;
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
if(res){var l=get('al-last');if(l){try{var o=JSON.parse(l);res.innerHTML='Continue where you left off: <a href="'+root+'b/'+o.b+'/'+o.n+'.html"></a>';res.querySelector('a').textContent=o.bt+', '+o.ct;res.hidden=false}catch(e){}}}
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

/* roadmap progress + skills deep link */
(function(){
var rm=document.querySelector('.roadmap');
if(rm){var key='al-path-'+rm.dataset.path,n=+rm.dataset.n,done=[];
 try{done=JSON.parse(localStorage.getItem(key)||'[]')}catch(e){}
 var boxes=[].slice.call(rm.querySelectorAll('[data-done]')),stages=[].slice.call(rm.querySelectorAll('.stage'));
 function paint(){var c=0,nx=-1;stages.forEach(function(st,i){var d=done.indexOf(i)>-1;st.classList.toggle('isdone',d);boxes[i].checked=d;if(d)c++;else if(nx<0)nx=i});
  stages.forEach(function(st,i){st.classList.toggle('isnext',i===nx)});
  rm.querySelector('.pbar i').style.width=(c/n*100)+'%';rm.querySelector('.pbar').setAttribute('aria-valuenow',c);
  document.getElementById('pcount').textContent=c+' of '+n+' finished'+(c===n?'. Roadmap complete.':'')}
 boxes.forEach(function(b,i){b.addEventListener('change',function(){var k=done.indexOf(i);if(b.checked&&k<0)done.push(i);if(!b.checked&&k>-1)done.splice(k,1);try{localStorage.setItem(key,JSON.stringify(done))}catch(e){}paint()})});
 rm.querySelectorAll('[data-resumeb]').forEach(function(a){var m=null;try{m=localStorage.getItem('al-book-'+a.dataset.resumeb)}catch(e){}if(m&&+m>0){a.href=a.dataset.pre+m+'.html';a.textContent='Continue at chapter '+m}});
 paint()}
var sb=document.getElementById('sb');
if(sb){var q=new URLSearchParams(location.search).get('b');if(q){sb.value=q;sb.dispatchEvent(new Event('input'))}}
})();

/* ---- reading progress: chapters read, trails ---- */
(function(){
function get(k){try{return localStorage.getItem(k)}catch(e){return null}}
function set(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function arr(k){try{return JSON.parse(get(k)||'[]')}catch(e){return[]}}
var root=document.body.getAttribute('data-root')||'';
// 1. chapter pages: record chapters actually read
var ch=document.querySelector('.chapter');
if(ch){var slug=ch.dataset.book,num=+ch.dataset.n,rk='al-read-'+slug;
 function mark(){var r=arr(rk);if(r.indexOf(num)<0){r.push(num);set(rk,JSON.stringify(r))}}
 function chk(){var h=document.documentElement;var max=h.scrollHeight-h.clientHeight;if(max<=40||h.scrollTop/max>=.85)mark()}
 window.addEventListener('scroll',chk,{passive:true});setTimeout(chk,1500);
 var pn=document.querySelector('.pn');if(pn)pn.addEventListener('click',mark)}
// 2. book contents page: ticks and a count
var toc=document.querySelector('.toc');
if(toc){var bs=(location.pathname.match(/\/b\/([^\/]+)\//)||[])[1];var r=arr('al-read-'+bs);
 [].forEach.call(toc.querySelectorAll('li'),function(li){var a=li.querySelector('a');var n=parseInt(a.getAttribute('href'));if(r.indexOf(n)>-1)li.classList.add('read')});
 var f=document.querySelector('.bookhead .facts');if(f&&r.length){var p=document.createElement('p');p.className='facts';p.id='bprog';p.textContent=r.length+' of '+toc.querySelectorAll('li').length+' chapters read';f.after(p)}}
// 3. trail pages
var tp=document.querySelector('.trailpage');
if(tp){var stages=[].slice.call(tp.querySelectorAll('.tstage')),trail=tp.querySelector('.trail'),svgNS='http://www.w3.org/2000/svg',svg=null,segs=[];
 function frac(st){var slug=st.dataset.slug,tot=+st.dataset.total;if(get('al-done-'+slug)==='1')return 1;var r=arr('al-read-'+slug).length;return Math.min(1,r/tot)}
 function paint(){var doneN=0,nx=-1;
  stages.forEach(function(st,i){var f=frac(st),slug=st.dataset.slug,tot=+st.dataset.total,rd=Math.round(f*tot);
   var isDone=f>=1;if(isDone)doneN++;else if(nx<0)nx=i;
   st.classList.toggle('isdone',isDone);st.querySelector('.rg').style.strokeDasharray=(f*100)+' 100';
   st.querySelector('.pbar i').style.width=(f*100)+'%';
   st.querySelector('.ptxt').textContent=isDone?'Finished':(get('al-done-'+slug)==='1'?'Finished':(arr('al-read-'+slug).length+' of '+tot+' chapters read'));
   var cb=st.querySelector('[data-done]');cb.checked=get('al-done-'+slug)==='1';
   var a=st.querySelector('.btn');var last=get('al-book-'+slug);if(f>0&&!isDone&&last){a.href=a.dataset.pre+last+'.html';a.textContent='Continue at chapter '+last}else if(isDone){a.textContent='Read again';a.href=a.dataset.pre+'1.html'}else{a.textContent='Start reading'}});
  stages.forEach(function(st,i){st.classList.toggle('isnext',i===nx)});
  segs.forEach(function(sg,i){var on=stages[i]&&stages[i].classList.contains('isdone');sg.style.strokeDashoffset=on?0:sg._len});
  document.getElementById('pcount').textContent=doneN+' of '+stages.length+' books finished'+(doneN===stages.length?'. Trail complete.':'');
  var follows=arr('al-follow'),slugP=tp.dataset.path;
  var info={t:tp.dataset.ptitle,done:doneN,n:stages.length,next:nx>-1?stages[nx].dataset.title:'',href:nx>-1?'b/'+stages[nx].dataset.slug+'/'+(get('al-book-'+stages[nx].dataset.slug)||1)+'.html':''};
  set('al-trailinfo-'+slugP,JSON.stringify(info))}
 function draw(){if(svg)svg.remove();svg=document.createElementNS(svgNS,'svg');svg.setAttribute('class','tline');svg.setAttribute('width',trail.offsetWidth);svg.setAttribute('height',trail.offsetHeight);
  var tr=trail.getBoundingClientRect(),pts=stages.map(function(st){var r=st.querySelector('.tnode').getBoundingClientRect();return[r.left-tr.left+r.width/2,r.top-tr.top+r.height/2]});
  segs=[];for(var i=0;i<pts.length-1;i++){var a=pts[i],b=pts[i+1],my=(a[1]+b[1])/2,d='M'+a[0]+' '+a[1]+' C'+a[0]+' '+my+' '+b[0]+' '+my+' '+b[0]+' '+b[1];
   var base=document.createElementNS(svgNS,'path');base.setAttribute('d',d);base.setAttribute('class','base');svg.appendChild(base);
   var w=document.createElementNS(svgNS,'path');w.setAttribute('d',d);w.setAttribute('class','walk');svg.appendChild(w);var L=w.getTotalLength();w._len=L;w.style.strokeDasharray=L;w.style.strokeDashoffset=L;segs.push(w)}
  trail.insertBefore(svg,trail.firstChild);paint()}
 stages.forEach(function(st){st.querySelector('[data-done]').addEventListener('change',function(e){set('al-done-'+st.dataset.slug,e.target.checked?'1':'0');paint()})});
 var fb=document.getElementById('follow');
 function fpaint(){var f=arr('al-follow'),on=f.indexOf(tp.dataset.path)>-1;fb.textContent=on?'Following this trail':'Follow this trail';fb.classList.toggle('ghost',on)}
 fb.addEventListener('click',function(){var f=arr('al-follow'),k=f.indexOf(tp.dataset.path);if(k<0)f.push(tp.dataset.path);else f.splice(k,1);set('al-follow',JSON.stringify(f));fpaint()});
 fpaint();draw();window.addEventListener('resize',draw);window.addEventListener('load',draw);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(draw)}
// 4. start page chips and home "your trail"
document.querySelectorAll('.pcard[data-slug]').forEach(function(c){var s=c.dataset.slug,info=null;try{info=JSON.parse(get('al-trailinfo-'+s)||'null')}catch(e){}
 if(arr('al-follow').indexOf(s)>-1){var chip=document.createElement('span');chip.className='chip';chip.textContent='Following'+(info?': '+info.done+' of '+info.n+' books':'');c.insertBefore(chip,c.firstChild)}
 else if(info&&info.done>0){var f=c.querySelector('.facts');if(f)f.textContent+=', '+info.done+' of '+info.n+' finished'}});
var res=document.getElementById('resume');
if(res){var fl=arr('al-follow');for(var i=0;i<fl.length;i++){var inf=null;try{inf=JSON.parse(get('al-trailinfo-'+fl[i])||'null')}catch(e){}
 if(inf&&inf.next){res.hidden=false;res.innerHTML='Your trail, <a href="'+root+'start/'+fl[i]+'.html"></a>: <a class="nx" href="'+root+inf.href+'"></a>';res.querySelectorAll('a')[0].textContent=inf.t;res.querySelector('.nx').textContent='next up, '+inf.next;break}}}
})();

/* fold behaviour, band stats, node click */
(function(){var tp=document.querySelector('.trailpage');if(!tp)return;
var stages=[].slice.call(tp.querySelectorAll('.tstage')),bands=[].slice.call(tp.querySelectorAll('.band'));
function stats(){bands.forEach(function(b){var done=0,tot=0,prev=b.previousElementSibling,n=b.nextElementSibling;
  while(n&&!n.classList.contains('band')){if(n.classList.contains('tstage')){tot++;if(n.classList.contains('isdone'))done++}n=n.nextElementSibling}
  b.querySelector('.bstat').textContent=done+' of '+tot+' finished';
  b.classList.toggle('isdone',!!(prev&&prev.classList.contains('tstage')&&prev.classList.contains('isdone')))})}
var first=true;
function sync(){stats();if(first){first=false;stages.forEach(function(st){st.querySelector('details').open=st.classList.contains('isnext')})}}
// run after the main painter has set isdone/isnext
setTimeout(sync,0);
tp.addEventListener('change',function(){setTimeout(stats,0)});
document.addEventListener('visibilitychange',function(){setTimeout(stats,0)});
stages.forEach(function(st){st.querySelector('.tnode').addEventListener('click',function(){window.alToggle&&alToggle(st.querySelector('details'))})});
var ux=document.getElementById('tx'),fc=document.getElementById('tc');
if(ux)ux.addEventListener('click',function(){stages.forEach(function(st,i){setTimeout(function(){alToggle(st.querySelector('details'),true)},Math.min(i,10)*30)})});
if(fc)fc.addEventListener('click',function(){stages.forEach(function(st){alToggle(st.querySelector('details'),false)})});
})();
