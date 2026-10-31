/* Legacy · catalogue photo + link under the product 3D viewer. Config: window.LEGACY_CAT={page:'konveyer-x.html',map:{id:[img,page?]}} */
(function(){
  var C=window.LEGACY_CAT,pv=document.getElementById('pview');if(!C||!pv)return;
  var st=document.createElement('style');st.textContent=
   '.pleft{display:flex;flex-direction:column;gap:12px;min-width:0}'+
   '.pcat{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:0;border:1px solid var(--line);border-radius:6px;overflow:hidden;background:var(--panel);text-decoration:none;color:inherit;transition:border-color .2s,transform .2s}'+
   '.pcat:hover{border-color:var(--pu);transform:translateY(-2px)}'+
   '.pcat .ph{background:#fff;display:grid;place-items:center;padding:12px;min-height:240px}'+
   '.pcat .ph img{max-width:100%;max-height:280px;object-fit:contain}'+
   '.pcat .tx{padding:16px 18px;display:flex;flex-direction:column;gap:8px;justify-content:center}'+
   '.pcat small{font-family:var(--mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}'+
   '.pcat b{font-size:16px;line-height:1.3}'+
   '.pcat span{color:var(--pu);font-weight:600;font-size:14px;margin-top:4px}'+
   '@media (max-width:560px){.pcat{grid-template-columns:minmax(0,1fr)}.pcat .ph{min-height:150px}}';
  document.head.appendChild(st);
  var col=document.createElement('div');col.className='pleft';pv.parentNode.insertBefore(col,pv);col.appendChild(pv);
  var a=document.createElement('a');a.className='pcat';a.innerHTML='<div class="ph"><img alt="" loading="lazy"></div><div class="tx"><small>Фото из каталога Legacy</small><b></b><span>Смотреть в каталоге →</span></div>';col.appendChild(a);
  var img=a.querySelector('img'),b=a.querySelector('b');
  function upd(){var btn=document.querySelector('.pbtn[aria-pressed="true"]');if(!btn)return;var m=C.map[btn.dataset.p];
    if(!m){a.hidden=true;return;}a.hidden=false;img.src='img/cat/'+m[0]+'.jpg';img.alt=btn.querySelector('b')?btn.querySelector('b').textContent:'';
    b.textContent=img.alt;a.href=m[1]||C.page;}
  new MutationObserver(upd).observe(document.getElementById('plist')||document.body,{subtree:true,attributes:true,attributeFilter:['aria-pressed']});upd();
})();
